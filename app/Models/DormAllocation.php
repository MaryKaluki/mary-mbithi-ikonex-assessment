<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class DormAllocation extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'school_id', 'dormitory_id', 'student_id', 'room_number', 'assigned_date',
    ];

    protected $casts = [
        'assigned_date' => 'date',
    ];

    public function dormitory()
    {
        return $this->belongsTo(Dormitory::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
