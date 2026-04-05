<?php

namespace App\Models;

use App\Models\Scopes\SchoolScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class School extends Model
{
    use HasFactory;

    protected static function booted(): void
    {
        static::addGlobalScope(new SchoolScope());
    }

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'domain',
        'school_type',
        'phone',
        'address',
        'deployment_date',
        'admin_email',
        'logo_path',
        'plan',
        'status',
        'storage_limit_mb'
    ];

    public function subscription()
    {
        return $this->hasOne(Subscription::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function usedStorageMB()
    {
        $bytes = Document::where('school_id', $this->id)->sum('size_bytes');
        return round($bytes / 1048576, 2); // Convert bytes to MB
    }
}
