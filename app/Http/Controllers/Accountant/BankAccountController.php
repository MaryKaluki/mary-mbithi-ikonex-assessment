<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BankAccountController extends Controller
{
    /** GET /api/finance/bank-accounts */
    public function index(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $accounts = DB::table('bank_accounts')
            ->where('school_id', $schoolId)
            ->where('is_active', true)
            ->orderByDesc('is_primary')
            ->orderBy('bank_name')
            ->get()
            ->map(function ($a) {
                // Mask account number for display
                $a->account_number_masked = $a->account_number
                    ? '****' . substr(decrypt($a->account_number), -4)
                    : null;
                unset($a->account_number);
                return $a;
            });

        return response()->json($accounts);
    }

    /** POST /api/finance/bank-accounts */
    public function store(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $data = $request->validate([
            'bank_name'       => 'required|string|max:100',
            'account_name'    => 'required|string|max:150',
            'account_number'  => 'required|string|max:30',
            'branch'          => 'nullable|string|max:100',
            'account_type'    => 'required|in:current,savings,mpesa_paybill',
            'mpesa_shortcode' => 'nullable|string|max:20',
            'is_primary'      => 'sometimes|boolean',
        ]);

        // Only one primary account per school
        if (!empty($data['is_primary'])) {
            DB::table('bank_accounts')
                ->where('school_id', $schoolId)
                ->update(['is_primary' => false]);
        }

        $id = DB::table('bank_accounts')->insertGetId([
            'school_id'       => $schoolId,
            'bank_name'       => $data['bank_name'],
            'account_name'    => $data['account_name'],
            'account_number'  => encrypt($data['account_number']),
            'branch'          => $data['branch'] ?? null,
            'account_type'    => $data['account_type'],
            'mpesa_shortcode' => $data['mpesa_shortcode'] ?? null,
            'current_balance' => 0,
            'is_primary'      => $data['is_primary'] ?? false,
            'is_active'       => true,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        $account = DB::table('bank_accounts')->find($id);
        $account->account_number_masked = '****' . substr($data['account_number'], -4);
        unset($account->account_number);

        return response()->json($account, 201);
    }

    /** PUT /api/finance/bank-accounts/{id} */
    public function update(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;

        $account = DB::table('bank_accounts')
            ->where('id', $id)->where('school_id', $schoolId)->first();
        if (!$account) {
            return response()->json(['message' => 'Account not found.'], 404);
        }

        $data = $request->validate([
            'bank_name'       => 'sometimes|string|max:100',
            'account_name'    => 'sometimes|string|max:150',
            'branch'          => 'nullable|string|max:100',
            'mpesa_shortcode' => 'nullable|string|max:20',
            'is_primary'      => 'sometimes|boolean',
            'is_active'       => 'sometimes|boolean',
        ]);

        if (!empty($data['is_primary'])) {
            DB::table('bank_accounts')
                ->where('school_id', $schoolId)
                ->update(['is_primary' => false]);
        }

        DB::table('bank_accounts')->where('id', $id)->update(
            array_merge($data, ['updated_at' => now()])
        );

        return response()->json(['message' => 'Account updated.']);
    }

    /** DELETE /api/finance/bank-accounts/{id} — soft delete */
    public function destroy(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;

        $account = DB::table('bank_accounts')
            ->where('id', $id)->where('school_id', $schoolId)->first();
        if (!$account) {
            return response()->json(['message' => 'Account not found.'], 404);
        }

        DB::table('bank_accounts')->where('id', $id)
            ->update(['is_active' => false, 'updated_at' => now()]);

        return response()->json(['message' => 'Account deactivated.']);
    }
}
