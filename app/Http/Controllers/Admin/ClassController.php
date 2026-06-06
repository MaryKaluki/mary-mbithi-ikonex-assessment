<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;

class ClassController extends Controller
{
    public function index()
    {
        $classes = SchoolClass::with('classTeacher')
            ->withCount('students')
            ->orderBy('level')
            ->orderBy('name')
            ->get()
            ->map(function ($cls) {
                return [
                    'id'              => $cls->id,
                    'name'            => $cls->name,
                    'level'           => $cls->level,
                    'section'         => $cls->section,
                    'curriculum_type' => $cls->curriculum_type,
                    'capacity'        => $cls->capacity,
                    'teacher_name'    => $cls->classTeacher ? $cls->classTeacher->name : 'Unassigned',
                    'student_count'   => $cls->students_count,
                ];
            });

        return response()->json($classes);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'             => 'required|string|max:100',
            'level'            => 'required|string|max:100',
            'section'          => 'nullable|string|max:50',
            'curriculum_type'  => 'required|in:CBC,844,Hybrid',
            'class_teacher_id' => 'nullable|exists:users,id',
            'capacity'         => 'nullable|integer|min:1|max:200',
        ]);

        $class = SchoolClass::create($data);

        return response()->json($class, 201);
    }

    public function show($id)
    {
        $schoolId = auth()->user()->school_id;
        $cls = SchoolClass::where('school_id', $schoolId)
            ->with('classTeacher')
            ->withCount('students')
            ->findOrFail($id);

        return response()->json([
            'id'              => $cls->id,
            'name'            => $cls->name,
            'level'           => $cls->level,
            'section'         => $cls->section,
            'curriculum_type' => $cls->curriculum_type,
            'capacity'        => $cls->capacity,
            'teacher_name'    => $cls->classTeacher ? $cls->classTeacher->name : 'Unassigned',
            'class_teacher_id'=> $cls->class_teacher_id,
            'student_count'   => $cls->students_count,
        ]);
    }

    public function update(Request $request, $id)
    {
        $class = SchoolClass::findOrFail($id);

        $data = $request->validate([
            'name'             => 'sometimes|string|max:100',
            'level'            => 'sometimes|string|max:100',
            'section'          => 'nullable|string|max:50',
            'curriculum_type'  => 'sometimes|in:CBC,844,Hybrid',
            'class_teacher_id' => 'nullable|exists:users,id',
            'capacity'         => 'nullable|integer|min:1|max:200',
        ]);

        $class->update($data);

        return response()->json($class);
    }

    public function destroy($id)
    {
        SchoolClass::findOrFail($id)->delete();
        return response()->json(['message' => 'Class deleted.']);
    }

    /**
     * List students currently in this class.
     */
    public function students($id)
    {
        $schoolId = auth()->user()->school_id;
        $class    = SchoolClass::where('school_id', $schoolId)->findOrFail($id);

        $students = Student::where('school_id', $schoolId)
            ->where('grade_level', $class->name)
            ->where('status', 'Active')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'admission_number', 'gender', 'grade_level']);

        return response()->json($students);
    }

    /**
     * Bulk-move selected students into this class (update their grade_level).
     */
    public function assignStudents(Request $request, $id)
    {
        $schoolId = auth()->user()->school_id;
        $class    = SchoolClass::where('school_id', $schoolId)->findOrFail($id);

        $validated = $request->validate([
            'student_ids'   => 'required|array',
            'student_ids.*' => 'integer',
        ]);

        Student::where('school_id', $schoolId)
            ->whereIn('id', $validated['student_ids'])
            ->update(['grade_level' => $class->name]);

        return response()->json(['message' => 'Students assigned to ' . $class->name . '.']);
    }

    /**
     * Teachers available to be assigned as class teacher.
     */
    public function availableTeachers()
    {
        $schoolId = auth()->user()->school_id;

        $teachers = User::where('school_id', $schoolId)
            ->whereIn('role', ['teacher', 'school_admin', 'admin'])
            ->orderBy('name')
            ->get(['id', 'name', 'role']);

        return response()->json($teachers);
    }
}
