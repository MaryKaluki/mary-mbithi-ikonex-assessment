<?php

namespace App\Services\Finance;

use Illuminate\Support\Facades\DB;

/**
 * Bank reconciliation engine.
 *
 * Matches bank statement lines to internal fee_payments and expenses.
 * All amounts are integer KES.
 *
 * Matching strategy (tried in order):
 *  1. Exact reference match  (bank reference == mpesa_code | bank_ref | cheque_number)
 *  2. Amount + date window   (±3 days)
 *  3. Amount only            (flagged as "possible" — needs manual confirm)
 */
class BankReconciliationService
{
    // ─── Import ───────────────────────────────────────────────────────────────

    /**
     * Import parsed bank statement rows into bank_statements table.
     *
     * @param  int    $bankAccountId
     * @param  string $schoolId
     * @param  array  $rows  Each: [transaction_date, description, credit, debit, running_balance, reference?]
     * @param  string $batch Unique import batch identifier
     * @return int    Number of new rows inserted
     */
    public function import(int $bankAccountId, string $schoolId, array $rows, string $batch): int
    {
        $inserted = 0;

        foreach ($rows as $row) {
            // Skip duplicate rows (same account + date + credit/debit + reference)
            $exists = DB::table('bank_statements')
                ->where('bank_account_id', $bankAccountId)
                ->where('transaction_date', $row['transaction_date'])
                ->where('credit', $row['credit'] ?? 0)
                ->where('debit', $row['debit'] ?? 0)
                ->where('reference', $row['reference'] ?? null)
                ->exists();

            if ($exists) continue;

            DB::table('bank_statements')->insert([
                'school_id'          => $schoolId,
                'bank_account_id'    => $bankAccountId,
                'transaction_date'   => $row['transaction_date'],
                'value_date'         => $row['value_date'] ?? $row['transaction_date'],
                'description'        => $row['description'] ?? null,
                'credit'             => (int) ($row['credit'] ?? 0),
                'debit'              => (int) ($row['debit'] ?? 0),
                'running_balance'    => (int) ($row['running_balance'] ?? 0),
                'reference'          => $row['reference'] ?? null,
                'is_reconciled'      => false,
                'import_batch'       => $batch,
                'created_at'         => now(),
                'updated_at'         => now(),
            ]);
            $inserted++;
        }

        return $inserted;
    }

    // ─── Auto-reconcile ───────────────────────────────────────────────────────

    /**
     * Run auto-matching for all unreconciled bank statement lines
     * in a bank account within a date range.
     *
     * Returns counts: matched, skipped (already reconciled), unmatched.
     */
    public function reconcile(int $bankAccountId, string $schoolId, string $from, string $to): array
    {
        $lines = DB::table('bank_statements')
            ->where('bank_account_id', $bankAccountId)
            ->where('school_id', $schoolId)
            ->where('is_reconciled', false)
            ->whereBetween('transaction_date', [$from, $to])
            ->get();

        $matched   = 0;
        $unmatched = 0;

        foreach ($lines as $line) {
            $result = $this->matchLine($line, $schoolId);

            if ($result) {
                DB::table('bank_statements')->where('id', $line->id)->update([
                    'matched_payment_id' => $result['payment_id'] ?? null,
                    'matched_expense_id' => $result['expense_id'] ?? null,
                    'is_reconciled'      => true,
                    'reconciled_at'      => now(),
                    'updated_at'         => now(),
                ]);
                $matched++;
            } else {
                $unmatched++;
            }
        }

        return compact('matched', 'unmatched');
    }

    /**
     * Try to match a single bank statement line.
     * Returns ['payment_id' => X] or ['expense_id' => X] or null.
     */
    public function matchLine(object $line, string $schoolId): ?array
    {
        // Credits = money IN = fee payment
        if ($line->credit > 0) {
            return $this->matchCredit($line, $schoolId);
        }

        // Debits = money OUT = expense
        if ($line->debit > 0) {
            return $this->matchDebit($line, $schoolId);
        }

        return null;
    }

    private function matchCredit(object $line, string $schoolId): ?array
    {
        // 1. Reference match against fee_payments
        if ($line->reference) {
            $payment = DB::table('fee_payments')
                ->where('school_id', $schoolId)
                ->where(function ($q) use ($line) {
                    $q->where('mpesa_code', $line->reference)
                      ->orWhere('bank_ref', $line->reference)
                      ->orWhere('cheque_number', $line->reference);
                })
                ->where('amount', $line->credit)
                ->first();

            if ($payment) return ['payment_id' => $payment->id];
        }

        // 2. Amount + date window (±3 days)
        $dateFrom = date('Y-m-d', strtotime($line->transaction_date . ' -3 days'));
        $dateTo   = date('Y-m-d', strtotime($line->transaction_date . ' +3 days'));

        $payment = DB::table('fee_payments')
            ->where('school_id', $schoolId)
            ->where('amount', $line->credit)
            ->whereBetween('payment_date', [$dateFrom, $dateTo])
            ->whereNotExists(function ($q) {
                $q->select(DB::raw(1))
                  ->from('bank_statements')
                  ->whereColumn('bank_statements.matched_payment_id', 'fee_payments.id');
            })
            ->first();

        if ($payment) return ['payment_id' => $payment->id];

        return null;
    }

    private function matchDebit(object $line, string $schoolId): ?array
    {
        // 1. Reference match against expenses
        if ($line->reference) {
            $expense = DB::table('expenses')
                ->where('school_id', $schoolId)
                ->where(function ($q) use ($line) {
                    $q->where('bank_ref', $line->reference)
                      ->orWhere('cheque_number', $line->reference);
                })
                ->where('amount', $line->debit)
                ->first();

            if ($expense) return ['expense_id' => $expense->id];
        }

        // 2. Amount + date window
        $dateFrom = date('Y-m-d', strtotime($line->transaction_date . ' -3 days'));
        $dateTo   = date('Y-m-d', strtotime($line->transaction_date . ' +3 days'));

        $expense = DB::table('expenses')
            ->where('school_id', $schoolId)
            ->where('amount', $line->debit)
            ->whereBetween('expense_date', [$dateFrom, $dateTo])
            ->whereNotExists(function ($q) {
                $q->select(DB::raw(1))
                  ->from('bank_statements')
                  ->whereColumn('bank_statements.matched_expense_id', 'expenses.id');
            })
            ->first();

        if ($expense) return ['expense_id' => $expense->id];

        return null;
    }

    // ─── Summary report ───────────────────────────────────────────────────────

    /**
     * Build a reconciliation summary for a bank account and date range.
     *
     * Returns:
     *  opening_balance, total_credits, total_debits, closing_balance (from bank statement)
     *  system_receipts, system_expenses, system_net
     *  difference, unreconciled_count
     */
    public function summary(int $bankAccountId, string $schoolId, string $from, string $to): array
    {
        $account = DB::table('bank_accounts')
            ->where('id', $bankAccountId)
            ->where('school_id', $schoolId)
            ->first();

        if (!$account) {
            return [];
        }

        $lines = DB::table('bank_statements')
            ->where('bank_account_id', $bankAccountId)
            ->where('school_id', $schoolId)
            ->whereBetween('transaction_date', [$from, $to])
            ->get();

        $totalCredits  = $lines->sum('credit');
        $totalDebits   = $lines->sum('debit');
        $unreconciledN = $lines->where('is_reconciled', false)->count();

        // Opening balance: account balance as of last reconciliation before $from
        $openingLine = DB::table('bank_statements')
            ->where('bank_account_id', $bankAccountId)
            ->where('transaction_date', '<', $from)
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->first();
        $openingBalance = $openingLine?->running_balance ?? $account->current_balance;

        // Closing balance from statement
        $closingLine = DB::table('bank_statements')
            ->where('bank_account_id', $bankAccountId)
            ->whereBetween('transaction_date', [$from, $to])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->first();
        $closingBalance = $closingLine?->running_balance ?? $openingBalance;

        // System-side: payments received in range
        $systemReceipts = DB::table('fee_payments')
            ->where('school_id', $schoolId)
            ->where('status', 'confirmed')
            ->whereBetween('payment_date', [$from, $to])
            ->sum('amount');

        // System-side: expenses paid in range
        $systemExpenses = DB::table('expenses')
            ->where('school_id', $schoolId)
            ->whereIn('status', ['approved', 'paid'])
            ->whereBetween('expense_date', [$from, $to])
            ->sum('amount');

        $systemNet  = (int) $systemReceipts - (int) $systemExpenses;
        $bankNet    = (int) $totalCredits   - (int) $totalDebits;
        $difference = $bankNet - $systemNet;

        return [
            'account'             => $account,
            'period'              => ['from' => $from, 'to' => $to],
            'opening_balance'     => (int) $openingBalance,
            'total_credits'       => (int) $totalCredits,
            'total_debits'        => (int) $totalDebits,
            'closing_balance'     => (int) $closingBalance,
            'system_receipts'     => (int) $systemReceipts,
            'system_expenses'     => (int) $systemExpenses,
            'system_net'          => $systemNet,
            'bank_net'            => $bankNet,
            'difference'          => $difference,
            'unreconciled_count'  => $unreconciledN,
            'total_lines'         => $lines->count(),
        ];
    }
}
