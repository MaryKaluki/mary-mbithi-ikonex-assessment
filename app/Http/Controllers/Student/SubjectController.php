<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\ExamMark;
use App\Models\SchoolClass;
use Illuminate\Support\Facades\DB;

class SubjectController extends Controller
{
    public function index()
    {
        $user    = auth()->user();
        $student = $user->student;

        if (! $student) {
            return response()->json(['error' => 'Student record not found.'], 404);
        }

        $schoolId   = $user->school_id;
        $studentId  = $student->id;
        $gradeLevel = $student->grade_level;

        $class = SchoolClass::where('school_id', $schoolId)
            ->where('name', $gradeLevel)
            ->first();

        if (! $class) {
            return response()->json(['subjects' => []]);
        }

        // Get distinct subjects from timetable (non-break slots)
        $timetableSubjects = DB::table('timetable_slots')
            ->join('subjects', 'timetable_slots.subject_id', '=', 'subjects.id')
            ->leftJoin('users', 'timetable_slots.teacher_id', '=', 'users.id')
            ->where('timetable_slots.school_id', $schoolId)
            ->where('timetable_slots.class_id', $class->id)
            ->where('timetable_slots.is_break', false)
            ->whereNotNull('timetable_slots.subject_id')
            ->select(
                'subjects.id as subject_id',
                'subjects.name as subject_name',
                'subjects.color as subject_color',
                'users.name as teacher_name',
                'users.email as teacher_email',
                'timetable_slots.teacher_id'
            )
            ->distinct()
            ->get()
            ->unique('subject_id');

        // Get exam marks for this student grouped by subject_name
        $marks = ExamMark::where('school_id', $schoolId)
            ->where('student_id', $studentId)
            ->get()
            ->groupBy('subject_name');

        $subjects = $timetableSubjects->map(function ($row) use ($marks) {
            $subjectMarks = $marks->get($row->subject_name, collect());
            $grade    = null;
            $progress = null;

            if ($subjectMarks->isNotEmpty()) {
                $totalMarks = $subjectMarks->sum('marks');
                $totalOutOf = $subjectMarks->sum('out_of');
                $progress   = $totalOutOf > 0 ? round(($totalMarks / $totalOutOf) * 100) : 0;
                // Use grade from the most recent mark entry
                $grade = $subjectMarks->last()->grade;
            }

            return [
                'subject_id'    => $row->subject_id,
                'subject_name'  => $row->subject_name,
                'teacher_name'  => $row->teacher_name,
                'teacher_email' => $row->teacher_email,
                'grade'         => $grade,
                'progress'      => $progress,
            ];
        })->values();

        return response()->json(['subjects' => $subjects]);
    }
}
