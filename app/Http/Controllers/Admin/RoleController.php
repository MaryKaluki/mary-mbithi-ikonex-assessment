<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    // System roles — these are always present and locked from deletion
    private const SYSTEM_ROLES = [
        'super_admin', 'admin', 'teacher', 'accountant',
        'hr_manager', 'librarian', 'student', 'parent', 'driver',
    ];

    public function index()
    {
        // Count users per role scoped to the current school (BelongsToTenant applies)
        $counts = User::selectRaw('role, COUNT(*) as user_count')
            ->groupBy('role')
            ->pluck('user_count', 'role');

        $roles = array_map(function ($role) use ($counts) {
            return [
                'name'       => $role,
                'label'      => $this->roleLabel($role),
                'user_count' => $counts[$role] ?? 0,
                'is_system'  => true,
                'level'      => $this->roleLevel($role),
            ];
        }, self::SYSTEM_ROLES);

        return response()->json(array_values($roles));
    }

    public function store(Request $request)
    {
        // Custom roles are stored as user role tags in this system
        // This endpoint is reserved for future custom role support
        return response()->json(['message' => 'Custom roles are managed at the platform level.'], 403);
    }

    public function destroy($role)
    {
        if (in_array($role, self::SYSTEM_ROLES)) {
            return response()->json(['error' => 'System roles cannot be deleted.'], 403);
        }
        return response()->json(['message' => 'Role deleted.']);
    }

    private function roleLabel($role)
    {
        $labels = [
            'super_admin' => 'Super Admin',
            'admin'       => 'Administrator',
            'teacher'     => 'Teacher',
            'accountant'  => 'Accountant',
            'hr_manager'  => 'HR Manager',
            'librarian'   => 'Librarian',
            'student'     => 'Student',
            'parent'      => 'Parent',
            'driver'      => 'Driver',
        ];
        return $labels[$role] ?? ucfirst(str_replace('_', ' ', $role));
    }

    private function roleLevel($role)
    {
        $levels = [
            'super_admin' => 'Full Access (Root)',
            'admin'       => 'School Administration',
            'teacher'     => 'Academic (Limited)',
            'accountant'  => 'Financial Module Only',
            'hr_manager'  => 'HR Module Only',
            'librarian'   => 'Library Module Only',
            'student'     => 'Student Portal Only',
            'parent'      => 'Parent Portal Only',
            'driver'      => 'Transport Module Only',
        ];
        return $levels[$role] ?? 'Standard Access';
    }
}
