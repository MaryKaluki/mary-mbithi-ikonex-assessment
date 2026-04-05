<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class SchoolScope implements Scope
{
    /**
     * Auto-filter queries to the authenticated user's school.
     * Platform admins bypass this filter and see all records.
     */
    public function apply(Builder $builder, Model $model): void
    {
        if (auth()->check() && ! auth()->user()->isPlatformAdmin()) {
            // If the model is the School itself, we filter by its PK (id)
            // Otherwise, we filter by the school_id column
            $column = ($model instanceof \App\Models\School) ? 'id' : 'school_id';
            
            $builder->where(
                $model->getTable() . '.' . $column,
                auth()->user()->school_id
            );
        }
    }
}
