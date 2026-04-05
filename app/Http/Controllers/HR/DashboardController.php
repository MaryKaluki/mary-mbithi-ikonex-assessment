<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use App\Models\Payslip;
use App\Models\StaffAttendance;
use App\Models\StaffDocument;
use App\Models\StaffRecord;
use App\Models\User;

class DashboardController extends Controller
{
    public function stats()
    {
        $schoolId = auth()->user()->school_id;
        $today    = now()->toDateString();

        $staffRoles = ['teacher', 'accountant', 'librarian', 'hr_manager', 'driver', 'school_admin', 'admin', 'super_admin'];
        $totalStaff = User::withoutGlobalScopes()
            ->where('school_id', $schoolId)
            ->whereIn('role', $staffRoles)
            ->count();

        // Today's attendance
        $presentToday = StaffAttendance::where('school_id', $schoolId)
            ->where('date', $today)->where('status', 'Present')->count();
        $markedToday  = StaffAttendance::where('school_id', $schoolId)
            ->where('date', $today)->count();

        // Pending leave
        $pendingLeave = LeaveRequest::where('school_id', $schoolId)
            ->where('status', 'Pending')->count();

        // Payroll this month
        $year  = now()->year;
        $month = now()->month;
        $payrollGross = Payslip::where('school_id', $schoolId)
            ->where('year', $year)->where('month', $month)
            ->whereIn('status', ['Processed', 'Paid'])->sum('gross_salary');
        $payrollNet = Payslip::where('school_id', $schoolId)
            ->where('year', $year)->where('month', $month)
            ->whereIn('status', ['Processed', 'Paid'])->sum('net_salary');

        // ── Alerts ────────────────────────────────────────────────────────────

        // Probation ending within 14 days
        $probationAlerts = StaffRecord::where('school_id', $schoolId)
            ->where('employment_status', 'probation')
            ->whereBetween('probation_end', [now()->toDateString(), now()->addDays(14)->toDateString()])
            ->with('user:id,name')
            ->get()
            ->map(fn($r) => [
                'user_id'       => $r->user_id,
                'name'          => $r->user?->name,
                'probation_end' => $r->probation_end?->toDateString(),
                'days_left'     => now()->diffInDays($r->probation_end, false),
            ]);

        // Contracts expiring within 30 days
        $contractAlerts = StaffRecord::where('school_id', $schoolId)
            ->where('employment_type', 'contract')
            ->whereBetween('contract_end_date', [now()->toDateString(), now()->addDays(30)->toDateString()])
            ->with('user:id,name')
            ->get()
            ->map(fn($r) => [
                'user_id'           => $r->user_id,
                'name'              => $r->user?->name,
                'contract_end_date' => $r->contract_end_date?->toDateString(),
                'days_left'         => now()->diffInDays($r->contract_end_date, false),
            ]);

        // Documents expiring within alert window
        $docAlerts = StaffDocument::where('school_id', $schoolId)
            ->whereNotNull('expiry_date')
            ->whereRaw('expiry_date <= DATE_ADD(CURDATE(), INTERVAL expiry_alert_days DAY)')
            ->with('user:id,name')
            ->orderBy('expiry_date')
            ->get()
            ->map(fn($d) => [
                'document_id'   => $d->id,
                'user_id'       => $d->user_id,
                'user_name'     => $d->user?->name,
                'title'         => $d->title,
                'expiry_date'   => $d->expiry_date?->toDateString(),
                'is_expired'    => $d->is_expired,
                'days_left'     => now()->diffInDays($d->expiry_date, false),
            ]);

        // Recent pending leave requests
        $pendingRequests = LeaveRequest::where('school_id', $schoolId)
            ->where('status', 'Pending')
            ->with(['user:id,name,role', 'leaveType:id,name'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn($l) => [
                'id'         => $l->id,
                'name'       => $l->user?->name,
                'role'       => $l->user?->role,
                'type'       => $l->leaveType?->name ?? $l->type,
                'start_date' => $l->start_date->format('d M Y'),
                'end_date'   => $l->end_date->format('d M Y'),
                'days'       => $l->days,
            ]);

        return response()->json([
            'stats' => [
                'total_staff'   => $totalStaff,
                'present_today' => $presentToday,
                'marked_today'  => $markedToday,
                'pending_leave' => $pendingLeave,
                'payroll_gross' => $payrollGross,
                'payroll_net'   => $payrollNet,
                'payroll_month' => now()->format('M Y'),
            ],
            'pending_requests'  => $pendingRequests,
            'probation_alerts'  => $probationAlerts,
            'contract_alerts'   => $contractAlerts,
            'document_alerts'   => $docAlerts,
        ]);
    }
}
