<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DashboardController extends Controller
{
    public function stats()
    {
        // Safe count — returns 0 if the table doesn't exist yet
        $safeCount = fn(string $table, array $where = []) => Schema::hasTable($table)
            ? DB::table($table)->where($where)->count()
            : 0;

        $totalStudents = $safeCount('students');
        $totalUsers    = User::count();
        $totalRevenue  = Schema::hasTable('fee_structures') ? DB::table('fee_structures')->sum('total_amount') : 0;
        $busesActive   = $safeCount('vehicles', ['status' => 'Active']);

        // Latest notices from the notices table (used as dashboard feed)
        $notices = Schema::hasTable('notices')
            ? DB::table('notices')
                ->join('users', 'notices.created_by', '=', 'users.id')
                ->where('notices.school_id', auth()->user()->school_id)
                ->select('notices.title', 'notices.type', 'notices.published_at', 'notices.created_at', 'users.name as author')
                ->orderByDesc('notices.published_at')
                ->limit(5)
                ->get()
                ->map(fn($n) => [
                    'title' => $n->title,
                    'date'  => \Carbon\Carbon::parse($n->published_at)->diffForHumans(),
                    'tag'   => $n->type,
                    'color' => [
                        'Academic'  => 'bg-blue-100 text-blue-600',
                        'General'   => 'bg-gray-100 text-gray-600',
                        'Event'     => 'bg-green-100 text-green-600',
                        'Finance'   => 'bg-yellow-100 text-yellow-700',
                        'Health'    => 'bg-red-100 text-red-600',
                        'Transport' => 'bg-orange-100 text-orange-700',
                    ][$n->type] ?? 'bg-gray-100 text-gray-600',
                    'isNew' => \Carbon\Carbon::parse($n->created_at)->diffInDays(now()) <= 2,
                ])
            : collect();

        $monthlyFees = collect(range(5, 0))->map(function ($monthsAgo) {
            $date = now()->subMonths($monthsAgo);
            return ['label' => $date->format('M'), 'val' => 0];
        })->values();

        return response()->json([
            'stats' => [
                'total_students'  => $totalStudents,
                'total_users'     => $totalUsers,
                'total_revenue'   => $totalRevenue,
                'pending_tickets' => 0,
                'system_health'   => '99.9%',
                'buses_active'    => $busesActive,
            ],
            'notices'     => $notices,
            'fee_chart'   => $monthlyFees,
            'goal_status' => 0,
        ]);
    }
}
