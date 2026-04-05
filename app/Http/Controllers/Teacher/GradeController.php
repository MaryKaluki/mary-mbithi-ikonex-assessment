<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamMark;
use App\Models\SchoolClass;
use App\Models\Student;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    /**
     * List all active/upcoming exams for this school.
     */
    public function exams()
    {
        $schoolId = auth()->user()->school_id;

        $exams = Exam::where('school_id', $schoolId)
            ->orderByDesc('start_date')
            ->get(['id', 'name', 'start_date', 'end_date', 'status', 'target_curriculum']);

        return response()->json($exams);
    }

    /**
     * Return students in a class with their existing marks for a given exam + subject.
     */
    public function students(Request $request, $examId)
    {
        $teacher  = auth()->user();
        $schoolId = $teacher->school_id;

        $classId = $request->query('class_id');
        $subject = $request->query('subject');

        $exam  = Exam::where('school_id', $schoolId)->findOrFail($examId);
        $class = SchoolClass::where('school_id', $schoolId)->findOrFail($classId);

        $students = Student::where('school_id', $schoolId)
            ->where('grade_level', $class->name)
            ->where('status', 'Active')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'admission_number']);

        // Existing marks for this exam+subject combo
        $existing = ExamMark::where('school_id', $schoolId)
            ->where('exam_id', $examId)
            ->where('subject_name', $subject)
            ->whereIn('student_id', $students->pluck('id'))
            ->get()
            ->keyBy('student_id');

        $rows = $students->map(fn($s) => [
            'student_id'       => $s->id,
            'name'             => trim($s->first_name . ' ' . $s->last_name),
            'admission_number' => $s->admission_number,
            'marks'            => $existing[$s->id]->marks  ?? null,
            'out_of'           => $existing[$s->id]->out_of ?? 100,
            'remarks'          => $existing[$s->id]->remarks ?? '',
            'grade'            => $existing[$s->id]->grade  ?? null,
        ]);

        return response()->json([
            'exam'     => ['id' => $exam->id, 'name' => $exam->name],
            'class'    => ['id' => $class->id, 'name' => $class->name],
            'subject'  => $subject,
            'students' => $rows,
        ]);
    }

    /**
     * Save marks for a batch of students (upsert).
     */
    public function store(Request $request)
    {
        $teacher  = auth()->user();
        $schoolId = $teacher->school_id;

        $validated = $request->validate([
            'exam_id'      => 'required|integer',
            'class_id'     => 'required|integer',
            'subject_name' => 'required|string|max:100',
            'out_of'       => 'required|numeric|min:1|max:1000',
            'term'         => 'required|integer|in:1,2,3',
            'year'         => 'required|integer',
            'marks'        => 'required|array',
            'marks.*.student_id' => 'required|integer',
            'marks.*.marks'      => 'required|numeric|min:0',
            'marks.*.remarks'    => 'nullable|string|max:200',
        ]);

        Exam::where('school_id', $schoolId)->findOrFail($validated['exam_id']);

        foreach ($validated['marks'] as $row) {
            $grade = ExamMark::toGrade((float)$row['marks'], (float)$validated['out_of']);

            ExamMark::updateOrCreate(
                [
                    'school_id'    => $schoolId,
                    'student_id'   => $row['student_id'],
                    'exam_id'      => $validated['exam_id'],
                    'subject_name' => $validated['subject_name'],
                ],
                [
                    'marks'   => $row['marks'],
                    'out_of'  => $validated['out_of'],
                    'grade'   => $grade,
                    'remarks' => $row['remarks'] ?? null,
                    'term'    => $validated['term'],
                    'year'    => $validated['year'],
                ]
            );
        }

        return response()->json(['message' => 'Marks saved successfully.']);
    }
}
