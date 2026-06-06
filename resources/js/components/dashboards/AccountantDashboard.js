import React from 'react';
import { useNavigate } from 'react-router-dom';

const today = new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const TRANSACTIONS = [
    { id: '#TRX-890', desc: 'Term 2 Fees — Grade 4A',    date: 'Today 10:23 AM',  amount: '+KES 4,500', cr: true },
    { id: '#TRX-889', desc: 'Electricity Bill (October)', date: 'Yesterday',       amount: '-KES 240',   cr: false },
    { id: '#TRX-888', desc: 'Library Books Order',        date: 'Oct 29',          amount: '-KES 1,200', cr: false },
];

const AccountantDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">Accountant Dashboard</nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">
                        Dashboard
                        <span className="ml-2 text-xs font-normal text-slate-400">{today}</span>
                    </h1>
                </div>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-2 flex-shrink-0">
                {[
                    { label: 'Collections (Oct)',  value: 'KES 45,200',  cls: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' },
                    { label: 'Outstanding Fees',   value: 'KES 12,850',  cls: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' },
                    { label: 'Expenses (Oct)',      value: 'KES 8,400',   cls: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20' },
                    { label: 'Bank Balance',        value: 'KES 156,000', cls: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' },
                    { label: 'Fee Collection',      value: '65%',         cls: 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800' },
                ].map(c => (
                    <div key={c.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${c.cls}`}>
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{c.value}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{c.label}</span>
                    </div>
                ))}
            </div>

            {/* Main grid */}
            <div className="flex flex-col md:flex-row gap-3 flex-1 min-h-0">

                {/* Recent Transactions */}
                <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col min-h-0">
                    <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 bg-slate-800 dark:bg-slate-900 rounded-t-lg">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Recent Transactions</span>
                        <button onClick={() => navigate('/accountant/receipts')}
                            className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">
                            View All →
                        </button>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left" style={{ minWidth: 520 }}>
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Ref</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Description</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Date</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {TRANSACTIONS.map((t, i) => (
                                    <tr key={t.id} className={`border-b border-slate-100 dark:border-gray-700/60 ${
                                        i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                    }`}>
                                        <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">
                                            {String(i + 1).padStart(2, '0')}
                                        </td>
                                        <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{t.id}</td>
                                        <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{t.desc}</td>
                                        <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{t.date}</td>
                                        <td className={`px-3 py-2 text-xs font-bold font-mono text-right ${t.cr ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {t.amount}
                                        </td>
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
                                { label: 'Record Payment',     path: '/accountant/payments/record' },
                                { label: 'Outstanding Fees',   path: '/accountant/outstanding' },
                                { label: 'Daily Collection',   path: '/accountant/daily-collection' },
                                { label: 'Fee Defaulters',     path: '/accountant/defaulters' },
                                { label: 'Expense Manager',    path: '/accountant/expenses' },
                                { label: 'Financial Reports',  path: '/accountant/reports' },
                            ].map(a => (
                                <button key={a.path} onClick={() => navigate(a.path)}
                                    className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-left rounded-md border border-slate-200 dark:border-gray-600 text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-colors">
                                    {a.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Fee Progress */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
                        <div className="px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Fee Progress (Term 2)</span>
                        </div>
                        <div className="p-4 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Collected</span>
                                <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-200">65%</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: '65%' }}/>
                            </div>
                            <div className="flex justify-between pt-1">
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-400">Target</p>
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">KES 120k</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-wider text-slate-400">Deficit</p>
                                    <p className="text-xs font-bold text-red-500">KES 42k</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountantDashboard;
