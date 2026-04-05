<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\LeaveType;
use Illuminate\Http\Request;

class LeaveTypeController extends Controller
{
    public function index()
    {
        $schoolId = auth()->user()->school_id;

        return response()->json(
            LeaveType::where('school_id', $schoolId)->orderBy('name')->get()
        );
    }

    public function store(Request $request)
    {
        $schoolId = auth()->user()->school_id;

        $data = $request->validate([
            'name'                 => 'required|string|max:100',
            'is_paid'              => 'boolean',
            'days_allowed_per_year'=> 'required|integer|min:1|max:365',
            'carry_forward'        => 'boolean',
            'carry_forward_max'    => 'integer|min:0',
            'requires_document'    => 'boolean',
        ]);

        $type = LeaveType::create(array_merge($data, [
            'school_id' => $schoolId,
            'active'    => true,
        ]));

        return response()->json($type, 201);
    }

    public function update(Request $request, $id)
    {
        $schoolId = auth()->user()->school_id;
        $type = LeaveType::where('school_id', $schoolId)->findOrFail($id);

        $data = $request->validate([
            'name'                 => 'required|string|max:100',
            'is_paid'              => 'boolean',
            'days_allowed_per_year'=> 'required|integer|min:1|max:365',
            'carry_forward'        => 'boolean',
            'carry_forward_max'    => 'integer|min:0',
            'requires_document'    => 'boolean',
            'active'               => 'boolean',
        ]);

        $type->update($data);

        return response()->json($type);
    }

    public function destroy($id)
    {
        $schoolId = auth()->user()->school_id;
        LeaveType::where('school_id', $schoolId)->findOrFail($id)->delete();

        return response()->json(['message' => 'Leave type deleted.']);
    }
}
