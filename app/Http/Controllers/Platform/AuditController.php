<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AuditLog;

class AuditController extends Controller
{
    public function index(Request $request)
    {
        $logs = AuditLog::with(['school', 'user'])->latest()->limit(100)->get();
        return response()->json($logs);
    }
}
