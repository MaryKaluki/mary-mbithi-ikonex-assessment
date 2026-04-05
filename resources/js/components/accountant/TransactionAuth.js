import React from 'react';

const TransactionAuth = () => {
    const pendingTxns = [
        { id: 'TXN-009', type: 'Bank Transfer', amount: 'KSh 150,000', from: 'John Doe (Parent)', date: '2024-02-03', status: 'Pending Review' },
        { id: 'TXN-010', type: 'Cheque Deposit', amount: 'KSh 45,000', from: 'Jane Smith (Parent)', date: '2024-02-03', status: 'Pending Review' },
    ];

    return (
        <div className="space-y-6 pb-20">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Authorize Payments</h2>
            <p className="text-gray-500">Verify and approve high-value or manual transactions before posting.</p>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Transaction ID</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Payer</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {pendingTxns.map((txn) => (
                            <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">{txn.id}</td>
                                <td className="px-6 py-4 text-sm font-medium">{txn.type}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{txn.from}</td>
                                <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">{txn.amount}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-600">{txn.status}</span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button className="px-3 py-1 bg-green-500 text-white rounded text-xs font-bold hover:bg-green-600">Approve</button>
                                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-bold hover:bg-gray-300">Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionAuth;
