<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use App\Services\Finance\FeeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DiscountController extends Controller
{
    public function __construct(protected FeeService $fees) {}

    /** GET /api/finance/discounts */
    public function index(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $query = DB::table('student_discounts as d')
            ->where('d.school_id', $schoolId)
            ->whereNull('d.deleted_at')
            ->join('students as s', 's.id', '=', 'd.student_id')
            ->leftJoin('student_fee_invoices as i', 'i.id', '=', 'd.invoice_id')
            ->select(
                'd.*',
                's.first_name', 's.last_name', 's.admission_number', 's.grade_level',
                'i.invoice_number'
            )
            ->orderByDesc('d.created_at');

        if ($request->filled('student_id')) $query->where('d.student_id', $request->student_id);
        if ($request->filled('type'))       $query->where('d.discount_type', $request->type);
        if ($request->filled('active'))     $query->where('d.active', $request->boolean('active'));

        return response()->json($query->get());
    }

    /** POST /api/finance/discounts */
    public function store(Request $request)
    {
        $data = $request->validate([
            'student_id'    => 'required|integer',
            'invoice_id'    => 'nullable|integer',
            'discount_type' => 'required|in:scholarship,sibling,staff_child,bursary,sponsorship,custom',
            'amount_or_pct' => 'required|integer|min:1',
            'is_percentage' => 'boolean',
            'reason'        => 'nullable|string',
            'valid_from'    => 'nullable|date',
            'valid_to'      => 'nullable|date|after_or_equal:valid_from',
        ]);

        $schoolId = $request->user()->school_id;

        if (!empty($data['invoice_id'])) {
            // Apply directly to invoice
            try {
                $this->fees->applyDiscount($data['invoice_id'], $data);
            } catch (\Exception $e) {
                return response()->json(['message' => $e->getMessage()], 422);
            }
        } else {
            // Global discount (applied to future invoices)
            DB::table('student_discounts')->insert([
                'school_id'     => $schoolId,
                'student_id'    => $data['student_id'],
                'invoice_id'    => null,
                'discount_type' => $data['discount_type'],
                'amount_or_pct' => $data['amount_or_pct'],
                'is_percentage' => $data['is_percentage'] ?? false,
                'reason'        => $data['reason'] ?? null,
                'approved_by'   => $request->user()->id,
                'valid_from'    => $data['valid_from'] ?? null,
                'valid_to'      => $data['valid_to'] ?? null,
                'active'        => true,
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);
        }

        return response()->json(['message' => 'Discount applied.'], 201);
    }

    /** DELETE /api/finance/discounts/{id} */
    public function destroy(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;
        DB::table('student_discounts')
            ->where('id', $id)
            ->where('school_id', $schoolId)
            ->update(['active' => false, 'deleted_at' => now()]);

        return response()->json(['message' => 'Discount deactivated.']);
    }
}
