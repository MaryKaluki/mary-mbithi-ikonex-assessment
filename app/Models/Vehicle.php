<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'school_id', 'plate_number', 'make', 'model', 'capacity', 'status',
    ];

    public function routes()
    {
        return $this->hasMany(TransportRoute::class);
    }
}
