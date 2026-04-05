import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const avatarPalette = ['#6366f1','#ec4899','#10b981','#f59e0b','#3b82f6','#8b5cf6'];

const statusColor = (s) => {
    if (s === 'Present') return { bg: '#dcfce7', text: '#16a34a' };
    if (s === 'Absent')  return { bg: '#fee2e2', text: '#dc2626' };
    if (s === 'Late')    return { bg: '#fef9c3', text: '#ca8a04' };
    return { bg: '#f1f5f9', text: '#64748b' };
};

const QuickAction = ({ icon, label, color, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 active:scale-95 transition-transform hover:shadow-md">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
        </div>
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 text-center leading-tight">{label}</span>
    </button>
);

const ParentDashboard = () => {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate              = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        fetch('/api/parent/dashboard', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="space-y-4 animate-pulse">
            <div className="h-28 bg-white rounded-2xl"></div>
            <div className="grid grid-cols-4 gap-3">{[1,2,3,4].map(i=><div key={i} className="h-20 bg-white rounded-2xl"></div>)}</div>
            <div className="h-40 bg-white rounded-2xl"></div>
        </div>
    );

    if (!data || data.error) return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <p className="font-bold text-gray-700 dark:text-gray-200">No children linked</p>
            <p className="text-sm text-gray-400 mt-1">Contact your school administrator.</p>
        </div>
    );

    const { children, total_balance } = data;
    const balancePaid = !total_balance || total_balance <= 0;

    return (
        <div className="space-y-4 pb-2">

            {/* ── Balance Hero Card ─────────────────────────────────── */}
            <div
                className="rounded-2xl p-5 text-white shadow-lg relative overflow-hidden"
                style={{ background: balancePaid ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #b91c1c)' }}
            >
                <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white opacity-10"></div>
                <div className="absolute -right-2 bottom-0 w-16 h-16 rounded-full bg-white opacity-10"></div>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Outstanding Balance</p>
                <p className="text-3xl font-black mt-1">
                    {balancePaid ? '✓ All Paid' : `KES ${Number(total_balance).toLocaleString()}`}
                </p>
                <p className="text-white/70 text-xs mt-1">
                    {balancePaid ? 'No fees due — great!' : 'Tap Fees to pay now'}
                </p>
                {!balancePaid && (
                    <button
                        onClick={() => navigate('/parent/fees')}
                        className="mt-3 bg-white/20 hover:bg-white/30 text-white text-sm font-bold px-4 py-1.5 rounded-xl transition-colors"
                    >
                        Pay Now →
                    </button>
                )}
            </div>

            {/* ── Quick Actions ─────────────────────────────────────── */}
            <div className="grid grid-cols-4 gap-3">
                <QuickAction
                    onClick={() => navigate('/parent/fees')}
                    label="Pay Fees"
                    color="bg-green-100 text-green-600"
                    icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>}
                />
                <QuickAction
                    onClick={() => navigate('/parent/academic')}
                    label="Grades"
                    color="bg-blue-100 text-blue-600"
                    icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>}
                />
                <QuickAction
                    onClick={() => navigate('/parent/attendance')}
                    label="Attendance"
                    color="bg-purple-100 text-purple-600"
                    icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>}
                />
                <QuickAction
                    onClick={() => navigate('/parent/engagement')}
                    label="Messages"
                    color="bg-pink-100 text-pink-600"
                    icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>}
                />
            </div>

            {/* ── Children Cards ─────────────────────────────────────── */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-50 dark:border-gray-700">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">My Children</h3>
                    <button onClick={() => navigate('/parent/children')} className="text-xs font-bold text-purple-600" style={{ color: 'var(--primary-color)' }}>See All →</button>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-700">
                    {children.map((child, i) => {
                        const sc = statusColor(child.today_status);
                        const initials = (child.name || '?').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
                        return (
                            <button
                                key={child.id}
                                onClick={() => navigate('/parent/children')}
                                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors active:bg-gray-100 text-left"
                            >
                                <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0" style={{ background: avatarPalette[i % avatarPalette.length] }}>
                                    {initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-800 dark:text-gray-100 truncate">{child.name}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">{child.grade_level}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black" style={{ background: sc.bg, color: sc.text }}>
                                        {child.today_status || 'No data'}
                                    </span>
                                    {child.pending_homework > 0 && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-600">
                                            {child.pending_homework} HW
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Stats Row ─────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Children</p>
                    <p className="text-3xl font-black text-gray-800 dark:text-gray-100 mt-1">{children.length}</p>
                    <p className="text-xs text-gray-400 mt-0.5">enrolled students</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Today</p>
                    <p className="text-3xl font-black text-green-600 mt-1">
                        {children.filter(c => c.today_status === 'Present').length}/{children.length}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">present today</p>
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;
