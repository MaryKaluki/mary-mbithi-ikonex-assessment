<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    /**
     * GET /api/admin/audit-logs
     * Returns audit logs scoped to the authenticated user's school.
     * The BelongsToTenant global scope on AuditLog handles the filtering automatically.
     */
    public function index(Request $request)
    {
        $logs = AuditLog::with('user')
            ->latest()
            ->limit(100)
            ->get();

        return response()->json($logs);
    }
}
