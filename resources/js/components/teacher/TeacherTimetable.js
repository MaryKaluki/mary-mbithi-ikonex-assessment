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

const inputCls =
    'w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm ' +
    'bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-400';

const typeBadgeCls = {
    personal: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    class:    'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    exams:    'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
};

const typeLabel = v => TIMETABLE_TYPES.find(t => t.value === v)?.label ?? v;

// ── Slot cell — inline subject editor ────────────────────────────────────────
const SlotCell = ({ slot, subjects, onChange, disabled }) => {
    const [open, setOpen] = useState(false);

    const isBreak     = slot?.is_break;
    const subjectName = slot?.subject_name ?? null;

    if (disabled) {
        return (
            <div className="px-2 py-1.5 text-xs text-center text-gray-400 dark:text-gray-600">
                {isBreak ? 'Break' : subjectName ?? '—'}
            </div>
        );
    }

    if (open) {
        return (
            <div className="rounded border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 p-1 shadow-sm min-w-[130px]">
                <select
                    autoFocus
                    defaultValue={isBreak ? '__break__' : (slot?.subject_id ?? '')}
                    onChange={e => {
                        const val = e.target.value;
                        if (val === '') {
                            onChange(null);
                        } else if (val === '__break__') {
                            onChange({ is_break: true, subject_id: null, subject_name: null });
                        } else {
                            const sub = subjects.find(s => String(s.id) === val);
                            onChange(sub ? { is_break: false, subject_id: sub.id, subject_name: sub.name } : null);
                        }
                        setOpen(false);
                    }}
                    className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white px-1 py-0.5 focus:outline-none"
                >
                    <option value="">Free period</option>
                    {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                    <option value="__break__">Break</option>
                </select>
                <button
                    onClick={() => setOpen(false)}
                    className="text-[10px] text-gray-400 hover:text-gray-600 w-full text-right pr-0.5 mt-0.5"
                >
                    cancel
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setOpen(true)}
            className={`w-full text-left px-2 py-1.5 rounded text-xs border transition-colors ${
                isBreak
                    ? 'border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 italic'
                    : subjectName
                    ? 'border-gray-300 dark:border-gray-500 font-semibold text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-700/60'
                    : 'border-dashed border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 hover:border-gray-400 hover:text-gray-500'
            }`}
        >
            {isBreak ? 'Break' : (subjectName ?? '+ Add')}
        </button>
    );
};

// ── Editable time cell (start + end) ─────────────────────────────────────────
const TimeCell = ({ startTime, endTime, onChangeStart, onChangeEnd, onDelete, autoEdit }) => {
    const [editing, setEditing] = useState(!!autoEdit);
    const [valStart, setValStart] = useState(startTime);
    const [valEnd, setValEnd]     = useState(endTime || '');
    const startRef = useRef(null);

    useEffect(() => {
        if (editing && startRef.current) startRef.current.focus();
    }, [editing]);

    useEffect(() => { setValStart(startTime); }, [startTime]);
    useEffect(() => { setValEnd(endTime || ''); }, [endTime]);

    const timeCls =
        'w-[4.5rem] text-xs border border-gray-300 dark:border-gray-500 rounded px-1 py-0.5 ' +
        'bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-400';

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
                    <input
                        ref={startRef}
                        type="time"
                        value={valStart}
                        onChange={e => setValStart(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter')  commit();
                            if (e.key === 'Escape') { setValStart(startTime); setValEnd(endTime || ''); setEditing(false); }
                        }}
                        className={timeCls}
                    />
                    <span className="text-[10px] text-gray-400">–</span>
                    <input
                        type="time"
                        value={valEnd}
                        onChange={e => setValEnd(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter')  commit();
                            if (e.key === 'Escape') { setValStart(startTime); setValEnd(endTime || ''); setEditing(false); }
                        }}
                        onBlur={commit}
                        className={timeCls}
                    />
                </div>
                <span className="text-[9px] text-gray-400 dark:text-gray-500">start – end</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 group/time">
            <button
                onClick={() => setEditing(true)}
                title="Click to edit time"
                className="text-xs font-semibold text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:underline transition-colors whitespace-nowrap"
            >
                {startTime}{endTime ? ` – ${endTime}` : ''}
            </button>
            <button
                onClick={onDelete}
                title="Remove this row"
                className="opacity-0 group-hover/time:opacity-100 text-gray-300 dark:text-gray-600 hover:text-red-400 transition-all text-[9px] leading-none ml-0.5 mt-px"
            >
                ✕
            </button>
        </div>
    );
};

// ── Main component ────────────────────────────────────────────────────────────
const TeacherTimetable = () => {
    const [view, setView] = useState('week'); // 'week' | 'today' | 'edit'

    // Auth user from localStorage
    const authUser   = (() => { try { return JSON.parse(localStorage.getItem('auth_user') || '{}'); } catch (_) { return {}; } })();
    const schoolName = localStorage.getItem('schoolName') || '';

    // Read-only personal timetable
    const [timetable, setTimetable] = useState({});
    const [timeSlots, setTimeSlots] = useState([]);
    const [loading, setLoading]     = useState(true);

    // Edit mode
    const [allClasses, setAllClasses]         = useState([]);
    const [subjects, setSubjects]             = useState([]);
    const [editClassId, setEditClassId]       = useState('');
    const [editSlots, setEditSlots]           = useState({});        // key: "Monday-07:30"
    const [editTimeSlots, setEditTimeSlots]   = useState(DEFAULT_SLOTS.map(s => s.start));
    const [editEndTimes, setEditEndTimes]     = useState(           // start → end map
        Object.fromEntries(DEFAULT_SLOTS.map(s => [s.start, s.end]))
    );
    const [editTimetableType, setEditTimetableType] = useState('personal');
    const [newRowTime, setNewRowTime]         = useState(null);
    const [editLoading, setEditLoading]       = useState(false);
    const [saving, setSaving]                 = useState(false);

    const todayName = DAYS[new Date().getDay() - 1] ?? 'Monday';

    // Load personal timetable + all school classes + subjects on mount
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

    // Load existing slots when a class is selected in edit mode
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
                    // Derive type from first slot
                    const firstType = slots[0]?.timetable_type || 'personal';
                    setEditTimetableType(firstType);
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

    // Extract day + startTime from a "Monday-07:30" key
    const splitKey = key => {
        const i = key.indexOf('-');
        return { day: key.slice(0, i), time: key.slice(i + 1) };
    };

    const handleCellChange = (day, time, value) => {
        const key = `${day}-${time}`;
        setEditSlots(prev => {
            const next = { ...prev };
            if (value === null) delete next[key];
            else next[key] = value;
            return next;
        });
    };

    // Rename all slot keys from oldTime → newTime and re-sort time rows
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
            if (next[oldTime] !== undefined) {
                next[newTime] = next[oldTime];
                delete next[oldTime];
            }
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

    // Remove a time row and all its slot data
    const handleDeleteRow = time => {
        setEditSlots(prev => {
            const next = {};
            Object.entries(prev).forEach(([key, val]) => {
                if (splitKey(key).time !== time) next[key] = val;
            });
            return next;
        });
        setEditTimeSlots(prev => prev.filter(t => t !== time));
        setEditEndTimes(prev => { const next = { ...prev }; delete next[time]; return next; });
        if (newRowTime === time) setNewRowTime(null);
    };

    // Add a new blank time row with a unique default time
    const handleAddRow = () => {
        let h = 8, m = 0;
        let candidate = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        let attempts  = 0;
        while (editTimeSlots.includes(candidate) && attempts < 96) {
            m += 15;
            if (m >= 60) { m -= 60; h++; }
            if (h >= 24) h = 0;
            candidate = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            attempts++;
        }
        // Default end time = start + 50 min
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
                return {
                    day,
                    time_slot,
                    end_time:       editEndTimes[time_slot] || null,
                    timetable_type: editTimetableType,
                    subject_id:     val.subject_id ?? null,
                    is_break:       val.is_break   ?? false,
                };
            });
            await window.axios.put(`/api/teacher/timetables/${editClassId}`, { slots });
            window.showToast?.('success', 'Timetable saved successfully.');
            const res = await window.axios.get('/api/teacher/timetable');
            setTimetable(res.data.timetable || {});
            setTimeSlots(res.data.time_slots?.length ? res.data.time_slots : DEFAULT_SLOTS.map(s => s.start));
        } catch (err) {
            window.showToast?.('error', err.response?.data?.message || 'Failed to save timetable.');
        } finally {
            setSaving(false);
        }
    };

    const displaySlots  = timeSlots.length ? timeSlots : DEFAULT_SLOTS.map(s => s.start);
    const allEmpty      = Object.values(timetable).every(d => !d.length);
    const selectedClass = allClasses.find(c => String(c.id) === editClassId);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-5 pb-20">

            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Timetable</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {authUser.name
                            ? <><span className="font-medium text-gray-700 dark:text-gray-300">{authUser.name}</span>{schoolName ? ` · ${schoolName}` : ''}</>
                            : 'View your schedule or edit your class timetable.'
                        }
                    </p>
                </div>
                <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden text-sm">
                    {[
                        { key: 'today', label: 'Today' },
                        { key: 'week',  label: 'Full Week' },
                        { key: 'edit',  label: 'Edit' },
                    ].map(v => (
                        <button
                            key={v.key}
                            onClick={() => setView(v.key)}
                            className={`px-4 py-2 font-medium transition-colors ${
                                view === v.key
                                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                        >
                            {v.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Today view ──────────────────────────────────────────────────── */}
            {view === 'today' && (
                loading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center text-sm text-gray-400">
                        Loading...
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{todayName}</span>
                            {authUser.name && (
                                <span className="text-xs text-gray-400 dark:text-gray-500">{authUser.name}</span>
                            )}
                        </div>
                        {!(timetable[todayName] || []).filter(s => !s.is_break).length ? (
                            <div className="py-14 text-center text-sm text-gray-400 dark:text-gray-500">
                                No classes scheduled for today.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                {(timetable[todayName] || [])
                                    .filter(s => !s.is_break)
                                    .map((s, i) => (
                                        <div key={i} className="px-5 py-3.5 flex items-center gap-5">
                                            <div className="w-24 shrink-0">
                                                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                                                    {s.time_slot}{s.end_time ? ` – ${s.end_time}` : ''}
                                                </p>
                                                {s.timetable_type && s.timetable_type !== 'personal' && (
                                                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 inline-block ${typeBadgeCls[s.timetable_type] || ''}`}>
                                                        {typeLabel(s.timetable_type)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    {s.subject_name ?? 'Free Period'}
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                    {s.class_name}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                )
            )}

            {/* ── Full week view ───────────────────────────────────────────────── */}
            {view === 'week' && (
                loading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center text-sm text-gray-400">
                        Loading...
                    </div>
                ) : allEmpty ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 py-16 text-center">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                            No timetable slots assigned yet.
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Use the Edit tab to set up your schedule.
                        </p>
                        <button
                            onClick={() => setView('edit')}
                            className="mt-4 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
                        >
                            Set Up Timetable
                        </button>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {authUser.name && (
                            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[11px] font-bold text-gray-600 dark:text-gray-300 shrink-0">
                                    {authUser.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{authUser.name}</p>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500">Personal Timetable{schoolName ? ` · ${schoolName}` : ''}</p>
                                </div>
                            </div>
                        )}
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px]">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left w-28">
                                            Time
                                        </th>
                                        {DAYS.map(d => (
                                            <th
                                                key={d}
                                                className={`px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-center ${
                                                    d === todayName
                                                        ? 'text-gray-900 dark:text-gray-100'
                                                        : 'text-gray-400 dark:text-gray-500'
                                                }`}
                                            >
                                                {DAY_SHORT[d]}
                                                {d === todayName && (
                                                    <span className="ml-1.5 text-[8px] border border-gray-400 dark:border-gray-400 rounded px-1 py-0.5 align-middle">
                                                        TODAY
                                                    </span>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                    {displaySlots.map(time => (
                                        <tr key={time} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/20">
                                            <td className="px-4 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500 border-r border-gray-100 dark:border-gray-700 whitespace-nowrap">
                                                {/* Find end_time from any slot in this row */}
                                                {(() => {
                                                    const anySlot = DAYS.map(d => (timetable[d] || []).find(s => s.time_slot === time)).find(Boolean);
                                                    return anySlot?.end_time ? `${time} – ${anySlot.end_time}` : time;
                                                })()}
                                            </td>
                                            {DAYS.map(day => {
                                                const match = (timetable[day] || []).find(s => s.time_slot === time);
                                                return (
                                                    <td
                                                        key={day}
                                                        className={`px-3 py-3 border-r border-gray-100 dark:border-gray-700 last:border-0 text-center ${
                                                            day === todayName ? 'bg-gray-50/50 dark:bg-gray-700/20' : ''
                                                        }`}
                                                    >
                                                        {match ? (
                                                            <>
                                                                <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                                                                    {match.is_break ? 'Break' : (match.subject_name ?? '—')}
                                                                </p>
                                                                {!match.is_break && match.class_name && (
                                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                                                                        {match.class_name}
                                                                    </p>
                                                                )}
                                                                {match.timetable_type && match.timetable_type !== 'personal' && (
                                                                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 inline-block ${typeBadgeCls[match.timetable_type] || ''}`}>
                                                                        {typeLabel(match.timetable_type)}
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-200 dark:text-gray-700 text-xs">—</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            )}

            {/* ── Edit view ────────────────────────────────────────────────────── */}
            {view === 'edit' && (
                <div className="space-y-4">

                    {/* Teacher identity card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 shrink-0">
                            {(authUser.name || 'T').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {authUser.name || 'Teacher'}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                {[authUser.role ? (authUser.role.charAt(0).toUpperCase() + authUser.role.slice(1)) : 'Teacher', schoolName].filter(Boolean).join(' · ')}
                            </p>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide shrink-0 ${typeBadgeCls[editTimetableType]}`}>
                            {typeLabel(editTimetableType)}
                        </span>
                    </div>

                    {/* Controls: timetable type + class selector + save */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">

                        {/* Timetable type */}
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                Timetable Type
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {TIMETABLE_TYPES.map(t => (
                                    <button
                                        key={t.value}
                                        onClick={() => setEditTimetableType(t.value)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                            editTimetableType === t.value
                                                ? 'border-gray-900 dark:border-gray-100 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                                                : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-400'
                                        }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Class selector + save */}
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                Select Class to Edit
                            </label>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                <select
                                    value={editClassId}
                                    onChange={e => setEditClassId(e.target.value)}
                                    className={`flex-1 ${inputCls}`}
                                >
                                    <option value="">
                                        {allClasses.length === 0 ? 'No classes found in this school' : 'Select a class'}
                                    </option>
                                    {allClasses.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}{c.curriculum_type ? ` (${c.curriculum_type})` : ''}
                                        </option>
                                    ))}
                                </select>
                                {editClassId && (
                                    <button
                                        onClick={handleSave}
                                        disabled={saving || editLoading}
                                        className="shrink-0 px-5 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200 disabled:opacity-50 transition-colors"
                                    >
                                        {saving ? 'Saving...' : 'Save Timetable'}
                                    </button>
                                )}
                            </div>
                            {editClassId && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                    Click any cell to assign a subject. Click a time to edit start/end. Your changes only affect your own teaching slots.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Empty state */}
                    {!editClassId && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 py-14 text-center">
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                Select a class above to start building your timetable.
                            </p>
                        </div>
                    )}

                    {/* Loading state */}
                    {editClassId && editLoading && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 py-14 text-center text-sm text-gray-400">
                            Loading...
                        </div>
                    )}

                    {/* Edit grid */}
                    {editClassId && !editLoading && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {/* Grid header */}
                            <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {selectedClass?.name}
                                    </span>
                                    {selectedClass?.curriculum_type && (
                                        <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                            {selectedClass.curriculum_type}
                                        </span>
                                    )}
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeBadgeCls[editTimetableType]}`}>
                                        {typeLabel(editTimetableType)}
                                    </span>
                                </div>
                                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                    {editTimeSlots.length} period{editTimeSlots.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[640px]">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left w-36">
                                                Time
                                            </th>
                                            {DAYS.map(d => (
                                                <th
                                                    key={d}
                                                    className={`px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-center ${
                                                        d === todayName
                                                            ? 'text-gray-900 dark:text-gray-100'
                                                            : 'text-gray-400 dark:text-gray-500'
                                                    }`}
                                                >
                                                    {DAY_SHORT[d]}
                                                    {d === todayName && (
                                                        <span className="ml-1 text-[8px] border border-current rounded px-1 py-0.5 align-middle opacity-60">
                                                            TODAY
                                                        </span>
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                        {editTimeSlots.map(time => (
                                            <tr key={time} className="hover:bg-gray-50/40 dark:hover:bg-gray-700/20">
                                                {/* Editable time cell */}
                                                <td className="px-4 py-2 border-r border-gray-100 dark:border-gray-700 align-middle">
                                                    <TimeCell
                                                        startTime={time}
                                                        endTime={editEndTimes[time] || ''}
                                                        autoEdit={time === newRowTime}
                                                        onChangeStart={newStart => handleTimeChange(time, newStart)}
                                                        onChangeEnd={newEnd => handleEndTimeChange(time, newEnd)}
                                                        onDelete={() => handleDeleteRow(time)}
                                                    />
                                                </td>
                                                {DAYS.map(day => {
                                                    const key          = `${day}-${time}`;
                                                    const slot         = editSlots[key] ?? null;
                                                    const otherTeacher = slot?.teacher_id &&
                                                        slot.teacher_id !== authUser?.id;
                                                    return (
                                                        <td
                                                            key={day}
                                                            className="px-2 py-2 border-r border-gray-100 dark:border-gray-700 last:border-0 align-top"
                                                        >
                                                            <SlotCell
                                                                slot={slot}
                                                                subjects={subjects}
                                                                disabled={!!otherTeacher}
                                                                onChange={val => handleCellChange(day, time, val)}
                                                            />
                                                            {otherTeacher && slot?.teacher_name && (
                                                                <p className="text-[9px] text-gray-400 dark:text-gray-500 px-1 mt-0.5 truncate">
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

                            {/* Add row footer */}
                            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={handleAddRow}
                                    className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors font-medium"
                                >
                                    <span className="text-base leading-none">+</span>
                                    Add Time Slot
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
