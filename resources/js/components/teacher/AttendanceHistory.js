import React, { useState, useEffect } from 'react';

const rateBadge = (r) => {
    if (r >= 90) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (r >= 75) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
};

const AttendanceHistory = () => {
    const [classes,      setClasses]      = useState([]);
    const [classId,      setClassId]      = useState('');
    const [from,         setFrom]         = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0]; });
    const [to,           setTo]           = useState(new Date().toISOString().split('T')[0]);
    const [data,         setData]         = useState(null);
    const [loading,      setLoading]      = useState(false);
    const [classLoading, setClassLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await window.axios.get('/api/teacher/classes');
                setClasses(res.data);
                if (res.data.length > 0) setClassId(String(res.data[0].id));
            } catch { /* silent */ }
            finally { setClassLoading(false); }
        })();
    }, []);

    useEffect(() => { if (classId) load(); }, [classId, from, to]);

    const load = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ class_id: classId, from, to });
            const res = await window.axios.get(`/api/teacher/attendance/history?${params}`);
            setData(res.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    const summary = data?.summary ?? [];
    const daily   = data?.daily   ?? [];

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Teacher <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Attendance History</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Attendance History</h1>
                </div>
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap gap-2 items-end flex-shrink-0">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Class</label>
                    <select value={classId} onChange={e => setClassId(e.target.value)}
                        className="px-2.5 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {classLoading ? <option>Loading…</option> : classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">From</label>
                    <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                        className="px-2.5 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">To</label>
                    <input type="date" value={to} max={new Date().toISOString().split('T')[0]} onChange={e => setTo(e.target.value)}
                        className="px-2.5 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
            </div>

            {/* Daily bar chart — compact overview */}
            {daily.length > 0 && (
                <div className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Daily Attendance Rate</p>
                    <div className="flex items-end gap-0.5 h-16 overflow-x-auto">
                        {daily.map((d, i) => {
                            const pct = d.total > 0 ? Math.round(((d.present + d.late) / d.total) * 100) : 0;
                            return (
                                <div key={i} className="flex-1 min-w-[16px] flex flex-col items-center gap-0.5" title={`${d.date}: ${pct}%`}>
                                    <div className="w-full rounded-t" style={{ height: `${pct}%`, minHeight: 2, background: pct >= 90 ? '#10b981' : pct >= 75 ? '#f59e0b' : '#ef4444' }}/>
                                    <span className="text-[7px] text-slate-300 dark:text-slate-600 whitespace-nowrap">{d.date.slice(5)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Student summary table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Loading…</div>
                ) : summary.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-slate-400 text-sm">No attendance records for this period.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-left border-collapse" style={{ minWidth: 580 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Adm No</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Student</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-center">Present</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-12 text-center">Late</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-14 text-center">Absent</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-14 text-center">Excused</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary.map((s, i) => (
                                        <tr key={s.student_id}
                                            className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                                i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                            }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">
                                                {String(i + 1).padStart(2, '0')}
                                            </td>
                                            <td className="px-3 py-2 font-mono text-xs text-slate-500 dark:text-slate-400 tracking-wide">
                                                {s.admission_number}
                                            </td>
                                            <td className="px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                {s.name}
                                            </td>
                                            <td className="px-3 py-2 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">{s.present}</td>
                                            <td className="px-3 py-2 text-center text-xs font-bold text-amber-600 dark:text-amber-400">{s.late}</td>
                                            <td className="px-3 py-2 text-center text-xs font-bold text-red-500 dark:text-red-400">{s.absent}</td>
                                            <td className="px-3 py-2 text-center text-xs font-bold text-blue-500 dark:text-blue-400">{s.excused}</td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${rateBadge(s.rate)}`}>
                                                    {s.rate}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{summary.length} student{summary.length !== 1 ? 's' : ''}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AttendanceHistory;
