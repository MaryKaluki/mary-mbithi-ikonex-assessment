import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const ParentList = () => {
    const [parents, setParents]       = useState([]);
    const [isLoading, setIsLoading]   = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [profile, setProfile]       = useState(null);

    useEffect(() => { fetchParents(); }, []);

    const fetchParents = async () => {
        setIsLoading(true);
        try {
            const res = await window.axios.get('/api/admin/users?type=parents');
            setParents(res.data.users || []);
        } catch {
            window.showToast('error', 'Failed to load parents.');
        } finally {
            setIsLoading(false);
        }
    };

    const filtered = parents.filter(p => {
        const q = searchTerm.toLowerCase();
        return !q ||
            p.name.toLowerCase().includes(q) ||
            p.email.toLowerCase().includes(q) ||
            (p.phone || '').includes(q);
    });

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Admin <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Parent Directory</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">
                        Parent Directory
                        {!isLoading && <span className="ml-2 text-xs font-normal text-slate-400">— {filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>}
                    </h1>
                </div>
                <button className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary/90 text-sm transition-all duration-200">
                    + Add Portal User
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-shrink-0">
                <div className="flex-1 relative">
                    <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input type="text" placeholder="Search name, email, phone…"
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                </div>
                {!isLoading && (
                    <div className="flex items-center px-3 py-1.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-md text-xs text-slate-500 whitespace-nowrap select-none">
                        <span className="font-bold text-slate-700 dark:text-slate-200 mr-1">{filtered.length}</span> records
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {isLoading ? (
                    <div className="p-6"><SkeletonLoader type="table"/></div>
                ) : filtered.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-slate-400 text-sm">
                            {searchTerm ? 'No parents match your search.' : 'No parent portal users registered yet.'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-left border-collapse" style={{ minWidth: 620 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Full Name</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Email</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-32">Phone</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Linked Children</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Status</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((p, i) => (
                                        <tr key={p.id}
                                            className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                                i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                            }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">
                                                {String(i + 1).padStart(2, '0')}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{p.name}</span>
                                            </td>
                                            <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 font-mono">{p.email}</td>
                                            <td className="px-3 py-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                                                {p.phone || <span className="text-slate-300 dark:text-slate-600 font-sans">—</span>}
                                            </td>
                                            <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                                                {p.children_names?.length > 0
                                                    ? p.children_names.join(', ')
                                                    : <span className="text-slate-300 dark:text-slate-600 italic">No linked students</span>}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    Active
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <button onClick={() => setProfile(p)}
                                                    className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                                {filtered.length} parent{filtered.length !== 1 ? 's' : ''}
                                {searchTerm && ` · filtered from ${parents.length}`}
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Profile Drawer */}
            {profile && (
                <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40" onClick={() => setProfile(null)}>
                    <div className="bg-white dark:bg-gray-800 h-full w-full max-w-sm shadow-2xl border-l border-slate-200 dark:border-gray-700 flex flex-col overflow-y-auto"
                        onClick={e => e.stopPropagation()}>
                        <div className="bg-slate-800 px-5 py-4 flex items-start justify-between flex-shrink-0">
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Parent Profile</p>
                                <h3 className="text-base font-bold text-white leading-tight">{profile.name}</h3>
                                <p className="text-xs text-slate-400 mt-0.5">{profile.email}</p>
                            </div>
                            <button onClick={() => setProfile(null)} className="text-slate-400 hover:text-white transition-colors text-2xl leading-none">&times;</button>
                        </div>
                        <div className="flex-1 p-5 space-y-5">
                            <section>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-gray-700 pb-1 mb-3">Contact Details</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Phone</p>
                                        <p className="text-xs font-mono text-slate-800 dark:text-slate-200">{profile.phone || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Email</p>
                                        <p className="text-xs text-slate-800 dark:text-slate-200 break-all">{profile.email}</p>
                                    </div>
                                </div>
                            </section>
                            {profile.children_names?.length > 0 && (
                                <section>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-gray-700 pb-1 mb-3">Linked Children</p>
                                    <div className="space-y-1.5">
                                        {profile.children_names.map((name, i) => (
                                            <div key={i} className="flex items-center gap-2 py-1.5 border-b border-slate-100 dark:border-gray-700 last:border-0">
                                                <span className="text-[10px] font-mono text-slate-300 w-5">{String(i + 1).padStart(2, '0')}</span>
                                                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParentList;
