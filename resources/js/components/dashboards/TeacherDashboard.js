import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MiniCalendar from '../common/MiniCalendar';

const StatCard = ({ label, value, sub, color, icon }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4 shadow-sm">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-2xl font-extrabold text-gray-800 dark:text-white">{value ?? '—'}</p>
            <p className="text-xs font-black uppercase text-gray-400 tracking-wider">{label}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [data, setData]       = useState(null);
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

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Teacher Dashboard</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">
                    {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="My Classes" value={loading ? '…' : stats.class_count}
                    color="bg-primary/10" icon={
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                    }/>
                <StatCard label="My Students" value={loading ? '…' : stats.student_count}
                    color="bg-blue-100 dark:bg-blue-900/30" icon={
                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                        </svg>
                    }/>
                <StatCard label="Attendance Today"
                    value={loading ? '…' : (stats.attendance_rate !== null ? `${stats.attendance_rate}%` : 'Not Marked')}
                    color="bg-green-100 dark:bg-green-900/30" icon={
                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    }/>
                <StatCard label="Active Exams" value={loading ? '…' : stats.active_exams}
                    sub={`${stats.pending_homework ?? 0} homework due`}
                    color="bg-purple-100 dark:bg-purple-900/30" icon={
                        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                    }/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Schedule */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <p className="font-bold text-gray-800 dark:text-white">Today's Schedule</p>
                        <button onClick={() => navigate('/teacher/timetable')}
                            className="text-xs font-bold text-primary hover:underline">View Full</button>
                    </div>
                    {loading ? (
                        <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
                    ) : slots.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm italic">No classes scheduled.</div>
                    ) : (
                        <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {slots.map((s, i) => (
                                <div key={i} className="px-5 py-3 flex items-center gap-3">
                                    <div className="w-20 text-xs font-black text-gray-400 uppercase tracking-widest shrink-0">{s.time_slot}</div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800 dark:text-white">{s.subject_name ?? 'Free Period'}</p>
                                        <p className="text-[11px] text-gray-400 font-bold uppercase">{s.class_name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Small Calendar */}
                <MiniCalendar />

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
                    <p className="font-bold text-gray-800 dark:text-white mb-4">Quick Actions</p>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Mark Attendance',    path: '/teacher/attendance/mark',    color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40' },
                            { label: 'Enter Grades',       path: '/teacher/grades',              color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40' },
                            { label: 'Add Homework',       path: '/teacher/homework',            color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40' },
                            { label: 'Student Progress',   path: '/teacher/spc',                 color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40' },
                            { label: 'Attendance History', path: '/teacher/attendance/history',  color: 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600' },
                            { label: 'My Leave',           path: '/profile/leave',               color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40' },
                        ].map(a => (
                            <button key={a.path} onClick={() => navigate(a.path)}
                                className={`rounded-xl px-4 py-3 text-[11px] font-black uppercase text-left transition-colors tracking-widest ${a.color}`}>
                                {a.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
