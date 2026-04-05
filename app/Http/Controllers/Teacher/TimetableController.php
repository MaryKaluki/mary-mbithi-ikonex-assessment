<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\TimetableSlot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TimetableController extends Controller
{
    /**
     * GET /api/teacher/timetable
     * Teacher's personal timetable — only slots where teacher_id = this teacher.
     */
    public function index()
    {
        $teacher  = auth()->user();
        $schoolId = $teacher->school_id;

        $slots = DB::table('timetable_slots')
            ->join('classes', 'timetable_slots.class_id', '=', 'classes.id')
            ->leftJoin('subjects', 'timetable_slots.subject_id', '=', 'subjects.id')
            ->where('timetable_slots.school_id', $schoolId)
            ->where('timetable_slots.teacher_id', $teacher->id)
            ->select(
                'timetable_slots.id',
                'timetable_slots.day',
                'timetable_slots.time_slot',
                'timetable_slots.end_time',
                'timetable_slots.timetable_type',
                'timetable_slots.is_break',
                'classes.id as class_id',
                'classes.name as class_name',
                'subjects.id as subject_id',
                'subjects.name as subject_name'
            )
            ->orderByRaw("FIELD(timetable_slots.day,'Monday','Tuesday','Wednesday','Thursday','Friday')")
            ->orderBy('timetable_slots.time_slot')
            ->get();

        $days    = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        $grouped = [];
        foreach ($days as $day) {
            $grouped[$day] = $slots->where('day', $day)->values();
        }

        // Derive unique time slots from saved data; fall back to school defaults
        $times = $slots->where('is_break', false)
            ->pluck('time_slot')
            ->unique()
            ->sort()
            ->values();

        return response()->json([
            'timetable'  => $grouped,
            'time_slots' => $times,
        ]);
    }

    /**
     * GET /api/teacher/school-classes
     * All classes in the school — used to populate the timetable editor dropdown.
     * Any teacher can see all classes; they are not restricted to their home class.
     */
    public function allSchoolClasses()
    {
        $schoolId = auth()->user()->school_id;

        $classes = SchoolClass::where('school_id', $schoolId)
            ->orderBy('name')
            ->get(['id', 'name', 'level', 'curriculum_type']);

        return response()->json($classes);
    }

    /**
     * GET /api/teacher/timetables/{class_id}
     * Return all slots for a class so the teacher can see the full grid
     * and fill in their own periods. Any teacher in the school can view.
     */
    public function getForClass($classId)
    {
        $teacher  = auth()->user();
        $schoolId = $teacher->school_id;

        // Verify the class belongs to this school — no class_teacher restriction
        $class = SchoolClass::where('school_id', $schoolId)->findOrFail($classId);

        $slots = DB::table('timetable_slots')
            ->leftJoin('subjects', 'timetable_slots.subject_id', '=', 'subjects.id')
            ->leftJoin('users', 'timetable_slots.teacher_id', '=', 'users.id')
            ->where('timetable_slots.class_id', $classId)
            ->select(
                'timetable_slots.id',
                'timetable_slots.day',
                'timetable_slots.time_slot',
                'timetable_slots.end_time',
                'timetable_slots.timetable_type',
                'timetable_slots.subject_id',
                'timetable_slots.teacher_id',
                'timetable_slots.is_break',
                'subjects.name as subject_name',
                'users.name as teacher_name'
            )
            ->orderByRaw("FIELD(timetable_slots.day,'Monday','Tuesday','Wednesday','Thursday','Friday')")
            ->orderBy('timetable_slots.time_slot')
            ->get();

        return response()->json([
            'class' => ['id' => $class->id, 'name' => $class->name],
            'slots' => $slots,
        ]);
    }

    /**
     * PUT /api/teacher/timetables/{class_id}
     * Save this teacher's own slots for the given class.
     *
     * Important: only deletes slots where teacher_id = this teacher.
     * Other teachers' slots in the same class are preserved.
     */
    public function saveForClass(Request $request, $classId)
    {
        $teacher  = auth()->user();
        $schoolId = $teacher->school_id;

        // Verify class belongs to this school
        $class = SchoolClass::where('school_id', $schoolId)->findOrFail($classId);

        $data = $request->validate([
            'slots'                   => 'required|array',
            'slots.*.day'             => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday',
            'slots.*.time_slot'       => 'required|string|max:10',
            'slots.*.end_time'        => 'nullable|string|max:10',
            'slots.*.timetable_type'  => 'nullable|in:personal,class,exams',
            'slots.*.subject_id'      => 'nullable|exists:subjects,id',
            'slots.*.is_break'        => 'boolean',
        ]);

        // Only remove THIS teacher's slots — preserve other teachers' entries
        TimetableSlot::where('class_id', $class->id)
            ->where('teacher_id', $teacher->id)
            ->delete();

        foreach ($data['slots'] as $slot) {
            TimetableSlot::create([
                'school_id'      => $schoolId,
                'class_id'       => $class->id,
                'day'            => $slot['day'],
                'time_slot'      => $slot['time_slot'],
                'end_time'       => $slot['end_time'] ?? null,
                'timetable_type' => $slot['timetable_type'] ?? 'personal',
                'subject_id'     => $slot['subject_id'] ?? null,
                'teacher_id'     => $teacher->id,
                'is_break'       => $slot['is_break'] ?? false,
            ]);
        }

        return response()->json(['message' => 'Timetable saved.']);
    }
}
