<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class LeaveBalance extends Model
{
    use BelongsToTenant;

    protected $guarded = [];

    protected $casts = [
        'total_days'      => 'float',
        'used_days'       => 'float',
        'carried_forward' => 'float',
        'year'            => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function leaveType()
    {
        return $this->belongsTo(LeaveType::class);
    }

    /** Remaining = total + carry_forward - used */
    public function getRemainingDaysAttribute(): float
    {
        return max(0, $this->total_days + $this->carried_forward - $this->used_days);
    }
}
