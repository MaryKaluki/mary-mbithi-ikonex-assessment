<?php

namespace App\Http\Controllers\ParentPortal;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentFeePayment;

class FeeController extends Controller
{
    public function index()
    {
        $user     = auth()->user();
        $email    = $user->email;
        $schoolId = $user->school_id;

        $children = Student::where('school_id', $schoolId)
            ->where('parent_email', $email)
            ->where('status', 'Active')
            ->with('feeStructure')
            ->get();

        $data = $children->map(function ($student) use ($schoolId) {
            $feeStructure = $student->feeStructure;
            $totalFee     = $feeStructure ? $feeStructure->total_amount : 0;

            $payments = StudentFeePayment::where('school_id', $schoolId)
                ->where('student_id', $student->id)
                ->orderBy('payment_date', 'desc')
                ->get()
                ->map(fn($p) => [
                    'id'             => $p->id,
                    'date'           => $p->payment_date,
                    'description'    => $p->description ?? 'Fee Payment',
                    'amount'         => $p->amount,
                    'payment_method' => $p->payment_method,
                    'reference'      => $p->reference,
                    'term'           => $p->term,
                    'year'           => $p->year,
                ]);

            $paid    = $payments->sum('amount');
            $balance = max(0, $totalFee - $paid);

            return [
                'id'           => $student->id,
                'name'         => $student->first_name . ' ' . $student->last_name,
                'grade_level'  => $student->grade_level,
                'fee_name'     => $feeStructure ? $feeStructure->name : 'N/A',
                'total_fee'    => $totalFee,
                'total_paid'   => $paid,
                'balance'      => $balance,
                'payments'     => $payments,
            ];
        });

        return response()->json(['children' => $data]);
    }
}
