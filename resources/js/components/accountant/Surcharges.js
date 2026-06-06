import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const REASON_LABELS = {
    late_payment:     'Late Payment',
    returned_cheque:  'Returned Cheque',
    custom:           'Custom',
};

const ApplyModal = ({ onClose, onSaved }) => {
    const [form, setForm] = useState({
        invoice_id: '', reason: 'late_payment', amount: '', is_percentage: false, notes: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError]   = useState(null);
    const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setError(null);
        try {
            await window.axios.post('/api/finance/surcharges', {
                ...form,
                invoice_id:    parseInt(form.invoice_id),
                amount:        parseInt(form.amount),
                is_percentage: !!form.is_percentage,
            });
            window.showToast?.('success', 'Surcharge applied.');
            onSaved(); onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to apply surcharge.');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-slate-200 dark:border-gray-700 w-full max-w-sm">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 rounded-t-lg">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wide">Apply Surcharge</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-3">
                    {error && <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">{error}</p>}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Invoice ID *</label>
                        <input required type="number" value={form.invoice_id} onChange={e => set('invoice_id', e.target.value)} className={inputCls}/>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Reason *</label>
                        <select value={form.reason} onChange={e => set('reason', e.target.value)} className={inputCls}>
                            {Object.entries(REASON_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Amount *</label>
                            <input required type="number" value={form.amount} onChange={e => set('amount', e.target.value)}
                                placeholder={form.is_percentage ? '1-100' : 'KSh'} className={inputCls}/>
                        </div>
                        <div className="flex items-end pb-2">
                            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                                <input type="checkbox" checked={form.is_percentage} onChange={e => set('is_percentage', e.target.checked)} className="rounded"/>
                                Percentage?
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Notes</label>
                        <input value={form.notes} onChange={e => set('notes', e.target.value)} className={inputCls}/>
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button type="submit" disabled={saving}
                            className="flex-1 py-2 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-red-700 disabled:opacity-60 transition-colors">
                            {saving ? 'Applying…' : 'Apply Surcharge'}
                        </button>
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2 border border-slate-300 dark:border-gray-600 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Surcharges = () => {
    const [surcharges, setSurcharges] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [showModal, setShowModal]   = useState(false);

    const fetchSurcharges = async () => {
        setLoading(true);
        try {
            const res = await window.axios.get('/api/finance/surcharges');
            setSurcharges(res.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchSurcharges(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this surcharge?')) return;
        try {
            await window.axios.delete(`/api/finance/surcharges/${id}`);
            setSurcharges(p => p.filter(s => s.id !== id));
            window.showToast?.('success', 'Surcharge removed.');
        } catch { window.showToast?.('error', 'Could not remove surcharge.'); }
    };

    const total = surcharges.reduce((a, s) => a + Number(s.amount), 0);

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">
            {showModal && <ApplyModal onClose={() => setShowModal(false)} onSaved={fetchSurcharges}/>}

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Finance <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Surcharges</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Surcharges &amp; Penalties</h1>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="px-4 py-1.5 bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-red-700 transition-colors">
                    + Apply Surcharge
                </button>
            </div>

            {/* Stats strip */}
            {!loading && (
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{surcharges.length}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Applied</span>
                    </div>
                    {total > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                            <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">KSh {total.toLocaleString()}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Penalised</span>
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {loading ? (
                    <div className="p-6"><SkeletonLoader type="table"/></div>
                ) : surcharges.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16">
                        <p className="text-slate-400 text-sm mb-4">No surcharges on record.</p>
                        <button onClick={() => setShowModal(true)}
                            className="px-4 py-2 bg-red-600 text-white font-bold text-sm rounded-md hover:bg-red-700 transition-colors">
                            + Apply First Surcharge
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left" style={{ minWidth: 760 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20">Inv #</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Student</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Reason</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Amount</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Notes</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Applied</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-right">Del</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {surcharges.map((s, i) => (
                                        <tr key={s.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                            i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                        }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{s.invoice_id}</td>
                                            <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{s.first_name} {s.last_name}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500">{REASON_LABELS[s.reason] || s.reason}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold font-mono text-red-500">
                                                {s.is_percentage ? `${s.amount}%` : `KSh ${Number(s.amount).toLocaleString()}`}
                                            </td>
                                            <td className="px-3 py-2 text-xs text-slate-400">{s.notes || '—'}</td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{s.applied_at?.split('T')[0] || '—'}</td>
                                            <td className="px-3 py-2 text-right">
                                                <button onClick={() => handleDelete(s.id)}
                                                    className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors">Del</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{surcharges.length} surcharge{surcharges.length !== 1 ? 's' : ''}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Surcharges;
