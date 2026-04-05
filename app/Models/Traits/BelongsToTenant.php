<?php

namespace App\Models\Traits;

use App\Models\Scopes\SchoolScope;
use Illuminate\Database\Eloquent\Builder;

trait BelongsToTenant
{
    /**
     * Boot the trait to add the global scope and event listeners.
     */
    protected static function bootBelongsToTenant()
    {
        // Automatically fetch records only matching the current admin's school
        static::addGlobalScope(new SchoolScope());

        // Automatically inject the school_id when creating new records
        static::creating(function ($model) {
            if (auth()->check() && !auth()->user()->isPlatformAdmin()) {
                if (empty($model->school_id)) {
                    $model->school_id = auth()->user()->school_id;
                }
            }
        });
    }

    /**
     * Define the relationship to the School model.
     */
    public function school()
    {
        return $this->belongsTo(\App\Models\School::class);
    }
}
