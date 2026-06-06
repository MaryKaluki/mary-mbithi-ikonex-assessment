import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const statusBadge = (status) => {
    const map = {
        'Active': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
        'Full':   'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
        'Closed': 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300',
    };
    return map[status] || map['Active'];
};

const AddDormModal = ({ onClose, onSaved }) => {
    const [form, setForm]     = useState({ name: '', type: 'Boys', capacity: 100, status: 'Active' });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await window.axios.post('/api/admin/dorms', form);
            window.showToast('success', 'Dormitory added successfully.');
            onSaved();
            onClose();
        } catch { window.showToast('error', 'Failed to add dormitory.'); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm border border-slate-200 dark:border-gray-700">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 rounded-t-lg">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wide">Add Dormitory</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Dormitory Name *</label>
                        <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                            placeholder="e.g. Sunrise Hall" className={inputCls}/>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Type</label>
                            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className={inputCls}>
                                {['Boys','Girls','Junior Boys','Junior Girls','Mixed'].map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Capacity</label>
                            <input type="number" min="1" value={form.capacity}
                                onChange={e => setForm({...form, capacity: parseInt(e.target.value)})} className={inputCls}/>
                        </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button type="submit" disabled={saving}
                            className="flex-1 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">
                            {saving ? 'Saving…' : 'Add Dormitory'}
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

const DormManager = () => {
    const [dorms, setDorms]         = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const fetchDorms = async () => {
        setIsLoading(true);
        try {
            const res = await window.axios.get('/api/admin/dorms');
            setDorms(res.data);
        } catch { window.showToast('error', 'Failed to load dormitories.'); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchDorms(); }, []);

    const occupancyPct = (d) => d.capacity > 0 ? Math.round((d.occupied / d.capacity) * 100) : 0;

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">
            {showModal && <AddDormModal onClose={() => setShowModal(false)} onSaved={fetchDorms}/>}

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Admin <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Dormitory Manager</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Dormitory Management</h1>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                    + Add Dormitory
                </button>
            </div>

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {isLoading ? (
                    <div className="p-6"><SkeletonLoader type="table"/></div>
                ) : dorms.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16">
                        <p className="text-slate-400 text-sm mb-4">No dormitories found.</p>
                        <button onClick={() => setShowModal(true)}
                            className="px-4 py-2 bg-primary text-white font-bold text-sm rounded-md hover:bg-primary/90 transition-all duration-200">
                            + Add First Dormitory
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left" style={{ minWidth: 600 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Dormitory</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Type</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-36">Warden</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-44">Occupancy</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dorms.map((dorm, i) => {
                                        const pct = occupancyPct(dorm);
                                        return (
                                            <tr key={dorm.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                                i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                            }`}>
                                                <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                                <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{dorm.name}</td>
                                                <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{dorm.type}</td>
                                                <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{dorm.warden || '—'}</td>
                                                <td className="px-3 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${pct >= 95 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                                                style={{ width: `${pct}%` }}/>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                            {dorm.occupied}/{dorm.capacity}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${statusBadge(dorm.status)}`}>
                                                        {dorm.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{dorms.length} dormitories</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DormManager;
