<?php

namespace App\Http\Controllers\ParentPortal;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\ExamMark;
use App\Models\Attendance;

class AcademicController extends Controller
{
    public function index()
    {
        $user     = auth()->user();
        $email    = $user->email;
        $schoolId = $user->school_id;

        $children = Student::where('school_id', $schoolId)
            ->where('parent_email', $email)
            ->where('status', 'Active')
            ->get();

        $since = now()->subDays(30)->toDateString();

        $data = $children->map(function ($student) use ($schoolId, $since) {
            $marks = ExamMark::where('school_id', $schoolId)
                ->where('student_id', $student->id)
                ->get();

            // Group by subject — latest mark per subject
            $bySubject = $marks->groupBy('subject_name')->map(function ($subjectMarks) {
                $latest      = $subjectMarks->sortByDesc('created_at')->first();
                $totalMarks  = $subjectMarks->sum('marks');
                $totalOutOf  = $subjectMarks->sum('out_of');
                $score       = $totalOutOf > 0 ? round(($totalMarks / $totalOutOf) * 100) : 0;
                return [
                    'name'  => $latest->subject_name,
                    'grade' => $latest->grade,
                    'score' => $score,
                ];
            })->values();

            // Overall grade (average across all marks)
            $totalAll  = $marks->sum('marks');
            $outOfAll  = $marks->sum('out_of');
            $overallPct = $outOfAll > 0 ? round(($totalAll / $outOfAll) * 100) : null;
            $overallGrade = null;
            if ($overallPct !== null) {
                if ($overallPct >= 80)      $overallGrade = 'A';
                elseif ($overallPct >= 75)  $overallGrade = 'A-';
                elseif ($overallPct >= 70)  $overallGrade = 'B+';
                elseif ($overallPct >= 65)  $overallGrade = 'B';
                elseif ($overallPct >= 60)  $overallGrade = 'B-';
                elseif ($overallPct >= 55)  $overallGrade = 'C+';
                elseif ($overallPct >= 50)  $overallGrade = 'C';
                elseif ($overallPct >= 45)  $overallGrade = 'C-';
                elseif ($overallPct >= 40)  $overallGrade = 'D+';
                elseif ($overallPct >= 35)  $overallGrade = 'D';
                elseif ($overallPct >= 30)  $overallGrade = 'D-';
                else                        $overallGrade = 'E';
            }

            // Attendance rate
            $total   = Attendance::where('school_id', $schoolId)->where('student_id', $student->id)->where('date', '>=', $since)->count();
            $present = Attendance::where('school_id', $schoolId)->where('student_id', $student->id)->where('date', '>=', $since)->where('status', 'Present')->count();
            $rate    = $total > 0 ? round(($present / $total) * 100) : null;

            return [
                'id'            => $student->id,
                'name'          => $student->first_name . ' ' . $student->last_name,
                'grade_level'   => $student->grade_level,
                'overall_grade' => $overallGrade,
                'overall_pct'   => $overallPct,
                'attendance'    => $rate,
                'subjects'      => $bySubject,
            ];
        });

        return response()->json(['children' => $data]);
    }
}
