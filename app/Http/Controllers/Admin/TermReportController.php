<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamMark;
use App\Models\Student;
use Illuminate\Http\Request;

class TermReportController extends Controller
{
    /**
     * GET /api/admin/term-reports
     * List all students with their average score for a given exam.
     */
    public function index(Request $request)
    {
        $schoolId   = auth()->user()->school_id;
        $examId     = $request->query('exam_id');
        $gradeLevel = $request->query('grade_level');

        // Default to the most recent completed exam
        if (! $examId) {
            $exam = Exam::where('school_id', $schoolId)
                ->where('status', 'Completed')
                ->latest('start_date')
                ->first();
            $examId = $exam?->id;
        }

        $students = Student::where('school_id', $schoolId)
            ->where('status', 'Active')
            ->when($gradeLevel, fn($q) => $q->where('grade_level', $gradeLevel))
            ->orderBy('grade_level')
            ->orderBy('last_name')
            ->get();

        $marks = $examId
            ? ExamMark::where('school_id', $schoolId)
                ->where('exam_id', $examId)
                ->get()
                ->groupBy('student_id')
            : collect();

        $rows = $students->map(function ($student) use ($marks) {
            $studentMarks = $marks->get($student->id, collect());
            $total  = $studentMarks->sum('marks');
            $outOf  = $studentMarks->sum('out_of');
            $avg    = $outOf > 0 ? round(($total / $outOf) * 100, 1) : null;

            return [
                'id'               => $student->id,
                'name'             => $student->first_name . ' ' . $student->last_name,
                'admission_number' => $student->admission_number,
                'grade_level'      => $student->grade_level,
                'average'          => $avg,
                'grade'            => $avg !== null ? ExamMark::toGrade($avg) : '—',
                'subjects_count'   => $studentMarks->count(),
                'status'           => $avg === null ? 'No Marks' : ($avg >= 50 ? 'Pass' : 'Needs Support'),
            ];
        });

        // Available exams for the selector
        $exams = Exam::where('school_id', $schoolId)
            ->where('status', 'Completed')
            ->orderByDesc('start_date')
            ->get(['id', 'name', 'start_date']);

        // Grade levels for the filter
        $gradeLevels = Student::where('school_id', $schoolId)
            ->distinct()
            ->orderBy('grade_level')
            ->pluck('grade_level');

        return response()->json([
            'students'     => $rows,
            'exams'        => $exams,
            'grade_levels' => $gradeLevels,
            'active_exam'  => $examId,
        ]);
    }
}
