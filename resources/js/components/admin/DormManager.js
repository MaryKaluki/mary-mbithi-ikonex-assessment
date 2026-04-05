import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const DormManager = () => {
    const [dorms, setDorms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [form, setForm] = useState({ name: '', type: 'Boys', capacity: 100, status: 'Active' });

    useEffect(() => { fetchDorms(); }, []);

    const fetchDorms = async () => {
        setIsLoading(true);
        try {
            const res = await window.axios.get('/api/admin/dorms');
            setDorms(res.data);
        } catch {
            window.showToast('error', 'Failed to load dormitories.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddDorm = async (e) => {
        e.preventDefault();
        try {
            await window.axios.post('/api/admin/dorms', form);
            window.showToast('success', 'Dormitory added successfully.');
            setShowAddModal(false);
            setForm({ name: '', type: 'Boys', capacity: 100, status: 'Active' });
            fetchDorms();
        } catch {
            window.showToast('error', 'Failed to add dormitory.');
        }
    };

    const occupancyPercent = (dorm) => dorm.capacity > 0 ? Math.round((dorm.occupied / dorm.capacity) * 100) : 0;
    const statusBadge = (status) => {
        const map = {
            'Active': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
            'Full':   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
            'Closed': 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
        };
        return map[status] || map['Active'];
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Dormitory Management</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Manage hostels, room allocations, and student residency.</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg w-full sm:w-auto text-center">
                    + Add Dormitory
                </button>
            </div>

            {isLoading ? (
                <div className="p-6"><SkeletonLoader type="table" /></div>
            ) : dorms.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 p-12 text-center text-gray-500 font-bold dark:text-gray-400">
                    No dormitories found. Add your first dormitory to get started.
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase dark:bg-gray-700 dark:text-gray-400 border-b border-gray-100 dark:border-gray-600">
                                <tr>
                                    <th className="px-6 py-4 tracking-wider">Dormitory</th>
                                    <th className="px-6 py-4 tracking-wider">Type</th>
                                    <th className="px-6 py-4 tracking-wider">Warden</th>
                                    <th className="px-6 py-4 tracking-wider">Occupancy</th>
                                    <th className="px-6 py-4 tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {dorms.map((dorm) => {
                                    const pct = occupancyPercent(dorm);
                                    return (
                                        <tr key={dorm.id} className="hover:bg-purple-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-100">{dorm.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{dorm.type}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{dorm.warden}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 min-w-[80px]">
                                                        <div
                                                            className={`h-2 rounded-full ${pct >= 95 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-400' : 'bg-green-500'}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                                        {dorm.occupied}/{dorm.capacity}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${statusBadge(dorm.status)}`}>
                                                    {dorm.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6">Add New Dormitory</h3>
                        <form onSubmit={handleAddDorm} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Dormitory Name</label>
                                <input type="text" required placeholder="e.g. Sunrise Hall" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Type</label>
                                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                        {['Boys','Girls','Junior Boys','Junior Girls','Mixed'].map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Capacity</label>
                                    <input type="number" min="1" value={form.capacity} onChange={e => setForm({...form, capacity: parseInt(e.target.value)})}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-purple-600 text-white font-bold text-sm rounded-lg hover:bg-purple-700">Add Dormitory</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DormManager;
