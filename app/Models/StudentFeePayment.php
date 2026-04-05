<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentFeePayment extends Model
{
    use \App\Models\Traits\BelongsToTenant;

    protected $guarded = [];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
