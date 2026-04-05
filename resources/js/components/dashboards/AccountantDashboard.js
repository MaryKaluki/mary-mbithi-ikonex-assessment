import React from 'react';
import StatsCard from '../StatsCard';

const AccountantDashboard = () => (
    <div>
        {/* Financial Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
                title="Total Collections (Oct)"
                value="$45,200"
                percentage="+12%"
                trend="up"
                colorClass="bg-green-100 text-green-600"
                progressColor="bg-green-500"
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <StatsCard
                title="Outstanding Fees"
                value="$12,850"
                percentage="Alert"
                trend="down"
                colorClass="bg-red-100 text-red-600"
                progressColor="bg-red-500"
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
            />
            <StatsCard
                title="Expenses (Oct)"
                value="$8,400"
                percentage="Within Budget"
                trend="neutral"
                colorClass="bg-orange-100 text-orange-600"
                progressColor="bg-orange-500"
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            />
            <StatsCard
                title="Bank Balance"
                value="$156,000"
                percentage="Updated 1h ago"
                trend="up"
                colorClass="bg-blue-100 text-blue-600"
                progressColor="bg-blue-500"
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>}
            />
        </div>

        {/* Financial Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Transactions */}
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 dark:bg-gray-800 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 mb-4 dark:text-gray-100">Recent Transactions</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left min-w-[500px]">
                        <thead>
                            <tr className="text-gray-400 border-b">
                                <th className="pb-2">ID</th>
                                <th className="pb-2">Description</th>
                                <th className="pb-2">Date</th>
                                <th className="pb-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b">
                                <td className="py-3 text-gray-500">#TRX-890</td>
                                <td className="font-medium">Term 2 Fees - Grade 4A</td>
                                <td className="text-gray-500">Today, 10:23 AM</td>
                                <td className="text-right font-bold text-green-600">+$4,500</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-3 text-gray-500">#TRX-889</td>
                                <td className="font-medium">Electricity Bill (October)</td>
                                <td className="text-gray-500">Yesterday</td>
                                <td className="text-right font-bold text-red-500">-$240</td>
                            </tr>
                            <tr className="border-b last:border-0">
                                <td className="py-3 text-gray-500">#TRX-888</td>
                                <td className="font-medium">Library Books Order</td>
                                <td className="text-gray-500">Oct 29</td>
                                <td className="text-right font-bold text-red-500">-$1,200</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <button className="w-full mt-4 py-2 text-primary font-semibold text-sm hover:underline">View All Transactions</button>
            </div>

            {/* Fee Collection Progress */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 dark:bg-gray-800 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 mb-6 dark:text-gray-100">Fee Progress (Term 2)</h3>
                <div className="flex items-center justify-center h-40 relative mb-6">
                    <div className="w-40 h-40 rounded-full bg-gray-100 relative overflow-hidden"
                        style={{ background: 'conic-gradient(#3b82f6 0% 65%, #cbd5e1 65% 100%)' }}></div>
                    <div className="absolute w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                        <span className="text-3xl font-bold text-gray-800">65%</span>
                        <span className="text-xs text-gray-500">Collected</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                        <p className="text-xs text-gray-500 uppercase">Target</p>
                        <p className="text-lg font-bold text-gray-800">$120k</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                        <p className="text-xs text-gray-500 uppercase">Deficit</p>
                        <p className="text-lg font-bold text-red-500">$42k</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default AccountantDashboard;
