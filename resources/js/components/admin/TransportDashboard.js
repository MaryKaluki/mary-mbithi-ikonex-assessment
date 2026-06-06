import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const statusBadge = (status) => {
    const map = {
        'Active':     'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
        'In Transit': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
        'Arrived':    'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
        'Delayed':    'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
        'Inactive':   'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300',
    };
    return map[status] || map['Inactive'];
};

const AddRouteModal = ({ onClose, onSaved }) => {
    const [form, setForm]     = useState({ name: '', status: 'Active' });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await window.axios.post('/api/admin/transport/routes', form);
            window.showToast?.('success', 'Route added.');
            onSaved();
            onClose();
        } catch { window.showToast?.('error', 'Failed to add route.'); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm border border-slate-200 dark:border-gray-700">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 rounded-t-lg">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wide">Add Route</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Route Name *</label>
                        <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})
                        } placeholder="e.g. Route A (North)" className={inputCls}/>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Status</label>
                        <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className={inputCls}>
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button type="submit" disabled={saving}
                            className="flex-1 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">
                            {saving ? 'Saving…' : 'Add Route'}
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

const TransportDashboard = () => {
    const [stats, setStats]       = useState({ total_buses: 0, active_routes: 0, total_drivers: 0, in_maintenance: 0 });
    const [routes, setRoutes]     = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const load = async () => {
        setIsLoading(true);
        try {
            const [sRes, rRes] = await Promise.all([
                window.axios.get('/api/admin/transport/stats'),
                window.axios.get('/api/admin/transport/routes'),
            ]);
            setStats(sRes.data);
            setRoutes(rRes.data);
        } catch { window.showToast?.('error', 'Failed to load transport data.'); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { load(); }, []);

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">
            {showModal && <AddRouteModal onClose={() => setShowModal(false)} onSaved={load}/>}

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Admin <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Transport</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Transport Management</h1>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                    + Add Route
                </button>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-2 flex-shrink-0">
                {[
                    { label: 'Total Buses',    value: stats.total_buses,    cls: 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800' },
                    { label: 'Active Routes',  value: stats.active_routes,  cls: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' },
                    { label: 'Drivers',        value: stats.total_drivers,  cls: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' },
                    { label: 'In Maintenance', value: stats.in_maintenance, cls: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' },
                ].map(c => (
                    <div key={c.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${c.cls}`}>
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                            {isLoading ? '—' : c.value}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{c.label}</span>
                    </div>
                ))}
            </div>

            {/* Routes table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                <div className="flex-shrink-0 px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Active Route Status</span>
                </div>
                {isLoading ? (
                    <div className="p-6"><SkeletonLoader type="table"/></div>
                ) : routes.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16">
                        <p className="text-slate-400 text-sm mb-4">No routes configured yet.</p>
                        <button onClick={() => setShowModal(true)}
                            className="px-4 py-2 bg-primary text-white font-bold text-sm rounded-md hover:bg-primary/90 transition-all duration-200">
                            + Add First Route
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left" style={{ minWidth: 600 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Route Name</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-36">Driver</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Vehicle</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-center">Capacity</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {routes.map((route, i) => (
                                        <tr key={route.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                            i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                        }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                            <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{route.name}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{route.driver || '—'}</td>
                                            <td className="px-3 py-2 text-xs font-mono text-slate-500 dark:text-slate-400">{route.plate || '—'}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 text-center">{route.capacity ?? '—'}</td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${statusBadge(route.status)}`}>
                                                    {route.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{routes.length} routes</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TransportDashboard;
