<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use App\Services\Finance\FeeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SurchargeController extends Controller
{
    public function __construct(protected FeeService $fees) {}

    /** GET /api/finance/surcharges */
    public function index(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $surcharges = DB::table('surcharges as sc')
            ->where('sc.school_id', $schoolId)
            ->join('students as s', 's.id', '=', 'sc.student_id')
            ->join('student_fee_invoices as i', 'i.id', '=', 'sc.invoice_id')
            ->select('sc.*', 's.first_name', 's.last_name', 's.admission_number', 'i.invoice_number')
            ->orderByDesc('sc.applied_at')
            ->get();

        return response()->json($surcharges);
    }

    /** POST /api/finance/surcharges — manually apply a surcharge */
    public function store(Request $request)
    {
        $data = $request->validate([
            'invoice_id'    => 'required|integer',
            'amount'        => 'required|integer|min:1',
            'reason'        => 'required|in:late_payment,returned_cheque,custom',
            'custom_reason' => 'nullable|string',
        ]);

        try {
            $this->fees->applySurcharge(
                $data['invoice_id'],
                $data['amount'],
                $data['reason'],
                false
            );
            return response()->json(['message' => 'Surcharge applied.'], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
