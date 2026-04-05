<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Designation;
use App\Models\StaffRecord;
use App\Models\User;
use Illuminate\Http\Request;

class StaffRecordController extends Controller
{
    /**
     * GET /api/hr/staff-records
     * List all staff with their extended record (or null if not yet created).
     */
    public function index()
    {
        $schoolId = auth()->user()->school_id;

        $staff = User::withoutGlobalScopes()
            ->where('school_id', $schoolId)
            ->whereNotIn('role', ['platform_admin', 'parent', 'student'])
            ->with(['staffRecord.department', 'staffRecord.designation'])
            ->orderBy('name')
            ->get()
            ->map(fn($u) => [
                'id'          => $u->id,
                'name'        => $u->name,
                'email'       => $u->email,
                'role'        => $u->role,
                'staff_record'=> $u->staffRecord,
            ]);

        $departments  = Department::where('school_id', $schoolId)->orderBy('name')->get(['id', 'name']);
        $designations = Designation::where('school_id', $schoolId)->orderBy('name')->get(['id', 'name']);

        return response()->json([
            'staff'        => $staff,
            'departments'  => $departments,
            'designations' => $designations,
        ]);
    }

    /**
     * GET /api/hr/staff-records/{userId}
     * Get single staff member's extended record.
     */
    public function show($userId)
    {
        $schoolId = auth()->user()->school_id;

        $user = User::withoutGlobalScopes()
            ->where('school_id', $schoolId)
            ->with(['staffRecord.department', 'staffRecord.designation'])
            ->findOrFail($userId);

        $departments  = Department::where('school_id', $schoolId)->orderBy('name')->get(['id', 'name']);
        $designations = Designation::where('school_id', $schoolId)->orderBy('name')->get(['id', 'name']);

        return response()->json([
            'user'         => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
                'phone' => $user->phone,
            ],
            'staff_record' => $user->staffRecord,
            'departments'  => $departments,
            'designations' => $designations,
        ]);
    }

    /**
     * POST/PUT /api/hr/staff-records/{userId}
     * Create or update the extended record (upsert).
     */
    public function upsert(Request $request, $userId)
    {
        $schoolId = auth()->user()->school_id;

        // Verify user belongs to this school
        User::withoutGlobalScopes()
            ->where('school_id', $schoolId)
            ->findOrFail($userId);

        $data = $request->validate([
            'department_id'       => 'nullable|exists:departments,id',
            'designation_id'      => 'nullable|exists:designations,id',
            'employment_status'   => 'required|in:active,probation,on_leave,terminated,resigned',
            'employment_type'     => 'required|in:permanent,contract,part_time,casual',
            'date_of_joining'     => 'nullable|date',
            'date_of_leaving'     => 'nullable|date|after_or_equal:date_of_joining',
            'probation_start'     => 'nullable|date',
            'probation_end'       => 'nullable|date|after_or_equal:probation_start',
            'contract_end_date'   => 'nullable|date',
            'basic_salary'        => 'required|numeric|min:0',
            'allowance'           => 'nullable|numeric|min:0',
            'id_number'           => 'nullable|string|max:20',
            'kra_pin'             => 'nullable|string|max:20',
            'nssf_no'             => 'nullable|string|max:20',
            'shif_no'             => 'nullable|string|max:20',
            'bank_name'           => 'nullable|string|max:100',
            'account_number'      => 'nullable|string|max:30',
            'sort_code'           => 'nullable|string|max:20',
            'emergency_name'      => 'nullable|string|max:100',
            'emergency_phone'     => 'nullable|string|max:20',
            'emergency_relationship' => 'nullable|string|max:50',
            'current_address'     => 'nullable|string|max:500',
            'permanent_address'   => 'nullable|string|max:500',
            'qualifications'      => 'nullable|string|max:1000',
        ]);

        $record = StaffRecord::updateOrCreate(
            ['school_id' => $schoolId, 'user_id' => $userId],
            array_merge($data, [
                'school_id' => $schoolId,
                'allowance' => $data['allowance'] ?? 0,
            ])
        );

        return response()->json($record->load(['department', 'designation']));
    }
}
