<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    /**
     * Return only subjects belonging to the authenticated user's school.
     * Optionally filters subjects matching the grade level of the passed class_id.
     */
    public function index(Request $request)
    {
        $schoolId = auth()->user()->school_id;
        $classId = $request->query('class_id');

        $query = Subject::where('school_id', $schoolId);

        if ($classId) {
            $class = \App\Models\SchoolClass::where('school_id', $schoolId)->find($classId);
            if ($class) {
                $className = strtolower($class->name);
                
                $gradeKey = null;
                for ($i = 1; $i <= 9; $i++) {
                    if (str_contains($className, "grade {$i}") || str_contains($className, "grade{$i}")) {
                        $gradeKey = "grade_{$i}";
                        break;
                    }
                }
                if (!$gradeKey) {
                    for ($i = 1; $i <= 4; $i++) {
                        if (str_contains($className, "form {$i}") || str_contains($className, "form{$i}")) {
                            $gradeKey = "form_{$i}";
                            break;
                        }
                    }
                }

                if ($gradeKey) {
                    $query->whereJsonContains('grade_levels', $gradeKey);
                } else {
                    $query->where('curriculum_type', $class->curriculum_type);
                }
            }
        }

        return response()->json(
            $query->orderBy('name')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'            => 'required|string|max:150',
            'code'            => 'nullable|string|max:20',
            'department'      => 'nullable|string|max:100',
            'curriculum_type' => 'required|in:CBC,844,Hybrid',
            'grade_levels'    => 'nullable|array',
            'is_elective'     => 'nullable|boolean',
        ]);

        // Always pin to the authenticated user's school — never trust the request body
        $data['school_id'] = auth()->user()->school_id;

        return response()->json(Subject::create($data), 201);
    }

    public function show($id)
    {
        $schoolId = auth()->user()->school_id;
        $subject = Subject::where('school_id', $schoolId)->findOrFail($id);
        return response()->json($subject);
    }

    public function update(Request $request, $id)
    {
        $schoolId = auth()->user()->school_id;

        // Scoped findOrFail — cannot update a subject from another school
        $subject = Subject::where('school_id', $schoolId)->findOrFail($id);

        $data = $request->validate([
            'name'            => 'sometimes|string|max:150',
            'code'            => 'nullable|string|max:20',
            'department'      => 'nullable|string|max:100',
            'curriculum_type' => 'sometimes|in:CBC,844,Hybrid',
            'grade_levels'    => 'nullable|array',
            'is_elective'     => 'nullable|boolean',
        ]);

        // Strip school_id from update payload — school can never be changed
        unset($data['school_id']);

        $subject->update($data);

        return response()->json($subject);
    }

    public function destroy($id)
    {
        $schoolId = auth()->user()->school_id;

        // Scoped findOrFail — cannot delete a subject from another school
        $subject = Subject::where('school_id', $schoolId)->findOrFail($id);
        $subject->delete();

        return response()->json(['message' => 'Subject deleted.']);
    }
}
