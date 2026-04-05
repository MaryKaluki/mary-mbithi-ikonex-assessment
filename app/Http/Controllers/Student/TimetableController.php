<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use Illuminate\Support\Facades\DB;

class TimetableController extends Controller
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
            return response()->json(['timetable' => [], 'time_slots' => []]);
        }

        $slots = DB::table('timetable_slots')
            ->leftJoin('subjects', 'timetable_slots.subject_id', '=', 'subjects.id')
            ->leftJoin('users', 'timetable_slots.teacher_id', '=', 'users.id')
            ->where('timetable_slots.school_id', $schoolId)
            ->where('timetable_slots.class_id', $class->id)
            ->select(
                'timetable_slots.day',
                'timetable_slots.time_slot',
                'timetable_slots.is_break',
                'subjects.name as subject_name',
                'subjects.color as subject_color',
                'users.name as teacher_name'
            )
            ->orderByRaw("FIELD(timetable_slots.day,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')")
            ->orderBy('timetable_slots.time_slot')
            ->get();

        $days    = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        $grouped = [];
        foreach ($days as $day) {
            $grouped[$day] = $slots->where('day', $day)->values();
        }

        $times = $slots->where('is_break', false)->pluck('time_slot')->unique()->sort()->values();

        return response()->json([
            'class'      => ['id' => $class->id, 'name' => $class->name],
            'timetable'  => $grouped,
            'time_slots' => $times,
        ]);
    }
}
