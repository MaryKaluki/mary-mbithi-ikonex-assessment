<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class SchoolEvent extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'school_id', 'title', 'type', 'start_date', 'end_date', 'description',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
    ];
}
