import React from 'react';
import AdminDashboard from './dashboards/AdminDashboard';
import SuperAdminDashboard from './dashboards/SuperAdminDashboard';
import HrDashboard from './dashboards/HrDashboard';
import AccountantDashboard from './dashboards/AccountantDashboard';
import TeacherDashboard from './dashboards/TeacherDashboard';
import LibrarianDashboard from './dashboards/LibrarianDashboard';
import StudentDashboard from './dashboards/StudentDashboard';
import ParentDashboard from './dashboards/ParentDashboard';
import DriverDashboard from './dashboards/DriverDashboard';

const Dashboard = ({ role }) => {
    if (role === 'hr_manager') {
        return <HrDashboard />;
    }
    if (role === 'accountant') {
        return <AccountantDashboard />;
    }
    if (role === 'teacher') {
        return <TeacherDashboard />;
    }
    if (role === 'librarian') {
        return <LibrarianDashboard />;
    }
    if (role === 'student') {
        return <StudentDashboard />;
    }
    if (role === 'parent') {
        return <ParentDashboard />;
    }
    if (role === 'driver') {
        return <DriverDashboard />;
    }
    if (role === 'school_admin') {
        return <AdminDashboard />;
    }
    // Default to Super Admin
    return <SuperAdminDashboard />;
};

export default Dashboard;
