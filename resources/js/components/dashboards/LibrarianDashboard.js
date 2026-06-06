import React from 'react';
import { useNavigate } from 'react-router-dom';

const today = new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const OVERDUE = [
    { student: 'Alex Johnson', book: 'Physics 101',   due: '2 Days Ago', fine: 'KES 2.00', severe: true  },
    { student: 'Maria Garcia', book: 'World History', due: 'Today',      fine: 'KES 0.00', severe: false },
];

const LibrarianDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">Library Dashboard</nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">
                        Dashboard
                        <span className="ml-2 text-xs font-normal text-slate-400">{today}</span>
                    </h1>
                </div>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-2 flex-shrink-0">
                {[
                    { label: 'Total Books',    value: '12,450', cls: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' },
                    { label: 'Books Issued',   value: '485',    cls: 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800' },
                    { label: 'Overdue Books',  value: '24',     cls: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' },
                    { label: 'Fine Collected', value: 'KES 120',cls: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' },
                    { label: 'Members',        value: '—',      cls: 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800' },
                ].map(c => (
                    <div key={c.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${c.cls}`}>
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{c.value}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{c.label}</span>
                    </div>
                ))}
            </div>

            {/* Main grid */}
            <div className="flex flex-col md:flex-row gap-3 flex-1 min-h-0">

                {/* Overdue Books */}
                <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col min-h-0">
                    <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 bg-slate-800 dark:bg-slate-900 rounded-t-lg">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Overdue Books</span>
                        <button onClick={() => navigate('/library/overdue')}
                            className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">
                            Full Report →
                        </button>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left" style={{ minWidth: 480 }}>
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Student</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Book Title</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Due Date</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Fine</th>
                                </tr>
                            </thead>
                            <tbody>
                                {OVERDUE.map((r, i) => (
                                    <tr key={i} className={`border-b border-slate-100 dark:border-gray-700/60 ${
                                        i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                    }`}>
                                        <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">
                                            {String(i + 1).padStart(2, '0')}
                                        </td>
                                        <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{r.student}</td>
                                        <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{r.book}</td>
                                        <td className="px-3 py-2">
                                            <span className={`text-xs font-bold ${r.severe ? 'text-red-500' : 'text-amber-500'}`}>{r.due}</span>
                                        </td>
                                        <td className="px-3 py-2 text-xs font-mono text-slate-600 dark:text-slate-400 text-right">{r.fine}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="w-56 flex-shrink-0 flex flex-col gap-3">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
                        <div className="px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Quick Actions</span>
                        </div>
                        <div className="p-3 grid grid-cols-1 gap-2">
                            {[
                                { label: 'Issue / Return Book',  path: '/library/issue-return' },
                                { label: 'Book Inventory',       path: '/library/books' },
                                { label: 'Members List',         path: '/library/members' },
                                { label: 'Overdue Report',       path: '/library/overdue' },
                                { label: 'Book Categories',      path: '/library/categories' },
                                { label: 'Add New Book',         path: '/library/books/create' },
                            ].map(a => (
                                <button key={a.path} onClick={() => navigate(a.path)}
                                    className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-left rounded-md border border-slate-200 dark:border-gray-600 text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-colors">
                                    {a.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Issue/Return scanner stub */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
                        <div className="px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Quick Scan</span>
                        </div>
                        <div className="p-3">
                            <input type="text" placeholder="ISBN or Book ID…"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"/>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <button className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md border border-slate-200 dark:border-gray-600 text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-colors">
                                    Issue
                                </button>
                                <button className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md border border-slate-200 dark:border-gray-600 text-slate-600 dark:text-slate-400 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors">
                                    Return
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LibrarianDashboard;
