<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * POST /api/auth/login
     *
     * Security measures:
     * - withoutGlobalScopes: login runs before auth context exists; explicitly
     *   bypass SchoolScope so we can find the user by email across all schools.
     * - Generic error message: same response for wrong email or wrong password
     *   to prevent user enumeration.
     * - School status gate: suspended schools cannot log in.
     * - Single-session enforcement: all previous tokens are revoked on login.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email|max:255',
            'password' => 'required|string|min:6|max:255',
        ]);

        // withoutGlobalScopes because no auth context exists yet at login time
        $user = User::withoutGlobalScopes()
            ->where('email', $request->email)
            ->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Block login for non-platform-admins whose school is suspended or inactive
        if (! $user->isPlatformAdmin()) {
            $school = \App\Models\School::withoutGlobalScopes()->find($user->school_id);

            if (! $school) {
                return response()->json([
                    'message' => 'Account error: school not found. Please contact support.',
                ], 403);
            }

            if (in_array($school->status, ['suspended', 'inactive', 'cancelled'])) {
                return response()->json([
                    'message' => 'Your school account is currently suspended. Please contact support.',
                    'code'    => 'SCHOOL_SUSPENDED',
                ], 403);
            }
        }

        // Revoke all previous tokens — enforce single active session per user
        $user->tokens()->delete();

        // Issue new token
        $token = $user->createToken('ikonex-spa')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $this->formatUser($user),
        ]);
    }

    /**
     * POST /api/auth/logout
     * Revokes only the current token.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    /**
     * GET /api/auth/me
     * Returns the authenticated user with their school.
     * Also prunes expired tokens on each me() call (lightweight housekeeping).
     */
    public function me(Request $request)
    {
        $user = $request->user();

        // Prune tokens older than the configured expiry (if set)
        $expiry = config('sanctum.expiration');
        if ($expiry) {
            $user->tokens()
                ->where('last_used_at', '<', now()->subMinutes($expiry))
                ->whereNotNull('last_used_at')
                ->delete();
        }

        $user->load('school:id,name,logo_path,domain,plan,status');

        return response()->json($this->formatUser($user));
    }

    private function formatUser(User $user): array
    {
        return [
            'id'        => $user->id,
            'name'      => $user->name,
            'email'     => $user->email,
            'role'      => $user->role,
            'school_id' => $user->school_id,
            'school'    => $user->school ? [
                'id'        => $user->school->id,
                'name'      => $user->school->name,
                'logo_path' => $user->school->logo_path,
                'domain'    => $user->school->domain,
                'plan'      => $user->school->plan,
                'status'    => $user->school->status,
            ] : null,
        ];
    }
}
