<?php

namespace App\Http\Controllers\ParentPortal;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Attendance;

class ChildrenController extends Controller
{
    /**
     * Return all children linked to this parent (by parent_email = user email).
     */
    public function index()
    {
        $user     = auth()->user();
        $email    = $user->email;
        $schoolId = $user->school_id;

        $children = Student::where('school_id', $schoolId)
            ->where('parent_email', $email)
            ->where('status', 'Active')
            ->get();

        $since = now()->subDays(30)->toDateString();

        $data = $children->map(function ($student) use ($schoolId, $since) {
            // Attendance rate (last 30 days)
            $total   = Attendance::where('school_id', $schoolId)->where('student_id', $student->id)->where('date', '>=', $since)->count();
            $present = Attendance::where('school_id', $schoolId)->where('student_id', $student->id)->where('date', '>=', $since)->where('status', 'Present')->count();
            $rate    = $total > 0 ? round(($present / $total) * 100) : null;

            // Fee status
            $feeStructure = $student->feeStructure;
            $totalFee     = $feeStructure ? $feeStructure->total_amount : 0;
            $paid         = \App\Models\StudentFeePayment::where('school_id', $schoolId)->where('student_id', $student->id)->sum('amount');
            $balance      = max(0, $totalFee - $paid);

            return [
                'id'               => $student->id,
                'name'             => $student->first_name . ' ' . $student->last_name,
                'grade_level'      => $student->grade_level,
                'admission_number' => $student->admission_number,
                'gender'           => $student->gender,
                'attendance_rate'  => $rate,
                'fee_total'        => $totalFee,
                'fee_paid'         => $paid,
                'fee_balance'      => $balance,
            ];
        });

        return response()->json(['children' => $data]);
    }
}
