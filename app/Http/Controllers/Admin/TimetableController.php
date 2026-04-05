<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TimetableSlot;
use App\Models\SchoolClass;
use Illuminate\Http\Request;

class TimetableController extends Controller
{
    public function show(Request $request)
    {
        $classId = $request->query('class_id');

        if (!$classId) {
            return response()->json(['error' => 'class_id is required.'], 422);
        }

        $class = SchoolClass::findOrFail($classId);

        $slots = TimetableSlot::where('class_id', $classId)
            ->with(['subject', 'teacher'])
            ->get()
            ->map(function ($slot) {
                return [
                    'id'         => $slot->id,
                    'day'        => $slot->day,
                    'time_slot'  => $slot->time_slot,
                    'subject'    => $slot->subject ? $slot->subject->name : null,
                    'teacher'    => $slot->teacher ? $slot->teacher->name : null,
                    'is_break'   => $slot->is_break,
                ];
            });

        return response()->json([
            'class' => ['id' => $class->id, 'name' => $class->name],
            'slots' => $slots,
        ]);
    }

    public function update(Request $request, $classId)
    {
        $class = SchoolClass::findOrFail($classId);

        $data = $request->validate([
            'slots'              => 'required|array',
            'slots.*.day'        => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday',
            'slots.*.time_slot'  => 'required|string',
            'slots.*.subject_id' => 'nullable|exists:subjects,id',
            'slots.*.teacher_id' => 'nullable|exists:users,id',
            'slots.*.is_break'   => 'boolean',
        ]);

        // Clear existing slots for this class and rebuild
        TimetableSlot::where('class_id', $classId)->delete();

        foreach ($data['slots'] as $slot) {
            TimetableSlot::create([
                'class_id'   => $class->id,
                'day'        => $slot['day'],
                'time_slot'  => $slot['time_slot'],
                'subject_id' => $slot['subject_id'] ?? null,
                'teacher_id' => $slot['teacher_id'] ?? null,
                'is_break'   => $slot['is_break'] ?? false,
            ]);
        }

        return response()->json(['message' => 'Timetable saved successfully.']);
    }
}
