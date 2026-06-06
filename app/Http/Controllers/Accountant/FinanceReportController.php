<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinanceReportController extends Controller
{
    // ─── 1. Daily Collection Report ──────────────────────────────────────────

    /**
     * GET /api/finance/reports/daily-collection
     * Params: date (YYYY-MM-DD), cashier_id (optional)
     */
    public function dailyCollection(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $date     = $request->input('date', today()->toDateString());

        $query = DB::table('fee_receipts as fr')
            ->join('fee_payments as fp', 'fp.id', '=', 'fr.payment_id')
            ->join('student_fee_invoices as inv', 'inv.id', '=', 'fp.invoice_id')
            ->join('students as s', 's.id', '=', 'inv.student_id')
            ->leftJoin('users as cashier', 'cashier.id', '=', 'fr.issued_by')
            ->where('fr.school_id', $schoolId)
            ->where('fp.payment_date', $date)
            ->where('fp.status', 'confirmed');

        if ($request->filled('cashier_id')) {
            $query->where('fr.issued_by', $request->input('cashier_id'));
        }

        $receipts = $query->select([
            'fr.id',
            'fr.receipt_number',
            'fp.payment_date',
            'fp.payment_method',
            'fp.amount',
            'fp.mpesa_code',
            'fp.bank_ref',
            'fp.cheque_number',
            's.first_name', 's.last_name', 's.admission_number',
            DB::raw("CONCAT(cashier.first_name, ' ', cashier.last_name) as cashier_name"),
        ])
        ->orderBy('fr.created_at')
        ->get();

        // Group by payment method
        $byMethod = $receipts->groupBy('payment_method')->map(fn($g) => [
            'count'  => $g->count(),
            'amount' => $g->sum('amount'),
        ]);

        return response()->json([
            'date'      => $date,
            'receipts'  => $receipts,
            'summary'   => [
                'total_receipts' => $receipts->count(),
                'total_amount'   => $receipts->sum('amount'),
                'by_method'      => $byMethod,
            ],
        ]);
    }

    // ─── 2. Receipts Register ────────────────────────────────────────────────

    /**
     * GET /api/finance/reports/receipts-register
     * Params: from, to, method, per_page, page
     */
    public function receiptsRegister(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $perPage  = min((int) $request->input('per_page', 50), 200);
        $page     = max((int) $request->input('page', 1), 1);

        $from = $request->input('from', today()->startOfMonth()->toDateString());
        $to   = $request->input('to',   today()->toDateString());

        $query = DB::table('fee_receipts as fr')
            ->join('fee_payments as fp', 'fp.id', '=', 'fr.payment_id')
            ->join('student_fee_invoices as inv', 'inv.id', '=', 'fp.invoice_id')
            ->join('students as s', 's.id', '=', 'inv.student_id')
            ->leftJoin('users as cashier', 'cashier.id', '=', 'fr.issued_by')
            ->where('fr.school_id', $schoolId)
            ->where('fp.status', 'confirmed')
            ->whereBetween('fp.payment_date', [$from, $to]);

        if ($request->filled('method')) {
            $query->where('fp.payment_method', $request->input('method'));
        }

        $total = $query->count();

        $receipts = $query->select([
            'fr.id', 'fr.receipt_number', 'fp.payment_date', 'fp.payment_method',
            'fp.amount', 'fp.mpesa_code', 'fp.bank_ref', 'fp.cheque_number',
            's.first_name', 's.last_name', 's.admission_number',
            'inv.invoice_number',
            DB::raw("CONCAT(cashier.first_name, ' ', cashier.last_name) as cashier_name"),
        ])
        ->orderBy('fp.payment_date', 'desc')
        ->offset(($page - 1) * $perPage)
        ->limit($perPage)
        ->get();

        return response()->json([
            'data' => $receipts,
            'meta' => [
                'total'        => $total,
                'per_page'     => $perPage,
                'page'         => $page,
                'last_page'    => (int) ceil($total / $perPage),
                'total_amount' => $query->sum('fp.amount'),
            ],
        ]);
    }

    // ─── 3. Outstanding Balances ─────────────────────────────────────────────

    /**
     * GET /api/finance/reports/outstanding-balances
     * Params: academic_year, term, class_id, grade_level
     */
    public function outstandingBalances(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $query = DB::table('student_fee_invoices as inv')
            ->join('students as s', 's.id', '=', 'inv.student_id')
            ->leftJoin('classes as cl', 'cl.id', '=', 's.class_id')
            ->where('inv.school_id', $schoolId)
            ->whereIn('inv.status', ['issued', 'partial'])
            ->whereRaw('inv.balance_due > 0');

        if ($request->filled('academic_year')) {
            $query->where('inv.academic_year', $request->input('academic_year'));
        }
        if ($request->filled('term')) {
            $query->where('inv.term', $request->input('term'));
        }
        if ($request->filled('class_id')) {
            $query->where('s.class_id', $request->input('class_id'));
        }
        if ($request->filled('grade_level')) {
            $query->where('s.grade_level', $request->input('grade_level'));
        }

        $rows = $query->select([
            's.id as student_id',
            's.first_name', 's.last_name', 's.admission_number',
            'cl.name as class_name',
            DB::raw('SUM(inv.total_amount) as total_invoiced'),
            DB::raw('SUM(inv.amount_paid) as total_paid'),
            DB::raw('SUM(inv.balance_due) as balance_due'),
            DB::raw('COUNT(inv.id) as invoice_count'),
        ])
        ->groupBy('s.id', 's.first_name', 's.last_name', 's.admission_number', 'cl.name')
        ->orderBy('balance_due', 'desc')
        ->get();

        return response()->json([
            'data'    => $rows,
            'summary' => [
                'student_count'   => $rows->count(),
                'total_invoiced'  => $rows->sum('total_invoiced'),
                'total_collected' => $rows->sum('total_paid'),
                'total_balance'   => $rows->sum('balance_due'),
            ],
        ]);
    }

    // ─── 4. Defaulters List ──────────────────────────────────────────────────

    /**
     * GET /api/finance/reports/defaulters
     * Params: academic_year, term, min_balance (default 1), class_id
     */
    public function defaulters(Request $request)
    {
        $schoolId   = $request->user()->school_id;
        $minBalance = (int) $request->input('min_balance', 1);

        $query = DB::table('student_fee_invoices as inv')
            ->join('students as s', 's.id', '=', 'inv.student_id')
            ->leftJoin('classes as cl', 'cl.id', '=', 's.class_id')
            ->where('inv.school_id', $schoolId)
            ->whereIn('inv.status', ['issued', 'partial'])
            ->whereRaw('inv.balance_due >= ?', [$minBalance]);

        if ($request->filled('academic_year')) {
            $query->where('inv.academic_year', $request->input('academic_year'));
        }
        if ($request->filled('term')) {
            $query->where('inv.term', $request->input('term'));
        }
        if ($request->filled('class_id')) {
            $query->where('s.class_id', $request->input('class_id'));
        }

        $rows = $query->select([
            's.id as student_id',
            's.first_name', 's.last_name', 's.admission_number',
            's.parent_phone',
            'cl.name as class_name',
            DB::raw('SUM(inv.total_amount) as total_invoiced'),
            DB::raw('SUM(inv.amount_paid) as total_paid'),
            DB::raw('SUM(inv.balance_due) as balance_due'),
            DB::raw('MIN(inv.due_date) as earliest_due'),
        ])
        ->groupBy('s.id', 's.first_name', 's.last_name', 's.admission_number', 's.parent_phone', 'cl.name')
        ->having('balance_due', '>=', $minBalance)
        ->orderBy('balance_due', 'desc')
        ->get();

        return response()->json([
            'data'    => $rows,
            'summary' => [
                'count'         => $rows->count(),
                'total_balance' => $rows->sum('balance_due'),
            ],
        ]);
    }

    // ─── 5. Collection Summary ───────────────────────────────────────────────

    /**
     * GET /api/finance/reports/collection-summary
     * Params: academic_year, term
     */
    public function collectionSummary(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $year     = $request->input('academic_year', date('Y'));
        $term     = $request->input('term');

        $invQuery = DB::table('student_fee_invoices')
            ->where('school_id', $schoolId)
            ->where('academic_year', $year);
        if ($term) $invQuery->where('term', $term);

        $invoiceSummary = $invQuery->select([
            DB::raw('COUNT(*) as invoice_count'),
            DB::raw('SUM(total_amount) as total_billed'),
            DB::raw('SUM(amount_paid) as total_collected'),
            DB::raw('SUM(balance_due) as total_outstanding'),
            DB::raw('COUNT(DISTINCT student_id) as students_billed'),
        ])->first();

        // By payment method
        $payQuery = DB::table('fee_payments as fp')
            ->join('student_fee_invoices as inv', 'inv.id', '=', 'fp.invoice_id')
            ->where('fp.school_id', $schoolId)
            ->where('inv.academic_year', $year)
            ->where('fp.status', 'confirmed');
        if ($term) $payQuery->where('inv.term', $term);

        $byMethod = $payQuery->groupBy('fp.payment_method')
            ->select('fp.payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(fp.amount) as amount'))
            ->get();

        // By class
        $byClass = $invQuery->clone()
            ->join('students as s', 's.id', '=', 'student_fee_invoices.student_id')
            ->leftJoin('classes as cl', 'cl.id', '=', 's.class_id')
            ->groupBy('cl.id', 'cl.name')
            ->select([
                'cl.name as class_name',
                DB::raw('SUM(student_fee_invoices.total_amount) as billed'),
                DB::raw('SUM(student_fee_invoices.amount_paid) as collected'),
                DB::raw('SUM(student_fee_invoices.balance_due) as outstanding'),
            ])
            ->orderBy('cl.name')
            ->get();

        return response()->json([
            'period'   => ['academic_year' => $year, 'term' => $term],
            'summary'  => $invoiceSummary,
            'by_method'=> $byMethod,
            'by_class' => $byClass,
        ]);
    }

    // ─── 6. Income Statement ─────────────────────────────────────────────────

    /**
     * GET /api/finance/reports/income-statement
     * Params: from, to
     */
    public function incomeStatement(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $from     = $request->input('from', today()->startOfYear()->toDateString());
        $to       = $request->input('to',   today()->toDateString());

        // Income = confirmed payments in period
        $income = DB::table('fee_payments')
            ->where('school_id', $schoolId)
            ->where('status', 'confirmed')
            ->whereBetween('payment_date', [$from, $to])
            ->select([
                DB::raw('SUM(amount) as total'),
                DB::raw('COUNT(*) as count'),
            ])->first();

        // Expenditure = approved/paid expenses in period
        $expensesByCategory = DB::table('expenses as e')
            ->leftJoin('expense_categories as cat', 'cat.id', '=', 'e.category_id')
            ->where('e.school_id', $schoolId)
            ->whereIn('e.status', ['approved', 'paid'])
            ->whereBetween('e.expense_date', [$from, $to])
            ->groupBy('cat.id', 'cat.name')
            ->select([
                'cat.name as category',
                DB::raw('SUM(e.amount) as amount'),
                DB::raw('COUNT(*) as count'),
            ])
            ->orderBy('amount', 'desc')
            ->get();

        $totalExpenses = $expensesByCategory->sum('amount');
        $netSurplus    = (int) ($income->total ?? 0) - (int) $totalExpenses;

        return response()->json([
            'period'           => ['from' => $from, 'to' => $to],
            'total_income'     => (int) ($income->total ?? 0),
            'income_count'     => (int) ($income->count ?? 0),
            'total_expenses'   => (int) $totalExpenses,
            'net_surplus'      => $netSurplus,
            'expense_by_category' => $expensesByCategory,
        ]);
    }

    // ─── 7. Budget vs Actual ─────────────────────────────────────────────────

    /**
     * GET /api/finance/reports/budget-vs-actual
     * Delegates to ExpenseController::budgetVsActual logic
     */
    public function budgetVsActual(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $year     = $request->input('year', date('Y'));
        $month    = $request->input('month');

        $categories = DB::table('expense_categories')
            ->where('school_id', $schoolId)
            ->where('is_active', true)
            ->get();

        $query = DB::table('expenses')
            ->where('school_id', $schoolId)
            ->whereIn('status', ['approved', 'paid'])
            ->whereYear('expense_date', $year);
        if ($month) $query->whereMonth('expense_date', $month);

        $spent = $query->groupBy('category_id')
            ->select('category_id', DB::raw('SUM(amount) as total'))
            ->pluck('total', 'category_id');

        $rows = $categories->map(function ($cat) use ($spent, $month) {
            $budget = $month ? $cat->budget_monthly : ($cat->budget_monthly * 12);
            $actual = (int) ($spent[$cat->id] ?? 0);
            return [
                'id'       => $cat->id,
                'name'     => $cat->name,
                'code'     => $cat->code,
                'budget'   => (int) $budget,
                'actual'   => $actual,
                'variance' => (int) $budget - $actual,
                'pct_used' => $budget > 0 ? round($actual / $budget * 100, 1) : null,
                'status'   => $budget > 0
                    ? ($actual > $budget ? 'over' : ($actual > $budget * 0.9 ? 'warning' : 'ok'))
                    : 'no_budget',
            ];
        });

        return response()->json([
            'period'   => ['year' => $year, 'month' => $month],
            'data'     => $rows,
            'summary'  => [
                'total_budget' => $rows->sum('budget'),
                'total_actual' => $rows->sum('actual'),
                'over_budget'  => $rows->where('status', 'over')->count(),
            ],
        ]);
    }

    // ─── 8. Bank Reconciliation Statement ────────────────────────────────────

    /**
     * GET /api/finance/reports/bank-reconciliation
     * Params: bank_account_id, from, to
     */
    public function bankReconciliation(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $bankAccountId = $request->input('bank_account_id');
        $from          = $request->input('from', today()->startOfMonth()->toDateString());
        $to            = $request->input('to',   today()->toDateString());

        if (!$bankAccountId) {
            // Return list of accounts if none specified
            $accounts = DB::table('bank_accounts')
                ->where('school_id', $schoolId)->where('is_active', true)->get();
            return response()->json(['accounts' => $accounts]);
        }

        $recon = app(\App\Services\Finance\BankReconciliationService::class);
        $summary = $recon->summary((int) $bankAccountId, $schoolId, $from, $to);

        return response()->json($summary);
    }

    // ─── 9. Petty Cash Report ────────────────────────────────────────────────

    /**
     * GET /api/finance/reports/petty-cash
     * Params: account_id, from, to
     */
    public function pettyCash(Request $request)
    {
        $schoolId  = $request->user()->school_id;
        $accountId = $request->input('account_id');
        $from      = $request->input('from', today()->startOfMonth()->toDateString());
        $to        = $request->input('to',   today()->toDateString());

        $accounts = DB::table('petty_cash_accounts')
            ->where('school_id', $schoolId)->where('is_active', true)->get();

        $query = DB::table('petty_cash_transactions as pct')
            ->join('petty_cash_accounts as pca', 'pca.id', '=', 'pct.account_id')
            ->leftJoin('users as u', 'u.id', '=', 'pct.recorded_by')
            ->where('pct.school_id', $schoolId)
            ->whereBetween('pct.transaction_date', [$from, $to]);

        if ($accountId) $query->where('pct.account_id', $accountId);

        $transactions = $query->select([
            'pct.*',
            'pca.name as account_name',
            DB::raw("CONCAT(u.first_name, ' ', u.last_name) as recorded_by_name"),
        ])->orderBy('pct.transaction_date')->orderBy('pct.id')->get();

        $topUps   = $transactions->where('type', 'top_up')->sum('amount');
        $expenses = $transactions->where('type', 'expense')->sum('amount');
        $reimbursements = $transactions->where('type', 'reimbursement')->sum('amount');

        return response()->json([
            'period'         => ['from' => $from, 'to' => $to],
            'accounts'       => $accounts,
            'transactions'   => $transactions,
            'summary'        => [
                'top_ups'        => (int) $topUps,
                'expenses'       => (int) $expenses,
                'reimbursements' => (int) $reimbursements,
                'net_movement'   => (int) $topUps - (int) $expenses + (int) $reimbursements,
            ],
        ]);
    }

    // ─── 10. M-Pesa Transaction Report ───────────────────────────────────────

    /**
     * GET /api/finance/reports/mpesa-transactions
     * Params: from, to, matched (boolean)
     */
    public function mpesaTransactions(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $from     = $request->input('from', today()->startOfMonth()->toDateString());
        $to       = $request->input('to',   today()->toDateString());

        $query = DB::table('mpesa_transactions as mt')
            ->leftJoin('student_fee_invoices as inv', 'inv.id', '=', 'mt.matched_invoice_id')
            ->leftJoin('students as s', 's.id', '=', 'inv.student_id')
            ->where('mt.school_id', $schoolId)
            ->whereDate('mt.transaction_date', '>=', $from)
            ->whereDate('mt.transaction_date', '<=', $to);

        if ($request->filled('matched')) {
            $query->where('mt.is_matched', (bool) $request->input('matched'));
        }

        $rows = $query->select([
            'mt.id', 'mt.mpesa_receipt_number', 'mt.transaction_type',
            'mt.amount', 'mt.account_reference', 'mt.transaction_date',
            'mt.is_matched', 'mt.match_method',
            DB::raw("CONCAT(s.first_name, ' ', s.last_name) as student_name"),
        ])
        ->orderBy('mt.transaction_date', 'desc')
        ->get();

        return response()->json([
            'data'    => $rows,
            'summary' => [
                'total'      => $rows->count(),
                'matched'    => $rows->where('is_matched', true)->count(),
                'unmatched'  => $rows->where('is_matched', false)->count(),
                'total_amount' => $rows->sum('amount'),
            ],
        ]);
    }

    // ─── 11. Expense Ledger ──────────────────────────────────────────────────

    /**
     * GET /api/finance/reports/expense-ledger
     * Params: from, to, category_id, status
     */
    public function expenseLedger(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $from     = $request->input('from', today()->startOfMonth()->toDateString());
        $to       = $request->input('to',   today()->toDateString());

        $query = DB::table('expenses as e')
            ->leftJoin('expense_categories as cat', 'cat.id', '=', 'e.category_id')
            ->leftJoin('users as sub', 'sub.id', '=', 'e.submitted_by')
            ->where('e.school_id', $schoolId)
            ->whereBetween('e.expense_date', [$from, $to]);

        if ($request->filled('category_id')) {
            $query->where('e.category_id', $request->input('category_id'));
        }
        if ($request->filled('status')) {
            $query->where('e.status', $request->input('status'));
        }

        $expenses = $query->select([
            'e.*',
            'cat.name as category_name',
            DB::raw("CONCAT(sub.first_name, ' ', sub.last_name) as submitted_by_name"),
        ])->orderBy('e.expense_date')->orderBy('e.id')->get();

        $byCategory = $expenses->groupBy('category_name')->map(fn($g) => [
            'count'  => $g->count(),
            'amount' => $g->sum('amount'),
        ]);

        return response()->json([
            'period'      => ['from' => $from, 'to' => $to],
            'data'        => $expenses,
            'by_category' => $byCategory,
            'summary'     => [
                'count'  => $expenses->count(),
                'amount' => $expenses->sum('amount'),
            ],
        ]);
    }

    // ─── 12. Student Statement ───────────────────────────────────────────────

    /**
     * GET /api/finance/reports/student-statement/{studentId}
     * Params: academic_year, term
     */
    public function studentStatement(Request $request, $studentId)
    {
        $schoolId = $request->user()->school_id;

        $student = DB::table('students')
            ->where('id', $studentId)->where('school_id', $schoolId)->first();
        if (!$student) {
            return response()->json(['message' => 'Student not found.'], 404);
        }

        $invQuery = DB::table('student_fee_invoices')
            ->where('student_id', $studentId)
            ->where('school_id', $schoolId);

        if ($request->filled('academic_year')) {
            $invQuery->where('academic_year', $request->input('academic_year'));
        }
        if ($request->filled('term')) {
            $invQuery->where('term', $request->input('term'));
        }

        $invoices = $invQuery->orderBy('created_at')->get();

        // Payments per invoice
        $invoiceIds = $invoices->pluck('id');
        $payments = DB::table('fee_payments as fp')
            ->leftJoin('fee_receipts as fr', 'fr.payment_id', '=', 'fp.id')
            ->whereIn('fp.invoice_id', $invoiceIds)
            ->where('fp.status', 'confirmed')
            ->select(['fp.*', 'fr.receipt_number'])
            ->orderBy('fp.payment_date')
            ->get()
            ->groupBy('invoice_id');

        $invoices = $invoices->map(function ($inv) use ($payments) {
            $inv->payments = $payments[$inv->id] ?? collect();
            return $inv;
        });

        $totalBilled    = $invoices->sum('total_amount');
        $totalPaid      = $invoices->sum('amount_paid');
        $totalBalance   = $invoices->sum('balance_due');

        return response()->json([
            'student'       => $student,
            'invoices'      => $invoices,
            'summary'       => [
                'total_billed'  => (int) $totalBilled,
                'total_paid'    => (int) $totalPaid,
                'balance_due'   => (int) $totalBalance,
            ],
        ]);
    }

    // ─── 13. Arrears Ageing Analysis ─────────────────────────────────────────

    /**
     * GET /api/finance/reports/arrears-ageing
     * Params: as_of (date), class_id
     * Buckets: current (< 30 days), 30–60, 61–90, 91–120, 120+
     */
    public function arrearsAgeing(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $asOf     = $request->input('as_of', today()->toDateString());

        $query = DB::table('student_fee_invoices as inv')
            ->join('students as s', 's.id', '=', 'inv.student_id')
            ->leftJoin('classes as cl', 'cl.id', '=', 's.class_id')
            ->where('inv.school_id', $schoolId)
            ->whereIn('inv.status', ['issued', 'partial'])
            ->whereRaw('inv.balance_due > 0')
            ->whereNotNull('inv.due_date');

        if ($request->filled('class_id')) {
            $query->where('s.class_id', $request->input('class_id'));
        }

        $invoices = $query->select([
            's.id as student_id',
            's.first_name', 's.last_name', 's.admission_number',
            'cl.name as class_name',
            'inv.id as invoice_id', 'inv.invoice_number',
            'inv.due_date', 'inv.balance_due',
        ])->get();

        $buckets = ['current' => [], '30' => [], '60' => [], '90' => [], '120' => []];
        $asOfTs  = strtotime($asOf);

        foreach ($invoices as $inv) {
            $days = (int) floor(($asOfTs - strtotime($inv->due_date)) / 86400);
            if      ($days <= 0)   $bucket = 'current';
            elseif  ($days <= 30)  $bucket = '30';
            elseif  ($days <= 60)  $bucket = '60';
            elseif  ($days <= 90)  $bucket = '90';
            else                   $bucket = '120';

            $inv->days_overdue = max(0, $days);
            $buckets[$bucket][] = $inv;
        }

        $summary = collect($buckets)->map(fn($rows) => [
            'count'  => count($rows),
            'amount' => array_sum(array_column($rows, 'balance_due')),
        ]);

        return response()->json([
            'as_of'   => $asOf,
            'buckets' => $buckets,
            'summary' => $summary,
            'total'   => [
                'count'  => $invoices->count(),
                'amount' => $invoices->sum('balance_due'),
            ],
        ]);
    }

    // ─── 14. Annual Finance Summary ──────────────────────────────────────────

    /**
     * GET /api/finance/reports/annual-summary
     * Params: year
     */
    public function annualSummary(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $year     = $request->input('year', date('Y'));

        // Monthly income breakdown
        $monthlyIncome = DB::table('fee_payments')
            ->where('school_id', $schoolId)
            ->where('status', 'confirmed')
            ->whereYear('payment_date', $year)
            ->groupBy(DB::raw("DATE_FORMAT(payment_date, '%Y-%m')"))
            ->select([
                DB::raw("DATE_FORMAT(payment_date, '%Y-%m') as month"),
                DB::raw('SUM(amount) as income'),
                DB::raw('COUNT(*) as transactions'),
            ])
            ->orderBy('month')
            ->get();

        // Monthly expenses
        $monthlyExpenses = DB::table('expenses')
            ->where('school_id', $schoolId)
            ->whereIn('status', ['approved', 'paid'])
            ->whereYear('expense_date', $year)
            ->groupBy(DB::raw("DATE_FORMAT(expense_date, '%Y-%m')"))
            ->select([
                DB::raw("DATE_FORMAT(expense_date, '%Y-%m') as month"),
                DB::raw('SUM(amount) as expenses'),
            ])
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        // Merge into 12-month series
        $months = [];
        for ($m = 1; $m <= 12; $m++) {
            $key = $year . '-' . str_pad($m, 2, '0', STR_PAD_LEFT);
            $inc = $monthlyIncome->firstWhere('month', $key);
            $months[] = [
                'month'        => $key,
                'income'       => (int) ($inc->income ?? 0),
                'expenses'     => (int) ($monthlyExpenses[$key]->expenses ?? 0),
                'surplus'      => (int) ($inc->income ?? 0) - (int) ($monthlyExpenses[$key]->expenses ?? 0),
                'transactions' => (int) ($inc->transactions ?? 0),
            ];
        }

        // Per-term breakdown
        $termIncome = DB::table('fee_payments as fp')
            ->join('student_fee_invoices as inv', 'inv.id', '=', 'fp.invoice_id')
            ->where('fp.school_id', $schoolId)
            ->where('fp.status', 'confirmed')
            ->where('inv.academic_year', $year)
            ->groupBy('inv.term')
            ->select('inv.term', DB::raw('SUM(fp.amount) as income'))
            ->get()->keyBy('term');

        $termExpenses = DB::table('expenses')
            ->where('school_id', $schoolId)
            ->whereIn('status', ['approved', 'paid'])
            ->where('academic_year', $year)
            ->groupBy('term')
            ->select('term', DB::raw('SUM(amount) as expenses'))
            ->get()->keyBy('term');

        $byTerm = collect([1, 2, 3])->map(fn($t) => [
            'term'     => $t,
            'income'   => (int) ($termIncome[$t]->income ?? 0),
            'expenses' => (int) ($termExpenses[$t]->expenses ?? 0),
        ]);

        $totalIncome   = collect($months)->sum('income');
        $totalExpenses = collect($months)->sum('expenses');

        return response()->json([
            'year'          => $year,
            'monthly_series'=> $months,
            'by_term'       => $byTerm,
            'totals'        => [
                'income'    => (int) $totalIncome,
                'expenses'  => (int) $totalExpenses,
                'surplus'   => (int) $totalIncome - (int) $totalExpenses,
            ],
        ]);
    }

    // ─── Export (CSV) ─────────────────────────────────────────────────────────

    /**
     * GET /api/finance/reports/{type}/export
     * Streams a CSV download for any report type.
     */
    public function export(Request $request, string $type)
    {
        // Re-use the same report method to get data
        $data = $this->getReportData($request, $type);
        if (!$data) {
            return response()->json(['message' => "Unknown report type: {$type}"], 404);
        }

        $filename = "ikonex-{$type}-" . date('Y-m-d') . '.csv';
        $rows     = $data['rows'];
        $headers  = $data['headers'];

        return response()->streamDownload(function () use ($rows, $headers) {
            $fp = fopen('php://output', 'w');
            fputcsv($fp, $headers);
            foreach ($rows as $row) {
                fputcsv($fp, $row);
            }
            fclose($fp);
        }, $filename, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    // ─── PDF ─────────────────────────────────────────────────────────────────

    /**
     * GET /api/finance/reports/{type}/pdf
     */
    public function pdf(Request $request, string $type)
    {
        $data = $this->getReportData($request, $type);
        if (!$data) {
            return response()->json(['message' => "Unknown report type: {$type}"], 404);
        }

        $schoolId = $request->user()->school_id;
        $school   = DB::table('schools')->find($schoolId);

        $html = view('reports.finance.' . str_replace('-', '_', $type), [
            'data'   => $data,
            'school' => $school,
            'params' => $request->all(),
            'date'   => now()->format('d M Y'),
        ])->render();

        $pdf = app('dompdf.wrapper');
        $pdf->loadHTML($html);
        $pdf->setPaper('A4', 'portrait');

        $filename = "ikonex-{$type}-" . date('Y-m-d') . '.pdf';

        // Log the report generation
        DB::table('financial_reports')->insert([
            'school_id'    => $schoolId,
            'report_type'  => $type,
            'parameters'   => json_encode($request->except(['_token'])),
            'generated_by' => $request->user()->id,
            'generated_at' => now(),
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        return $pdf->download($filename);
    }

    // ─── Helper: get report data for export/pdf ───────────────────────────────

    private function getReportData(Request $request, string $type): ?array
    {
        $methods = [
            'daily-collection'     => 'dailyCollection',
            'receipts-register'    => 'receiptsRegister',
            'outstanding-balances' => 'outstandingBalances',
            'defaulters'           => 'defaulters',
            'collection-summary'   => 'collectionSummary',
            'income-statement'     => 'incomeStatement',
            'budget-vs-actual'     => 'budgetVsActual',
            'petty-cash'           => 'pettyCash',
            'mpesa-transactions'   => 'mpesaTransactions',
            'expense-ledger'       => 'expenseLedger',
            'arrears-ageing'       => 'arrearsAgeing',
            'annual-summary'       => 'annualSummary',
        ];

        if (!isset($methods[$type])) return null;

        // Get the JSON response data
        $response = $this->{$methods[$type]}($request);
        $json     = json_decode($response->content(), true);

        // Build flat CSV rows depending on report type
        return $this->flattenForExport($type, $json);
    }

    private function flattenForExport(string $type, array $json): array
    {
        switch ($type) {
            case 'daily-collection':
            case 'receipts-register':
                return [
                    'headers' => ['Receipt No', 'Date', 'Student', 'Admission', 'Method', 'Amount', 'Ref'],
                    'rows'    => collect($json['receipts'] ?? $json['data'] ?? [])->map(fn($r) => [
                        $r['receipt_number'] ?? '', $r['payment_date'] ?? '',
                        ($r['first_name'] ?? '') . ' ' . ($r['last_name'] ?? ''),
                        $r['admission_number'] ?? '', $r['payment_method'] ?? '',
                        $r['amount'] ?? 0,
                        $r['mpesa_code'] ?? $r['bank_ref'] ?? $r['cheque_number'] ?? '',
                    ])->toArray(),
                ];
            case 'outstanding-balances':
            case 'defaulters':
                return [
                    'headers' => ['Student', 'Admission', 'Class', 'Invoiced', 'Paid', 'Balance'],
                    'rows'    => collect($json['data'] ?? [])->map(fn($r) => [
                        ($r['first_name'] ?? '') . ' ' . ($r['last_name'] ?? ''),
                        $r['admission_number'] ?? '', $r['class_name'] ?? '',
                        $r['total_invoiced'] ?? 0, $r['total_paid'] ?? 0, $r['balance_due'] ?? 0,
                    ])->toArray(),
                ];
            case 'expense-ledger':
                return [
                    'headers' => ['Expense No', 'Date', 'Category', 'Description', 'Vendor', 'Amount', 'Status'],
                    'rows'    => collect($json['data'] ?? [])->map(fn($r) => [
                        $r['expense_number'] ?? '', $r['expense_date'] ?? '',
                        $r['category_name'] ?? 'Uncategorised', $r['description'] ?? '',
                        $r['vendor'] ?? '', $r['amount'] ?? 0, $r['status'] ?? '',
                    ])->toArray(),
                ];
            case 'mpesa-transactions':
                return [
                    'headers' => ['Receipt', 'Type', 'Date', 'Account Ref', 'Amount', 'Matched', 'Student'],
                    'rows'    => collect($json['data'] ?? [])->map(fn($r) => [
                        $r['mpesa_receipt_number'] ?? '', $r['transaction_type'] ?? '',
                        $r['transaction_date'] ?? '', $r['account_reference'] ?? '',
                        $r['amount'] ?? 0,
                        ($r['is_matched'] ?? false) ? 'Yes' : 'No',
                        $r['student_name'] ?? '',
                    ])->toArray(),
                ];
            default:
                return [
                    'headers' => ['Data'],
                    'rows'    => [[ json_encode($json) ]],
                ];
        }
    }
}
