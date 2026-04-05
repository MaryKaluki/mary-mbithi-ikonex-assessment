<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Dormitory;
use App\Models\DormAllocation;
use App\Models\Student;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DormController extends Controller
{
    public function index()
    {
        $dorms = Dormitory::with(['warden', 'allocations'])
            ->get()
            ->map(function ($dorm) {
                return [
                    'id'       => $dorm->id,
                    'name'     => $dorm->name,
                    'type'     => $dorm->type,
                    'capacity' => $dorm->capacity,
                    'occupied' => $dorm->allocations->count(),
                    'warden'   => $dorm->warden ? $dorm->warden->name : 'Unassigned',
                    'status'   => $dorm->status,
                ];
            });

        return response()->json($dorms);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'      => 'required|string|max:150',
            'type'      => 'required|in:Boys,Girls,Junior Boys,Junior Girls,Mixed',
            'capacity'  => 'required|integer|min:1',
            'warden_id' => 'nullable|exists:users,id',
            'status'    => 'nullable|in:Active,Full,Closed',
        ]);

        return response()->json(Dormitory::create($data), 201);
    }

    public function allocate(Request $request, $dormId)
    {
        $dorm = Dormitory::findOrFail($dormId);

        $data = $request->validate([
            'student_id'  => 'required|exists:students,id',
            'room_number' => 'nullable|string|max:20',
        ]);

        // Remove any existing allocation for this student
        DormAllocation::where('student_id', $data['student_id'])->delete();

        $allocation = DormAllocation::create([
            'dormitory_id'  => $dorm->id,
            'student_id'    => $data['student_id'],
            'room_number'   => $data['room_number'] ?? null,
            'assigned_date' => Carbon::today(),
        ]);

        return response()->json($allocation, 201);
    }
}
