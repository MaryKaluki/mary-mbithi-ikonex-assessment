<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\SchoolClass;
use App\Models\Student;
use Illuminate\Support\Facades\DB;

class ClassController extends Controller
{
    /**
     * Return all classes this teacher is responsible for.
     */
    public function index()
    {
        $teacher  = auth()->user();
        $schoolId = $teacher->school_id;

        // Classes where teacher is assigned as class teacher
        $homeClasses = SchoolClass::where('school_id', $schoolId)
            ->where('class_teacher_id', $teacher->id)
            ->get(['id', 'name', 'level', 'section', 'curriculum_type', 'capacity'])
            ->keyBy('id');

        // Classes from timetable (teacher teaches a subject there)
        $ttClassIds = DB::table('timetable_slots')
            ->where('school_id', $schoolId)
            ->where('teacher_id', $teacher->id)
            ->pluck('class_id')
            ->unique();

        $ttClasses = SchoolClass::where('school_id', $schoolId)
            ->whereIn('id', $ttClassIds)
            ->get(['id', 'name', 'level', 'section', 'curriculum_type', 'capacity'])
            ->keyBy('id');

        // Merge — home classes first
        $merged = $homeClasses->union($ttClasses)->values();

        // Attach student count and today's attendance status to each
        $today = now()->toDateString();
        $classes = $merged->map(function ($cls) use ($schoolId, $today) {
            $students = Student::where('school_id', $schoolId)
                ->where('grade_level', $cls->name)
                ->where('status', 'Active')
                ->count();

            $markedToday = Attendance::where('school_id', $schoolId)
                ->where('class_id', $cls->id)
                ->where('date', $today)
                ->exists();

            return [
                'id'              => $cls->id,
                'name'            => $cls->name,
                'level'           => $cls->level,
                'section'         => $cls->section,
                'curriculum_type' => $cls->curriculum_type,
                'capacity'        => $cls->capacity,
                'student_count'   => $students,
                'attendance_marked_today' => $markedToday,
            ];
        });

        return response()->json($classes);
    }

    /**
     * Return students in a specific class.
     */
    public function students($classId)
    {
        $teacher  = auth()->user();
        $schoolId = $teacher->school_id;

        $class = SchoolClass::where('school_id', $schoolId)->findOrFail($classId);

        $students = Student::where('school_id', $schoolId)
            ->where('grade_level', $class->name)
            ->where('status', 'Active')
            ->orderBy('first_name')
            ->get()
            ->map(fn($s) => [
                'id'               => $s->id,
                'name'             => trim($s->first_name . ' ' . $s->last_name),
                'first_name'       => $s->first_name,
                'last_name'        => $s->last_name,
                'admission_number' => $s->admission_number,
                'nemis_upi'        => $s->nemis_upi,
                'gender'           => $s->gender,
                'grade_level'      => $s->grade_level,
                'date_of_birth'    => $s->date_of_birth,
                'blood_group'      => $s->blood_group,
                'allergies'        => $s->allergies,
                'medical_conditions' => $s->medical_conditions,
                'parent_name'      => $s->parent_name,
                'parent_relationship' => $s->parent_relationship,
                'parent_phone'     => $s->parent_phone,
                'parent_email'     => $s->parent_email,
                'secondary_parent_name' => $s->secondary_parent_name,
                'secondary_parent_phone' => $s->secondary_parent_phone,
                'residential_address' => $s->residential_address,
            ]);

        return response()->json([
            'class'    => ['id' => $class->id, 'name' => $class->name],
            'students' => $students,
        ]);
    }
}
