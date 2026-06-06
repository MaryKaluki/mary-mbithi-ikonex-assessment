<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExpenseController extends Controller
{
    /** GET /api/finance/expenses */
    public function index(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $perPage  = min((int) $request->input('per_page', 25), 100);
        $page     = max((int) $request->input('page', 1), 1);
        $offset   = ($page - 1) * $perPage;

        $query = DB::table('expenses as e')
            ->leftJoin('expense_categories as cat', 'cat.id', '=', 'e.category_id')
            ->leftJoin('users as sub', 'sub.id', '=', 'e.submitted_by')
            ->leftJoin('users as appr', 'appr.id', '=', 'e.approved_by')
            ->where('e.school_id', $schoolId);

        if ($request->filled('status')) {
            $query->where('e.status', $request->input('status'));
        }
        if ($request->filled('category')) {
            $query->where('e.category_id', $request->input('category'));
        }
        if ($request->filled('year')) {
            $query->where('e.academic_year', $request->input('year'));
        }
        if ($request->filled('term')) {
            $query->where('e.term', $request->input('term'));
        }
        if ($request->filled('from')) {
            $query->where('e.expense_date', '>=', $request->input('from'));
        }
        if ($request->filled('to')) {
            $query->where('e.expense_date', '<=', $request->input('to'));
        }

        $total = $query->count();

        $expenses = $query->orderBy('e.expense_date', 'desc')
            ->offset($offset)->limit($perPage)
            ->select([
                'e.*',
                'cat.name as category_name',
                DB::raw("CONCAT(sub.first_name, ' ', sub.last_name) as submitted_by_name"),
                DB::raw("CONCAT(appr.first_name, ' ', appr.last_name) as approved_by_name"),
            ])
            ->get();

        return response()->json([
            'data' => $expenses,
            'meta' => [
                'total'     => $total,
                'per_page'  => $perPage,
                'page'      => $page,
                'last_page' => (int) ceil($total / $perPage),
            ],
        ]);
    }

    /** POST /api/finance/expenses */
    public function store(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $data = $request->validate([
            'description'    => 'required|string|max:255',
            'vendor'         => 'nullable|string|max:150',
            'category_id'    => 'nullable|integer',
            'amount'         => 'required|integer|min:1',
            'payment_method' => 'required|in:cash,mpesa,bank_transfer,cheque',
            'mpesa_code'     => 'nullable|string|max:20',
            'bank_ref'       => 'nullable|string|max:64',
            'cheque_number'  => 'nullable|string|max:32',
            'expense_date'   => 'required|date',
            'academic_year'  => 'nullable|string|max:10',
            'term'           => 'nullable|integer|in:1,2,3',
            'notes'          => 'nullable|string',
        ]);

        $expenseNumber = $this->nextExpenseNumber($schoolId);

        $id = DB::table('expenses')->insertGetId([
            'school_id'      => $schoolId,
            'expense_number' => $expenseNumber,
            'category_id'    => $data['category_id'] ?? null,
            'description'    => $data['description'],
            'vendor'         => $data['vendor'] ?? null,
            'amount'         => $data['amount'],
            'payment_method' => $data['payment_method'],
            'mpesa_code'     => $data['mpesa_code'] ?? null,
            'bank_ref'       => $data['bank_ref'] ?? null,
            'cheque_number'  => $data['cheque_number'] ?? null,
            'expense_date'   => $data['expense_date'],
            'academic_year'  => $data['academic_year'] ?? null,
            'term'           => $data['term'] ?? null,
            'notes'          => $data['notes'] ?? null,
            'status'         => 'pending_approval',
            'submitted_by'   => $request->user()->id,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

        return response()->json(DB::table('expenses')->find($id), 201);
    }

    /** GET /api/finance/expenses/{id} */
    public function show(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;

        $expense = DB::table('expenses as e')
            ->leftJoin('expense_categories as cat', 'cat.id', '=', 'e.category_id')
            ->leftJoin('users as sub', 'sub.id', '=', 'e.submitted_by')
            ->leftJoin('users as appr', 'appr.id', '=', 'e.approved_by')
            ->where('e.id', $id)
            ->where('e.school_id', $schoolId)
            ->select([
                'e.*',
                'cat.name as category_name',
                DB::raw("CONCAT(sub.first_name, ' ', sub.last_name) as submitted_by_name"),
                DB::raw("CONCAT(appr.first_name, ' ', appr.last_name) as approved_by_name"),
            ])
            ->first();

        if (!$expense) {
            return response()->json(['message' => 'Expense not found.'], 404);
        }

        return response()->json($expense);
    }

    /** PATCH /api/finance/expenses/{id}/approve */
    public function approve(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;

        $expense = DB::table('expenses')
            ->where('id', $id)->where('school_id', $schoolId)->first();
        if (!$expense) {
            return response()->json(['message' => 'Expense not found.'], 404);
        }
        if ($expense->status !== 'pending_approval') {
            return response()->json(['message' => 'Only pending expenses can be approved.'], 422);
        }

        DB::table('expenses')->where('id', $id)->update([
            'status'      => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'updated_at'  => now(),
        ]);

        return response()->json(['message' => 'Expense approved.']);
    }

    /** PATCH /api/finance/expenses/{id}/reject */
    public function reject(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;

        $data = $request->validate(['reason' => 'nullable|string|max:255']);

        $expense = DB::table('expenses')
            ->where('id', $id)->where('school_id', $schoolId)->first();
        if (!$expense) {
            return response()->json(['message' => 'Expense not found.'], 404);
        }
        if (!in_array($expense->status, ['pending_approval', 'draft'])) {
            return response()->json(['message' => 'Cannot reject this expense.'], 422);
        }

        DB::table('expenses')->where('id', $id)->update([
            'status'           => 'rejected',
            'approved_by'      => $request->user()->id,
            'approved_at'      => now(),
            'rejection_reason' => $data['reason'] ?? null,
            'updated_at'       => now(),
        ]);

        return response()->json(['message' => 'Expense rejected.']);
    }

    /** PATCH /api/finance/expenses/{id}/pay */
    public function markPaid(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;

        $expense = DB::table('expenses')
            ->where('id', $id)->where('school_id', $schoolId)->first();
        if (!$expense) {
            return response()->json(['message' => 'Expense not found.'], 404);
        }
        if ($expense->status !== 'approved') {
            return response()->json(['message' => 'Only approved expenses can be marked paid.'], 422);
        }

        DB::table('expenses')->where('id', $id)->update([
            'status'     => 'paid',
            'paid_by'    => $request->user()->id,
            'paid_at'    => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Expense marked as paid.']);
    }

    /** DELETE /api/finance/expenses/{id} — only draft expenses */
    public function destroy(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;

        $expense = DB::table('expenses')
            ->where('id', $id)->where('school_id', $schoolId)->first();
        if (!$expense) {
            return response()->json(['message' => 'Expense not found.'], 404);
        }
        if ($expense->status !== 'draft') {
            return response()->json(['message' => 'Only draft expenses can be deleted.'], 422);
        }

        DB::table('expenses')->where('id', $id)->delete();
        return response()->json(['message' => 'Expense deleted.']);
    }

    // ─── Budget vs Actual ──────────────────────────────────────────────────────

    /** GET /api/finance/expenses/budget-vs-actual */
    public function budgetVsActual(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $year     = $request->input('year', date('Y'));
        $month    = $request->input('month'); // optional — null = full year

        $categories = DB::table('expense_categories')
            ->where('school_id', $schoolId)
            ->where('is_active', true)
            ->get();

        $query = DB::table('expenses')
            ->where('school_id', $schoolId)
            ->whereIn('status', ['approved', 'paid'])
            ->whereYear('expense_date', $year);

        if ($month) {
            $query->whereMonth('expense_date', $month);
        }

        $spent = $query->groupBy('category_id')
            ->select('category_id', DB::raw('SUM(amount) as total'))
            ->pluck('total', 'category_id');

        $result = $categories->map(function ($cat) use ($spent, $month) {
            $budget = $month ? $cat->budget_monthly : ($cat->budget_monthly * 12);
            $actual = (int) ($spent[$cat->id] ?? 0);
            return [
                'id'         => $cat->id,
                'name'       => $cat->name,
                'code'       => $cat->code,
                'budget'     => $budget,
                'actual'     => $actual,
                'variance'   => $budget - $actual,
                'pct_used'   => $budget > 0 ? round($actual / $budget * 100, 1) : null,
            ];
        });

        return response()->json($result);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function nextExpenseNumber(string $schoolId): string
    {
        return DB::transaction(function () use ($schoolId) {
            $row = DB::table('finance_counters')
                ->where('school_id', $schoolId)
                ->where('counter_key', 'expense')
                ->lockForUpdate()
                ->first();

            if ($row) {
                $next = $row->last_number + 1;
                DB::table('finance_counters')
                    ->where('id', $row->id)
                    ->update(['last_number' => $next, 'updated_at' => now()]);
            } else {
                $next = 1;
                DB::table('finance_counters')->insert([
                    'school_id'   => $schoolId,
                    'counter_key' => 'expense',
                    'last_number' => $next,
                    'prefix'      => 'EXP',
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]);
            }

            return 'EXP-' . str_pad($next, 5, '0', STR_PAD_LEFT);
        });
    }
}
