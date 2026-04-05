import React, { useState } from 'react';

const FeeInstallments = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const installments = [
        { id: 'PLAN-001', student: 'John Doe', plan: '3-Month Plan', total: 'KSh 45,000', paid: 'KSh 15,000', nextDue: '2024-02-05', amountDue: 'KSh 15,000', status: 'Active' },
        { id: 'PLAN-002', student: 'Jane Smith', plan: '2-Month Plan', total: 'KSh 30,000', paid: 'KSh 30,000', nextDue: '-', amountDue: 'KSh 0', status: 'Completed' },
        { id: 'PLAN-003', student: 'Mike Ross', plan: 'Special Arrangement', total: 'KSh 50,000', paid: 'KSh 10,000', nextDue: '2024-02-01', amountDue: 'KSh 10,000', status: 'Overdue' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-600';
            case 'Active': return 'bg-blue-100 text-blue-600';
            case 'Overdue': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Fee Installment Plans</h2>
                    <p className="text-sm text-gray-500">Manage custom payment schedules for students.</p>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg shadow hover:bg-purple-700 hover:-translate-y-0.5 transform transition-all">
                    + Create New Plan
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <input
                    type="text"
                    placeholder="Search by Student or Plan ID..."
                    className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 dark:bg-gray-700 dark:border-gray-600">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Plan ID</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Student</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Plan Type</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Total</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Next Due</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {installments.map((plan) => (
                            <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">{plan.id}</td>
                                <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">{plan.student}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{plan.plan}</td>
                                <td className="px-6 py-4 font-medium">{plan.total}</td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium">{plan.nextDue}</div>
                                    <div className="text-xs text-gray-500">{plan.amountDue}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(plan.status)}`}>{plan.status}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-purple-600 hover:underline text-sm font-medium">View Schedule</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FeeInstallments;
