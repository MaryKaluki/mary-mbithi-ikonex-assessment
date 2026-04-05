<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class TimetableSlot extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'school_id', 'class_id', 'subject_id', 'teacher_id',
        'day', 'time_slot', 'end_time', 'timetable_type', 'is_break',
    ];

    protected $casts = [
        'is_break' => 'boolean',
    ];

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}
