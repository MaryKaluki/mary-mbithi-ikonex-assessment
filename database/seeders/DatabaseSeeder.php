<?php

namespace Database\Seeders;

use App\Models\BudgetCategory;
use App\Models\Exam;
use App\Models\ExamMark;
use App\Models\Notice;
use App\Models\School;
use App\Models\Student;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // ── 1. Platform Admin ─────────────────────────────────────────────────
        User::firstOrCreate(
            ['email' => 'admin@ikonex.com'],
            [
                'name'      => 'Platform Admin',
                'password'  => Hash::make('Ikonex@2026'),
                'school_id' => null,
                'role'      => 'platform_admin',
            ]
        );

        // ── 2. Use existing school or create demo ─────────────────────────────
        $school = School::first();

        if (! $school) {
            $school = School::create([
                'id'          => 'DEMO-SCHOOL',
                'name'        => 'Msingi Thabiti Academy',
                'domain'      => 'demo',
                'admin_email' => 'principal@msingi.ac.ke',
                'plan'        => 'Standard',
                'status'      => 'Active',
            ]);
            Subscription::firstOrCreate(['school_id' => $school->id], [
                'plan_name' => 'Standard', 'amount' => 249.00,
                'period' => 'monthly', 'next_billing_date' => now()->addMonth(), 'status' => 'Active',
            ]);
        }

        $schoolAdmin = User::firstOrCreate(
            ['email' => $school->admin_email],
            [
                'name'      => 'School Admin',
                'password'  => Hash::make('School@2026'),
                'school_id' => $school->id,
                'role'      => 'school_admin',
            ]
        );

        // ── 3. Demo Staff Accounts ───────────────────────────────────────────────
        $demoStaff = [
            ['email' => 'hr@msingi.ac.ke',      'name' => 'HR Manager',     'role' => 'hr_manager',   'password' => 'Hr@2026'],
            ['email' => 'teacher@msingi.ac.ke',  'name' => 'Demo Teacher',   'role' => 'teacher',      'password' => 'Teacher@2026'],
            ['email' => 'parent@msingi.ac.ke',   'name' => 'Demo Parent',    'role' => 'parent',       'password' => 'Parent@2026'],
            ['email' => 'student@msingi.ac.ke',  'name' => 'Demo Student',   'role' => 'student',      'password' => 'Student@2026'],
        ];

        foreach ($demoStaff as $s) {
            User::firstOrCreate(
                ['email' => $s['email']],
                [
                    'name'      => $s['name'],
                    'password'  => Hash::make($s['password']),
                    'school_id' => $school->id,
                    'role'      => $s['role'],
                ]
            );
        }

        // ── 4. Budget Categories (Kenya school typical budgets) ───────────────
        $budgets = [
            ['name' => 'Teaching & Learning Materials',  'allocated' => 450000, 'actual' => 312000, 'color' => 'bg-blue-500'],
            ['name' => 'Infrastructure & Maintenance',   'allocated' => 300000, 'actual' => 287500, 'color' => 'bg-green-500'],
            ['name' => 'Staff Salaries & Allowances',    'allocated' => 1200000,'actual' => 1198000,'color' => 'bg-purple-500'],
            ['name' => 'Utilities (Water, Electricity)', 'allocated' => 120000, 'actual' => 143000, 'color' => 'bg-red-500'],
            ['name' => 'Sports & Co-curricular',         'allocated' => 80000,  'actual' => 45000,  'color' => 'bg-yellow-500'],
            ['name' => 'Library & ICT Resources',        'allocated' => 150000, 'actual' => 98000,  'color' => 'bg-indigo-500'],
            ['name' => 'Special Needs Support',          'allocated' => 60000,  'actual' => 32000,  'color' => 'bg-pink-500'],
            ['name' => 'Transport & Logistics',          'allocated' => 200000, 'actual' => 185000, 'color' => 'bg-orange-500'],
        ];

        foreach ($budgets as $b) {
            BudgetCategory::firstOrCreate(
                ['school_id' => $school->id, 'name' => $b['name']],
                ['allocated' => $b['allocated'], 'actual' => $b['actual'], 'color' => $b['color']]
            );
        }

        // ── 5. Demo Students ──────────────────────────────────────────────────
        $studentData = [
            ['admission_number' => 'KAS-2024-001', 'first_name' => 'Amina',   'last_name' => 'Wanjiku',  'gender' => 'Female', 'grade_level' => 'Grade 8', 'house_group' => 'Kilimanjaro'],
            ['admission_number' => 'KAS-2024-002', 'first_name' => 'Brian',   'last_name' => 'Otieno',   'gender' => 'Male',   'grade_level' => 'Grade 8', 'house_group' => 'Rift Valley'],
            ['admission_number' => 'KAS-2024-003', 'first_name' => 'Cynthia', 'last_name' => 'Kamau',    'gender' => 'Female', 'grade_level' => 'Grade 8', 'house_group' => 'Kilimanjaro'],
            ['admission_number' => 'KAS-2024-004', 'first_name' => 'David',   'last_name' => 'Mwangi',   'gender' => 'Male',   'grade_level' => 'Grade 8', 'house_group' => 'Rift Valley'],
            ['admission_number' => 'KAS-2024-005', 'first_name' => 'Esther',  'last_name' => 'Njoroge',  'gender' => 'Female', 'grade_level' => 'Grade 7', 'house_group' => 'Nairobi'],
            ['admission_number' => 'KAS-2024-006', 'first_name' => 'Felix',   'last_name' => 'Odhiambo', 'gender' => 'Male',   'grade_level' => 'Grade 7', 'house_group' => 'Nairobi'],
            ['admission_number' => 'KAS-2024-007', 'first_name' => 'Grace',   'last_name' => 'Ndung\'u', 'gender' => 'Female', 'grade_level' => 'Grade 7', 'house_group' => 'Kilimanjaro'],
            ['admission_number' => 'KAS-2024-008', 'first_name' => 'Hassan',  'last_name' => 'Omar',     'gender' => 'Male',   'grade_level' => 'Grade 9', 'house_group' => 'Rift Valley'],
            ['admission_number' => 'KAS-2024-009', 'first_name' => 'Irene',   'last_name' => 'Chebet',   'gender' => 'Female', 'grade_level' => 'Grade 9', 'house_group' => 'Nairobi'],
            ['admission_number' => 'KAS-2024-010', 'first_name' => 'James',   'last_name' => 'Kariuki',  'gender' => 'Male',   'grade_level' => 'Grade 9', 'house_group' => 'Kilimanjaro'],
        ];

        $students = [];
        foreach ($studentData as $s) {
            $student = Student::firstOrCreate(
                ['admission_number' => $s['admission_number']],
                array_merge($s, [
                    'school_id'           => $school->id,
                    'nationality'         => 'Kenyan',
                    'status'              => 'Active',
                    'admission_date'      => now()->subYear()->format('Y-m-d'),
                    'date_of_birth'       => now()->subYears(rand(12, 16))->format('Y-m-d'),
                    'parent_name'         => 'Parent of ' . $s['first_name'],
                    'parent_relationship' => 'Guardian',
                    'parent_phone'        => '07' . rand(10000000, 99999999),
                ])
            );
            $students[] = $student;
        }

        // ── 6. Demo Exams ─────────────────────────────────────────────────────
        $exam1 = Exam::firstOrCreate(
            ['school_id' => $school->id, 'name' => 'Term 1 Mid-Term 2026'],
            [
                'start_date'         => '2026-02-17',
                'end_date'           => '2026-02-21',
                'target_curriculum'  => 'CBC',
                'status'             => 'Completed',
            ]
        );

        $exam2 = Exam::firstOrCreate(
            ['school_id' => $school->id, 'name' => 'Term 1 End-Term 2026'],
            [
                'start_date'         => '2026-03-24',
                'end_date'           => '2026-03-28',
                'target_curriculum'  => 'CBC',
                'status'             => 'Completed',
            ]
        );

        // ── 7. Exam Marks ─────────────────────────────────────────────────────
        $subjects = ['Mathematics', 'English', 'Kiswahili', 'Science & Technology', 'Social Studies', 'CRE', 'Creative Arts'];

        foreach ($students as $student) {
            foreach ([$exam1, $exam2] as $exam) {
                foreach ($subjects as $subject) {
                    $marks = rand(35, 96);
                    ExamMark::firstOrCreate(
                        ['student_id' => $student->id, 'exam_id' => $exam->id, 'subject_name' => $subject],
                        [
                            'school_id' => $school->id,
                            'marks'     => $marks,
                            'out_of'    => 100,
                            'grade'     => ExamMark::toGrade($marks),
                            'remarks'   => $marks >= 70 ? 'Good' : ($marks >= 50 ? 'Average' : 'Needs Improvement'),
                            'term'      => 1,
                            'year'      => 2026,
                        ]
                    );
                }
            }
        }

        // ── 8. Notices ────────────────────────────────────────────────────────
        $noticeData = [
            ['title' => 'Term 2 Examination Schedule Released',  'type' => 'Academic', 'days' => 2],
            ['title' => 'School Closed — Madaraka Day Holiday',  'type' => 'General',  'days' => 5],
            ['title' => 'Annual Sports Day & Inter-House Competition', 'type' => 'Event', 'days' => 7],
            ['title' => 'Term 2 Fee Payment Deadline Reminder',  'type' => 'Finance',  'days' => 1],
            ['title' => 'CBC Portfolio Submission Guidelines',   'type' => 'Academic', 'days' => 0],
        ];

        $content = [
            'The final examinations for Term 2 will commence on May 5th. All students must be adequately prepared.',
            'The school will be closed on June 1st for Madaraka Day. Classes resume on June 3rd.',
            'Registration for the Annual Sports Day is now open. Sign up with your class teacher by April 10th.',
            'Term 2 fee payment deadline is April 15th. Visit the accounts office for installment plans.',
            'All Junior Secondary students must submit their CBC portfolios by April 20th.',
        ];

        foreach ($noticeData as $i => $n) {
            Notice::firstOrCreate(
                ['title' => $n['title'], 'school_id' => $school->id],
                [
                    'school_id'    => $school->id,
                    'created_by'   => $schoolAdmin->id,
                    'content'      => $content[$i],
                    'type'         => $n['type'],
                    'published_at' => now()->subDays($n['days']),
                ]
            );
        }
    }
}
