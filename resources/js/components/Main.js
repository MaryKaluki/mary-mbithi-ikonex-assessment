import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Layout & Common
import Sidebar from './Sidebar';
import Header from './Header';
import PlaceholderView from './PlaceholderView';
import NoticeBoard from './common/NoticeBoard';
import SchoolEvents from './common/SchoolEvents';
import LoginForm from './auth/LoginForm';
import { SplashLoader, NotificationToast } from './common/Loader';

// HR Modules
import StaffList from './hr/StaffList';
import StaffCreate from './hr/StaffCreate';
import AttendanceMark from './hr/AttendanceMark';
import AttendanceHistory from './hr/AttendanceHistory';
import LeaveRequests from './hr/LeaveRequests';
import PayrollDashboard from './hr/PayrollDashboard';
import PayrollGenerate from './hr/PayrollGenerate';
import PayslipHistory from './hr/PayslipHistory';
import StaffDocuments from './hr/StaffDocuments';

// Accountant Modules (Finance)
import FeeList from './accountant/FeeList';
import ExpenseManager from './accountant/ExpenseManager';
import FinancialReports from './accountant/FinancialReports';
import Expenditure from './accountant/Expenditure';
import FeeStructures from './accountant/FeeStructures';
import FeeSchedule from './accountant/FeeSchedule';
import FeeAmounts from './accountant/FeeAmounts';
import RecordPayment from './accountant/RecordPayment';
import OutstandingBalances from './accountant/OutstandingBalances';
import ReceiptsRegister from './accountant/ReceiptsRegister';
import DailyCollection from './accountant/DailyCollection';
import DefaultersList from './accountant/DefaultersList';
import BankReconciliation from './accountant/BankReconciliation';
// Accountant Enhancements
import FeeInvoices from './accountant/FeeInvoices';
import Refunds from './accountant/Refunds';
import FeeInstallments from './accountant/FeeInstallments';
import TransportBilling from './accountant/TransportBilling';
import TransactionSync from './accountant/TransactionSync';
import TransactionAuth from './accountant/TransactionAuth';
import ChequeClearance from './accountant/ChequeClearance';
import FundTransfers from './accountant/FundTransfers';
import StudentGroups from './accountant/StudentGroups';
import Discounts from './accountant/Discounts';
import Surcharges from './accountant/Surcharges';
import Sponsorships from './accountant/Sponsorships';
import FinanceTemplates from './accountant/FinanceTemplates';
import QuickBooks from './accountant/QuickBooks';
import Clearance from './accountant/Clearance';

// Teacher Modules
import TeacherStudents from './teacher/TeacherStudents';
import ClassRegister from './teacher/ClassRegister';
import TeacherTimetable from './teacher/TeacherTimetable';
import AttendanceHistoryTeacher from './teacher/AttendanceHistory';
import TeacherGrades from './teacher/TeacherGrades';
import TeacherSPC from './teacher/TeacherSPC';
import TeacherReports from './teacher/TeacherReports';
import TeacherHomework from './teacher/TeacherHomework';
import TeacherLeave from './teacher/TeacherLeave';
import TeacherDocuments from './teacher/TeacherDocuments';

// Student Modules
import StudentTimetable from './student/StudentTimetable';
import StudentSubjects from './student/StudentSubjects';
import StudentHomework from './student/StudentHomework';
import StudentGrades from './student/StudentGrades';
import LearnerPortfolio from './student/LearnerPortfolio';
import StudentLibrary from './student/StudentLibrary';
import PathwaySelector from './student/PathwaySelector';

// Parent Modules
import ParentAppShell from './parent/ParentAppShell';

// Driver & Library
import DriverRoutes from './driver/DriverRoutes';
import PickupList from './driver/PickupList';
import VehicleMaintenance from './driver/VehicleMaintenance';
import BookInventory from './library/BookInventory';
import IssueReturn from './library/IssueReturn';
import BookCreate from './library/BookCreate';
import BookCategories from './library/BookCategories';
import MembersList from './library/MembersList';
import OverdueReports from './library/OverdueReports';

// Admin Core
import StudentList from './admin/StudentList';
import ParentList from './admin/ParentList';
import ClassManager from './admin/ClassManager';
import SubjectManager from './admin/SubjectManager';
import StudentAdmit from './admin/StudentAdmit';
import TimetableManager from './admin/TimetableManager';
import TransportDashboard from './admin/TransportDashboard';
import EventCalendar from './admin/EventCalendar';
import DormManager from './admin/DormManager';
import DocumentRepository from './admin/DocumentRepository';
import EndOfTermReports from './admin/EndOfTermReports';
import OrderManager from './admin/OrderManager';
import MessagingCenter from './admin/MessagingCenter';
import SystemSettings from './admin/SystemSettings';
import AdminList from './admin/AdminList';
import StudentOps from './admin/StudentOps';
import PinManager from './admin/PinManager';
// Dashboards
import SuperAdminDashboard from './dashboards/SuperAdminDashboard';
import PlatformDashboard from './dashboards/PlatformDashboard';
import SchoolManager from './dashboards/SchoolManager';
import SubscriptionManager from './dashboards/SubscriptionManager';
import SaaSInvoices from './dashboards/SaaSInvoices';
import SupportTickets from './dashboards/SupportTickets';
import AdminDashboard from './dashboards/AdminDashboard';
import TeacherDashboard from './dashboards/TeacherDashboard';
import StudentDashboard from './dashboards/StudentDashboard';
import HrDashboard from './dashboards/HrDashboard';
import AccountantDashboard from './dashboards/AccountantDashboard';
import LibrarianDashboard from './dashboards/LibrarianDashboard';
import DriverDashboard from './dashboards/DriverDashboard';
import TransportOps from './admin/TransportOps';
import RoleManager from './admin/RoleManager';
import AuditLog from './admin/AuditLog';
import DataCenter from './admin/DataCenter';
import Integrations from './admin/Integrations';
import ExamManager from './admin/ExamManager';
import BudgetPlanner from './admin/BudgetPlanner';
import SPCReport from './reports/SPCReport';

const Dashboard = ({ role }) => {
    console.log('Current Dashboard Role:', role);
    switch (role) {
        case 'platform_admin': return <PlatformDashboard />;
        case 'super_admin': return <AdminDashboard />;
        case 'school_admin': return <AdminDashboard />;
        case 'admin': return <AdminDashboard />;
        case 'teacher': return <TeacherDashboard />;
        case 'student': return <StudentDashboard />;
        case 'parent': return <Navigate to="/parent" replace />;
        case 'hr_manager': return <HrDashboard />;
        case 'accountant': return <AccountantDashboard />;
        case 'librarian': return <LibrarianDashboard />;
        case 'driver': return <DriverDashboard />;
        default: return <AdminDashboard />;
    }
};

const AppContent = ({
    role, userName, darkMode, setDarkMode, isSidebarOpen, setIsSidebarOpen,
    handleLogout, schoolName, setSchoolName, schoolLogo, setSchoolLogo,
    primaryColor, setPrimaryColor, themeStyle, setThemeStyle
}) => {
    const location = useLocation();
    const [toast, setToast] = useState(null);

    // Global Notification Helper
    window.showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const isParent = role === 'parent';

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-zinc-900 text-gray-100' : 'bg-[#F5F7FA] text-slate-800'} flex font-sans overflow-x-hidden`}>
            {/* Sidebar — hidden for parent role (they have their own nav) */}
            {!isParent && (
                <Sidebar
                    role={role}
                    darkMode={darkMode}
                    isOpen={isSidebarOpen}
                    closeSidebar={() => setIsSidebarOpen(false)}
                    onLogout={handleLogout}
                    schoolName={schoolName}
                    schoolLogo={schoolLogo}
                />
            )}

            {/* Mobile Overlay */}
            {!isParent && isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${!isParent ? 'md:ml-64' : ''} overflow-x-hidden`}>
                <Header
                    darkMode={darkMode}
                    toggleDarkMode={() => setDarkMode(!darkMode)}
                    onLogout={handleLogout}
                    toggleSidebar={!isParent ? () => setIsSidebarOpen(!isSidebarOpen) : null}
                    schoolName={schoolName}
                    userName={userName}
                    hideMenu={isParent}
                />

                {/* Main Content with Page Transition */}
                <main
                    key={location.pathname}
                    className={`flex-1 mt-16 animate-page-fade ${isParent ? 'p-0 overflow-hidden flex flex-col' : 'pt-6 px-3 md:pt-8 md:px-8 pb-8'}`}
                >
                    <Routes location={location}>
                        <Route path="/" element={<Dashboard role={role} />} />

                        {/* --- Platform Admin (Multi-School) --- */}
                        <Route path="/platform/schools" element={<SchoolManager />} />
                        <Route path="/platform/subscriptions" element={<SubscriptionManager />} />
                        <Route path="/platform/database" element={<SchoolManager />} /> {/* Reuse for demo */}
                        <Route path="/platform/terminal" element={<SchoolManager />} /> {/* Reuse for demo */}
                        <Route path="/platform/roles" element={<RoleManager mode="global" />} />
                        <Route path="/platform/audit" element={<AuditLog mode="global" />} />
                        <Route path="/platform/invoices" element={<SaaSInvoices />} />
                        <Route path="/platform/tickets" element={<SupportTickets />} />

                        {/* --- Common --- */}
                        <Route path="/notices" element={<NoticeBoard />} />
                        <Route path="/events" element={<SchoolEvents />} />

                        {/* --- HR --- */}
                        <Route path="/hr/staff" element={<StaffList />} />
                        <Route path="/hr/staff/create" element={<StaffCreate />} />
                        <Route path="/hr/staff/:id/documents" element={<StaffDocuments />} />
                        <Route path="/hr/attendance/mark" element={<AttendanceMark />} />
                        <Route path="/hr/attendance/history" element={<AttendanceHistory />} />
                        <Route path="/hr/leave" element={<LeaveRequests />} />
                        <Route path="/hr/payroll" element={<PayrollDashboard />} />
                        <Route path="/hr/payroll/generate" element={<PayrollGenerate />} />
                        <Route path="/hr/payroll/history" element={<PayslipHistory />} />

                        {/* --- Accountant --- */}
                        <Route path="/finance/collect" element={<FeeList />} />
                        <Route path="/finance/expenses" element={<ExpenseManager />} />
                        <Route path="/finance/reports" element={<FinancialReports />} />
                        <Route path="/finance/expenditure" element={<Expenditure />} />
                        <Route path="/finance/fees/structures" element={<FeeStructures />} />
                        <Route path="/finance/fees/schedule" element={<FeeSchedule />} />
                        <Route path="/finance/fees/amounts" element={<FeeAmounts />} />
                        <Route path="/finance/payments/record" element={<RecordPayment />} />
                        <Route path="/finance/reports/outstanding" element={<OutstandingBalances />} />
                        <Route path="/finance/reports/receipts" element={<ReceiptsRegister />} />
                        <Route path="/finance/reports/daily" element={<DailyCollection />} />
                        <Route path="/finance/reports/defaulters" element={<DefaultersList />} />
                        <Route path="/finance/reconciliation" element={<BankReconciliation />} />
                        {/* Enhanced Accountant Routes */}
                        <Route path="/finance/fees/invoices" element={<FeeInvoices />} />
                        <Route path="/finance/fees/refunds" element={<Refunds />} />
                        <Route path="/finance/fees/installments" element={<FeeInstallments />} />
                        <Route path="/finance/fees/balances" element={<OutstandingBalances />} />
                        <Route path="/finance/transport" element={<TransportBilling />} />
                        <Route path="/finance/transactions/sync" element={<TransactionSync />} />
                        <Route path="/finance/transactions/authorize" element={<TransactionAuth />} />
                        <Route path="/finance/transactions/cheques" element={<ChequeClearance />} />
                        <Route path="/finance/transfers" element={<FundTransfers />} />
                        <Route path="/finance/setup/groups" element={<StudentGroups />} />
                        <Route path="/finance/setup/discounts" element={<Discounts />} />
                        <Route path="/finance/setup/surcharges" element={<Surcharges />} />
                        <Route path="/finance/setup/sponsorships" element={<Sponsorships />} />
                        <Route path="/finance/comms/sms" element={<FinanceTemplates type="sms" />} />
                        <Route path="/finance/comms/email" element={<FinanceTemplates type="email" />} />
                        <Route path="/finance/integration/quickbooks" element={<QuickBooks />} />
                        <Route path="/finance/clearance" element={<Clearance />} />

                        {/* --- Teacher --- */}
                        <Route path="/teacher/students" element={<TeacherStudents />} />
                        <Route path="/teacher/classes" element={<TeacherStudents />} />
                        <Route path="/teacher/timetable" element={<TeacherTimetable />} />
                        <Route path="/teacher/attendance/mark" element={<ClassRegister />} />
                        <Route path="/teacher/attendance/history" element={<AttendanceHistoryTeacher />} />
                        <Route path="/teacher/grades" element={<TeacherGrades />} />
                        <Route path="/teacher/spc" element={<TeacherSPC />} />
                        <Route path="/teacher/reports" element={<TeacherReports />} />
                        <Route path="/teacher/homework" element={<TeacherHomework />} />
                        <Route path="/teacher/documents" element={<TeacherDocuments />} />
                        <Route path="/profile/leave" element={<TeacherLeave />} />

                        {/* --- Librarian --- */}
                        <Route path="/library/issue-return" element={<IssueReturn />} />
                        <Route path="/library/books" element={<BookInventory />} />
                        <Route path="/library/books/create" element={<BookCreate />} />
                        <Route path="/library/categories" element={<BookCategories />} />
                        <Route path="/library/students" element={<MembersList />} />
                        <Route path="/library/reports/overdue" element={<OverdueReports />} />

                        {/* --- Student --- */}
                        <Route path="/student/timetable" element={<StudentTimetable />} />
                        <Route path="/student/subjects" element={<StudentSubjects />} />
                        <Route path="/student/homework" element={<StudentHomework />} />
                        <Route path="/student/assessments" element={<StudentGrades />} />
                        <Route path="/student/portfolio" element={<LearnerPortfolio />} />
                        <Route path="/student/pathways" element={<PathwaySelector />} />
                        <Route path="/student/library" element={<StudentLibrary />} />

                        {/* --- Parent (mobile app shell handles all /parent/* routes) --- */}
                        <Route path="/parent/*" element={<ParentAppShell />} />

                        {/* --- Driver --- */}
                        <Route path="/driver/routes" element={<DriverRoutes />} />
                        <Route path="/driver/students" element={<PickupList />} />
                        <Route path="/driver/vehicle" element={<VehicleMaintenance />} />

                        {/* --- Admin --- */}
                        <Route path="/admin/users/staff" element={<StaffList />} />
                        <Route path="/admin/users/staff/create" element={<StaffCreate />} />
                        <Route path="/admin/users/students" element={<StudentList />} />
                        <Route path="/admin/users/parents" element={<ParentList />} />
                        <Route path="/admin/users/admins" element={<AdminList />} />
                        <Route path="/students/admit" element={<StudentAdmit />} />
                        <Route path="/admin/classes" element={<ClassManager />} />
                        <Route path="/admin/subjects" element={<SubjectManager />} />
                        <Route path="/admin/timetables" element={<TimetableManager />} />
                        <Route path="/admin/events" element={<EventCalendar />} />
                        <Route path="/transport" element={<TransportDashboard />} />
                        <Route path="/admin/transport" element={<TransportDashboard />} />
                        <Route path="/admin/exams" element={<ExamManager />} />
                        <Route path="/admin/dorms" element={<DormManager />} />
                        <Route path="/admin/documents" element={<DocumentRepository />} />
                        <Route path="/finance/budget" element={<BudgetPlanner />} />
                        <Route path="/reports/spc" element={<SPCReport />} />
                        <Route path="/reports/term" element={<EndOfTermReports />} />

                        {/* --- Settings & System Control --- */}
                        <Route path="/settings" element={
                            <SystemSettings
                                primaryColor={primaryColor}
                                setPrimaryColor={setPrimaryColor}
                                themeStyle={themeStyle}
                                setThemeStyle={setThemeStyle}
                                schoolLogo={schoolLogo}
                                setSchoolLogo={setSchoolLogo}
                                schoolName={schoolName}
                                setSchoolName={setSchoolName}
                            />
                        } />
                        <Route path="/settings/roles" element={<RoleManager mode="local" />} />
                        <Route path="/settings/audit" element={<AuditLog mode="local" />} />
                        <Route path="/settings/data" element={<DataCenter />} />
                        <Route path="/settings/integrations" element={<Integrations />} />
                        <Route path="/orders/books" element={<OrderManager />} />
                        <Route path="/orders/library" element={<OrderManager />} />
                        <Route path="/messages" element={<MessagingCenter />} />
                        <Route path="/students/promotion" element={<StudentOps />} />
                        <Route path="/students/alumni" element={<StudentOps />} />
                        <Route path="/students/info" element={<StudentList />} />
                        <Route path="/pins/generate" element={<PinManager />} />
                        <Route path="/pins/list" element={<PinManager />} />
                        <Route path="/transport/routes" element={<TransportOps />} />
                        <Route path="/transport/drivers" element={<TransportOps />} />
                        <Route path="/transport/vehicles" element={<TransportOps />} />
                        <Route path="/transport/assignments" element={<TransportOps />} />
                    </Routes>
                </main>

                {/* Global Toast */}
                {toast && (
                    <NotificationToast
                        type={toast.type}
                        message={toast.message}
                        onClose={() => setToast(null)}
                    />
                )}
            </div>
        </div>
    );
};

function Main() {
    const [authUser, setAuthUser] = useState(() => {
        try {
            const stored = localStorage.getItem('auth_user');
            return stored ? JSON.parse(stored) : null;
        } catch (_) {
            return null;
        }
    });
    const role = authUser?.role || null;
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
    const [primaryColor, setPrimaryColor] = useState(() => localStorage.getItem('primaryColor') || '#9333ea');
    const [themeStyle, setThemeStyle] = useState(() => localStorage.getItem('themeStyle') || 'accented');
    const [schoolLogo, setSchoolLogo] = useState(() => localStorage.getItem('schoolLogo') || null);
    const [schoolName, setSchoolName] = useState(() => localStorage.getItem('schoolName') || 'Ikonex School System');
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    // Restore axios Authorization header from persisted token on page load
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else if (authUser) {
            // Token gone but user object remains — clear stale auth
            setAuthUser(null);
            localStorage.removeItem('auth_user');
        }
    }, []);

    useEffect(() => {
        if (darkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    const darkenColor = (hex, percent) => {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    };

    useEffect(() => {
        localStorage.setItem('primaryColor', primaryColor);
        localStorage.setItem('themeStyle', themeStyle);
        localStorage.setItem('schoolName', schoolName);
        if (schoolLogo) localStorage.setItem('schoolLogo', schoolLogo);

        const darkPrimaryBg = darkenColor(primaryColor, 85);
        const darkPrimaryBgLighter = darkenColor(primaryColor, 75);
        const darkPrimaryBorder = darkenColor(primaryColor, 65);

        let styleTag = document.getElementById('dynamic-theme');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'dynamic-theme';
            document.head.appendChild(styleTag);
        }

        const borderColor = themeStyle === 'accented' ? darkPrimaryBorder : '#3f3f46';
        const borderColorLight = themeStyle === 'accented' ? darkenColor(primaryColor, 40) : '#52525b';

        styleTag.innerHTML = `
            :root {
                --primary-color: ${primaryColor};
                --primary-color-hover: ${primaryColor}dd;
                --dark-primary-bg: ${darkPrimaryBg};
                --dark-primary-bg-lighter: ${darkPrimaryBgLighter};
                --dark-primary-border: ${darkPrimaryBorder};
            }
            /* Main Primary Overrides */
            .bg-purple-600, .bg-indigo-600, .bg-primary { background-color: var(--primary-color) !important; }
            .text-purple-600, .text-indigo-600, .text-primary { color: var(--primary-color) !important; }
            .border-purple-600, .border-indigo-600, .border-primary { border-color: var(--primary-color) !important; }
            
            /* Light Backgrounds (Sidebar Active State) */
            .bg-purple-50 { background-color: ${primaryColor}1a !important; } /* 10% Opacity */
            
            /* Dark Mode Text & Border Variants */
            .text-purple-400, .dark .dark\\:text-purple-400 { color: ${primaryColor}cc !important; } /* 80% Opacity */
            .border-purple-500, .dark .dark\\:border-purple-500 { border-color: ${primaryColor}99 !important; } /* 60% Opacity */
            
            /* Ring Focus States */
            .focus\\:ring-purple-500:focus { --tw-ring-color: ${primaryColor}80 !important; }

            /* Dark Mode Containers */
            .dark .dark\\:bg-gray-800 { background-color: #27272a !important; }
            .dark .dark\\:bg-gray-700 { background-color: #3f3f46 !important; }
            .dark .dark\\:border-gray-700 { border-color: ${borderColor} !important; }
            .dark .dark\\:border-gray-600 { border-color: ${borderColorLight} !important; }
        `;
    }, [primaryColor, themeStyle, schoolName, schoolLogo]);

    // Fetch school branding whenever user changes (login / page reload with stored token)
    useEffect(() => {
        if (!authUser) return;
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        window.axios.get('/api/school/branding', {
            headers: { Authorization: `Bearer ${token}` },
        }).then(res => {
            if (res.data.primary_color) {
                setPrimaryColor(res.data.primary_color);
                localStorage.setItem('primaryColor', res.data.primary_color);
            }
            if (res.data.theme_style) {
                setThemeStyle(res.data.theme_style);
                localStorage.setItem('themeStyle', res.data.theme_style);
            }
            if (res.data.school_name) {
                setSchoolName(res.data.school_name);
                localStorage.setItem('schoolName', res.data.school_name);
            }
        }).catch(() => {});
    }, [authUser]);

    const handleLoginSuccess = (user) => {
        setAuthUser(user);
        if (user.school?.name) setSchoolName(user.school.name);
        if (user.school?.logo_path) setSchoolLogo(user.school.logo_path);
        window.location.hash = '/';
    };

    const handleLogout = async () => {
        try {
            await window.axios.post('/api/auth/logout');
        } catch (_) {
            // Token already invalid — continue with local cleanup
        }
        delete window.axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setAuthUser(null);
        window.location.hash = '/';
    };

    if (isLoading) return <SplashLoader schoolName={schoolName} schoolLogo={schoolLogo} />;
    if (!authUser) return <LoginForm onLoginSuccess={handleLoginSuccess} />;

    return (
        <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppContent
                role={role} userName={authUser?.name} darkMode={darkMode} setDarkMode={setDarkMode}
                isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
                handleLogout={handleLogout}
                schoolName={schoolName} setSchoolName={setSchoolName}
                schoolLogo={schoolLogo} setSchoolLogo={setSchoolLogo}
                primaryColor={primaryColor} setPrimaryColor={setPrimaryColor}
                themeStyle={themeStyle} setThemeStyle={setThemeStyle}
            />
        </HashRouter>
    );
}

if (document.getElementById('app')) {
    ReactDOM.render(<Main />, document.getElementById('app'));
}
