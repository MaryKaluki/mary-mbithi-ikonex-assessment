import React, { useState, useEffect } from 'react';

const COLORS = [
    { label: 'Purple', value: 'bg-purple-500' }, { label: 'Blue',   value: 'bg-blue-500'   },
    { label: 'Green',  value: 'bg-green-500'  }, { label: 'Red',    value: 'bg-red-500'    },
    { label: 'Yellow', value: 'bg-yellow-500' }, { label: 'Orange', value: 'bg-orange-500' },
    { label: 'Pink',   value: 'bg-pink-500'   }, { label: 'Indigo', value: 'bg-indigo-500' },
];

const fmtKES = (n) => 'KSh ' + Number(n).toLocaleString('en-KE');

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const BudgetModal = ({ item, onClose, onSaved }) => {
    const [form, setForm] = useState({
        name:      item?.name      ?? '',
        allocated: item?.allocated ?? '',
        actual:    item?.actual    ?? '',
        color:     item?.color     ?? 'bg-blue-500',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError]   = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setError(null);
        try {
            if (item?.id) await window.axios.put(`/api/admin/budgets/${item.id}`, form);
            else          await window.axios.post('/api/admin/budgets', form);
            onSaved(); onClose();
        } catch (err) { setError(err.response?.data?.message || 'Failed to save.'); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-slate-200 dark:border-gray-700">
                <div className="px-5 py-3.5 bg-slate-50 dark:bg-gray-900/50 border-b border-slate-100 dark:border-gray-700 rounded-t-lg flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
                        {item?.id ? 'Edit' : 'Add'} Budget Category
                    </span>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3">
                    {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">{error}</p>}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Category Name *</label>
                        <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                            placeholder="e.g. Teaching Materials" className={inputCls}/>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Allocated (KSh)</label>
                            <input required type="number" min="0" value={form.allocated}
                                onChange={e => setForm({...form, allocated: e.target.value})} placeholder="0" className={inputCls}/>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Actual Spent (KSh)</label>
                            <input type="number" min="0" value={form.actual}
                                onChange={e => setForm({...form, actual: e.target.value})} placeholder="0" className={inputCls}/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Colour</label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map(c => (
                                <button key={c.value} type="button" onClick={() => setForm({...form, color: c.value})}
                                    className={`w-7 h-7 rounded-full ${c.value} ${form.color === c.value ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-gray-800' : ''}`}
                                    title={c.label}/>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-2 mt-1">
                        <button type="submit" disabled={saving}
                            className="flex-1 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">
                            {saving ? 'Saving…' : 'Save'}
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

const BudgetPlanner = () => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal]     = useState(null);

    const load = async () => {
        setLoading(true);
        try { const res = await window.axios.get('/api/admin/budgets'); setBudgets(res.data); }
        catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this budget category?')) return;
        try {
            await window.axios.delete(`/api/admin/budgets/${id}`);
            setBudgets(prev => prev.filter(b => b.id !== id));
            window.showToast?.('success', 'Category deleted.');
        } catch { window.showToast?.('error', 'Could not delete.'); }
    };

    const totalAllocated = budgets.reduce((s, b) => s + parseFloat(b.allocated || 0), 0);
    const totalActual    = budgets.reduce((s, b) => s + parseFloat(b.actual    || 0), 0);
    const overallPct     = totalAllocated > 0 ? Math.round((totalActual / totalAllocated) * 100) : 0;

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">
            {modal !== null && <BudgetModal item={modal} onClose={() => setModal(null)} onSaved={load}/>}

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Admin <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Budget Planner</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">
                        Budget &amp; Financial Plan
                        <span className="ml-2 text-xs font-normal text-slate-400">— {new Date().getFullYear()}</span>
                    </h1>
                </div>
                <button onClick={() => setModal({})}
                    className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                    + Add Category
                </button>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-2 flex-shrink-0">
                {[
                    { label: 'Total Allocated', value: fmtKES(totalAllocated), cls: 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800' },
                    { label: 'Actual Spent',    value: fmtKES(totalActual),    cls: totalActual > totalAllocated ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' : 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' },
                    { label: 'Utilisation',     value: `${overallPct}%`,       cls: overallPct > 100 ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' },
                ].map(c => (
                    <div key={c.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${c.cls}`}>
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{c.value}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{c.label}</span>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Loading…</div>
                ) : budgets.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">No budget categories yet.</div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left" style={{ minWidth: 680 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Category</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-32 text-right">Allocated</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-32 text-right">Actual Spent</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-40">Utilisation</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {budgets.map((item, i) => {
                                        const actual    = parseFloat(item.actual    || 0);
                                        const allocated = parseFloat(item.allocated || 0);
                                        const pct       = allocated > 0 ? Math.min((actual / allocated) * 100, 100).toFixed(0) : 0;
                                        const over      = actual > allocated;
                                        return (
                                            <tr key={item.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                                i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                            }`}>
                                                <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                                <td className="px-3 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.color}`}/>
                                                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">{item.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 text-right text-xs font-mono text-slate-500 dark:text-slate-400">{fmtKES(allocated)}</td>
                                                <td className="px-3 py-2 text-right text-xs font-bold font-mono">
                                                    <span className={over ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}>{fmtKES(actual)}</span>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${over ? 'bg-red-500' : item.color}`} style={{ width: `${pct}%` }}/>
                                                        </div>
                                                        <span className={`text-[10px] font-bold w-10 text-right ${over ? 'text-red-500' : 'text-slate-500'}`}>
                                                            {over ? '>100%' : `${pct}%`}
                                                        </span>
                                                    </div>
                                                    {over && <p className="text-[9px] text-red-500 font-bold uppercase tracking-wider mt-0.5">Over Budget</p>}
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => setModal(item)}
                                                            className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">Edit</button>
                                                        <button onClick={() => handleDelete(item.id)}
                                                            className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors">Del</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{budgets.length} categories</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BudgetPlanner;
