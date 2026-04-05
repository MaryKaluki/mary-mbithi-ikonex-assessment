import React, { useState } from 'react';

const BankReconciliation = () => {
    const [selectedMonth, setSelectedMonth] = useState('2024-10');

    const systemTransactions = [
        { id: 1, date: '2024-10-28', ref: 'RCP-0154', description: 'Fee Payment - John Smith', amount: 5000, type: 'credit' },
        { id: 2, date: '2024-10-28', ref: 'RCP-0153', description: 'Fee Payment - Alice Brown', amount: 12000, type: 'credit' },
        { id: 3, date: '2024-10-27', ref: 'EXP-003', description: 'Printer Maintenance', amount: 8000, type: 'debit' },
        { id: 4, date: '2024-10-26', ref: 'RCP-0150', description: 'Fee Payment - Sarah Wilson', amount: 15000, type: 'credit' },
        { id: 5, date: '2024-10-25', ref: 'EXP-002', description: 'Office Stationery', amount: 3500, type: 'debit' },
    ];

    const bankStatements = [
        { id: 1, date: '2024-10-28', ref: 'MPE78KLM', description: 'M-Pesa Transfer', amount: 5000, matched: true },
        { id: 2, date: '2024-10-28', ref: 'TRF45678', description: 'Bank Transfer', amount: 12000, matched: true },
        { id: 3, date: '2024-10-27', ref: 'CHK7890', description: 'Cheque Payment', amount: 8000, matched: true },
        { id: 4, date: '2024-10-26', ref: 'TRF45123', description: 'Bank Transfer', amount: 15000, matched: true },
        { id: 5, date: '2024-10-26', ref: 'MPE99ABC', description: 'M-Pesa Transfer', amount: 7500, matched: false },
    ];

    const systemTotal = systemTransactions.filter(t => t.type === 'credit').reduce((a, b) => a + b.amount, 0);
    const bankTotal = bankStatements.reduce((a, b) => a + b.amount, 0);
    const difference = bankTotal - systemTotal;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Bank Reconciliation</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Match bank statements with system records</p>
                </div>
                <div className="flex gap-3">
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700">
                        Upload Statement
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-xs text-gray-500 uppercase font-bold dark:text-gray-400">System Total (Credits)</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">KSh {systemTotal.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-xs text-gray-500 uppercase font-bold dark:text-gray-400">Bank Total</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">KSh {bankTotal.toLocaleString()}</p>
                </div>
                <div className={`bg-white p-4 rounded-xl border ${difference === 0 ? 'border-green-200' : 'border-red-200'} dark:bg-gray-800`}>
                    <p className="text-xs text-gray-500 uppercase font-bold dark:text-gray-400">Difference</p>
                    <p className={`text-2xl font-bold ${difference === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {difference >= 0 ? '+' : ''}KSh {difference.toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Records */}
                <div className="bg-white rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100">System Records</h3>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                        {systemTransactions.map(tx => (
                            <div key={tx.id} className="px-4 py-3 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{tx.description}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{tx.date} | {tx.ref}</p>
                                </div>
                                <span className={`font-bold ${tx.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {tx.type === 'credit' ? '+' : '-'}KSh {tx.amount.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bank Statements */}
                <div className="bg-white rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100">Bank Statements</h3>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                        {bankStatements.map(tx => (
                            <div key={tx.id} className={`px-4 py-3 flex items-center justify-between ${!tx.matched ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <span className={`w-2 h-2 rounded-full ${tx.matched ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-100">{tx.description}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{tx.date} | {tx.ref}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-green-600 dark:text-green-400">+KSh {tx.amount.toLocaleString()}</span>
                                    {!tx.matched && <p className="text-xs text-yellow-600 dark:text-yellow-400">Unmatched</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BankReconciliation;
