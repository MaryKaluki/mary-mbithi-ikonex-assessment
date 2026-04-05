<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamMark;

class GradeController extends Controller
{
    public function index()
    {
        $user    = auth()->user();
        $student = $user->student;

        if (! $student) {
            return response()->json(['error' => 'Student record not found.'], 404);
        }

        $schoolId  = $user->school_id;
        $studentId = $student->id;

        // Get all exams that have marks for this student
        $marks = ExamMark::where('school_id', $schoolId)
            ->where('student_id', $studentId)
            ->with('exam')
            ->get();

        if ($marks->isEmpty()) {
            return response()->json(['exams' => []]);
        }

        // Group by exam
        $grouped = $marks->groupBy('exam_id');

        $exams = $grouped->map(function ($examMarks) {
            $exam = $examMarks->first()->exam;
            if (! $exam) return null;

            $subjects = $examMarks->map(function ($m) {
                return [
                    'subject'  => $m->subject_name,
                    'marks'    => $m->marks,
                    'out_of'   => $m->out_of,
                    'grade'    => $m->grade,
                    'remarks'  => $m->remarks,
                    'percent'  => $m->out_of > 0 ? round(($m->marks / $m->out_of) * 100, 1) : 0,
                ];
            })->values();

            $totalMarks = $examMarks->sum('marks');
            $totalOutOf = $examMarks->sum('out_of');
            $average    = $totalOutOf > 0 ? round(($totalMarks / $totalOutOf) * 100, 1) : 0;

            return [
                'exam_id'    => $exam->id,
                'exam_name'  => $exam->name,
                'term'       => $exam->term ?? null,
                'year'       => $exam->year ?? null,
                'status'     => $exam->status,
                'average'    => $average,
                'subjects'   => $subjects,
            ];
        })->filter()->values();

        return response()->json(['exams' => $exams]);
    }
}
