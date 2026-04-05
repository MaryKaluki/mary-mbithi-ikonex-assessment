<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'school_id', 'name', 'code', 'department',
        'curriculum_type', 'grade_levels', 'is_elective',
    ];

    protected $casts = [
        'grade_levels' => 'array',
        'is_elective'  => 'boolean',
    ];
}
