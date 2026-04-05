import React, { useEffect, useState } from 'react';

const palette = ['#6366f1','#ec4899','#10b981','#f59e0b','#3b82f6','#8b5cf6'];

const statusStyle = (s) => {
    if (s === 'Present') return 'bg-green-100 text-green-700';
    if (s === 'Absent')  return 'bg-red-100 text-red-700';
    if (s === 'Late')    return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-500';
};

const ParentChildren = () => {
    const [children, setChildren] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        fetch('/api/parent/children', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => { setChildren(d.children || []); setLoading(false); })
            .catch(() => { setError('Failed to load children.'); setLoading(false); });
    }, []);

    if (loading) return (
        <div className="space-y-3 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-2xl"></div>)}
        </div>
    );

    if (error) return (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl text-red-600 text-sm">{error}</div>
    );

    if (children.length === 0) return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            </div>
            <p className="font-bold text-gray-600 dark:text-gray-300">No children linked</p>
            <p className="text-xs text-gray-400 mt-1">Contact your school administrator</p>
        </div>
    );

    return (
        <div className="space-y-3">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest px-1">{children.length} Student{children.length !== 1 ? 's' : ''} Enrolled</p>

            {children.map((child, i) => {
                const initials = (child.name || '?').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
                const isOpen = expanded === child.id;
                const balanceDue = child.fee_balance > 0;

                return (
                    <div key={child.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all">
                        {/* Main row */}
                        <button
                            className="w-full flex items-center gap-4 px-5 py-4 active:bg-gray-50 dark:active:bg-gray-700 transition-colors text-left"
                            onClick={() => setExpanded(isOpen ? null : child.id)}
                        >
                            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0 shadow-sm" style={{ background: palette[i % palette.length] }}>
                                {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-800 dark:text-gray-100">{child.name}</p>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    <span className="text-xs text-gray-400 dark:text-gray-500">{child.grade_level}</span>
                                    {child.admission_number && (
                                        <span className="text-xs text-gray-300 dark:text-gray-600">· {child.admission_number}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                {child.today_status && (
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${statusStyle(child.today_status)}`}>
                                        {child.today_status}
                                    </span>
                                )}
                                {balanceDue && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
                                        KES {Number(child.fee_balance).toLocaleString()} due
                                    </span>
                                )}
                            </div>
                            <svg className={`w-4 h-4 text-gray-300 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </button>

                        {/* Expanded stats */}
                        {isOpen && (
                            <div className="border-t border-gray-50 dark:border-gray-700 px-5 py-4 grid grid-cols-3 gap-4 bg-gray-50/50 dark:bg-gray-700/30">
                                <div className="text-center">
                                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Attendance</p>
                                    <p className={`text-xl font-black mt-0.5 ${child.attendance_rate >= 80 ? 'text-green-600' : 'text-red-500'}`}>
                                        {child.attendance_rate !== null ? `${child.attendance_rate}%` : '—'}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Fee Balance</p>
                                    <p className={`text-xl font-black mt-0.5 ${balanceDue ? 'text-red-500' : 'text-green-600'}`}>
                                        {balanceDue ? `KES ${Number(child.fee_balance).toLocaleString()}` : 'Paid'}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Today</p>
                                    <p className={`text-xl font-black mt-0.5 ${statusStyle(child.today_status).includes('green') ? 'text-green-600' : 'text-gray-500'}`}>
                                        {child.today_status || '—'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ParentChildren;
