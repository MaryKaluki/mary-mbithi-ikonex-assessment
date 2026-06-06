<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use App\Services\Finance\TransactionSyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Phase 6 — QuickBooks Online Integration + CSV Export Controller
 *
 * Routes (add to api.php under finance group):
 *   GET  /api/finance/quickbooks/status          → status (connected? last sync?)
 *   GET  /api/finance/quickbooks/auth-url        → generate OAuth2 URL
 *   GET  /api/finance/quickbooks/callback        → OAuth2 callback (QBO redirects here)
 *   DELETE /api/finance/quickbooks/disconnect    → revoke + delete credentials
 *   POST /api/finance/quickbooks/sync            → trigger manual sync
 *   GET  /api/finance/quickbooks/sync-log        → paginated sync log
 *
 *   GET  /api/finance/export/{type}              → CSV export endpoint
 */
class QuickBooksController extends Controller
{
    public function __construct(private TransactionSyncService $sync) {}

    // ─────────────────────────────────────────────────────────────────────────
    // CONNECTION STATUS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/finance/quickbooks/status
     */
    public function status(Request $request): \Illuminate\Http\JsonResponse
    {
        $schoolId = $request->user()->school_id;
        return response()->json($this->sync->getStatus($schoolId));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // OAUTH2 FLOW
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/finance/quickbooks/auth-url
     * Returns the QBO OAuth2 URL to open in a new tab.
     */
    public function authUrl(Request $request): \Illuminate\Http\JsonResponse
    {
        $schoolId = $request->user()->school_id;
        return response()->json(['url' => $this->sync->getAuthUrl($schoolId)]);
    }

    /**
     * GET /api/finance/quickbooks/callback
     *
     * Intuit redirects to this endpoint after the user authorises.
     * Exchanges the code for tokens, saves to DB, then redirects the user
     * back to the QBO integration page in the SPA.
     */
    public function callback(Request $request): \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
    {
        $code     = $request->query('code');
        $realmId  = $request->query('realmId');
        $state    = $request->query('state');
        $errorQBO = $request->query('error');

        if ($errorQBO) {
            return redirect('/#/finance/integration/quickbooks?qbo_error=' . urlencode($errorQBO));
        }

        if (!$code || !$realmId || !$state) {
            return response()->json(['message' => 'Invalid callback parameters.'], 400);
        }

        try {
            $stateData = json_decode(base64_decode($state), true);
            $schoolId  = $stateData['school_id'] ?? null;

            if (!$schoolId) {
                return response()->json(['message' => 'Invalid state parameter.'], 400);
            }

            $this->sync->handleCallback($code, $realmId, $schoolId);

            return redirect('/#/finance/integration/quickbooks?qbo_connected=1');
        } catch (\Throwable $e) {
            return redirect('/#/finance/integration/quickbooks?qbo_error=' . urlencode($e->getMessage()));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DISCONNECT
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * DELETE /api/finance/quickbooks/disconnect
     */
    public function disconnect(Request $request): \Illuminate\Http\JsonResponse
    {
        $schoolId = $request->user()->school_id;

        try {
            $this->sync->disconnect($schoolId);
            return response()->json(['message' => 'QuickBooks disconnected successfully.']);
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MANUAL SYNC
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/finance/quickbooks/sync
     * Body (optional): { from?: 'YYYY-MM-DD', to?: 'YYYY-MM-DD' }
     */
    public function sync(Request $request): \Illuminate\Http\JsonResponse
    {
        $schoolId = $request->user()->school_id;

        try {
            $result = $this->sync->syncToQuickBooks($schoolId, $request->user()->id);
            return response()->json([
                'message' => "Sync complete. {$result['synced']} records synced, {$result['errors']} errors.",
                ...$result,
            ]);
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SYNC LOG
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/finance/quickbooks/sync-log
     * Params: status, entity_type, per_page
     */
    public function syncLog(Request $request): \Illuminate\Http\JsonResponse
    {
        $schoolId = $request->user()->school_id;

        $query = DB::table('qbo_sync_logs')
            ->where('school_id', $schoolId)
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        if ($request->filled('entity_type')) {
            $query->where('entity_type', $request->input('entity_type'));
        }

        $perPage = min((int) $request->input('per_page', 50), 200);
        $logs    = $query->paginate($perPage);

        return response()->json($logs);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CSV EXPORT
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/finance/export/{type}
     *
     * Params: from, to, academic_year, term
     * Downloads a CSV file directly.
     */
    public function exportCsv(Request $request, string $type): \Symfony\Component\HttpFoundation\StreamedResponse|\Illuminate\Http\JsonResponse
    {
        $schoolId = $request->user()->school_id;

        $allowed = [
            'fee_payments', 'expenses', 'invoices', 'petty_cash',
            'fund_transfers', 'bank_statements', 'defaulters', 'annual_summary',
        ];

        if (!in_array($type, $allowed)) {
            return response()->json(['message' => "Unknown export type: {$type}"], 422);
        }

        $params = $request->only('from', 'to', 'academic_year', 'term');

        try {
            $result   = $this->sync->exportCsv($schoolId, $type, $params, $request->user()->id);
            $filename = $type . '_' . date('Y-m-d') . '.csv';

            return response()->streamDownload(
                fn () => print($result['csv']),
                $filename,
                ['Content-Type' => 'text/csv', 'Content-Disposition' => "attachment; filename=\"{$filename}\""]
            );
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
