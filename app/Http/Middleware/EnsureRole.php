<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureRole
{
    /**
     * Enforce role-based access control.
     * Usage in routes: middleware('role:platform_admin')
     *                  middleware('role:school_admin,teacher')
     */
    public function handle(Request $request, Closure $next, string ...$roles): mixed
    {
        if (! $request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (! empty($roles) && ! $request->user()->hasRole($roles)) {
            return response()->json(['message' => 'Forbidden. Insufficient role.'], 403);
        }

        return $next($request);
    }
}
