<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Homework extends Model
{
    use BelongsToTenant;

    protected $table = 'homeworks';
    protected $guarded = [];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }
}
