import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const RoleManager = ({ mode = 'school' }) => {
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        window.axios.get('/api/admin/roles')
            .then(res => setRoles(res.data))
            .catch(() => window.showToast('error', 'Failed to load roles.'))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {mode === 'global' ? 'Global Master Roles' : 'School Roles &amp; Permissions'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                        {mode === 'global'
                            ? 'System-wide roles that apply to all tenants. User counts reflect all schools.'
                            : 'Roles and access levels for staff in this school.'}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto dark:bg-gray-800 dark:border-gray-700">
                {isLoading ? (
                    <div className="p-6"><SkeletonLoader type="table" /></div>
                ) : (
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase dark:bg-gray-700 dark:text-gray-400 border-b border-gray-100 dark:border-gray-600">
                            <tr>
                                <th className="px-6 py-4 tracking-wider">Role Name</th>
                                <th className="px-6 py-4 tracking-wider">Users</th>
                                <th className="px-6 py-4 tracking-wider">Access Level</th>
                                <th className="px-6 py-4 text-right tracking-wider">Type</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {roles.map((role) => (
                                <tr key={role.name} className="hover:bg-purple-50 transition-colors dark:hover:bg-gray-700">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-800 dark:text-gray-100">{role.label}</p>
                                        <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{role.name}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                            {role.user_count} Users
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{role.level}</td>
                                    <td className="px-6 py-4 text-right">
                                        {role.is_system ? (
                                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 flex items-center justify-end gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                                System Role
                                            </span>
                                        ) : (
                                            <button className="text-red-400 font-bold text-sm hover:text-red-600 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
                System roles are defined at the platform level and cannot be deleted. User counts reflect the current number of active accounts per role in this school.
            </div>
        </div>
    );
};

export default RoleManager;
