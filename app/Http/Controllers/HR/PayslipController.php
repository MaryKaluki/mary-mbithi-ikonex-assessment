<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Payslip;
use App\Models\StaffRecord;
use App\Models\User;
use Illuminate\Http\Request;

/**
 * PayslipController — manages the new Payslips table (replaces legacy PayrollRecord).
 *
 * All deductions are auto-calculated using Kenyan statutory rates
 * defined in the Payslip model's static calculateDeductions() method:
 *
 *   NSSF        = min(gross × 6%, KES 4,320)   [capped when gross > 72,000]
 *   SHIF        = gross × 2.75%
 *   Housing Levy= gross × 1.5%
 *   Taxable     = gross − NSSF − SHIF
 *   PAYE        = graduated 10%/25%/30% − KES 2,400 personal relief
 *   Net         = gross − NSSF − SHIF − Housing Levy − PAYE
 */
class PayslipController extends Controller
{
    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/hr/payslips?month=4&year=2026
    // List all payslips for a given month/year with a summary row.
    // ──────────────────────────────────────────────────────────────────────────
    public function index(Request $request)
    {
        $schoolId = auth()->user()->school_id;
        $year     = (int) ($request->query('year',  now()->year));
        $month    = (int) ($request->query('month', now()->month));

        $payslips = Payslip::where('school_id', $schoolId)
            ->where('year', $year)
            ->where('month', $month)
            ->with('user:id,name,email,role')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($p) => [
                'id'               => $p->id,
                'user_id'          => $p->user_id,
                'name'             => $p->user->name  ?? '—',
                'email'            => $p->user->email ?? '—',
                'role'             => $p->user->role  ?? '—',
                'month_label'      => $p->month_label,
                'year'             => $p->year,
                'month'            => $p->month,
                'basic_salary'     => $p->basic_salary,
                'allowance'        => $p->allowance,
                'gross_salary'     => $p->gross_salary,
                'nssf'             => $p->nssf,
                'shif'             => $p->shif,
                'housing_levy'     => $p->housing_levy,
                'paye'             => $p->paye,
                'total_deductions' => $p->total_deductions,
                'net_salary'       => $p->net_salary,
                'status'           => $p->status,
                'processed_at'     => $p->processed_at?->format('d M Y H:i'),
            ]);

        return response()->json([
            'payslips' => $payslips,
            'summary'  => [
                'count'            => $payslips->count(),
                'total_gross'      => round($payslips->sum('gross_salary'), 2),
                'total_nssf'       => round($payslips->sum('nssf'), 2),
                'total_shif'       => round($payslips->sum('shif'), 2),
                'total_housing'    => round($payslips->sum('housing_levy'), 2),
                'total_paye'       => round($payslips->sum('paye'), 2),
                'total_deductions' => round($payslips->sum('total_deductions'), 2),
                'total_net'        => round($payslips->sum('net_salary'), 2),
            ],
            'year'  => $year,
            'month' => $month,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/hr/payslips/{id}
    // Full payslip detail — used for the PayslipViewer (print/preview).
    // ──────────────────────────────────────────────────────────────────────────
    public function show($id)
    {
        $schoolId = auth()->user()->school_id;

        $payslip = Payslip::where('school_id', $schoolId)
            ->with(['user', 'generatedBy'])
            ->findOrFail($id);

        $record = StaffRecord::where('school_id', $schoolId)
            ->where('user_id', $payslip->user_id)
            ->with(['department', 'designation'])
            ->first();

        return response()->json([
            'payslip' => [
                'id'               => $payslip->id,
                'month_label'      => $payslip->month_label,
                'year'             => $payslip->year,
                'month'            => $payslip->month,
                'status'           => $payslip->status,
                'processed_at'     => $payslip->processed_at?->format('d M Y H:i'),
                'generated_by'     => $payslip->generatedBy?->name ?? '—',

                // Earnings
                'basic_salary'     => $payslip->basic_salary,
                'allowance'        => $payslip->allowance,
                'gross_salary'     => $payslip->gross_salary,

                // Statutory Deductions
                'nssf'             => $payslip->nssf,
                'shif'             => $payslip->shif,
                'housing_levy'     => $payslip->housing_levy,
                'paye'             => $payslip->paye,
                'other_deductions' => $payslip->other_deductions ?? 0,
                'total_deductions' => $payslip->total_deductions,
                'net_salary'       => $payslip->net_salary,
            ],
            'employee' => [
                'id'             => $payslip->user->id,
                'name'           => $payslip->user->name,
                'email'          => $payslip->user->email,
                'role'           => $payslip->user->role,
                'department'     => $record?->department?->name  ?? '—',
                'designation'    => $record?->designation?->name ?? '—',
                'id_number'      => $record?->id_number          ?? '—',
                'kra_pin'        => $record?->kra_pin            ?? '—',
                'nssf_no'        => $record?->nssf_no            ?? '—',
                'shif_no'        => $record?->shif_no            ?? '—',
                'bank_name'      => $record?->bank_name          ?? '—',
                'account_number' => $record?->account_number     ?? '—',
                'date_of_joining'=> $record?->date_of_joining    ?? '—',
            ],
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/hr/payslips/generate
    // Body: { year, month, user_ids: [1,2,3] }
    //
    // Generates (or re-generates) payslips for selected staff.
    // All Kenyan statutory deductions are computed automatically.
    // Skips staff with no salary record or zero basic salary.
    // ──────────────────────────────────────────────────────────────────────────
    public function generate(Request $request)
    {
        $schoolId = auth()->user()->school_id;
        $hr       = auth()->user();

        $data = $request->validate([
            'year'       => 'required|integer|min:2020|max:2100',
            'month'      => 'required|integer|min:1|max:12',
            'user_ids'   => 'required|array|min:1',
            'user_ids.*' => 'integer|exists:users,id',
        ]);

        $year      = (int) $data['year'];
        $month     = (int) $data['month'];
        $generated = 0;
        $skipped   = [];

        foreach ($data['user_ids'] as $userId) {
            // ── Security: Verify staff belongs to this school ─────────────────
            $user = User::withoutGlobalScopes()
                ->where('school_id', $schoolId)
                ->where('id', $userId)
                ->first();

            if (! $user) {
                $skipped[] = ['user_id' => $userId, 'reason' => 'Not in this school.'];
                continue;
            }

            // ── Get salary from staff_records ─────────────────────────────────
            $record = StaffRecord::where('school_id', $schoolId)
                ->where('user_id', $userId)
                ->first();

            $basic     = (float) ($record?->basic_salary ?? 0);
            $allowance = (float) ($record?->allowance    ?? 0);

            if ($basic <= 0) {
                $skipped[] = ['user_id' => $userId, 'name' => $user->name, 'reason' => 'No basic salary configured.'];
                continue;
            }

            // ── Auto-calculate all statutory deductions ───────────────────────
            $calc = Payslip::calculateDeductions($basic, $allowance);

            // ── Upsert payslip (idempotent — safe to re-run) ─────────────────
            Payslip::updateOrCreate(
                [
                    'school_id' => $schoolId,
                    'user_id'   => $userId,
                    'year'      => $year,
                    'month'     => $month,
                ],
                array_merge($calc, [
                    'status'       => 'Processed',
                    'generated_by' => $hr->id,
                    'processed_at' => now(),
                ])
            );

            $generated++;
        }

        return response()->json([
            'message'   => "Generated {$generated} payslip(s). " . count($skipped) . " skipped.",
            'generated' => $generated,
            'skipped'   => $skipped,
        ], 201);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // PUT /api/hr/payslips/{id}/mark-paid
    // Marks a processed payslip as Paid.
    // ──────────────────────────────────────────────────────────────────────────
    public function markPaid($id)
    {
        $schoolId = auth()->user()->school_id;

        $payslip = Payslip::where('school_id', $schoolId)->findOrFail($id);

        if ($payslip->status !== 'Processed') {
            return response()->json(['error' => 'Only Processed payslips can be marked as Paid.'], 422);
        }

        $payslip->update(['status' => 'Paid']);

        return response()->json(['message' => 'Payslip marked as Paid.']);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // DELETE /api/hr/payslips/{id}
    // Delete a payslip (only if still in Draft/Processed — not Paid).
    // ──────────────────────────────────────────────────────────────────────────
    public function destroy($id)
    {
        $schoolId = auth()->user()->school_id;

        $payslip = Payslip::where('school_id', $schoolId)->findOrFail($id);

        if ($payslip->status === 'Paid') {
            return response()->json(['error' => 'Paid payslips cannot be deleted.'], 422);
        }

        $payslip->delete();

        return response()->json(['message' => 'Payslip deleted.']);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/hr/payslips/{id}/download
    // Returns full payslip data + a preview breakdown for window.print() rendering.
    // (No PDF library needed — frontend handles print layout via PayslipViewer.js)
    // ──────────────────────────────────────────────────────────────────────────
    public function download($id)
    {
        // Reuse the show() data shape — frontend receives full data for print
        return $this->show($id);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/hr/payslips/preview
    // Body: { user_id, year, month }
    // Returns a breakdown preview WITHOUT saving — used before generating.
    // ──────────────────────────────────────────────────────────────────────────
    public function preview(Request $request)
    {
        $schoolId = auth()->user()->school_id;

        $data = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'year'    => 'required|integer|min:2020|max:2100',
            'month'   => 'required|integer|min:1|max:12',
        ]);

        $user = User::withoutGlobalScopes()
            ->where('school_id', $schoolId)
            ->where('id', $data['user_id'])
            ->firstOrFail();

        $record = StaffRecord::where('school_id', $schoolId)
            ->where('user_id', $user->id)
            ->with(['department', 'designation'])
            ->first();

        $basic     = (float) ($record?->basic_salary ?? 0);
        $allowance = (float) ($record?->allowance    ?? 0);

        if ($basic <= 0) {
            return response()->json(['error' => 'No basic salary configured for this staff member.'], 422);
        }

        $calc = Payslip::calculateDeductions($basic, $allowance);

        return response()->json([
            'employee' => [
                'id'          => $user->id,
                'name'        => $user->name,
                'role'        => $user->role,
                'department'  => $record?->department?->name  ?? '—',
                'designation' => $record?->designation?->name ?? '—',
                'kra_pin'     => $record?->kra_pin            ?? '—',
                'nssf_no'     => $record?->nssf_no            ?? '—',
                'shif_no'     => $record?->shif_no            ?? '—',
            ],
            'preview' => array_merge($calc, [
                'month_label' => date('F Y', mktime(0, 0, 0, $data['month'], 1, $data['year'])),
                'year'        => $data['year'],
                'month'       => $data['month'],
                'is_preview'  => true,
            ]),
        ]);
    }
}
