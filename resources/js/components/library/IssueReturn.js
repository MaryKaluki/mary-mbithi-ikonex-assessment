import React, { useState } from 'react';

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono";

const RECENT = [
    { id: 1, type: 'issue',  student: 'Tommy Smith',  book: 'Physics 101',        isbn: '978-0743273565', time: '10 mins ago' },
    { id: 2, type: 'return', student: 'Alice Brown',  book: 'World History',      isbn: '978-0446310789', time: '25 mins ago' },
    { id: 3, type: 'issue',  student: 'John Doe',     book: 'Chemistry Basics',   isbn: '978-0451524935', time: '1 hour ago'  },
    { id: 4, type: 'return', student: 'Sarah Connor', book: 'English Literature', isbn: '978-1234567890', time: '2 hours ago' },
];

const IssueReturn = () => {
    const [activeTab, setActiveTab] = useState('issue');
    const [studentId, setStudentId] = useState('');
    const [isbn, setIsbn] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaving(true);
        setTimeout(() => {
            window.showToast?.('success', `${activeTab === 'issue' ? 'Book issued' : 'Return processed'} successfully.`);
            setStudentId('');
            setIsbn('');
            setSaving(false);
        }, 600);
    };

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex-shrink-0">
                <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                    Library <span className="mx-1">/</span>
                    <span className="text-slate-600 dark:text-slate-300 font-semibold">Issue & Return</span>
                </nav>
                <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Issue & Return</h1>
            </div>

            <div className="flex gap-3 flex-1 min-h-0">

                {/* Form */}
                <div className="w-80 flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col">
                    {/* Tab toggle */}
                    <div className="flex-shrink-0 flex border-b border-slate-200 dark:border-gray-700">
                        {['issue', 'return'].map(t => (
                            <button key={t} onClick={() => setActiveTab(t)}
                                className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2 ${
                                    activeTab === t
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                }`}>
                                {t === 'issue' ? 'Issue Book' : 'Return Book'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 flex-1 flex flex-col gap-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                                {activeTab === 'issue' ? 'Student ID / Name' : 'Student ID or Scan'}
                            </label>
                            <input value={studentId} onChange={e => setStudentId(e.target.value)}
                                placeholder="Enter student ID…" className={inputCls} required/>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                                ISBN / Book ID
                            </label>
                            <input value={isbn} onChange={e => setIsbn(e.target.value)}
                                placeholder="Scan or enter ISBN…" className={inputCls} required/>
                        </div>

                        {/* Quick stats */}
                        <div className="flex gap-3 py-3 border-t border-slate-100 dark:border-gray-700">
                            <div className="flex-1 text-center">
                                <p className="text-base font-extrabold text-slate-800 dark:text-slate-100">485</p>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Books Out</p>
                            </div>
                            <div className="flex-1 text-center">
                                <p className="text-base font-extrabold text-emerald-600">24</p>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Returned Today</p>
                            </div>
                        </div>

                        <button type="submit" disabled={saving}
                            className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">
                            {saving ? 'Processing…' : (activeTab === 'issue' ? 'Issue Book' : 'Process Return')}
                        </button>
                    </form>
                </div>

                {/* Recent Activity */}
                <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col min-h-0">
                    <div className="flex-shrink-0 px-4 py-2.5 bg-slate-800 dark:bg-slate-900 rounded-t-lg">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Recent Activity</span>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left" style={{ minWidth: 480 }}>
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16">Type</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Student</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Book</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {RECENT.map((tx, i) => (
                                    <tr key={tx.id} className={`border-b border-slate-100 dark:border-gray-700/60 ${
                                        i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                    }`}>
                                        <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">
                                            {String(i + 1).padStart(2, '0')}
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                                tx.type === 'issue'
                                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                            }`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{tx.student}</td>
                                        <td className="px-3 py-2">
                                            <p className="text-xs text-slate-700 dark:text-slate-200">{tx.book}</p>
                                            <p className="text-[10px] font-mono text-slate-400">{tx.isbn}</p>
                                        </td>
                                        <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{tx.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">{RECENT.length} recent transactions</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IssueReturn;
