<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use App\Services\Finance\FeeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function __construct(protected FeeService $fees) {}

    /** POST /api/finance/payments — record a payment */
    public function store(Request $request)
    {
        $data = $request->validate([
            'invoice_id'      => 'required|integer',
            'amount'          => 'required|integer|min:1',
            'payment_method'  => 'required|in:cash,mpesa,bank_transfer,cheque,standing_order,card',
            'payment_date'    => 'sometimes|date',
            'mpesa_code'      => 'nullable|string|max:20',
            'bank_ref'        => 'nullable|string|max:100',
            'cheque_number'   => 'nullable|string|max:50',
            'bank_account_id' => 'nullable|integer',
            'notes'           => 'nullable|string',
        ]);

        try {
            $result = $this->fees->recordPayment(
                $data['invoice_id'],
                $data['amount'],
                $data['payment_method'],
                $data
            );
            return response()->json($result, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /** PATCH /api/finance/payments/{id}/reverse */
    public function reverse(Request $request, $id)
    {
        $reason = $request->input('reason', '');
        try {
            $reversal = $this->fees->reversePayment((int) $id, $reason);
            return response()->json($reversal);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /** GET /api/finance/students/{id}/ledger */
    public function ledger(Request $request, $studentId)
    {
        $year = $request->get('academic_year');
        $term = $request->get('term') ? (int) $request->get('term') : null;

        $ledger = $this->fees->getStudentLedger((int) $studentId, $year, $term);
        return response()->json($ledger);
    }

    /** GET /api/finance/students/{id}/statement — student account statement */
    public function statement(Request $request, $studentId)
    {
        $schoolId = $request->user()->school_id;

        $student = DB::table('students')
            ->where('id', $studentId)
            ->where('school_id', $schoolId)
            ->first();

        if (!$student) return response()->json(['message' => 'Student not found.'], 404);

        $invoices = DB::table('student_fee_invoices')
            ->where('student_id', $studentId)
            ->where('school_id', $schoolId)
            ->whereNull('deleted_at')
            ->orderBy('academic_year')->orderBy('term')
            ->get();

        $invoiceIds = $invoices->pluck('id')->toArray();

        $payments = DB::table('fee_payments')
            ->whereIn('invoice_id', $invoiceIds)
            ->where('status', '!=', 'reversed')
            ->orderBy('payment_date')
            ->get();

        $totalCharged    = $invoices->sum('total_charged');
        $totalPaid       = $invoices->sum('total_paid');
        $totalOutstanding = $totalCharged - $totalPaid;

        return response()->json([
            'student'          => $student,
            'invoices'         => $invoices,
            'payments'         => $payments,
            'summary'          => [
                'total_charged'     => $totalCharged,
                'total_paid'        => $totalPaid,
                'total_outstanding' => $totalOutstanding,
            ],
        ]);
    }
}
