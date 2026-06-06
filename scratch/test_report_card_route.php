<?php
include 'vendor/autoload.php';
$app = include 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Http\Controllers\Teacher\ReportCardController;
use Illuminate\Http\Request;

$teacher = User::where('role', 'teacher')->first();
auth()->login($teacher);

$request = Request::create('/api/teacher/report-card/students', 'GET');
$controller = new ReportCardController();
try {
    $response = $controller->students($request);
    echo "SUCCESS: " . $response->getStatusCode() . "\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
