import React, { useState } from 'react';

const Refunds = () => {
    const refunds = [
        { id: 'REF-001', student: 'Alice Walker', amount: 'KSh 5,000', reason: 'Overpayment', date: '2024-01-10', status: 'Pending Approval' },
        { id: 'REF-002', student: 'Bob Smith', amount: 'KSh 2,500', reason: 'Caution Money Return', date: '2023-12-15', status: 'Approved' },
        { id: 'REF-003', student: 'Charlie Brown', amount: 'KSh 10,000', reason: 'Wrong Account', date: '2024-01-05', status: 'Rejected' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-600';
            case 'Pending Approval': return 'bg-yellow-100 text-yellow-600';
            case 'Rejected': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Refund Requests</h2>
                    <p className="text-sm text-gray-500">Process refunds and view history.</p>
                </div>
                <button className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg shadow hover:bg-red-600 transition-all">
                    + New Refund Request
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 dark:bg-gray-700 dark:border-gray-600">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Refund ID</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Student</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Reason</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Date Requested</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {refunds.map((ref) => (
                            <tr key={ref.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">{ref.id}</td>
                                <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">{ref.student}</td>
                                <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">{ref.amount}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{ref.reason}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{ref.date}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(ref.status)}`}>{ref.status}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {ref.status === 'Pending Approval' && (
                                        <div className="flex justify-end space-x-2">
                                            <button className="text-green-600 hover:text-green-800 font-bold text-xs uppercase">Approve</button>
                                            <button className="text-red-500 hover:text-red-700 font-bold text-xs uppercase">Reject</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Refunds;
