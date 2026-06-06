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

// Request payload with duplicate student_id
$payload = [
    'exam_id' => $exam->id,
    'class_id' => $class->id,
    'subject_id' => $subject->id,
    'out_of' => 100,
    'term' => 1,
    'year' => 2026,
    'curriculum_type' => '844',
    'marks' => [
        ['student_id' => 12, 'marks' => 85, 'remarks' => 'Good'],
        ['student_id' => 12, 'marks' => 90, 'remarks' => 'Better'], // duplicate student_id
    ]
];

$request = Request::create("/api/teacher/grades", 'POST', $payload);

$controller = new GradeController();
try {
    $response = $controller->store($request);
    echo "Status Code: " . $response->getStatusCode() . "\n";
    echo "Response Body: " . json_encode($response->getData(), JSON_PRETTY_PRINT) . "\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
