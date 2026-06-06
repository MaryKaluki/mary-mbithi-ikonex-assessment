<?php

namespace App\Services\Finance;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

/**
 * Phase 6 — QuickBooks Online + CSV export service.
 *
 * This service handles:
 *  1. QBO OAuth2 flow (get auth URL, exchange code, refresh token)
 *  2. Syncing Skullu financial records → QBO entities
 *  3. CSV export of any financial dataset
 *
 * QBO is treated as a read-only mirror.  Skullu is always the master of truth.
 *
 * Environment variables needed (.env):
 *   QBO_CLIENT_ID
 *   QBO_CLIENT_SECRET
 *   QBO_REDIRECT_URI      (e.g. https://yourapp.com/api/finance/quickbooks/callback)
 *   QBO_ENVIRONMENT       'sandbox' | 'production'
 */
class TransactionSyncService
{
    // ─────────────────────────────────────────────────────────────────────────
    // CONSTANTS
    // ─────────────────────────────────────────────────────────────────────────

    private const QB_AUTH_BASE   = 'https://appcenter.intuit.com/connect/oauth2';
    private const QB_TOKEN_URL   = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
    private const QB_API_BASE_SB = 'https://sandbox-quickbooks.api.intuit.com/v3/company';
    private const QB_API_BASE_PR = 'https://quickbooks.api.intuit.com/v3/company';

    private function apiBase(): string
    {
        return config('services.qbo.environment', 'sandbox') === 'production'
            ? self::QB_API_BASE_PR
            : self::QB_API_BASE_SB;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AUTH FLOW
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Generate the QBO OAuth2 authorisation URL for this school.
     * Embeds school_id as state so the callback can identify the tenant.
     */
    public function getAuthUrl(string $schoolId): string
    {
        $params = http_build_query([
            'client_id'     => config('services.qbo.client_id'),
            'response_type' => 'code',
            'scope'         => 'com.intuit.quickbooks.accounting',
            'redirect_uri'  => config('services.qbo.redirect_uri'),
            'state'         => base64_encode(json_encode(['school_id' => $schoolId, 'ts' => time()])),
        ]);

        return self::QB_AUTH_BASE . '?' . $params;
    }

    /**
     * Exchange the authorisation code (from callback) for access + refresh tokens.
     * Saves credentials to qbo_credentials.
     *
     * @param  string $code       OAuth2 code from QBO callback
     * @param  string $realmId    QBO company (realm) ID
     * @param  string $schoolId   Skullu school_id
     */
    public function handleCallback(string $code, string $realmId, string $schoolId): array
    {
        $response = Http::withBasicAuth(
            config('services.qbo.client_id'),
            config('services.qbo.client_secret')
        )->asForm()->post(self::QB_TOKEN_URL, [
            'grant_type'   => 'authorization_code',
            'code'         => $code,
            'redirect_uri' => config('services.qbo.redirect_uri'),
        ]);

        if (!$response->ok()) {
            throw new \RuntimeException('QBO token exchange failed: ' . $response->body());
        }

        $tokens = $response->json();

        // Fetch company name
        $companyName = $this->fetchCompanyName($tokens['access_token'], $realmId);

        DB::table('qbo_credentials')->updateOrInsert(
            ['school_id' => $schoolId],
            [
                'access_token'     => Crypt::encryptString($tokens['access_token']),
                'refresh_token'    => Crypt::encryptString($tokens['refresh_token']),
                'realm_id'         => $realmId,
                'company_name'     => $companyName,
                'token_expires_at' => now()->addSeconds($tokens['expires_in'] ?? 3600),
                'is_active'        => true,
                'updated_at'       => now(),
                'created_at'       => now(),
            ]
        );

        $this->logSync($schoolId, 'batch', null, 'success', 'QBO connected — ' . $companyName);

        return ['connected' => true, 'company' => $companyName, 'realm_id' => $realmId];
    }

    /**
     * Revoke QBO access for this school.
     */
    public function disconnect(string $schoolId): void
    {
        $cred = DB::table('qbo_credentials')->where('school_id', $schoolId)->first();
        if (!$cred) return;

        // Try to revoke on QBO's side (non-fatal if it fails)
        try {
            Http::withBasicAuth(
                config('services.qbo.client_id'),
                config('services.qbo.client_secret')
            )->asForm()->post('https://developer.api.intuit.com/v2/oauth2/tokens/revoke', [
                'token' => Crypt::decryptString($cred->refresh_token),
            ]);
        } catch (\Throwable $e) {}

        DB::table('qbo_credentials')->where('school_id', $schoolId)->update(['is_active' => false]);
        $this->logSync($schoolId, 'batch', null, 'success', 'QBO disconnected.');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STATUS
    // ─────────────────────────────────────────────────────────────────────────

    public function getStatus(string $schoolId): array
    {
        $cred = DB::table('qbo_credentials')
            ->where('school_id', $schoolId)
            ->where('is_active', true)
            ->first();

        if (!$cred) {
            return ['connected' => false];
        }

        $lastSync = DB::table('qbo_sync_logs')
            ->where('school_id', $schoolId)
            ->where('status', 'success')
            ->orderByDesc('created_at')
            ->value('created_at');

        $errorCount = DB::table('qbo_sync_logs')
            ->where('school_id', $schoolId)
            ->where('status', 'error')
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        $pendingCount = DB::table('qbo_sync_logs')
            ->where('school_id', $schoolId)
            ->where('status', 'pending')
            ->count();

        return [
            'connected'      => true,
            'company_name'   => $cred->company_name,
            'realm_id'       => $cred->realm_id,
            'token_valid'    => now()->lt($cred->token_expires_at),
            'last_sync_at'   => $lastSync,
            'error_count_7d' => $errorCount,
            'pending_count'  => $pendingCount,
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SYNC — FULL BATCH
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Sync all un-synced financial records for a school to QBO.
     *
     * Processes:
     *   1. fee_payments  → QBO Sales Receipts
     *   2. expenses      → QBO Purchase (Bill)
     *   3. fund_transfers→ QBO Journal Entries
     *
     * Uses entity map to skip already-synced records.
     *
     * @param  string   $schoolId
     * @param  int|null $triggeredBy   User ID (null = scheduled)
     * @return array    ['synced' => N, 'errors' => N, 'skipped' => N]
     */
    public function syncToQuickBooks(string $schoolId, ?int $triggeredBy = null): array
    {
        $cred = $this->getActiveCredentials($schoolId);
        $token = $this->ensureFreshToken($schoolId, $cred);

        $stats = ['synced' => 0, 'errors' => 0, 'skipped' => 0];

        // ── 1. Fee Payments → QBO Sales Receipts ────────────────────────────
        $this->syncPayments($schoolId, $token, $cred->realm_id, $triggeredBy, $stats);

        // ── 2. Expenses → QBO Bills ─────────────────────────────────────────
        $this->syncExpenses($schoolId, $token, $cred->realm_id, $triggeredBy, $stats);

        // ── 3. Fund Transfers → QBO Journal Entries ──────────────────────────
        $this->syncFundTransfers($schoolId, $token, $cred->realm_id, $triggeredBy, $stats);

        // Log the batch run
        $this->logSync(
            $schoolId,
            'batch',
            null,
            $stats['errors'] === 0 ? 'success' : 'error',
            "Batch sync complete: {$stats['synced']} synced, {$stats['errors']} errors, {$stats['skipped']} skipped.",
            null,
            $triggeredBy
        );

        return $stats;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SYNC — FEE PAYMENTS → QBO SALES RECEIPTS
    // ─────────────────────────────────────────────────────────────────────────

    private function syncPayments(string $schoolId, string $token, string $realmId, ?int $uid, array &$stats): void
    {
        // Get un-synced payments
        $payments = DB::table('fee_payments as p')
            ->join('student_fee_invoices as inv', 'inv.id', '=', 'p.invoice_id')
            ->leftJoin('students as s', 's.id', '=', 'p.student_id')
            ->leftJoin('qbo_entity_map as m', function ($j) use ($schoolId) {
                $j->on('m.local_id', '=', 'p.id')
                  ->where('m.school_id', '=', $schoolId)
                  ->where('m.entity_type', '=', 'fee_payment');
            })
            ->where('p.school_id', $schoolId)
            ->where('p.status', 'confirmed')
            ->whereNull('m.id')  // not yet synced
            ->select(['p.id', 'p.amount', 'p.payment_date', 'p.payment_method', 'p.receipt_number',
                       'p.mpesa_code', 'p.bank_ref', 'p.notes',
                       's.first_name', 's.last_name', 's.admission_number',
                       'inv.invoice_number', 'inv.academic_year', 'inv.term'])
            ->limit(100) // batch of 100 per run
            ->get();

        foreach ($payments as $p) {
            try {
                $payload = [
                    'PaymentMethodRef' => ['value' => $this->mapPaymentMethod($p->payment_method)],
                    'TotalAmt'         => number_format($p->amount / 100, 2),
                    'TxnDate'          => $p->payment_date,
                    'PrivateNote'      => "Skullu receipt: {$p->receipt_number} | Invoice: {$p->invoice_number}",
                    'CustomerRef'      => ['value' => '1', 'name' => $p->first_name . ' ' . $p->last_name],
                    'DepositToAccountRef' => ['value' => '35'], // Income account — configurable
                    'Line'             => [[
                        'Amount'      => number_format($p->amount / 100, 2),
                        'DetailType'  => 'SalesItemLineDetail',
                        'Description' => "Fee Payment — {$p->academic_year} Term {$p->term}",
                        'SalesItemLineDetail' => [
                            'ItemRef' => ['value' => '1', 'name' => 'School Fees'],
                            'Qty'     => 1,
                            'UnitPrice' => number_format($p->amount / 100, 2),
                        ],
                    ]],
                ];

                $response = $this->qboPost($token, $realmId, 'salesreceipt', $payload);

                if (isset($response['SalesReceipt']['Id'])) {
                    $this->markSynced($schoolId, 'fee_payment', $p->id,
                        $response['SalesReceipt']['Id'], 'SalesReceipt');
                    $this->logSync($schoolId, 'fee_payment', $p->id, 'success',
                        "Payment {$p->receipt_number} synced", $response['SalesReceipt']['Id'], $uid);
                    $stats['synced']++;
                } else {
                    throw new \RuntimeException('Unexpected QBO response: ' . json_encode($response));
                }
            } catch (\Throwable $e) {
                $this->logSync($schoolId, 'fee_payment', $p->id, 'error',
                    "Payment {$p->receipt_number} failed", $e->getMessage(), $uid);
                $stats['errors']++;
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SYNC — EXPENSES → QBO BILLS
    // ─────────────────────────────────────────────────────────────────────────

    private function syncExpenses(string $schoolId, string $token, string $realmId, ?int $uid, array &$stats): void
    {
        $expenses = DB::table('expenses as e')
            ->leftJoin('expense_categories as ec', 'ec.id', '=', 'e.category_id')
            ->leftJoin('qbo_entity_map as m', function ($j) use ($schoolId) {
                $j->on('m.local_id', '=', 'e.id')
                  ->where('m.school_id', '=', $schoolId)
                  ->where('m.entity_type', '=', 'expense');
            })
            ->where('e.school_id', $schoolId)
            ->whereIn('e.status', ['approved', 'paid'])
            ->whereNull('m.id')
            ->select(['e.id', 'e.amount', 'e.expense_date', 'e.description', 'e.expense_number',
                       'e.payment_method', 'ec.name as category_name', 'ec.code as category_code'])
            ->limit(100)
            ->get();

        foreach ($expenses as $ex) {
            try {
                $payload = [
                    'TxnDate'     => $ex->expense_date,
                    'PrivateNote' => "Skullu expense: {$ex->expense_number}",
                    'AccountRef'  => ['value' => '7', 'name' => $ex->category_name ?? 'General Expenses'],
                    'TotalAmt'    => number_format($ex->amount / 100, 2),
                    'Line'        => [[
                        'Amount'      => number_format($ex->amount / 100, 2),
                        'DetailType'  => 'AccountBasedExpenseLineDetail',
                        'Description' => $ex->description,
                        'AccountBasedExpenseLineDetail' => [
                            'AccountRef' => ['value' => '7', 'name' => $ex->category_name ?? 'Expenses'],
                        ],
                    ]],
                    'PaymentMethodRef' => ['value' => $this->mapPaymentMethod($ex->payment_method)],
                ];

                $response = $this->qboPost($token, $realmId, 'purchase', $payload);

                if (isset($response['Purchase']['Id'])) {
                    $this->markSynced($schoolId, 'expense', $ex->id,
                        $response['Purchase']['Id'], 'Purchase');
                    $this->logSync($schoolId, 'expense', $ex->id, 'success',
                        "Expense {$ex->expense_number} synced", $response['Purchase']['Id'], $uid);
                    $stats['synced']++;
                } else {
                    throw new \RuntimeException('Unexpected QBO response: ' . json_encode($response));
                }
            } catch (\Throwable $e) {
                $this->logSync($schoolId, 'expense', $ex->id, 'error',
                    "Expense {$ex->expense_number} failed", $e->getMessage(), $uid);
                $stats['errors']++;
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SYNC — FUND TRANSFERS → QBO JOURNAL ENTRIES
    // ─────────────────────────────────────────────────────────────────────────

    private function syncFundTransfers(string $schoolId, string $token, string $realmId, ?int $uid, array &$stats): void
    {
        $transfers = DB::table('fund_transfer_requests as ft')
            ->leftJoin('qbo_entity_map as m', function ($j) use ($schoolId) {
                $j->on('m.local_id', '=', 'ft.id')
                  ->where('m.school_id', '=', $schoolId)
                  ->where('m.entity_type', '=', 'fund_transfer');
            })
            ->where('ft.school_id', $schoolId)
            ->where('ft.status', 'executed')
            ->whereNull('m.id')
            ->select(['ft.id', 'ft.amount', 'ft.transfer_date', 'ft.description',
                       'ft.transfer_number', 'ft.from_bank_account_id', 'ft.to_bank_account_id'])
            ->limit(50)
            ->get();

        foreach ($transfers as $t) {
            try {
                $payload = [
                    'TxnDate'     => $t->transfer_date ?? now()->toDateString(),
                    'PrivateNote' => "Skullu transfer: {$t->transfer_number}",
                    'Line'        => [
                        [   // Debit the destination account
                            'JournalEntryLineDetail' => [
                                'PostingType'  => 'Debit',
                                'AccountRef'   => ['value' => '35'],
                            ],
                            'Amount'     => number_format($t->amount / 100, 2),
                            'DetailType' => 'JournalEntryLineDetail',
                            'Description' => $t->description,
                        ],
                        [   // Credit the source account
                            'JournalEntryLineDetail' => [
                                'PostingType' => 'Credit',
                                'AccountRef'  => ['value' => '36'],
                            ],
                            'Amount'     => number_format($t->amount / 100, 2),
                            'DetailType' => 'JournalEntryLineDetail',
                            'Description' => $t->description,
                        ],
                    ],
                ];

                $response = $this->qboPost($token, $realmId, 'journalentry', $payload);

                if (isset($response['JournalEntry']['Id'])) {
                    $this->markSynced($schoolId, 'fund_transfer', $t->id,
                        $response['JournalEntry']['Id'], 'JournalEntry');
                    $this->logSync($schoolId, 'fund_transfer', $t->id, 'success',
                        "Transfer {$t->transfer_number} synced", $response['JournalEntry']['Id'], $uid);
                    $stats['synced']++;
                } else {
                    throw new \RuntimeException('Unexpected response: ' . json_encode($response));
                }
            } catch (\Throwable $e) {
                $this->logSync($schoolId, 'fund_transfer', $t->id, 'error',
                    "Transfer {$t->transfer_number} failed", $e->getMessage(), $uid);
                $stats['errors']++;
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CSV EXPORT
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Export a financial dataset to CSV.
     *
     * @param  string   $schoolId
     * @param  string   $exportType  One of: fee_payments | expenses | invoices |
     *                               petty_cash | fund_transfers | bank_statements |
     *                               defaulters | annual_summary
     * @param  array    $params      Date filters, term/year etc.
     * @param  int      $userId      Who triggered the export
     * @return array    ['rows' => N, 'csv' => string content]
     */
    public function exportCsv(string $schoolId, string $exportType, array $params, int $userId): array
    {
        $rows = $this->buildExportQuery($schoolId, $exportType, $params)->get();

        if ($rows->isEmpty()) {
            return ['rows' => 0, 'csv' => ''];
        }

        // Build CSV
        $first = (array) $rows->first();
        $headers = array_keys($first);

        $lines = [];
        $lines[] = implode(',', array_map(fn($h) => '"' . ucwords(str_replace('_', ' ', $h)) . '"', $headers));

        foreach ($rows as $row) {
            $cells = array_map(function ($val) {
                if (is_null($val)) return '';
                $val = str_replace('"', '""', (string) $val);
                return '"' . $val . '"';
            }, (array) $row);
            $lines[] = implode(',', $cells);
        }

        $csv = implode("\r\n", $lines);

        // Log the export
        DB::table('csv_exports')->insert([
            'school_id'   => $schoolId,
            'export_type' => $exportType,
            'parameters'  => json_encode($params),
            'row_count'   => $rows->count(),
            'exported_by' => $userId,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        return ['rows' => $rows->count(), 'csv' => $csv];
    }

    /**
     * Build the export query for a given type.
     */
    private function buildExportQuery(string $schoolId, string $exportType, array $params): \Illuminate\Database\Query\Builder
    {
        $from = $params['from'] ?? now()->startOfMonth()->toDateString();
        $to   = $params['to']   ?? now()->toDateString();
        $year = $params['academic_year'] ?? date('Y');
        $term = $params['term'] ?? null;

        return match ($exportType) {
            'fee_payments' => DB::table('fee_payments as p')
                ->join('students as s', 's.id', '=', 'p.student_id')
                ->join('student_fee_invoices as inv', 'inv.id', '=', 'p.invoice_id')
                ->where('p.school_id', $schoolId)
                ->whereBetween('p.payment_date', [$from, $to])
                ->select([
                    DB::raw("s.first_name || ' ' || s.last_name as student"),
                    's.admission_number',
                    'p.receipt_number', 'p.payment_date', 'p.payment_method',
                    DB::raw('p.amount / 100 as amount_kes'),
                    'inv.invoice_number', 'inv.academic_year', 'inv.term',
                    'p.mpesa_code', 'p.bank_ref', 'p.status',
                ]),

            'expenses' => DB::table('expenses as e')
                ->leftJoin('expense_categories as ec', 'ec.id', '=', 'e.category_id')
                ->leftJoin('users as u', 'u.id', '=', 'e.submitted_by')
                ->where('e.school_id', $schoolId)
                ->whereBetween('e.expense_date', [$from, $to])
                ->select([
                    'e.expense_number', 'e.expense_date', 'ec.name as category',
                    'e.description', 'e.payment_method',
                    DB::raw('e.amount / 100 as amount_kes'),
                    'e.status', 'u.name as submitted_by',
                ]),

            'invoices' => DB::table('student_fee_invoices as inv')
                ->join('students as s', 's.id', '=', 'inv.student_id')
                ->where('inv.school_id', $schoolId)
                ->where('inv.academic_year', $year)
                ->when($term, fn ($q) => $q->where('inv.term', $term))
                ->select([
                    'inv.invoice_number', 's.first_name', 's.last_name',
                    's.admission_number', 'inv.academic_year', 'inv.term',
                    DB::raw('inv.total_charged / 100 as charged_kes'),
                    DB::raw('inv.total_paid / 100 as paid_kes'),
                    DB::raw('inv.balance / 100 as balance_kes'),
                    'inv.status', 'inv.issued_at', 'inv.due_date',
                ]),

            'defaulters' => DB::table('student_fee_invoices as inv')
                ->join('students as s', 's.id', '=', 'inv.student_id')
                ->where('inv.school_id', $schoolId)
                ->where('inv.academic_year', $year)
                ->when($term, fn ($q) => $q->where('inv.term', $term))
                ->where('inv.balance', '>', 0)
                ->whereNotIn('inv.status', ['cancelled'])
                ->select([
                    'inv.invoice_number', 's.first_name', 's.last_name',
                    's.admission_number', 's.parent_phone',
                    'inv.academic_year', 'inv.term',
                    DB::raw('inv.balance / 100 as balance_kes'),
                    'inv.due_date', 'inv.status',
                ])->orderByDesc('inv.balance'),

            'petty_cash' => DB::table('petty_cash_transactions as t')
                ->join('petty_cash_accounts as a', 'a.id', '=', 't.account_id')
                ->where('a.school_id', $schoolId)
                ->whereBetween('t.transaction_date', [$from, $to])
                ->select([
                    't.transaction_date', 'a.name as account', 't.type', 't.description',
                    DB::raw('t.amount / 100 as amount_kes'), 't.reference',
                ]),

            'fund_transfers' => DB::table('fund_transfer_requests as ft')
                ->where('ft.school_id', $schoolId)
                ->whereBetween(DB::raw('COALESCE(ft.transfer_date, ft.created_at)'), [$from, $to])
                ->select([
                    'ft.transfer_number', 'ft.description',
                    DB::raw('ft.amount / 100 as amount_kes'),
                    'ft.status', 'ft.transfer_date', 'ft.created_at',
                ]),

            'annual_summary' => DB::table('fee_payments as p')
                ->where('p.school_id', $schoolId)
                ->where('p.academic_year', $year)
                ->where('p.status', 'confirmed')
                ->selectRaw('term, payment_method, COUNT(*) as count, SUM(amount) / 100 as total_kes')
                ->groupBy('term', 'payment_method'),

            default => DB::table('fee_payments')->where('school_id', $schoolId)->whereRaw('1=0')
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private function getActiveCredentials(string $schoolId): object
    {
        $cred = DB::table('qbo_credentials')
            ->where('school_id', $schoolId)
            ->where('is_active', true)
            ->first();

        if (!$cred) {
            throw new \RuntimeException('QuickBooks is not connected for this school.');
        }

        return $cred;
    }

    /**
     * Auto-refresh the access token if it expires within 5 minutes.
     * Returns the current (possibly refreshed) access token.
     */
    private function ensureFreshToken(string $schoolId, object $cred): string
    {
        if (now()->lt(now()->parse($cred->token_expires_at)->subMinutes(5))) {
            return Crypt::decryptString($cred->access_token);
        }

        // Refresh
        $response = Http::withBasicAuth(
            config('services.qbo.client_id'),
            config('services.qbo.client_secret')
        )->asForm()->post(self::QB_TOKEN_URL, [
            'grant_type'    => 'refresh_token',
            'refresh_token' => Crypt::decryptString($cred->refresh_token),
        ]);

        if (!$response->ok()) {
            throw new \RuntimeException('QBO token refresh failed: ' . $response->body());
        }

        $tokens = $response->json();

        DB::table('qbo_credentials')->where('school_id', $schoolId)->update([
            'access_token'     => Crypt::encryptString($tokens['access_token']),
            'refresh_token'    => Crypt::encryptString($tokens['refresh_token'] ?? Crypt::decryptString($cred->refresh_token)),
            'token_expires_at' => now()->addSeconds($tokens['expires_in'] ?? 3600),
            'updated_at'       => now(),
        ]);

        return $tokens['access_token'];
    }

    /**
     * POST to QBO API and return decoded response body.
     */
    private function qboPost(string $token, string $realmId, string $entity, array $payload): array
    {
        $url  = "{$this->apiBase()}/{$realmId}/{$entity}?minorversion=65";
        $body = [$this->pascalCase($entity) => $payload];

        $response = Http::withToken($token)
            ->withHeaders(['Accept' => 'application/json'])
            ->post($url, $body);

        if ($response->serverError()) {
            throw new \RuntimeException("QBO API error {$response->status()}: " . $response->body());
        }

        return $response->json();
    }

    private function fetchCompanyName(string $token, string $realmId): ?string
    {
        try {
            $url  = "{$this->apiBase()}/{$realmId}/companyinfo/{$realmId}";
            $resp = Http::withToken($token)->withHeaders(['Accept' => 'application/json'])->get($url);
            return $resp->json()['CompanyInfo']['CompanyName'] ?? null;
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function markSynced(string $schoolId, string $type, int $localId, string $qboId, string $qboType): void
    {
        DB::table('qbo_entity_map')->updateOrInsert(
            ['school_id' => $schoolId, 'entity_type' => $type, 'local_id' => $localId],
            ['qbo_entity_id' => $qboId, 'qbo_entity_type' => $qboType, 'synced_at' => now()]
        );
    }

    private function logSync(
        string  $schoolId,
        string  $entityType,
        ?int    $entityId,
        string  $status,
        string  $description,
        ?string $details    = null,
        ?int    $triggeredBy = null
    ): void {
        DB::table('qbo_sync_logs')->insert([
            'school_id'    => $schoolId,
            'entity_type'  => $entityType,
            'entity_id'    => $entityId,
            'status'       => $status,
            'description'  => $description,
            'details'      => $details,
            'triggered_by' => $triggeredBy,
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);
    }

    private function mapPaymentMethod(string $method): string
    {
        return match (strtolower($method)) {
            'cash'          => '1',
            'mpesa'         => '2',
            'bank_transfer' => '3',
            'cheque'        => '4',
            'card'          => '5',
            default         => '1',
        };
    }

    private function pascalCase(string $str): string
    {
        return implode('', array_map('ucfirst', explode('_', $str)));
    }
}
