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
use App\Models\School;
use Illuminate\Support\Facades\DB;

$schoolId = 'KAS-ACADEMY';

try {
    DB::beginTransaction();

    // Ensure School exists with correct name 'Ikonex Academy'
    $school = School::find($schoolId);
    if ($school) {
        $school->update(['name' => 'Ikonex Academy']);
    } else {
        School::create([
            'id' => $schoolId,
            'name' => 'Ikonex Academy',
            'admin_email' => 'admin@kasee.sc.ke',
            'phone' => '+254700000000',
            'domain' => 'kasee',
            'status' => 'Active',
            'school_type' => 'Hybrid'
        ]);
    }

    echo "Cleaning up existing academic data for school {$schoolId}...\n";

    // Delete ExamMarks
    ExamMark::where('school_id', $schoolId)->delete();
    // Delete Exams
    Exam::where('school_id', $schoolId)->delete();
    // Delete Students
    Student::where('school_id', $schoolId)->delete();
    // Delete Subjects
    Subject::where('school_id', $schoolId)->delete();
    // Delete Classes
    SchoolClass::where('school_id', $schoolId)->delete();
    // Delete Timetable Slots
    DB::table('timetable_slots')->where('school_id', $schoolId)->delete();
    // Delete Teacher Comments
    DB::table('teacher_comments')->where('school_id', $schoolId)->delete();
    // Delete Attendances
    DB::table('attendances')->where('school_id', $schoolId)->delete();

    // Get a teacher for the school_id
    $teacher = User::where('school_id', $schoolId)->where('role', 'teacher')->first();
    $teacherId = $teacher ? $teacher->id : null;

    echo "Seeding Class Streams (Form 1A, Form 1B, Form 1C)...\n";
    $classesData = [
        ['name' => 'Form 1A', 'level' => 'Form 1', 'section' => 'A', 'curriculum_type' => '844', 'class_teacher_id' => $teacherId, 'capacity' => 40],
        ['name' => 'Form 1B', 'level' => 'Form 1', 'section' => 'B', 'curriculum_type' => '844', 'class_teacher_id' => $teacherId, 'capacity' => 40],
        ['name' => 'Form 1C', 'level' => 'Form 1', 'section' => 'C', 'curriculum_type' => '844', 'class_teacher_id' => $teacherId, 'capacity' => 40],
    ];

    $classes = [];
    foreach ($classesData as $c) {
        $classes[$c['name']] = SchoolClass::create(array_merge($c, ['school_id' => $schoolId]));
    }

    echo "Seeding Subjects (assigned to Form 1)...\n";
    $subjectsData = [
        ['name' => 'Mathematics', 'code' => 'MAT-101', 'department' => 'Mathematics', 'curriculum_type' => '844', 'grade_levels' => ['form_1'], 'is_elective' => false],
        ['name' => 'English', 'code' => 'ENG-101', 'department' => 'Languages', 'curriculum_type' => '844', 'grade_levels' => ['form_1'], 'is_elective' => false],
        ['name' => 'Kiswahili', 'code' => 'KIS-101', 'department' => 'Languages', 'curriculum_type' => '844', 'grade_levels' => ['form_1'], 'is_elective' => false],
        ['name' => 'Chemistry', 'code' => 'CHE-101', 'department' => 'Sciences', 'curriculum_type' => '844', 'grade_levels' => ['form_1'], 'is_elective' => false],
        ['name' => 'Biology', 'code' => 'BIO-101', 'department' => 'Sciences', 'curriculum_type' => '844', 'grade_levels' => ['form_1'], 'is_elective' => false],
        ['name' => 'Physics', 'code' => 'PHY-101', 'department' => 'Sciences', 'curriculum_type' => '844', 'grade_levels' => ['form_1'], 'is_elective' => false],
        ['name' => 'History', 'code' => 'HIS-101', 'department' => 'Humanities', 'curriculum_type' => '844', 'grade_levels' => ['form_1'], 'is_elective' => false],
        ['name' => 'Geography', 'code' => 'GEO-101', 'department' => 'Humanities', 'curriculum_type' => '844', 'grade_levels' => ['form_1'], 'is_elective' => false],
        ['name' => 'CRE', 'code' => 'CRE-101', 'department' => 'Religious Education', 'curriculum_type' => '844', 'grade_levels' => ['form_1'], 'is_elective' => false],
    ];

    foreach ($subjectsData as $s) {
        Subject::create(array_merge($s, ['school_id' => $schoolId]));
    }

    echo "Seeding Students...\n";
    $studentsData = [
        // Form 1A
        ['first_name' => 'Wycliffe', 'last_name' => 'Omondi', 'gender' => 'Male', 'grade_level' => 'Form 1A'],
        ['first_name' => 'Mercy', 'last_name' => 'Chepngetich', 'gender' => 'Female', 'grade_level' => 'Form 1A'],
        ['first_name' => 'John', 'last_name' => 'Njoroge', 'gender' => 'Male', 'grade_level' => 'Form 1A'],
        ['first_name' => 'Fatuma', 'last_name' => 'Ali', 'gender' => 'Female', 'grade_level' => 'Form 1A'],
        ['first_name' => 'David', 'last_name' => 'Kiprop', 'gender' => 'Male', 'grade_level' => 'Form 1A'],

        // Form 1B
        ['first_name' => 'Emmanuel', 'last_name' => 'Juma', 'gender' => 'Male', 'grade_level' => 'Form 1B'],
        ['first_name' => 'Stacy', 'last_name' => 'Moraa', 'gender' => 'Female', 'grade_level' => 'Form 1B'],
        ['first_name' => 'Kelvin', 'last_name' => 'Kamau', 'gender' => 'Male', 'grade_level' => 'Form 1B'],
        ['first_name' => 'Asha', 'last_name' => 'Mohammed', 'gender' => 'Female', 'grade_level' => 'Form 1B'],
        ['first_name' => 'Brian', 'last_name' => 'Wambua', 'gender' => 'Male', 'grade_level' => 'Form 1B'],

        // Form 1C
        ['first_name' => 'Cynthia', 'last_name' => 'Nekesa', 'gender' => 'Female', 'grade_level' => 'Form 1C'],
        ['first_name' => 'Dennis', 'last_name' => 'Mutua', 'gender' => 'Male', 'grade_level' => 'Form 1C'],
        ['first_name' => 'Grace', 'last_name' => 'Nyambura', 'gender' => 'Female', 'grade_level' => 'Form 1C'],
        ['first_name' => 'Ian', 'last_name' => 'Simiyu', 'gender' => 'Male', 'grade_level' => 'Form 1C'],
        ['first_name' => 'Joyce', 'last_name' => 'Mwende', 'gender' => 'Female', 'grade_level' => 'Form 1C'],
    ];

    $students = [];
    foreach ($studentsData as $index => $st) {
        $adm = 'ADM-KAS-2026-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT);
        $students[] = Student::create(array_merge($st, [
            'school_id' => $schoolId,
            'admission_number' => $adm,
            'admission_date' => '2026-01-05',
            'date_of_birth' => '2012-05-15',
            'nationality' => 'Kenyan',
            'status' => 'Active',
            'parent_name' => 'Parent of ' . $st['first_name'],
            'parent_relationship' => 'Guardian',
            'parent_phone' => '0712345678',
            'mode_of_transport' => 'Walking',
        ]));
    }

    echo "Seeding Exams (Term 1 Continuous Assessment, Term 1 Examination)...\n";
    $examCA = Exam::create([
        'school_id' => $schoolId,
        'name' => 'Term 1 Continuous Assessment',
        'start_date' => '2026-02-10',
        'end_date' => '2026-02-12',
        'target_curriculum' => '8-4-4',
        'status' => 'Completed',
    ]);

    $examEnd = Exam::create([
        'school_id' => $schoolId,
        'name' => 'Term 1 Examination',
        'start_date' => '2026-03-20',
        'end_date' => '2026-03-25',
        'target_curriculum' => '8-4-4',
        'status' => 'Completed',
    ]);

    echo "Seeding Exam Marks...\n";
    $subjectNames = ['Mathematics', 'English', 'Kiswahili', 'Chemistry', 'Biology', 'Physics', 'History', 'Geography', 'CRE'];

    // Define some distinct grade ranges for students to have distinct ranks
    // Wycliffe: high, Mercy: medium-high, John: medium, Fatuma: medium-low, David: low
    // Emmanuel: high, Stacy: medium-high, Kelvin: medium, Asha: medium-low, Brian: low
    // Cynthia: high, Dennis: medium-high, Grace: medium, Ian: medium-low, Joyce: low
    $studentBaseMarks = [
        'Wycliffe' => 85, 'Mercy' => 74, 'John' => 62, 'Fatuma' => 50, 'David' => 41,
        'Emmanuel' => 88, 'Stacy' => 76, 'Kelvin' => 64, 'Asha' => 52, 'Brian' => 43,
        'Cynthia' => 91, 'Dennis' => 78, 'Grace' => 66, 'Ian' => 54, 'Joyce' => 45,
    ];

    foreach ($students as $student) {
        $base = $studentBaseMarks[$student->first_name] ?? 60;
        
        foreach ([$examCA, $examEnd] as $exam) {
            foreach ($subjectNames as $subj) {
                // Add some slight random variance to marks
                $variance = rand(-5, 5);
                $marks = max(0, min(100, $base + $variance));

                ExamMark::create([
                    'school_id' => $schoolId,
                    'student_id' => $student->id,
                    'exam_id' => $exam->id,
                    'subject_name' => $subj,
                    'marks' => $marks,
                    'out_of' => 100,
                    'grade' => ExamMark::toGrade($marks, 100, $schoolId),
                    'remarks' => $marks >= 80 ? 'Excellent' : ($marks >= 60 ? 'Good' : ($marks >= 40 ? 'Satisfactory' : 'Needs Improvement')),
                    'term' => 1,
                    'year' => 2026,
                ]);
            }
        }
    }

    DB::commit();
    echo "Reseeding completed successfully!\n";
} catch (\Exception $e) {
    DB::rollBack();
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
