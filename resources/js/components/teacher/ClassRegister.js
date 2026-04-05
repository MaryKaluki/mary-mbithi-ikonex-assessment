import React, { useState, useEffect } from 'react';

const STATUS_OPTS = ['Present', 'Late', 'Absent', 'Excused'];
const STATUS_COLOR = {
    Present: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    Late:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    Absent:  'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300',
    Excused: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
};

const ClassRegister = () => {
    const [classes, setClasses]         = useState([]);
    const [classId, setClassId]         = useState('');
    const [date, setDate]               = useState(new Date().toISOString().split('T')[0]);
    const [rows, setRows]               = useState([]);
    const [alreadyMarked, setAlreadyMarked] = useState(false);
    const [classLoading, setClassLoading] = useState(true);
    const [loading, setLoading]         = useState(false);
    const [saving, setSaving]           = useState(false);
    const [saved, setSaved]             = useState(false);

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

    useEffect(() => {
        if (!classId) return;
        load();
    }, [classId, date]);

    const load = async () => {
        setLoading(true);
        setSaved(false);
        try {
            const res = await window.axios.get(`/api/teacher/attendance/today?class_id=${classId}&date=${date}`);
            setRows(res.data.students.map(s => ({ ...s })));
            setAlreadyMarked(res.data.already_marked);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    const setStatus = (idx, status) => {
        setRows(r => r.map((row, i) => i === idx ? { ...row, status } : row));
    };

    const setNotes = (idx, notes) => {
        setRows(r => r.map((row, i) => i === idx ? { ...row, notes } : row));
    };

    const markAll = (status) => setRows(r => r.map(row => ({ ...row, status })));

    const handleSave = async () => {
        setSaving(true);
        try {
            await window.axios.post('/api/teacher/attendance', {
                class_id: classId,
                date,
                attendance: rows.map(r => ({
                    student_id: r.student_id,
                    status: r.status,
                    notes: r.notes,
                })),
            });
            setSaved(true);
            setAlreadyMarked(true);
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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Class Register</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mark daily attendance for your classes</p>
                </div>
                {alreadyMarked && !saved && (
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                        Attendance already marked — editing
                    </span>
                )}
                {saved && (
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        Saved ✓
                    </span>
                )}
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
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Date</label>
                    <input type="date" value={date} max={new Date().toISOString().split('T')[0]}
                        onChange={e => setDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"/>
                </div>
            </div>

            {/* Summary */}
            {rows.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Present', count: present, color: 'text-green-600' },
                        { label: 'Late',    count: late,    color: 'text-yellow-600' },
                        { label: 'Absent',  count: absent,  color: 'text-red-500' },
                    ].map(s => (
                        <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 text-center">
                            <p className={`text-3xl font-extrabold ${s.color}`}>{s.count}</p>
                            <p className="text-xs font-black uppercase text-gray-400 tracking-wider mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Mark all row */}
            {rows.length > 0 && (
                <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-gray-400 tracking-wider mr-1">Mark All:</span>
                    {STATUS_OPTS.map(s => (
                        <button key={s} onClick={() => markAll(s)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${STATUS_COLOR[s]} border-transparent hover:border-current`}>
                            {s}
                        </button>
                    ))}
                </div>
            )}

            {/* Register Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">Loading students…</div>
                ) : rows.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 text-sm">No students found in this class.</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[600px]">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-[10px] font-black uppercase text-gray-400 tracking-wider">#</th>
                                        <th className="px-6 py-3 text-[10px] font-black uppercase text-gray-400 tracking-wider">Student</th>
                                        <th className="px-6 py-3 text-[10px] font-black uppercase text-gray-400 tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-[10px] font-black uppercase text-gray-400 tracking-wider">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                    {rows.map((row, i) => (
                                        <tr key={row.student_id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                                            <td className="px-6 py-3 text-xs font-bold text-gray-400">{i + 1}</td>
                                            <td className="px-6 py-3">
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{row.name}</p>
                                                <p className="text-xs text-gray-400">{row.admission_number}</p>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex gap-1">
                                                    {STATUS_OPTS.map(s => (
                                                        <button key={s} onClick={() => setStatus(i, s)}
                                                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${row.status === s ? STATUS_COLOR[s] + ' ring-2 ring-current ring-offset-1' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                                                            {s[0]}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <input value={row.notes} onChange={e => setNotes(i, e.target.value)}
                                                    placeholder="Optional note…"
                                                    className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/40"/>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                            <button onClick={handleSave} disabled={saving}
                                className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-60 shadow-lg shadow-primary/20">
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
