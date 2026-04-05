import React, { useState, useEffect } from 'react';

const AttendanceHistory = () => {
    const [classes, setClasses]   = useState([]);
    const [classId, setClassId]   = useState('');
    const [from, setFrom]         = useState(() => {
        const d = new Date(); d.setDate(1);
        return d.toISOString().split('T')[0];
    });
    const [to, setTo]             = useState(new Date().toISOString().split('T')[0]);
    const [data, setData]         = useState(null);
    const [loading, setLoading]   = useState(false);
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

    const rateColor = (r) => r >= 90 ? 'text-green-600' : r >= 75 ? 'text-yellow-600' : 'text-red-500';

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Attendance History</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">View attendance trends for your classes</p>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Class</label>
                    <select value={classId} onChange={e => setClassId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40">
                        {classLoading ? <option>Loading…</option> : classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">From</label>
                    <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"/>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">To</label>
                    <input type="date" value={to} max={new Date().toISOString().split('T')[0]} onChange={e => setTo(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"/>
                </div>
            </div>

            {/* Daily bar chart */}
            {daily.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                    <p className="text-xs font-black uppercase text-gray-400 tracking-wider mb-4">Daily Overview</p>
                    <div className="flex items-end gap-1 h-20 overflow-x-auto">
                        {daily.map((d, i) => {
                            const pct = d.total > 0 ? Math.round(((d.present + d.late) / d.total) * 100) : 0;
                            return (
                                <div key={i} className="flex-1 min-w-[20px] flex flex-col items-center gap-1" title={`${d.date}: ${pct}%`}>
                                    <div className="w-full rounded-t" style={{ height: `${pct}%`, minHeight: 2, background: pct >= 90 ? '#22c55e' : pct >= 75 ? '#eab308' : '#ef4444' }}/>
                                    <span className="text-[8px] text-gray-300 dark:text-gray-600 rotate-90 origin-center whitespace-nowrap">{d.date.slice(5)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Student summary table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">Loading…</div>
                ) : summary.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 text-sm">No attendance records for this period.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[640px]">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-[10px] font-black uppercase text-gray-400 tracking-wider">Student</th>
                                    <th className="px-6 py-3 text-[10px] font-black uppercase text-gray-400 tracking-wider text-center">Present</th>
                                    <th className="px-6 py-3 text-[10px] font-black uppercase text-gray-400 tracking-wider text-center">Late</th>
                                    <th className="px-6 py-3 text-[10px] font-black uppercase text-gray-400 tracking-wider text-center">Absent</th>
                                    <th className="px-6 py-3 text-[10px] font-black uppercase text-gray-400 tracking-wider text-center">Excused</th>
                                    <th className="px-6 py-3 text-[10px] font-black uppercase text-gray-400 tracking-wider text-center">Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {summary.map(s => (
                                    <tr key={s.student_id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                                        <td className="px-6 py-3">
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{s.name}</p>
                                            <p className="text-xs text-gray-400">{s.admission_number}</p>
                                        </td>
                                        <td className="px-6 py-3 text-center text-sm font-bold text-green-600">{s.present}</td>
                                        <td className="px-6 py-3 text-center text-sm font-bold text-yellow-600">{s.late}</td>
                                        <td className="px-6 py-3 text-center text-sm font-bold text-red-500">{s.absent}</td>
                                        <td className="px-6 py-3 text-center text-sm font-bold text-blue-500">{s.excused}</td>
                                        <td className="px-6 py-3 text-center">
                                            <span className={`text-sm font-extrabold ${rateColor(s.rate)}`}>{s.rate}%</span>
                                            <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mt-1 overflow-hidden">
                                                <div className="h-full rounded-full" style={{ width: `${s.rate}%`, background: s.rate >= 90 ? '#22c55e' : s.rate >= 75 ? '#eab308' : '#ef4444' }}/>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendanceHistory;
