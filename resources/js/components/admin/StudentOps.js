import React, { useState } from 'react';

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const ALUMNI = [
    { id: 1, name: 'Sarah Connor',   year: '2023', contact: 'sarah@uni.edu',   status: 'University' },
    { id: 2, name: 'John Waweru',    year: '2022', contact: 'john@work.com',   status: 'Employed'   },
    { id: 3, name: 'Mary Achieng',   year: '2023', contact: 'mary@gmail.com',  status: 'University' },
    { id: 4, name: 'David Kamau',    year: '2021', contact: 'david@corp.co.ke', status: 'Employed'  },
];

const statusBadge = (s) => {
    if (s === 'University') return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    if (s === 'Employed')   return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
    return 'bg-slate-100 text-slate-500';
};

const StudentOps = () => {
    const [activeTab, setActiveTab] = useState('promotion');
    const [fromClass, setFromClass] = useState('Grade 1');
    const [toClass, setToClass]     = useState('Grade 2');

    const GRADES = ['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Form 1', 'Form 2', 'Form 3', 'Form 4'];

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Admin <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Student Operations</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Student Operations</h1>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-gray-700 flex-shrink-0">
                {[['promotion', 'Promote Students'], ['alumni', 'Alumni Management']].map(([val, label]) => (
                    <button key={val} onClick={() => setActiveTab(val)}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                            activeTab === val
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}>
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === 'promotion' ? (
                <div className="flex-1 flex items-start">
                    <div className="w-96 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col">
                        <div className="px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700 rounded-t-lg">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Class Promotion Wizard</span>
                        </div>
                        <div className="p-4 flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Promote From</label>
                                    <select value={fromClass} onChange={e => setFromClass(e.target.value)} className={inputCls}>
                                        {GRADES.map(g => <option key={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">To Class</label>
                                    <select value={toClass} onChange={e => setToClass(e.target.value)} className={inputCls}>
                                        {GRADES.map(g => <option key={g}>{g}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="px-3 py-2.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-md">
                                <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-0.5">Warning</p>
                                <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-snug">
                                    This will move all eligible students to the next grade. Students with 'Fail' status will remain in their current grade.
                                </p>
                            </div>
                            <button className="py-2 bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-slate-900 transition-colors">
                                Process Promotion
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left" style={{ minWidth: 540 }}>
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Full Name</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-center">Grad Year</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Contact</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ALUMNI.map((a, i) => (
                                    <tr key={a.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                        i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                    }`}>
                                        <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                        <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{a.name}</td>
                                        <td className="px-3 py-2 text-center text-xs font-mono text-slate-500 dark:text-slate-400">{a.year}</td>
                                        <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{a.contact}</td>
                                        <td className="px-3 py-2 text-center">
                                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${statusBadge(a.status)}`}>{a.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">{ALUMNI.length} alumni</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentOps;
