<?php

namespace App\Http\Controllers\ParentPortal;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Attendance;
use App\Models\StudentFeePayment;
use App\Models\Homework;
use App\Models\SchoolClass;

class DashboardController extends Controller
{
    public function stats()
    {
        $user     = auth()->user();
        $email    = $user->email;
        $schoolId = $user->school_id;

        $children = Student::where('school_id', $schoolId)
            ->where('parent_email', $email)
            ->where('status', 'Active')
            ->get();

        if ($children->isEmpty()) {
            return response()->json(['error' => 'No children linked to this parent account.'], 404);
        }

        $since = now()->subDays(30)->toDateString();
        $today = now()->toDateString();

        $totalBalance    = 0;
        $childrenSummary = [];

        foreach ($children as $student) {
            // Attendance today
            $todayRecord = Attendance::where('school_id', $schoolId)
                ->where('student_id', $student->id)
                ->where('date', $today)
                ->first();

            // Attendance rate
            $total   = Attendance::where('school_id', $schoolId)->where('student_id', $student->id)->where('date', '>=', $since)->count();
            $present = Attendance::where('school_id', $schoolId)->where('student_id', $student->id)->where('date', '>=', $since)->where('status', 'Present')->count();
            $rate    = $total > 0 ? round(($present / $total) * 100) : null;

            // Fee balance
            $feeStructure = $student->feeStructure;
            $totalFee     = $feeStructure ? $feeStructure->total_amount : 0;
            $paid         = StudentFeePayment::where('school_id', $schoolId)->where('student_id', $student->id)->sum('amount');
            $balance      = max(0, $totalFee - $paid);
            $totalBalance += $balance;

            // Pending homework
            $class = SchoolClass::where('school_id', $schoolId)->where('name', $student->grade_level)->first();
            $pendingHw = $class
                ? Homework::where('school_id', $schoolId)->where('class_id', $class->id)->where('due_date', '>=', $today)->count()
                : 0;

            $childrenSummary[] = [
                'id'               => $student->id,
                'name'             => $student->first_name . ' ' . $student->last_name,
                'grade_level'      => $student->grade_level,
                'today_status'     => $todayRecord ? $todayRecord->status : 'Not recorded',
                'attendance_rate'  => $rate,
                'fee_balance'      => $balance,
                'pending_homework' => $pendingHw,
            ];
        }

        return response()->json([
            'children'      => $childrenSummary,
            'total_balance' => $totalBalance,
        ]);
    }
}
