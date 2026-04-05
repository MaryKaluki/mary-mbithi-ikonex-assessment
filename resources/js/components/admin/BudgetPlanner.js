import React, { useState, useEffect } from 'react';

const COLORS = [
    { label: 'Purple', value: 'bg-purple-500' },
    { label: 'Blue',   value: 'bg-blue-500' },
    { label: 'Green',  value: 'bg-green-500' },
    { label: 'Red',    value: 'bg-red-500' },
    { label: 'Yellow', value: 'bg-yellow-500' },
    { label: 'Orange', value: 'bg-orange-500' },
    { label: 'Pink',   value: 'bg-pink-500' },
    { label: 'Indigo', value: 'bg-indigo-500' },
];

const fmtKES = (n) => 'KES ' + Number(n).toLocaleString('en-KE');

const BudgetModal = ({ item, onClose, onSaved }) => {
    const [form, setForm] = useState({
        name:      item?.name      ?? '',
        allocated: item?.allocated ?? '',
        actual:    item?.actual    ?? '',
        color:     item?.color     ?? 'bg-purple-500',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError]   = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            if (item?.id) {
                await window.axios.put(`/api/admin/budgets/${item.id}`, form);
            } else {
                await window.axios.post('/api/admin/budgets', form);
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-800 dark:text-white">{item?.id ? 'Edit' : 'Add'} Budget Category</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Category Name</label>
                        <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                            placeholder="e.g. Teaching Materials" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Allocated (KES)</label>
                            <input required type="number" min="0" value={form.allocated} onChange={e => setForm({...form, allocated: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                                placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Actual Spent (KES)</label>
                            <input type="number" min="0" value={form.actual} onChange={e => setForm({...form, actual: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                                placeholder="0" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Colour</label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map(c => (
                                <button key={c.value} type="button" onClick={() => setForm({...form, color: c.value})}
                                    className={`w-7 h-7 rounded-full ${c.value} ${form.color === c.value ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800' : ''}`}
                                    title={c.label} />
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-500">Cancel</button>
                        <button type="submit" disabled={saving} className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-60">
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const BudgetPlanner = () => {
    const [budgets, setBudgets]   = useState([]);
    const [loading, setLoading]   = useState(true);
    const [modal, setModal]       = useState(null); // null | {} | {id,...}

    const load = async () => {
        setLoading(true);
        try {
            const res = await window.axios.get('/api/admin/budgets');
            setBudgets(res.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this budget category?')) return;
        try {
            await window.axios.delete(`/api/admin/budgets/${id}`);
            setBudgets(prev => prev.filter(b => b.id !== id));
            window.showToast?.('success', 'Category deleted.');
        } catch {
            window.showToast?.('error', 'Could not delete.');
        }
    };

    const totalAllocated = budgets.reduce((s, b) => s + parseFloat(b.allocated || 0), 0);
    const totalActual    = budgets.reduce((s, b) => s + parseFloat(b.actual    || 0), 0);
    const overallPct     = totalAllocated > 0 ? Math.round((totalActual / totalAllocated) * 100) : 0;

    return (
        <div className="space-y-6">
            {modal !== null && (
                <BudgetModal item={modal} onClose={() => setModal(null)} onSaved={load} />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Budget & Financial Plan</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Fiscal Year {new Date().getFullYear()}</p>
                </div>
                <button onClick={() => setModal({})}
                    className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 shadow-lg shadow-primary/20">
                    + Add Category
                </button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                    <p className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">Total Allocated</p>
                    <p className="text-2xl font-extrabold text-gray-800 dark:text-white">{fmtKES(totalAllocated)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                    <p className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">Actual Spent</p>
                    <p className={`text-2xl font-extrabold ${totalActual > totalAllocated ? 'text-red-600' : 'text-green-600'}`}>
                        {fmtKES(totalActual)}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                    <p className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">Overall Utilisation</p>
                    <p className={`text-2xl font-extrabold ${overallPct > 100 ? 'text-red-600' : 'text-primary'}`}>{overallPct}%</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    <div className="col-span-4">Department / Category</div>
                    <div className="col-span-2 text-right">Allocated</div>
                    <div className="col-span-2 text-right">Actual Spent</div>
                    <div className="col-span-3 text-center">Utilisation</div>
                    <div className="col-span-1"></div>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-gray-400">
                        <svg className="animate-spin w-8 h-8 mx-auto mb-2 text-primary" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Loading...
                    </div>
                ) : budgets.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">No budget categories yet. Add one to get started.</div>
                ) : (
                    <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                        {budgets.map((item) => {
                            const actual    = parseFloat(item.actual || 0);
                            const allocated = parseFloat(item.allocated || 0);
                            const pct       = allocated > 0 ? Math.min((actual / allocated) * 100, 100).toFixed(0) : 0;
                            const over      = actual > allocated;
                            return (
                                <div key={item.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                    <div className="col-span-4 flex items-center gap-3">
                                        <span className={`w-3 h-3 rounded-full flex-shrink-0 ${item.color}`}></span>
                                        <span className="font-bold text-sm text-gray-800 dark:text-gray-100">{item.name}</span>
                                    </div>
                                    <div className="col-span-2 lg:text-right text-sm font-mono text-gray-500 dark:text-gray-400">
                                        {fmtKES(allocated)}
                                    </div>
                                    <div className="col-span-2 lg:text-right text-sm font-mono font-bold">
                                        <span className={over ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}>
                                            {fmtKES(actual)}
                                        </span>
                                    </div>
                                    <div className="col-span-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${over ? 'bg-red-500' : item.color}`} style={{ width: `${pct}%` }}></div>
                                            </div>
                                            <span className={`text-xs font-bold w-12 text-right ${over ? 'text-red-600 dark:text-red-400' : 'text-gray-500'}`}>
                                                {over ? '>100%' : `${pct}%`}
                                            </span>
                                        </div>
                                        {over && <div className="text-[10px] text-red-500 mt-0.5 font-black uppercase tracking-wider">Over Budget</div>}
                                    </div>
                                    <div className="col-span-1 flex items-center justify-end gap-2">
                                        <button onClick={() => setModal(item)} className="text-gray-400 hover:text-primary transition-colors" title="Edit">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                            </svg>
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BudgetPlanner;
