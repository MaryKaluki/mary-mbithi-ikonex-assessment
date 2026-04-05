import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const statusColor = (status) => {
    const map = {
        'Active':     'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        'In Transit': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        'Arrived':    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        'Delayed':    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
        'Inactive':   'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    };
    return map[status] || map['Inactive'];
};

const TransportDashboard = () => {
    const [stats, setStats] = useState({ total_buses: 0, active_routes: 0, total_drivers: 0, in_maintenance: 0 });
    const [routes, setRoutes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', status: 'Active' });

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            window.axios.get('/api/admin/transport/stats'),
            window.axios.get('/api/admin/transport/routes'),
        ]).then(([statsRes, routesRes]) => {
            setStats(statsRes.data);
            setRoutes(routesRes.data);
        }).catch(() => {
            window.showToast('error', 'Failed to load transport data.');
        }).finally(() => setIsLoading(false));
    }, []);

    const handleAddRoute = async (e) => {
        e.preventDefault();
        try {
            const res = await window.axios.post('/api/admin/transport/routes', form);
            setRoutes(prev => [...prev, res.data]);
            window.showToast('success', 'Route added.');
            setShowModal(false);
            setForm({ name: '', status: 'Active' });
        } catch {
            window.showToast('error', 'Failed to add route.');
        }
    };

    const statCards = [
        { label: 'Total Buses', value: stats.total_buses, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' },
        { label: 'Active Routes', value: stats.active_routes, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
        { label: 'Drivers', value: stats.total_drivers, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' },
        { label: 'In Maintenance', value: stats.in_maintenance, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20' },
    ];

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Transport Management</h2>
                <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg w-full sm:w-auto text-center">
                    + Add Route
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((s) => (
                    <div key={s.label} className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1 dark:text-gray-400">{s.label}</p>
                        <p className={`text-2xl font-extrabold ${isLoading ? 'text-gray-300' : 'text-gray-800 dark:text-gray-100'}`}>
                            {isLoading ? '-' : s.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                <div className="p-4 md:p-6 border-b border-gray-50 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Active Route Status</h3>
                </div>
                {isLoading ? (
                    <div className="p-6"><SkeletonLoader type="table" /></div>
                ) : routes.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 font-bold dark:text-gray-400">No routes configured yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-4">Route Name</th>
                                    <th className="px-6 py-4">Driver</th>
                                    <th className="px-6 py-4">Vehicle</th>
                                    <th className="px-6 py-4">Capacity</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {routes.map((route) => (
                                    <tr key={route.id} className="hover:bg-purple-50 transition-colors dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-100">{route.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{route.driver}</td>
                                        <td className="px-6 py-4 text-sm font-mono text-gray-500 dark:text-gray-400">{route.plate}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-200">{route.capacity}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusColor(route.status)}`}>{route.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6">Add New Route</h3>
                        <form onSubmit={handleAddRoute} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Route Name</label>
                                <input type="text" required placeholder="e.g. Route A (North)" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Status</label>
                                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    <option>Active</option><option>Inactive</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-purple-600 text-white font-bold text-sm rounded-lg hover:bg-purple-700">Add Route</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransportDashboard;
