<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\StaffAttendance;
use Illuminate\Http\Request;

class StaffAttendanceController extends Controller
{
    private function staffRoles(): array
    {
        return ['teacher', 'accountant', 'librarian', 'hr_manager', 'driver', 'school_admin', 'admin'];
    }

    /**
     * GET /hr/attendance/mark?date=YYYY-MM-DD
     * Returns all staff with their attendance status for the given date.
     */
    public function forDate(Request $request)
    {
        $schoolId = auth()->user()->school_id;
        $date     = $request->query('date', now()->toDateString());

        $staff = User::where('school_id', $schoolId)
            ->whereIn('role', $this->staffRoles())
            ->orderBy('name')
            ->get(['id', 'name', 'role', 'department', 'phone']);

        // Existing records for this date
        $existing = StaffAttendance::where('school_id', $schoolId)
            ->where('date', $date)
            ->get()
            ->keyBy('user_id');

        $rows = $staff->map(fn($u) => [
            'id'         => $u->id,
            'name'       => $u->name,
            'role'       => $u->role,
            'department' => $u->department,
            'status'     => $existing->get($u->id)?->status ?? null,
        ]);

        return response()->json(['staff' => $rows, 'date' => $date]);
    }

    /**
     * POST /hr/attendance/mark
     * Body: { date, records: [{ user_id, status, notes? }] }
     */
    public function save(Request $request)
    {
        $schoolId = auth()->user()->school_id;
        $markerId = auth()->id();

        $request->validate([
            'date'            => 'required|date',
            'records'         => 'required|array',
            'records.*.user_id' => 'required|integer|exists:users,id',
            'records.*.status'  => 'required|in:Present,Late,Absent,Excused',
        ]);

        foreach ($request->records as $rec) {
            StaffAttendance::updateOrCreate(
                ['school_id' => $schoolId, 'user_id' => $rec['user_id'], 'date' => $request->date],
                ['marked_by' => $markerId, 'status' => $rec['status'], 'notes' => $rec['notes'] ?? null]
            );
        }

        return response()->json(['message' => 'Attendance saved successfully.']);
    }

    /**
     * GET /hr/attendance/history?year=YYYY&month=M
     * Returns monthly summary per staff.
     */
    public function history(Request $request)
    {
        $schoolId = auth()->user()->school_id;
        $year     = $request->query('year',  now()->year);
        $month    = $request->query('month', now()->month);
        $from     = sprintf('%04d-%02d-01', $year, $month);
        $to       = date('Y-m-t', strtotime($from));

        $staff = User::where('school_id', $schoolId)
            ->whereIn('role', $this->staffRoles())
            ->orderBy('name')
            ->get(['id', 'name', 'role', 'department']);

        $records = StaffAttendance::where('school_id', $schoolId)
            ->whereBetween('date', [$from, $to])
            ->get()
            ->groupBy('user_id');

        $rows = $staff->map(function ($u) use ($records) {
            $recs    = $records->get($u->id, collect());
            $present = $recs->where('status', 'Present')->count();
            $late    = $recs->where('status', 'Late')->count();
            $absent  = $recs->where('status', 'Absent')->count();
            $excused = $recs->where('status', 'Excused')->count();
            $total   = $present + $late + $absent + $excused;
            $rate    = $total > 0 ? round((($present + $late) / $total) * 100) : null;

            return [
                'id'         => $u->id,
                'name'       => $u->name,
                'role'       => $u->role,
                'department' => $u->department,
                'present'    => $present,
                'late'       => $late,
                'absent'     => $absent,
                'excused'    => $excused,
                'rate'       => $rate,
            ];
        });

        return response()->json([
            'staff' => $rows,
            'year'  => (int)$year,
            'month' => (int)$month,
        ]);
    }
}
