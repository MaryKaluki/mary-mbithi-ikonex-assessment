<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class StaffDocument extends Model
{
    use BelongsToTenant;

    protected $guarded = [];

    protected $casts = [
        'expiry_date'       => 'date',
        'expiry_alert_days' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /** True if expiry_date exists and is within the alert window */
    public function getIsExpiringSoonAttribute(): bool
    {
        if (! $this->expiry_date) return false;
        return $this->expiry_date->diffInDays(now(), false) >= -$this->expiry_alert_days;
    }

    /** True if already expired */
    public function getIsExpiredAttribute(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }
}
