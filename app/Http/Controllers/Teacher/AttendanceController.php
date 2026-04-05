<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\SchoolClass;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    /**
     * Get today's attendance state for a class (to pre-fill the form).
     */
    public function today(Request $request)
    {
        $classId  = $request->query('class_id');
        $teacher  = auth()->user();
        $schoolId = $teacher->school_id;
        $today    = now()->toDateString();

        $class = SchoolClass::where('school_id', $schoolId)->findOrFail($classId);

        $students = Student::where('school_id', $schoolId)
            ->where('grade_level', $class->name)
            ->where('status', 'Active')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'admission_number', 'gender']);

        // Existing attendance records for today
        $existing = Attendance::where('school_id', $schoolId)
            ->where('class_id', $classId)
            ->where('date', $today)
            ->get()
            ->keyBy('student_id');

        $rows = $students->map(fn($s) => [
            'student_id'       => $s->id,
            'name'             => trim($s->first_name . ' ' . $s->last_name),
            'admission_number' => $s->admission_number,
            'gender'           => $s->gender,
            'status'           => $existing[$s->id]->status ?? 'Present',
            'notes'            => $existing[$s->id]->notes  ?? '',
        ]);

        return response()->json([
            'class'      => ['id' => $class->id, 'name' => $class->name],
            'date'       => $today,
            'already_marked' => $existing->isNotEmpty(),
            'students'   => $rows,
        ]);
    }

    /**
     * Save (upsert) attendance for a class on a given date.
     */
    public function store(Request $request)
    {
        $teacher  = auth()->user();
        $schoolId = $teacher->school_id;

        $validated = $request->validate([
            'class_id'   => 'required|integer',
            'date'       => 'required|date|before_or_equal:today',
            'attendance' => 'required|array',
            'attendance.*.student_id' => 'required|integer',
            'attendance.*.status'     => 'required|in:Present,Late,Absent,Excused',
            'attendance.*.notes'      => 'nullable|string|max:200',
        ]);

        // Verify class belongs to this school
        SchoolClass::where('school_id', $schoolId)->findOrFail($validated['class_id']);

        foreach ($validated['attendance'] as $row) {
            Attendance::updateOrCreate(
                [
                    'school_id'  => $schoolId,
                    'student_id' => $row['student_id'],
                    'class_id'   => $validated['class_id'],
                    'date'       => $validated['date'],
                ],
                [
                    'marked_by' => $teacher->id,
                    'status'    => $row['status'],
                    'notes'     => $row['notes'] ?? null,
                ]
            );
        }

        return response()->json(['message' => 'Attendance saved successfully.']);
    }

    /**
     * Attendance history — summary by class and date range.
     */
    public function history(Request $request)
    {
        $teacher  = auth()->user();
        $schoolId = $teacher->school_id;
        $classId  = $request->query('class_id');
        $from     = $request->query('from', now()->startOfMonth()->toDateString());
        $to       = $request->query('to',   now()->toDateString());

        $query = Attendance::where('school_id', $schoolId)
            ->whereBetween('date', [$from, $to])
            ->with('student:id,first_name,last_name,admission_number');

        if ($classId) {
            $query->where('class_id', $classId);
        }

        // Summary per student
        $records = $query->get();

        $summary = $records->groupBy('student_id')->map(function ($rows) {
            $student = $rows->first()->student;
            $counts  = $rows->countBy('status');
            $total   = $rows->count();
            $present = ($counts['Present'] ?? 0) + ($counts['Late'] ?? 0);
            return [
                'student_id'       => $student?->id,
                'name'             => $student ? trim($student->first_name . ' ' . $student->last_name) : '—',
                'admission_number' => $student?->admission_number,
                'present'          => $counts['Present'] ?? 0,
                'late'             => $counts['Late']    ?? 0,
                'absent'           => $counts['Absent']  ?? 0,
                'excused'          => $counts['Excused'] ?? 0,
                'total_days'       => $total,
                'rate'             => $total > 0 ? round(($present / $total) * 100) : 0,
            ];
        })->values();

        // Daily records for the date-picker view
        $daily = $records->groupBy(fn($r) => $r->date)->map(function ($rows, $date) {
            return [
                'date'    => $date,
                'present' => $rows->where('status', 'Present')->count(),
                'late'    => $rows->where('status', 'Late')->count(),
                'absent'  => $rows->where('status', 'Absent')->count(),
                'excused' => $rows->where('status', 'Excused')->count(),
                'total'   => $rows->count(),
            ];
        })->sortKeys()->values();

        return response()->json([
            'from'    => $from,
            'to'      => $to,
            'summary' => $summary,
            'daily'   => $daily,
        ]);
    }
}
