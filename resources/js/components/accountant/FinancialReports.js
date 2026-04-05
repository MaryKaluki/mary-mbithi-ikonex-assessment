import React from 'react';
import StatsCard from '../StatsCard';

const FinancialReports = () => {
    const monthlyData = [
        { month: 'Jul', income: 45000, expenses: 32000 },
        { month: 'Aug', income: 52000, expenses: 38000 },
        { month: 'Sep', income: 48000, expenses: 35000 },
        { month: 'Oct', income: 58000, expenses: 42000 },
    ];

    const recentTransactions = [
        { id: 1, type: 'income', desc: 'Term 2 Fees Collection', amount: 12500, date: 'Oct 28' },
        { id: 2, type: 'expense', desc: 'Staff Salaries', amount: 8400, date: 'Oct 25' },
        { id: 3, type: 'income', desc: 'Transport Fees', amount: 2800, date: 'Oct 22' },
        { id: 4, type: 'expense', desc: 'Utility Bills', amount: 1200, date: 'Oct 20' },
    ];

    const totalIncome = monthlyData.reduce((a, b) => a + b.income, 0);
    const totalExpenses = monthlyData.reduce((a, b) => a + b.expenses, 0);
    const netProfit = totalIncome - totalExpenses;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Financial Reports</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Overview of income, expenses, and cash flow.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option>Q4 2024</option>
                        <option>Q3 2024</option>
                        <option>Q2 2024</option>
                    </select>
                    <button className="px-6 py-2 bg-purple-100 text-purple-700 font-bold rounded-lg hover:bg-purple-200 transition-colors dark:bg-gray-700 dark:text-purple-400">
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Income"
                    value={`$${(totalIncome / 1000).toFixed(0)}k`}
                    percentage="Q4 2024"
                    trend="up"
                    colorClass="bg-green-100 text-green-600"
                    progressColor="bg-green-500"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <StatsCard
                    title="Total Expenses"
                    value={`$${(totalExpenses / 1000).toFixed(0)}k`}
                    percentage="Q4 2024"
                    trend="down"
                    colorClass="bg-red-100 text-red-600"
                    progressColor="bg-red-500"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                />
                <StatsCard
                    title="Net Profit"
                    value={`$${(netProfit / 1000).toFixed(0)}k`}
                    percentage="+14%"
                    trend="up"
                    colorClass="bg-blue-100 text-blue-600"
                    progressColor="bg-blue-500"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                />
                <StatsCard
                    title="Outstanding Fees"
                    value="$12.8k"
                    percentage="Pending"
                    trend="neutral"
                    colorClass="bg-orange-100 text-orange-600"
                    progressColor="bg-orange-500"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Simple Chart Simulation */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 dark:text-gray-100">Monthly Comparison</h3>
                    <div className="space-y-4">
                        {monthlyData.map((data, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-bold text-gray-700 dark:text-gray-300">{data.month}</span>
                                    <span className="text-gray-500 dark:text-gray-400">${(data.income - data.expenses).toLocaleString()} net</span>
                                </div>
                                <div className="flex gap-1 h-6">
                                    <div className="bg-green-500 rounded-l" style={{ width: `${(data.income / 60000) * 100}%` }}></div>
                                    <div className="bg-red-400 rounded-r" style={{ width: `${(data.expenses / 60000) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-6 mt-4 text-xs">
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-green-500"></span> Income</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-400"></span> Expenses</div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 dark:text-gray-100">Recent Transactions</h3>
                    <div className="space-y-3">
                        {recentTransactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-gray-100">{tx.desc}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{tx.date}</p>
                                </div>
                                <span className={`font-bold ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 py-2 text-purple-600 font-semibold text-sm hover:underline dark:text-purple-400">View All Transactions</button>
                </div>
            </div>
        </div>
    );
};

export default FinancialReports;
