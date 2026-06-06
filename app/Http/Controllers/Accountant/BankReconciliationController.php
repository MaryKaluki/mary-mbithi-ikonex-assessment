<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use App\Services\Finance\BankReconciliationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BankReconciliationController extends Controller
{
    public function __construct(protected BankReconciliationService $recon) {}

    /** GET /api/finance/bank-statements?bank_account_id=&month= */
    public function index(Request $request)
    {
        $schoolId      = $request->user()->school_id;
        $bankAccountId = $request->input('bank_account_id');
        $month         = $request->input('month'); // YYYY-MM

        if (!$bankAccountId) {
            return response()->json(['message' => 'bank_account_id is required.'], 422);
        }

        // Verify account belongs to school
        $account = DB::table('bank_accounts')
            ->where('id', $bankAccountId)->where('school_id', $schoolId)->first();
        if (!$account) {
            return response()->json(['message' => 'Account not found.'], 404);
        }

        $query = DB::table('bank_statements')
            ->where('bank_account_id', $bankAccountId)
            ->where('school_id', $schoolId);

        if ($month) {
            $query->whereRaw("DATE_FORMAT(transaction_date, '%Y-%m') = ?", [$month]);
        }

        $lines = $query->orderBy('transaction_date')->orderBy('id')->get();

        return response()->json($lines);
    }

    /** GET /api/finance/bank-statements/summary */
    public function summary(Request $request)
    {
        $schoolId      = $request->user()->school_id;
        $bankAccountId = $request->input('bank_account_id');
        $from          = $request->input('from');
        $to            = $request->input('to');

        if (!$bankAccountId || !$from || !$to) {
            return response()->json(['message' => 'bank_account_id, from, and to are required.'], 422);
        }

        $summary = $this->recon->summary((int) $bankAccountId, $schoolId, $from, $to);
        return response()->json($summary);
    }

    /** POST /api/finance/bank-statements/import — manual row upload */
    public function import(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $data = $request->validate([
            'bank_account_id' => 'required|integer',
            'rows'            => 'required|array|min:1',
            'rows.*.transaction_date' => 'required|date',
            'rows.*.credit'           => 'nullable|integer|min:0',
            'rows.*.debit'            => 'nullable|integer|min:0',
            'rows.*.description'      => 'nullable|string|max:255',
            'rows.*.reference'        => 'nullable|string|max:100',
            'rows.*.running_balance'  => 'nullable|integer',
        ]);

        $account = DB::table('bank_accounts')
            ->where('id', $data['bank_account_id'])
            ->where('school_id', $schoolId)->first();
        if (!$account) {
            return response()->json(['message' => 'Account not found.'], 404);
        }

        $batch    = 'IMPORT-' . strtoupper(Str::random(8));
        $inserted = $this->recon->import(
            (int) $data['bank_account_id'],
            $schoolId,
            $data['rows'],
            $batch
        );

        return response()->json([
            'message'  => "{$inserted} rows imported.",
            'batch'    => $batch,
            'inserted' => $inserted,
        ]);
    }

    /** POST /api/finance/bank-statements/reconcile */
    public function reconcile(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $data = $request->validate([
            'bank_account_id' => 'required|integer',
            'from'            => 'required|date',
            'to'              => 'required|date|after_or_equal:from',
        ]);

        $account = DB::table('bank_accounts')
            ->where('id', $data['bank_account_id'])
            ->where('school_id', $schoolId)->first();
        if (!$account) {
            return response()->json(['message' => 'Account not found.'], 404);
        }

        $result = $this->recon->reconcile(
            (int) $data['bank_account_id'],
            $schoolId,
            $data['from'],
            $data['to']
        );

        return response()->json(array_merge($result, [
            'message' => "Auto-reconciliation complete: {$result['matched']} matched, {$result['unmatched']} unmatched.",
        ]));
    }

    /** PATCH /api/finance/bank-statements/{id}/match */
    public function manualMatch(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;

        $data = $request->validate([
            'payment_id' => 'nullable|integer',
            'expense_id' => 'nullable|integer',
        ]);

        if (!$data['payment_id'] && !$data['expense_id']) {
            return response()->json(['message' => 'Provide payment_id or expense_id.'], 422);
        }

        $line = DB::table('bank_statements')
            ->where('id', $id)->where('school_id', $schoolId)->first();
        if (!$line) {
            return response()->json(['message' => 'Statement line not found.'], 404);
        }

        DB::table('bank_statements')->where('id', $id)->update([
            'matched_payment_id' => $data['payment_id'] ?? null,
            'matched_expense_id' => $data['expense_id'] ?? null,
            'is_reconciled'      => true,
            'reconciled_at'      => now(),
            'reconciled_by'      => $request->user()->id,
            'updated_at'         => now(),
        ]);

        return response()->json(['message' => 'Statement line matched.']);
    }

    /** PATCH /api/finance/bank-statements/{id}/unmatch */
    public function unmatch(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;

        $line = DB::table('bank_statements')
            ->where('id', $id)->where('school_id', $schoolId)->first();
        if (!$line) {
            return response()->json(['message' => 'Statement line not found.'], 404);
        }

        DB::table('bank_statements')->where('id', $id)->update([
            'matched_payment_id' => null,
            'matched_expense_id' => null,
            'is_reconciled'      => false,
            'reconciled_at'      => null,
            'reconciled_by'      => null,
            'updated_at'         => now(),
        ]);

        return response()->json(['message' => 'Statement line unmatched.']);
    }
}
