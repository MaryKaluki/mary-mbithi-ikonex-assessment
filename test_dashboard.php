<?php
// Quick smoke test - delete after use
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Set a fake school_id on the global scope like the middleware would
app()->bind('school_id', fn() => null); // no scope - just test query resolution

try {
    // Test each query in isolation
    $students = App\Models\Student::count();
    echo "Students OK: $students\n";

    $users = App\Models\User::count();
    echo "Users OK: $users\n";

    $fees = App\Models\FeeStructure::sum('amount');
    echo "FeeStructure sum OK: $fees\n";

    $tickets = App\Models\SupportTicket::where('status', '!=', 'Resolved')->count();
    echo "Tickets OK: $tickets\n";

    $vehicles = App\Models\Vehicle::count();
    echo "Vehicles OK: $vehicles\n";

    $events = App\Models\SchoolEvent::limit(5)->get();
    echo "Events OK: " . $events->count() . " records\n";

    $chart = collect(range(5, 0))->map(function($m) {
        return ['label' => now()->subMonths($m)->format('M'), 'val' => 0];
    });
    echo "Chart OK: " . $chart->count() . " months\n";

    echo "\nALL QUERIES PASSED\n";
} catch (\Exception $e) {
    echo "FAILED: " . $e->getMessage() . "\n";
}
