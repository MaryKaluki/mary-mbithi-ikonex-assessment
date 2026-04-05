<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class LeaveType extends Model
{
    use BelongsToTenant;

    protected $guarded = [];

    protected $casts = [
        'is_paid'            => 'boolean',
        'carry_forward'      => 'boolean',
        'requires_document'  => 'boolean',
        'active'             => 'boolean',
        'days_allowed_per_year' => 'integer',
        'carry_forward_max'  => 'integer',
    ];

    public function leaveBalances()
    {
        return $this->hasMany(LeaveBalance::class);
    }

    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }
}
