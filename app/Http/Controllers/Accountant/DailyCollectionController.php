<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DailyCollectionController extends Controller
{
    /**
     * GET /api/finance/daily-collection
     * Returns cash/M-Pesa/bank/cheque collection summary for a date or date range.
     */
    public function index(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $date     = $request->get('date', now()->toDateString());
        $from     = $request->get('from', $date);
        $to       = $request->get('to', $date);

        $rows = DB::table('fee_payments')
            ->where('school_id', $schoolId)
            ->whereBetween('payment_date', [$from, $to])
            ->where('status', 'confirmed')
            ->whereNull('deleted_at')
            ->select('payment_method', DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('payment_method')
            ->get()
            ->keyBy('payment_method');

        $methods  = ['cash', 'mpesa', 'bank_transfer', 'cheque', 'standing_order', 'card'];
        $breakdown = [];
        $grandTotal = 0;

        foreach ($methods as $method) {
            $row = $rows->get($method);
            $breakdown[$method] = [
                'total' => $row ? (int) $row->total : 0,
                'count' => $row ? (int) $row->count : 0,
            ];
            $grandTotal += $breakdown[$method]['total'];
        }

        // Timeline: per-hour totals for today (if single day)
        $timeline = [];
        if ($from === $to) {
            $timeline = DB::table('fee_payments')
                ->where('school_id', $schoolId)
                ->where('payment_date', $from)
                ->where('status', 'confirmed')
                ->whereNull('deleted_at')
                ->select(DB::raw('HOUR(created_at) as hour'), DB::raw('SUM(amount) as total'))
                ->groupBy('hour')
                ->orderBy('hour')
                ->get();
        }

        return response()->json([
            'date'        => $from === $to ? $date : ['from' => $from, 'to' => $to],
            'breakdown'   => $breakdown,
            'grand_total' => $grandTotal,
            'timeline'    => $timeline,
        ]);
    }
}
