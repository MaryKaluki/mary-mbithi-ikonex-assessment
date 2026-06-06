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

        if (!$exam) {
            return response()->json([
                'message' => 'No examinations found.'
            ], 404);
        }

        // Calculate class rankings
        $rankings = $this->calculateClassRankings($schoolId, $student->grade_level, $exam->id);
        $studentRankInfo = $rankings[$studentId] ?? [
            'rank' => '—',
            'total_students' => 0,
            'subjects' => [],
        ];

        // ── Marks ───────────────────────────────────────────────────────────
        $rawMarks = ExamMark::where('school_id', $schoolId)
            ->where('student_id', $studentId)
            ->where('exam_id', $exam->id)
            ->orderBy('subject_name')
            ->get();

        $subjects = $rawMarks->map(function ($m) use ($studentRankInfo, $schoolId) {
            $pct = $m->out_of > 0 ? round(($m->marks / $m->out_of) * 100, 1) : 0;
            $subjectRank = $studentRankInfo['subjects'][$m->subject_name] ?? ['rank' => '—', 'total_students' => 0];
            return [
                'subject'  => $m->subject_name,
                'marks'    => (float) $m->marks,
                'out_of'   => (float) $m->out_of,
                'percent'  => $pct,
                'grade'    => $m->grade ?? ExamMark::toGrade($pct, $m->out_of, $schoolId),
                'points'   => $this->gradeToPoints($m->grade ?? ExamMark::toGrade($pct, $m->out_of, $schoolId)),
                'remarks'  => $m->remarks ?? '',
                'rank'     => $subjectRank['rank'],
                'total_students' => $subjectRank['total_students'],
            ];
        })->values();

        // ── Summary ─────────────────────────────────────────────────────────
        $totalMarks = $rawMarks->sum('marks');
        $totalOutOf = $rawMarks->sum('out_of');
        $avgPct     = $totalOutOf > 0 ? round(($totalMarks / $totalOutOf) * 100, 1) : null;
        $meanGrade  = $avgPct !== null ? ExamMark::toGrade($avgPct, 100, $schoolId) : '—';
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
                'rank'         => $studentRankInfo['rank'],
                'total_students' => $studentRankInfo['total_students'],
            ],
        ]);
    }

    /**
     * Generate and stream a single student's report card in PDF format.
     */
    public function downloadPdf(Request $request, $studentId)
    {
        $teacher  = auth()->user();
        $schoolId = $teacher->school_id;
        $student = Student::where('school_id', $schoolId)->findOrFail($studentId);

        $examId = $request->query('exam_id');
        if ($examId) {
            $exam = Exam::where('school_id', $schoolId)->findOrFail($examId);
        } else {
            $exam = Exam::where('school_id', $schoolId)->orderByDesc('start_date')->first();
        }

        if (!$exam) {
            return response()->json(['message' => 'No examinations found.'], 404);
        }

        $rawMarks = ExamMark::where('school_id', $schoolId)
            ->where('student_id', $studentId)
            ->where('exam_id', $exam->id)
            ->orderBy('subject_name')
            ->get();

        $rankings = $this->calculateClassRankings($schoolId, $student->grade_level, $exam->id);
        $studentRankInfo = $rankings[$studentId] ?? [
            'rank' => '—',
            'total_students' => 0,
            'subjects' => [],
        ];

        $subjects = $rawMarks->map(function ($m) use ($studentRankInfo, $schoolId) {
            $pct = $m->out_of > 0 ? round(($m->marks / $m->out_of) * 100, 1) : 0;
            $subjectRank = $studentRankInfo['subjects'][$m->subject_name] ?? ['rank' => '—', 'total_students' => 0];
            return [
                'subject'  => $m->subject_name,
                'marks'    => (float) $m->marks,
                'out_of'   => (float) $m->out_of,
                'percent'  => $pct,
                'grade'    => $m->grade ?? ExamMark::toGrade($pct, $m->out_of, $schoolId),
                'points'   => $this->gradeToPoints($m->grade ?? ExamMark::toGrade($pct, $m->out_of, $schoolId)),
                'remarks'  => $m->remarks ?? '',
                'rank'     => $subjectRank['rank'],
                'total_students' => $subjectRank['total_students'],
            ];
        });

        $totalMarks = $rawMarks->sum('marks');
        $totalOutOf = $rawMarks->sum('out_of');
        $avgPct     = $totalOutOf > 0 ? round(($totalMarks / $totalOutOf) * 100, 1) : null;
        $meanGrade  = $avgPct !== null ? ExamMark::toGrade($avgPct, 100, $schoolId) : '—';
        $meanPoints = $subjects->avg('points');

        $class = SchoolClass::where('school_id', $schoolId)
            ->where('name', $student->grade_level)
            ->first();

        $school = School::withoutGlobalScopes()->find($schoolId);
        $isCBC = ($class?->curriculum_type ?? 'CBC') === 'CBC';

        $html = view('reports.report_card_pdf', compact(
            'school', 'student', 'exam', 'subjects', 'totalMarks', 'totalOutOf',
            'avgPct', 'meanGrade', 'meanPoints', 'studentRankInfo', 'isCBC'
        ))->render();

        $pdf = app('dompdf.wrapper');
        $pdf->loadHTML($html);
        $pdf->setPaper('A4', 'portrait');

        $filename = "report-card-" . str_replace(' ', '-', strtolower($student->first_name . '-' . $student->last_name)) . ".pdf";
        return $pdf->download($filename);
    }

    /**
     * Generate and stream a class stream performance list in PDF format.
     */
    public function downloadClassPdf(Request $request)
    {
        $teacher  = auth()->user();
        $schoolId = $teacher->school_id;
        $classId  = $request->query('class_id');
        $examId   = $request->query('exam_id');

        if (!$classId || !$examId) {
            return response()->json(['message' => 'Class and exam are required.'], 400);
        }

        $class = SchoolClass::where('school_id', $schoolId)->findOrFail($classId);
        $exam  = Exam::where('school_id', $schoolId)->findOrFail($examId);

        $rankings = $this->calculateClassRankings($schoolId, $class->name, $exam->id);

        $students = Student::where('school_id', $schoolId)
            ->where('grade_level', $class->name)
            ->where('status', 'Active')
            ->get();

        $rows = [];
        foreach ($students as $student) {
            $rankInfo = $rankings[$student->id] ?? null;
            if (!$rankInfo) continue;

            $rows[] = [
                'name'             => trim($student->first_name . ' ' . $student->last_name),
                'admission_number' => $student->admission_number,
                'rank'             => $rankInfo['rank'],
                'average_pct'      => $rankInfo['average_pct'],
                'total_marks'      => $rankInfo['total_marks'],
                'mean_grade'       => $rankInfo['average_pct'] !== null ? ExamMark::toGrade($rankInfo['average_pct'], 100, $schoolId) : '—',
            ];
        }

        usort($rows, function ($a, $b) {
            if ($a['rank'] === '—') return 1;
            if ($b['rank'] === '—') return -1;
            return $a['rank'] <=> $b['rank'];
        });

        $school = School::withoutGlobalScopes()->find($schoolId);

        $html = view('reports.class_performance_pdf', compact(
            'school', 'class', 'exam', 'rows'
        ))->render();

        $pdf = app('dompdf.wrapper');
        $pdf->loadHTML($html);
        $pdf->setPaper('A4', 'portrait');

        $filename = "class-performance-" . str_replace(' ', '-', strtolower($class->name)) . ".pdf";
        return $pdf->download($filename);
    }

    /**
     * Calculate rankings for all students in a class stream.
     */
    private function calculateClassRankings($schoolId, $gradeLevel, $examId)
    {
        $students = Student::where('school_id', $schoolId)
            ->where('grade_level', $gradeLevel)
            ->where('status', 'Active')
            ->get();

        $studentIds = $students->pluck('id');

        $marks = ExamMark::where('school_id', $schoolId)
            ->where('exam_id', $examId)
            ->whereIn('student_id', $studentIds)
            ->get();

        $marksByStudent = $marks->groupBy('student_id');

        $studentScores = [];
        foreach ($students as $student) {
            $studentMarks = $marksByStudent->get($student->id, collect());
            $totalMarks = $studentMarks->sum('marks');
            $totalOutOf = $studentMarks->sum('out_of');
            $avgPct = $totalOutOf > 0 ? ($totalMarks / $totalOutOf) * 100 : -1;

            $studentScores[] = [
                'student_id' => $student->id,
                'total_marks' => $totalMarks,
                'total_out_of' => $totalOutOf,
                'avg_pct' => $avgPct,
                'student_marks' => $studentMarks,
            ];
        }

        usort($studentScores, function ($a, $b) {
            return $b['avg_pct'] <=> $a['avg_pct'];
        });

        $rankings = [];
        $currentRank = 1;
        $prevPct = null;

        $rankedCount = 0;
        foreach ($studentScores as $score) {
            if ($score['avg_pct'] >= 0) {
                $rankedCount++;
            }
        }

        foreach ($studentScores as $index => $score) {
            $studentId = $score['student_id'];
            if ($score['avg_pct'] < 0) {
                $rankings[$studentId] = [
                    'rank' => '—',
                    'total_students' => $rankedCount,
                    'average_pct' => null,
                    'total_marks' => 0,
                    'subjects' => [],
                ];
                continue;
            }

            if ($prevPct !== null && $score['avg_pct'] < $prevPct) {
                $currentRank = $index + 1;
            }
            $prevPct = $score['avg_pct'];

            $rankings[$studentId] = [
                'rank' => $currentRank,
                'total_students' => $rankedCount,
                'average_pct' => round($score['avg_pct'], 1),
                'total_marks' => $score['total_marks'],
                'subjects' => [],
            ];
        }

        $marksBySubject = $marks->groupBy('subject_name');
        foreach ($marksBySubject as $subjectName => $subjectMarks) {
            $subjectScores = [];
            foreach ($subjectMarks as $mark) {
                $pct = $mark->out_of > 0 ? ($mark->marks / $mark->out_of) * 100 : 0;
                $subjectScores[] = [
                    'student_id' => $mark->student_id,
                    'marks' => $mark->marks,
                    'pct' => $pct,
                ];
            }

            usort($subjectScores, function ($a, $b) {
                return $b['pct'] <=> $a['pct'];
            });

            $sRank = 1;
            $sPrevPct = null;
            $sTotal = count($subjectScores);

            foreach ($subjectScores as $sIndex => $sScore) {
                if ($sPrevPct !== null && $sScore['pct'] < $sPrevPct) {
                    $sRank = $sIndex + 1;
                }
                $sPrevPct = $sScore['pct'];

                $studentId = $sScore['student_id'];
                if (isset($rankings[$studentId])) {
                    $rankings[$studentId]['subjects'][$subjectName] = [
                        'rank' => $sRank,
                        'total_students' => $sTotal,
                    ];
                }
            }
        }

        return $rankings;
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
            ->get(['id', 'name', 'start_date', 'end_date', 'status', 'target_curriculum']);

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
