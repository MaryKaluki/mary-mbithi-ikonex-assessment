<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use Carbon\Carbon;
use Illuminate\Http\Request;

class LeaveController extends Controller
{
    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/teacher/leave
    // Returns the authenticated staff member's own leave history + available
    // leave types + their current balances for the current year.
    // ──────────────────────────────────────────────────────────────────────────
    public function index()
    {
        $user     = auth()->user();
        $schoolId = $user->school_id;
        $year     = now()->year;

        // All active leave types for this school
        $leaveTypes = LeaveType::where('school_id', $schoolId)
            ->where('active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'days_allowed_per_year', 'is_paid', 'requires_document', 'carry_forward']);

        // Current year balances for this staff member
        $balances = LeaveBalance::where('school_id', $schoolId)
            ->where('user_id', $user->id)
            ->where('year', $year)
            ->with('leaveType:id,name')
            ->get()
            ->map(fn($b) => [
                'leave_type_id'   => $b->leave_type_id,
                'leave_type_name' => $b->leaveType?->name,
                'total_days'      => $b->total_days,
                'used_days'       => $b->used_days,
                'carried_forward' => $b->carried_forward,
                'remaining_days'  => $b->remaining_days,
            ]);

        // Own leave requests
        $leaves = LeaveRequest::where('school_id', $schoolId)
            ->where('user_id', $user->id)
            ->with(['approvedBy:id,name', 'leaveType:id,name'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($l) => [
                'id'            => $l->id,
                'leave_type_id' => $l->leave_type_id,
                'type'          => $l->leaveType?->name ?? $l->type,
                'start_date'    => $l->start_date->format('d M Y'),
                'end_date'      => $l->end_date->format('d M Y'),
                'days'          => $l->days,
                'reason'        => $l->reason,
                'status'        => $l->status,
                'admin_note'    => $l->admin_note,
                'approved_by'   => $l->approvedBy?->name,
                'created_at'    => $l->created_at->format('d M Y'),
            ]);

        return response()->json([
            'leaves'      => $leaves,
            'leave_types' => $leaveTypes,
            'balances'    => $balances,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/teacher/leave
    // Guards: overlap check, balance check (if leave type has a balance record).
    // ──────────────────────────────────────────────────────────────────────────
    public function store(Request $request)
    {
        $user     = auth()->user();
        $schoolId = $user->school_id;

        $validated = $request->validate([
            'leave_type_id' => 'required|integer|exists:leave_types,id',
            'start_date'    => 'required|date|after_or_equal:today',
            'end_date'      => 'required|date|after_or_equal:start_date',
            'reason'        => 'required|string|max:1000',
        ]);

        // ── Verify leave type belongs to this school ──────────────────────────
        $leaveType = LeaveType::where('id', $validated['leave_type_id'])
            ->where('school_id', $schoolId)
            ->where('active', true)
            ->first();

        if (! $leaveType) {
            return response()->json(['error' => 'Invalid or inactive leave type.'], 422);
        }

        $start = Carbon::parse($validated['start_date']);
        $end   = Carbon::parse($validated['end_date']);

        // Weekday count (Mon–Fri). +1 because diffInWeekdays is exclusive of start
        $days = $this->countWeekdays($start, $end);

        // ── Guard 1: Overlap check ────────────────────────────────────────────
        $overlap = LeaveRequest::where('school_id', $schoolId)
            ->overlapping($user->id, $validated['start_date'], $validated['end_date'])
            ->exists();

        if ($overlap) {
            return response()->json([
                'error' => 'You already have a pending or approved leave that overlaps with these dates.',
            ], 422);
        }

        // ── Guard 2: Balance check ────────────────────────────────────────────
        $balance = LeaveBalance::where('school_id', $schoolId)
            ->where('user_id', $user->id)
            ->where('leave_type_id', $leaveType->id)
            ->where('year', $start->year)
            ->first();

        if ($balance) {
            if ($balance->remaining_days < $days) {
                return response()->json([
                    'error' => "Insufficient leave balance. You have {$balance->remaining_days} day(s) remaining for '{$leaveType->name}'.",
                ], 422);
            }
        }
        // If no balance row exists yet (admin hasn't initialized this year), 
        // we still allow submission — HR will handle it on approval.

        // ── Create the request ────────────────────────────────────────────────
        $leave = LeaveRequest::create([
            'school_id'     => $schoolId,
            'user_id'       => $user->id,
            'leave_type_id' => $leaveType->id,
            'type'          => $leaveType->name,   // denormalised for legacy compatibility
            'start_date'    => $validated['start_date'],
            'end_date'      => $validated['end_date'],
            'days'          => $days,
            'reason'        => $validated['reason'],
            'status'        => 'Pending',
        ]);

        return response()->json([
            'message' => 'Leave request submitted successfully.',
            'leave'   => $leave,
        ], 201);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Count weekdays (Mon–Fri) inclusive of both start and end dates.
     */
    private function countWeekdays(Carbon $start, Carbon $end): int
    {
        $days  = 0;
        $current = $start->copy();

        while ($current->lte($end)) {
            if ($current->isWeekday()) {
                $days++;
            }
            $current->addDay();
        }

        return max(1, $days);
    }
}
