<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Platform\DashboardController;
use App\Http\Controllers\Platform\SchoolController;
use App\Http\Controllers\Platform\SubscriptionController;
use App\Http\Controllers\Accountant\FeeStructureController;
use App\Http\Controllers\Accountant\InvoiceController;
use App\Http\Controllers\Accountant\PaymentController;
use App\Http\Controllers\Accountant\ReceiptController;
use App\Http\Controllers\Accountant\DefaulterController;
use App\Http\Controllers\Accountant\DiscountController;
use App\Http\Controllers\Accountant\SponsorshipController;
use App\Http\Controllers\Accountant\SurchargeController;
use App\Http\Controllers\Accountant\DailyCollectionController;
use App\Http\Controllers\Accountant\FinanceDashboardController;
use App\Http\Controllers\Accountant\ExpenseCategoryController;
use App\Http\Controllers\Accountant\ExpenseController;
use App\Http\Controllers\Accountant\PettyCashController;
use App\Http\Controllers\Accountant\FundTransferController;
use App\Http\Controllers\Accountant\BankAccountController;
use App\Http\Controllers\Accountant\BankReconciliationController;
use App\Http\Controllers\Accountant\MpesaController;
use App\Http\Controllers\Accountant\FinanceReportController;
use App\Http\Controllers\Accountant\ClearanceController;
use App\Http\Controllers\Accountant\QuickBooksController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ── School Branding (any authenticated user) ─────────────────────────────────
Route::middleware('auth:sanctum')->get('/school/branding', [\App\Http\Controllers\BrandingController::class, 'index']);

// ── Auth (public) ────────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    // Throttle login: max 5 attempts per minute per IP
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',      [AuthController::class, 'me']);
    });
});

// ── Platform Admin (requires valid token + platform_admin role) ───────────────
Route::group(['prefix' => 'platform', 'middleware' => ['auth:sanctum', 'role:platform_admin']], function () {
        Route::get('/stats',           [DashboardController::class, 'stats']);
        Route::get('/schools',         [SchoolController::class, 'index']);
        Route::post('/schools',        [SchoolController::class, 'store']);
        Route::put('/schools/{id}',    [SchoolController::class, 'update']);
        Route::delete('/schools/{id}', [SchoolController::class, 'destroy']);
        Route::get('/subscriptions',   [SubscriptionController::class, 'index']);
        
        // New Platform Endpoints
        Route::apiResource('invoices', \App\Http\Controllers\Platform\InvoiceController::class);
        Route::apiResource('tickets', \App\Http\Controllers\Platform\TicketController::class);
        Route::apiResource('audit-logs', \App\Http\Controllers\Platform\AuditController::class);
    });

// ── Admin (requires valid token + admin/super_admin/school_admin/hr_manager roles) ──────
Route::group(['prefix' => 'admin', 'middleware' => ['auth:sanctum', 'tenant.active', 'role:super_admin,admin,school_admin,hr_manager']], function () {
        Route::get('/stats', [\App\Http\Controllers\Admin\DashboardController::class, 'stats']);
        Route::apiResource('exams', \App\Http\Controllers\Admin\ExamController::class);
        Route::post('exams/{exam}/marks', [\App\Http\Controllers\Admin\ExamController::class, 'saveMarks']);

        Route::apiResource('budgets', \App\Http\Controllers\Admin\BudgetController::class);

        // SPC (Student Progress Card)
        Route::get('spc/students', [\App\Http\Controllers\Admin\SPCController::class, 'students']);
        Route::get('spc/{studentId}', [\App\Http\Controllers\Admin\SPCController::class, 'show']);

        // Term Reports
        Route::get('term-reports', [\App\Http\Controllers\Admin\TermReportController::class, 'index']);

        Route::apiResource('users', \App\Http\Controllers\Admin\UserController::class);
        Route::get('students', [\App\Http\Controllers\Admin\StudentController::class, 'index']);
        Route::get('students/{id}', [\App\Http\Controllers\Admin\StudentController::class, 'show']);
        Route::post('students/admit', [\App\Http\Controllers\Admin\StudentController::class, 'store']);
        Route::put('students/{id}', [\App\Http\Controllers\Admin\StudentController::class, 'update']);
        Route::delete('students', [\App\Http\Controllers\Admin\StudentController::class, 'destroy']);

        // Data Center Actions
        Route::post('datacenter/export', [\App\Http\Controllers\Admin\DataCenterController::class, 'export']);
        Route::post('datacenter/backup', [\App\Http\Controllers\Admin\DataCenterController::class, 'backup']);
        Route::post('datacenter/clear-cache', [\App\Http\Controllers\Admin\DataCenterController::class, 'clearCache']);

        // Classes
        Route::get('classes/available-teachers',    [\App\Http\Controllers\Admin\ClassController::class, 'availableTeachers']);
        Route::apiResource('classes', \App\Http\Controllers\Admin\ClassController::class);
        Route::get('classes/{id}/students',         [\App\Http\Controllers\Admin\ClassController::class, 'students']);
        Route::post('classes/{id}/assign-students', [\App\Http\Controllers\Admin\ClassController::class, 'assignStudents']);

        // Subjects
        Route::apiResource('subjects', \App\Http\Controllers\Admin\SubjectController::class);

        // Timetable
        Route::get('timetables', [\App\Http\Controllers\Admin\TimetableController::class, 'show']);
        Route::put('timetables/{class_id}', [\App\Http\Controllers\Admin\TimetableController::class, 'update']);

        // Transport Routes / Assigns
        Route::get('transport/stats', [\App\Http\Controllers\Admin\TransportController::class, 'stats']);
        Route::get('transport/routes', [\App\Http\Controllers\Admin\TransportController::class, 'routes']);
        Route::post('transport/routes', [\App\Http\Controllers\Admin\TransportController::class, 'store']);
        Route::put('transport/routes/{id}', [\App\Http\Controllers\Admin\TransportController::class, 'update']);
        Route::delete('transport/routes/{id}', [\App\Http\Controllers\Admin\TransportController::class, 'destroy']);
        Route::get('transport/routes/{id}/students', [\App\Http\Controllers\Admin\TransportController::class, 'routeStudents']);
        Route::post('transport/routes/{id}/students', [\App\Http\Controllers\Admin\TransportController::class, 'assignStudentsToRoute']);

        // Vehicles & Drivers
        Route::get('transport/vehicles', [\App\Http\Controllers\Admin\TransportController::class, 'vehicles']);
        Route::post('transport/vehicles', [\App\Http\Controllers\Admin\TransportController::class, 'storeVehicle']);
        Route::put('transport/vehicles/{id}', [\App\Http\Controllers\Admin\TransportController::class, 'updateVehicle']);
        Route::delete('transport/vehicles/{id}', [\App\Http\Controllers\Admin\TransportController::class, 'destroyVehicle']);
        Route::get('transport/drivers', [\App\Http\Controllers\Admin\TransportController::class, 'drivers']);

        // Transport Billing (Phase 5A) — admin manages fee_per_term on routes
        Route::get('transport/billing',          [\App\Http\Controllers\Admin\TransportController::class, 'billingOverview']);
        Route::post('transport/billing/generate',[\App\Http\Controllers\Accountant\InvoiceController::class, 'generateTransportInvoices']);
        Route::patch('transport/routes/{id}/fee', [\App\Http\Controllers\Admin\TransportController::class, 'updateRouteFee']);
        Route::patch('dorms/{id}/fee',            [\App\Http\Controllers\Admin\DormController::class, 'updateDormFee']);

        // Dormitories
        Route::get('dorms', [\App\Http\Controllers\Admin\DormController::class, 'index']);
        Route::post('dorms', [\App\Http\Controllers\Admin\DormController::class, 'store']);
        Route::post('dorms/{id}/allocate', [\App\Http\Controllers\Admin\DormController::class, 'allocate']);

        // Events (school calendar)
        Route::apiResource('events', \App\Http\Controllers\Admin\EventController::class);

        // Documents
        Route::get('documents/teachers', [\App\Http\Controllers\Admin\DocumentController::class, 'getTeachers']);
        Route::get('documents', [\App\Http\Controllers\Admin\DocumentController::class, 'index']);
        Route::post('documents', [\App\Http\Controllers\Admin\DocumentController::class, 'store']);
        Route::delete('documents/{id}', [\App\Http\Controllers\Admin\DocumentController::class, 'destroy']);

        // Roles
        Route::get('roles', [\App\Http\Controllers\Admin\RoleController::class, 'index']);
        Route::post('roles', [\App\Http\Controllers\Admin\RoleController::class, 'store']);
        Route::delete('roles/{role}', [\App\Http\Controllers\Admin\RoleController::class, 'destroy']);

        // Settings
        Route::get('settings', [\App\Http\Controllers\Admin\SettingsController::class, 'index']);
        Route::post('settings', [\App\Http\Controllers\Admin\SettingsController::class, 'update']);

        // Audit Logs (school-scoped)
        Route::get('audit-logs', [\App\Http\Controllers\Admin\AuditController::class, 'index']);

    });

// ── Teacher (any authenticated staff — teacher, admin, school_admin) ─────────
Route::group(['prefix' => 'teacher', 'middleware' => ['auth:sanctum', 'tenant.active', 'role:teacher,school_admin,admin,super_admin']], function () {
    // Dashboard
    Route::get('dashboard', [\App\Http\Controllers\Teacher\DashboardController::class, 'stats']);

    // My Classes & Students
    Route::get('classes',                  [\App\Http\Controllers\Teacher\ClassController::class, 'index']);
    Route::get('classes/{id}/students',    [\App\Http\Controllers\Teacher\ClassController::class, 'students']);

    // Timetable
    Route::get('timetable',               [\App\Http\Controllers\Teacher\TimetableController::class, 'index']);
    Route::get('school-classes',          [\App\Http\Controllers\Teacher\TimetableController::class, 'allSchoolClasses']);

    // Attendance
    Route::get('attendance/today',   [\App\Http\Controllers\Teacher\AttendanceController::class, 'today']);
    Route::post('attendance',        [\App\Http\Controllers\Teacher\AttendanceController::class, 'store']);
    Route::get('attendance/history', [\App\Http\Controllers\Teacher\AttendanceController::class, 'history']);

    // Grades / Marks entry
    Route::get('grades/exams',               [\App\Http\Controllers\Teacher\GradeController::class, 'exams']);
    Route::get('grades/{examId}/students',   [\App\Http\Controllers\Teacher\GradeController::class, 'students']);
    Route::post('grades',                    [\App\Http\Controllers\Teacher\GradeController::class, 'store']);

    // Homework / Assignments
    Route::get('homework',       [\App\Http\Controllers\Teacher\HomeworkController::class, 'index']);
    Route::post('homework',      [\App\Http\Controllers\Teacher\HomeworkController::class, 'store']);
    Route::delete('homework/{id}', [\App\Http\Controllers\Teacher\HomeworkController::class, 'destroy']);

    // Leave requests
    Route::get('leave',  [\App\Http\Controllers\Teacher\LeaveController::class, 'index']);
    Route::post('leave', [\App\Http\Controllers\Teacher\LeaveController::class, 'store']);

    // Timetable (teacher manages timetable for own classes)
    Route::get('subjects',                  [\App\Http\Controllers\Admin\SubjectController::class, 'index']);
    Route::get('timetables/{class_id}',     [\App\Http\Controllers\Teacher\TimetableController::class, 'getForClass']);
    Route::put('timetables/{class_id}',     [\App\Http\Controllers\Teacher\TimetableController::class, 'saveForClass']);

    // SPC & Term Reports (read-only for teacher's own school students)
    Route::get('spc/students',     [\App\Http\Controllers\Admin\SPCController::class, 'students']);
    Route::get('spc/{studentId}',  [\App\Http\Controllers\Admin\SPCController::class, 'show']);
    Route::get('term-reports',     [\App\Http\Controllers\Admin\TermReportController::class, 'index']);

    // Report Cards
    Route::get('report-card/students',        [\App\Http\Controllers\Teacher\ReportCardController::class, 'students']);
    Route::get('report-card/{studentId}/pdf', [\App\Http\Controllers\Teacher\ReportCardController::class, 'downloadPdf']);
    Route::get('report-card/{studentId}',     [\App\Http\Controllers\Teacher\ReportCardController::class, 'show']);
    Route::get('class-performance/pdf',       [\App\Http\Controllers\Teacher\ReportCardController::class, 'downloadClassPdf']);

    // Documents (shared logic)
    Route::get('documents/teachers', [\App\Http\Controllers\Admin\DocumentController::class, 'getTeachers']);
    Route::get('documents',          [\App\Http\Controllers\Admin\DocumentController::class, 'index']);
    Route::post('documents',         [\App\Http\Controllers\Admin\DocumentController::class, 'store']);
    Route::delete('documents/{id}',  [\App\Http\Controllers\Admin\DocumentController::class, 'destroy']);
});

// ── HR Manager ───────────────────────────────────────────────────────────────
Route::group(['prefix' => 'hr', 'middleware' => ['auth:sanctum', 'tenant.active', 'role:hr_manager,school_admin,admin,super_admin']], function () {
    Route::get('dashboard',              [\App\Http\Controllers\HR\DashboardController::class,       'stats']);
    Route::get('attendance/mark',        [\App\Http\Controllers\HR\StaffAttendanceController::class, 'forDate']);
    Route::post('attendance/mark',       [\App\Http\Controllers\HR\StaffAttendanceController::class, 'save']);
    Route::get('attendance/history',     [\App\Http\Controllers\HR\StaffAttendanceController::class, 'history']);
    // Leave management
    Route::get('leave',                  [\App\Http\Controllers\HR\LeaveController::class,           'index']);
    Route::post('leave',                 [\App\Http\Controllers\HR\LeaveController::class,           'store']);   // HR creates on behalf of staff
    Route::post('leave/{id}/approve',    [\App\Http\Controllers\HR\LeaveController::class,           'approve']);
    Route::post('leave/{id}/reject',     [\App\Http\Controllers\HR\LeaveController::class,           'reject']);

    // Payroll
    Route::get('payroll/dashboard',      [\App\Http\Controllers\HR\PayrollController::class,         'dashboard']);
    Route::get('payroll/staff',          [\App\Http\Controllers\HR\PayrollController::class,         'staffForMonth']);
    Route::post('payroll/generate',      [\App\Http\Controllers\HR\PayrollController::class,         'generate']);
    Route::put('salary/{userId}',        [\App\Http\Controllers\HR\PayrollController::class,         'upsertSalary']);

    // Staff records
    Route::get('staff-records',          [\App\Http\Controllers\HR\StaffRecordController::class,     'index']);
    Route::get('staff-records/{userId}', [\App\Http\Controllers\HR\StaffRecordController::class,     'show']);
    Route::post('staff-records/{userId}',[\App\Http\Controllers\HR\StaffRecordController::class,     'upsert']);
    Route::put('staff-records/{userId}', [\App\Http\Controllers\HR\StaffRecordController::class,     'upsert']);

    // Departments & Designations
    Route::apiResource('departments',    \App\Http\Controllers\HR\DepartmentController::class);

    // Leave types & balances
    Route::apiResource('leave-types',    \App\Http\Controllers\HR\LeaveTypeController::class);
    Route::get('leave-balances',                          [\App\Http\Controllers\HR\LeaveBalanceController::class, 'index']);
    Route::post('leave-balances/carry-forward',           [\App\Http\Controllers\HR\LeaveBalanceController::class, 'carryForward']);
    Route::post('leave-balances/initialize/{year}',       [\App\Http\Controllers\HR\LeaveBalanceController::class, 'initialize']);

    // Staff documents
    Route::get('staff-documents/{userId}',    [\App\Http\Controllers\HR\StaffDocumentController::class, 'index']);
    Route::post('staff-documents/{userId}',   [\App\Http\Controllers\HR\StaffDocumentController::class, 'store']);
    Route::delete('staff-documents/{id}',     [\App\Http\Controllers\HR\StaffDocumentController::class, 'destroy']);

    // Payslips — specific paths BEFORE parameterised {id} routes
    Route::get('payslips',                    [\App\Http\Controllers\HR\PayslipController::class, 'index']);
    Route::post('payslips/generate',          [\App\Http\Controllers\HR\PayslipController::class, 'generate']);
    Route::get('payslips/preview',            [\App\Http\Controllers\HR\PayslipController::class, 'preview']);
    Route::get('payslips/{id}',               [\App\Http\Controllers\HR\PayslipController::class, 'show']);
    Route::get('payslips/{id}/download',      [\App\Http\Controllers\HR\PayslipController::class, 'download']);
    Route::put('payslips/{id}/mark-paid',     [\App\Http\Controllers\HR\PayslipController::class, 'markPaid']);
    Route::delete('payslips/{id}',            [\App\Http\Controllers\HR\PayslipController::class, 'destroy']);

    // Reports
    Route::get('reports/payroll-summary',     [\App\Http\Controllers\HR\ReportController::class, 'payrollSummary']);
    Route::get('reports/leave-matrix',        [\App\Http\Controllers\HR\ReportController::class, 'leaveMatrix']);
    Route::get('reports/headcount',           [\App\Http\Controllers\HR\ReportController::class, 'headcount']);
    Route::get('reports/attendance',          [\App\Http\Controllers\HR\ReportController::class, 'attendance']);
});

// ── Parent ────────────────────────────────────────────────────────────────────
Route::group(['prefix' => 'parent', 'middleware' => ['auth:sanctum', 'tenant.active', 'role:parent']], function () {
    Route::get('dashboard',  [\App\Http\Controllers\ParentPortal\DashboardController::class,  'stats']);
    Route::get('children',   [\App\Http\Controllers\ParentPortal\ChildrenController::class,   'index']);
    Route::get('fees',       [\App\Http\Controllers\ParentPortal\FeeController::class,        'index']);
    Route::get('academic',   [\App\Http\Controllers\ParentPortal\AcademicController::class,   'index']);
    Route::get('attendance', [\App\Http\Controllers\ParentPortal\AttendanceController::class, 'index']);
    Route::get('transport',  [\App\Http\Controllers\ParentPortal\TransportController::class,  'index']);
    Route::get('engagement', [\App\Http\Controllers\ParentPortal\EngagementController::class, 'index']);
});

// ── Student ───────────────────────────────────────────────────────────────────
Route::group(['prefix' => 'student', 'middleware' => ['auth:sanctum', 'tenant.active', 'role:student']], function () {
    Route::get('dashboard',  [\App\Http\Controllers\Student\DashboardController::class, 'stats']);
    Route::get('timetable',  [\App\Http\Controllers\Student\TimetableController::class, 'index']);
    Route::get('homework',   [\App\Http\Controllers\Student\HomeworkController::class,  'index']);
    Route::get('grades',     [\App\Http\Controllers\Student\GradeController::class,     'index']);
    Route::get('subjects',   [\App\Http\Controllers\Student\SubjectController::class,   'index']);
    Route::get('pathway',    [\App\Http\Controllers\Student\PathwayController::class,   'show']);
    Route::post('pathway',   [\App\Http\Controllers\Student\PathwayController::class,   'store']);
});

// ── Driver ────────────────────────────────────────────────────────────────────
Route::group(['prefix' => 'driver', 'middleware' => ['auth:sanctum', 'tenant.active', 'role:driver']], function () {
    Route::get('dashboard',  [\App\Http\Controllers\Driver\DashboardController::class, 'index']);
    Route::put('route/status', [\App\Http\Controllers\Driver\DashboardController::class, 'updateStatus']);
});

// ── Common (any authenticated user) ──────────────────────────────────────────
Route::group(['middleware' => 'auth:sanctum'], function () {
    Route::get('notices',         [\App\Http\Controllers\Admin\NoticeController::class, 'index']);
    Route::post('notices',        [\App\Http\Controllers\Admin\NoticeController::class, 'store']);
    Route::delete('notices/{id}', [\App\Http\Controllers\Admin\NoticeController::class, 'destroy']);

    // School Calendar Events (Read-only for all staff/users)
    Route::get('events',          [\App\Http\Controllers\Admin\EventController::class, 'index']);
});

// ── Finance / Accountant ──────────────────────────────────────────────────────
Route::group([
    'prefix'     => 'finance',
    'middleware' => ['auth:sanctum', 'tenant.active'],
], function () {

    // Dashboard KPI
    Route::get('dashboard/summary', [FinanceDashboardController::class, 'summary']);

    // Fee Structures
    Route::get('fee-structures',            [FeeStructureController::class, 'index']);
    Route::post('fee-structures',           [FeeStructureController::class, 'store']);
    Route::get('fee-structures/{id}',       [FeeStructureController::class, 'show']);
    Route::put('fee-structures/{id}',       [FeeStructureController::class, 'update']);
    Route::delete('fee-structures/{id}',    [FeeStructureController::class, 'destroy']);

    // Invoices
    Route::get('invoices',                  [InvoiceController::class, 'index']);
    Route::post('invoices',                 [InvoiceController::class, 'store']);
    Route::post('invoices/bulk-issue',      [InvoiceController::class, 'bulkIssue']);
    Route::get('invoices/{id}',             [InvoiceController::class, 'show']);
    Route::patch('invoices/{id}/cancel',    [InvoiceController::class, 'cancel']);

    // Payments & Receipts
    Route::post('payments',                 [PaymentController::class, 'store']);
    Route::patch('payments/{id}/reverse',   [PaymentController::class, 'reverse']);
    Route::get('receipts',                  [ReceiptController::class, 'index']);
    Route::get('receipts/{id}',             [ReceiptController::class, 'show']);
    Route::post('receipts/{id}/email',      [ReceiptController::class, 'email']);
    Route::post('receipts/{id}/sms',        [ReceiptController::class, 'sms']);

    // Student ledger & statement
    Route::get('students/{id}/ledger',      [PaymentController::class, 'ledger']);
    Route::get('students/{id}/statement',   [PaymentController::class, 'statement']);

    // Defaulters
    Route::get('defaulters',                [DefaulterController::class, 'index']);

    // Discounts
    Route::get('discounts',                 [DiscountController::class, 'index']);
    Route::post('discounts',                [DiscountController::class, 'store']);
    Route::delete('discounts/{id}',         [DiscountController::class, 'destroy']);

    // Sponsorships
    Route::get('sponsorships',              [SponsorshipController::class, 'index']);
    Route::post('sponsorships',             [SponsorshipController::class, 'store']);
    Route::put('sponsorships/{id}',         [SponsorshipController::class, 'update']);
    Route::delete('sponsorships/{id}',      [SponsorshipController::class, 'destroy']);

    // Surcharges
    Route::get('surcharges',                [SurchargeController::class, 'index']);
    Route::post('surcharges',               [SurchargeController::class, 'store']);

    // Daily Collection report
    Route::get('daily-collection',          [DailyCollectionController::class, 'index']);

    // Expense Categories
    Route::get('expense-categories',             [ExpenseCategoryController::class, 'index']);
    Route::post('expense-categories',            [ExpenseCategoryController::class, 'store']);
    Route::put('expense-categories/{id}',        [ExpenseCategoryController::class, 'update']);
    Route::delete('expense-categories/{id}',     [ExpenseCategoryController::class, 'destroy']);

    // Expenses
    Route::get('expenses',                       [ExpenseController::class, 'index']);
    Route::post('expenses',                      [ExpenseController::class, 'store']);
    Route::get('expenses/budget-vs-actual',      [ExpenseController::class, 'budgetVsActual']);
    Route::get('expenses/{id}',                  [ExpenseController::class, 'show']);
    Route::patch('expenses/{id}/approve',        [ExpenseController::class, 'approve']);
    Route::patch('expenses/{id}/reject',         [ExpenseController::class, 'reject']);
    Route::patch('expenses/{id}/pay',            [ExpenseController::class, 'markPaid']);
    Route::delete('expenses/{id}',               [ExpenseController::class, 'destroy']);

    // Petty Cash
    Route::get('petty-cash',                                  [PettyCashController::class, 'index']);
    Route::post('petty-cash',                                  [PettyCashController::class, 'storeAccount']);
    Route::get('petty-cash/{accountId}/transactions',          [PettyCashController::class, 'transactions']);
    Route::post('petty-cash/{accountId}/top-up',               [PettyCashController::class, 'topUp']);
    Route::post('petty-cash/{accountId}/spend',                [PettyCashController::class, 'spend']);

    // Fund Transfers
    Route::get('fund-transfers',                 [FundTransferController::class, 'index']);
    Route::post('fund-transfers',                [FundTransferController::class, 'store']);
    Route::patch('fund-transfers/{id}/approve',  [FundTransferController::class, 'approve']);
    Route::patch('fund-transfers/{id}/execute',  [FundTransferController::class, 'execute']);
    Route::patch('fund-transfers/{id}/reject',   [FundTransferController::class, 'reject']);

    // Bank Accounts
    Route::get('bank-accounts',             [BankAccountController::class, 'index']);
    Route::post('bank-accounts',            [BankAccountController::class, 'store']);
    Route::put('bank-accounts/{id}',        [BankAccountController::class, 'update']);
    Route::delete('bank-accounts/{id}',     [BankAccountController::class, 'destroy']);

    // Bank Reconciliation & Statements
    Route::get('bank-statements',                         [BankReconciliationController::class, 'index']);
    Route::get('bank-statements/summary',                 [BankReconciliationController::class, 'summary']);
    Route::post('bank-statements/import',                 [BankReconciliationController::class, 'import']);
    Route::post('bank-statements/reconcile',              [BankReconciliationController::class, 'reconcile']);
    Route::patch('bank-statements/{id}/match',            [BankReconciliationController::class, 'manualMatch']);
    Route::patch('bank-statements/{id}/unmatch',          [BankReconciliationController::class, 'unmatch']);

    // M-Pesa transactions (authenticated management endpoints)
    Route::get('mpesa-c2b',                  [MpesaController::class, 'index']);
    Route::post('mpesa-c2b/sync',            [MpesaController::class, 'sync']);
    Route::post('mpesa-c2b/{id}/match',      [MpesaController::class, 'match']);
    Route::post('mpesa/stk-push',            [MpesaController::class, 'stkPush']);
    Route::get('mpesa/cheques',              [MpesaController::class, 'cheques']);
    Route::patch('mpesa/cheques/{id}/clear', [MpesaController::class, 'clearCheque']);
    Route::patch('mpesa/cheques/{id}/bounce',[MpesaController::class, 'bounceCheque']);

    // ── Phase 5C: End-of-Term Clearance ────────────────────────────────────────
    Route::get('clearance',                       [ClearanceController::class, 'index']);
    Route::post('clearance/initialize',           [ClearanceController::class, 'initialize']);
    Route::get('clearance/{id}',                  [ClearanceController::class, 'show']);
    Route::patch('clearance/{id}/fee',            [ClearanceController::class, 'signOffFee']);
    Route::patch('clearance/{id}/library',        [ClearanceController::class, 'signOffLibrary']);
    Route::patch('clearance/{id}/dorm',           [ClearanceController::class, 'signOffDorm']);
    Route::post('clearance/{id}/exam-card',       [ClearanceController::class, 'issueExamCard']);
    Route::patch('clearance/{id}/sign-off',       [ClearanceController::class, 'signOff']);

    // ── Phase 6: QuickBooks / CSV Integration ────────────────────────
    Route::get('quickbooks/status',     [QuickBooksController::class, 'status']);
    Route::get('quickbooks/auth-url',   [QuickBooksController::class, 'authUrl']);
    Route::delete('quickbooks/disconnect', [QuickBooksController::class, 'disconnect']);
    Route::post('quickbooks/sync',      [QuickBooksController::class, 'sync']);
    Route::get('quickbooks/sync-log',   [QuickBooksController::class, 'syncLog']);
    // CSV export (any financial type)
    Route::get('export/{type}',         [QuickBooksController::class, 'exportCsv']);
});

// ── Safaricom M-Pesa IPN Callbacks (no auth — public endpoints) ──────────────
Route::post('mpesa/c2b/validation',  [MpesaController::class, 'c2bValidate']);
Route::post('mpesa/c2b/confirmation',[MpesaController::class, 'c2bConfirm']);
Route::post('mpesa/stk/callback',    [MpesaController::class, 'stkCallback']);

// ── QuickBooks OAuth2 callback (no auth — QBO redirects here) ────────────────
Route::get('finance/quickbooks/callback', [QuickBooksController::class, 'callback']);


// ── Finance Reports (authenticated, finance prefix group) ─────────────────────
Route::group([
    'prefix'     => 'finance/reports',
    'middleware' => ['auth:sanctum', 'tenant.active'],
], function () {
    Route::get('daily-collection',        [FinanceReportController::class, 'dailyCollection']);
    Route::get('receipts-register',       [FinanceReportController::class, 'receiptsRegister']);
    Route::get('outstanding-balances',    [FinanceReportController::class, 'outstandingBalances']);
    Route::get('defaulters',              [FinanceReportController::class, 'defaulters']);
    Route::get('collection-summary',      [FinanceReportController::class, 'collectionSummary']);
    Route::get('income-statement',        [FinanceReportController::class, 'incomeStatement']);
    Route::get('budget-vs-actual',        [FinanceReportController::class, 'budgetVsActual']);
    Route::get('bank-reconciliation',     [FinanceReportController::class, 'bankReconciliation']);
    Route::get('petty-cash',              [FinanceReportController::class, 'pettyCash']);
    Route::get('mpesa-transactions',      [FinanceReportController::class, 'mpesaTransactions']);
    Route::get('expense-ledger',          [FinanceReportController::class, 'expenseLedger']);
    Route::get('student-statement/{id}',  [FinanceReportController::class, 'studentStatement']);
    Route::get('arrears-ageing',          [FinanceReportController::class, 'arrearsAgeing']);
    Route::get('annual-summary',          [FinanceReportController::class, 'annualSummary']);
    Route::get('{type}/export',           [FinanceReportController::class, 'export']);
    Route::get('{type}/pdf',              [FinanceReportController::class, 'pdf']);
});
