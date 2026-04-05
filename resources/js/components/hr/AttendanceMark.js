import React, { useState, useEffect, useCallback } from 'react';

const STATUSES = ['Present', 'Late', 'Absent', 'Excused'];

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
                const depts = [...new Set(members.map(m => m.department).filter(Boolean))].sort();
                setDepartments(depts);
            })
            .catch(() => setError('Failed to load staff attendance.'))
            .finally(() => setLoading(false));
    }, [selectedDate]);

    useEffect(() => { fetchStaff(); }, [fetchStaff]);

    const updateStatus = (id, newStatus) => {
        setStatusMap(prev => ({ ...prev, [id]: newStatus }));
    };

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

    const stats = {
        Present: staff.filter(s => statusMap[s.id] === 'Present').length,
        Late:    staff.filter(s => statusMap[s.id] === 'Late').length,
        Absent:  staff.filter(s => statusMap[s.id] === 'Absent').length,
        Excused: staff.filter(s => statusMap[s.id] === 'Excused').length,
    };

    const getInitials = name =>
        name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Mark Staff Attendance</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Record daily attendance for all staff members.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button
                        onClick={saveAttendance}
                        disabled={saving || staff.length === 0}
                        className="px-6 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
                    >
                        {saving ? 'Saving...' : 'Save Attendance'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-3 border border-gray-200 rounded-lg text-gray-700 text-sm dark:border-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800">
                    {error}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {STATUSES.map(s => (
                    <div key={s} className="bg-white p-4 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats[s]}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{s}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 dark:bg-gray-800 dark:border-gray-700">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search by name or role..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                </div>
                <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                    <option value="all">All Departments</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>

            {/* Staff List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-sm">Loading staff directory...</p>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider dark:bg-gray-700/50 dark:text-gray-400">
                                    <tr>
                                        <th className="px-6 py-4">Staff Member</th>
                                        <th className="px-6 py-4 hidden sm:table-cell">Department</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-center">Mark</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {filteredStaff.map(member => {
                                        const current = statusMap[member.id] || 'Present';
                                        return (
                                            <tr key={member.id} className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-700/50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm dark:bg-gray-600 dark:text-gray-300">
                                                            {getInitials(member.name)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{member.name}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{member.role}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 hidden sm:table-cell">
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-semibold dark:bg-gray-700 dark:text-gray-300">
                                                        {member.department || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-3 py-1 border border-gray-300 rounded text-xs font-bold uppercase tracking-wide text-gray-600 dark:border-gray-600 dark:text-gray-300">
                                                        {current}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {STATUSES.map(status => (
                                                            <button
                                                                key={status}
                                                                onClick={() => updateStatus(member.id, status)}
                                                                title={status}
                                                                className={`w-8 h-8 flex items-center justify-center rounded text-xs font-black transition-colors ${
                                                                    current === status
                                                                        ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                                                                }`}
                                                            >
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
                    </div>

                    {filteredStaff.length === 0 && (
                        <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400 font-semibold">No staff members match your filters.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AttendanceMark;
