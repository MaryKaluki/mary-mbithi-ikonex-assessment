<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class TransportRoute extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'school_id', 'name', 'vehicle_id', 'driver_id', 'status',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function students()
    {
        return $this->hasMany(Student::class);
    }
}
