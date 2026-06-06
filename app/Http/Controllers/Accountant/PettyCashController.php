<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PettyCashController extends Controller
{
    // ─── Accounts ─────────────────────────────────────────────────────────────

    /** GET /api/finance/petty-cash */
    public function index(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $accounts = DB::table('petty_cash_accounts as pca')
            ->leftJoin('users as u', 'u.id', '=', 'pca.custodian_id')
            ->where('pca.school_id', $schoolId)
            ->select([
                'pca.*',
                DB::raw("CONCAT(u.first_name, ' ', u.last_name) as custodian_name"),
            ])
            ->orderBy('pca.name')
            ->get();

        return response()->json($accounts);
    }

    /** POST /api/finance/petty-cash */
    public function storeAccount(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $data = $request->validate([
            'name'         => 'required|string|max:100',
            'custodian_id' => 'nullable|integer',
            'imprest_limit'=> 'nullable|integer|min:0',
        ]);

        $id = DB::table('petty_cash_accounts')->insertGetId([
            'school_id'       => $schoolId,
            'name'            => $data['name'],
            'custodian_id'    => $data['custodian_id'] ?? null,
            'current_balance' => 0,
            'imprest_limit'   => $data['imprest_limit'] ?? 0,
            'is_active'       => true,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        return response()->json(DB::table('petty_cash_accounts')->find($id), 201);
    }

    // ─── Transactions ─────────────────────────────────────────────────────────

    /** GET /api/finance/petty-cash/{accountId}/transactions */
    public function transactions(Request $request, $accountId)
    {
        $schoolId = $request->user()->school_id;

        $account = DB::table('petty_cash_accounts')
            ->where('id', $accountId)->where('school_id', $schoolId)->first();
        if (!$account) {
            return response()->json(['message' => 'Account not found.'], 404);
        }

        $perPage = min((int) $request->input('per_page', 25), 100);
        $page    = max((int) $request->input('page', 1), 1);

        $query = DB::table('petty_cash_transactions as pct')
            ->leftJoin('users as u', 'u.id', '=', 'pct.recorded_by')
            ->where('pct.account_id', $accountId)
            ->select([
                'pct.*',
                DB::raw("CONCAT(u.first_name, ' ', u.last_name) as recorded_by_name"),
            ])
            ->orderBy('pct.transaction_date', 'desc')
            ->orderBy('pct.id', 'desc');

        $total = $query->count();
        $txns  = $query->offset(($page - 1) * $perPage)->limit($perPage)->get();

        return response()->json([
            'account' => $account,
            'data'    => $txns,
            'meta'    => [
                'total'     => $total,
                'per_page'  => $perPage,
                'page'      => $page,
                'last_page' => (int) ceil($total / $perPage),
            ],
        ]);
    }

    /** POST /api/finance/petty-cash/{accountId}/top-up */
    public function topUp(Request $request, $accountId)
    {
        $schoolId = $request->user()->school_id;

        $data = $request->validate([
            'amount'      => 'required|integer|min:1',
            'description' => 'nullable|string|max:255',
            'reference'   => 'nullable|string|max:64',
            'date'        => 'nullable|date',
        ]);

        return DB::transaction(function () use ($data, $accountId, $schoolId, $request) {
            $account = DB::table('petty_cash_accounts')
                ->where('id', $accountId)->where('school_id', $schoolId)
                ->lockForUpdate()->first();
            if (!$account) {
                return response()->json(['message' => 'Account not found.'], 404);
            }

            $newBalance = $account->current_balance + $data['amount'];

            DB::table('petty_cash_accounts')->where('id', $accountId)
                ->update(['current_balance' => $newBalance, 'updated_at' => now()]);

            DB::table('petty_cash_transactions')->insert([
                'school_id'        => $schoolId,
                'account_id'       => $accountId,
                'type'             => 'top_up',
                'amount'           => $data['amount'],
                'description'      => $data['description'] ?? 'Top-up',
                'reference'        => $data['reference'] ?? null,
                'transaction_date' => $data['date'] ?? today(),
                'recorded_by'      => $request->user()->id,
                'balance_after'    => $newBalance,
                'created_at'       => now(),
                'updated_at'       => now(),
            ]);

            return response()->json(['message' => 'Top-up recorded.', 'balance' => $newBalance]);
        });
    }

    /** POST /api/finance/petty-cash/{accountId}/spend */
    public function spend(Request $request, $accountId)
    {
        $schoolId = $request->user()->school_id;

        $data = $request->validate([
            'amount'      => 'required|integer|min:1',
            'description' => 'required|string|max:255',
            'reference'   => 'nullable|string|max:64',
            'expense_id'  => 'nullable|integer',
            'date'        => 'nullable|date',
        ]);

        return DB::transaction(function () use ($data, $accountId, $schoolId, $request) {
            $account = DB::table('petty_cash_accounts')
                ->where('id', $accountId)->where('school_id', $schoolId)
                ->lockForUpdate()->first();
            if (!$account) {
                return response()->json(['message' => 'Account not found.'], 404);
            }
            if ($account->current_balance < $data['amount']) {
                return response()->json(['message' => 'Insufficient petty cash balance.'], 422);
            }

            $newBalance = $account->current_balance - $data['amount'];

            DB::table('petty_cash_accounts')->where('id', $accountId)
                ->update(['current_balance' => $newBalance, 'updated_at' => now()]);

            DB::table('petty_cash_transactions')->insert([
                'school_id'        => $schoolId,
                'account_id'       => $accountId,
                'type'             => 'expense',
                'amount'           => $data['amount'],
                'description'      => $data['description'],
                'reference'        => $data['reference'] ?? null,
                'expense_id'       => $data['expense_id'] ?? null,
                'transaction_date' => $data['date'] ?? today(),
                'recorded_by'      => $request->user()->id,
                'balance_after'    => $newBalance,
                'created_at'       => now(),
                'updated_at'       => now(),
            ]);

            return response()->json(['message' => 'Expense recorded.', 'balance' => $newBalance]);
        });
    }
}
