import React, { useState, useEffect } from 'react';

const LEAVE_TYPES = ['Annual', 'Sick', 'Emergency', 'Maternity', 'Paternity', 'Other'];
const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const statusBadge = (status) => {
    if (status === 'Approved') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (status === 'Rejected') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
};

const TeacherLeave = () => {
    const [leaves,   setLeaves]   = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving,   setSaving]   = useState(false);
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
        return Math.max(Math.ceil((new Date(form.end_date) - new Date(form.start_date)) / 86400000) + 1, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true); setErrors({});
        try {
            await window.axios.post('/api/teacher/leave', form);
            setShowForm(false); setForm(f => ({ ...f, reason: '' }));
            window.showToast?.('success', 'Leave request submitted.');
            load();
        } catch (err) {
            if (err.response?.status === 422) {
                const flat = {};
                Object.keys(err.response.data.errors || {}).forEach(k => { flat[k] = err.response.data.errors[k][0]; });
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
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Teacher <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Leave Requests</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">
                        My Leave Requests
                        {!loading && <span className="ml-2 text-xs font-normal text-slate-400">— {leaves.length} total</span>}
                    </h1>
                </div>
                <button onClick={() => setShowForm(s => !s)}
                    className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary/90 text-sm transition-all duration-200">
                    {showForm ? '✕ Cancel' : '+ Apply for Leave'}
                </button>
            </div>

            {/* Summary strip */}
            {leaves.length > 0 && (
                <div className="flex gap-2 flex-shrink-0">
                    {[
                        { label: 'Pending',  value: pending,  cls: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20' },
                        { label: 'Approved', value: approved, cls: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' },
                        { label: 'Total',    value: leaves.length, cls: 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800' },
                    ].map(c => (
                        <div key={c.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${c.cls}`}>
                            <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{c.value}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{c.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Application form */}
            {showForm && (
                <div className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
                    <div className="px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">New Leave Request</span>
                    </div>
                    <form onSubmit={handleSubmit} className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Leave Type</label>
                            <select value={form.type} onChange={e => set('type', e.target.value)} className={inputCls}>
                                {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                                Duration — {computeDays()} day{computeDays() !== 1 ? 's' : ''}
                            </label>
                            <div className="flex gap-2">
                                <input type="date" value={form.start_date} min={new Date().toISOString().split('T')[0]}
                                    onChange={e => set('start_date', e.target.value)} className={inputCls}/>
                                <input type="date" value={form.end_date} min={form.start_date}
                                    onChange={e => set('end_date', e.target.value)} className={inputCls}/>
                            </div>
                            {(errors.start_date || errors.end_date) && (
                                <p className="text-xs text-red-500 mt-1">{errors.start_date || errors.end_date}</p>
                            )}
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Reason *</label>
                            <textarea required value={form.reason} onChange={e => set('reason', e.target.value)}
                                rows={3} placeholder="Briefly explain the reason for your leave request…"
                                className={inputCls + ' resize-none'}/>
                            {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
                        </div>
                        <div className="sm:col-span-2 flex justify-end">
                            <button type="submit" disabled={saving}
                                className="px-5 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">
                                {saving ? 'Submitting…' : 'Submit Request'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Leave history table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Loading…</div>
                ) : leaves.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-slate-400 text-sm">No leave requests yet. Click "Apply for Leave" to submit one.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-left border-collapse" style={{ minWidth: 580 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Type</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">From</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">To</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-12 text-center">Days</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Reason</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Status</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Applied</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaves.map((l, i) => (
                                        <tr key={l.id}
                                            className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                                i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                            }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">
                                                {String(i + 1).padStart(2, '0')}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-gray-300">
                                                    {l.type}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-xs font-mono text-slate-500 dark:text-slate-400">{l.start_date}</td>
                                            <td className="px-3 py-2 text-xs font-mono text-slate-500 dark:text-slate-400">{l.end_date}</td>
                                            <td className="px-3 py-2 text-center text-xs font-bold text-slate-600 dark:text-slate-300">{l.days}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 italic max-w-xs truncate" title={l.reason}>{l.reason}</td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${statusBadge(l.status)}`}>
                                                    {l.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400 dark:text-slate-500">{l.created_at}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{leaves.length} request{leaves.length !== 1 ? 's' : ''}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TeacherLeave;
