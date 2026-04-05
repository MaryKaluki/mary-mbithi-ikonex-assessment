import React, { useState } from 'react';

const DefaultersList = () => {
    const [threshold, setThreshold] = useState('10000');
    const [selectedClass, setSelectedClass] = useState('all');

    const defaulters = [
        { id: 1, admNo: 'ADM-003', name: 'Tommy Davis', class: 'Grade 3C', parent: 'Mrs. Davis', phone: '0723456789', balance: 22000, lastPayment: '2024-09-15', daysSince: 43 },
        { id: 2, admNo: 'ADM-001', name: 'John Smith', class: 'Grade 4A', parent: 'Mr. Smith', phone: '0712345678', balance: 15000, lastPayment: '2024-10-10', daysSince: 18 },
        { id: 3, admNo: 'ADM-004', name: 'Sarah Wilson', class: 'Grade 4A', parent: 'Mrs. Wilson', phone: '0745678901', balance: 13000, lastPayment: '2024-10-05', daysSince: 23 },
        { id: 4, admNo: 'ADM-008', name: 'David Brown', class: 'Grade 5B', parent: 'Mr. Brown', phone: '0767890123', balance: 18500, lastPayment: '2024-09-20', daysSince: 38 },
        { id: 5, admNo: 'ADM-009', name: 'Maria Garcia', class: 'Grade 6A', parent: 'Mrs. Garcia', phone: '0778901234', balance: 25000, lastPayment: '2024-08-30', daysSince: 59 },
    ];

    const classes = ['all', 'Grade 3C', 'Grade 4A', 'Grade 5B', 'Grade 6A'];
    const filteredDefaulters = defaulters
        .filter(d => d.balance >= parseInt(threshold))
        .filter(d => selectedClass === 'all' || d.class === selectedClass);

    const totalDefaulted = filteredDefaulters.reduce((a, b) => a + b.balance, 0);

    const getSeverity = (days) => {
        if (days >= 45) return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300';
        if (days >= 30) return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300';
        return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Defaulters List</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Students with overdue fee balances</p>
                </div>
                <button className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                    Send Bulk SMS
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col sm:flex-row gap-4 items-end dark:bg-gray-800 dark:border-gray-700">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1 dark:text-gray-400">Min Balance</label>
                    <select value={threshold} onChange={(e) => setThreshold(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option value="5000">KSh 5,000+</option>
                        <option value="10000">KSh 10,000+</option>
                        <option value="15000">KSh 15,000+</option>
                        <option value="20000">KSh 20,000+</option>
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1 dark:text-gray-400">Filter by Class</label>
                    <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        {classes.map(c => <option key={c} value={c}>{c === 'all' ? 'All Classes' : c}</option>)}
                    </select>
                </div>
                <button className="px-6 py-2 bg-purple-100 text-purple-700 font-bold rounded-lg dark:bg-gray-700 dark:text-purple-400">
                    Export List
                </button>
            </div>

            <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex justify-between items-center dark:bg-red-900/20 dark:border-red-800">
                <span className="font-medium text-gray-700 dark:text-gray-300">Total Defaulted Amount ({filteredDefaulters.length} students)</span>
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">KSh {totalDefaulted.toLocaleString()}</span>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto dark:bg-gray-800 dark:border-gray-700">
                <table className="w-full text-left min-w-[1000px]">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-4 py-3">Adm No</th>
                            <th className="px-4 py-3">Student Name</th>
                            <th className="px-4 py-3">Class</th>
                            <th className="px-4 py-3">Parent/Guardian</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3 text-right">Balance</th>
                            <th className="px-4 py-3">Last Payment</th>
                            <th className="px-4 py-3 text-center">Days Since</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {filteredDefaulters.map(student => (
                            <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-3 font-mono text-sm text-gray-500 dark:text-gray-400">{student.admNo}</td>
                                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{student.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{student.class}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{student.parent}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{student.phone}</td>
                                <td className="px-4 py-3 text-right font-bold text-red-600 dark:text-red-400">KSh {student.balance.toLocaleString()}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{student.lastPayment}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${getSeverity(student.daysSince)}`}>
                                        {student.daysSince} days
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right space-x-2">
                                    <button className="text-purple-600 font-medium text-sm hover:underline dark:text-purple-400">Pay</button>
                                    <button className="text-blue-600 font-medium text-sm hover:underline dark:text-blue-400">SMS</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DefaultersList;
