<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinanceDashboardController extends Controller
{
    /**
     * GET /api/finance/dashboard/summary
     * KPI snapshot for the accountant dashboard.
     */
    public function summary(Request $request)
    {
        $schoolId    = $request->user()->school_id;
        $today       = now()->toDateString();
        $currentYear = now()->year;

        // Today's collection by method
        $todayRows = DB::table('fee_payments')
            ->where('school_id', $schoolId)
            ->where('payment_date', $today)
            ->where('status', 'confirmed')
            ->whereNull('deleted_at')
            ->select('payment_method', DB::raw('SUM(amount) as total'))
            ->groupBy('payment_method')
            ->get()
            ->keyBy('payment_method');

        $todayCollection = [
            'cash'          => (int) ($todayRows->get('cash')->total          ?? 0),
            'mpesa'         => (int) ($todayRows->get('mpesa')->total         ?? 0),
            'bank_transfer' => (int) ($todayRows->get('bank_transfer')->total ?? 0),
            'cheque'        => (int) ($todayRows->get('cheque')->total        ?? 0),
            'total'         => 0,
        ];
        $todayCollection['total'] = array_sum($todayCollection);

        // This-term summary (current year, current term approximated by month)
        $currentTerm = $this->currentTerm();

        $termInvoices = DB::table('student_fee_invoices')
            ->where('school_id', $schoolId)
            ->where('academic_year', (string) $currentYear)
            ->where('term', $currentTerm)
            ->whereNull('deleted_at')
            ->select(
                DB::raw('SUM(total_charged) as invoiced'),
                DB::raw('SUM(total_paid)    as collected'),
                DB::raw('SUM(balance)       as outstanding')
            )
            ->first();

        // Discounts this term
        $discountTotal = DB::table('student_discounts as d')
            ->join('student_fee_invoices as i', 'i.id', '=', 'd.invoice_id')
            ->where('d.school_id', $schoolId)
            ->where('i.academic_year', (string) $currentYear)
            ->where('i.term', $currentTerm)
            ->where('d.active', true)
            ->sum('d.amount_or_pct');

        // Defaulters count
        $defaultersCount = DB::table('student_fee_invoices')
            ->where('school_id', $schoolId)
            ->whereIn('status', ['issued', 'partial'])
            ->where('balance', '>', 0)
            ->whereNull('deleted_at')
            ->count();

        // Pending / unmatched M-Pesa (confirmed but no mpesa_code match to invoice)
        $unmatchedMpesa = DB::table('fee_payments')
            ->where('school_id', $schoolId)
            ->where('payment_method', 'mpesa')
            ->where('status', 'pending')
            ->whereNull('invoice_id')
            ->count();

        return response()->json([
            'today_collection' => $todayCollection,
            'this_term'        => [
                'term'        => $currentTerm,
                'year'        => $currentYear,
                'invoiced'    => (int) ($termInvoices->invoiced    ?? 0),
                'collected'   => (int) ($termInvoices->collected   ?? 0),
                'outstanding' => (int) ($termInvoices->outstanding ?? 0),
                'discounts'   => (int) $discountTotal,
            ],
            'defaulters_count'  => $defaultersCount,
            'unmatched_mpesa'   => $unmatchedMpesa,
        ]);
    }

    private function currentTerm(): int
    {
        $month = now()->month;
        // Kenya school calendar approximation:
        // Term 1: Jan–Apr (months 1-4)
        // Term 2: May–Aug (months 5-8)
        // Term 3: Sep–Nov (months 9-11)
        return match (true) {
            $month <= 4  => 1,
            $month <= 8  => 2,
            default      => 3,
        };
    }
}
