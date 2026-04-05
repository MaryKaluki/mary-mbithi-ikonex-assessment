import React, { useState, useEffect } from 'react';

const inputClass = "w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40";

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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Homework & Assignments</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage homework for your classes</p>
                </div>
                <button onClick={() => setShowForm(s => !s)}
                    className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 shadow-lg shadow-primary/20">
                    {showForm ? '✕ Cancel' : '+ New Homework'}
                </button>
            </div>

            {/* Add form */}
            {showForm && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                    <h3 className="text-sm font-black uppercase text-gray-400 tracking-wider mb-4">New Assignment</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Class</label>
                            <select value={form.class_id} onChange={e => set('class_id', e.target.value)} className={inputClass}>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            {errors.class_id && <p className="text-xs text-red-500 mt-1">{errors.class_id}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Subject</label>
                            <input required value={form.subject_name} onChange={e => set('subject_name', e.target.value)}
                                placeholder="e.g. Mathematics" className={inputClass}/>
                            {errors.subject_name && <p className="text-xs text-red-500 mt-1">{errors.subject_name}</p>}
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Title</label>
                            <input required value={form.title} onChange={e => set('title', e.target.value)}
                                placeholder="e.g. Exercise 3.4 — Fractions" className={inputClass}/>
                            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Instructions (optional)</label>
                            <textarea value={form.description} onChange={e => set('description', e.target.value)}
                                rows={2} placeholder="Additional instructions…"
                                className={inputClass + ' resize-none'}/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Due Date</label>
                            <input type="date" required value={form.due_date} onChange={e => set('due_date', e.target.value)}
                                min={new Date().toISOString().split('T')[0]} className={inputClass}/>
                            {errors.due_date && <p className="text-xs text-red-500 mt-1">{errors.due_date}</p>}
                        </div>
                        <div className="flex items-end">
                            <button type="submit" disabled={saving}
                                className="w-full px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-60">
                                {saving ? 'Saving…' : 'Add Homework'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Lists */}
            {loading ? (
                <div className="p-12 text-center text-gray-400">Loading…</div>
            ) : list.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center text-gray-400 text-sm">
                    No homework assigned yet. Click "New Homework" to add one.
                </div>
            ) : (
                <>
                    {upcoming.length > 0 && (
                        <Section title="Upcoming" items={upcoming} onDelete={handleDelete} accent="primary"/>
                    )}
                    {overdue.length > 0 && (
                        <Section title="Overdue" items={overdue} onDelete={handleDelete} accent="red"/>
                    )}
                </>
            )}
        </div>
    );
};

const Section = ({ title, items, onDelete, accent }) => (
    <div>
        <p className={`text-xs font-black uppercase tracking-wider mb-3 ${accent === 'red' ? 'text-red-500' : 'text-primary'}`}>{title} ({items.length})</p>
        <div className="space-y-3">
            {items.map(h => (
                <div key={h.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 flex items-start gap-4">
                    <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${accent === 'red' ? 'bg-red-400' : 'bg-primary'}`}/>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 dark:text-gray-100">{h.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{h.subject_name} · {h.class_name}</p>
                        {h.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{h.description}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className={`text-xs font-black ${accent === 'red' ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                            Due {h.due_date}
                        </p>
                        <button onClick={() => onDelete(h.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors mt-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default TeacherHomework;
