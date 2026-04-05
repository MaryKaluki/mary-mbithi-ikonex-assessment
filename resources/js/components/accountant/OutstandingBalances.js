import React, { useState } from 'react';

const OutstandingBalances = () => {
    const [selectedClass, setSelectedClass] = useState('all');

    const students = [
        { id: 1, admNo: 'ADM-001', name: 'John Smith', class: 'Grade 4A', parent: 'Mr. Smith', phone: '0712345678', totalFee: 45000, paid: 30000, balance: 15000 },
        { id: 2, admNo: 'ADM-003', name: 'Tommy Davis', class: 'Grade 3C', parent: 'Mrs. Davis', phone: '0723456789', totalFee: 42000, paid: 20000, balance: 22000 },
        { id: 3, admNo: 'ADM-002', name: 'Alice Brown', class: 'Grade 5B', parent: 'Mr. Brown', phone: '0734567890', totalFee: 48000, paid: 39500, balance: 8500 },
        { id: 4, admNo: 'ADM-004', name: 'Sarah Wilson', class: 'Grade 4A', parent: 'Mrs. Wilson', phone: '0745678901', totalFee: 45000, paid: 32000, balance: 13000 },
        { id: 5, admNo: 'ADM-005', name: 'Emily Johnson', class: 'Grade 6A', parent: 'Mr. Johnson', phone: '0756789012', totalFee: 52000, paid: 52000, balance: 0 },
    ];

    const classes = ['all', 'Grade 3C', 'Grade 4A', 'Grade 5B', 'Grade 6A'];
    const filteredStudents = selectedClass === 'all' ? students.filter(s => s.balance > 0) : students.filter(s => s.class === selectedClass && s.balance > 0);

    const totalOutstanding = filteredStudents.reduce((a, b) => a + b.balance, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Outstanding Balances</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Students with pending fee balances</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        {classes.map(c => <option key={c} value={c}>{c === 'all' ? 'All Classes' : c}</option>)}
                    </select>
                    <button className="px-6 py-2 bg-purple-100 text-purple-700 font-bold rounded-lg dark:bg-gray-700 dark:text-purple-400">
                        Export Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-xs text-gray-500 uppercase font-bold dark:text-gray-400">Total Outstanding</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">KSh {totalOutstanding.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-xs text-gray-500 uppercase font-bold dark:text-gray-400">Students with Balance</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{filteredStudents.length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-xs text-gray-500 uppercase font-bold dark:text-gray-400">Avg. Balance</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">KSh {filteredStudents.length > 0 ? Math.round(totalOutstanding / filteredStudents.length).toLocaleString() : 0}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto dark:bg-gray-800 dark:border-gray-700">
                <table className="w-full text-left min-w-[900px]">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-4 py-3">Adm No</th>
                            <th className="px-4 py-3">Student Name</th>
                            <th className="px-4 py-3">Class</th>
                            <th className="px-4 py-3">Parent/Guardian</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3 text-right">Total Fee</th>
                            <th className="px-4 py-3 text-right">Paid</th>
                            <th className="px-4 py-3 text-right">Balance</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {filteredStudents.map(student => (
                            <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-3 font-mono text-sm text-gray-500 dark:text-gray-400">{student.admNo}</td>
                                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{student.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{student.class}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{student.parent}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{student.phone}</td>
                                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">KSh {student.totalFee.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right text-green-600 dark:text-green-400">KSh {student.paid.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right font-bold text-red-600 dark:text-red-400">KSh {student.balance.toLocaleString()}</td>
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

export default OutstandingBalances;
