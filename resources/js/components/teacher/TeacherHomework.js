import React, { useState, useEffect } from 'react';

const inputClass = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const TeacherHomework = () => {
    const [list, setList]           = useState([]);
    const [classes, setClasses]     = useState([]);
    const [loading, setLoading]     = useState(true);
    const [showForm, setShowForm]   = useState(false);
    const [saving, setSaving]       = useState(false);
    const [form, setForm] = useState({
        class_id: '', subject_name: '', title: '', description: '',
        due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    });
    const [errors, setErrors] = useState({});

    const load = async () => {
        try {
            const [hw, cls] = await Promise.all([
                window.axios.get('/api/teacher/homework'),
                window.axios.get('/api/teacher/classes'),
            ]);
            setList(hw.data);
            setClasses(cls.data);
            if (cls.data.length > 0 && !form.class_id) {
                setForm(f => ({ ...f, class_id: String(cls.data[0].id) }));
            }
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const set = (k, v) => {
        setForm(f => ({ ...f, [k]: v }));
        if (errors[k]) setErrors(e => ({ ...e, [k]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        try {
            await window.axios.post('/api/teacher/homework', form);
            setShowForm(false);
            setForm(f => ({ ...f, subject_name: '', title: '', description: '' }));
            window.showToast?.('success', 'Homework added.');
            load();
        } catch (err) {
            if (err.response?.status === 422) {
                const raw = err.response.data.errors || {};
                const flat = {};
                Object.keys(raw).forEach(k => { flat[k] = raw[k][0]; });
                setErrors(flat);
            } else {
                window.showToast?.('error', 'Failed to save homework.');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this homework?')) return;
        try {
            await window.axios.delete(`/api/teacher/homework/${id}`);
            setList(l => l.filter(h => h.id !== id));
            window.showToast?.('success', 'Homework deleted.');
        } catch {
            window.showToast?.('error', 'Could not delete.');
        }
    };

    const upcoming = list.filter(h => !h.overdue);
    const overdue  = list.filter(h => h.overdue);

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <nav className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">
                        <span>Teacher</span>
                        <span className="mx-1.5">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-medium">Homework & Assignments</span>
                    </nav>
                    <h1 className="text-lg font-bold text-slate-800 dark:text-gray-100">Homework & Assignments</h1>
                </div>
                <button onClick={() => setShowForm(s => !s)}
                    className="px-4 py-2 bg-primary text-white font-bold rounded-md text-sm hover:bg-primary/90 transition-all duration-200">
                    {showForm ? '✕ Cancel' : '+ New Homework'}
                </button>
            </div>

            {/* Add form */}
            {showForm && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
                    <div className="px-5 py-3.5 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 rounded-t-lg">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-400">New Assignment</h3>
                    </div>
                    <form onSubmit={handleSubmit} className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 mb-1 uppercase tracking-wider">Class</label>
                            <select value={form.class_id} onChange={e => set('class_id', e.target.value)} className={inputClass}>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            {errors.class_id && <p className="text-xs text-red-600 mt-1">{errors.class_id}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 mb-1 uppercase tracking-wider">Subject</label>
                            <input required value={form.subject_name} onChange={e => set('subject_name', e.target.value)}
                                placeholder="e.g. Mathematics" className={inputClass}/>
                            {errors.subject_name && <p className="text-xs text-red-600 mt-1">{errors.subject_name}</p>}
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 mb-1 uppercase tracking-wider">Title</label>
                            <input required value={form.title} onChange={e => set('title', e.target.value)}
                                placeholder="e.g. Exercise 3.4 — Fractions" className={inputClass}/>
                            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 mb-1 uppercase tracking-wider">Instructions <span className="font-normal normal-case text-slate-400">(optional)</span></label>
                            <textarea value={form.description} onChange={e => set('description', e.target.value)}
                                rows={2} placeholder="Additional instructions…"
                                className={inputClass + ' resize-none'}/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 mb-1 uppercase tracking-wider">Due Date</label>
                            <input type="date" required value={form.due_date} onChange={e => set('due_date', e.target.value)}
                                min={new Date().toISOString().split('T')[0]} className={inputClass}/>
                            {errors.due_date && <p className="text-xs text-red-600 mt-1">{errors.due_date}</p>}
                        </div>
                        <div className="flex items-end">
                            <button type="submit" disabled={saving}
                                className="w-full px-4 py-2 bg-primary text-white text-sm font-bold rounded-md hover:bg-primary/90 disabled:opacity-60 transition-all duration-200">
                                {saving ? 'Saving…' : 'Add Homework'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Lists */}
            {loading ? (
                <div className="p-12 text-center text-slate-400">Loading…</div>
            ) : list.length === 0 ? (
                <div className="py-16 text-center">
                    <p className="text-slate-400 dark:text-gray-500 text-sm mb-4">No homework assigned yet.</p>
                    <button onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-primary text-white font-bold text-sm rounded-md hover:bg-primary/90 transition-all duration-200">
                        + Add First Homework
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {upcoming.length > 0 && (
                        <Section title="Upcoming" items={upcoming} onDelete={handleDelete} accent="primary"/>
                    )}
                    {overdue.length > 0 && (
                        <Section title="Overdue" items={overdue} onDelete={handleDelete} accent="red"/>
                    )}
                </div>
            )}
        </div>
    );
};

const Section = ({ title, items, onDelete, accent }) => (
    <div>
        <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${accent === 'red' ? 'text-red-500' : 'text-slate-500'}`}>{title}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">({items.length})</span>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <table className="w-full text-left min-w-[600px]">
                <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Title</th>
                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Subject</th>
                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Class</th>
                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Due Date</th>
                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((h, i) => (
                        <tr key={h.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                            i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                        }`}>
                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">
                                {String(i + 1).padStart(2, '0')}
                            </td>
                            <td className="px-3 py-2">
                                <p className="font-semibold text-sm text-slate-800 dark:text-gray-200 leading-tight">{h.title}</p>
                                {h.description && <p className="text-[10px] text-slate-400 mt-0.5 italic truncate max-w-xs">{h.description}</p>}
                            </td>
                            <td className="px-3 py-2 text-xs text-slate-500 dark:text-gray-400">{h.subject_name}</td>
                            <td className="px-3 py-2 text-xs text-slate-500 dark:text-gray-400">{h.class_name}</td>
                            <td className="px-3 py-2">
                                <span className={`text-xs font-bold font-mono ${accent === 'red' ? 'text-red-500' : 'text-slate-500 dark:text-gray-400'}`}>
                                    {h.due_date}
                                </span>
                            </td>
                            <td className="px-3 py-2 text-right">
                                <button onClick={() => onDelete(h.id)}
                                    className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors">
                                    Del
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default TeacherHomework;
