import React, { useState } from 'react';

const inputCls = "px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const MEMBERS = [
    { id: 1, name: 'Tommy Smith',   type: 'Student', grade: 'Grade 4A',       booksOut: 2, limit: 3,  status: 'active'    },
    { id: 2, name: 'Alice Brown',   type: 'Student', grade: 'Grade 5B',       booksOut: 1, limit: 3,  status: 'active'    },
    { id: 3, name: 'John Doe',      type: 'Student', grade: 'Grade 6A',       booksOut: 3, limit: 3,  status: 'maxed'     },
    { id: 4, name: 'Sarah Connor',  type: 'Staff',   grade: 'Science Teacher',booksOut: 4, limit: 5,  status: 'active'    },
    { id: 5, name: 'Emily Davis',   type: 'Staff',   grade: 'Librarian',      booksOut: 0, limit: 10, status: 'active'    },
    { id: 6, name: 'Mike Johnson',  type: 'Student', grade: 'Grade 3C',       booksOut: 0, limit: 3,  status: 'suspended' },
];

const statusBadge = (s) => ({
    active:    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    maxed:     'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    suspended: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
}[s] || 'bg-slate-100 text-slate-600');

const MembersList = () => {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const filtered = MEMBERS.filter(m => {
        const q = search.toLowerCase();
        const matchQ = !q || m.name.toLowerCase().includes(q) || m.grade.toLowerCase().includes(q);
        const matchF = filter === 'all' || m.type.toLowerCase() === filter || m.status === filter;
        return matchQ && matchF;
    });

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Library <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Members</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Library Members</h1>
                </div>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-2 flex-shrink-0">
                {[
                    { label: 'Total Members',  value: MEMBERS.length,                                   cls: 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800' },
                    { label: 'Active',         value: MEMBERS.filter(m => m.status === 'active').length, cls: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' },
                    { label: 'Books Borrowed', value: MEMBERS.reduce((a, b) => a + b.booksOut, 0),       cls: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' },
                    { label: 'Suspended',      value: MEMBERS.filter(m => m.status === 'suspended').length, cls: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' },
                ].map(c => (
                    <div key={c.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${c.cls}`}>
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{c.value}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{c.label}</span>
                    </div>
                ))}
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap gap-2 items-end flex-shrink-0">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Search</label>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Name or class…" className={inputCls + ' w-48'}/>
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Filter</label>
                    <select value={filter} onChange={e => setFilter(e.target.value)} className={inputCls}>
                        <option value="all">All Members</option>
                        <option value="student">Students</option>
                        <option value="staff">Staff</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left" style={{ minWidth: 600 }}>
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Member</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20">Type</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Out</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Limit</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Status</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((m, i) => (
                                <tr key={m.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                    i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                }`}>
                                    <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">
                                        {String(i + 1).padStart(2, '0')}
                                    </td>
                                    <td className="px-3 py-2">
                                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{m.name}</p>
                                        <p className="text-[10px] text-slate-400">{m.grade}</p>
                                    </td>
                                    <td className="px-3 py-2">
                                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                            m.type === 'Staff'
                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                : 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300'
                                        }`}>{m.type}</span>
                                    </td>
                                    <td className="px-3 py-2 text-center text-xs font-bold text-slate-700 dark:text-slate-200">{m.booksOut}</td>
                                    <td className="px-3 py-2 text-center text-xs text-slate-400">{m.limit}</td>
                                    <td className="px-3 py-2">
                                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${statusBadge(m.status)}`}>
                                            {m.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <button className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="py-12 text-center text-xs text-slate-400 italic">No members match your filter.</div>
                    )}
                </div>
                <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{filtered.length} member{filtered.length !== 1 ? 's' : ''}</p>
                </div>
            </div>
        </div>
    );
};

export default MembersList;
