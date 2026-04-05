<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Student;
use Illuminate\Support\Str;

class StudentController extends Controller
{
    /**
     * Display a listing of the students.
     */
    public function index()
    {
        // BelongsToTenant scope automatically filters by the user's school_id
        $students = Student::orderBy('created_at', 'desc')->get();
        return response()->json(['students' => $students]);
    }

    /**
     * Store a newly created student.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            // Identification
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date|before:today',
            'gender' => 'required|in:Male,Female,Other',
            'nemis_upi' => 'nullable|string|unique:students,nemis_upi',
            'birth_certificate_number' => 'nullable|string|unique:students,birth_certificate_number',
            
            // Medical & Demographic
            'blood_group' => 'nullable|string|max:10',
            'religion' => 'nullable|string|max:50',
            'nationality' => 'required|string|max:100',
            'medical_conditions' => 'nullable|string',
            'allergies' => 'nullable|string',
            'has_special_needs' => 'boolean',
            'special_needs_details' => 'nullable|string',
            
            // Academic & Logistics
            'grade_level' => 'required|string',
            'house_group' => 'nullable|string|max:50',
            'mode_of_transport' => 'required|in:Walking,Private,School Bus,Public',
            'previous_school' => 'nullable|string|max:255',
            'residential_address' => 'nullable|string',
            
            // Parent/Guardian 1
            'parent_name' => 'required|string|max:255',
            'parent_relationship' => 'required|in:Father,Mother,Guardian,Other',
            'parent_phone' => 'required|string|max:50',
            'parent_email' => 'nullable|email|max:255',
            
            // Parent/Guardian 2
            'secondary_parent_name' => 'nullable|string|max:255',
            'secondary_parent_relationship' => 'nullable|string|max:100',
            'secondary_parent_phone' => 'nullable|string|max:50',
        ]);

        $school = $request->user()->school;

        // Generate Admission Number
        $count = Student::withoutGlobalScopes()->where('school_id', $school->id)->count() + 1;
        $prefix = strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $school->name), 0, 3));
        $admissionNumber = 'ADM-' . $prefix . '-' . date('Y') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

        $student = Student::create([
            'school_id' => $school->id,
            'admission_number' => $admissionNumber,
            'admission_date' => now()->toDateString(),
            'first_name' => $validated['first_name'],
            'middle_name' => $validated['middle_name'] ?? null,
            'last_name' => $validated['last_name'],
            'date_of_birth' => $validated['date_of_birth'],
            'gender' => $validated['gender'],
            'nemis_upi' => $validated['nemis_upi'] ?? null,
            'birth_certificate_number' => $validated['birth_certificate_number'] ?? null,
            'blood_group' => $validated['blood_group'] ?? null,
            'religion' => $validated['religion'] ?? null,
            'nationality' => $validated['nationality'] ?? 'Kenyan',
            'medical_conditions' => $validated['medical_conditions'] ?? null,
            'allergies' => $validated['allergies'] ?? null,
            'has_special_needs' => $validated['has_special_needs'] ?? false,
            'special_needs_details' => $validated['special_needs_details'] ?? null,
            'grade_level' => $validated['grade_level'],
            'house_group' => $validated['house_group'] ?? null,
            'mode_of_transport' => $validated['mode_of_transport'] ?? 'Walking',
            'previous_school' => $validated['previous_school'] ?? null,
            'residential_address' => $validated['residential_address'] ?? null,
            'status' => 'Active',
            'parent_name' => $validated['parent_name'],
            'parent_relationship' => $validated['parent_relationship'],
            'parent_phone' => $validated['parent_phone'],
            'parent_email' => $validated['parent_email'] ?? null,
            'secondary_parent_name' => $validated['secondary_parent_name'] ?? null,
            'secondary_parent_relationship' => $validated['secondary_parent_relationship'] ?? null,
            'secondary_parent_phone' => $validated['secondary_parent_phone'] ?? null,
        ]);

        return response()->json([
            'message' => 'Student admitted successfully',
            'student' => $student
        ], 201);
    }

    /**
     * Update a student's class / basic details.
     */
    public function update(Request $request, $id)
    {
        $schoolId = auth()->user()->school_id;
        $student  = Student::where('school_id', $schoolId)->findOrFail($id);

        $validated = $request->validate([
            'grade_level' => 'sometimes|string|max:100',
            'status'      => 'sometimes|in:Active,Inactive,Graduated,Transferred',
        ]);

        $student->update($validated);

        return response()->json(['message' => 'Student updated.', 'student' => $student]);
    }

    /**
     * Remove the specified student.
     */
    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:students,id'
        ]);

        $schoolId = auth()->user()->school_id;
        Student::where('school_id', $schoolId)->whereIn('id', $validated['ids'])->delete();

        return response()->json([
            'message' => 'Students deleted successfully.'
        ]);
    }
}
