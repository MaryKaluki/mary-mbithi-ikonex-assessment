<?php

namespace App\Services\Finance;

use App\Models\Student;
use App\Models\FeeStructure;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

/**
 * Core finance transaction engine.
 *
 * All methods that write money records are wrapped in DB transactions.
 * No float math — all amounts in integer KES.
 */
class FeeService
{
    public function __construct(
        protected ReceiptNumberService $numbers
    ) {}

    // =========================================================================
    // INVOICING
    // =========================================================================

    /**
     * Issue a fee invoice for a single student for a given term/year.
     * Uses the student's assigned fee_structure_id (or falls back to the
     * school's default structure for the grade).
     *
     * @return array  The created invoice record (as array)
     * @throws \Exception  if student has no fee structure assigned
     */
    public function issueInvoice(int $studentId, int $term, string $year): array
    {
        return DB::transaction(function () use ($studentId, $term, $year) {
            $student = Student::with('feeStructure')->findOrFail($studentId);

            if (!$student->fee_structure_id || !$student->feeStructure) {
                throw new \Exception("Student {$student->admission_number} has no fee structure assigned.");
            }

            $schoolId  = $student->school_id;
            $structure = $student->feeStructure;

            // Check: don't double-issue for same term/year
            $existing = DB::table('student_fee_invoices')
                ->where('school_id', $schoolId)
                ->where('student_id', $studentId)
                ->where('academic_year', $year)
                ->where('term', $term)
                ->whereNotIn('status', ['cancelled'])
                ->first();

            if ($existing) {
                throw new \Exception("Invoice already exists for this student, term {$term}, year {$year}.");
            }

            // Load line items (filter by applicable_to: all | day | boarding)
            $mode  = $this->studentMode($student);
            $items = DB::table('fee_structure_items')
                ->where('school_id', $schoolId)
                ->where('fee_structure_id', $structure->id)
                ->where(function ($q) use ($mode) {
                    $q->where('applicable_to', 'all')
                      ->orWhere('applicable_to', $mode);
                })
                ->where('is_optional', false)
                ->orderBy('sort_order')
                ->get();

            // Apply global discounts for this student
            $discounts = DB::table('student_discounts')
                ->where('school_id', $schoolId)
                ->where('student_id', $studentId)
                ->where('active', true)
                ->whereNull('invoice_id')  // global discounts only
                ->where(function ($q) use ($year, $term) {
                    $q->whereNull('valid_from')->orWhereRaw("CONCAT(valid_from) <= ?", ["{$year}-01-01"]);
                })
                ->where(function ($q) use ($year) {
                    $q->whereNull('valid_to')->orWhereRaw("CONCAT(valid_to) >= ?", ["{$year}-12-31"]);
                })
                ->get();

            $totalCharged = 0;
            $lineItems    = [];

            foreach ($items as $item) {
                $discount  = $this->computeDiscount($item->amount, $discounts);
                $netAmount = $item->amount - $discount;

                $lineItems[]   = [
                    'fee_structure_item_id' => $item->id,
                    'description'           => $item->name,
                    'amount'                => $item->amount,
                    'discount'              => $discount,
                    'surcharge'             => 0,
                    'net_amount'            => $netAmount,
                ];
                $totalCharged += $netAmount;
            }

            // ── Phase 5A: Auto-add transport fee ─────────────────────────────
            if ($student->transport_route_id) {
                $route = DB::table('transport_routes')
                    ->where('id', $student->transport_route_id)
                    ->where('school_id', $schoolId)
                    ->first(['fee_per_term', 'name']);

                if ($route && $route->fee_per_term > 0) {
                    $lineItems[]   = [
                        'fee_structure_item_id' => null,
                        'description'           => 'Transport Fee — ' . $route->name,
                        'amount'                => (int) $route->fee_per_term,
                        'discount'              => 0,
                        'surcharge'             => 0,
                        'net_amount'            => (int) $route->fee_per_term,
                    ];
                    $totalCharged += (int) $route->fee_per_term;
                }
            }

            // ── Phase 5A: Auto-add dorm/boarding fee ─────────────────────────
            $dormAlloc = DB::table('dorm_allocations as da')
                ->join('dormitories as d', 'd.id', '=', 'da.dormitory_id')
                ->where('da.student_id', $studentId)
                ->where('da.school_id', $schoolId)
                ->whereNull('da.moved_out_on')     // currently allocated
                ->first(['da.fee_per_term as dorm_alloc_fee', 'd.fee_per_term as dorm_default_fee', 'd.name as dorm_name']);

            if ($dormAlloc) {
                $dormFee = (int) ($dormAlloc->dorm_alloc_fee > 0 ? $dormAlloc->dorm_alloc_fee : $dormAlloc->dorm_default_fee);
                if ($dormFee > 0) {
                    $lineItems[]   = [
                        'fee_structure_item_id' => null,
                        'description'           => 'Boarding/Dorm Fee — ' . $dormAlloc->dorm_name,
                        'amount'                => $dormFee,
                        'discount'              => 0,
                        'surcharge'             => 0,
                        'net_amount'            => $dormFee,
                    ];
                    $totalCharged += $dormFee;
                }
            }

            $invoiceNumber = $this->numbers->nextInvoice($schoolId, $year, $term);

            $invoiceId = DB::table('student_fee_invoices')->insertGetId([
                'school_id'        => $schoolId,
                'student_id'       => $studentId,
                'invoice_number'   => $invoiceNumber,
                'academic_year'    => $year,
                'term'             => $term,
                'fee_structure_id' => $structure->id,
                'total_charged'    => $totalCharged,
                'total_paid'       => 0,
                'balance'          => $totalCharged,
                'status'           => 'issued',
                'issued_at'        => now(),
                'due_date'         => null,
                'created_by'       => Auth::id(),
                'created_at'       => now(),
                'updated_at'       => now(),
            ]);

            // Insert line items
            foreach ($lineItems as &$li) {
                $li['school_id']  = $schoolId;
                $li['invoice_id'] = $invoiceId;
                $li['created_at'] = now();
                $li['updated_at'] = now();
            }
            DB::table('student_invoice_items')->insert($lineItems);

            return DB::table('student_fee_invoices')->where('id', $invoiceId)->first(['*']);
        });
    }

    /**
     * Bulk-issue invoices for all active students in a class/grade/group.
     *
     * Accepts either grade_level (string) OR class_id (int).
     * Optional applicable_to filter (all | boarding | day) further narrows students.
     * Transport and dorm fees are auto-appended per issueInvoice (Phase 5A).
     *
     * @param  string|null $gradeLevel   e.g. "Form 1", "Grade 4" (or null if using class_id)
     * @param  string      $schoolId
     * @param  int         $term
     * @param  string      $year
     * @param  int|null    $classId      Optional — filter by classes.id
     * @param  string|null $applicableTo Optional — 'all' | 'boarding' | 'day'
     * @return array  ['issued' => N, 'skipped' => N, 'errors' => [...]]
     */
    public function bulkIssueInvoices(
        ?string $gradeLevel,
        string  $schoolId,
        int     $term,
        string  $year,
        ?int    $classId      = null,
        ?string $applicableTo = null
    ): array {
        $query = DB::table('students')
            ->where('school_id', $schoolId)
            ->where('status', 'Active');

        if ($classId) {
            $query->where('class_id', $classId);
        } elseif ($gradeLevel) {
            $query->where('grade_level', $gradeLevel);
        }

        // Phase 5B — filter by boarding/day mode when applicable_to is specified
        if ($applicableTo && $applicableTo !== 'all') {
            if ($applicableTo === 'boarding') {
                // Only students with an active dorm allocation
                $query->whereExists(function ($sub) {
                    $sub->from('dorm_allocations')
                        ->whereColumn('dorm_allocations.student_id', 'students.id')
                        ->whereNull('dorm_allocations.moved_out_on');
                });
            } elseif ($applicableTo === 'day') {
                // Students without an active dorm allocation
                $query->whereNotExists(function ($sub) {
                    $sub->from('dorm_allocations')
                        ->whereColumn('dorm_allocations.student_id', 'students.id')
                        ->whereNull('dorm_allocations.moved_out_on');
                });
            }
        }

        $studentIds = $query->pluck('id');

        $issued = 0; $skipped = 0; $errors = [];

        foreach ($studentIds as $studentId) {
            try {
                $this->issueInvoice($studentId, $term, $year);
                $issued++;
            } catch (\Exception $e) {
                if (str_contains($e->getMessage(), 'already exists')) {
                    $skipped++;
                } else {
                    $errors[] = ['student_id' => $studentId, 'error' => $e->getMessage()];
                }
            }
        }

        return compact('issued', 'skipped', 'errors');
    }

    /**
     * Cancel an invoice (only if no payments recorded against it).
     */
    public function cancelInvoice(int $invoiceId, string $reason = ''): void
    {
        DB::transaction(function () use ($invoiceId, $reason) {
            $invoice = DB::table('student_fee_invoices')->where('id', $invoiceId)->lockForUpdate()->first();

            if (!$invoice) {
                throw new \Exception("Invoice not found.");
            }
            if ($invoice->total_paid > 0) {
                throw new \Exception("Cannot cancel an invoice that has payments. Reverse the payments first.");
            }

            DB::table('student_fee_invoices')->where('id', $invoiceId)->update([
                'status'     => 'cancelled',
                'notes'      => $reason,
                'updated_at' => now(),
            ]);
        });
    }

    // =========================================================================
    // PAYMENTS
    // =========================================================================

    /**
     * Record a fee payment against an invoice.
     * Atomically: creates payment + updates invoice totals + creates receipt record.
     *
     * @param  int    $invoiceId
     * @param  int    $amount         Integer KES
     * @param  string $method         cash|mpesa|bank_transfer|cheque|standing_order|card
     * @param  array  $meta           ['mpesa_code','bank_ref','cheque_number','bank_account_id','payment_date','notes']
     * @return array                  ['payment' => ..., 'receipt_number' => '...']
     */
    public function recordPayment(int $invoiceId, int $amount, string $method, array $meta = []): array
    {
        if ($amount <= 0) {
            throw new \Exception("Payment amount must be greater than zero.");
        }

        return DB::transaction(function () use ($invoiceId, $amount, $method, $meta) {
            $invoice = DB::table('student_fee_invoices')
                ->where('id', $invoiceId)
                ->lockForUpdate()
                ->first();

            if (!$invoice) {
                throw new \Exception("Invoice not found.");
            }
            if ($invoice->status === 'cancelled') {
                throw new \Exception("Cannot record payment against a cancelled invoice.");
            }

            $schoolId      = $invoice->school_id;
            $year          = $invoice->academic_year;
            $receiptNumber = $this->numbers->nextReceipt($schoolId, $year);

            $paymentId = DB::table('fee_payments')->insertGetId([
                'school_id'        => $schoolId,
                'invoice_id'       => $invoiceId,
                'student_id'       => $invoice->student_id,
                'receipt_number'   => $receiptNumber,
                'amount'           => $amount,
                'payment_method'   => $method,
                'mpesa_code'       => $meta['mpesa_code']       ?? null,
                'bank_ref'         => $meta['bank_ref']         ?? null,
                'cheque_number'    => $meta['cheque_number']    ?? null,
                'bank_account_id'  => $meta['bank_account_id'] ?? null,
                'payment_date'     => $meta['payment_date']     ?? now()->toDateString(),
                'academic_year'    => $year,
                'term'             => $invoice->term,
                'received_by'      => Auth::id(),
                'verified_by'      => null,
                'status'           => 'confirmed',
                'reversal_id'      => null,
                'notes'            => $meta['notes'] ?? null,
                'created_at'       => now(),
                'updated_at'       => now(),
            ]);

            // Create receipt record
            DB::table('fee_receipts')->insert([
                'school_id'      => $schoolId,
                'payment_id'     => $paymentId,
                'receipt_number' => $receiptNumber,
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);

            // Update invoice totals atomically
            $newPaid    = $invoice->total_paid + $amount;
            $newBalance = $invoice->total_charged - $newPaid;
            $newStatus  = $this->deriveInvoiceStatus($invoice->total_charged, $newPaid);

            DB::table('student_fee_invoices')->where('id', $invoiceId)->update([
                'total_paid'  => $newPaid,
                'balance'     => $newBalance,
                'status'      => $newStatus,
                'updated_at'  => now(),
            ]);

            return [
                'payment'        => DB::table('fee_payments')->where('id', $paymentId)->first(),
                'receipt_number' => $receiptNumber,
            ];
        });
    }

    /**
     * Reverse a payment (immutable — creates a negative mirror, marks original as reversed).
     *
     * @param  int    $paymentId
     * @param  string $reason
     * @return array  The reversal payment record
     */
    public function reversePayment(int $paymentId, string $reason = ''): array
    {
        return DB::transaction(function () use ($paymentId, $reason) {
            $payment = DB::table('fee_payments')->where('id', $paymentId)->lockForUpdate()->first();

            if (!$payment) throw new \Exception("Payment not found.");
            if ($payment->status === 'reversed') throw new \Exception("Payment already reversed.");

            $schoolId      = $payment->school_id;
            $year          = $payment->academic_year;
            $receiptNumber = $this->numbers->nextRefund($schoolId, $year);

            // Create reversal record
            $reversalId = DB::table('fee_payments')->insertGetId([
                'school_id'      => $schoolId,
                'invoice_id'     => $payment->invoice_id,
                'student_id'     => $payment->student_id,
                'receipt_number' => $receiptNumber,
                'amount'         => $payment->amount,
                'payment_method' => $payment->payment_method,
                'payment_date'   => now()->toDateString(),
                'academic_year'  => $year,
                'term'           => $payment->term,
                'received_by'    => Auth::id(),
                'status'         => 'reversed',
                'reversal_id'    => $paymentId,
                'notes'          => $reason ?: 'Reversal of receipt ' . $payment->receipt_number,
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);

            // Mark original as reversed
            DB::table('fee_payments')->where('id', $paymentId)->update([
                'status'     => 'reversed',
                'updated_at' => now(),
            ]);

            // Restore invoice balance
            if ($payment->invoice_id) {
                $invoice = DB::table('student_fee_invoices')->where('id', $payment->invoice_id)->lockForUpdate()->first();
                if ($invoice) {
                    $newPaid    = max(0, $invoice->total_paid - $payment->amount);
                    $newBalance = $invoice->total_charged - $newPaid;
                    $newStatus  = $this->deriveInvoiceStatus($invoice->total_charged, $newPaid);
                    DB::table('student_fee_invoices')->where('id', $invoice->id)->update([
                        'total_paid' => $newPaid,
                        'balance'    => $newBalance,
                        'status'     => $newStatus,
                        'updated_at' => now(),
                    ]);
                }
            }

            return DB::table('fee_payments')->where('id', $reversalId)->first(['*']);
        });
    }

    // =========================================================================
    // DISCOUNTS & SURCHARGES
    // =========================================================================

    /**
     * Apply a discount to a specific invoice item or to the invoice total.
     *
     * @param  int   $invoiceId
     * @param  array $discount  ['type','amount_or_pct','is_percentage','reason','approved_by']
     */
    public function applyDiscount(int $invoiceId, array $discount): void
    {
        DB::transaction(function () use ($invoiceId, $discount) {
            $invoice = DB::table('student_fee_invoices')->where('id', $invoiceId)->lockForUpdate()->first();
            if (!$invoice) throw new \Exception("Invoice not found.");

            $amount = $discount['is_percentage']
                ? (int) round($invoice->total_charged * ($discount['amount_or_pct'] / 100))
                : (int) $discount['amount_or_pct'];

            DB::table('student_discounts')->insert([
                'school_id'     => $invoice->school_id,
                'student_id'    => $invoice->student_id,
                'invoice_id'    => $invoiceId,
                'discount_type' => $discount['discount_type'] ?? 'custom',
                'amount_or_pct' => $discount['amount_or_pct'],
                'is_percentage' => $discount['is_percentage'] ?? false,
                'reason'        => $discount['reason'] ?? null,
                'approved_by'   => $discount['approved_by'] ?? Auth::id(),
                'active'        => true,
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);

            // Adjust invoice total
            $newCharged = max(0, $invoice->total_charged - $amount);
            $newBalance = $newCharged - $invoice->total_paid;
            DB::table('student_fee_invoices')->where('id', $invoiceId)->update([
                'total_charged' => $newCharged,
                'balance'       => $newBalance,
                'status'        => $this->deriveInvoiceStatus($newCharged, $invoice->total_paid),
                'updated_at'    => now(),
            ]);
        });
    }

    /**
     * Apply a surcharge (late fee, returned cheque penalty, etc.) to an invoice.
     */
    public function applySurcharge(int $invoiceId, int $amount, string $reason, bool $auto = false): void
    {
        DB::transaction(function () use ($invoiceId, $amount, $reason, $auto) {
            $invoice = DB::table('student_fee_invoices')->where('id', $invoiceId)->lockForUpdate()->first();
            if (!$invoice) throw new \Exception("Invoice not found.");

            DB::table('surcharges')->insert([
                'school_id'    => $invoice->school_id,
                'invoice_id'   => $invoiceId,
                'student_id'   => $invoice->student_id,
                'amount'       => $amount,
                'reason'       => $reason,
                'auto_applied' => $auto,
                'applied_at'   => now(),
                'applied_by'   => $auto ? null : Auth::id(),
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);

            $newCharged = $invoice->total_charged + $amount;
            $newBalance = $newCharged - $invoice->total_paid;
            DB::table('student_fee_invoices')->where('id', $invoiceId)->update([
                'total_charged' => $newCharged,
                'balance'       => $newBalance,
                'status'        => $this->deriveInvoiceStatus($newCharged, $invoice->total_paid),
                'updated_at'    => now(),
            ]);
        });
    }

    // =========================================================================
    // LEDGER
    // =========================================================================

    /**
     * Return the full charge/payment timeline for a student in a given term/year.
     * If term/year is null, returns all history.
     */
    public function getStudentLedger(int $studentId, string $year = null, int $term = null): array
    {
        $invoiceQuery = DB::table('student_fee_invoices')
            ->where('student_id', $studentId);

        if ($year) $invoiceQuery->where('academic_year', $year);
        if ($term) $invoiceQuery->where('term', $term);

        $invoices = $invoiceQuery->get();
        $invoiceIds = $invoices->pluck('id')->toArray();

        $payments = DB::table('fee_payments')
            ->whereIn('invoice_id', $invoiceIds)
            ->where('status', '!=', 'reversed')
            ->orderBy('payment_date')
            ->get();

        $discounts = DB::table('student_discounts')
            ->where('student_id', $studentId)
            ->where('active', true)
            ->get();

        $surcharges = DB::table('surcharges')
            ->where('student_id', $studentId)
            ->whereIn('invoice_id', $invoiceIds)
            ->get();

        return compact('invoices', 'payments', 'discounts', 'surcharges');
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    private function deriveInvoiceStatus(int $charged, int $paid): string
    {
        if ($charged === 0)  return 'paid';
        if ($paid === 0)     return 'issued';
        if ($paid >= $charged + 1) return 'overpaid';  // paid > charged
        if ($paid === $charged)    return 'paid';
        return 'partial';
    }

    private function studentMode(Student $student): string
    {
        // Determine if the student is boarding or day
        // This can be derived from dorm allocation or a student attribute
        $isDormed = DB::table('dorm_allocations')
            ->where('student_id', $student->id)
            ->whereNull('moved_out_on')
            ->exists();

        return $isDormed ? 'boarding' : 'day';
    }

    private function computeDiscount(int $itemAmount, $discounts): int
    {
        $total = 0;
        foreach ($discounts as $d) {
            if ($d->is_percentage) {
                $total += (int) round($itemAmount * ($d->amount_or_pct / 100));
            } else {
                // Flat discount is split proportionally if multiple items — simplify: apply full
                $total += $d->amount_or_pct;
            }
        }
        return min($total, $itemAmount); // discount can't exceed item amount
    }
}
