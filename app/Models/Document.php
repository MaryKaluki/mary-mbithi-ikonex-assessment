<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'school_id', 'name', 'file_path', 'mime_type',
        'size_bytes', 'category', 'uploaded_by',
        'visibility_type', 'visible_to_user_id'
    ];

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function visibleTo()
    {
        return $this->belongsTo(User::class, 'visible_to_user_id');
    }
}
