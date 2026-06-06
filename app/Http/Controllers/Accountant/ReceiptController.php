<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReceiptController extends Controller
{
    /** GET /api/finance/receipts — paginated receipt register */
    public function index(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $query = DB::table('fee_payments as p')
            ->where('p.school_id', $schoolId)
            ->whereNull('p.deleted_at')
            ->where('p.status', '!=', 'reversed')
            ->join('students as s', 's.id', '=', 'p.student_id')
            ->leftJoin('student_fee_invoices as i', 'i.id', '=', 'p.invoice_id')
            ->select(
                'p.id', 'p.receipt_number', 'p.amount', 'p.payment_method',
                'p.payment_date', 'p.status', 'p.mpesa_code', 'p.bank_ref',
                's.first_name', 's.last_name', 's.admission_number',
                'i.invoice_number', 'i.academic_year', 'i.term'
            )
            ->orderByDesc('p.payment_date');

        if ($request->filled('from'))    $query->where('p.payment_date', '>=', $request->from);
        if ($request->filled('to'))      $query->where('p.payment_date', '<=', $request->to);
        if ($request->filled('method'))  $query->where('p.payment_method', $request->method);
        if ($request->filled('search')) {
            $q = '%' . $request->search . '%';
            $query->where(function ($qb) use ($q) {
                $qb->where('p.receipt_number', 'like', $q)
                   ->orWhere('p.mpesa_code', 'like', $q)
                   ->orWhere('s.first_name', 'like', $q)
                   ->orWhere('s.last_name', 'like', $q)
                   ->orWhere('s.admission_number', 'like', $q);
            });
        }

        $perPage = min((int) $request->get('per_page', 50), 200);
        return response()->json($query->paginate($perPage));
    }

    /** GET /api/finance/receipts/{id} — single receipt detail */
    public function show(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;

        $payment = DB::table('fee_payments as p')
            ->where('p.id', $id)
            ->where('p.school_id', $schoolId)
            ->join('students as s', 's.id', '=', 'p.student_id')
            ->leftJoin('student_fee_invoices as i', 'i.id', '=', 'p.invoice_id')
            ->leftJoin('users as u', 'u.id', '=', 'p.received_by')
            ->select(
                'p.*',
                's.first_name', 's.last_name', 's.admission_number', 's.grade_level',
                's.parent_name', 's.parent_phone',
                'i.invoice_number', 'i.academic_year', 'i.term', 'i.total_charged', 'i.balance',
                'u.name as received_by_name'
            )
            ->first();

        if (!$payment) return response()->json(['message' => 'Receipt not found.'], 404);

        // School info for receipt header
        $school = DB::table('schools')->where('id', $schoolId)->first(['name', 'logo_path', 'phone', 'address']);
        $payment->school = $school;

        return response()->json($payment);
    }

    /** POST /api/finance/receipts/{id}/email — mark as emailed */
    public function email(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;

        $receipt = DB::table('fee_receipts as r')
            ->join('fee_payments as p', 'p.id', '=', 'r.payment_id')
            ->where('r.payment_id', $id)
            ->where('p.school_id', $schoolId)
            ->first();

        if (!$receipt) {
            // Auto-create receipt record if missing
            $payment = DB::table('fee_payments')->where('id', $id)->where('school_id', $schoolId)->first();
            if (!$payment) return response()->json(['message' => 'Payment not found.'], 404);
        }

        DB::table('fee_receipts')->updateOrInsert(
            ['payment_id' => $id],
            ['email_sent_at' => now(), 'updated_at' => now()]
        );

        // TODO: dispatch EmailReceiptJob when email queue is configured

        return response()->json(['message' => 'Receipt marked as emailed.']);
    }

    /** POST /api/finance/receipts/{id}/sms — mark as SMS sent */
    public function sms(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;
        $payment  = DB::table('fee_payments')->where('id', $id)->where('school_id', $schoolId)->first();
        if (!$payment) return response()->json(['message' => 'Payment not found.'], 404);

        DB::table('fee_receipts')->updateOrInsert(
            ['payment_id' => $id],
            ['sms_sent_at' => now(), 'updated_at' => now()]
        );

        // TODO: dispatch SmsReceiptJob when SMS gateway configured

        return response()->json(['message' => 'Receipt marked as SMS sent.']);
    }
}
