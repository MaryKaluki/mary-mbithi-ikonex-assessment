<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\School;
use App\Models\Subscription;
use App\Models\User;

class DashboardController extends Controller
{
    public function stats()
    {
        $recentSchools = School::latest()->take(5)->get();
        // Since students model is available now, let's use it for the count instead of users if preferred. 
        // We'll use student model.
        $totalStudents = \App\Models\Student::count();
        $mrr = \App\Models\Invoice::where('status', 'Paid')->sum('amount');
        $recentLogs = \App\Models\AuditLog::with(['school', 'user'])->latest()->take(3)->get();

        return response()->json([
            'schools_count' => School::count(),
            'total_students' => $totalStudents,
            'mrr' => $mrr,
            'recent_schools' => $recentSchools,
            'recent_logs' => $recentLogs
        ]);
    }
}
