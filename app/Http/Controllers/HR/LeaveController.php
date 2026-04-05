<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class LeaveController extends Controller
{
    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/hr/leave
    // Returns ALL school leave requests (HR view) + leave types.
    // ──────────────────────────────────────────────────────────────────────────
    public function index()
    {
        $schoolId = auth()->user()->school_id;

        $leaveTypes = LeaveType::where('school_id', $schoolId)
            ->where('active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'days_allowed_per_year', 'is_paid', 'carry_forward']);

        $leaves = LeaveRequest::where('school_id', $schoolId)
            ->with(['user:id,name,role', 'approvedBy:id,name', 'leaveType:id,name'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($l) => [
                'id'            => $l->id,
                'user_id'       => $l->user_id,
                'name'          => $l->user?->name,
                'role'          => $l->user?->role,
                'leave_type_id' => $l->leave_type_id,
                'type'          => $l->leaveType?->name ?? $l->type,
                'start_date'    => $l->start_date->format('Y-m-d'),
                'end_date'      => $l->end_date->format('Y-m-d'),
                'days'          => $l->days,
                'reason'        => $l->reason,
                'status'        => $l->status,
                'admin_note'    => $l->admin_note,
                'approved_by'   => $l->approvedBy?->name,
                'created_at'    => $l->created_at->format('Y-m-d'),
            ]);

        return response()->json([
            'leaves'      => $leaves,
            'leave_types' => $leaveTypes,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/hr/leave      (HR creates a leave request on behalf of a staff)
    // Applies the same overlap + balance guards as self-service submissions.
    // ──────────────────────────────────────────────────────────────────────────
    public function store(Request $request)
    {
        $schoolId = auth()->user()->school_id;

        $validated = $request->validate([
            'user_id'       => 'required|integer|exists:users,id',
            'leave_type_id' => 'required|integer|exists:leave_types,id',
            'start_date'    => 'required|date',
            'end_date'      => 'required|date|after_or_equal:start_date',
            'reason'        => 'required|string|max:1000',
            'status'        => 'in:Pending,Approved',   // HR can directly approve
        ]);

        // Verify the target user belongs to this school
        $targetUser = User::withoutGlobalScopes()
            ->where('id', $validated['user_id'])
            ->where('school_id', $schoolId)
            ->firstOrFail();

        // Verify leave type belongs to this school
        $leaveType = LeaveType::where('id', $validated['leave_type_id'])
            ->where('school_id', $schoolId)
            ->where('active', true)
            ->first();

        if (! $leaveType) {
            return response()->json(['error' => 'Invalid or inactive leave type.'], 422);
        }

        $start = Carbon::parse($validated['start_date']);
        $end   = Carbon::parse($validated['end_date']);
        $days  = $this->countWeekdays($start, $end);

        // ── Guard 1: Overlap ──────────────────────────────────────────────────
        $overlap = LeaveRequest::where('school_id', $schoolId)
            ->overlapping($targetUser->id, $validated['start_date'], $validated['end_date'])
            ->exists();

        if ($overlap) {
            return response()->json([
                'error' => "{$targetUser->name} already has a pending or approved leave overlapping these dates.",
            ], 422);
        }

        // ── Guard 2: Balance ──────────────────────────────────────────────────
        $balance = LeaveBalance::where('school_id', $schoolId)
            ->where('user_id', $targetUser->id)
            ->where('leave_type_id', $leaveType->id)
            ->where('year', $start->year)
            ->first();

        $status = $validated['status'] ?? 'Pending';

        if ($balance && $balance->remaining_days < $days) {
            return response()->json([
                'error' => "Insufficient balance. {$targetUser->name} has {$balance->remaining_days} day(s) remaining for '{$leaveType->name}'.",
            ], 422);
        }

        // ── Create ────────────────────────────────────────────────────────────
        $leave = LeaveRequest::create([
            'school_id'     => $schoolId,
            'user_id'       => $targetUser->id,
            'leave_type_id' => $leaveType->id,
            'type'          => $leaveType->name,
            'start_date'    => $validated['start_date'],
            'end_date'      => $validated['end_date'],
            'days'          => $days,
            'reason'        => $validated['reason'],
            'status'        => $status,
            'approved_by'   => $status === 'Approved' ? auth()->id() : null,
        ]);

        // Deduct balance immediately if HR created as Approved
        if ($status === 'Approved' && $balance) {
            $balance->increment('used_days', $days);
        }

        return response()->json([
            'message' => 'Leave request created.',
            'leave'   => $leave,
        ], 201);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/hr/leave/{id}/approve
    // Checks overlap on the requested dates, then deducts from leave balance.
    // ──────────────────────────────────────────────────────────────────────────
    public function approve(Request $request, $id)
    {
        $schoolId = auth()->user()->school_id;

        $leave = LeaveRequest::where('school_id', $schoolId)
            ->where('status', 'Pending')
            ->findOrFail($id);

        // ── Overlap guard on approval (another request may have been approved in between)
        $overlap = LeaveRequest::where('school_id', $schoolId)
            ->overlapping(
                $leave->user_id,
                $leave->start_date->format('Y-m-d'),
                $leave->end_date->format('Y-m-d'),
                $leave->id       // exclude this leave itself
            )
            ->exists();

        if ($overlap) {
            return response()->json([
                'error' => 'This leave overlaps with another already-approved leave for this staff member.',
            ], 422);
        }

        $request->validate([
            'note' => 'nullable|string|max:500',
        ]);

        $leave->update([
            'status'      => 'Approved',
            'approved_by' => auth()->id(),
            'admin_note'  => $request->input('note'),
        ]);

        // ── Deduct from leave balance ─────────────────────────────────────────
        if ($leave->leave_type_id) {
            $year    = $leave->start_date->year;
            $balance = LeaveBalance::where('school_id', $schoolId)
                ->where('user_id', $leave->user_id)
                ->where('leave_type_id', $leave->leave_type_id)
                ->where('year', $year)
                ->first();

            if ($balance) {
                // Safety: don't overdraft below zero
                $deduct = min($leave->days, $balance->remaining_days);
                $balance->increment('used_days', $deduct);
            }
        }

        return response()->json(['message' => 'Leave approved and balance updated.']);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/hr/leave/{id}/reject
    // Rejects and — if it was Approved and then re-opened — reverses the balance.
    // ──────────────────────────────────────────────────────────────────────────
    public function reject(Request $request, $id)
    {
        $schoolId = auth()->user()->school_id;

        // Allow rejecting both Pending and Approved (HR override)
        $leave = LeaveRequest::where('school_id', $schoolId)
            ->whereIn('status', ['Pending', 'Approved'])
            ->findOrFail($id);

        $request->validate([
            'note' => 'nullable|string|max:500',
        ]);

        $wasApproved = $leave->status === 'Approved';

        $leave->update([
            'status'      => 'Rejected',
            'approved_by' => auth()->id(),
            'admin_note'  => $request->input('note'),
        ]);

        // ── Reverse balance if this was already approved ──────────────────────
        if ($wasApproved && $leave->leave_type_id) {
            $year    = $leave->start_date->year;
            $balance = LeaveBalance::where('school_id', $schoolId)
                ->where('user_id', $leave->user_id)
                ->where('leave_type_id', $leave->leave_type_id)
                ->where('year', $year)
                ->first();

            if ($balance && $balance->used_days >= $leave->days) {
                $balance->decrement('used_days', $leave->days);
            }
        }

        return response()->json(['message' => 'Leave rejected.' . ($wasApproved ? ' Balance has been reversed.' : '')]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Count weekdays (Mon–Fri) inclusive of both dates.
     */
    private function countWeekdays(Carbon $start, Carbon $end): int
    {
        $days    = 0;
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
