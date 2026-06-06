import React, { useState, useEffect } from 'react';

const PayrollDashboard = () => {
    const [stats, setStats]           = useState(null);
    const [recentRuns, setRecentRuns] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState('');

    useEffect(() => {
        setLoading(true);
        setError('');
        window.axios.get('/api/hr/payroll/dashboard')
            .then(res => { setStats(res.data.stats); setRecentRuns(res.data.recent_runs); })
            .catch(() => setError('Failed to load payroll data.'))
            .finally(() => setLoading(false));
    }, []);

    const fmt = val => `KES ${Number(val || 0).toLocaleString()}`;

    const runStatusBadge = (status) => {
        if (status === 'Paid')      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
        if (status === 'Processed') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        return 'bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-gray-300';
    };

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        HR <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Payroll</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Payroll Dashboard</h1>
                </div>
            </div>

            {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md flex-shrink-0">{error}</p>}

            {loading ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Loading payroll data…</div>
            ) : (
                <>
                    {/* Stats strip */}
                    <div className="flex gap-2 flex-shrink-0 flex-wrap">
                        {[
                            { label: `Gross (${stats?.month || ''})`, value: fmt(stats?.gross) },
                            { label: 'Deductions',                    value: fmt(stats?.deductions) },
                            { label: 'Net Payout',                   value: fmt(stats?.net) },
                            { label: 'Total Staff',                   value: stats?.total_staff ?? '—' },
                        ].map(card => (
                            <div key={card.label} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-md">
                                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{card.value}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{card.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Recent Payroll Runs table */}
                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                        <div className="flex-shrink-0 px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Recent Payroll Runs</span>
                        </div>
                        {recentRuns.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center">
                                <p className="text-slate-400 text-sm">No payroll runs yet. Generate payslips from the Generate page.</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-auto flex-1">
                                    <table className="w-full text-left border-collapse" style={{ minWidth: 540 }}>
                                        <thead className="sticky top-0 z-10">
                                            <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Period</th>
                                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Staff</th>
                                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-32">Run Date</th>
                                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-36 text-right">Net Payout</th>
                                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentRuns.map((run, i) => (
                                                <tr key={i}
                                                    className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                                        i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                                    }`}>
                                                    <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">
                                                        {String(i + 1).padStart(2, '00')}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{run.month} Salaries</span>
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-xs text-slate-500 dark:text-slate-400">{run.staff_count}</td>
                                                    <td className="px-3 py-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                                                        {run.run_date ? run.run_date.split('T')[0] : '—'}
                                                    </td>
                                                    <td className="px-3 py-2 text-right text-sm font-bold text-slate-700 dark:text-slate-200">{fmt(run.net)}</td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${runStatusBadge(run.status)}`}>
                                                            {run.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{recentRuns.length} recent run{recentRuns.length !== 1 ? 's' : ''}</p>
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default PayrollDashboard;
