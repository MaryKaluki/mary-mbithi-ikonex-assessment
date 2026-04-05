import React, { useState, useEffect } from 'react';
import StatsCard from '../StatsCard';

const PayrollDashboard = () => {
    const [stats, setStats]         = useState(null);
    const [recentRuns, setRecentRuns] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState('');

    useEffect(() => {
        setLoading(true);
        setError('');
        window.axios.get('/api/hr/payroll/dashboard')
            .then(res => {
                setStats(res.data.stats);
                setRecentRuns(res.data.recent_runs);
            })
            .catch(() => setError('Failed to load payroll data.'))
            .finally(() => setLoading(false));
    }, []);

    const fmt = val => `KES ${Number(val || 0).toLocaleString()}`;

    const iconCls = 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Payroll Dashboard</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Overview of salary disbursements.</p>
            </div>

            {error && (
                <div className="p-3 border border-gray-200 bg-gray-50 rounded-lg text-gray-700 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-12 text-sm text-gray-500 dark:text-gray-400">Loading payroll data...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatsCard
                            title={`Total Payroll (${stats?.month || ''})`}
                            value={fmt(stats?.gross)}
                            percentage="Gross"
                            trend="up"
                            colorClass={iconCls}
                            progressColor="bg-gray-400"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                        <StatsCard
                            title="Deductions"
                            value={fmt(stats?.deductions)}
                            percentage="Tax & Benefits"
                            trend="neutral"
                            colorClass={iconCls}
                            progressColor="bg-gray-400"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" /></svg>}
                        />
                        <StatsCard
                            title="Net Payout"
                            value={fmt(stats?.net)}
                            percentage="After Deductions"
                            trend="up"
                            colorClass={iconCls}
                            progressColor="bg-gray-400"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                        />
                        <StatsCard
                            title="Total Staff"
                            value={stats?.total_staff ?? '—'}
                            percentage="Active Employees"
                            trend="neutral"
                            colorClass={iconCls}
                            progressColor="bg-gray-400"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                        />
                    </div>

                    {/* Recent Payroll Runs */}
                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                        <h3 className="text-base font-bold text-gray-800 mb-4 dark:text-gray-100">Recent Payroll Runs</h3>
                        {recentRuns.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                No payroll runs yet. Generate payslips from the Generate Payslips page.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {recentRuns.map((run, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-700/50">
                                        <div>
                                            <p className="font-bold text-sm text-gray-800 dark:text-gray-100">{run.month} Salaries</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {run.staff_count} staff &bull; {run.run_date ? run.run_date.split('T')[0] : ''}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm text-gray-800 dark:text-gray-100">{fmt(run.net)}</p>
                                            <span className="text-xs px-2 py-0.5 border border-gray-300 text-gray-600 rounded dark:border-gray-600 dark:text-gray-300">
                                                {run.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default PayrollDashboard;
