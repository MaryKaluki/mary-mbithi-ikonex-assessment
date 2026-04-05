<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamMark;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Student;
use Illuminate\Http\Request;

class ReportCardController extends Controller
{
    /**
     * GET /api/teacher/report-card/{studentId}?exam_id=X
     *
     * Returns everything needed to render and print a student's report card:
     *   - school details (name, logo, address, type)
     *   - student details (name, admission no., class, gender)
     *   - exam details (name, type, term, year)
     *   - subject marks (name, score, max, %, grade, remarks)
     *   - summary (total, mean %, mean grade, mean points)
     *   - curriculum type (CBC | 844)
     */
    public function show(Request $request, $studentId)
    {
        $teacher  = auth()->user();
        $schoolId = $teacher->school_id;

        // ── Student (school-scoped) ──────────────────────────────────────────
        $student = Student::where('school_id', $schoolId)->findOrFail($studentId);

        // ── Exam ────────────────────────────────────────────────────────────
        $examId = $request->query('exam_id');

        if ($examId) {
            $exam = Exam::where('school_id', $schoolId)->findOrFail($examId);
        } else {
            $exam = Exam::where('school_id', $schoolId)
                ->orderByDesc('start_date')
                ->first();
        }

        // ── Marks ───────────────────────────────────────────────────────────
        $rawMarks = $exam
            ? ExamMark::where('school_id', $schoolId)
                ->where('student_id', $studentId)
                ->where('exam_id', $exam->id)
                ->orderBy('subject_name')
                ->get()
            : collect();

        $subjects = $rawMarks->map(function ($m) {
            $pct = $m->out_of > 0 ? round(($m->marks / $m->out_of) * 100, 1) : 0;
            return [
                'subject'  => $m->subject_name,
                'marks'    => (float) $m->marks,
                'out_of'   => (float) $m->out_of,
                'percent'  => $pct,
                'grade'    => $m->grade ?? ExamMark::toGrade($pct),
                'points'   => $this->gradeToPoints($m->grade ?? ExamMark::toGrade($pct)),
                'remarks'  => $m->remarks ?? '',
            ];
        })->values();

        // ── Summary ─────────────────────────────────────────────────────────
        $totalMarks = $rawMarks->sum('marks');
        $totalOutOf = $rawMarks->sum('out_of');
        $avgPct     = $totalOutOf > 0 ? round(($totalMarks / $totalOutOf) * 100, 1) : null;
        $meanGrade  = $avgPct !== null ? ExamMark::toGrade($avgPct) : '—';
        $meanPoints = $subjects->avg('points');

        // ── Class info ──────────────────────────────────────────────────────
        $class = SchoolClass::where('school_id', $schoolId)
            ->where('name', $student->grade_level)
            ->first();

        // ── School details (no global scope — we already know the school_id) ─
        $school = School::withoutGlobalScopes()->find($schoolId);

        return response()->json([
            'school' => [
                'name'        => $school->name ?? 'School Name',
                'logo_path'   => $school->logo_path ? asset('storage/' . $school->logo_path) : null,
                'address'     => $school->address ?? '',
                'phone'       => $school->phone ?? '',
                'school_type' => $school->school_type ?? '',
            ],
            'student' => [
                'id'               => $student->id,
                'name'             => trim($student->first_name . ' ' . $student->last_name),
                'admission_number' => $student->admission_number,
                'grade_level'      => $student->grade_level,
                'gender'           => $student->gender,
                'class_name'       => $student->grade_level,
                'curriculum_type'  => $class?->curriculum_type ?? 'CBC',
            ],
            'exam' => $exam ? [
                'id'              => $exam->id,
                'name'            => $exam->name,
                'assessment_type' => $exam->assessment_type ?? 'end_of_term',
                'term'            => $exam->term ?? ($rawMarks->first()?->term ?? 1),
                'year'            => $exam->year ?? ($rawMarks->first()?->year ?? now()->year),
                'start_date'      => $exam->start_date,
                'end_date'        => $exam->end_date,
            ] : null,
            'subjects' => $subjects,
            'summary' => [
                'total_marks'  => round($totalMarks, 1),
                'total_out_of' => round($totalOutOf, 1),
                'average_pct'  => $avgPct,
                'mean_grade'   => $meanGrade,
                'mean_points'  => $meanPoints ? round($meanPoints, 2) : null,
                'subjects_sat' => $subjects->count(),
            ],
        ]);
    }

    /**
     * GET /api/teacher/report-card/students?class_id=X
     *
     * List of students for a given class, plus available exams.
     */
    public function students(Request $request)
    {
        $schoolId = auth()->user()->school_id;
        $classId  = $request->query('class_id');

        // Resolve grade_level from class id
        $gradeLevel = null;
        if ($classId) {
            $class      = SchoolClass::where('school_id', $schoolId)->find($classId);
            $gradeLevel = $class?->name;
        }

        $students = Student::where('school_id', $schoolId)
            ->where('status', 'Active')
            ->when($gradeLevel, fn($q) => $q->where('grade_level', $gradeLevel))
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get()
            ->map(fn($s) => [
                'id'               => $s->id,
                'name'             => trim($s->first_name . ' ' . $s->last_name),
                'admission_number' => $s->admission_number,
                'grade_level'      => $s->grade_level,
                'gender'           => $s->gender,
            ]);

        $exams = Exam::where('school_id', $schoolId)
            ->orderByDesc('start_date')
            ->get(['id', 'name', 'assessment_type', 'term', 'year', 'start_date']);

        $classes = SchoolClass::where('school_id', $schoolId)
            ->orderBy('name')
            ->get(['id', 'name', 'curriculum_type']);

        return response()->json([
            'students' => $students,
            'exams'    => $exams,
            'classes'  => $classes,
        ]);
    }

    private function gradeToPoints(string $grade): int
    {
        return match ($grade) {
            'A'  => 12, 'A-' => 11,
            'B+' => 10, 'B'  => 9, 'B-' => 8,
            'C+' => 7,  'C'  => 6, 'C-' => 5,
            'D+' => 4,  'D'  => 3, 'D-' => 2,
            default => 1,
        };
    }
}
