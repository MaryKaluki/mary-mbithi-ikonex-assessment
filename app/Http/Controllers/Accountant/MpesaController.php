<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use App\Services\Finance\MpesaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MpesaController extends Controller
{
    public function __construct(protected MpesaService $mpesa) {}

    // ─── Safaricom Callbacks (no auth middleware) ─────────────────────────────

    /** POST /api/mpesa/c2b/validation */
    public function c2bValidate(Request $request)
    {
        $result = $this->mpesa->handleC2BValidation($request->all());
        return response()->json($result);
    }

    /** POST /api/mpesa/c2b/confirmation */
    public function c2bConfirm(Request $request)
    {
        try {
            $this->mpesa->handleC2BConfirmation($request->all());
        } catch (\Throwable $e) {
            Log::error('M-Pesa C2B confirmation error', ['error' => $e->getMessage()]);
        }
        // Safaricom expects { ResultCode: 0 } regardless
        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
    }

    /** POST /api/mpesa/stk/callback */
    public function stkCallback(Request $request)
    {
        try {
            $this->mpesa->handleStkCallback($request->all());
        } catch (\Throwable $e) {
            Log::error('M-Pesa STK callback error', ['error' => $e->getMessage()]);
        }
        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
    }

    // ─── Authenticated API endpoints ──────────────────────────────────────────

    /** GET /api/finance/mpesa-c2b — list M-Pesa transactions */
    public function index(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $perPage  = min((int) $request->input('per_page', 50), 200);
        $page     = max((int) $request->input('page', 1), 1);

        $query = DB::table('mpesa_transactions as mt')
            ->leftJoin('student_fee_invoices as inv', 'inv.id', '=', 'mt.matched_invoice_id')
            ->leftJoin('students as s', 's.id', '=', 'inv.student_id')
            ->leftJoin('users as u', 'u.id', '=', 'mt.matched_by')
            ->where('mt.school_id', $schoolId);

        if ($request->filled('matched')) {
            $query->where('mt.is_matched', (bool) $request->input('matched'));
        }
        if ($request->filled('type')) {
            $query->where('mt.transaction_type', $request->input('type'));
        }

        $total = $query->count();
        $items = $query->orderBy('mt.transaction_date', 'desc')
            ->offset(($page - 1) * $perPage)
            ->limit($perPage)
            ->select([
                'mt.id',
                'mt.mpesa_receipt_number as mpesa_reference',
                'mt.transaction_type',
                'mt.amount',
                'mt.account_reference',
                'mt.transaction_date as transaction_time',
                'mt.is_matched',
                'mt.match_method',
                'mt.matched_at',
                DB::raw("CASE WHEN mt.is_matched THEN 'matched' ELSE 'unmatched' END as status"),
                DB::raw("CONCAT(s.first_name, ' ', s.last_name) as matched_student"),
                DB::raw("CONCAT(u.first_name, ' ', u.last_name) as matched_by_name"),
            ])
            ->get();

        return response()->json([
            'data' => $items,
            'meta' => [
                'total'     => $total,
                'per_page'  => $perPage,
                'page'      => $page,
                'last_page' => (int) ceil($total / $perPage),
            ],
        ]);
    }

    /** POST /api/finance/mpesa-c2b/sync — trigger manual sync (placeholder for Daraja query) */
    public function sync(Request $request)
    {
        // In production this would query Safaricom for missing transactions.
        // For now it re-attempts matching on all unmatched transactions.
        $schoolId = $request->user()->school_id;

        $unmatched = DB::table('mpesa_transactions')
            ->where('school_id', $schoolId)
            ->where('is_matched', false)
            ->get();

        $matched = 0;
        foreach ($unmatched as $tx) {
            $phone = '';
            try { $phone = decrypt($tx->phone_number); } catch (\Throwable) {}

            $ok = $this->mpesa->autoMatch(
                $tx->id, $schoolId, $tx->amount,
                $tx->account_reference, $tx->matched_invoice_id, $phone
            );
            if ($ok) $matched++;
        }

        return response()->json([
            'message'  => "Sync complete. {$matched} of {$unmatched->count()} transactions matched.",
            'matched'  => $matched,
            'total'    => $unmatched->count(),
        ]);
    }

    /** POST /api/finance/mpesa-c2b/{id}/match — manually match to an invoice */
    public function match(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;

        $data = $request->validate([
            'invoice_id' => 'required|integer',
        ]);

        try {
            $this->mpesa->manualMatch(
                (int) $id,
                (int) $data['invoice_id'],
                $schoolId,
                $request->user()->id
            );
            return response()->json(['message' => 'Transaction matched successfully.']);
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /** POST /api/finance/mpesa/stk-push — initiate STK push */
    public function stkPush(Request $request)
    {
        $data = $request->validate([
            'phone'      => 'required|string',
            'amount'     => 'required|integer|min:1',
            'invoice_id' => 'nullable|integer',
            'account_ref'=> 'nullable|string|max:12',
        ]);

        $schoolId = $request->user()->school_id;
        $phone    = MpesaService::normalisePhone($data['phone']);
        $ref      = $data['account_ref'] ?? ('SCH' . $schoolId);

        // Cache invoice context so STK callback can link it
        if (!empty($data['invoice_id'])) {
            $checkoutKey = null; // Will be set after STK push returns checkout ID
            $context = [
                'school_id'   => $schoolId,
                'invoice_id'  => $data['invoice_id'],
                'account_ref' => $ref,
            ];
            // We store with a temp key — the STK response's CheckoutRequestID will be the real key.
            // Cache it keyed by invoice temporarily; the callback will re-look by CheckoutRequestID.
            \Cache::put("mpesa_pending_inv_{$data['invoice_id']}", $context, 600);
        }

        $result = $this->mpesa->stkPush($phone, $data['amount'], $ref);

        // If Daraja gave us a CheckoutRequestID, cache the context under that key
        if (!empty($result['CheckoutRequestID']) && !empty($context ?? null)) {
            \Cache::put("mpesa_stk_{$result['CheckoutRequestID']}", $context, 600);
        }

        if (($result['ResponseCode'] ?? null) === '0') {
            return response()->json([
                'message'            => 'STK Push sent. Ask customer to check their phone.',
                'checkout_request_id'=> $result['CheckoutRequestID'] ?? null,
            ]);
        }

        return response()->json([
            'message' => $result['ResponseDescription'] ?? 'STK Push failed.',
        ], 422);
    }

    /** GET /api/finance/mpesa/cheques — cheque clearance list */
    public function cheques(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $query = DB::table('cheques as c')
            ->leftJoin('bank_accounts as ba', 'ba.id', '=', 'c.bank_account_id')
            ->leftJoin('fee_payments as fp', 'fp.id', '=', 'c.linked_payment_id')
            ->leftJoin('student_fee_invoices as inv', 'inv.id', '=', 'fp.invoice_id')
            ->leftJoin('students as s', 's.id', '=', 'inv.student_id')
            ->where('c.school_id', $schoolId);

        if ($request->filled('status')) {
            $query->where('c.status', $request->input('status'));
        }

        $cheques = $query->orderBy('c.received_date', 'desc')
            ->select([
                'c.*',
                'ba.bank_name as receiving_bank',
                DB::raw("CONCAT(s.first_name, ' ', s.last_name) as student_name"),
            ])
            ->get();

        return response()->json($cheques);
    }

    /** PATCH /api/finance/mpesa/cheques/{id}/clear */
    public function clearCheque(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;

        $data = $request->validate(['cleared_date' => 'nullable|date']);

        $cheque = DB::table('cheques')
            ->where('id', $id)->where('school_id', $schoolId)->first();
        if (!$cheque) {
            return response()->json(['message' => 'Cheque not found.'], 404);
        }

        DB::table('cheques')->where('id', $id)->update([
            'status'       => 'cleared',
            'cleared_date' => $data['cleared_date'] ?? today()->toDateString(),
            'updated_at'   => now(),
        ]);

        // Also confirm the linked payment
        if ($cheque->linked_payment_id) {
            DB::table('fee_payments')
                ->where('id', $cheque->linked_payment_id)
                ->where('status', 'pending')
                ->update(['status' => 'confirmed', 'updated_at' => now()]);
        }

        return response()->json(['message' => 'Cheque marked as cleared.']);
    }

    /** PATCH /api/finance/mpesa/cheques/{id}/bounce */
    public function bounceCheque(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;

        $data = $request->validate([
            'reason'         => 'nullable|string|max:255',
            'bounce_charges' => 'nullable|integer|min:0',
        ]);

        $cheque = DB::table('cheques')
            ->where('id', $id)->where('school_id', $schoolId)->first();
        if (!$cheque) {
            return response()->json(['message' => 'Cheque not found.'], 404);
        }

        DB::table('cheques')->where('id', $id)->update([
            'status'         => 'bounced',
            'bounce_reason'  => $data['reason'] ?? null,
            'bounce_charges' => $data['bounce_charges'] ?? null,
            'updated_at'     => now(),
        ]);

        // Reverse the linked payment
        if ($cheque->linked_payment_id) {
            DB::table('fee_payments')
                ->where('id', $cheque->linked_payment_id)
                ->update(['status' => 'bounced', 'updated_at' => now()]);
        }

        return response()->json(['message' => 'Cheque marked as bounced.']);
    }
}
