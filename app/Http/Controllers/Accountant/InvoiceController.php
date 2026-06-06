<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use App\Services\Finance\FeeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    public function __construct(protected FeeService $fees) {}

    /** GET /api/finance/invoices */
    public function index(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $query = DB::table('student_fee_invoices as i')
            ->where('i.school_id', $schoolId)
            ->whereNull('i.deleted_at')
            ->join('students as s', 's.id', '=', 'i.student_id')
            ->select(
                'i.*',
                's.first_name', 's.last_name', 's.admission_number', 's.grade_level'
            )
            ->orderByDesc('i.issued_at');

        if ($request->filled('status'))        $query->where('i.status', $request->status);
        if ($request->filled('term'))          $query->where('i.term', $request->term);
        if ($request->filled('academic_year')) $query->where('i.academic_year', $request->academic_year);
        if ($request->filled('grade'))         $query->where('s.grade_level', $request->grade);
        if ($request->filled('search')) {
            $q = '%' . $request->search . '%';
            $query->where(function ($qb) use ($q) {
                $qb->where('s.first_name', 'like', $q)
                   ->orWhere('s.last_name', 'like', $q)
                   ->orWhere('s.admission_number', 'like', $q)
                   ->orWhere('i.invoice_number', 'like', $q);
            });
        }

        $perPage = min((int) $request->get('per_page', 50), 200);
        return response()->json($query->paginate($perPage));
    }

    /** POST /api/finance/invoices — issue single invoice */
    public function store(Request $request)
    {
        $data = $request->validate([
            'student_id'    => 'required|integer',
            'term'          => 'required|integer|in:1,2,3',
            'academic_year' => 'required|string|max:10',
        ]);

        try {
            $invoice = $this->fees->issueInvoice($data['student_id'], $data['term'], $data['academic_year']);
            return response()->json($invoice, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /** POST /api/finance/invoices/bulk-issue — issue for entire grade/class/group (Phase 5B) */
    public function bulkIssue(Request $request)
    {
        $data = $request->validate([
            'grade_level'   => 'nullable|string',
            'class_id'      => 'nullable|integer',
            'applicable_to' => 'nullable|in:all,boarding,day',
            'term'          => 'required|integer|in:1,2,3',
            'academic_year' => 'required|string|max:10',
        ]);

        if (empty($data['grade_level']) && empty($data['class_id'])) {
            return response()->json(['message' => 'Provide either grade_level or class_id.'], 422);
        }

        $schoolId = $request->user()->school_id;
        $result   = $this->fees->bulkIssueInvoices(
            $data['grade_level']   ?? null,
            $schoolId,
            $data['term'],
            $data['academic_year'],
            $data['class_id']      ?? null,
            $data['applicable_to'] ?? null
        );

        return response()->json($result);
    }

    /** GET /api/finance/invoices/{id} */
    public function show(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;

        $invoice = DB::table('student_fee_invoices as i')
            ->where('i.id', $id)
            ->where('i.school_id', $schoolId)
            ->join('students as s', 's.id', '=', 'i.student_id')
            ->select('i.*', 's.first_name', 's.last_name', 's.admission_number', 's.grade_level', 's.parent_name', 's.parent_phone')
            ->first();

        if (!$invoice) return response()->json(['message' => 'Not found.'], 404);

        $invoice->items    = DB::table('student_invoice_items')->where('invoice_id', $id)->get();
        $invoice->payments = DB::table('fee_payments')->where('invoice_id', $id)->where('status', '!=', 'reversed')->get();
        $invoice->surcharges = DB::table('surcharges')->where('invoice_id', $id)->get();

        return response()->json($invoice);
    }

    /** PATCH /api/finance/invoices/{id}/cancel */
    public function cancel(Request $request, $id)
    {
        $reason = $request->input('reason', '');
        try {
            $this->fees->cancelInvoice((int) $id, $reason);
            return response()->json(['message' => 'Invoice cancelled.']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * POST /api/transport/billing/generate  (Phase 5A)
     *
     * Issues invoices for ALL active students that have a transport route with fee_per_term > 0.
     * Transport fee is auto-appended inside FeeService::issueInvoice via the student's
     * transport_route_id. This endpoint simply triggers bulkIssueInvoices school-wide
     * so that every student with a route gets a properly line-itemised invoice.
     *
     * Body: academic_year, term
     */
    public function generateTransportInvoices(Request $request)
    {
        $data = $request->validate([
            'academic_year' => 'required|string|max:10',
            'term'          => 'required|integer|in:1,2,3',
        ]);

        $schoolId = $request->user()->school_id;

        // Scope to only students with a transport route that has fee_per_term > 0
        $studentIds = \Illuminate\Support\Facades\DB::table('students as s')
            ->join('transport_routes as r', 'r.id', '=', 's.transport_route_id')
            ->where('s.school_id', $schoolId)
            ->where('s.status', 'Active')
            ->where('r.fee_per_term', '>', 0)
            ->pluck('s.id');

        $issued = 0; $skipped = 0; $errors = [];

        foreach ($studentIds as $studentId) {
            try {
                $this->fees->issueInvoice($studentId, $data['term'], $data['academic_year']);
                $issued++;
            } catch (\Exception $e) {
                if (str_contains($e->getMessage(), 'already exists')) {
                    $skipped++;
                } else {
                    $errors[] = ['student_id' => $studentId, 'error' => $e->getMessage()];
                }
            }
        }

        return response()->json(compact('issued', 'skipped', 'errors'));
    }
}

