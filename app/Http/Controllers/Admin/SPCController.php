<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamMark;
use App\Models\Student;
use Illuminate\Http\Request;

class SPCController extends Controller
{
    /**
     * GET /api/admin/spc/students
     * List students with their latest average score.
     */
    public function students(Request $request)
    {
        $gradeLevel = $request->query('grade_level');

        $query = Student::where('school_id', auth()->user()->school_id)
            ->where('status', 'Active')
            ->orderBy('grade_level')
            ->orderBy('last_name');

        if ($gradeLevel) {
            $query->where('grade_level', $gradeLevel);
        }

        $students = $query->get()->map(fn($s) => [
            'id'               => $s->id,
            'name'             => $s->first_name . ' ' . $s->last_name,
            'admission_number' => $s->admission_number,
            'grade_level'      => $s->grade_level,
        ]);

        return response()->json($students);
    }

    /**
     * GET /api/admin/spc/{studentId}
     * Full progress card for a single student across all exams.
     */
    public function show($studentId)
    {
        $student = Student::where('school_id', auth()->user()->school_id)
            ->findOrFail($studentId);

        $exams = Exam::where('school_id', auth()->user()->school_id)
            ->where('status', 'Completed')
            ->orderBy('start_date')
            ->get();

        $marks = ExamMark::where('school_id', auth()->user()->school_id)
            ->where('student_id', $studentId)
            ->get()
            ->groupBy('exam_id');

        $examResults = $exams->map(function ($exam) use ($marks) {
            $examMarks = $marks->get($exam->id, collect());
            if ($examMarks->isEmpty()) return null;

            $total = $examMarks->sum('marks');
            $outOf = $examMarks->sum('out_of');
            $avg   = $outOf > 0 ? round(($total / $outOf) * 100, 1) : 0;

            return [
                'exam_id'   => $exam->id,
                'exam_name' => $exam->name,
                'term'      => $examMarks->first()->term ?? 1,
                'year'      => $examMarks->first()->year ?? now()->year,
                'average'   => $avg,
                'grade'     => ExamMark::toGrade($avg),
                'subjects'  => $examMarks->map(fn($m) => [
                    'subject' => $m->subject_name,
                    'marks'   => (float) $m->marks,
                    'out_of'  => (float) $m->out_of,
                    'grade'   => $m->grade,
                    'remarks' => $m->remarks,
                ])->values(),
            ];
        })->filter()->values();

        return response()->json([
            'student' => [
                'id'               => $student->id,
                'name'             => $student->first_name . ' ' . $student->last_name,
                'admission_number' => $student->admission_number,
                'grade_level'      => $student->grade_level,
                'gender'           => $student->gender,
            ],
            'exams' => $examResults,
        ]);
    }
}
