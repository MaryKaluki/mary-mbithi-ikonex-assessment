import React, { useState } from 'react';

const OVERDUE = [
    { id: 1, student: 'Tommy Smith',  grade: 'Grade 4A', book: 'Physics 101',      isbn: '978-0743273565', dueDate: '2024-10-20', daysOverdue: 10, fine: 5.00  },
    { id: 2, student: 'Alice Brown',  grade: 'Grade 5B', book: 'World History',    isbn: '978-0446310789', dueDate: '2024-10-22', daysOverdue: 8,  fine: 4.00  },
    { id: 3, student: 'John Doe',     grade: 'Grade 6A', book: 'Chemistry Basics', isbn: '978-0451524935', dueDate: '2024-10-25', daysOverdue: 5,  fine: 2.50  },
    { id: 4, student: 'Sarah Connor', grade: 'Staff',    book: 'Advanced Biology', isbn: '978-1234567890', dueDate: '2024-10-28', daysOverdue: 2,  fine: 1.00  },
];

const overdueBadge = (days) => {
    if (days >= 14) return 'bg-red-600 text-white';
    if (days >= 7)  return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300';
    return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300';
};

const OverdueReports = () => {
    const [filter, setFilter] = useState('all');

    const filtered = filter === 'all' ? OVERDUE
        : filter === 'critical' ? OVERDUE.filter(b => b.daysOverdue >= 7)
        : OVERDUE.filter(b => b.daysOverdue < 7);

    const totalFines = OVERDUE.reduce((a, b) => a + b.fine, 0);

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Library <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Overdue Report</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Overdue Books</h1>
                </div>
                <button className="px-4 py-1.5 border border-slate-300 dark:border-gray-600 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                    Export
                </button>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-2 flex-shrink-0">
                {[
                    { label: 'Total Overdue',    value: OVERDUE.length,                                     cls: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' },
                    { label: 'Critical (7+ days)',value: OVERDUE.filter(b => b.daysOverdue >= 7).length,    cls: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20' },
                    { label: 'Total Fines',       value: `KES ${totalFines.toFixed(2)}`,                    cls: 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800' },
                    { label: 'Fine/Day',          value: 'KES 0.50',                                        cls: 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800' },
                ].map(c => (
                    <div key={c.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${c.cls}`}>
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{c.value}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{c.label}</span>
                    </div>
                ))}
            </div>

            {/* Filter tabs */}
            <div className="flex-shrink-0 flex border-b border-slate-200 dark:border-gray-700">
                {[
                    { key: 'all',      label: 'All Overdue'     },
                    { key: 'critical', label: 'Critical (7+ d)' },
                    { key: 'recent',   label: 'Recent (<7 d)'   },
                ].map(f => (
                    <button key={f.key} onClick={() => setFilter(f.key)}
                        className={`px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                            filter === f.key
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left" style={{ minWidth: 680 }}>
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Borrower</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Book</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Due Date</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28 text-center">Days Overdue</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Fine</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((item, i) => (
                                <tr key={item.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                    i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                }`}>
                                    <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">
                                        {String(i + 1).padStart(2, '0')}
                                    </td>
                                    <td className="px-3 py-2">
                                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{item.student}</p>
                                        <p className="text-[10px] text-slate-400">{item.grade}</p>
                                    </td>
                                    <td className="px-3 py-2">
                                        <p className="text-xs text-slate-700 dark:text-slate-200">{item.book}</p>
                                        <p className="text-[10px] font-mono text-slate-400">{item.isbn}</p>
                                    </td>
                                    <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{item.dueDate}</td>
                                    <td className="px-3 py-2 text-center">
                                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${overdueBadge(item.daysOverdue)}`}>
                                            {item.daysOverdue}d
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-right text-xs font-bold font-mono text-red-500">
                                        KES {item.fine.toFixed(2)}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <button className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">
                                            Remind
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="py-12 text-center text-xs text-slate-400 italic">No overdue books in this filter.</div>
                    )}
                </div>
                <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</p>
                </div>
            </div>
        </div>
    );
};

export default OverdueReports;
