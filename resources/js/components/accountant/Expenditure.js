import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const CATEGORIES = ['Utilities', 'Supplies', 'Maintenance', 'Training', 'Educational', 'Operations', 'HR', 'Other'];

const RecordModal = ({ onClose, onSaved }) => {
    const [form, setForm] = useState({
        description: '', category: '', vendor: '', amount: '',
        expense_date: new Date().toISOString().split('T')[0], notes: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError]   = useState(null);
    const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setError(null);
        try {
            await window.axios.post('/api/finance/expenses', {
                ...form, amount: parseInt(form.amount),
            });
            window.showToast?.('success', 'Expense recorded.');
            onSaved(); onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to record expense.');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-slate-200 dark:border-gray-700 w-full max-w-md">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 rounded-t-lg">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wide">Record Expense</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-3">
                    {error && <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">{error}</p>}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Description *</label>
                        <input required value={form.description} onChange={e => set('description', e.target.value)}
                            placeholder="e.g. Electricity Bill" className={inputCls}/>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Category *</label>
                            <select required value={form.category} onChange={e => set('category', e.target.value)} className={inputCls}>
                                <option value="">Select…</option>
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Amount (KSh) *</label>
                            <input required type="number" value={form.amount} onChange={e => set('amount', e.target.value)}
                                placeholder="0" min="1" className={inputCls}/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Vendor</label>
                        <input value={form.vendor} onChange={e => set('vendor', e.target.value)} className={inputCls}/>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Date</label>
                        <input type="date" value={form.expense_date} onChange={e => set('expense_date', e.target.value)} className={inputCls}/>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Notes</label>
                        <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)}
                            className={inputCls + ' resize-none'}/>
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button type="submit" disabled={saving}
                            className="flex-1 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">
                            {saving ? 'Saving…' : 'Record Expense'}
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

const Expenditure = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter]     = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = { per_page: 50 };
            if (filter) params.category = filter;
            const res = await window.axios.get('/api/finance/expenses', { params });
            setExpenses(res.data.data || res.data || []);
        } catch { setExpenses([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const total   = expenses.reduce((a, e) => a + Number(e.amount), 0);
    const paid    = expenses.filter(e => e.status === 'paid').reduce((a, e) => a + Number(e.amount), 0);
    const pending = expenses.filter(e => e.status === 'pending').reduce((a, e) => a + Number(e.amount), 0);

    const filtered = filter ? expenses.filter(e => e.category === filter) : expenses;

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">
            {showModal && <RecordModal onClose={() => setShowModal(false)} onSaved={fetchData}/>}

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Finance <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Expenditure</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Expenditure Management</h1>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                    + Record Expense
                </button>
            </div>

            {/* Stats strip */}
            {!loading && expenses.length > 0 && (
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                    {[
                        { label: 'Total Expenses', value: `KSh ${total.toLocaleString()}`,   cls: 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800' },
                        { label: 'Paid',           value: `KSh ${paid.toLocaleString()}`,    cls: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' },
                        { label: 'Pending',        value: `KSh ${pending.toLocaleString()}`, cls: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20' },
                    ].map(c => (
                        <div key={c.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${c.cls}`}>
                            <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{c.value}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{c.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Category tabs */}
            {expenses.length > 0 && (
                <div className="flex-shrink-0 flex border-b border-slate-200 dark:border-gray-700 overflow-x-auto">
                    {['', ...CATEGORIES].map(cat => (
                        <button key={cat} onClick={() => setFilter(cat)}
                            className={`px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap capitalize transition-colors ${
                                filter === cat
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}>
                            {cat === '' ? 'All' : cat}
                        </button>
                    ))}
                </div>
            )}

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {loading ? (
                    <div className="p-6"><SkeletonLoader type="table"/></div>
                ) : expenses.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16">
                        <p className="text-slate-400 text-sm mb-4">No expenses recorded.</p>
                        <button onClick={() => setShowModal(true)}
                            className="px-4 py-2 bg-primary text-white font-bold text-sm rounded-md hover:bg-primary/90 transition-colors">
                            + Record First Expense
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left" style={{ minWidth: 880 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20">Ref</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Date</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Description</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Category</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Vendor</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Amount</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((e, i) => (
                                        <tr key={e.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                            i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                        }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{e.expense_number || `EXP-${e.id}`}</td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{e.expense_date}</td>
                                            <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{e.description}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500">{e.category}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500">{e.vendor || '—'}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold font-mono text-red-500">
                                                KSh {Number(e.amount).toLocaleString()}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                                    e.status === 'paid'
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                                }`}>
                                                    {e.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{filtered.length} expense{filtered.length !== 1 ? 's' : ''}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Expenditure;
