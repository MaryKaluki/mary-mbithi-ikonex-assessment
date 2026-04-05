<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffSalary extends Model
{
    use \App\Models\Traits\BelongsToTenant;

    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
