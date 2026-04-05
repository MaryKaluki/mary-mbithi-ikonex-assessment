<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    use HasFactory, \App\Models\Traits\BelongsToTenant;
    
    protected $guarded = [];

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}
