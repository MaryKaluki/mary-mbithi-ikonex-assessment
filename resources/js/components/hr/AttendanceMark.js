import React, { useState, useEffect, useCallback } from 'react';

const STATUSES = ['Present', 'Late', 'Absent', 'Excused'];

const statusColor = (s) => {
    if (s === 'Present') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (s === 'Late')    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    if (s === 'Absent')  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-gray-300';
};

const AttendanceMark = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm]     = useState('');
    const [department, setDepartment]     = useState('all');
    const [staff, setStaff]               = useState([]);
    const [statusMap, setStatusMap]       = useState({});
    const [departments, setDepartments]   = useState([]);
    const [loading, setLoading]           = useState(true);
    const [saving, setSaving]             = useState(false);
    const [error, setError]               = useState('');

    const fetchStaff = useCallback(() => {
        setLoading(true);
        setError('');
        window.axios.get(`/api/hr/attendance/mark?date=${selectedDate}`)
            .then(res => {
                const members = res.data.staff;
                setStaff(members);
                const map = {};
                members.forEach(m => { map[m.id] = m.status || 'Present'; });
                setStatusMap(map);
                setDepartments([...new Set(members.map(m => m.department).filter(Boolean))].sort());
            })
            .catch(() => setError('Failed to load staff attendance.'))
            .finally(() => setLoading(false));
    }, [selectedDate]);

    useEffect(() => { fetchStaff(); }, [fetchStaff]);

    const saveAttendance = () => {
        setSaving(true);
        setError('');
        const records = staff.map(m => ({ user_id: m.id, status: statusMap[m.id] || 'Present' }));
        window.axios.post('/api/hr/attendance/mark', { date: selectedDate, records })
            .then(() => window.showToast?.('success', 'Attendance saved successfully.'))
            .catch(() => setError('Failed to save attendance.'))
            .finally(() => setSaving(false));
    };

    const filteredStaff = staff.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase())
            || (s.role || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchDept = department === 'all' || s.department === department;
        return matchSearch && matchDept;
    });

    const stats = STATUSES.reduce((acc, s) => {
        acc[s] = staff.filter(m => statusMap[m.id] === s).length;
        return acc;
    }, {});

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        HR <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Mark Attendance</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">
                        Mark Staff Attendance
                        {!loading && <span className="ml-2 text-xs font-normal text-slate-400">— {filteredStaff.length} staff</span>}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <input type="date" value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="px-3 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"/>
                    <button onClick={saveAttendance} disabled={saving || staff.length === 0}
                        className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors">
                        {saving ? 'Saving…' : 'Save Attendance'}
                    </button>
                </div>
            </div>

            {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md flex-shrink-0">{error}</p>}

            {/* Stats strip */}
            <div className="flex gap-2 flex-shrink-0">
                {STATUSES.map(s => (
                    <div key={s} className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${
                        s === 'Present' ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' :
                        s === 'Late'    ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20' :
                        s === 'Absent'  ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' :
                        'border-slate-200 bg-slate-50 dark:border-gray-600 dark:bg-gray-800'
                    }`}>
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{stats[s]}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{s}</span>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-shrink-0">
                <div className="flex-1 relative">
                    <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input type="text" placeholder="Search by name or role…"
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                </div>
                <select value={department} onChange={e => setDepartment(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-200 w-40">
                    <option value="all">All Departments</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Loading staff directory…</div>
                ) : filteredStaff.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-slate-400 text-sm">No staff members match your filters.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-left border-collapse" style={{ minWidth: 600 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Staff Member</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-32">Department</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-center">Status</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-36 text-center">Mark</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStaff.map((member, i) => {
                                        const current = statusMap[member.id] || 'Present';
                                        return (
                                            <tr key={member.id}
                                                className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                                    i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                                }`}>
                                                <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">
                                                    {String(i + 1).padStart(2, '0')}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{member.name}</span>
                                                    <span className="ml-2 text-[10px] text-slate-400 dark:text-slate-500">{member.role}</span>
                                                </td>
                                                <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{member.department || '—'}</td>
                                                <td className="px-3 py-2 text-center">
                                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${statusColor(current)}`}>
                                                        {current}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {STATUSES.map(status => (
                                                            <button key={status}
                                                                onClick={() => setStatusMap(prev => ({ ...prev, [member.id]: status }))}
                                                                title={status}
                                                                className={`w-7 h-7 flex items-center justify-center rounded text-[10px] font-black transition-colors ${
                                                                    current === status
                                                                        ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-gray-900'
                                                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                                                                }`}>
                                                                {status.charAt(0)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{filteredStaff.length} staff member{filteredStaff.length !== 1 ? 's' : ''}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AttendanceMark;
