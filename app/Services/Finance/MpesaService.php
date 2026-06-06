<?php

namespace App\Services\Finance;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

/**
 * Safaricom Daraja M-Pesa integration.
 *
 * Handles:
 *  - STK Push (Lipa Na M-Pesa Online)
 *  - C2B Paybill IPN (validation + confirmation callbacks)
 *  - Auto-matching incoming payments to student invoices by ADM number
 *
 * All amounts are integer KES. No float math.
 *
 * Environment variables required:
 *  MPESA_ENV              = sandbox | production
 *  MPESA_CONSUMER_KEY
 *  MPESA_CONSUMER_SECRET
 *  MPESA_PASSKEY          (for STK Push)
 *  MPESA_SHORTCODE        (paybill/till for STK Push)
 *  MPESA_C2B_SHORTCODE    (paybill for C2B, may differ from STK shortcode)
 *  MPESA_CALLBACK_URL     (public URL for STK callbacks)
 *  MPESA_VALIDATION_URL   (public URL for C2B validation)
 *  MPESA_CONFIRMATION_URL (public URL for C2B confirmation)
 */
class MpesaService
{
    private string $baseUrl;

    public function __construct(protected FeeService $fees)
    {
        $this->baseUrl = config('mpesa.env') === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';
    }

    // ─── Authentication ───────────────────────────────────────────────────────

    /**
     * Fetch OAuth2 access token. Cached for 55 minutes (token TTL = 60 min).
     */
    public function accessToken(): string
    {
        return Cache::remember('mpesa_access_token', 3300, function () {
            $key    = config('mpesa.consumer_key');
            $secret = config('mpesa.consumer_secret');

            $response = Http::withBasicAuth($key, $secret)
                ->timeout(15)
                ->get("{$this->baseUrl}/oauth/v1/generate?grant_type=client_credentials");

            if (!$response->successful()) {
                throw new \RuntimeException('M-Pesa auth failed: ' . $response->body());
            }

            return $response->json('access_token');
        });
    }

    // ─── STK Push ─────────────────────────────────────────────────────────────

    /**
     * Initiate Lipa Na M-Pesa Online (STK Push).
     *
     * @param  string $phone       Phone in 254XXXXXXXXX format
     * @param  int    $amount      KES integer
     * @param  string $accountRef  Student ADM number or invoice number
     * @param  string $description Short description shown on phone
     * @return array               Safaricom response
     */
    public function stkPush(string $phone, int $amount, string $accountRef, string $description = 'School Fee'): array
    {
        $shortcode  = config('mpesa.shortcode');
        $passkey    = config('mpesa.passkey');
        $timestamp  = now()->format('YmdHis');
        $password   = base64_encode($shortcode . $passkey . $timestamp);

        $payload = [
            'BusinessShortCode' => $shortcode,
            'Password'          => $password,
            'Timestamp'         => $timestamp,
            'TransactionType'   => 'CustomerPayBillOnline',
            'Amount'            => $amount,
            'PartyA'            => $phone,
            'PartyB'            => $shortcode,
            'PhoneNumber'       => $phone,
            'CallBackURL'       => config('mpesa.callback_url'),
            'AccountReference'  => $accountRef,
            'TransactionDesc'   => substr($description, 0, 13),
        ];

        $response = Http::withToken($this->accessToken())
            ->timeout(30)
            ->post("{$this->baseUrl}/mpesa/stkpush/v1/processrequest", $payload);

        Log::info('MPesa STK Push', [
            'phone'    => substr($phone, 0, 6) . '****',
            'amount'   => $amount,
            'response' => $response->json(),
        ]);

        return $response->json();
    }

    /**
     * Handle STK Push callback from Safaricom.
     * Called by POST /api/mpesa/stk/callback
     */
    public function handleStkCallback(array $payload): void
    {
        $body = $payload['Body']['stkCallback'] ?? null;
        if (!$body) {
            Log::warning('MPesa STK callback: missing body', $payload);
            return;
        }

        $resultCode = $body['ResultCode'] ?? -1;
        $checkoutId = $body['CheckoutRequestID'] ?? null;

        if ($resultCode !== 0) {
            // Payment failed or cancelled by user
            Log::info('MPesa STK failed', ['result' => $resultCode, 'desc' => $body['ResultDesc'] ?? '']);
            return;
        }

        // Extract callback metadata
        $items  = collect($body['CallbackMetadata']['Item'] ?? []);
        $get    = fn($name) => $items->firstWhere('Name', $name)['Value'] ?? null;

        $receipt   = $get('MpesaReceiptNumber');
        $amount    = (int) $get('Amount');
        $phone     = (string) ($get('PhoneNumber') ?? '');
        $txDate    = $get('TransactionDate'); // YmdHis string

        if (!$receipt) {
            Log::warning('MPesa STK callback: no receipt number', $body);
            return;
        }

        // Retrieve the pending checkout to get the accountReference and school
        $pending = Cache::get("mpesa_stk_{$checkoutId}");
        $schoolId     = $pending['school_id'] ?? null;
        $accountRef   = $pending['account_ref'] ?? null;
        $invoiceId    = $pending['invoice_id'] ?? null;

        $this->persistAndMatch(
            schoolId:     $schoolId,
            receipt:      $receipt,
            type:         'stk_push',
            amount:       $amount,
            phone:        $phone,
            accountRef:   $accountRef,
            txDate:       $txDate ? \Carbon\Carbon::createFromFormat('YmdHis', $txDate) : now(),
            rawPayload:   $payload,
            invoiceId:    $invoiceId,
        );
    }

    // ─── C2B ──────────────────────────────────────────────────────────────────

    /**
     * Handle C2B Validation callback.
     * Safaricom calls this before crediting school account — school must accept or reject.
     *
     * Return 0 = Accept, 1 = Reject.
     */
    public function handleC2BValidation(array $payload): array
    {
        // Accept all payments — rejection would mean customer's money is stuck
        return [
            'ResultCode'        => 0,
            'ResultDesc'        => 'Accepted',
        ];
    }

    /**
     * Handle C2B Confirmation callback.
     * Called after Safaricom has credited school paybill. This is the source of truth.
     */
    public function handleC2BConfirmation(array $payload): void
    {
        $receipt    = $payload['TransID']           ?? null;
        $amount     = (int) ($payload['TransAmount'] ?? 0);
        $phone      = $payload['MSISDN']            ?? '';
        $accountRef = $payload['BillRefNumber']     ?? null; // ADM number typed by payer
        $shortcode  = $payload['BusinessShortCode'] ?? null;
        $txDate     = $payload['TransTime']         ?? null; // YYYYMMDDHHmmss

        if (!$receipt) {
            Log::warning('MPesa C2B: missing TransID', $payload);
            return;
        }

        // Identify school by paybill shortcode
        $bankAccount = DB::table('bank_accounts')
            ->where('mpesa_shortcode', $shortcode)
            ->first();
        $schoolId = $bankAccount?->school_id;

        $this->persistAndMatch(
            schoolId:   $schoolId,
            receipt:    $receipt,
            type:       'c2b',
            amount:     $amount,
            phone:      $phone,
            accountRef: $accountRef,
            txDate:     $txDate ? \Carbon\Carbon::createFromFormat('YmdHis', $txDate) : now(),
            rawPayload: $payload,
        );
    }

    // ─── Core persist + auto-match ────────────────────────────────────────────

    private function persistAndMatch(
        ?string $schoolId,
        string  $receipt,
        string  $type,
        int     $amount,
        string  $phone,
        ?string $accountRef,
        \Carbon\Carbon $txDate,
        array   $rawPayload,
        ?int    $invoiceId = null,
    ): void {
        // Idempotency — skip if already stored
        if (DB::table('mpesa_transactions')->where('mpesa_receipt_number', $receipt)->exists()) {
            Log::info('MPesa: duplicate receipt ignored', ['receipt' => $receipt]);
            return;
        }

        DB::transaction(function () use (
            $schoolId, $receipt, $type, $amount, $phone, $accountRef,
            $txDate, $rawPayload, $invoiceId
        ) {
            $txId = DB::table('mpesa_transactions')->insertGetId([
                'school_id'            => $schoolId,
                'mpesa_receipt_number' => $receipt,
                'transaction_type'     => $type,
                'amount'               => $amount,
                'phone_number'         => encrypt($phone),
                'account_reference'    => $accountRef,
                'transaction_date'     => $txDate,
                'matched_invoice_id'   => $invoiceId,
                'is_matched'           => false,
                'raw_payload'          => json_encode($rawPayload),
                'created_at'           => now(),
                'updated_at'           => now(),
            ]);

            if (!$schoolId) {
                Log::warning('MPesa: could not identify school for receipt', ['receipt' => $receipt]);
                return;
            }

            // Attempt auto-match by ADM number
            $matched = $this->autoMatch($txId, $schoolId, $amount, $accountRef, $invoiceId, $phone);

            if (!$matched) {
                Log::info('MPesa: unmatched transaction', [
                    'receipt'    => $receipt,
                    'accountRef' => $accountRef,
                    'amount'     => $amount,
                ]);
            }
        });
    }

    /**
     * Try to auto-match a transaction to an invoice.
     * Returns true if matched successfully.
     */
    public function autoMatch(int $txId, string $schoolId, int $amount, ?string $accountRef, ?int $invoiceId, string $phone): bool
    {
        $invoice = null;

        // 1. Direct invoice ID from STK Push
        if ($invoiceId) {
            $invoice = DB::table('student_fee_invoices')
                ->where('id', $invoiceId)
                ->where('school_id', $schoolId)
                ->where('status', '!=', 'cancelled')
                ->first();
        }

        // 2. Match by ADM number in account_reference
        if (!$invoice && $accountRef) {
            $student = DB::table('students')
                ->where('school_id', $schoolId)
                ->where('admission_number', $accountRef)
                ->first();

            if ($student) {
                // Oldest unpaid/partial invoice in active term
                $invoice = DB::table('student_fee_invoices')
                    ->where('school_id', $schoolId)
                    ->where('student_id', $student->id)
                    ->whereIn('status', ['issued', 'partial'])
                    ->orderBy('created_at')
                    ->first();
            }
        }

        // 3. Match by phone number (last resort)
        if (!$invoice && $phone) {
            $student = DB::table('students')
                ->where('school_id', $schoolId)
                ->whereRaw("REPLACE(phone, ' ', '') = ?", [preg_replace('/\s+/', '', $phone)])
                ->orWhereRaw("REPLACE(parent_phone, ' ', '') = ?", [preg_replace('/\s+/', '', $phone)])
                ->first();

            if ($student) {
                $invoice = DB::table('student_fee_invoices')
                    ->where('school_id', $schoolId)
                    ->where('student_id', $student->id)
                    ->whereIn('status', ['issued', 'partial'])
                    ->orderBy('created_at')
                    ->first();
            }
        }

        if (!$invoice) {
            return false;
        }

        // Record the payment via FeeService
        try {
            $mpesaTx = DB::table('mpesa_transactions')->find($txId);
            $result  = $this->fees->recordPayment([
                'invoice_id'     => $invoice->id,
                'amount'         => $amount,
                'payment_method' => 'mpesa',
                'mpesa_code'     => $mpesaTx->mpesa_receipt_number,
                'payment_date'   => now()->toDateString(),
                'notes'          => 'Auto-matched via M-Pesa IPN',
            ], schoolId: $schoolId, userId: null);

            // Link tx to payment
            DB::table('mpesa_transactions')->where('id', $txId)->update([
                'matched_invoice_id' => $invoice->id,
                'matched_payment_id' => $result['payment_id'] ?? null,
                'is_matched'         => true,
                'match_method'       => $invoiceId ? 'stk_invoice' : ($accountRef ? 'auto_adm' : 'phone'),
                'matched_at'         => now(),
                'updated_at'         => now(),
            ]);

            return true;
        } catch (\Throwable $e) {
            Log::error('MPesa auto-match payment failed', [
                'tx_id'      => $txId,
                'invoice_id' => $invoice->id,
                'error'      => $e->getMessage(),
            ]);
            return false;
        }
    }

    // ─── Manual match ─────────────────────────────────────────────────────────

    /**
     * Manually match an unmatched M-Pesa transaction to an invoice.
     */
    public function manualMatch(int $txId, int $invoiceId, string $schoolId, int $userId): void
    {
        $tx = DB::table('mpesa_transactions')
            ->where('id', $txId)
            ->where('school_id', $schoolId)
            ->firstOrFail();

        if ($tx->is_matched) {
            throw new \RuntimeException('Transaction already matched.');
        }

        DB::transaction(function () use ($tx, $txId, $invoiceId, $schoolId, $userId) {
            $result = $this->fees->recordPayment([
                'invoice_id'     => $invoiceId,
                'amount'         => $tx->amount,
                'payment_method' => 'mpesa',
                'mpesa_code'     => $tx->mpesa_receipt_number,
                'payment_date'   => now()->toDateString(),
                'notes'          => 'Manually matched M-Pesa transaction',
            ], schoolId: $schoolId, userId: $userId);

            DB::table('mpesa_transactions')->where('id', $txId)->update([
                'matched_invoice_id' => $invoiceId,
                'matched_payment_id' => $result['payment_id'] ?? null,
                'is_matched'         => true,
                'match_method'       => 'manual',
                'matched_at'         => now(),
                'matched_by'         => $userId,
                'updated_at'         => now(),
            ]);
        });
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Normalise phone to 254XXXXXXXXX format.
     */
    public static function normalisePhone(string $phone): string
    {
        $phone = preg_replace('/\D/', '', $phone);
        if (str_starts_with($phone, '0')) {
            $phone = '254' . substr($phone, 1);
        } elseif (str_starts_with($phone, '+')) {
            $phone = ltrim($phone, '+');
        }
        return $phone;
    }
}
