import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await window.axios.get('/api/teacher/dashboard');
                setData(res.data);
            } catch { /* silent */ }
            finally { setLoading(false); }
        })();
    }, []);

    const stats = data?.stats ?? {};
    const slots = data?.today_slots ?? [];

    const today = new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">Teacher Dashboard</nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">
                        Dashboard
                        <span className="ml-2 text-xs font-normal text-slate-400">{today}</span>
                    </h1>
                </div>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-2 flex-shrink-0">
                {[
                    { label: 'My Classes',        value: loading ? '…' : stats.class_count,        cls: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' },
                    { label: 'My Students',       value: loading ? '…' : stats.student_count,      cls: 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800' },
                    { label: 'Attendance Today',  value: loading ? '…' : (stats.attendance_rate !== null ? `${stats.attendance_rate}%` : 'N/M'), cls: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' },
                    { label: 'Active Exams',      value: loading ? '…' : stats.active_exams,       cls: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20' },
                    { label: 'Homework Due',      value: loading ? '…' : stats.pending_homework,   cls: 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800' },
                ].map(c => (
                    <div key={c.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${c.cls}`}>
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{c.value ?? '—'}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{c.label}</span>
                    </div>
                ))}
            </div>

            {/* Main grid */}
            <div className="flex flex-col md:flex-row gap-3 flex-1 min-h-0">

                {/* Today's schedule */}
                <div className="w-full md:w-72 flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                    <div className="flex-shrink-0 bg-slate-800 dark:bg-slate-900">
                        <div className="px-4 py-2.5 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Today's Schedule</span>
                            <button onClick={() => navigate('/teacher/timetable')}
                                className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">
                                Full →
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="py-10 text-center text-xs text-slate-400">Loading…</div>
                        ) : slots.length === 0 ? (
                            <div className="py-10 text-center text-xs text-slate-400 italic">No classes scheduled.</div>
                        ) : slots.map((s, i) => (
                            <div key={i} className={`px-4 py-2.5 border-b border-slate-100 dark:border-gray-700/60 ${
                                i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                            }`}>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{s.time_slot}</p>
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{s.subject_name ?? 'Free Period'}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{s.class_name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick actions */}
                <div className="flex-1 min-w-0 flex flex-col gap-3">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
                        <div className="px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Quick Actions</span>
                        </div>
                        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {[
                                { label: 'Mark Attendance',    path: '/teacher/attendance/mark' },
                                { label: 'Enter Grades',       path: '/teacher/grades' },
                                { label: 'Add Homework',       path: '/teacher/homework' },
                                { label: 'Student Progress',   path: '/teacher/spc' },
                                { label: 'Attendance History', path: '/teacher/attendance/history' },
                                { label: 'Apply for Leave',    path: '/profile/leave' },
                            ].map(a => (
                                <button key={a.path} onClick={() => navigate(a.path)}
                                    className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-left rounded-md border border-slate-200 dark:border-gray-600 text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-colors">
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

export default TeacherDashboard;
