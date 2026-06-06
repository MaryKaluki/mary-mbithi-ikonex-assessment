<?php

namespace App\Services\Finance;

use App\Models\School;
use Illuminate\Support\Facades\DB;

/**
 * Generates school-scoped sequential document numbers.
 *
 * Uses SELECT FOR UPDATE inside a transaction to guarantee uniqueness
 * under concurrent requests (no gaps, no duplicates).
 *
 * Format: {SCHOOL_CODE}-{TYPE}-{YEAR}-{NNNNN}
 *   e.g.  KASEE-RCT-2026-00142
 *         KASEE-INV-2026-T1-00042
 */
class ReceiptNumberService
{
    /**
     * Generate the next receipt number for a school.
     *
     * @param  string $schoolId   The school's varchar id
     * @param  string $year       e.g. "2026"
     * @return string             e.g. "KASEE-RCT-2026-00142"
     */
    public function nextReceipt(string $schoolId, string $year): string
    {
        return $this->next($schoolId, 'receipt', $year);
    }

    /**
     * Generate the next invoice number for a school.
     *
     * @param  string $schoolId
     * @param  string $year
     * @param  int    $term      1 | 2 | 3
     * @return string             e.g. "KASEE-INV-2026-T1-00042"
     */
    public function nextInvoice(string $schoolId, string $year, int $term): string
    {
        $raw = $this->next($schoolId, 'invoice', $year);
        // Inject term into the number: KASEE-INV-2026-00042 → KASEE-INV-2026-T1-00042
        return str_replace("-INV-{$year}-", "-INV-{$year}-T{$term}-", $raw);
    }

    /**
     * Generate the next expense claim number.
     */
    public function nextExpense(string $schoolId, string $year): string
    {
        return $this->next($schoolId, 'expense', $year);
    }

    /**
     * Generate the next refund number.
     */
    public function nextRefund(string $schoolId, string $year): string
    {
        return $this->next($schoolId, 'refund', $year);
    }

    // -------------------------------------------------------------------------

    private function next(string $schoolId, string $type, string $year): string
    {
        $number = DB::transaction(function () use ($schoolId, $type, $year) {
            // Lock the counter row for this school+type+year
            $counter = DB::table('finance_counters')
                ->where('school_id', $schoolId)
                ->where('counter_type', $type)
                ->where('counter_year', $year)
                ->lockForUpdate()
                ->first();

            if ($counter) {
                $next = $counter->last_number + 1;
                DB::table('finance_counters')
                    ->where('id', $counter->id)
                    ->update(['last_number' => $next, 'updated_at' => now()]);
            } else {
                $next = 1;
                DB::table('finance_counters')->insert([
                    'school_id'    => $schoolId,
                    'counter_type' => $type,
                    'counter_year' => $year,
                    'last_number'  => $next,
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ]);
            }

            return $next;
        });

        $code   = $this->schoolCode($schoolId);
        $suffix = str_pad($number, 5, '0', STR_PAD_LEFT);
        $typeTag = strtoupper(substr($type, 0, 3));  // RCT | INV | EXP | REF

        return "{$code}-{$typeTag}-{$year}-{$suffix}";
    }

    /**
     * Derive a short code from the school id (max 6 chars, uppercase).
     * If the school id is "kasee-primary" → "KASEE"
     * If the school id is a UUID, we use first 6 chars.
     */
    private function schoolCode(string $schoolId): string
    {
        // Try to load the school's short code from settings, or derive from id
        $code = DB::table('school_settings')
            ->where('school_id', $schoolId)
            ->where('key', 'school_code')
            ->value('value');

        if ($code) {
            return strtoupper(substr($code, 0, 6));
        }

        // Fallback: first segment of id before any dash/dot, max 6 chars
        $segment = explode('-', $schoolId)[0];
        return strtoupper(substr($segment, 0, 6));
    }
}
