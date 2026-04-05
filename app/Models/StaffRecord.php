<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class StaffRecord extends Model
{
    use BelongsToTenant;

    protected $guarded = [];

    protected $casts = [
        'date_of_joining'   => 'date',
        'date_of_leaving'   => 'date',
        'probation_start'   => 'date',
        'probation_end'     => 'date',
        'contract_end_date' => 'date',
        'basic_salary'      => 'float',
        'allowance'         => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function designation()
    {
        return $this->belongsTo(Designation::class);
    }

    /** Computed gross salary */
    public function getGrossSalaryAttribute(): float
    {
        return $this->basic_salary + $this->allowance;
    }

    /** Days until contract expires — null if no contract_end_date */
    public function getDaysUntilContractExpiryAttribute(): ?int
    {
        return $this->contract_end_date
            ? now()->diffInDays($this->contract_end_date, false)
            : null;
    }

    /** Days until probation ends — null if no probation_end */
    public function getDaysUntilProbationEndAttribute(): ?int
    {
        return $this->probation_end
            ? now()->diffInDays($this->probation_end, false)
            : null;
    }
}
