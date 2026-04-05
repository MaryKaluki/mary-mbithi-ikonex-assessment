<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use BelongsToTenant;

    protected $guarded = [];

    public function designations()
    {
        return $this->hasMany(Designation::class);
    }

    public function staffRecords()
    {
        return $this->hasMany(StaffRecord::class);
    }
}
