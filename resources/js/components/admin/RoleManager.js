import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const RoleManager = ({ mode = 'school' }) => {
    const [roles, setRoles]     = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        window.axios.get('/api/admin/roles')
            .then(res => setRoles(res.data))
            .catch(() => window.showToast('error', 'Failed to load roles.'))
            .finally(() => setIsLoading(false));
    }, []);

    const levelBadge = (level) => {
        if (!level) return 'bg-slate-100 text-slate-500 dark:bg-gray-700 dark:text-gray-400';
        const l = level.toLowerCase();
        if (l.includes('admin') || l.includes('full'))  return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
        if (l.includes('manager') || l.includes('high')) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    };

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Admin <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">
                            {mode === 'global' ? 'Global Roles' : 'Role Manager'}
                        </span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">
                        {mode === 'global' ? 'Global Master Roles' : 'School Roles & Permissions'}
                    </h1>
                </div>
            </div>

            {/* Stats strip */}
            {!isLoading && (
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{roles.length}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Roles</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                            {roles.reduce((a, r) => a + (r.user_count || 0), 0)}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Users</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                            {roles.filter(r => r.is_system).length}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Roles</span>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {isLoading ? (
                    <div className="p-6"><SkeletonLoader type="table"/></div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left" style={{ minWidth: 560 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Role Name</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-center">Users</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-36">Access Level</th>
                                        {mode === 'global' && (
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Scope</th>
                                        )}
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-right">Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles.map((role, i) => (
                                        <tr key={role.name} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                            i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                        }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                            <td className="px-3 py-2">
                                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{role.label}</p>
                                                <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{role.name}</p>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300">
                                                    {role.user_count} Users
                                                </span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${levelBadge(role.level)}`}>
                                                    {role.level || '—'}
                                                </span>
                                            </td>
                                            {mode === 'global' && (
                                                <td className="px-3 py-2 text-center text-[10px] text-slate-400">
                                                    {role.school?.name || 'All Schools'}
                                                </td>
                                            )}
                                            <td className="px-3 py-2 text-right">
                                                {role.is_system ? (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System</span>
                                                ) : (
                                                    <button className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors">Delete</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                                {roles.length} roles — system roles cannot be deleted
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RoleManager;
