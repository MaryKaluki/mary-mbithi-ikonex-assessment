import React, { useState } from 'react';

const TransactionSync = () => {
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 2000); // Mock sync delay
    };

    const transactions = [
        { id: 'TXN-MP-001', source: 'M-PESA', ref: 'QWE123ASD', amount: 'KSh 12,000', date: '2024-02-03 14:30', status: 'Synced' },
        { id: 'TXN-BK-042', source: 'Equity Bank', ref: 'EQ-998877', amount: 'KSh 45,000', date: '2024-02-03 10:15', status: 'Synced' },
        { id: 'TXN-MP-002', source: 'M-PESA', ref: 'ASD456ZXC', amount: 'KSh 5,000', date: '2024-02-03 09:00', status: 'Failed' },
    ];

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Sync Transactions</h2>
                    <p className="text-sm text-gray-500">Import payments from external gateways.</p>
                </div>
                <button
                    onClick={handleSync}
                    className={`px-6 py-2 bg-green-600 text-white font-bold rounded-lg shadow hover:bg-green-700 transition-all flex items-center ${isSyncing ? 'opacity-75 cursor-not-allowed' : ''}`}
                    disabled={isSyncing}
                >
                    {isSyncing ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Syncing...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            Sync Now
                        </>
                    )}
                </button>
            </div>

            {/* Source Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <div className="text-sm font-gray-500">M-PESA Paybill</div>
                        <div className="text-xl font-bold text-green-600">Active</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full text-green-600 font-bold">MP</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <div className="text-sm font-gray-500">Bank Integration</div>
                        <div className="text-xl font-bold text-blue-600">Active</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full text-blue-600 font-bold">BK</div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Gateway</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Reference</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Timestamp</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {transactions.map((txn) => (
                            <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">{txn.source}</td>
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">{txn.ref}</td>
                                <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">{txn.amount}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{txn.date}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${txn.status === 'Synced' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{txn.status}</span>
                                </td>
                                <td className="px-6 py-4">
                                    {txn.status === 'Failed' && <button className="text-blue-600 text-xs font-bold uppercase hover:underline">Retry</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionSync;
