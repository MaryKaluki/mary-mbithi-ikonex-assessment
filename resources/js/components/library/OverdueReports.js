import React, { useState } from 'react';

const OverdueReports = () => {
    const [filter, setFilter] = useState('all');

    const overdueBooks = [
        { id: 1, student: 'Tommy Smith', grade: 'Grade 4A', book: 'Physics 101', isbn: '978-0743273565', dueDate: '2024-10-20', daysOverdue: 10, fine: 5.00 },
        { id: 2, student: 'Alice Brown', grade: 'Grade 5B', book: 'World History', isbn: '978-0446310789', dueDate: '2024-10-22', daysOverdue: 8, fine: 4.00 },
        { id: 3, student: 'John Doe', grade: 'Grade 6A', book: 'Chemistry Basics', isbn: '978-0451524935', dueDate: '2024-10-25', daysOverdue: 5, fine: 2.50 },
        { id: 4, student: 'Sarah Connor', grade: 'Staff', book: 'Advanced Biology', isbn: '978-1234567890', dueDate: '2024-10-28', daysOverdue: 2, fine: 1.00 },
    ];

    const filteredBooks = filter === 'all' ? overdueBooks :
        filter === 'critical' ? overdueBooks.filter(b => b.daysOverdue >= 7) :
            overdueBooks.filter(b => b.daysOverdue < 7);

    const totalFines = overdueBooks.reduce((a, b) => a + b.fine, 0);

    const getSeverity = (days) => {
        if (days >= 14) return 'bg-red-600 text-white';
        if (days >= 7) return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300';
        return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Overdue Books Report</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Track late returns and calculate fines.</p>
                </div>
                <button className="px-6 py-2 bg-purple-100 text-purple-700 font-bold rounded-lg hover:bg-purple-200 transition-colors dark:bg-gray-700 dark:text-purple-400 w-full sm:w-auto">
                    Export Report
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{overdueBooks.length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Overdue</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{overdueBooks.filter(b => b.daysOverdue >= 7).length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Critical (7+ days)</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">${totalFines.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Fines Due</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">$0.50</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Fine/Day</p>
                </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                {['all', 'critical', 'recent'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors ${filter === f ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                        {f === 'all' ? 'All Overdue' : f === 'critical' ? 'Critical (7+ days)' : 'Recent (<7 days)'}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto dark:bg-gray-800 dark:border-gray-700">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-4">Borrower</th>
                            <th className="px-6 py-4">Book</th>
                            <th className="px-6 py-4">Due Date</th>
                            <th className="px-6 py-4 text-center">Days Overdue</th>
                            <th className="px-6 py-4 text-right">Fine</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {filteredBooks.map((item) => (
                            <tr key={item.id} className="hover:bg-purple-50 transition-colors dark:hover:bg-gray-700">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm mr-3 dark:bg-purple-900/50 dark:text-purple-300">
                                            {item.student.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 dark:text-gray-100">{item.student}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.grade}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{item.book}</p>
                                    <p className="text-xs text-gray-400 font-mono">{item.isbn}</p>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{item.dueDate}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getSeverity(item.daysOverdue)}`}>
                                        {item.daysOverdue} days
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-red-600 dark:text-red-400">${item.fine.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-purple-600 font-bold text-sm hover:underline dark:text-purple-400">Send Reminder</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OverdueReports;
