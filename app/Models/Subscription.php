<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'plan_name',
        'amount',
        'period',
        'next_billing_date',
        'status',
    ];

    protected $casts = [
        'next_billing_date' => 'date',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}
