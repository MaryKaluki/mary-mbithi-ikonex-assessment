<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    use BelongsToTenant;

    protected $guarded = [];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function leaveType()
    {
        return $this->belongsTo(LeaveType::class);
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    /**
     * Scope: overlapping leave requests for a user within a date range.
     * Catches any leave whose window intersects [start, end].
     */
    public function scopeOverlapping($query, int $userId, string $start, string $end, ?int $excludeId = null)
    {
        $query->where('user_id', $userId)
              ->whereIn('status', ['Pending', 'Approved'])
              ->where('start_date', '<=', $end)
              ->where('end_date',   '>=', $start);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query;
    }
}

