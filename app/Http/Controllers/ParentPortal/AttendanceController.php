<?php

namespace App\Http\Controllers\ParentPortal;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Attendance;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $user     = auth()->user();
        $email    = $user->email;
        $schoolId = $user->school_id;

        $children = Student::where('school_id', $schoolId)
            ->where('parent_email', $email)
            ->where('status', 'Active')
            ->get(['id', 'first_name', 'last_name', 'grade_level']);

        // Month/year to view (default: current month)
        $year  = $request->query('year',  now()->year);
        $month = $request->query('month', now()->month);

        $from = sprintf('%04d-%02d-01', $year, $month);
        $to   = date('Y-m-t', strtotime($from));

        $data = $children->map(function ($student) use ($schoolId, $from, $to) {
            $records = Attendance::where('school_id', $schoolId)
                ->where('student_id', $student->id)
                ->whereBetween('date', [$from, $to])
                ->get(['date', 'status'])
                ->keyBy(fn($r) => $r->date); // keyed by date string

            $present = $records->where('status', 'Present')->count();
            $absent  = $records->where('status', 'Absent')->count();
            $late    = $records->where('status', 'Late')->count();
            $excused = $records->where('status', 'Excused')->count();

            // Build day-by-day map
            $days = [];
            $d    = new \DateTime($from);
            $end  = new \DateTime($to);
            while ($d <= $end) {
                $dateStr   = $d->format('Y-m-d');
                $dayOfWeek = (int)$d->format('N'); // 1=Mon … 7=Sun
                $isWeekend = $dayOfWeek >= 6;
                $record    = $records->get($dateStr);

                $days[] = [
                    'date'    => $dateStr,
                    'day'     => (int)$d->format('j'),
                    'status'  => $isWeekend ? 'weekend' : ($record ? strtolower($record->status) : 'no_data'),
                ];
                $d->modify('+1 day');
            }

            // First day of month — what weekday does it start on? (0=Sun for calendar offset)
            $firstDow = (int)(new \DateTime($from))->format('w'); // 0=Sun

            return [
                'id'          => $student->id,
                'name'        => $student->first_name . ' ' . $student->last_name,
                'grade_level' => $student->grade_level,
                'stats'       => compact('present', 'absent', 'late', 'excused'),
                'days'        => $days,
                'first_dow'   => $firstDow,
            ];
        });

        return response()->json([
            'children' => $data,
            'year'     => (int)$year,
            'month'    => (int)$month,
        ]);
    }
}
