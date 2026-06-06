import React, { useState, useEffect } from 'react';

const LEVELS = ['Pre-Primary', 'Lower Primary', 'Upper Primary', 'Junior School', 'Senior School'];
const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

/* ── Class form modal ─────────────────────────────────────────────────── */
const ClassModal = ({ cls, teachers, onClose, onSaved }) => {
    const [form, setForm] = useState({
        name:             cls?.name             ?? '',
        level:            cls?.level            ?? '',
        section:          cls?.section          ?? '',
        curriculum_type:  cls?.curriculum_type  ?? 'CBC',
        capacity:         cls?.capacity         ?? 40,
        class_teacher_id: cls?.class_teacher_id ?? '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError]   = useState(null);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const payload = { ...form, class_teacher_id: form.class_teacher_id || null };
            if (cls?.id) {
                await window.axios.put(`/api/admin/classes/${cls.id}`, payload);
            } else {
                await window.axios.post('/api/admin/classes', payload);
            }
            onSaved();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg border border-slate-200 dark:border-gray-700">
                {/* Modal header */}
                <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-gray-900/50 border-b border-slate-200 dark:border-gray-700">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                        {cls?.id ? 'Edit Class' : 'Add New Class'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">{error}</p>}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Class Name *</label>
                            <input required value={form.name} onChange={e => set('name', e.target.value)}
                                placeholder="e.g. Grade 7" className={inputCls}/>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Section</label>
                            <input value={form.section} onChange={e => set('section', e.target.value)}
                                placeholder="e.g. A, STEM" className={inputCls}/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Level *</label>
                        <select required value={form.level} onChange={e => set('level', e.target.value)} className={inputCls}>
                            <option value="">— Select level —</option>
                            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Curriculum</label>
                            <select value={form.curriculum_type} onChange={e => set('curriculum_type', e.target.value)} className={inputCls}>
                                <option value="CBC">CBC</option>
                                <option value="844">8-4-4</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Capacity</label>
                            <input type="number" min="1" max="200" value={form.capacity}
                                onChange={e => set('capacity', parseInt(e.target.value))} className={inputCls}/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Class Teacher</label>
                        <select value={form.class_teacher_id} onChange={e => set('class_teacher_id', e.target.value)} className={inputCls}>
                            <option value="">— Unassigned —</option>
                            {teachers.map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.role.replace('_',' ')})</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                        <button type="button" onClick={onClose}
                            className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            className="px-5 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">
                            {saving ? 'Saving…' : (cls?.id ? 'Update Class' : 'Add Class')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ── Student assignment modal ─────────────────────────────────────────── */
const StudentsModal = ({ cls, onClose }) => {
    const [currentStudents, setCurrentStudents] = useState([]);
    const [allStudents, setAllStudents]         = useState([]);
    const [selectedIds, setSelectedIds]         = useState([]);
    const [search, setSearch]                   = useState('');
    const [loading, setLoading]                 = useState(true);
    const [saving, setSaving]                   = useState(false);
    const [tab, setTab]                         = useState('current');

    useEffect(() => {
        Promise.all([
            window.axios.get(`/api/admin/classes/${cls.id}/students`),
            window.axios.get('/api/admin/students'),
        ]).then(([cur, all]) => {
            setCurrentStudents(cur.data);
            const curIds = cur.data.map(s => s.id);
            setAllStudents((all.data.students || []).filter(s => !curIds.includes(s.id)));
        }).catch(() => {}).finally(() => setLoading(false));
    }, [cls.id]);

    const toggle = (id) => setSelectedIds(s =>
        s.includes(id) ? s.filter(x => x !== id) : [...s, id]
    );
    const toggleAll = () => {
        setSelectedIds(selectedIds.length === filtered.length && filtered.length > 0
            ? [] : filtered.map(s => s.id));
    };

    const handleAssign = async () => {
        if (selectedIds.length === 0) return;
        setSaving(true);
        try {
            await window.axios.post(`/api/admin/classes/${cls.id}/assign-students`, { student_ids: selectedIds });
            window.showToast?.('success', `${selectedIds.length} student(s) moved to ${cls.name}.`);
            const [cur, all] = await Promise.all([
                window.axios.get(`/api/admin/classes/${cls.id}/students`),
                window.axios.get('/api/admin/students'),
            ]);
            setCurrentStudents(cur.data);
            const curIds = cur.data.map(s => s.id);
            setAllStudents((all.data.students || []).filter(s => !curIds.includes(s.id)));
            setSelectedIds([]);
            setTab('current');
        } catch {
            window.showToast?.('error', 'Failed to assign students.');
        } finally {
            setSaving(false);
        }
    };

    const filtered = (tab === 'add' ? allStudents : currentStudents).filter(s =>
        `${s.first_name} ${s.last_name} ${s.admission_number}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl border border-slate-200 dark:border-gray-700 flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800 flex-shrink-0">
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-0.5">Manage Students</p>
                        <h3 className="text-sm font-bold text-white">{cls.name}</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none transition-colors">&times;</button>
                </div>

                {/* Tabs + Search bar */}
                <div className="flex flex-shrink-0 border-b border-slate-200 dark:border-gray-700 px-4 pt-2 gap-0.5">
                    {[
                        { id: 'current', label: `Enrolled (${currentStudents.length})` },
                        { id: 'add',     label: `Add Students (${allStudents.length})` },
                    ].map(t => (
                        <button key={t.id} onClick={() => { setTab(t.id); setSearch(''); setSelectedIds([]); }}
                            className={`px-4 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-all duration-150 ${
                                tab === t.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
                            }`}>
                            {t.label}
                        </button>
                    ))}
                </div>
                <div className="px-4 py-2 border-b border-slate-100 dark:border-gray-700 flex-shrink-0">
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or admission number…"
                        className={inputCls}/>
                </div>

                {/* Student table */}
                <div className="overflow-y-auto flex-1">
                    {loading ? (
                        <div className="p-8 text-center text-slate-400 text-sm">Loading…</div>
                    ) : filtered.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">
                            {tab === 'add' ? 'No other students available to add.' : 'No students in this class yet.'}
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                    {tab === 'add' && (
                                        <th className="px-3 py-2.5 w-8">
                                            <input type="checkbox"
                                                className="w-3.5 h-3.5 rounded border-slate-500 cursor-pointer accent-primary"
                                                checked={selectedIds.length === filtered.length && filtered.length > 0}
                                                onChange={toggleAll}/>
                                        </th>
                                    )}
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Adm No</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Full Name</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Gender</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((s, i) => {
                                    const isSelected = selectedIds.includes(s.id);
                                    return (
                                        <tr key={s.id}
                                            onClick={tab === 'add' ? () => toggle(s.id) : undefined}
                                            className={`border-b border-slate-100 dark:border-gray-700/60 transition-colors ${
                                                tab === 'add' ? 'cursor-pointer' : ''
                                            } ${
                                                isSelected ? 'bg-primary/5 dark:bg-primary/10'
                                                : i % 2 === 0 ? 'bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                                                : 'bg-slate-50/70 dark:bg-gray-900/30 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                                            }`}>
                                            {tab === 'add' && (
                                                <td className="px-3 py-2">
                                                    <input type="checkbox" readOnly checked={isSelected}
                                                        className="w-3.5 h-3.5 rounded border-slate-300 cursor-pointer accent-primary"/>
                                                </td>
                                            )}
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">
                                                {String(i + 1).padStart(2, '0')}
                                            </td>
                                            <td className="px-3 py-2 font-mono text-xs text-slate-500 dark:text-slate-400 tracking-wide">
                                                {s.admission_number}
                                            </td>
                                            <td className="px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                {s.first_name} {s.last_name}
                                            </td>
                                            <td className="px-3 py-2 text-center text-xs text-slate-500 dark:text-slate-400">{s.gender || '—'}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{s.grade_level || s.class || '—'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30 flex items-center justify-between flex-shrink-0">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                        {tab === 'add'
                            ? selectedIds.length > 0 ? `${selectedIds.length} selected` : `${filtered.length} available`
                            : `${currentStudents.length} enrolled`
                        }
                    </p>
                    <div className="flex gap-2">
                        <button onClick={onClose}
                            className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700 transition-colors">
                            {tab === 'add' ? 'Cancel' : 'Close'}
                        </button>
                        {tab === 'add' && (
                            <button onClick={handleAssign} disabled={saving || selectedIds.length === 0}
                                className="px-4 py-1.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors">
                                {saving ? 'Moving…' : `Add ${selectedIds.length || 0} Student${selectedIds.length !== 1 ? 's' : ''}`}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ── Main component ───────────────────────────────────────────────────── */
const ClassManager = () => {
    const [classes, setClasses]             = useState([]);
    const [teachers, setTeachers]           = useState([]);
    const [isLoading, setIsLoading]         = useState(true);
    const [search, setSearch]               = useState('');
    const [classModal, setClassModal]       = useState(null);
    const [studentsModal, setStudentsModal] = useState(null);

    const fetchAll = async () => {
        setIsLoading(true);
        try {
            const [cls, tch] = await Promise.all([
                window.axios.get('/api/admin/classes'),
                window.axios.get('/api/admin/classes/available-teachers'),
            ]);
            setClasses(cls.data);
            setTeachers(tch.data);
        } catch {
            window.showToast?.('error', 'Failed to load classes.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this class? Students will NOT be deleted but will lose their class assignment.')) return;
        try {
            await window.axios.delete(`/api/admin/classes/${id}`);
            window.showToast?.('success', 'Class deleted.');
            fetchAll();
        } catch {
            window.showToast?.('error', 'Failed to delete class.');
        }
    };

    const filtered = classes.filter(c =>
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.level || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.teacher_name || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {classModal !== null && (
                <ClassModal
                    cls={classModal?.id ? classModal : null}
                    teachers={teachers}
                    onClose={() => setClassModal(null)}
                    onSaved={fetchAll}
                />
            )}
            {studentsModal && (
                <StudentsModal cls={studentsModal} onClose={() => { setStudentsModal(null); fetchAll(); }}/>
            )}

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Admin <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Classes &amp; Sections</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">
                        Classes &amp; Sections
                        {!isLoading && <span className="ml-2 text-xs font-normal text-slate-400">— {filtered.length} class{filtered.length !== 1 ? 'es' : ''}</span>}
                    </h1>
                </div>
                <button onClick={() => setClassModal({})}
                    className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary/90 text-sm transition-all duration-200">
                    + Add Class
                </button>
            </div>

            {/* Filter */}
            <div className="flex gap-2 flex-shrink-0">
                <div className="flex-1 relative">
                    <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input type="text" placeholder="Search class name, level, teacher…"
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                        value={search} onChange={e => setSearch(e.target.value)}/>
                </div>
                {!isLoading && (
                    <div className="flex items-center px-3 py-1.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-md text-xs text-slate-500 whitespace-nowrap select-none">
                        <span className="font-bold text-slate-700 dark:text-slate-200 mr-1">{filtered.length}</span> records
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-400 text-sm">Loading classes…</div>
                ) : filtered.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-slate-400 text-sm">
                            {search ? 'No classes match your search.' : 'No classes found. Add your first class to get started.'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-left border-collapse" style={{ minWidth: 700 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Class / Section</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-32">Level</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Curriculum</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Class Teacher</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Students</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Capacity</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((cls, i) => (
                                        <tr key={cls.id}
                                            className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group ${
                                                i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                            }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">
                                                {String(i + 1).padStart(2, '0')}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{cls.name}</span>
                                                {cls.section && (
                                                    <span className="ml-1.5 text-[10px] font-mono text-slate-400">({cls.section})</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{cls.level}</td>
                                            <td className="px-3 py-2">
                                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                                    {cls.curriculum_type}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-400">
                                                {cls.teacher_name && cls.teacher_name !== 'Unassigned'
                                                    ? <span className="font-semibold">{cls.teacher_name}</span>
                                                    : <span className="text-slate-300 dark:text-slate-600 italic">Unassigned</span>
                                                }
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <button onClick={() => setStudentsModal(cls)}
                                                    className="text-sm font-extrabold text-primary hover:text-primary/70 transition-colors">
                                                    {cls.student_count}
                                                </button>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`text-xs font-bold ${cls.student_count >= cls.capacity ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                                                    {cls.capacity}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button onClick={() => setStudentsModal(cls)}
                                                        className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-primary transition-colors">
                                                        Students
                                                    </button>
                                                    <button onClick={() => setClassModal(cls)}
                                                        className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDelete(cls.id)}
                                                        className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors">
                                                        Del
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                                {filtered.length} class{filtered.length !== 1 ? 'es' : ''}
                                {search && ` · filtered from ${classes.length}`}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ClassManager;
