import React, { useState, useEffect } from 'react';

const LEVELS = ['Pre-Primary', 'Lower Primary', 'Upper Primary', 'Junior School', 'Senior School'];
const inputCls = "w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40";

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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-800 dark:text-white">{cls?.id ? 'Edit Class' : 'Add New Class'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Class Name *</label>
                            <input required value={form.name} onChange={e => set('name', e.target.value)}
                                placeholder="e.g. Grade 7" className={inputCls}/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Section</label>
                            <input value={form.section} onChange={e => set('section', e.target.value)}
                                placeholder="e.g. A, STEM" className={inputCls}/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Level *</label>
                        <select required value={form.level} onChange={e => set('level', e.target.value)} className={inputCls}>
                            <option value="">— Select level —</option>
                            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Curriculum</label>
                            <select value={form.curriculum_type} onChange={e => set('curriculum_type', e.target.value)} className={inputCls}>
                                <option value="CBC">CBC</option>
                                <option value="844">8-4-4</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Capacity</label>
                            <input type="number" min="1" max="200" value={form.capacity}
                                onChange={e => set('capacity', parseInt(e.target.value))} className={inputCls}/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Class Teacher</label>
                        <select value={form.class_teacher_id} onChange={e => set('class_teacher_id', e.target.value)} className={inputCls}>
                            <option value="">— Unassigned —</option>
                            {teachers.map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.role.replace('_',' ')})</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700">Cancel</button>
                        <button type="submit" disabled={saving}
                            className="px-6 py-2 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 disabled:opacity-60">
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
    const [tab, setTab]                         = useState('current'); // 'current' | 'add'

    useEffect(() => {
        Promise.all([
            window.axios.get(`/api/admin/classes/${cls.id}/students`),
            window.axios.get('/api/admin/students'),
        ]).then(([cur, all]) => {
            setCurrentStudents(cur.data);
            const curIds = cur.data.map(s => s.id);
            // Show students NOT already in this class
            setAllStudents((all.data.students || []).filter(s => !curIds.includes(s.id)));
        }).catch(() => {}).finally(() => setLoading(false));
    }, [cls.id]);

    const toggle = (id) => setSelectedIds(s =>
        s.includes(id) ? s.filter(x => x !== id) : [...s, id]
    );

    const handleAssign = async () => {
        if (selectedIds.length === 0) return;
        setSaving(true);
        try {
            await window.axios.post(`/api/admin/classes/${cls.id}/assign-students`, { student_ids: selectedIds });
            window.showToast?.('success', `${selectedIds.length} student(s) moved to ${cls.name}.`);
            // Refresh
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

    const filtered = tab === 'add'
        ? allStudents.filter(s =>
            `${s.first_name} ${s.last_name} ${s.admission_number}`.toLowerCase().includes(search.toLowerCase()))
        : currentStudents.filter(s =>
            `${s.first_name} ${s.last_name} ${s.admission_number}`.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100 dark:border-gray-700 flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-white">Manage Students — {cls.name}</h3>
                        <p className="text-xs text-gray-400">{currentStudents.length} student{currentStudents.length !== 1 ? 's' : ''} enrolled</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 px-6 pt-4 pb-0 flex-shrink-0">
                    {[
                        { id: 'current', label: `Enrolled (${currentStudents.length})` },
                        { id: 'add',     label: `Add Students (${allStudents.length} available)` },
                    ].map(t => (
                        <button key={t.id} onClick={() => { setTab(t.id); setSearch(''); setSelectedIds([]); }}
                            className={`px-4 py-2 text-sm font-bold rounded-t-lg border-b-2 transition-colors ${tab === t.id ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search students…"
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/40"/>
                </div>

                {/* List */}
                <div className="overflow-y-auto flex-1">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Loading…</div>
                    ) : filtered.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            {tab === 'add' ? 'No other students available to add.' : 'No students in this class yet.'}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {filtered.map(s => {
                                const isSelected = selectedIds.includes(s.id);
                                return (
                                    <div key={s.id}
                                        onClick={tab === 'add' ? () => toggle(s.id) : undefined}
                                        className={`flex items-center gap-3 px-6 py-3 ${tab === 'add' ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30' : ''} ${isSelected ? 'bg-primary/5' : ''} transition-colors`}>
                                        {tab === 'add' && (
                                            <input type="checkbox" readOnly checked={isSelected}
                                                className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary flex-shrink-0"/>
                                        )}
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-extrabold text-primary flex-shrink-0">
                                            {s.first_name?.[0]}{s.last_name?.[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                                                {s.first_name} {s.last_name}
                                            </p>
                                            <p className="text-xs text-gray-400">{s.admission_number} · {s.grade_level || s.class || '—'}</p>
                                        </div>
                                        <span className="text-xs text-gray-400 flex-shrink-0">{s.gender}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {tab === 'add' && (
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                        <span className="text-sm text-gray-500">
                            {selectedIds.length > 0 ? `${selectedIds.length} selected` : 'Select students to add'}
                        </span>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-500">Cancel</button>
                            <button onClick={handleAssign} disabled={saving || selectedIds.length === 0}
                                className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50">
                                {saving ? 'Moving…' : `Add ${selectedIds.length || ''} Student${selectedIds.length !== 1 ? 's' : ''}`}
                            </button>
                        </div>
                    </div>
                )}
                {tab === 'current' && (
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end flex-shrink-0">
                        <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700">Close</button>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ── Main component ───────────────────────────────────────────────────── */
const ClassManager = () => {
    const [classes, setClasses]         = useState([]);
    const [teachers, setTeachers]       = useState([]);
    const [isLoading, setIsLoading]     = useState(true);
    const [classModal, setClassModal]   = useState(null); // null | {} | {id,...}
    const [studentsModal, setStudentsModal] = useState(null); // null | cls

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

    return (
        <div className="space-y-6 pb-20">
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

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Classes &amp; Sections</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage school classes, assign teachers and students.</p>
                </div>
                <button onClick={() => setClassModal({})}
                    className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 text-sm">
                    + Add Class
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-gray-400">Loading classes…</div>
                ) : classes.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-bold">
                        No classes found. Add your first class to get started.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[750px]">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Class</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Level</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Curriculum</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Class Teacher</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider text-center">Students</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider text-center">Capacity</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {classes.map(cls => (
                                    <tr key={cls.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                                        <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-100">
                                            {cls.name}
                                            {cls.section && <span className="ml-1 text-xs text-gray-400 font-normal">({cls.section})</span>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{cls.level}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                                {cls.curriculum_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {cls.teacher_name && cls.teacher_name !== 'Unassigned' ? (
                                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{cls.teacher_name}</span>
                                            ) : (
                                                <span className="text-xs text-gray-300 dark:text-gray-600 italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => setStudentsModal(cls)}
                                                className="text-sm font-extrabold text-primary hover:underline">
                                                {cls.student_count}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-sm font-bold ${cls.student_count >= cls.capacity ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {cls.capacity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setStudentsModal(cls)}
                                                    className="text-xs font-bold text-gray-400 hover:text-primary transition-colors">Students</button>
                                                <button onClick={() => setClassModal(cls)}
                                                    className="text-xs font-bold text-primary hover:underline transition-colors">Edit</button>
                                                <button onClick={() => handleDelete(cls.id)}
                                                    className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors">Delete</button>
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

export default ClassManager;
