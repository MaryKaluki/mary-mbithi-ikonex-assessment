<?php

namespace App\Http\Middleware;

use App\Models\School;
use Closure;
use Illuminate\Http\Request;

/**
 * EnsureTenantActive
 *
 * Applied after auth:sanctum on every school-scoped route group.
 * Guarantees that:
 *  1. The authenticated user has a school_id (is not an orphaned account).
 *  2. That school exists and is not suspended/inactive/cancelled.
 *
 * If the school is suspended mid-session, this revokes the user's current
 * token and returns a 403 — the frontend will redirect to login automatically
 * via the existing 401/403 Axios interceptor.
 *
 * Platform admins bypass this check entirely.
 */
class EnsureTenantActive
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        // Platform admins operate across all schools — skip tenant check
        if ($user->isPlatformAdmin()) {
            return $next($request);
        }

        // Every school-scoped user must have a school_id
        if (empty($user->school_id)) {
            $user->currentAccessToken()->delete();

            return response()->json([
                'message' => 'Your account is not linked to a school. Please contact support.',
                'code'    => 'NO_SCHOOL',
            ], 403);
        }

        // Load school without global scope — we need the raw record regardless of auth context
        $school = School::withoutGlobalScopes()->find($user->school_id);

        if (! $school) {
            $user->currentAccessToken()->delete();

            return response()->json([
                'message' => 'School record not found. Please contact support.',
                'code'    => 'SCHOOL_NOT_FOUND',
            ], 403);
        }

        if (in_array($school->status, ['suspended', 'inactive', 'cancelled'], true)) {
            // Revoke the session token so the user is fully signed out
            $user->currentAccessToken()->delete();

            return response()->json([
                'message' => 'Your school account has been suspended. Please contact support.',
                'code'    => 'SCHOOL_SUSPENDED',
            ], 403);
        }

        return $next($request);
    }
}
