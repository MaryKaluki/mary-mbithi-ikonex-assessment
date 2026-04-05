<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Payslip;
use App\Models\StaffRecord;
use App\Models\User;
use Illuminate\Http\Request;

/**
 * PayrollController — Payroll dashboard + staff salary management.
 *
 * Uses the new Payslips table (not the legacy PayrollRecord table).
 * Statutory deductions are always auto-calculated via Payslip::calculateDeductions().
 */
class PayrollController extends Controller
{
    private array $staffRoles = [
        'teacher', 'accountant', 'librarian', 'hr_manager',
        'driver', 'school_admin', 'admin', 'super_admin',
    ];

    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/hr/payroll/dashboard
    // Current month stats + last 6 month payroll run history.
    // ──────────────────────────────────────────────────────────────────────────
    public function dashboard()
    {
        $schoolId = auth()->user()->school_id;
        $year     = now()->year;
        $month    = now()->month;

        $totalStaff = User::withoutGlobalScopes()
            ->where('school_id', $schoolId)
            ->whereIn('role', $this->staffRoles)
            ->count();

        // How many staff have a salary configured
        $salaryConfigured = StaffRecord::where('school_id', $schoolId)
            ->where('basic_salary', '>', 0)
            ->count();

        // Current month payslip totals
        $currentMonth = Payslip::where('school_id', $schoolId)
            ->where('year', $year)
            ->where('month', $month)
            ->whereIn('status', ['Processed', 'Paid'])
            ->selectRaw('
                COUNT(*) as headcount,
                SUM(gross_salary) as gross,
                SUM(total_deductions) as deductions,
                SUM(net_salary) as net,
                SUM(nssf) as nssf,
                SUM(shif) as shif,
                SUM(housing_levy) as housing_levy,
                SUM(paye) as paye
            ')
            ->first();

        // Last 6 payroll runs (grouped by year+month)
        $recentRuns = Payslip::where('school_id', $schoolId)
            ->whereIn('status', ['Processed', 'Paid'])
            ->selectRaw('year, month, status,
                COUNT(*) as headcount,
                SUM(gross_salary) as gross,
                SUM(net_salary) as net,
                MAX(processed_at) as run_date')
            ->groupBy('year', 'month', 'status')
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->limit(6)
            ->get()
            ->map(fn($r) => [
                'month_label' => date('F Y', mktime(0, 0, 0, $r->month, 1, $r->year)),
                'year'        => $r->year,
                'month'       => $r->month,
                'status'      => $r->status,
                'headcount'   => (int) $r->headcount,
                'gross'       => (float) $r->gross,
                'net'         => (float) $r->net,
                'run_date'    => $r->run_date,
            ]);

        return response()->json([
            'stats' => [
                'total_staff'       => $totalStaff,
                'salary_configured' => $salaryConfigured,
                'month_label'       => now()->format('F Y'),
                'headcount'         => (int) ($currentMonth->headcount ?? 0),
                'gross'             => (float) ($currentMonth->gross       ?? 0),
                'deductions'        => (float) ($currentMonth->deductions  ?? 0),
                'net'               => (float) ($currentMonth->net         ?? 0),
                'nssf'              => (float) ($currentMonth->nssf        ?? 0),
                'shif'              => (float) ($currentMonth->shif        ?? 0),
                'housing_levy'      => (float) ($currentMonth->housing_levy ?? 0),
                'paye'              => (float) ($currentMonth->paye        ?? 0),
            ],
            'recent_runs' => $recentRuns,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/hr/payroll/staff?month=4&year=2026&department_id=
    // Staff list with salary info + payslip status for the selected month.
    // Used to choose who to include in this month's payroll run.
    // ──────────────────────────────────────────────────────────────────────────
    public function staffForMonth(Request $request)
    {
        $schoolId    = auth()->user()->school_id;
        $year        = (int) $request->query('year',  now()->year);
        $month       = (int) $request->query('month', now()->month);
        $deptId      = $request->query('department_id');

        $query = User::withoutGlobalScopes()
            ->where('school_id', $schoolId)
            ->whereIn('role', $this->staffRoles)
            ->orderBy('name');

        $staff = $query->get(['id', 'name', 'role', 'email']);

        // Salary info from staff_records
        $records = StaffRecord::where('school_id', $schoolId)
            ->when($deptId, fn($q) => $q->where('department_id', $deptId))
            ->get()
            ->keyBy('user_id');

        // Existing payslips for this month
        $existing = Payslip::where('school_id', $schoolId)
            ->where('year', $year)
            ->where('month', $month)
            ->get()
            ->keyBy('user_id');

        // Filter by department if requested (join via staff_records)
        if ($deptId) {
            $staffWithDept = $records->keys()->toArray();
            $staff = $staff->filter(fn($u) => in_array($u->id, $staffWithDept));
        }

        $rows = $staff->map(function ($u) use ($records, $existing) {
            $rec     = $records->get($u->id);
            $payslip = $existing->get($u->id);
            $basic   = (float) ($rec?->basic_salary ?? 0);
            $allow   = (float) ($rec?->allowance    ?? 0);

            // Show live preview of deductions (not saved)
            $preview = $basic > 0 ? Payslip::calculateDeductions($basic, $allow) : null;

            return [
                'id'              => $u->id,
                'name'            => $u->name,
                'role'            => $u->role,
                'email'           => $u->email,
                'department_id'   => $rec?->department_id,
                'basic_salary'    => $basic,
                'allowance'       => $allow,
                'gross_salary'    => $preview ? $preview['gross_salary']     : 0,
                'nssf'            => $preview ? $preview['nssf']             : 0,
                'shif'            => $preview ? $preview['shif']             : 0,
                'housing_levy'    => $preview ? $preview['housing_levy']     : 0,
                'paye'            => $preview ? $preview['paye']             : 0,
                'total_deductions'=> $preview ? $preview['total_deductions'] : 0,
                'net_salary'      => $preview ? $preview['net_salary']       : 0,
                'has_salary'      => $basic > 0,
                'payslip_id'      => $payslip?->id,
                'payslip_status'  => $payslip?->status ?? null,  // null = not yet generated
            ];
        })->values();

        return response()->json([
            'staff' => $rows,
            'year'  => $year,
            'month' => $month,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/hr/payroll/generate
    // Body: { year, month, user_ids: [1,2,3] }
    // Delegates to PayslipController::generate() business logic.
    // Kept here for backward-compatibility with existing frontend calls.
    // ──────────────────────────────────────────────────────────────────────────
    public function generate(Request $request)
    {
        return app(PayslipController::class)->generate($request);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // PUT /api/hr/salary/{userId}
    // Upsert basic_salary and allowance on the staff_records table.
    // The next payroll generate will use these values.
    // ──────────────────────────────────────────────────────────────────────────
    public function upsertSalary(Request $request, $userId)
    {
        $schoolId = auth()->user()->school_id;

        // Verify target user is in this school
        $user = User::withoutGlobalScopes()
            ->where('school_id', $schoolId)
            ->where('id', $userId)
            ->firstOrFail();

        $data = $request->validate([
            'basic_salary' => 'required|numeric|min:0',
            'allowance'    => 'nullable|numeric|min:0',
        ]);

        $record = StaffRecord::updateOrCreate(
            ['school_id' => $schoolId, 'user_id' => $user->id],
            [
                'basic_salary' => $data['basic_salary'],
                'allowance'    => $data['allowance'] ?? 0,
            ]
        );

        // Return a live preview of what the next payslip will look like
        $preview = Payslip::calculateDeductions(
            (float) $record->basic_salary,
            (float) $record->allowance
        );

        return response()->json([
            'message' => 'Salary updated successfully.',
            'record'  => $record,
            'preview' => $preview,
        ]);
    }
}
