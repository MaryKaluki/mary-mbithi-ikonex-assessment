import React, { useState } from 'react';

const Expenditure = () => {
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all');

    const expenses = [
        { id: 1, date: '2024-10-28', description: 'Electricity Bill - October', category: 'Utilities', vendor: 'Kenya Power', amount: 24500, status: 'paid', ref: 'EXP-001' },
        { id: 2, date: '2024-10-25', description: 'Office Stationery', category: 'Supplies', vendor: 'Stationery Plus', amount: 3500, status: 'paid', ref: 'EXP-002' },
        { id: 3, date: '2024-10-22', description: 'Printer Maintenance', category: 'Maintenance', vendor: 'Tech Solutions', amount: 8000, status: 'pending', ref: 'EXP-003' },
        { id: 4, date: '2024-10-20', description: 'Staff Training Workshop', category: 'Training', vendor: 'Edu Consultants', amount: 15000, status: 'paid', ref: 'EXP-004' },
        { id: 5, date: '2024-10-18', description: 'Library Books Order', category: 'Educational', vendor: 'Book Depot', amount: 28000, status: 'pending', ref: 'EXP-005' },
        { id: 6, date: '2024-10-15', description: 'Water Bill - October', category: 'Utilities', vendor: 'Nairobi Water', amount: 5200, status: 'paid', ref: 'EXP-006' },
    ];

    const categories = ['all', 'Utilities', 'Supplies', 'Maintenance', 'Training', 'Educational'];
    const filteredExpenses = filter === 'all' ? expenses : expenses.filter(e => e.category === filter);

    const totalExpenses = expenses.reduce((a, b) => a + b.amount, 0);
    const paidExpenses = expenses.filter(e => e.status === 'paid').reduce((a, b) => a + b.amount, 0);
    const pendingExpenses = expenses.filter(e => e.status === 'pending').reduce((a, b) => a + b.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Expenditure Management</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Track and manage all school expenses</p>
                </div>
                <button onClick={() => setShowModal(true)} className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors">
                    + Record Expense
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-xs text-gray-500 uppercase font-bold dark:text-gray-400">Total Expenses</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">KSh {totalExpenses.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-xs text-gray-500 uppercase font-bold dark:text-gray-400">Paid</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">KSh {paidExpenses.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-xs text-gray-500 uppercase font-bold dark:text-gray-400">Pending</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">KSh {pendingExpenses.toLocaleString()}</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm capitalize ${filter === cat ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto dark:bg-gray-800 dark:border-gray-700">
                <table className="w-full text-left min-w-[900px]">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-4 py-3">Ref</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Description</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">Vendor</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {filteredExpenses.map(expense => (
                            <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-3 font-mono text-sm text-gray-500 dark:text-gray-400">{expense.ref}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{expense.date}</td>
                                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{expense.description}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{expense.category}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{expense.vendor}</td>
                                <td className="px-4 py-3 text-right font-bold text-red-600 dark:text-red-400">KSh {expense.amount.toLocaleString()}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${expense.status === 'paid' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                                        {expense.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button className="text-purple-600 font-medium text-sm hover:underline dark:text-purple-400">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-lg dark:bg-gray-800">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 dark:text-gray-100">Record New Expense</h3>
                        <div className="space-y-4">
                            <input type="text" placeholder="Description" className="w-full px-4 py-3 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            <select className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <option>Select Category</option>
                                {categories.filter(c => c !== 'all').map(c => <option key={c}>{c}</option>)}
                            </select>
                            <input type="text" placeholder="Vendor Name" className="w-full px-4 py-3 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            <input type="number" placeholder="Amount (KSh)" className="w-full px-4 py-3 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            <input type="date" className="w-full px-4 py-3 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700">Save</button>
                            <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-lg dark:bg-gray-700 dark:text-gray-300">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenditure;
