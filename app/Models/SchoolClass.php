<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class SchoolClass extends Model
{
    use BelongsToTenant;

    protected $table = 'classes';

    protected $fillable = [
        'school_id', 'name', 'level', 'section',
        'curriculum_type', 'class_teacher_id', 'capacity',
    ];

    public function classTeacher()
    {
        return $this->belongsTo(User::class, 'class_teacher_id');
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'grade_level', 'name');
    }

    public function timetableSlots()
    {
        return $this->hasMany(TimetableSlot::class, 'class_id');
    }
}
