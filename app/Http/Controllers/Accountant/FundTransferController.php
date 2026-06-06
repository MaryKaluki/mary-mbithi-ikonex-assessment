<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FundTransferController extends Controller
{
    /** GET /api/finance/fund-transfers */
    public function index(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $query = DB::table('fund_transfer_requests as ftr')
            ->leftJoin('users as req', 'req.id', '=', 'ftr.requested_by')
            ->leftJoin('users as appr', 'appr.id', '=', 'ftr.approved_by')
            ->where('ftr.school_id', $schoolId);

        if ($request->filled('status')) {
            $query->where('ftr.status', $request->input('status'));
        }

        $transfers = $query->orderBy('ftr.created_at', 'desc')
            ->select([
                'ftr.*',
                DB::raw("CONCAT(req.first_name, ' ', req.last_name) as requested_by_name"),
                DB::raw("CONCAT(appr.first_name, ' ', appr.last_name) as approved_by_name"),
            ])
            ->get();

        return response()->json($transfers);
    }

    /** POST /api/finance/fund-transfers */
    public function store(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $data = $request->validate([
            'from_account_name' => 'required|string|max:150',
            'to_account_name'   => 'required|string|max:150',
            'amount'            => 'required|integer|min:1',
            'reason'            => 'nullable|string|max:255',
            'notes'             => 'nullable|string',
        ]);

        // Generate reference
        $ref = 'TRF-' . strtoupper(substr(uniqid(), -6));

        $id = DB::table('fund_transfer_requests')->insertGetId([
            'school_id'         => $schoolId,
            'reference'         => $ref,
            'from_account_name' => $data['from_account_name'],
            'to_account_name'   => $data['to_account_name'],
            'amount'            => $data['amount'],
            'reason'            => $data['reason'] ?? null,
            'notes'             => $data['notes'] ?? null,
            'status'            => 'pending',
            'requested_by'      => $request->user()->id,
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);

        return response()->json(DB::table('fund_transfer_requests')->find($id), 201);
    }

    /** PATCH /api/finance/fund-transfers/{id}/approve */
    public function approve(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;

        $transfer = DB::table('fund_transfer_requests')
            ->where('id', $id)->where('school_id', $schoolId)->first();
        if (!$transfer) {
            return response()->json(['message' => 'Transfer not found.'], 404);
        }
        if ($transfer->status !== 'pending') {
            return response()->json(['message' => 'Only pending transfers can be approved.'], 422);
        }

        DB::table('fund_transfer_requests')->where('id', $id)->update([
            'status'      => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'updated_at'  => now(),
        ]);

        return response()->json(['message' => 'Transfer approved.']);
    }

    /** PATCH /api/finance/fund-transfers/{id}/execute */
    public function execute(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;

        $data = $request->validate(['transfer_date' => 'nullable|date']);

        $transfer = DB::table('fund_transfer_requests')
            ->where('id', $id)->where('school_id', $schoolId)->first();
        if (!$transfer) {
            return response()->json(['message' => 'Transfer not found.'], 404);
        }
        if ($transfer->status !== 'approved') {
            return response()->json(['message' => 'Transfer must be approved before execution.'], 422);
        }

        DB::table('fund_transfer_requests')->where('id', $id)->update([
            'status'        => 'executed',
            'executed_at'   => now(),
            'transfer_date' => $data['transfer_date'] ?? today()->toDateString(),
            'updated_at'    => now(),
        ]);

        return response()->json(['message' => 'Transfer executed.']);
    }

    /** PATCH /api/finance/fund-transfers/{id}/reject */
    public function reject(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;
        $data = $request->validate(['reason' => 'nullable|string|max:255']);

        $transfer = DB::table('fund_transfer_requests')
            ->where('id', $id)->where('school_id', $schoolId)->first();
        if (!$transfer) {
            return response()->json(['message' => 'Transfer not found.'], 404);
        }
        if (!in_array($transfer->status, ['pending', 'approved'])) {
            return response()->json(['message' => 'Cannot reject this transfer.'], 422);
        }

        DB::table('fund_transfer_requests')->where('id', $id)->update([
            'status'           => 'rejected',
            'rejection_reason' => $data['reason'] ?? null,
            'updated_at'       => now(),
        ]);

        return response()->json(['message' => 'Transfer rejected.']);
    }
}
