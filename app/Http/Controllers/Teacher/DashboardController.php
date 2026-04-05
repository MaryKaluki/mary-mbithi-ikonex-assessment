<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Homework;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\ExamMark;
use App\Models\Exam;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        $teacher   = auth()->user();
        $schoolId  = $teacher->school_id;
        $teacherId = $teacher->id;

        // Classes this teacher is assigned to (as class_teacher_id or timetable teacher)
        $myClassIds = SchoolClass::where('class_teacher_id', $teacherId)
            ->pluck('id')->toArray();

        // Also include classes from timetable slots
        $timetableClassIds = DB::table('timetable_slots')
            ->where('teacher_id', $teacherId)
            ->where('school_id', $schoolId)
            ->pluck('class_id')->unique()->toArray();

        $allClassIds = array_unique(array_merge($myClassIds, $timetableClassIds));

        $classCount   = count($allClassIds);
        $studentCount = Student::where('school_id', $schoolId)
            ->whereIn('grade_level', SchoolClass::whereIn('id', $allClassIds)->pluck('name'))
            ->where('status', 'Active')
            ->count();

        // Today's attendance rate across my classes
        $today = now()->toDateString();
        $totalToday   = Attendance::where('school_id', $schoolId)
            ->where('marked_by', $teacherId)
            ->where('date', $today)
            ->count();
        $presentToday = Attendance::where('school_id', $schoolId)
            ->where('marked_by', $teacherId)
            ->where('date', $today)
            ->where('status', 'Present')
            ->count();
        $attendanceRate = $totalToday > 0 ? round(($presentToday / $totalToday) * 100) : null;

        // Exams: active/upcoming first, fall back to all if none
        $activeExams = Exam::where('school_id', $schoolId)
            ->whereIn('status', ['Active', 'Upcoming'])
            ->count();
        if ($activeExams === 0) {
            $activeExams = Exam::where('school_id', $schoolId)->count();
        }

        // Today's timetable slots
        $dayMap = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        $todayName = $dayMap[now()->dayOfWeek];

        $todaySlots = DB::table('timetable_slots')
            ->join('classes', 'timetable_slots.class_id', '=', 'classes.id')
            ->leftJoin('subjects', 'timetable_slots.subject_id', '=', 'subjects.id')
            ->where('timetable_slots.school_id', $schoolId)
            ->where('timetable_slots.teacher_id', $teacherId)
            ->where('timetable_slots.day', $todayName)
            ->where('timetable_slots.is_break', false)
            ->select(
                'timetable_slots.time_slot',
                'classes.name as class_name',
                'subjects.name as subject_name'
            )
            ->orderBy('timetable_slots.time_slot')
            ->get();

        // Pending homework (not yet due)
        $pendingHomework = Homework::where('school_id', $schoolId)
            ->where('teacher_id', $teacherId)
            ->where('due_date', '>=', $today)
            ->count();

        return response()->json([
            'stats' => [
                'class_count'     => $classCount,
                'student_count'   => $studentCount,
                'attendance_rate' => $attendanceRate,
                'active_exams'    => $activeExams,
                'pending_homework'=> $pendingHomework,
            ],
            'today_slots' => $todaySlots,
        ]);
    }
}
