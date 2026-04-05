<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Homework;
use App\Models\SchoolClass;
use Illuminate\Http\Request;

class HomeworkController extends Controller
{
    public function index()
    {
        $teacher  = auth()->user();
        $schoolId = $teacher->school_id;

        $hw = Homework::where('school_id', $schoolId)
            ->where('teacher_id', $teacher->id)
            ->with('schoolClass:id,name')
            ->orderByDesc('due_date')
            ->get()
            ->map(fn($h) => [
                'id'           => $h->id,
                'subject_name' => $h->subject_name,
                'title'        => $h->title,
                'description'  => $h->description,
                'due_date'     => $h->due_date,
                'class_name'   => $h->schoolClass?->name ?? '—',
                'class_id'     => $h->class_id,
                'overdue'      => $h->due_date < now()->toDateString(),
                'created_at'   => $h->created_at->toDateString(),
            ]);

        return response()->json($hw);
    }

    public function store(Request $request)
    {
        $teacher  = auth()->user();
        $schoolId = $teacher->school_id;

        $validated = $request->validate([
            'class_id'     => 'required|integer',
            'subject_name' => 'required|string|max:100',
            'title'        => 'required|string|max:255',
            'description'  => 'nullable|string',
            'due_date'     => 'required|date|after_or_equal:today',
        ]);

        SchoolClass::where('school_id', $schoolId)->findOrFail($validated['class_id']);

        $hw = Homework::create([
            'school_id'    => $schoolId,
            'teacher_id'   => $teacher->id,
            'class_id'     => $validated['class_id'],
            'subject_name' => $validated['subject_name'],
            'title'        => $validated['title'],
            'description'  => $validated['description'] ?? null,
            'due_date'     => $validated['due_date'],
        ]);

        return response()->json(['message' => 'Homework added.', 'homework' => $hw], 201);
    }

    public function destroy($id)
    {
        $teacher  = auth()->user();
        $schoolId = $teacher->school_id;

        Homework::where('school_id', $schoolId)
            ->where('teacher_id', $teacher->id)
            ->findOrFail($id)
            ->delete();

        return response()->json(['message' => 'Homework deleted.']);
    }
}
