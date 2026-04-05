<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffAttendance extends Model
{
    use \App\Models\Traits\BelongsToTenant;

    protected $guarded = [];

    public function staff()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function markedBy()
    {
        return $this->belongsTo(User::class, 'marked_by');
    }
}
