<?php
include 'vendor/autoload.php';
$app = include 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Exam;
use App\Http\Controllers\Teacher\GradeController;
use Illuminate\Http\Request;

$teacher = User::where('role', 'teacher')->first();
auth()->login($teacher);

$exam = Exam::first();
$class = SchoolClass::first();
$subject = Subject::first();

$request = Request::create("/api/teacher/grades/{$exam->id}/students", 'GET', [
    'class_id' => $class->id,
    'subject_id' => $subject->id,
]);

$controller = new GradeController();
try {
    $response = $controller->students($request, $exam->id);
    echo "SUCCESS Status: " . $response->getStatusCode() . "\n";
    echo "Data: " . json_encode($response->getData(), JSON_PRETTY_PRINT) . "\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
