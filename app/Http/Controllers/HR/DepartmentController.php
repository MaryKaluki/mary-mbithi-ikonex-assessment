<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Designation;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index()
    {
        $schoolId = auth()->user()->school_id;

        $departments = Department::where('school_id', $schoolId)
            ->withCount('staffRecords')
            ->orderBy('name')
            ->get();

        $designations = Designation::where('school_id', $schoolId)
            ->orderBy('name')
            ->get(['id', 'name', 'description']);

        return response()->json([
            'departments'  => $departments,
            'designations' => $designations,
        ]);
    }

    public function storeDepartment(Request $request)
    {
        $schoolId = auth()->user()->school_id;
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
        ]);

        $dept = Department::create(array_merge($data, ['school_id' => $schoolId]));

        return response()->json($dept, 201);
    }

    public function updateDepartment(Request $request, $id)
    {
        $schoolId = auth()->user()->school_id;
        $dept = Department::where('school_id', $schoolId)->findOrFail($id);

        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
        ]);

        $dept->update($data);

        return response()->json($dept);
    }

    public function destroyDepartment($id)
    {
        $schoolId = auth()->user()->school_id;
        Department::where('school_id', $schoolId)->findOrFail($id)->delete();

        return response()->json(['message' => 'Department deleted.']);
    }

    public function storeDesignation(Request $request)
    {
        $schoolId = auth()->user()->school_id;
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
        ]);

        $des = Designation::create(array_merge($data, ['school_id' => $schoolId]));

        return response()->json($des, 201);
    }

    public function updateDesignation(Request $request, $id)
    {
        $schoolId = auth()->user()->school_id;
        $des = Designation::where('school_id', $schoolId)->findOrFail($id);

        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
        ]);

        $des->update($data);

        return response()->json($des);
    }

    public function destroyDesignation($id)
    {
        $schoolId = auth()->user()->school_id;
        Designation::where('school_id', $schoolId)->findOrFail($id)->delete();

        return response()->json(['message' => 'Designation deleted.']);
    }
}
