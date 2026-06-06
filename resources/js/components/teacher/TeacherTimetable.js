import { useState, useEffect, useRef } from 'react';

const DAYS      = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAY_SHORT = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri' };

const DEFAULT_SLOTS = [
    { start: '07:30', end: '08:20' },
    { start: '08:20', end: '09:10' },
    { start: '09:10', end: '10:00' },
    { start: '10:00', end: '10:30' },
    { start: '10:30', end: '11:20' },
    { start: '11:20', end: '12:10' },
    { start: '12:10', end: '13:00' },
    { start: '13:00', end: '14:00' },
    { start: '14:00', end: '14:50' },
];

const TIMETABLE_TYPES = [
    { value: 'personal', label: 'Personal Schedule' },
    { value: 'class',    label: 'Class Timetable'   },
    { value: 'exams',    label: 'Exam Schedule'      },
];

const typeBadgeCls = {
    personal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    class:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    exams:    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const typeLabel = v => TIMETABLE_TYPES.find(t => t.value === v)?.label ?? v;

// ── SlotCell — inline subject editor ─────────────────────────────────────────
const SlotCell = ({ slot, subjects, onChange, disabled }) => {
    const [open, setOpen] = useState(false);
    const isBreak     = slot?.is_break;
    const subjectName = slot?.subject_name ?? null;

    if (disabled) {
        return (
            <div className="px-2 py-1.5 text-xs text-center text-slate-400 dark:text-slate-600">
                {isBreak ? 'Break' : subjectName ?? '—'}
            </div>
        );
    }

    if (open) {
        return (
            <div className="rounded border border-slate-300 dark:border-gray-500 bg-white dark:bg-gray-800 p-1 shadow-sm min-w-[130px]">
                <select autoFocus defaultValue={isBreak ? '__break__' : (slot?.subject_id ?? '')}
                    onChange={e => {
                        const val = e.target.value;
                        if (val === '') onChange(null);
                        else if (val === '__break__') onChange({ is_break: true, subject_id: null, subject_name: null });
                        else {
                            const sub = subjects.find(s => String(s.id) === val);
                            onChange(sub ? { is_break: false, subject_id: sub.id, subject_name: sub.name } : null);
                        }
                        setOpen(false);
                    }}
                    className="w-full text-xs border border-slate-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white px-1 py-0.5 focus:outline-none">
                    <option value="">Free period</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    <option value="__break__">Break</option>
                </select>
                <button onClick={() => setOpen(false)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 w-full text-right pr-0.5 mt-0.5">
                    cancel
                </button>
            </div>
        );
    }

    return (
        <button onClick={() => setOpen(true)}
            className={`w-full text-left px-2 py-1.5 rounded text-xs border transition-colors ${
                isBreak
                    ? 'border-slate-200 dark:border-gray-600 text-slate-400 dark:text-slate-500 italic'
                    : subjectName
                    ? 'border-slate-300 dark:border-gray-500 font-semibold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-gray-700/60'
                    : 'border-dashed border-slate-200 dark:border-gray-700 text-slate-300 dark:text-slate-600 hover:border-slate-400 hover:text-slate-500'
            }`}>
            {isBreak ? 'Break' : (subjectName ?? '+ Add')}
        </button>
    );
};

// ── TimeCell — editable start/end time ───────────────────────────────────────
const TimeCell = ({ startTime, endTime, onChangeStart, onChangeEnd, onDelete, autoEdit }) => {
    const [editing, setEditing] = useState(!!autoEdit);
    const [valStart, setValStart] = useState(startTime);
    const [valEnd,   setValEnd]   = useState(endTime || '');
    const startRef = useRef(null);

    useEffect(() => { if (editing && startRef.current) startRef.current.focus(); }, [editing]);
    useEffect(() => { setValStart(startTime); }, [startTime]);
    useEffect(() => { setValEnd(endTime || ''); }, [endTime]);

    const timeCls = 'w-[4.5rem] text-xs border border-slate-300 dark:border-gray-500 rounded px-1 py-0.5 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500';

    const commit = () => {
        const s = valStart.trim();
        if (s && s !== startTime) onChangeStart(s);
        if (valEnd !== (endTime || '')) onChangeEnd(valEnd || null);
        setEditing(false);
    };

    if (editing) {
        return (
            <div className="flex flex-col gap-1 py-0.5">
                <div className="flex items-center gap-1">
                    <input ref={startRef} type="time" value={valStart}
                        onChange={e => setValStart(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter')  commit();
                            if (e.key === 'Escape') { setValStart(startTime); setValEnd(endTime || ''); setEditing(false); }
                        }}
                        className={timeCls}/>
                    <span className="text-[10px] text-slate-400">–</span>
                    <input type="time" value={valEnd}
                        onChange={e => setValEnd(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter')  commit();
                            if (e.key === 'Escape') { setValStart(startTime); setValEnd(endTime || ''); setEditing(false); }
                        }}
                        onBlur={commit}
                        className={timeCls}/>
                </div>
                <span className="text-[9px] text-slate-400 dark:text-slate-500">start – end</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 group/time">
            <button onClick={() => setEditing(true)} title="Click to edit time"
                className="text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:underline transition-colors whitespace-nowrap">
                {startTime}{endTime ? ` – ${endTime}` : ''}
            </button>
            <button onClick={onDelete} title="Remove this row"
                className="opacity-0 group-hover/time:opacity-100 text-slate-300 dark:text-slate-600 hover:text-red-400 transition-all text-[9px] leading-none ml-0.5 mt-px">
                ✕
            </button>
        </div>
    );
};

// ── Main component ────────────────────────────────────────────────────────────
const TeacherTimetable = () => {
    const [view, setView] = useState('week');

    const authUser   = (() => { try { return JSON.parse(localStorage.getItem('auth_user') || '{}'); } catch (_) { return {}; } })();
    const schoolName = localStorage.getItem('schoolName') || '';

    const [timetable, setTimetable] = useState({});
    const [timeSlots, setTimeSlots] = useState([]);
    const [loading,   setLoading]   = useState(true);

    const [allClasses,      setAllClasses]      = useState([]);
    const [subjects,        setSubjects]        = useState([]);
    const [editClassId,     setEditClassId]     = useState('');
    const [editSlots,       setEditSlots]       = useState({});
    const [editTimeSlots,   setEditTimeSlots]   = useState(DEFAULT_SLOTS.map(s => s.start));
    const [editEndTimes,    setEditEndTimes]    = useState(Object.fromEntries(DEFAULT_SLOTS.map(s => [s.start, s.end])));
    const [editTimetableType, setEditTimetableType] = useState('personal');
    const [newRowTime,      setNewRowTime]      = useState(null);
    const [editLoading,     setEditLoading]     = useState(false);
    const [saving,          setSaving]          = useState(false);

    const todayName = DAYS[new Date().getDay() - 1] ?? 'Monday';

    useEffect(() => {
        (async () => {
            try {
                const [ttRes, classRes, subRes] = await Promise.all([
                    window.axios.get('/api/teacher/timetable'),
                    window.axios.get('/api/teacher/school-classes'),
                    window.axios.get('/api/teacher/subjects'),
                ]);
                setTimetable(ttRes.data.timetable || {});
                setTimeSlots(ttRes.data.time_slots?.length ? ttRes.data.time_slots : DEFAULT_SLOTS.map(s => s.start));
                setAllClasses(classRes.data || []);
                setSubjects(subRes.data || []);
            } catch { /* silent */ }
            finally { setLoading(false); }
        })();
    }, []);

    useEffect(() => {
        if (!editClassId) {
            setEditSlots({});
            setEditTimeSlots(DEFAULT_SLOTS.map(s => s.start));
            setEditEndTimes(Object.fromEntries(DEFAULT_SLOTS.map(s => [s.start, s.end])));
            setEditTimetableType('personal');
            setNewRowTime(null);
            return;
        }
        setEditLoading(true);
        window.axios.get(`/api/teacher/timetables/${editClassId}`)
            .then(res => {
                const slots = res.data.slots || [];
                const map = {};
                slots.forEach(s => { map[`${s.day}-${s.time_slot}`] = s; });
                setEditSlots(map);
                const savedStarts = [...new Set(slots.map(s => s.time_slot))].sort();
                if (savedStarts.length) {
                    setEditTimeSlots(savedStarts);
                    const endMap = {};
                    slots.forEach(s => { if (s.end_time) endMap[s.time_slot] = s.end_time; });
                    setEditEndTimes(endMap);
                    setEditTimetableType(slots[0]?.timetable_type || 'personal');
                } else {
                    setEditTimeSlots(DEFAULT_SLOTS.map(s => s.start));
                    setEditEndTimes(Object.fromEntries(DEFAULT_SLOTS.map(s => [s.start, s.end])));
                    setEditTimetableType('personal');
                }
                setNewRowTime(null);
            })
            .catch(() => window.showToast?.('error', 'Failed to load timetable for this class.'))
            .finally(() => setEditLoading(false));
    }, [editClassId]);

    const splitKey = key => { const i = key.indexOf('-'); return { day: key.slice(0, i), time: key.slice(i + 1) }; };

    const handleCellChange = (day, time, value) => {
        const key = `${day}-${time}`;
        setEditSlots(prev => {
            const next = { ...prev };
            if (value === null) delete next[key];
            else next[key] = value;
            return next;
        });
    };

    const handleTimeChange = (oldTime, newTime) => {
        if (!newTime || newTime === oldTime) return;
        setEditSlots(prev => {
            const next = {};
            Object.entries(prev).forEach(([key, val]) => {
                const { day, time } = splitKey(key);
                next[time === oldTime ? `${day}-${newTime}` : key] = val;
            });
            return next;
        });
        setEditTimeSlots(prev => [...new Set(prev.map(t => t === oldTime ? newTime : t))].sort());
        setEditEndTimes(prev => {
            const next = { ...prev };
            if (next[oldTime] !== undefined) { next[newTime] = next[oldTime]; delete next[oldTime]; }
            return next;
        });
        if (newRowTime === oldTime) setNewRowTime(null);
    };

    const handleEndTimeChange = (startTime, newEnd) => {
        setEditEndTimes(prev => {
            const next = { ...prev };
            if (newEnd) next[startTime] = newEnd;
            else delete next[startTime];
            return next;
        });
    };

    const handleDeleteRow = time => {
        setEditSlots(prev => {
            const next = {};
            Object.entries(prev).forEach(([key, val]) => { if (splitKey(key).time !== time) next[key] = val; });
            return next;
        });
        setEditTimeSlots(prev => prev.filter(t => t !== time));
        setEditEndTimes(prev => { const next = { ...prev }; delete next[time]; return next; });
        if (newRowTime === time) setNewRowTime(null);
    };

    const handleAddRow = () => {
        let h = 8, m = 0, attempts = 0;
        let candidate = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        while (editTimeSlots.includes(candidate) && attempts < 96) {
            m += 15;
            if (m >= 60) { m -= 60; h++; }
            if (h >= 24) h = 0;
            candidate = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            attempts++;
        }
        const [hh, mm] = candidate.split(':').map(Number);
        const endMin   = hh * 60 + mm + 50;
        const endTime  = `${String(Math.floor(endMin / 60) % 24).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;
        setEditTimeSlots(prev => [...prev, candidate].sort());
        setEditEndTimes(prev => ({ ...prev, [candidate]: endTime }));
        setNewRowTime(candidate);
    };

    const handleSave = async () => {
        if (!editClassId) return;
        setSaving(true);
        try {
            const slots = Object.entries(editSlots).map(([key, val]) => {
                const { day, time: time_slot } = splitKey(key);
                return { day, time_slot, end_time: editEndTimes[time_slot] || null, timetable_type: editTimetableType, subject_id: val.subject_id ?? null, is_break: val.is_break ?? false };
            });
            await window.axios.put(`/api/teacher/timetables/${editClassId}`, { slots });
            window.showToast?.('success', 'Timetable saved successfully.');
            const res = await window.axios.get('/api/teacher/timetable');
            setTimetable(res.data.timetable || {});
            setTimeSlots(res.data.time_slots?.length ? res.data.time_slots : DEFAULT_SLOTS.map(s => s.start));
        } catch (err) {
            window.showToast?.('error', err.response?.data?.message || 'Failed to save timetable.');
        } finally { setSaving(false); }
    };

    const displaySlots  = timeSlots.length ? timeSlots : DEFAULT_SLOTS.map(s => s.start);
    const allEmpty      = Object.values(timetable).every(d => !d.length);
    const selectedClass = allClasses.find(c => String(c.id) === editClassId);

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Teacher <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Timetable</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Timetable</h1>
                </div>
                {/* View tabs */}
                <div className="flex border-b border-slate-200 dark:border-gray-700">
                    {[{ key: 'today', label: 'Today' }, { key: 'week', label: 'Week' }, { key: 'edit', label: 'Edit' }].map(v => (
                        <button key={v.key} onClick={() => setView(v.key)}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                                view === v.key
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}>
                            {v.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Today view */}
            {view === 'today' && (
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                    <div className="flex-shrink-0 bg-slate-800 dark:bg-slate-900">
                        <div className="px-4 py-2.5 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{todayName}</span>
                            {authUser.name && <span className="text-[10px] text-slate-400">{authUser.name}</span>}
                        </div>
                    </div>
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Loading…</div>
                    ) : !(timetable[todayName] || []).filter(s => !s.is_break).length ? (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-slate-400 text-sm">No classes scheduled for today.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left border-collapse">
                                <tbody>
                                    {(timetable[todayName] || []).filter(s => !s.is_break).map((s, i) => (
                                        <tr key={i} className={`border-b border-slate-100 dark:border-gray-700/60 ${
                                            i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                        }`}>
                                            <td className="px-3 py-2.5 text-xs font-mono text-slate-400 dark:text-slate-500 whitespace-nowrap w-32">
                                                {s.time_slot}{s.end_time ? ` – ${s.end_time}` : ''}
                                            </td>
                                            <td className="px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                {s.subject_name ?? 'Free Period'}
                                            </td>
                                            <td className="px-3 py-2.5 text-xs text-slate-500 dark:text-slate-400">{s.class_name}</td>
                                            <td className="px-3 py-2.5">
                                                {s.timetable_type && s.timetable_type !== 'personal' && (
                                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${typeBadgeCls[s.timetable_type] || ''}`}>
                                                        {typeLabel(s.timetable_type)}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Week view */}
            {view === 'week' && (
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Loading…</div>
                    ) : allEmpty ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3">
                            <p className="text-slate-400 text-sm">No timetable slots assigned yet.</p>
                            <button onClick={() => setView('edit')}
                                className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                                Set Up Timetable
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-left border-collapse" style={{ minWidth: 640 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-28">Time</th>
                                        {DAYS.map(d => (
                                            <th key={d} className={`px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-center ${
                                                d === todayName ? 'text-white' : 'text-slate-300'
                                            }`}>
                                                {DAY_SHORT[d]}
                                                {d === todayName && (
                                                    <span className="ml-1 text-[8px] border border-slate-400 rounded px-1 py-0.5 align-middle opacity-70">TODAY</span>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {displaySlots.map((time, ri) => (
                                        <tr key={time} className={`border-b border-slate-100 dark:border-gray-700/60 ${
                                            ri % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                        }`}>
                                            <td className="px-3 py-2 text-xs font-mono text-slate-400 dark:text-slate-500 border-r border-slate-100 dark:border-gray-700 whitespace-nowrap">
                                                {(() => {
                                                    const anySlot = DAYS.map(d => (timetable[d] || []).find(s => s.time_slot === time)).find(Boolean);
                                                    return anySlot?.end_time ? `${time} – ${anySlot.end_time}` : time;
                                                })()}
                                            </td>
                                            {DAYS.map(day => {
                                                const match = (timetable[day] || []).find(s => s.time_slot === time);
                                                return (
                                                    <td key={day} className={`px-3 py-2 border-r border-slate-100 dark:border-gray-700 last:border-0 text-center ${
                                                        day === todayName ? 'bg-blue-50/40 dark:bg-blue-900/5' : ''
                                                    }`}>
                                                        {match ? (
                                                            <>
                                                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                                                                    {match.is_break ? 'Break' : (match.subject_name ?? '—')}
                                                                </p>
                                                                {!match.is_break && match.class_name && (
                                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{match.class_name}</p>
                                                                )}
                                                                {match.timetable_type && match.timetable_type !== 'personal' && (
                                                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mt-0.5 ${typeBadgeCls[match.timetable_type] || ''}`}>
                                                                        {typeLabel(match.timetable_type)}
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="text-slate-200 dark:text-slate-700 text-xs">—</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Edit view */}
            {view === 'edit' && (
                <div className="flex-1 flex flex-col gap-2 min-h-0">

                    {/* Edit controls */}
                    <div className="flex-shrink-0 flex flex-wrap gap-3 items-end">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Type</label>
                            <div className="flex border border-slate-300 dark:border-gray-600 rounded-md overflow-hidden">
                                {TIMETABLE_TYPES.map(t => (
                                    <button key={t.value} onClick={() => setEditTimetableType(t.value)}
                                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                                            editTimetableType === t.value
                                                ? 'bg-primary text-white'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-700'
                                        }`}>
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 flex-1 min-w-40">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Class</label>
                            <select value={editClassId} onChange={e => setEditClassId(e.target.value)}
                                className="px-2.5 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">{allClasses.length === 0 ? 'No classes found' : 'Select a class'}</option>
                                {allClasses.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}{c.curriculum_type ? ` (${c.curriculum_type})` : ''}</option>
                                ))}
                            </select>
                        </div>
                        {editClassId && (
                            <button onClick={handleSave} disabled={saving || editLoading}
                                className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors self-end">
                                {saving ? 'Saving…' : 'Save Timetable'}
                            </button>
                        )}
                    </div>

                    {/* Edit grid */}
                    {!editClassId ? (
                        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 flex items-center justify-center">
                            <p className="text-slate-400 text-sm">Select a class above to start editing.</p>
                        </div>
                    ) : editLoading ? (
                        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 flex items-center justify-center">
                            <p className="text-slate-400 text-sm">Loading…</p>
                        </div>
                    ) : (
                        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                            <div className="flex-shrink-0 px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    {selectedClass?.name}
                                    {selectedClass?.curriculum_type && (
                                        <span className="text-slate-400 font-normal">{selectedClass.curriculum_type}</span>
                                    )}
                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${typeBadgeCls[editTimetableType]}`}>
                                        {typeLabel(editTimetableType)}
                                    </span>
                                </span>
                                <span className="text-[10px] text-slate-400">{editTimeSlots.length} period{editTimeSlots.length !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="overflow-auto flex-1">
                                <table className="w-full border-collapse" style={{ minWidth: 640 }}>
                                    <thead className="sticky top-0 z-10">
                                        <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-36 text-left">Time</th>
                                            {DAYS.map(d => (
                                                <th key={d} className={`px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-center ${
                                                    d === todayName ? 'text-white' : 'text-slate-300'
                                                }`}>
                                                    {DAY_SHORT[d]}
                                                    {d === todayName && <span className="ml-1 text-[8px] border border-slate-400 rounded px-1 py-0.5 align-middle opacity-70">TODAY</span>}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {editTimeSlots.map((time, ri) => (
                                            <tr key={time} className={`border-b border-slate-100 dark:border-gray-700/60 ${
                                                ri % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                            }`}>
                                                <td className="px-3 py-2 border-r border-slate-100 dark:border-gray-700 align-middle">
                                                    <TimeCell
                                                        startTime={time}
                                                        endTime={editEndTimes[time] || ''}
                                                        autoEdit={time === newRowTime}
                                                        onChangeStart={newStart => handleTimeChange(time, newStart)}
                                                        onChangeEnd={newEnd => handleEndTimeChange(time, newEnd)}
                                                        onDelete={() => handleDeleteRow(time)}/>
                                                </td>
                                                {DAYS.map(day => {
                                                    const key          = `${day}-${time}`;
                                                    const slot         = editSlots[key] ?? null;
                                                    const otherTeacher = slot?.teacher_id && slot.teacher_id !== authUser?.id;
                                                    return (
                                                        <td key={day} className="px-2 py-2 border-r border-slate-100 dark:border-gray-700 last:border-0 align-top">
                                                            <SlotCell slot={slot} subjects={subjects}
                                                                disabled={!!otherTeacher}
                                                                onChange={val => handleCellChange(day, time, val)}/>
                                                            {otherTeacher && slot?.teacher_name && (
                                                                <p className="text-[9px] text-slate-400 dark:text-slate-500 px-1 mt-0.5 truncate">
                                                                    {slot.teacher_name}
                                                                </p>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                                <button onClick={handleAddRow}
                                    className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-primary transition-colors">
                                    + Add Time Slot
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TeacherTimetable;
