import React from 'react';
import { useNavigate } from 'react-router-dom';

const today = new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const NOTICES = [
    { title: 'Term 2 Final Exams Schedule',        date: '2h ago',   tag: 'Academic', isNew: true  },
    { title: 'Parent-Teacher Meeting Postponed',   date: 'Yesterday', tag: 'Events',   isNew: true  },
    { title: 'New Library Books Arrival',          date: 'Oct 23',   tag: 'Library',  isNew: false },
];

const AdminDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">Admin Dashboard</nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">
                        Dashboard
                        <span className="ml-2 text-xs font-normal text-slate-400">{today}</span>
                    </h1>
                </div>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-2 flex-shrink-0">
                {[
                    { label: 'Total Students',    value: '1,245', cls: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' },
                    { label: 'Class Streams',     value: '24',    cls: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' },
                    { label: 'Active Subjects',   value: '14',    cls: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20' },
                ].map(c => (
                    <div key={c.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${c.cls}`}>
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{c.value}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{c.label}</span>
                    </div>
                ))}
            </div>

            {/* Main grid */}
            <div className="flex gap-3 flex-1 min-h-0">

                {/* Latest Notices */}
                <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col min-h-0">
                    <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 bg-slate-800 dark:bg-slate-900 rounded-t-lg">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Latest Notices</span>
                        <button className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">
                            Mark all read
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {NOTICES.map((notice, i) => (
                            <div key={i} className={`px-4 py-3 border-b border-slate-100 dark:border-gray-700/60 flex items-center justify-between gap-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                            }`}>
                                <div className="flex items-center gap-2 min-w-0">
                                    {notice.isNew && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"/>}
                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{notice.title}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300">
                                        {notice.tag}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400">{notice.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="w-64 flex-shrink-0 flex flex-col gap-3">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
                        <div className="px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Quick Actions</span>
                        </div>
                        <div className="p-3 grid grid-cols-1 gap-2">
                            {[
                                { label: 'Admit Student',      path: '/students/admit' },
                                { label: 'Class Streams',      path: '/admin/classes' },
                                { label: 'Manage Subjects',    path: '/admin/subjects' },
                                { label: 'System Settings',    path: '/settings' },
                            ].map(a => (
                                <button key={a.path} onClick={() => navigate(a.path)}
                                    className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-left rounded-md border border-slate-200 dark:border-gray-600 text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-colors">
                                    {a.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
