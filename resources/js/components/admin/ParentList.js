import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const ParentList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [parents, setParents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchParents();
    }, []);

    const fetchParents = async () => {
        setIsLoading(true);
        try {
            const res = await window.axios.get('/api/admin/users?type=parents');
            setParents(res.data.users || []);
        } catch (err) {
            window.showToast('error', 'Failed to load parents directory.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredParents = parents.filter(parent =>
        parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parent.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Parent Directory</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">View registered portal access for parents and guardians.</p>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg w-full sm:w-auto text-center">
                    + Add Portal User
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-zinc-800 dark:border-zinc-700">
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search by Parent Name or Email..."
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-gray-200 dark:placeholder-gray-500 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 dark:bg-zinc-800 dark:border-zinc-700">
                {isLoading ? (
                    <div className="p-6"><SkeletonLoader type="table" /></div>
                ) : filteredParents.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 font-bold dark:text-gray-400">
                        No parents found matching your criteria.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-700">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">Parent Name</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">Linked Children</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">Contact Info</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-zinc-700/50">
                                {filteredParents.map((parent) => (
                                    <tr key={parent.id} className="hover:bg-primary/5 transition-colors duration-150 group dark:hover:bg-zinc-700/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs mr-3">
                                                    {parent.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="font-bold text-gray-800 dark:text-gray-200">{parent.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                                            {parent.children_names && parent.children_names.length > 0 
                                                ? parent.children_names.join(', ') 
                                                : <span className="text-gray-400 italic">No linked students</span>}
                                        </td>
                                        <td className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase">
                                            <div className="flex items-center mb-1"><svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>{parent.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-[10px] uppercase font-black tracking-wider rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Portal Active</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-primary hover:underline font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">Select</button>
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

export default ParentList;
