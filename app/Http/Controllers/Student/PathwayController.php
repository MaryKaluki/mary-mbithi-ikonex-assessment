<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PathwayController extends Controller
{
    public function show()
    {
        $student = auth()->user()->student;
        if (! $student) {
            return response()->json(['error' => 'Student record not found.'], 404);
        }
        return response()->json(['pathway' => $student->pathway ?? null]);
    }

    public function store(Request $request)
    {
        $student = auth()->user()->student;
        if (! $student) {
            return response()->json(['error' => 'Student record not found.'], 404);
        }

        $request->validate(['pathway' => 'required|string|in:STEM,Arts & Sports Science,Social Sciences']);

        $student->update(['pathway' => $request->pathway]);

        return response()->json(['pathway' => $student->pathway, 'message' => 'Pathway saved successfully.']);
    }
}
