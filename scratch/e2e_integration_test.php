<?php
include 'vendor/autoload.php';
$app = include 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Student;
use App\Models\Exam;
use App\Models\ExamMark;
use App\Models\User;
use Illuminate\Http\Request;

use App\Http\Controllers\Admin\ClassController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\SubjectController;
use App\Http\Controllers\Teacher\GradeController;
use App\Http\Controllers\Teacher\ReportCardController;

$schoolId = 'KAS-ACADEMY';

// Resolve Admin & Teacher Users
$adminUser = User::where('school_id', $schoolId)->where('role', 'school_admin')->first();
$teacherUser = User::where('school_id', $schoolId)->where('role', 'teacher')->first();

if (!$adminUser || !$teacherUser) {
    echo "ERROR: Missing seed users!\n";
    exit(1);
}

function verify($condition, $message) {
    if ($condition) {
        echo "✓ SUCCESS: {$message}\n";
    } else {
        echo "✗ FAILED: {$message}\n";
        exit(1);
    }
}

function createRequest($path, $method, $data = [], $user = null) {
    $req = Request::create($path, $method, $data);
    if ($user) {
        $req->setUserResolver(fn() => $user);
    }
    return $req;
}

echo "=== STARTING E2E INTEGRATION TEST ===\n\n";

// ==========================================
// 1. CLASS STREAMS
// ==========================================
echo "--- Testing Class Streams ---\n";
auth()->login($adminUser);
$classController = new ClassController();

// 1.1 List All Class Streams
$req = createRequest('/api/admin/classes', 'GET', [], $adminUser);
$res = $classController->index($req);
verify($res->getStatusCode() === 200, "Retrieve all class streams");
$classes = $res->getData();
$classNames = collect($classes)->pluck('name')->toArray();
verify(in_array('Form 1A', $classNames), "Found Form 1A stream");
verify(in_array('Form 1B', $classNames), "Found Form 1B stream");
verify(in_array('Form 1C', $classNames), "Found Form 1C stream");

// 1.2 Create Class Stream
$req = createRequest('/api/admin/classes', 'POST', [
    'name' => 'Form 1D',
    'level' => 'Form 1',
    'section' => 'D',
    'curriculum_type' => '844',
    'capacity' => 30
], $adminUser);
$res = $classController->store($req);
verify($res->getStatusCode() === 201, "Create class stream (Form 1D)");
$newClass = $res->getData();
$newClassId = $newClass->id;

// 1.3 Retrieve Single Class Stream details
$res = $classController->show($newClassId);
verify($res->getStatusCode() === 200, "Retrieve single class stream details");
$classDetails = $res->getData();
verify($classDetails->name === 'Form 1D', "Retrieved correct class stream name");

// 1.4 Update Class Stream details
$req = createRequest("/api/admin/classes/{$newClassId}", 'PUT', [
    'capacity' => 35
], $adminUser);
$res = $classController->update($req, $newClassId);
verify($res->getStatusCode() === 200, "Update class stream details");
$updatedClass = $res->getData();
verify($updatedClass->capacity == 35, "Updated capacity is 35");

// 1.5 Delete Class Stream
$res = $classController->destroy($newClassId);
verify($res->getStatusCode() === 200, "Delete class stream");


// ==========================================
// 2. STUDENTS
// ==========================================
echo "\n--- Testing Students ---\n";
$studentController = new StudentController();

// 2.1 Register Student
$req = createRequest('/api/admin/students/admit', 'POST', [
    'first_name' => 'Test',
    'last_name' => 'Student',
    'date_of_birth' => '2012-05-15',
    'gender' => 'Male',
    'grade_level' => 'Form 1A',
    'nationality' => 'Kenyan',
    'mode_of_transport' => 'Walking',
    'parent_name' => 'Test Parent',
    'parent_relationship' => 'Guardian',
    'parent_phone' => '0711223344',
], $adminUser);
$res = $studentController->store($req);
verify($res->getStatusCode() === 201, "Register new student");
$newStudent = $res->getData()->student;
$newStudentId = $newStudent->id;

// 2.2 Retrieve Single Student
$res = $studentController->show($newStudentId);
verify($res->getStatusCode() === 200, "Retrieve single student details");
$retrievedStudent = $res->getData()->student;
verify($retrievedStudent->first_name === 'Test', "Retrieved student matches registered first name");

// 2.3 Edit Student details
$req = createRequest("/api/admin/students/{$newStudentId}", 'PUT', [
    'middle_name' => 'MiddleName'
], $adminUser);
$res = $studentController->update($req, $newStudentId);
verify($res->getStatusCode() === 200, "Update student details");
$editedStudent = $res->getData()->student;
verify($editedStudent->middle_name === 'MiddleName', "Student middle name edited successfully");

// 2.4 Retrieve All Students
$req = createRequest('/api/admin/students', 'GET', [], $adminUser);
$res = $studentController->index($req);
verify($res->getStatusCode() === 200, "Retrieve all students");
$allStudents = $res->getData()->students;
verify(count($allStudents) > 0, "Retrieved non-empty student list");

// 2.5 Retrieve Students Filtered by Specific Class Stream
$req = createRequest('/api/admin/students', 'GET', ['grade_level' => 'Form 1B'], $adminUser);
$res = $studentController->index($req);
verify($res->getStatusCode() === 200, "Retrieve filtered students");
$filteredStudents = $res->getData()->students;
foreach ($filteredStudents as $s) {
    verify($s->grade_level === 'Form 1B', "Filtered student is in Form 1B");
}

// 2.6 Delete Student
$req = createRequest('/api/admin/students', 'DELETE', [
    'ids' => [$newStudentId]
], $adminUser);
$res = $studentController->destroy($req);
verify($res->getStatusCode() === 200, "Delete student");


// ==========================================
// 3. SUBJECTS
// ==========================================
echo "\n--- Testing Subjects ---\n";
$subjectController = new SubjectController();

// 3.1 Create Subject
$req = createRequest('/api/admin/subjects', 'POST', [
    'name' => 'Test Subject',
    'code' => 'TEST-101',
    'department' => 'Sciences',
    'curriculum_type' => '844',
    'grade_levels' => ['form_1'],
    'is_elective' => false,
], $adminUser);
$res = $subjectController->store($req);
verify($res->getStatusCode() === 201, "Create new subject");
$newSubject = $res->getData();
$newSubjectId = $newSubject->id;

// 3.2 Retrieve Single Subject
$res = $subjectController->show($newSubjectId);
verify($res->getStatusCode() === 200, "Retrieve single subject details");
$retrievedSubject = $res->getData();
verify($retrievedSubject->name === 'Test Subject', "Retrieved correct subject name");

// 3.3 Edit/Manage Subject
$req = createRequest("/api/admin/subjects/{$newSubjectId}", 'PUT', [
    'code' => 'TEST-102'
], $adminUser);
$res = $subjectController->update($req, $newSubjectId);
verify($res->getStatusCode() === 200, "Update subject details");
$editedSubject = $res->getData();
verify($editedSubject->code === 'TEST-102', "Subject code updated successfully");

// 3.4 Retrieve All Subjects
$req = createRequest('/api/admin/subjects', 'GET', [], $adminUser);
$res = $subjectController->index($req);
verify($res->getStatusCode() === 200, "Retrieve all subjects");

// 3.5 Delete Subject
$res = $subjectController->destroy($newSubjectId);
verify($res->getStatusCode() === 200, "Delete subject");


// ==========================================
// 4. ASSESSMENTS
// ==========================================
echo "\n--- Testing Assessments & Read Views ---\n";
auth()->login($teacherUser);
$gradeController = new GradeController();

$studentWycliffe = Student::where('school_id', $schoolId)->where('first_name', 'Wycliffe')->first();
$examCA = Exam::where('school_id', $schoolId)->where('name', 'Term 1 Continuous Assessment')->first();
$classForm1A = SchoolClass::where('school_id', $schoolId)->where('name', 'Form 1A')->first();
$subjectMath = Subject::where('school_id', $schoolId)->where('name', 'Mathematics')->first();

verify($studentWycliffe !== null, "Found student Wycliffe Omondi");
verify($examCA !== null, "Found Term 1 Continuous Assessment exam");
verify($classForm1A !== null, "Found Form 1A class");
verify($subjectMath !== null, "Found Mathematics subject");

// 4.1 Record / Update Marks
$req = createRequest('/api/teacher/grades', 'POST', [
    'exam_id' => $examCA->id,
    'class_id' => $classForm1A->id,
    'subject_id' => $subjectMath->id,
    'out_of' => 100,
    'term' => 1,
    'year' => 2026,
    'curriculum_type' => '844',
    'marks' => [
        ['student_id' => $studentWycliffe->id, 'marks' => 95, 'remarks' => 'Outstanding Performance'],
    ]
], $teacherUser);
$res = $gradeController->store($req);
verify($res->getStatusCode() === 200, "Record/update continuous assessment mark (set 95 for Wycliffe)");

// Verify changes in DB
$mark = ExamMark::where('school_id', $schoolId)
    ->where('student_id', $studentWycliffe->id)
    ->where('exam_id', $examCA->id)
    ->where('subject_name', 'Mathematics')
    ->first();
verify($mark->marks == 95, "Database successfully stores updated score (95)");
verify($mark->grade === 'A', "Grade calculated correctly as A");

// 4.2 Read View: Individual Student Performance by Subject
$reportController = new ReportCardController();
$req = createRequest("/api/teacher/report-card/{$studentWycliffe->id}", 'GET', [
    'exam_id' => $examCA->id
], $teacherUser);
$res = $reportController->show($req, $studentWycliffe->id);
verify($res->getStatusCode() === 200, "Retrieve individual report card preview data");
$reportCardData = $res->getData();
$mathPerf = collect($reportCardData->subjects)->where('subject', 'Mathematics')->first();
verify($mathPerf->marks == 95, "Report Card matches updated Math mark (95)");
verify($mathPerf->grade === 'A', "Report Card lists correct Grade (A)");
verify($mathPerf->rank !== '—', "Report Card calculates subject-specific position/rank");

// 4.3 Read View: Class Performance for Selected Subject
$req = createRequest("/api/teacher/grades/{$examCA->id}/students", 'GET', [
    'class_id' => $classForm1A->id,
    'subject_id' => $subjectMath->id,
], $teacherUser);
$res = $gradeController->students($req, $examCA->id);
verify($res->getStatusCode() === 200, "Retrieve class performance list for selected subject");
$classPerfData = $res->getData();
$wycliffeInClass = collect($classPerfData->students)->where('student_id', $studentWycliffe->id)->first();
verify($wycliffeInClass->marks == 95, "Class performance lists correct mark (95) for Wycliffe");


// ==========================================
// 5. DATA VALIDATION
// ==========================================
echo "\n--- Testing Data Validation ---\n";

// 5.1 Enforce strict validation to prevent duplicate student score submissions in the same request payload
$req = createRequest('/api/teacher/grades', 'POST', [
    'exam_id' => $examCA->id,
    'class_id' => $classForm1A->id,
    'subject_id' => $subjectMath->id,
    'out_of' => 100,
    'term' => 1,
    'year' => 2026,
    'curriculum_type' => '844',
    'marks' => [
        ['student_id' => $studentWycliffe->id, 'marks' => 90, 'remarks' => 'Score 1'],
        ['student_id' => $studentWycliffe->id, 'marks' => 92, 'remarks' => 'Duplicate Score'],
    ]
], $teacherUser);
$res = $gradeController->store($req);
verify($res->getStatusCode() === 422, "Validation block on duplicate student score submissions in same payload");
$errors = $res->getData()->errors;
verify(isset($errors->marks), "Returned validation error messages for 'marks'");

echo "\n======================================\n";
echo "E2E INTEGRATION TEST COMPLETED SUCCESSFULLY!\n";
echo "======================================\n";
