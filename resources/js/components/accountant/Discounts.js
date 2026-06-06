import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const TYPE_BADGE = {
    scholarship: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    sibling:     'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    staff_child: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
    bursary:     'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    sponsorship: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    custom:      'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
};

const DiscountModal = ({ onClose, onSaved }) => {
    const [form, setForm] = useState({
        student_id: '', invoice_id: '', discount_type: 'custom',
        amount_or_pct: '', is_percentage: false, reason: '',
        valid_from: '', valid_to: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError]   = useState(null);

    const setField = (f, v) => setForm(p => ({ ...p, [f]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setError(null);
        try {
            await window.axios.post('/api/finance/discounts', {
                ...form,
                student_id:    parseInt(form.student_id),
                invoice_id:    form.invoice_id ? parseInt(form.invoice_id) : null,
                amount_or_pct: parseInt(form.amount_or_pct),
                is_percentage: !!form.is_percentage,
            });
            window.showToast?.('success', 'Discount applied.');
            onSaved(); onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to apply discount.');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-slate-200 dark:border-gray-700 w-full max-w-md">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 rounded-t-lg">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wide">Apply Discount</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-3">
                    {error && <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">{error}</p>}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Student ID *</label>
                        <input required type="number" value={form.student_id} onChange={e => setField('student_id', e.target.value)} className={inputCls}/>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Invoice ID (blank = global)</label>
                        <input type="number" value={form.invoice_id} onChange={e => setField('invoice_id', e.target.value)}
                            placeholder="Leave blank for global discount" className={inputCls}/>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Discount Type *</label>
                        <select value={form.discount_type} onChange={e => setField('discount_type', e.target.value)} className={inputCls}>
                            {Object.keys(TYPE_BADGE).map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Value *</label>
                            <input required type="number" value={form.amount_or_pct} onChange={e => setField('amount_or_pct', e.target.value)}
                                placeholder={form.is_percentage ? '1–100' : 'KES'} className={inputCls}/>
                        </div>
                        <div className="flex items-end pb-2">
                            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                                <input type="checkbox" checked={form.is_percentage}
                                    onChange={e => setField('is_percentage', e.target.checked)} className="rounded"/>
                                Is percentage?
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Reason</label>
                        <input value={form.reason} onChange={e => setField('reason', e.target.value)} className={inputCls}/>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Valid From</label>
                            <input type="date" value={form.valid_from} onChange={e => setField('valid_from', e.target.value)} className={inputCls}/>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Valid To</label>
                            <input type="date" value={form.valid_to} onChange={e => setField('valid_to', e.target.value)} className={inputCls}/>
                        </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button type="submit" disabled={saving}
                            className="flex-1 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">
                            {saving ? 'Applying…' : 'Apply Discount'}
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

const Discounts = () => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [showModal, setShowModal] = useState(false);

    const fetchDiscounts = async () => {
        setLoading(true);
        try {
            const res = await window.axios.get('/api/finance/discounts');
            setDiscounts(res.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchDiscounts(); }, []);

    const handleDeactivate = async (id) => {
        if (!window.confirm('Deactivate this discount?')) return;
        try {
            await window.axios.delete(`/api/finance/discounts/${id}`);
            setDiscounts(p => p.filter(d => d.id !== id));
            window.showToast?.('success', 'Discount deactivated.');
        } catch { window.showToast?.('error', 'Could not deactivate.'); }
    };

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">
            {showModal && <DiscountModal onClose={() => setShowModal(false)} onSaved={fetchDiscounts}/>}

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Finance <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Discounts</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Discounts &amp; Scholarships</h1>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                    + Apply Discount
                </button>
            </div>

            {/* Stats strip */}
            {!loading && (
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{discounts.length}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Discounts</span>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {loading ? (
                    <div className="p-6"><SkeletonLoader type="table"/></div>
                ) : discounts.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16">
                        <p className="text-slate-400 text-sm mb-4">No discounts applied yet.</p>
                        <button onClick={() => setShowModal(true)}
                            className="px-4 py-2 bg-primary text-white font-bold text-sm rounded-md hover:bg-primary/90 transition-colors">
                            + Apply First Discount
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left" style={{ minWidth: 820 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Student</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20">Adm No</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Type</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Value</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Scope</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Reason</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-right">Del</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {discounts.map((d, i) => (
                                        <tr key={d.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                            i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                        }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                            <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{d.first_name} {d.last_name}</td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{d.admission_number}</td>
                                            <td className="px-3 py-2">
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${TYPE_BADGE[d.discount_type] || TYPE_BADGE.custom}`}>
                                                    {d.discount_type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-right text-xs font-bold font-mono text-emerald-600">
                                                {d.is_percentage ? `${d.amount_or_pct}%` : `KSh ${Number(d.amount_or_pct).toLocaleString()}`}
                                            </td>
                                            <td className="px-3 py-2 text-[10px] text-slate-400">
                                                {d.invoice_id ? `Inv #${d.invoice_id}` : 'Global'}
                                            </td>
                                            <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{d.reason || '—'}</td>
                                            <td className="px-3 py-2 text-right">
                                                <button onClick={() => handleDeactivate(d.id)}
                                                    className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors">Del</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{discounts.length} discounts</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Discounts;
