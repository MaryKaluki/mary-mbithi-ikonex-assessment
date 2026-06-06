import React, { useState } from 'react';

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const BATCHES = [
    { id: '#B001', name: 'Term 1 Results',   date: 'Oct 20, 2024', count: 100, used: 85, status: 'Active'  },
    { id: '#B002', name: 'Special Entry',    date: 'Sep 15, 2024', count: 20,  used: 20, status: 'Expired' },
    { id: '#B003', name: 'Term 2 Mocks',     date: 'Aug 01, 2024', count: 50,  used: 47, status: 'Active'  },
];

const PinManager = () => {
    const [batchName, setBatchName] = useState('');
    const [qty, setQty]             = useState('50');

    const totalPins = BATCHES.reduce((a, b) => a + b.count, 0);
    const usedPins  = BATCHES.reduce((a, b) => a + b.used, 0);

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Admin <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Pin Manager</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Access Pin Management</h1>
                </div>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-2 flex-shrink-0">
                {[
                    { label: 'Batches',    value: BATCHES.length,                            cls: 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800' },
                    { label: 'Total Pins', value: totalPins,                                 cls: 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800' },
                    { label: 'Used',       value: usedPins,                                  cls: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' },
                    { label: 'Remaining',  value: totalPins - usedPins,                      cls: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' },
                ].map(c => (
                    <div key={c.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${c.cls}`}>
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{c.value}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{c.label}</span>
                    </div>
                ))}
            </div>

            <div className="flex gap-3 flex-1 min-h-0">

                {/* Generate form */}
                <div className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col">
                    <div className="flex-shrink-0 px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700 rounded-t-lg">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Generate New Batch</span>
                    </div>
                    <div className="flex-1 p-4 flex flex-col gap-3">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Batch Name</label>
                            <input type="text" placeholder="e.g. Term 1 Exam Access"
                                value={batchName} onChange={e => setBatchName(e.target.value)}
                                className={inputCls}/>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Quantity</label>
                            <input type="number" value={qty} onChange={e => setQty(e.target.value)} className={inputCls}/>
                        </div>
                        <button className="mt-auto py-2 bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-slate-900 transition-colors">
                            Generate Pins
                        </button>
                    </div>
                </div>

                {/* Batches table */}
                <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col min-h-0 overflow-hidden">
                    <div className="flex-shrink-0 px-4 py-2.5 bg-slate-800 dark:bg-slate-900 rounded-t-lg">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Recent Batches</span>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left" style={{ minWidth: 480 }}>
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20">Batch ID</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Name</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-32">Created</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Count</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Used</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Status</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-right">Export</th>
                                </tr>
                            </thead>
                            <tbody>
                                {BATCHES.map((b, i) => (
                                    <tr key={b.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                        i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                    }`}>
                                        <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                        <td className="px-3 py-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">{b.id}</td>
                                        <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{b.name}</td>
                                        <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{b.date}</td>
                                        <td className="px-3 py-2 text-center text-xs font-bold text-slate-700 dark:text-slate-200">{b.count}</td>
                                        <td className="px-3 py-2 text-center text-xs text-slate-500 dark:text-slate-400">{b.used}</td>
                                        <td className="px-3 py-2 text-center">
                                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                                b.status === 'Active'
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                            }`}>{b.status}</span>
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <button className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">Export</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">{BATCHES.length} batches</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PinManager;
