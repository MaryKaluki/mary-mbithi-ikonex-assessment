<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notice extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'school_id',
        'created_by',
        'title',
        'content',
        'type',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'date',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
