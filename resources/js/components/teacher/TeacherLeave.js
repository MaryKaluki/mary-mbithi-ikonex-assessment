import React, { useState, useEffect } from 'react';

const STATUS_COLOR = {
    Pending:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    Approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    Rejected: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300',
};

const LEAVE_TYPES = ['Annual', 'Sick', 'Emergency', 'Maternity', 'Paternity', 'Other'];

const inputClass = "w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40";

const TeacherLeave = () => {
    const [leaves, setLeaves]     = useState([]);
    const [loading, setLoading]   = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving]     = useState(false);
    const [form, setForm] = useState({
        type: 'Annual',
        start_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        end_date:   new Date(Date.now() + 86400000).toISOString().split('T')[0],
        reason: '',
    });
    const [errors, setErrors] = useState({});

    const load = async () => {
        try {
            const res = await window.axios.get('/api/teacher/leave');
            setLeaves(res.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const set = (k, v) => {
        setForm(f => ({ ...f, [k]: v }));
        if (errors[k]) setErrors(e => ({ ...e, [k]: null }));
    };

    const computeDays = () => {
        if (!form.start_date || !form.end_date) return 0;
        const d = Math.ceil((new Date(form.end_date) - new Date(form.start_date)) / 86400000) + 1;
        return Math.max(d, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        try {
            await window.axios.post('/api/teacher/leave', form);
            setShowForm(false);
            setForm(f => ({ ...f, reason: '' }));
            window.showToast?.('success', 'Leave request submitted.');
            load();
        } catch (err) {
            if (err.response?.status === 422) {
                const raw = err.response.data.errors || {};
                const flat = {};
                Object.keys(raw).forEach(k => { flat[k] = raw[k][0]; });
                setErrors(flat);
            } else {
                window.showToast?.('error', err.response?.data?.message || 'Failed to submit leave request.');
            }
        } finally {
            setSaving(false);
        }
    };

    const pending  = leaves.filter(l => l.status === 'Pending').length;
    const approved = leaves.filter(l => l.status === 'Approved').length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">My Leave Requests</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Apply for and track your leave</p>
                </div>
                <button onClick={() => setShowForm(s => !s)}
                    className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 shadow-lg shadow-primary/20">
                    {showForm ? '✕ Cancel' : '+ Apply for Leave'}
                </button>
            </div>

            {/* Summary */}
            {leaves.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 text-center">
                        <p className="text-2xl font-extrabold text-yellow-600">{pending}</p>
                        <p className="text-xs font-black uppercase text-gray-400 tracking-wider mt-1">Pending</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 text-center">
                        <p className="text-2xl font-extrabold text-green-600">{approved}</p>
                        <p className="text-xs font-black uppercase text-gray-400 tracking-wider mt-1">Approved</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 text-center">
                        <p className="text-2xl font-extrabold text-gray-400">{leaves.length}</p>
                        <p className="text-xs font-black uppercase text-gray-400 tracking-wider mt-1">Total</p>
                    </div>
                </div>
            )}

            {/* Request form */}
            {showForm && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                    <h3 className="text-sm font-black uppercase text-gray-400 tracking-wider mb-4">New Leave Request</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Leave Type</label>
                            <select value={form.type} onChange={e => set('type', e.target.value)} className={inputClass}>
                                {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="sm:col-span-1">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                                Duration — {computeDays()} day{computeDays() !== 1 ? 's' : ''}
                            </label>
                            <div className="flex gap-2">
                                <input type="date" value={form.start_date}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={e => set('start_date', e.target.value)}
                                    className={inputClass}/>
                                <input type="date" value={form.end_date}
                                    min={form.start_date}
                                    onChange={e => set('end_date', e.target.value)}
                                    className={inputClass}/>
                            </div>
                            {(errors.start_date || errors.end_date) && (
                                <p className="text-xs text-red-500 mt-1">{errors.start_date || errors.end_date}</p>
                            )}
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Reason</label>
                            <textarea required value={form.reason} onChange={e => set('reason', e.target.value)}
                                rows={3} placeholder="Briefly explain the reason for your leave request…"
                                className={inputClass + ' resize-none'}/>
                            {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
                        </div>
                        <div className="sm:col-span-2 flex justify-end">
                            <button type="submit" disabled={saving}
                                className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-60 shadow-lg shadow-primary/20">
                                {saving ? 'Submitting…' : 'Submit Request'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="p-12 text-center text-gray-400">Loading…</div>
            ) : leaves.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center text-gray-400 text-sm">
                    No leave requests yet. Click "Apply for Leave" to submit one.
                </div>
            ) : (
                <div className="space-y-3">
                    {leaves.map(l => (
                        <div key={l.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-extrabold text-gray-800 dark:text-gray-100">{l.type} Leave</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${STATUS_COLOR[l.status]}`}>{l.status}</span>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        {l.start_date} → {l.end_date} · <strong>{l.days} day{l.days !== 1 ? 's' : ''}</strong>
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{l.reason}</p>
                                    {l.admin_note && (
                                        <p className="text-xs text-gray-400 mt-1 italic">Admin note: {l.admin_note}</p>
                                    )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-xs text-gray-400">Applied {l.created_at}</p>
                                    {l.approved_by && (
                                        <p className="text-xs text-gray-400 mt-0.5">By {l.approved_by}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeacherLeave;
