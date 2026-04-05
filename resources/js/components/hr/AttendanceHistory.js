import React, { useState, useEffect } from 'react';

const AttendanceHistory = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [searchTerm, setSearchTerm]       = useState('');
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState('');

    useEffect(() => {
        setLoading(true);
        setError('');
        const [year, month] = selectedMonth.split('-');
        window.axios.get(`/api/hr/attendance/history?year=${year}&month=${parseInt(month)}`)
            .then(res => setAttendanceData(res.data.staff))
            .catch(() => setError('Failed to load attendance history.'))
            .finally(() => setLoading(false));
    }, [selectedMonth]);

    const filteredData = attendanceData.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.role || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const withRate   = attendanceData.filter(s => s.rate !== null);
    const avgRate    = withRate.length > 0
        ? Math.round(withRate.reduce((a, b) => a + (b.rate || 0), 0) / withRate.length)
        : 0;
    const perfect    = attendanceData.filter(s => s.rate === 100).length;
    const belowEighty = attendanceData.filter(s => s.rate !== null && s.rate < 80).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Attendance History</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Monthly attendance records and reports.</p>
                </div>
                <input
                    type="month"
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
            </div>

            {error && (
                <div className="p-3 border border-gray-200 bg-gray-50 rounded-lg text-gray-700 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">
                    {error}
                </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Staff',       value: attendanceData.length },
                    { label: 'Avg. Attendance',   value: withRate.length > 0 ? `${avgRate}%` : '—' },
                    { label: 'Perfect Attendance', value: perfect },
                    { label: 'Below 80%',         value: belowEighty },
                ].map(card => (
                    <div key={card.label} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1 dark:text-gray-400">{card.label}</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search staff..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-12 text-sm text-gray-500 dark:text-gray-400">Loading history...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto dark:bg-gray-800 dark:border-gray-700">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-4">Staff Member</th>
                                <th className="px-6 py-4 text-center">Present</th>
                                <th className="px-6 py-4 text-center">Late</th>
                                <th className="px-6 py-4 text-center">Absent</th>
                                <th className="px-6 py-4 text-center">Excused</th>
                                <th className="px-6 py-4 text-center">Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                                        No attendance records for this period.
                                    </td>
                                </tr>
                            ) : filteredData.map(s => (
                                <tr key={s.id} className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm dark:bg-gray-600 dark:text-gray-300">
                                                {s.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-800 dark:text-gray-100">{s.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{s.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-sm text-gray-700 dark:text-gray-300">{s.present}</td>
                                    <td className="px-6 py-4 text-center font-bold text-sm text-gray-700 dark:text-gray-300">{s.late}</td>
                                    <td className="px-6 py-4 text-center font-bold text-sm text-gray-700 dark:text-gray-300">{s.absent}</td>
                                    <td className="px-6 py-4 text-center font-bold text-sm text-gray-700 dark:text-gray-300">{s.excused}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-3 py-1 border border-gray-300 rounded text-sm font-bold text-gray-600 dark:border-gray-600 dark:text-gray-300">
                                            {s.rate !== null ? `${s.rate}%` : '—'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AttendanceHistory;
