<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\Payslip;
use App\Models\StaffAttendance;
use App\Models\StaffRecord;
use App\Models\User;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    private array $staffRoles = [
        'teacher', 'accountant', 'librarian', 'hr_manager',
        'driver', 'school_admin', 'admin', 'super_admin',
    ];

    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/hr/reports/payroll-summary
    // Returns month-by-month payroll totals for the current year.
    // ──────────────────────────────────────────────────────────────────────────
    public function payrollSummary(Request $request)
    {
        $schoolId = auth()->user()->school_id;
        $year     = $request->input('year', now()->year);

        $rows = Payslip::where('school_id', $schoolId)
            ->where('year', $year)
            ->whereIn('status', ['Processed', 'Paid'])
            ->selectRaw('month, year, COUNT(*) as headcount,
                SUM(gross_salary) as gross_total,
                SUM(total_deductions) as deductions_total,
                SUM(net_salary) as net_total,
                SUM(nssf) as nssf_total,
                SUM(shif) as shif_total,
                SUM(housing_levy) as housing_total,
                SUM(paye) as paye_total')
            ->groupBy('year', 'month')
            ->orderBy('month')
            ->get()
            ->map(fn($r) => [
                'month'             => $r->month,
                'year'              => $r->year,
                'month_name'        => \Carbon\Carbon::createFromDate($r->year, $r->month, 1)->format('M Y'),
                'headcount'         => (int) $r->headcount,
                'gross_total'       => (float) $r->gross_total,
                'deductions_total'  => (float) $r->deductions_total,
                'net_total'         => (float) $r->net_total,
                'nssf_total'        => (float) $r->nssf_total,
                'shif_total'        => (float) $r->shif_total,
                'housing_total'     => (float) $r->housing_total,
                'paye_total'        => (float) $r->paye_total,
            ]);

        return response()->json([
            'year'     => (int) $year,
            'rows'     => $rows,
            'totals'   => [
                'gross_total'      => $rows->sum('gross_total'),
                'deductions_total' => $rows->sum('deductions_total'),
                'net_total'        => $rows->sum('net_total'),
            ],
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/hr/reports/leave-matrix
    // Returns a cross-table: staff rows × leave-type columns with remaining balance.
    // ──────────────────────────────────────────────────────────────────────────
    public function leaveMatrix(Request $request)
    {
        $schoolId = auth()->user()->school_id;
        $year     = $request->input('year', now()->year);

        $leaveTypes = LeaveType::where('school_id', $schoolId)
            ->where('active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $staff = User::withoutGlobalScopes()
            ->where('school_id', $schoolId)
            ->whereIn('role', $this->staffRoles)
            ->orderBy('name')
            ->get(['id', 'name', 'role']);

        $balances = LeaveBalance::where('school_id', $schoolId)
            ->where('year', $year)
            ->get()
            ->groupBy('user_id');

        $matrix = $staff->map(function ($u) use ($leaveTypes, $balances) {
            $userBalances = $balances->get($u->id, collect());

            $leaveData = $leaveTypes->map(function ($lt) use ($userBalances) {
                $bal = $userBalances->firstWhere('leave_type_id', $lt->id);
                return [
                    'leave_type_id'  => $lt->id,
                    'total_days'     => $bal ? $bal->total_days     : 0,
                    'used_days'      => $bal ? $bal->used_days      : 0,
                    'carried_forward'=> $bal ? $bal->carried_forward: 0,
                    'remaining_days' => $bal ? $bal->remaining_days : 0,
                ];
            });

            return [
                'user_id'  => $u->id,
                'name'     => $u->name,
                'role'     => $u->role,
                'balances' => $leaveData,
            ];
        });

        return response()->json([
            'year'        => (int) $year,
            'leave_types' => $leaveTypes,
            'matrix'      => $matrix,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/hr/reports/headcount
    // Returns headcount breakdown by department, designation, employment type.
    // ──────────────────────────────────────────────────────────────────────────
    public function headcount(Request $request)
    {
        $schoolId = auth()->user()->school_id;

        $totalStaff = User::withoutGlobalScopes()
            ->where('school_id', $schoolId)
            ->whereIn('role', $this->staffRoles)
            ->count();

        // By role
        $byRole = User::withoutGlobalScopes()
            ->where('school_id', $schoolId)
            ->whereIn('role', $this->staffRoles)
            ->selectRaw('role, COUNT(*) as count')
            ->groupBy('role')
            ->orderByDesc('count')
            ->get()
            ->map(fn($r) => ['role' => $r->role, 'count' => (int) $r->count]);

        // By employment type
        $byEmploymentType = StaffRecord::where('school_id', $schoolId)
            ->selectRaw('employment_type, employment_status, COUNT(*) as count')
            ->groupBy('employment_type', 'employment_status')
            ->get()
            ->map(fn($r) => [
                'employment_type'   => $r->employment_type,
                'employment_status' => $r->employment_status,
                'count'             => (int) $r->count,
            ]);

        // By department (requires join with staff_records)
        $byDepartment = StaffRecord::where('staff_records.school_id', $schoolId)
            ->join('departments', 'departments.id', '=', 'staff_records.department_id')
            ->selectRaw('departments.name as department, COUNT(*) as count')
            ->groupBy('department')
            ->orderByDesc('count')
            ->get()
            ->map(fn($r) => ['department' => $r->department, 'count' => (int) $r->count]);

        return response()->json([
            'total_staff'        => $totalStaff,
            'by_role'            => $byRole,
            'by_employment'      => $byEmploymentType,
            'by_department'      => $byDepartment,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/hr/reports/attendance
    // Returns monthly attendance summary — present / absent / late counts.
    // ──────────────────────────────────────────────────────────────────────────
    public function attendance(Request $request)
    {
        $schoolId = auth()->user()->school_id;
        $month    = $request->input('month', now()->month);
        $year     = $request->input('year', now()->year);

        $start = \Carbon\Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $end   = $start->copy()->endOfMonth();

        $records = StaffAttendance::where('school_id', $schoolId)
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->with('user:id,name,role')
            ->get();

        $byStaff = $records->groupBy('user_id')->map(function ($recs) {
            $user = $recs->first()->user;
            return [
                'user_id'  => $user?->id,
                'name'     => $user?->name,
                'role'     => $user?->role,
                'present'  => $recs->where('status', 'Present')->count(),
                'absent'   => $recs->where('status', 'Absent')->count(),
                'late'     => $recs->where('status', 'Late')->count(),
                'on_leave' => $recs->where('status', 'On Leave')->count(),
                'half_day' => $recs->where('status', 'Half Day')->count(),
            ];
        })->values();

        $summary = [
            'present'  => $records->where('status', 'Present')->count(),
            'absent'   => $records->where('status', 'Absent')->count(),
            'late'     => $records->where('status', 'Late')->count(),
            'on_leave' => $records->where('status', 'On Leave')->count(),
        ];

        return response()->json([
            'month'    => (int) $month,
            'year'     => (int) $year,
            'summary'  => $summary,
            'by_staff' => $byStaff,
        ]);
    }
}
