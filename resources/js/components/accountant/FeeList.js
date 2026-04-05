import React from 'react';

const FeeList = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Fee Collections</h2>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <button className="px-4 py-2 bg-purple-100 text-purple-700 font-bold rounded-lg hover:bg-purple-200 transition-colors dark:bg-gray-700 dark:text-purple-400 dark:hover:bg-gray-600 text-center">
                        Download Report
                    </button>
                    <button className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-center">
                        Record Payment
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto hover:shadow-lg transition-all duration-300 dark:bg-gray-800 dark:border-gray-700">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-gray-50 border-b border-gray-100 dark:bg-gray-700 dark:border-gray-600">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Transaction ID</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Student</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Description</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right dark:text-gray-400">Amount</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center dark:text-gray-400">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {[
                            { id: '#TRX-901', student: 'Tommy Smith', desc: 'Term 2 Tuition', date: 'Oct 29, 2024', amount: '$1,200', status: 'Success' },
                            { id: '#TRX-902', student: 'Alice Walker', desc: 'Library Fine', date: 'Oct 29, 2024', amount: '$5.00', status: 'Success' },
                            { id: '#TRX-903', student: 'Sarah Connor', desc: 'Transport Fee', date: 'Oct 28, 2024', amount: '$150', status: 'Pending' },
                        ].map((trx, i) => (
                            <tr key={i} className="hover:bg-purple-50 transition-colors cursor-pointer dark:hover:bg-gray-700">
                                <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{trx.id}</td>
                                <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-100">{trx.student}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{trx.desc}</td>
                                <td className="px-6 py-4 text-gray-500 text-sm dark:text-gray-400">{trx.date}</td>
                                <td className="px-6 py-4 text-right font-bold text-gray-800 dark:text-gray-100">{trx.amount}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${trx.status === 'Success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                                        {trx.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FeeList;
