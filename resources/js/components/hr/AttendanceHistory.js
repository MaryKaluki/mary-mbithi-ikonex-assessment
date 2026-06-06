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

    const withRate    = attendanceData.filter(s => s.rate !== null);
    const avgRate     = withRate.length > 0 ? Math.round(withRate.reduce((a, b) => a + (b.rate || 0), 0) / withRate.length) : 0;
    const perfect     = attendanceData.filter(s => s.rate === 100).length;
    const belowEighty = attendanceData.filter(s => s.rate !== null && s.rate < 80).length;

    const rateBadge = (rate) => {
        if (rate === null) return 'text-slate-300 dark:text-slate-600';
        if (rate >= 90) return 'text-emerald-600 dark:text-emerald-400 font-bold';
        if (rate >= 80) return 'text-amber-600 dark:text-amber-400 font-bold';
        return 'text-red-600 dark:text-red-400 font-bold';
    };

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        HR <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Attendance History</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">
                        Attendance History
                        {!loading && <span className="ml-2 text-xs font-normal text-slate-400">— {filteredData.length} staff</span>}
                    </h1>
                </div>
                <input type="month" value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"/>
            </div>

            {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md flex-shrink-0">{error}</p>}

            {/* Summary strip */}
            <div className="flex gap-2 flex-shrink-0">
                {[
                    { label: 'Total Staff',       value: attendanceData.length },
                    { label: 'Avg. Attendance',   value: withRate.length > 0 ? `${avgRate}%` : '—' },
                    { label: 'Perfect',           value: perfect },
                    { label: 'Below 80%',         value: belowEighty, warn: belowEighty > 0 },
                ].map(card => (
                    <div key={card.label} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-md">
                        <span className={`text-base font-extrabold ${card.warn ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-100'}`}>
                            {card.value}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{card.label}</span>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div className="flex-shrink-0 relative">
                <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input type="text" placeholder="Search by name or role…"
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
            </div>

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Loading history…</div>
                ) : (
                    <>
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-left border-collapse" style={{ minWidth: 620 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Staff Member</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Present</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-center">Late</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-center">Absent</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-center">Excused</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.length === 0 ? (
                                        <tr><td colSpan="7" className="px-3 py-12 text-center text-sm text-slate-400">No attendance records for this period.</td></tr>
                                    ) : filteredData.map((s, i) => (
                                        <tr key={s.id}
                                            className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                                i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                            }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">
                                                {String(i + 1).padStart(2, '0')}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{s.name}</span>
                                                <span className="ml-2 text-[10px] text-slate-400 dark:text-slate-500">{s.role}</span>
                                            </td>
                                            <td className="px-3 py-2 text-center text-xs font-bold text-slate-700 dark:text-slate-300">{s.present}</td>
                                            <td className="px-3 py-2 text-center text-xs font-bold text-amber-600 dark:text-amber-400">{s.late}</td>
                                            <td className="px-3 py-2 text-center text-xs font-bold text-red-600 dark:text-red-400">{s.absent}</td>
                                            <td className="px-3 py-2 text-center text-xs font-bold text-slate-500 dark:text-slate-400">{s.excused}</td>
                                            <td className={`px-3 py-2 text-center text-xs font-mono ${rateBadge(s.rate)}`}>
                                                {s.rate !== null ? `${s.rate}%` : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{filteredData.length} staff member{filteredData.length !== 1 ? 's' : ''}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AttendanceHistory;
