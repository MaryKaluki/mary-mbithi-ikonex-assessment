<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayrollRecord extends Model
{
    use \App\Models\Traits\BelongsToTenant;

    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function generatedBy()
    {
        return $this->belongsTo(User::class, 'generated_by');
    }
}
