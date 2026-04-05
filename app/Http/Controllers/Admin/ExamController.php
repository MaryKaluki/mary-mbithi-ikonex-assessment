<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Exam;

class ExamController extends Controller
{
    public function index()
    {
        $exams = Exam::latest()->get();
        return response()->json($exams);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'target_curriculum' => 'required',
        ]);

        $validated['school_id'] = auth()->user()->school_id;
        $validated['status'] = 'Upcoming';
        
        $exam = Exam::create($validated);
        return response()->json(['message' => 'Exam created successfully', 'exam' => $exam]);
    }

    public function saveMarks(Request $request, $id)
    {
        // Dummy endpoint for marks
        return response()->json(['message' => 'Marks saved successfully']);
    }
}
