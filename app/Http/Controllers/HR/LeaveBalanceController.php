<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\LeaveBalance;
use App\Models\LeaveType;
use App\Models\User;
use Illuminate\Http\Request;

class LeaveBalanceController extends Controller
{
    /**
     * GET /api/hr/leave-balances?year=2026
     * Matrix of all staff × all leave types for the given year.
     */
    public function index(Request $request)
    {
        $schoolId = auth()->user()->school_id;
        $year     = (int) ($request->query('year', now()->year));

        $leaveTypes = LeaveType::where('school_id', $schoolId)
            ->where('active', true)
            ->orderBy('name')
            ->get();

        $staff = User::withoutGlobalScopes()
            ->where('school_id', $schoolId)
            ->whereNotIn('role', ['platform_admin', 'parent', 'student'])
            ->orderBy('name')
            ->get(['id', 'name', 'role']);

        // Fetch all balances for this school/year in one query
        $balances = LeaveBalance::where('school_id', $schoolId)
            ->where('year', $year)
            ->get()
            ->keyBy(fn($b) => "{$b->user_id}_{$b->leave_type_id}");

        $matrix = $staff->map(function ($user) use ($leaveTypes, $balances) {
            $row = [
                'user_id'   => $user->id,
                'user_name' => $user->name,
                'role'      => $user->role,
                'balances'  => [],
            ];

            foreach ($leaveTypes as $type) {
                $key     = "{$user->id}_{$type->id}";
                $balance = $balances->get($key);
                $total   = $balance ? $balance->total_days + $balance->carried_forward : 0;
                $used    = $balance ? $balance->used_days : 0;
                $row['balances'][] = [
                    'leave_type_id'   => $type->id,
                    'leave_type_name' => $type->name,
                    'total'           => $total,
                    'used'            => $used,
                    'remaining'       => max(0, $total - $used),
                    'balance_id'      => $balance?->id,
                ];
            }

            return $row;
        });

        return response()->json([
            'year'        => $year,
            'leave_types' => $leaveTypes,
            'matrix'      => $matrix,
        ]);
    }

    /**
     * POST /api/hr/leave-balances/initialize
     * Bulk-initialize leave balances for all active staff for a given year.
     */
    public function initialize(Request $request)
    {
        $schoolId = auth()->user()->school_id;

        $data = $request->validate([
            'year' => 'required|integer|min:2020|max:2100',
        ]);

        $year       = $data['year'];
        $leaveTypes = LeaveType::where('school_id', $schoolId)->where('active', true)->get();

        $staff = User::withoutGlobalScopes()
            ->where('school_id', $schoolId)
            ->whereNotIn('role', ['platform_admin', 'parent', 'student'])
            ->pluck('id');

        $created = 0;
        foreach ($staff as $userId) {
            foreach ($leaveTypes as $type) {
                $existing = LeaveBalance::where([
                    'school_id'     => $schoolId,
                    'user_id'       => $userId,
                    'leave_type_id' => $type->id,
                    'year'          => $year,
                ])->first();

                if (! $existing) {
                    LeaveBalance::create([
                        'school_id'     => $schoolId,
                        'user_id'       => $userId,
                        'leave_type_id' => $type->id,
                        'year'          => $year,
                        'total_days'    => $type->days_allowed_per_year,
                        'used_days'     => 0,
                        'carried_forward' => 0,
                    ]);
                    $created++;
                }
            }
        }

        return response()->json([
            'message' => "Initialized {$created} leave balance records for {$year}.",
        ]);
    }

    /**
     * POST /api/hr/leave-balances/carry-forward
     * Carry unused days from year Y into year Y+1 (respects carry_forward_max).
     */
    public function carryForward(Request $request)
    {
        $schoolId = auth()->user()->school_id;

        $data = $request->validate([
            'from_year' => 'required|integer|min:2020',
        ]);

        $fromYear = $data['from_year'];
        $toYear   = $fromYear + 1;

        $fromBalances = LeaveBalance::where('school_id', $schoolId)
            ->where('year', $fromYear)
            ->with('leaveType')
            ->get();

        $carried = 0;

        foreach ($fromBalances as $bal) {
            $type = $bal->leaveType;
            if (! $type || ! $type->carry_forward) continue;

            $remaining = max(0, $bal->total_days + $bal->carried_forward - $bal->used_days);
            $carryAmt  = $type->carry_forward_max > 0
                ? min($remaining, $type->carry_forward_max)
                : $remaining;

            if ($carryAmt <= 0) continue;

            $next = LeaveBalance::firstOrCreate(
                [
                    'school_id'     => $schoolId,
                    'user_id'       => $bal->user_id,
                    'leave_type_id' => $bal->leave_type_id,
                    'year'          => $toYear,
                ],
                [
                    'total_days'    => $type->days_allowed_per_year,
                    'used_days'     => 0,
                    'carried_forward' => 0,
                ]
            );

            $next->increment('carried_forward', $carryAmt);
            $carried++;
        }

        return response()->json([
            'message' => "Carry-forward complete. {$carried} balances updated into {$toYear}.",
        ]);
    }
}
