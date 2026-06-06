import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const APPLICABLE_OPTIONS = ['all', 'day', 'boarding', 'grade'];

const FeeStructureModal = ({ onClose, onSaved }) => {
    const [form, setForm]     = useState({ name: '' });
    const [items, setItems]   = useState([{ name: '', amount: '', applicable_to: 'all', is_optional: false, is_recurring: true, sort_order: 0 }]);
    const [saving, setSaving] = useState(false);
    const [error, setError]   = useState(null);

    const setField = (f, v) => setForm(p => ({ ...p, [f]: v }));
    const setItem  = (i, f, v) => setItems(p => p.map((it, idx) => idx === i ? { ...it, [f]: v } : it));
    const addItem  = () => setItems(p => [...p, { name: '', amount: '', applicable_to: 'all', is_optional: false, is_recurring: true, sort_order: p.length }]);
    const removeItem = (i) => setItems(p => p.filter((_, idx) => idx !== i));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setError(null);
        try {
            await window.axios.post('/api/finance/fee-structures', {
                name: form.name,
                items: items.map((it, i) => ({ ...it, amount: parseInt(it.amount) || 0, sort_order: i })),
            });
            window.showToast?.('success', 'Fee structure created.');
            onSaved(); onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save.');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-slate-200 dark:border-gray-700 w-full max-w-xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 rounded-t-lg flex-shrink-0">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wide">New Fee Structure</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
                    {error && <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">{error}</p>}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Structure Name *</label>
                        <input required value={form.name} onChange={e => setField('name', e.target.value)}
                            placeholder="e.g. Grade 4 Day Scholar 2026" className={inputCls}/>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Fee Items</label>
                            <button type="button" onClick={addItem}
                                className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">
                                + Add Item
                            </button>
                        </div>
                        {items.map((item, i) => (
                            <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center">
                                <input className={inputCls + ' col-span-4'} placeholder="Item name" required
                                    value={item.name} onChange={e => setItem(i, 'name', e.target.value)}/>
                                <input className={inputCls + ' col-span-2'} placeholder="KES" type="number" required min="0"
                                    value={item.amount} onChange={e => setItem(i, 'amount', e.target.value)}/>
                                <select className={inputCls + ' col-span-3'} value={item.applicable_to}
                                    onChange={e => setItem(i, 'applicable_to', e.target.value)}>
                                    {APPLICABLE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                                <label className="col-span-2 flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer">
                                    <input type="checkbox" checked={item.is_optional}
                                        onChange={e => setItem(i, 'is_optional', e.target.checked)} className="rounded"/>
                                    Optional
                                </label>
                                <button type="button" onClick={() => removeItem(i)} className="col-span-1 text-red-400 hover:text-red-600 text-lg leading-none font-bold">&times;</button>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2 pt-1">
                        <button type="submit" disabled={saving}
                            className="flex-1 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">
                            {saving ? 'Saving…' : 'Save Structure'}
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

const FeeStructures = () => {
    const [structures, setStructures] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [expanded, setExpanded]     = useState(null);
    const [showModal, setShowModal]   = useState(false);

    const fetchStructures = async () => {
        setLoading(true);
        try {
            const res = await window.axios.get('/api/finance/fee-structures');
            setStructures(res.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchStructures(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this fee structure?')) return;
        try {
            await window.axios.delete(`/api/finance/fee-structures/${id}`);
            setStructures(p => p.filter(s => s.id !== id));
            window.showToast?.('success', 'Fee structure deleted.');
        } catch (err) {
            window.showToast?.('error', err.response?.data?.message || 'Could not delete.');
        }
    };

    const activeCount = structures.length;
    const totalItems  = structures.reduce((a, s) => a + (s.items?.length || 0), 0);

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">
            {showModal && <FeeStructureModal onClose={() => setShowModal(false)} onSaved={fetchStructures}/>}

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Finance <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Fee Structures</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Fee Structures</h1>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                    + New Structure
                </button>
            </div>

            {/* Stats strip */}
            {!loading && (
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{activeCount}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Structures</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{totalItems}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fee Items</span>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {loading ? (
                    <div className="p-6"><SkeletonLoader type="table"/></div>
                ) : structures.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16">
                        <p className="text-slate-400 text-sm mb-4">No fee structures yet.</p>
                        <button onClick={() => setShowModal(true)}
                            className="px-4 py-2 bg-primary text-white font-bold text-sm rounded-md hover:bg-primary/90 transition-colors">
                            + Create First Structure
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left" style={{ minWidth: 720 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Structure Name</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Items</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-32 text-right">Total (KES)</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {structures.map((s, i) => (
                                        <React.Fragment key={s.id}>
                                            <tr className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors cursor-default ${
                                                i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                            }`}>
                                                <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                                <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{s.name}</td>
                                                <td className="px-3 py-2 text-center text-xs text-slate-500">{s.items?.length || 0}</td>
                                                <td className="px-3 py-2 text-right text-xs font-bold font-mono text-slate-700 dark:text-slate-200">
                                                    {Number(s.total_amount).toLocaleString()}
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    <div className="flex gap-3 justify-end">
                                                        <button onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                                                            className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">
                                                            {expanded === s.id ? 'Hide' : 'Items'}
                                                        </button>
                                                        <button onClick={() => handleDelete(s.id)}
                                                            className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors">
                                                            Del
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expanded === s.id && s.items && s.items.length > 0 && (
                                                <tr className="bg-slate-50/50 dark:bg-gray-700/20 border-b border-slate-100 dark:border-gray-700/60">
                                                    <td colSpan={5} className="px-4 py-3">
                                                        <table className="w-full text-left">
                                                            <thead>
                                                                <tr className="text-[9px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-gray-600">
                                                                    <th className="pb-1 pr-3">Item</th>
                                                                    <th className="pb-1 pr-3 w-24">Applies To</th>
                                                                    <th className="pb-1 pr-3 w-16">Optional</th>
                                                                    <th className="pb-1 text-right w-24">Amount</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {s.items.map(item => (
                                                                    <tr key={item.id} className="text-xs">
                                                                        <td className="py-1 pr-3 text-slate-700 dark:text-slate-200 font-medium">{item.name}</td>
                                                                        <td className="py-1 pr-3 text-slate-400 capitalize">{item.applicable_to}</td>
                                                                        <td className="py-1 pr-3 text-slate-400">{item.is_optional ? 'Yes' : '—'}</td>
                                                                        <td className="py-1 text-right font-mono text-slate-600 dark:text-slate-300">
                                                                            {Number(item.amount).toLocaleString()}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{structures.length} structures</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FeeStructures;
