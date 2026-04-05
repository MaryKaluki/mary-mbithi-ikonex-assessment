<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Student;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    /**
     * Display a listing of the users isolated to the active school.
     */
    public function index(Request $request)
    {
        $type = $request->query('type', 'admins');
        
        $roles = [];
        if ($type === 'admins') {
            $roles = ['super_admin', 'admin', 'school_admin'];
        } elseif ($type === 'staff') {
            $roles = ['teacher', 'accountant', 'librarian', 'hr_manager', 'driver'];
        } elseif ($type === 'parents') {
            $roles = ['parent'];
        }

        // BelongsToTenant ensures this is scoped to auth()->user()->school_id
        $usersQuery = User::whereIn('role', $roles)->orderBy('name', 'asc');
        
        $users = $usersQuery->get();

        // If Parents, we can try to append children (students matching parent_email)
        if ($type === 'parents') {
            $users->map(function ($user) {
                // Find students with matching parent_email in the exact same school
                $children = Student::where('parent_email', $user->email)->pluck('first_name')->toArray();
                $user->children_names = $children;
                return $user;
            });
        }

        return response()->json(['users' => $users]);
    }

    /**
     * Create a new staff/admin user for the authenticated school.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|email|unique:users,email',
            'password'   => ['required', 'string', 'min:8'],
            'role'       => 'required|in:teacher,accountant,librarian,hr_manager,driver,school_admin,admin',
            'phone'      => 'nullable|string|max:20',
            'department' => 'nullable|string|max:100',
            'join_date'  => 'nullable|date',
        ]);

        $user = User::create([
            'school_id'  => auth()->user()->school_id,
            'name'       => $validated['name'],
            'email'      => $validated['email'],
            'password'   => Hash::make($validated['password']),
            'role'       => $validated['role'],
            'phone'      => $validated['phone'] ?? null,
            'department' => $validated['department'] ?? null,
            'join_date'  => $validated['join_date'] ?? null,
        ]);

        return response()->json(['message' => 'Staff member created successfully.', 'user' => $user], 201);
    }

    /**
     * Update an existing user (same school only).
     */
    public function update(Request $request, $id)
    {
        $schoolId = auth()->user()->school_id;
        $user = User::where('school_id', $schoolId)->findOrFail($id);

        $validated = $request->validate([
            'name'       => 'sometimes|string|max:255',
            'email'      => 'sometimes|email|unique:users,email,' . $id,
            'password'   => 'nullable|string|min:8',
            'role'       => 'sometimes|in:teacher,accountant,librarian,hr_manager,driver,school_admin,admin',
            'phone'      => 'nullable|string|max:20',
            'department' => 'nullable|string|max:100',
            'join_date'  => 'nullable|date',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json(['message' => 'Staff member updated successfully.', 'user' => $user]);
    }

    /**
     * Remove the specified users from storage.
     */
    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:users,id'
        ]);

        // Scope deletion to the current school to prevent cross-tenant data removal
        $schoolId = auth()->user()->school_id;
        User::where('school_id', $schoolId)->whereIn('id', $validated['ids'])->delete();

        return response()->json([
            'message' => 'Users deleted successfully.'
        ]);
    }
}
