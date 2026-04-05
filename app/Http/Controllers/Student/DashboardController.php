<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Homework;
use App\Models\ExamMark;
use App\Models\SchoolClass;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        $user     = auth()->user();
        $student  = $user->student;

        if (! $student) {
            return response()->json(['error' => 'Student record not found for this user.'], 404);
        }

        $schoolId   = $user->school_id;
        $studentId  = $student->id;
        $gradeLevel = $student->grade_level;

        // Find the class this student belongs to
        $class = SchoolClass::where('school_id', $schoolId)
            ->where('name', $gradeLevel)
            ->first();

        // Attendance rate (this term — last 30 days)
        $since = now()->subDays(30)->toDateString();
        $total = Attendance::where('school_id', $schoolId)
            ->where('student_id', $studentId)
            ->where('date', '>=', $since)
            ->count();
        $present = Attendance::where('school_id', $schoolId)
            ->where('student_id', $studentId)
            ->where('date', '>=', $since)
            ->where('status', 'Present')
            ->count();
        $attendanceRate = $total > 0 ? round(($present / $total) * 100) : null;

        // Pending homework (class-based, not yet due)
        $today = now()->toDateString();
        $pendingHomework = 0;
        if ($class) {
            $pendingHomework = Homework::where('school_id', $schoolId)
                ->where('class_id', $class->id)
                ->where('due_date', '>=', $today)
                ->count();
        }

        // Latest exam average
        $latestExamMark = ExamMark::where('school_id', $schoolId)
            ->where('student_id', $studentId)
            ->latest()
            ->first();
        $latestGrade = $latestExamMark ? $latestExamMark->grade : null;

        // Today's timetable
        $dayMap    = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        $todayName = $dayMap[now()->dayOfWeek];
        $todaySlots = [];

        if ($class) {
            $todaySlots = DB::table('timetable_slots')
                ->leftJoin('subjects', 'timetable_slots.subject_id', '=', 'subjects.id')
                ->leftJoin('users', 'timetable_slots.teacher_id', '=', 'users.id')
                ->where('timetable_slots.school_id', $schoolId)
                ->where('timetable_slots.class_id', $class->id)
                ->where('timetable_slots.day', $todayName)
                ->select(
                    'timetable_slots.time_slot',
                    'timetable_slots.is_break',
                    'subjects.name as subject_name',
                    'users.name as teacher_name'
                )
                ->orderBy('timetable_slots.time_slot')
                ->get();
        }

        return response()->json([
            'student' => [
                'name'            => $student->first_name . ' ' . $student->last_name,
                'admission_number' => $student->admission_number,
                'grade_level'     => $student->grade_level,
            ],
            'stats' => [
                'attendance_rate'  => $attendanceRate,
                'pending_homework' => $pendingHomework,
                'latest_grade'     => $latestGrade,
            ],
            'today_slots' => $todaySlots,
        ]);
    }
}
