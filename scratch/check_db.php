<?php
include 'vendor/autoload.php';
$app = include 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Student;
use App\Models\ExamMark;
use App\Models\User;

$schoolId = 'KAS-ACADEMY';

echo "=== USERS ===\n";
foreach(User::where('school_id', $schoolId)->get() as $u) {
    echo "- Name: {$u->name}, Email: {$u->email}, Role: {$u->role}, ID: {$u->id}\n";
}

echo "=== CLASSES ===\n";
foreach(SchoolClass::where('school_id', $schoolId)->get() as $c) {
    echo "- Name: {$c->name}, Level: {$c->level}, Section: {$c->section}, Teacher ID: {$c->class_teacher_id}, ID: {$c->id}\n";
}

echo "=== SUBJECTS ===\n";
foreach(Subject::where('school_id', $schoolId)->get() as $s) {
    echo "- Name: {$s->name}, Code: {$s->code}, Curriculum: {$s->curriculum_type}, Grade Levels: " . json_encode($s->grade_levels) . ", ID: {$s->id}\n";
}

echo "=== STUDENTS ===\n";
foreach(Student::where('school_id', $schoolId)->get() as $st) {
    echo "- Name: {$st->first_name} {$st->last_name}, Adm: {$st->admission_number}, Stream/Grade: {$st->grade_level}, ID: {$st->id}\n";
}

echo "=== EXAM MARKS COUNT ===\n";
echo "Total Marks: " . ExamMark::where('school_id', $schoolId)->count() . "\n";
