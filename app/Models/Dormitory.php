<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Dormitory extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'school_id', 'name', 'type', 'capacity', 'warden_id', 'status',
    ];

    public function warden()
    {
        return $this->belongsTo(User::class, 'warden_id');
    }

    public function allocations()
    {
        return $this->hasMany(DormAllocation::class);
    }
}
