<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class SchoolSetting extends Model
{
    use BelongsToTenant;

    protected $fillable = ['school_id', 'key', 'value'];
}
