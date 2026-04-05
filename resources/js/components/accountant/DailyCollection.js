import React, { useState } from 'react';

const DailyCollection = () => {
    const [selectedDate, setSelectedDate] = useState('2024-10-28');

    const collections = [
        { id: 1, time: '08:15', receipt: 'RCP-0150', student: 'John Smith', amount: 5000, method: 'M-Pesa' },
        { id: 2, time: '09:30', receipt: 'RCP-0151', student: 'Alice Brown', amount: 12000, method: 'Bank Transfer' },
        { id: 3, time: '10:45', receipt: 'RCP-0152', student: 'Emily Davis', amount: 3500, method: 'Cash' },
        { id: 4, time: '11:20', receipt: 'RCP-0153', student: 'Michael Lee', amount: 8000, method: 'M-Pesa' },
        { id: 5, time: '14:10', receipt: 'RCP-0154', student: 'Sarah Wilson', amount: 15000, method: 'Bank Transfer' },
        { id: 6, time: '15:45', receipt: 'RCP-0155', student: 'Tommy Davis', amount: 10000, method: 'Cheque' },
    ];

    const methodTotals = {
        'M-Pesa': collections.filter(c => c.method === 'M-Pesa').reduce((a, b) => a + b.amount, 0),
        'Bank Transfer': collections.filter(c => c.method === 'Bank Transfer').reduce((a, b) => a + b.amount, 0),
        'Cash': collections.filter(c => c.method === 'Cash').reduce((a, b) => a + b.amount, 0),
        'Cheque': collections.filter(c => c.method === 'Cheque').reduce((a, b) => a + b.amount, 0),
    };

    const totalCollection = collections.reduce((a, b) => a + b.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Daily Collection Report</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Fee collections for selected date</p>
                </div>
                <div className="flex gap-3">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button className="px-6 py-2 bg-purple-100 text-purple-700 font-bold rounded-lg dark:bg-gray-700 dark:text-purple-400">
                        Print Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 col-span-2 md:col-span-1 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-xs text-gray-500 uppercase font-bold dark:text-gray-400">Total</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">KSh {totalCollection.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-xs text-gray-500 uppercase font-bold dark:text-gray-400">M-Pesa</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">KSh {methodTotals['M-Pesa'].toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-xs text-gray-500 uppercase font-bold dark:text-gray-400">Bank</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">KSh {methodTotals['Bank Transfer'].toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-xs text-gray-500 uppercase font-bold dark:text-gray-400">Cash</p>
                    <p className="text-xl font-bold text-orange-600 dark:text-orange-400">KSh {methodTotals['Cash'].toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-xs text-gray-500 uppercase font-bold dark:text-gray-400">Cheque</p>
                    <p className="text-xl font-bold text-gray-600 dark:text-gray-300">KSh {methodTotals['Cheque'].toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto dark:bg-gray-800 dark:border-gray-700">
                <table className="w-full text-left min-w-[700px]">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-4 py-3">Time</th>
                            <th className="px-4 py-3">Receipt No</th>
                            <th className="px-4 py-3">Student</th>
                            <th className="px-4 py-3">Payment Method</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {collections.map(col => (
                            <tr key={col.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{col.time}</td>
                                <td className="px-4 py-3 font-mono text-sm text-purple-600 dark:text-purple-400">{col.receipt}</td>
                                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{col.student}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{col.method}</td>
                                <td className="px-4 py-3 text-right font-bold text-green-600 dark:text-green-400">KSh {col.amount.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold dark:bg-gray-700">
                        <tr>
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-100" colSpan="4">Total for {selectedDate}</td>
                            <td className="px-4 py-3 text-right text-purple-600 dark:text-purple-400">KSh {totalCollection.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default DailyCollection;
