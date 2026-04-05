import React, { useState } from 'react';

const ReceiptsRegister = () => {
    const [startDate, setStartDate] = useState('2024-10-01');
    const [endDate, setEndDate] = useState('2024-10-31');

    const receipts = [
        { id: 1, receiptNo: 'RCP-0154', date: '2024-10-28', student: 'John Smith', admNo: 'ADM-001', class: 'Grade 4A', amount: 5000, method: 'M-Pesa', ref: 'RHX78KLM', recordedBy: 'Admin' },
        { id: 2, receiptNo: 'RCP-0153', date: '2024-10-28', student: 'Alice Brown', admNo: 'ADM-002', class: 'Grade 5B', amount: 12000, method: 'Bank Transfer', ref: 'TRF-45678', recordedBy: 'Admin' },
        { id: 3, receiptNo: 'RCP-0152', date: '2024-10-27', student: 'Emily Davis', admNo: 'ADM-006', class: 'Grade 3C', amount: 3500, method: 'Cash', ref: '-', recordedBy: 'Accountant' },
        { id: 4, receiptNo: 'RCP-0151', date: '2024-10-27', student: 'Michael Lee', admNo: 'ADM-007', class: 'Grade 6A', amount: 8000, method: 'M-Pesa', ref: 'QWE12NOP', recordedBy: 'Admin' },
        { id: 5, receiptNo: 'RCP-0150', date: '2024-10-26', student: 'Sarah Wilson', admNo: 'ADM-004', class: 'Grade 4A', amount: 15000, method: 'Bank Transfer', ref: 'TRF-45123', recordedBy: 'Accountant' },
        { id: 6, receiptNo: 'RCP-0149', date: '2024-10-25', student: 'Tommy Davis', admNo: 'ADM-003', class: 'Grade 3C', amount: 10000, method: 'Cheque', ref: 'CHQ-7890', recordedBy: 'Admin' },
    ];

    const totalAmount = receipts.reduce((a, b) => a + b.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Receipts Register</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">All recorded fee payments</p>
                </div>
                <button className="px-6 py-2 bg-purple-100 text-purple-700 font-bold rounded-lg dark:bg-gray-700 dark:text-purple-400">
                    Export CSV
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col sm:flex-row gap-4 items-end dark:bg-gray-800 dark:border-gray-700">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1 dark:text-gray-400">From Date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1 dark:text-gray-400">To Date</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <button className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700">Filter</button>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex justify-between items-center dark:bg-purple-900/20 dark:border-purple-800">
                <span className="font-medium text-gray-700 dark:text-gray-300">Total Collections ({receipts.length} receipts)</span>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">KSh {totalAmount.toLocaleString()}</span>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto dark:bg-gray-800 dark:border-gray-700">
                <table className="w-full text-left min-w-[1000px]">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-4 py-3">Receipt No</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Student</th>
                            <th className="px-4 py-3">Adm No</th>
                            <th className="px-4 py-3">Class</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                            <th className="px-4 py-3">Method</th>
                            <th className="px-4 py-3">Reference</th>
                            <th className="px-4 py-3">Recorded By</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {receipts.map(receipt => (
                            <tr key={receipt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-3 font-mono text-sm font-medium text-purple-600 dark:text-purple-400">{receipt.receiptNo}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{receipt.date}</td>
                                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{receipt.student}</td>
                                <td className="px-4 py-3 font-mono text-sm text-gray-500 dark:text-gray-400">{receipt.admNo}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{receipt.class}</td>
                                <td className="px-4 py-3 text-right font-bold text-green-600 dark:text-green-400">KSh {receipt.amount.toLocaleString()}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{receipt.method}</td>
                                <td className="px-4 py-3 font-mono text-sm text-gray-500 dark:text-gray-400">{receipt.ref}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{receipt.recordedBy}</td>
                                <td className="px-4 py-3 text-right">
                                    <button className="text-purple-600 font-medium text-sm hover:underline dark:text-purple-400">Print</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReceiptsRegister;
