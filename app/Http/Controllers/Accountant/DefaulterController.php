<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DefaulterController extends Controller
{
    /**
     * GET /api/finance/defaulters
     *
     * Returns students with outstanding balances.
     * Supports aged analysis buckets: 0-30, 31-60, 61-90, 90+ days overdue.
     */
    public function index(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $today    = now()->toDateString();

        $query = DB::table('student_fee_invoices as i')
            ->where('i.school_id', $schoolId)
            ->whereIn('i.status', ['issued', 'partial'])
            ->where('i.balance', '>', 0)
            ->whereNull('i.deleted_at')
            ->join('students as s', 's.id', '=', 'i.student_id')
            ->select(
                's.id as student_id',
                's.first_name', 's.last_name', 's.admission_number', 's.grade_level',
                's.parent_name', 's.parent_phone',
                'i.id as invoice_id',
                'i.invoice_number',
                'i.academic_year', 'i.term',
                'i.total_charged', 'i.total_paid', 'i.balance',
                'i.due_date', 'i.status'
            )
            ->orderByDesc('i.balance');

        if ($request->filled('grade'))         $query->where('s.grade_level', $request->grade);
        if ($request->filled('academic_year')) $query->where('i.academic_year', $request->academic_year);
        if ($request->filled('term'))          $query->where('i.term', $request->term);
        if ($request->filled('min_balance'))   $query->where('i.balance', '>=', (int) $request->min_balance);

        $defaulters = $query->get()->map(function ($row) use ($today) {
            // Age bucket
            $row->days_overdue = null;
            $row->age_bucket   = 'current';

            if ($row->due_date) {
                $daysOverdue = now()->diffInDays($row->due_date, false) * -1;
                $row->days_overdue = max(0, (int) $daysOverdue);
                $row->age_bucket = match (true) {
                    $row->days_overdue <= 0  => 'current',
                    $row->days_overdue <= 30 => '0-30',
                    $row->days_overdue <= 60 => '31-60',
                    $row->days_overdue <= 90 => '61-90',
                    default                  => '90+',
                };
            }

            return $row;
        });

        $summary = [
            'total_defaulters'   => $defaulters->count(),
            'total_outstanding'  => $defaulters->sum('balance'),
            'by_bucket'          => $defaulters->groupBy('age_bucket')->map->count(),
        ];

        return response()->json(compact('defaulters', 'summary'));
    }
}
