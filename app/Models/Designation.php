<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Designation extends Model
{
    use BelongsToTenant;

    protected $guarded = [];

    public function staffRecords()
    {
        return $this->hasMany(StaffRecord::class);
    }
}
