import React, { useState, useEffect } from 'react';

const STATUS_OPTS = ['Present', 'Late', 'Absent', 'Excused'];

const statusColor = (s) => {
    if (s === 'Present') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (s === 'Late')    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    if (s === 'Absent')  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
};

const ClassRegister = () => {
    const [classes,      setClasses]      = useState([]);
    const [classId,      setClassId]      = useState('');
    const [date,         setDate]         = useState(new Date().toISOString().split('T')[0]);
    const [rows,         setRows]         = useState([]);
    const [alreadyMarked, setAlreadyMarked] = useState(false);
    const [classLoading, setClassLoading] = useState(true);
    const [loading,      setLoading]      = useState(false);
    const [saving,       setSaving]       = useState(false);
    const [saved,        setSaved]        = useState(false);

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

    useEffect(() => { if (classId) load(); }, [classId, date]);

    const load = async () => {
        setLoading(true); setSaved(false);
        try {
            const res = await window.axios.get(`/api/teacher/attendance/today?class_id=${classId}&date=${date}`);
            setRows(res.data.students.map(s => ({ ...s })));
            setAlreadyMarked(res.data.already_marked);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    const setStatus = (idx, status) => setRows(r => r.map((row, i) => i === idx ? { ...row, status } : row));
    const setNotes  = (idx, notes)  => setRows(r => r.map((row, i) => i === idx ? { ...row, notes  } : row));
    const markAll   = (status) => setRows(r => r.map(row => ({ ...row, status })));

    const handleSave = async () => {
        setSaving(true);
        try {
            await window.axios.post('/api/teacher/attendance', {
                class_id: classId, date,
                attendance: rows.map(r => ({ student_id: r.student_id, status: r.status, notes: r.notes })),
            });
            setSaved(true); setAlreadyMarked(true);
            window.showToast?.('success', 'Attendance saved.');
        } catch (err) {
            window.showToast?.('error', err.response?.data?.message || 'Failed to save attendance.');
        } finally {
            setSaving(false);
        }
    };

    const present = rows.filter(r => r.status === 'Present').length;
    const late    = rows.filter(r => r.status === 'Late').length;
    const absent  = rows.filter(r => r.status === 'Absent').length;

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Teacher <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Class Register</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Class Register</h1>
                </div>
                <div className="flex items-center gap-2">
                    {alreadyMarked && !saved && (
                        <span className="inline-block px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            Editing — already marked
                        </span>
                    )}
                    {saved && (
                        <span className="inline-block px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            Saved ✓
                        </span>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2 flex-shrink-0">
                <select value={classId} onChange={e => setClassId(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-200 w-40">
                    {classLoading ? <option>Loading…</option> : classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input type="date" value={date} max={new Date().toISOString().split('T')[0]}
                    onChange={e => setDate(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"/>
                {rows.length > 0 && (
                    <>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 self-center ml-2">Mark All:</span>
                        {STATUS_OPTS.map(s => (
                            <button key={s} onClick={() => markAll(s)}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${statusColor(s)}`}>
                                {s}
                            </button>
                        ))}
                    </>
                )}
                {rows.length > 0 && (
                    <div className="flex items-center gap-2 ml-auto">
                        {[
                            { label: 'P', count: present, cls: 'text-emerald-600 dark:text-emerald-400' },
                            { label: 'L', count: late,    cls: 'text-amber-600 dark:text-amber-400' },
                            { label: 'A', count: absent,  cls: 'text-red-600 dark:text-red-400' },
                        ].map(s => (
                            <span key={s.label} className={`text-xs font-bold ${s.cls}`}>{s.label}: {s.count}</span>
                        ))}
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Loading students…</div>
                ) : rows.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-slate-400 text-sm">No students found in this class.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-left border-collapse" style={{ minWidth: 600 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Adm No</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Student</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-36">Status</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, i) => (
                                        <tr key={row.student_id}
                                            className={`border-b border-slate-100 dark:border-gray-700/60 transition-colors ${
                                                i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                            }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">
                                                {String(i + 1).padStart(2, '0')}
                                            </td>
                                            <td className="px-3 py-2 font-mono text-xs text-slate-500 dark:text-slate-400 tracking-wide">
                                                {row.admission_number}
                                            </td>
                                            <td className="px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                {row.name}
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex gap-1">
                                                    {STATUS_OPTS.map(s => (
                                                        <button key={s} onClick={() => setStatus(i, s)}
                                                            className={`w-7 h-7 flex items-center justify-center rounded text-[10px] font-black transition-colors ${
                                                                row.status === s
                                                                    ? statusColor(s)
                                                                    : 'bg-slate-100 text-slate-400 dark:bg-gray-700 dark:text-gray-500 hover:bg-slate-200 dark:hover:bg-gray-600'
                                                            }`}>
                                                            {s[0]}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <input value={row.notes || ''} onChange={e => setNotes(i, e.target.value)}
                                                    placeholder="Optional note…"
                                                    className="w-full px-2 py-1 text-xs border border-slate-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-300"/>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30 flex items-center justify-between">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{rows.length} students</p>
                            <button onClick={handleSave} disabled={saving}
                                className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">
                                {saving ? 'Saving…' : 'Save Attendance'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ClassRegister;
