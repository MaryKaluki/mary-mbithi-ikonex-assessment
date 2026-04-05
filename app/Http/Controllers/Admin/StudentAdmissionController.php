<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Student;

class StudentAdmissionController extends Controller
{
    public function store(Request $request)
    {
        // Dummy submission logic handling NEMIS logic
        $data = $request->validate([
            'first_name' => 'required',
            'last_name' => 'required',
            'grade_level' => 'required',
            'nemis_upi' => 'nullable|string',
            'fee_structure_id' => 'nullable|integer',
        ]);
        
        // Save logic to Student table
        // We will just generate a dummy ID for now
        $data['school_id'] = auth()->user()->school_id;
        $data['user_id'] = auth()->id();
        $data['admission_number'] = 'ADM-' . rand(1000, 9999);
        
        $student = Student::create($data);

        return response()->json(['message' => 'Student admitted successfully', 'student' => $student]);
    }
}
