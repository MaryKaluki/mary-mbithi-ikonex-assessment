import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const AdminList = () => {
    const [admins, setAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        setIsLoading(true);
        try {
            const res = await window.axios.get('/api/admin/users?type=admins');
            setAdmins(res.data.users || []);
        } catch (err) {
            window.showToast('error', 'Failed to load administrators.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Administrators</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Manage system access for super admins and sub-admins.</p>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg w-full sm:w-auto text-center">
                    + Add New Admin
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                {isLoading ? (
                    <div className="p-6"><SkeletonLoader type="table" /></div>
                ) : admins.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 font-bold dark:text-gray-400">No administrators found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase dark:bg-gray-700/50 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 tracking-wider">Name</th>
                                    <th className="px-6 py-4 tracking-wider">Role</th>
                                    <th className="px-6 py-4 tracking-wider">Email</th>
                                    <th className="px-6 py-4 tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {admins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-purple-50/50 transition-colors dark:hover:bg-gray-700/50 group">
                                        <td className="px-6 py-4 font-bold text-gray-800 flex items-center dark:text-gray-100">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 mr-3 flex items-center justify-center text-xs font-bold text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                                {admin.name.charAt(0).toUpperCase()}
                                            </div>
                                            {admin.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 dark:text-gray-300 uppercase tracking-wider">{admin.role.replace('_', ' ')}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{admin.email}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-purple-600 font-bold text-sm hover:underline dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">Manage</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminList;
