<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Homework;
use App\Models\SchoolClass;

class HomeworkController extends Controller
{
    public function index()
    {
        $user    = auth()->user();
        $student = $user->student;

        if (! $student) {
            return response()->json(['error' => 'Student record not found.'], 404);
        }

        $schoolId   = $user->school_id;
        $gradeLevel = $student->grade_level;

        $class = SchoolClass::where('school_id', $schoolId)
            ->where('name', $gradeLevel)
            ->first();

        if (! $class) {
            return response()->json(['homework' => []]);
        }

        $today = now()->toDateString();

        $homework = Homework::where('school_id', $schoolId)
            ->where('class_id', $class->id)
            ->orderBy('due_date')
            ->get()
            ->map(function ($hw) use ($today) {
                if ($hw->due_date < $today) {
                    $status = 'overdue';
                } else {
                    $status = 'pending';
                }
                return [
                    'id'           => $hw->id,
                    'title'        => $hw->title,
                    'subject'      => $hw->subject_name,
                    'description'  => $hw->description,
                    'due_date'     => $hw->due_date,
                    'status'       => $status,
                ];
            });

        return response()->json(['homework' => $homework]);
    }
}
