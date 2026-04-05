import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const MENUS = {
    platform_admin: [
        { header: 'Platform Overview' },
        { to: '/', icon: 'dashboard', label: 'Platform Dashboard' },
        { to: '/platform/schools', icon: 'school', label: 'Manage Schools' },
        { to: '/platform/subscriptions', icon: 'credit-card', label: 'Subscriptions' },
        { header: 'God Mode Controls' },
        { to: '/platform/database', icon: 'database', label: 'Global DB Access' },
        { to: '/platform/terminal', icon: 'document', label: 'System Terminal' },
        { to: '/platform/roles', icon: 'lock', label: 'Master Roles' },
        { to: '/platform/audit', icon: 'shield', label: 'God View Logs' },
        { header: 'Support & Billing' },
        { to: '/platform/invoices', icon: 'receipt', label: 'SaaS Invoices' },
        { to: '/platform/tickets', icon: 'mail', label: 'Support Tickets' },
    ],
    super_admin: [
        { header: 'Main Menu' },
        { to: '/', icon: 'dashboard', label: 'Dashboard' },
        { to: '/notices', icon: 'bell', label: 'Notice Board' },
        { header: 'Administration' },
        {
            to: '#', icon: 'users', label: 'User Management',
            subItems: [
                { label: 'Administrators', to: '/admin/users/admins' },
                { label: 'Staff & Teachers', to: '/admin/users/staff' },
                { label: 'Students', to: '/admin/users/students' },
                { label: 'Parents', to: '/admin/users/parents' },
            ]
        },
        {
            to: '#', icon: 'academic', label: 'Academic Ops',
            subItems: [
                { label: 'Admit Student', to: '/students/admit' },
                { label: 'Classes & Sections', to: '/admin/classes' },
                { label: 'Subjects', to: '/admin/subjects' },
                { label: 'Timetables', to: '/admin/timetables' },
                { label: 'Promotions', to: '/students/promotion' },
                { label: 'Alumni Registry', to: '/students/alumni' },
            ]
        },
        { to: '/admin/exams', icon: 'academic', label: 'Examination Mgmt' },
        { header: 'Operations' },
        { to: '/admin/transport', icon: 'truck', label: 'Transport' },
        { to: '/admin/dorms', icon: 'home', label: 'Dormitories' },
        { to: '/admin/events', icon: 'calendar', label: 'Event Calendar' },
        { to: '/admin/documents', icon: 'document', label: 'Documents' },
        { header: 'Finance & Reports' },
        { to: '/finance/budget', icon: 'cash', label: 'Budget Planning' },
        { to: '/reports/spc', icon: 'chart', label: 'SPC Reports', badge: 'Live' },
        { to: '/reports/term', icon: 'report', label: 'End of Term' },
        { header: 'God Mode System Control' },
        { to: '/settings', icon: 'cog', label: 'Global Settings' },
        { to: '/settings/roles', icon: 'lock', label: 'Role & Permissions' },
        { to: '/settings/audit', icon: 'shield', label: 'System Audit Logs' },
        { to: '/settings/data', icon: 'database', label: 'Data Center' },
        { to: '/settings/integrations', icon: 'globe', label: 'API Integrations' },
    ],
    admin: [
        { header: 'Main Menu' },
        { to: '/', icon: 'dashboard', label: 'Dashboard' },
        { to: '/notices', icon: 'bell', label: 'Notice Board' },
        { header: 'School Management' },
        { to: '/admin/users/students', icon: 'users', label: 'Students' },
        { to: '/admin/users/staff', icon: 'briefcase', label: 'Staff' },
        { to: '/admin/users/parents', icon: 'family', label: 'Parents' },
        {
            to: '#', icon: 'academic', label: 'Academic Ops',
            subItems: [
                { label: 'Admit Student', to: '/students/admit' },
                { label: 'Classes', to: '/admin/classes' },
                { label: 'Subjects', to: '/admin/subjects' },
                { label: 'Timetable', to: '/admin/timetable' },
            ]
        },
        { to: '/admin/transport', icon: 'bus', label: 'Transport' },
        { to: '/admin/dormitories', icon: 'dorm', label: 'Dormitories' },
        { to: '/admin/events', icon: 'calendar', label: 'Event Calendar' },
        { header: 'Communication' },
        { to: '/admin/documents', icon: 'document', label: 'Documents' },
    ],
    hr_manager: [
        { header: 'HR Management' },
        { to: '/', icon: 'dashboard', label: 'HR Dashboard' },
        {
            to: '#', icon: 'users', label: 'Staff Management',
            subItems: [
                { label: 'All Staff', to: '/hr/staff' },
                { label: 'Add New Staff', to: '/hr/staff/create' },
            ]
        },
        {
            to: '#', icon: 'clock', label: 'Attendance',
            subItems: [
                { label: 'Mark Attendance', to: '/hr/attendance/mark' },
                { label: 'Attendance History', to: '/hr/attendance/history' },
            ]
        },
        { to: '/hr/leave', icon: 'calendar', label: 'Leave Requests' },
        {
            to: '#', icon: 'cash', label: 'Payroll System',
            subItems: [
                { label: 'Payroll Dashboard', to: '/hr/payroll' },
                { label: 'Generate Payslip', to: '/hr/payroll/generate' },
                { label: 'Payslip History', to: '/hr/payroll/history' },
            ]
        },
        { header: 'General' },
        { to: '/events', icon: 'calendar', label: 'School Events' },
        { to: '/profile/leave', icon: 'user-clock', label: 'My Leave' },
        { to: '/notices', icon: 'bell', label: 'Notice Board' },
    ],
    accountant: [
        { header: 'Financial Management' },
        { to: '/', icon: 'dashboard', label: 'Financial Dashboard' },

        { header: 'Fees & Invoicing' },
        {
            to: '#', icon: 'credit-card', label: 'Fee Operations',
            subItems: [
                { label: 'Invoices & History', to: '/finance/fees/invoices' },
                { label: 'Record Payment', to: '/finance/payments/record' },
                { label: 'Process Refunds', to: '/finance/fees/refunds' },
                { label: 'Manage Installments', to: '/finance/fees/installments' },
                { label: 'Outstanding Balances', to: '/finance/fees/balances' },
            ]
        },
        { to: '/finance/transport', icon: 'truck', label: 'Transport Billing' },

        { header: 'Transactions & Banking' },
        {
            to: '#', icon: 'cash', label: 'Transactions',
            subItems: [
                { label: 'Sync Payments', to: '/finance/transactions/sync' },
                { label: 'Authorize Payments', to: '/finance/transactions/authorize' },
                { label: 'Cheque Clearance', to: '/finance/transactions/cheques' },
                { label: 'Fund Transfers', to: '/finance/transfers' },
            ]
        },
        { to: '/finance/banking/reconcile', icon: 'bank', label: 'Bank Reconciliation' },

        { header: 'Setup & Configuration' },
        {
            to: '#', icon: 'cog', label: 'Fee Setup',
            subItems: [
                { label: 'Fee Structures', to: '/finance/setup/fees' },
                { label: 'Student Groups', to: '/finance/setup/groups' },
                { label: 'Discounts', to: '/finance/setup/discounts' },
                { label: 'Surcharges', to: '/finance/setup/surcharges' },
                { label: 'Sponsorships', to: '/finance/setup/sponsorships' },
            ]
        },

        { header: 'Reporting & Comms' },
        { to: '/finance/reports', icon: 'chart', label: 'Financial Reports' },
        {
            to: '#', icon: 'mail', label: 'Templates',
            subItems: [
                { label: 'SMS Templates', to: '/finance/comms/sms' },
                { label: 'Email Templates', to: '/finance/comms/email' },
            ]
        },
        { to: '/finance/integration/quickbooks', icon: 'globe', label: 'QuickBooks Sync' },

        { header: 'General' },
        { to: '/events', icon: 'calendar', label: 'School Events' },
        { to: '/profile/leave', icon: 'user-clock', label: 'My Leave' },
        { to: '/notices', icon: 'bell', label: 'Notice Board' },
    ],
    teacher: [
        { header: 'Academic Management' },
        { to: '/', icon: 'dashboard', label: 'Teacher Dashboard' },
        {
            to: '#', icon: 'class', label: 'My Classes',
            subItems: [
                { label: 'View Students', to: '/teacher/students' },
                { label: 'Class Register', to: '/teacher/classes' },
                { label: 'Timetable', to: '/teacher/timetable' },
            ]
        },
        {
            to: '#', icon: 'clock', label: 'Attendance',
            subItems: [
                { label: 'Mark Attendance', to: '/teacher/attendance/mark' },
                { label: 'Attendance History', to: '/teacher/attendance/history' },
            ]
        },
        {
            to: '#', icon: 'academic', label: 'Academics',
            subItems: [
                { label: 'Student Progress (SPC)', to: '/teacher/spc' },
                { label: 'Enter Grades', to: '/teacher/grades' },
                { label: 'Report Cards', to: '/teacher/reports' },
            ]
        },
        { to: '/teacher/homework', icon: 'book', label: 'Homework / Assignments' },
        { header: 'General' },
        { to: '/events', icon: 'calendar', label: 'School Events' },
        { to: '/teacher/documents', icon: 'document', label: 'Documents Hub' },
        { to: '/profile/leave', icon: 'user-clock', label: 'My Leave' },
        { to: '/notices', icon: 'bell', label: 'Notice Board' },
    ],
    librarian: [
        { header: 'Library Operations' },
        { to: '/', icon: 'dashboard', label: 'Library Dashboard' },
        { to: '/library/issue-return', icon: 'book', label: 'Issue / Return' },
        {
            to: '#', icon: 'library', label: 'Book Inventory',
            subItems: [
                { label: 'All Books', to: '/library/books' },
                { label: 'Add New Book', to: '/library/books/create' },
                { label: 'Categories', to: '/library/categories' },
            ]
        },
        { to: '/library/students', icon: 'users', label: 'Student Accounts' },
        { to: '/library/reports/overdue', icon: 'report', label: 'Overdue Reports' },
        { header: 'General' },
        { to: '/events', icon: 'calendar', label: 'School Events' },
        { to: '/profile/leave', icon: 'user-clock', label: 'My Leave' },
        { to: '/notices', icon: 'bell', label: 'Notice Board' },
    ],
    student: [
        { header: 'My Studies' },
        { to: '/', icon: 'dashboard', label: 'My Dashboard' },
        { to: '/student/pathways', icon: 'key', label: 'Pathway Selection' },
        { to: '/student/timetable', icon: 'clock', label: 'My Timetable' },
        { to: '/student/assessments', icon: 'chart', label: 'My Assessments' },
        { to: '/student/portfolio', icon: 'document', label: 'Learner Portfolio' },
        { to: '/student/subjects', icon: 'book', label: 'My Learning Areas' },
        { to: '/student/homework', icon: 'document', label: 'Homework' },
        { to: '/student/library', icon: 'library', label: 'Library Books' },
        { header: 'General' },
        { to: '/events', icon: 'calendar', label: 'School Events' },
        { to: '/notices', icon: 'bell', label: 'Notice Board' },
    ],
    parent: [
        { header: 'My Children' },
        { to: '/', icon: 'dashboard', label: 'Parent Dashboard' },
        { to: '/parent/children', icon: 'users', label: 'Children Profile' },
        { to: '/parent/fees', icon: 'credit-card', label: 'Fee Payments' },
        { to: '/parent/academic', icon: 'academic', label: 'Academic Reports' },
        { to: '/parent/attendance', icon: 'clock', label: 'Attendance Records' },
        { to: '/parent/engagement', icon: 'users', label: 'Parental Engagement' },
        { to: '/parent/transport', icon: 'truck', label: 'Transport Info' },
        { header: 'Communication' },
        { to: '/events', icon: 'calendar', label: 'School Events' },
        { to: '/notices', icon: 'bell', label: 'Notice Board' },
        { to: '/messages', icon: 'mail', label: 'Messages' },
    ],
    driver: [
        { header: 'Transport Operations' },
        { to: '/', icon: 'dashboard', label: 'Driver Dashboard' },
        { to: '/driver/routes', icon: 'truck', label: 'My Routes' },
        { to: '/driver/students', icon: 'users', label: 'Student Pickup List' },
        { to: '/driver/vehicle', icon: 'cog', label: 'Vehicle Maintenance' },
        { header: 'General' },
        { to: '/events', icon: 'calendar', label: 'School Events' },
        { to: '/profile/leave', icon: 'user-clock', label: 'My Leave' },
        { to: '/notices', icon: 'bell', label: 'Notice Board' },
    ]
};

const Icons = {
    dashboard: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    bell: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    users: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    academic: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>,
    class: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    book: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    clock: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    home: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    calendar: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    document: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    chart: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    report: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    cart: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    library: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>,
    key: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>,
    truck: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>,
    mail: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    cog: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    cash: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    'user-clock': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    'credit-card': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    receipt: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
    bank: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>,
    lock: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    shield: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    database: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>,
    globe: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
    school: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    logout: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
};

const SidebarItem = ({ icon, label, to, badge, subItems, onItemClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasSubItems = subItems && subItems.length > 0;

    const toggleSubMenu = (e) => {
        if (hasSubItems) {
            e.preventDefault();
            setIsOpen(!isOpen);
        } else {
            if (onItemClick) onItemClick();
        }
    };

    return (
        <div className="mb-1">
            <NavLink
                to={hasSubItems ? '#' : to}
                onClick={toggleSubMenu}
                className={({ isActive }) =>
                    `flex items-center px-6 py-3 cursor-pointer transition-colors ${isActive && !hasSubItems ? 'bg-purple-50 text-purple-600 border-r-4 border-purple-600 dark:bg-gray-700 dark:text-purple-400 dark:border-purple-500' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'}`
                }
            >
                <div className="mr-3">{typeof icon === 'string' ? Icons[icon] : icon}</div>
                <span className="font-medium flex-1">{label}</span>
                {badge && <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300">{badge}</span>}
                {hasSubItems && (
                    <svg className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                )}
            </NavLink>

            {hasSubItems && isOpen && (
                <div className="bg-gray-50 py-2 dark:bg-gray-900">
                    {subItems.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.to}
                            onClick={onItemClick}
                            className={({ isActive }) =>
                                `block pl-14 pr-6 py-2 text-sm transition-colors ${isActive ? 'text-purple-600 font-medium dark:text-purple-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-300'}`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    );
};

const Sidebar = ({ role = 'super_admin', darkMode, isOpen, closeSidebar, onLogout, schoolName, schoolLogo }) => {
    const activeMenu = MENUS[role] || MENUS['super_admin'];

    return (
        <div className={`w-64 h-screen fixed left-0 top-0 shadow-lg flex flex-col z-30 overflow-hidden transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${darkMode ? 'bg-zinc-900 border-r border-zinc-800' : 'bg-white border-r border-gray-200'}`}>
            <div className={`h-16 flex items-center px-6 border-b flex-shrink-0 transition-colors duration-300 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                {schoolLogo ? (
                    <img src={schoolLogo} className="w-8 h-8 rounded-lg mr-3 object-cover" alt="Logo" />
                ) : (
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                )}
                <div>
                    <h1 className={`text-lg font-bold transition-colors truncate w-32 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{schoolName || 'Skullu 2.0'}</h1>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{role.replace('_', ' ').toUpperCase()}</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                {activeMenu.map((item, index) => (
                    item.header ? (
                        <div key={index} className={`mt-4 mb-2 px-6 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{item.header}</div>
                    ) : (
                        <SidebarItem
                            key={index}
                            to={item.to}
                            icon={item.icon}
                            label={item.label}
                            badge={item.badge}
                            subItems={item.subItems}
                            onItemClick={closeSidebar}
                        />
                    )
                ))}

                {/* Logout Button */}
                <div className="mt-4 mb-2 px-6 text-xs font-semibold uppercase tracking-wider text-red-400 border-t border-gray-100 pt-4 dark:border-gray-700">Account</div>
                <div className="mb-1">
                    <button
                        onClick={() => {
                            if (closeSidebar) closeSidebar();
                            if (onLogout) onLogout();
                        }}
                        className="w-full flex items-center px-6 py-3 cursor-pointer transition-colors text-red-500 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                    >
                        <div className="mr-3">{Icons['logout']}</div>
                        <span className="font-medium flex-1 text-left">Sign Out</span>
                    </button>
                </div>
            </div>

            <div className={`p-4 border-t transition-colors duration-300 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className={`flex items-center p-3 rounded-xl cursor-pointer transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}>
                    <img src={`https://ui-avatars.com/api/?name=${role}&background=random&color=fff`} className="w-10 h-10 rounded-full" alt="User" />
                    <div className="ml-3">
                        <p className={`text-sm font-bold capitalize ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{role.replace('_', ' ')}</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Session</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
