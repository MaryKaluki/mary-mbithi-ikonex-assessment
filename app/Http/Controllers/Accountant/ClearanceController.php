<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

/**
 * Phase 5C — End-of-Term Student Clearance
 *
 * Routes (add to api.php under the finance/accountant group):
 *   GET  /api/finance/clearance                    → index (list all students' clearance for term)
 *   POST /api/finance/clearance/initialize         → bulk-create clearance records for a class/grade
 *   GET  /api/finance/clearance/{id}               → show one record
 *   PATCH /api/finance/clearance/{id}/fee          → sign off fee clearance
 *   PATCH /api/finance/clearance/{id}/library      → sign off library clearance
 *   PATCH /api/finance/clearance/{id}/dorm         → sign off dorm clearance
 *   POST  /api/finance/clearance/{id}/exam-card    → issue exam card (requires all cleared + balance check)
 *   PATCH /api/finance/clearance/{id}/sign-off     → final sign-off (admin only)
 */
class ClearanceController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // LIST
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/finance/clearance
     * Params: academic_year, term, class_id, grade_level, status (cleared|pending|partial)
     */
    public function index(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $year     = $request->input('academic_year', date('Y'));
        $term     = $request->input('term');

        $query = DB::table('student_clearance as sc')
            ->join('students as s', 's.id', '=', 'sc.student_id')
            ->leftJoin('classes as cl', 'cl.id', '=', 's.class_id')
            ->leftJoin('student_fee_invoices as inv', function ($j) use ($year, $term) {
                $j->on('inv.student_id', '=', 'sc.student_id')
                  ->where('inv.academic_year', '=', $year)
                  ->where('inv.status', '!=', 'cancelled');
                if ($term) $j->where('inv.term', '=', $term);
            })
            ->where('sc.school_id', $schoolId)
            ->where('sc.academic_year', $year);

        if ($term)                          $query->where('sc.term', $term);
        if ($request->filled('class_id'))   $query->where('s.class_id', $request->input('class_id'));
        if ($request->filled('grade_level'))$query->where('s.grade_level', $request->input('grade_level'));

        // Status filter
        if ($request->filled('status')) {
            match ($request->input('status')) {
                'cleared'  => $query->where('sc.fully_cleared', true),
                'pending'  => $query->where('sc.fully_cleared', false)
                                    ->where('sc.fee_cleared', false)
                                    ->where('sc.library_cleared', false),
                'partial'  => $query->where('sc.fully_cleared', false)
                                    ->where(function ($q) {
                                        $q->where('sc.fee_cleared', true)
                                          ->orWhere('sc.library_cleared', true)
                                          ->orWhere('sc.dorm_cleared', true);
                                    }),
                default    => null,
            };
        }

        $rows = $query->select([
            'sc.*',
            's.first_name', 's.last_name', 's.admission_number', 's.grade_level',
            'cl.name as class_name',
            DB::raw('COALESCE(SUM(inv.balance), 0) as current_balance'),
        ])
        ->groupBy('sc.id', 'sc.student_id', 'sc.school_id', 'sc.academic_year', 'sc.term',
                  'sc.fee_cleared', 'sc.fee_cleared_by', 'sc.fee_cleared_at',
                  'sc.library_cleared', 'sc.library_cleared_by', 'sc.library_cleared_at',
                  'sc.dorm_cleared', 'sc.dorm_cleared_by', 'sc.dorm_cleared_at',
                  'sc.exam_card_issued', 'sc.exam_card_issued_by', 'sc.exam_card_issued_at',
                  'sc.fully_cleared', 'sc.clearance_signed_off_by', 'sc.signed_off_at',
                  'sc.balance_at_clearance', 'sc.clearance_threshold', 'sc.notes',
                  'sc.created_at', 'sc.updated_at',
                  's.first_name', 's.last_name', 's.admission_number', 's.grade_level',
                  'cl.name')
        ->orderBy('s.last_name')
        ->orderBy('s.first_name')
        ->get();

        $summary = [
            'total'          => $rows->count(),
            'fully_cleared'  => $rows->where('fully_cleared', true)->count(),
            'exam_cards_out' => $rows->where('exam_card_issued', true)->count(),
            'fee_cleared'    => $rows->where('fee_cleared', true)->count(),
        ];

        return response()->json(['data' => $rows, 'summary' => $summary]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INITIALIZE (bulk create records for a class/grade)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/finance/clearance/initialize
     * Body: academic_year, term, grade_level|class_id, clearance_threshold (optional)
     *
     * Creates a clearance record for every active student in the class/grade
     * who doesn't already have one.  Returns created count.
     */
    public function initialize(Request $request)
    {
        $data = $request->validate([
            'academic_year'       => 'required|string|max:10',
            'term'                => 'required|integer|in:1,2,3',
            'grade_level'         => 'nullable|string',
            'class_id'            => 'nullable|integer',
            'clearance_threshold' => 'nullable|integer|min:0',
        ]);

        if (empty($data['grade_level']) && empty($data['class_id'])) {
            return response()->json(['message' => 'Provide grade_level or class_id.'], 422);
        }

        $schoolId  = $request->user()->school_id;
        $threshold = $data['clearance_threshold'] ?? 0;
        $now       = now();

        $studentQuery = DB::table('students')
            ->where('school_id', $schoolId)
            ->where('status', 'Active');

        if (!empty($data['class_id'])) {
            $studentQuery->where('class_id', $data['class_id']);
        } else {
            $studentQuery->where('grade_level', $data['grade_level']);
        }

        $students = $studentQuery->pluck('id');
        $created  = 0;

        foreach ($students as $studentId) {
            $exists = DB::table('student_clearance')
                ->where('school_id', $schoolId)
                ->where('student_id', $studentId)
                ->where('academic_year', $data['academic_year'])
                ->where('term', $data['term'])
                ->exists();

            if (!$exists) {
                // Snapshot current balance
                $balance = (int) DB::table('student_fee_invoices')
                    ->where('student_id', $studentId)
                    ->where('school_id', $schoolId)
                    ->where('academic_year', $data['academic_year'])
                    ->where('term', $data['term'])
                    ->whereNotIn('status', ['cancelled'])
                    ->sum('balance');

                DB::table('student_clearance')->insert([
                    'school_id'           => $schoolId,
                    'student_id'          => $studentId,
                    'academic_year'       => $data['academic_year'],
                    'term'                => $data['term'],
                    'fee_cleared'         => $balance <= $threshold,  // auto-clear if within threshold
                    'library_cleared'     => false,
                    'dorm_cleared'        => false,
                    'exam_card_issued'    => false,
                    'fully_cleared'       => false,
                    'balance_at_clearance'=> $balance,
                    'clearance_threshold' => $threshold,
                    'created_at'          => $now,
                    'updated_at'          => $now,
                ]);
                $created++;
            }
        }

        return response()->json([
            'message'      => "{$created} clearance records created.",
            'created'      => $created,
            'already_existed' => $students->count() - $created,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SHOW
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/finance/clearance/{id}
     */
    public function show(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;
        $record   = DB::table('student_clearance as sc')
            ->join('students as s', 's.id', '=', 'sc.student_id')
            ->leftJoin('classes as cl', 'cl.id', '=', 's.class_id')
            ->where('sc.id', $id)
            ->where('sc.school_id', $schoolId)
            ->select([
                'sc.*',
                's.first_name', 's.last_name', 's.admission_number', 's.grade_level', 's.parent_phone',
                'cl.name as class_name',
            ])->first();

        if (!$record) return response()->json(['message' => 'Not found.'], 404);

        // Attach current invoices
        $record->invoices = DB::table('student_fee_invoices')
            ->where('student_id', $record->student_id)
            ->where('academic_year', $record->academic_year)
            ->where('term', $record->term)
            ->whereNotIn('status', ['cancelled'])
            ->get(['invoice_number', 'total_charged', 'total_paid', 'balance', 'status']);

        return response()->json($record);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DEPARTMENT SIGN-OFFS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * PATCH /api/finance/clearance/{id}/fee
     * Body: cleared (boolean), notes (optional)
     *
     * Only finance staff can sign off fee clearance.
     * Auto-checks balance ≤ clearance_threshold.
     */
    public function signOffFee(Request $request, $id)
    {
        $data = $request->validate([
            'cleared' => 'required|boolean',
            'notes'   => 'nullable|string|max:500',
        ]);

        $schoolId = $request->user()->school_id;
        $record   = DB::table('student_clearance')
            ->where('id', $id)->where('school_id', $schoolId)->first();

        if (!$record) return response()->json(['message' => 'Not found.'], 404);
        if ($record->exam_card_issued) return response()->json(['message' => 'Exam card already issued.'], 422);

        // Re-compute live balance
        $balance = (int) DB::table('student_fee_invoices')
            ->where('student_id', $record->student_id)
            ->where('school_id', $schoolId)
            ->where('academic_year', $record->academic_year)
            ->where('term', $record->term)
            ->whereNotIn('status', ['cancelled'])
            ->sum('balance');

        if ($data['cleared'] && $balance > $record->clearance_threshold) {
            return response()->json([
                'message' => "Balance KES " . number_format($balance) .
                             " exceeds clearance threshold KES " . number_format($record->clearance_threshold) .
                             ". Cannot mark fee-cleared.",
            ], 422);
        }

        DB::table('student_clearance')->where('id', $id)->update([
            'fee_cleared'         => $data['cleared'],
            'fee_cleared_by'      => $data['cleared'] ? Auth::id() : null,
            'fee_cleared_at'      => $data['cleared'] ? now() : null,
            'balance_at_clearance'=> $balance,
            'notes'               => $data['notes'] ?? $record->notes,
            'updated_at'          => now(),
        ]);

        return response()->json(['message' => 'Fee clearance updated.', 'balance' => $balance]);
    }

    /**
     * PATCH /api/finance/clearance/{id}/library
     */
    public function signOffLibrary(Request $request, $id)
    {
        return $this->signOffDepartment($request, $id, 'library');
    }

    /**
     * PATCH /api/finance/clearance/{id}/dorm
     */
    public function signOffDorm(Request $request, $id)
    {
        return $this->signOffDepartment($request, $id, 'dorm');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EXAM CARD ISSUE
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/finance/clearance/{id}/exam-card
     *
     * Issues the exam card only if:
     * 1. fee_cleared = true
     * 2. library_cleared = true
     * 3. dorm_cleared = true (or student is not in dorm)
     * 4. balance <= clearance_threshold
     */
    public function issueExamCard(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;

        return DB::transaction(function () use ($id, $schoolId) {
            $record = DB::table('student_clearance')
                ->where('id', $id)->where('school_id', $schoolId)->lockForUpdate()->first();

            if (!$record) return response()->json(['message' => 'Not found.'], 404);
            if ($record->exam_card_issued) return response()->json(['message' => 'Exam card already issued.'], 422);

            // Block if balance exceeds threshold
            $balance = (int) DB::table('student_fee_invoices')
                ->where('student_id', $record->student_id)
                ->where('school_id', $schoolId)
                ->where('academic_year', $record->academic_year)
                ->where('term', $record->term)
                ->whereNotIn('status', ['cancelled'])
                ->sum('balance');

            if ($balance > $record->clearance_threshold) {
                return response()->json([
                    'message' => "BLOCKED: Outstanding balance KES " . number_format($balance) .
                                 " exceeds allowable threshold KES " . number_format($record->clearance_threshold) . ".",
                ], 403);
            }

            // Check if student is a boarder
            $isBoarder = DB::table('dorm_allocations')
                ->where('student_id', $record->student_id)
                ->where('school_id', $schoolId)
                ->whereNull('moved_out_on')
                ->exists();

            $blockers = [];
            if (!$record->fee_cleared)     $blockers[] = 'Finance clearance not signed off.';
            if (!$record->library_cleared) $blockers[] = 'Library clearance not signed off.';
            if ($isBoarder && !$record->dorm_cleared) $blockers[] = 'Dorm clearance not signed off.';

            if (!empty($blockers)) {
                return response()->json(['message' => 'Cannot issue exam card.', 'blockers' => $blockers], 422);
            }

            DB::table('student_clearance')->where('id', $id)->update([
                'exam_card_issued'      => true,
                'exam_card_issued_by'   => Auth::id(),
                'exam_card_issued_at'   => now(),
                'fully_cleared'         => true,
                'clearance_signed_off_by' => Auth::id(),
                'signed_off_at'         => now(),
                'balance_at_clearance'  => $balance,
                'updated_at'            => now(),
            ]);

            return response()->json(['message' => 'Exam card issued successfully.']);
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FINAL SIGN-OFF (Admin)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * PATCH /api/finance/clearance/{id}/sign-off
     */
    public function signOff(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;
        $record   = DB::table('student_clearance')
            ->where('id', $id)->where('school_id', $schoolId)->first();

        if (!$record) return response()->json(['message' => 'Not found.'], 404);

        DB::table('student_clearance')->where('id', $id)->update([
            'fully_cleared'           => true,
            'clearance_signed_off_by' => Auth::id(),
            'signed_off_at'           => now(),
            'notes'                   => $request->input('notes', $record->notes),
            'updated_at'              => now(),
        ]);

        return response()->json(['message' => 'Final clearance signed off.']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Generic department sign-off (library | dorm).
     */
    private function signOffDepartment(Request $request, $id, string $dept): \Illuminate\Http\JsonResponse
    {
        $data = $request->validate([
            'cleared' => 'required|boolean',
            'notes'   => 'nullable|string|max:500',
        ]);

        $schoolId = $request->user()->school_id;
        $record   = DB::table('student_clearance')
            ->where('id', $id)->where('school_id', $schoolId)->first();

        if (!$record) return response()->json(['message' => 'Not found.'], 404);
        if ($record->exam_card_issued) return response()->json(['message' => 'Exam card already issued.'], 422);

        DB::table('student_clearance')->where('id', $id)->update([
            "{$dept}_cleared"    => $data['cleared'],
            "{$dept}_cleared_by" => $data['cleared'] ? Auth::id() : null,
            "{$dept}_cleared_at" => $data['cleared'] ? now() : null,
            'notes'              => $data['notes'] ?? $record->notes,
            'updated_at'         => now(),
        ]);

        return response()->json(['message' => ucfirst($dept) . ' clearance updated.']);
    }
}
