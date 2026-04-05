import React, { useState } from 'react';

const ExpenseManager = () => {
    const [showModal, setShowModal] = useState(false);

    const expenses = [
        { id: 1, description: 'Electricity Bill (October)', category: 'Utilities', date: '2024-10-28', amount: 2400, status: 'paid' },
        { id: 2, description: 'Office Supplies', category: 'Operations', date: '2024-10-25', amount: 350, status: 'paid' },
        { id: 3, description: 'Printer Maintenance', category: 'Maintenance', date: '2024-10-22', amount: 180, status: 'pending' },
        { id: 4, description: 'Staff Training Workshop', category: 'HR', date: '2024-10-20', amount: 1500, status: 'paid' },
        { id: 5, description: 'Library Books Order', category: 'Educational', date: '2024-10-18', amount: 2800, status: 'pending' },
    ];

    const getCategoryColor = (cat) => {
        const colors = {
            Utilities: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
            Operations: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
            Maintenance: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300',
            HR: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300',
            Educational: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300',
        };
        return colors[cat] || colors.Operations;
    };

    const totalExpenses = expenses.reduce((a, b) => a + b.amount, 0);
    const paidExpenses = expenses.filter(e => e.status === 'paid').reduce((a, b) => a + b.amount, 0);
    const pendingExpenses = expenses.filter(e => e.status === 'pending').reduce((a, b) => a + b.amount, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Expense Management</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Track and manage school expenditures.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg w-full sm:w-auto"
                >
                    + Record Expense
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1 dark:text-gray-400">Total Expenses</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">${totalExpenses.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1 dark:text-gray-400">Paid</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">${paidExpenses.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1 dark:text-gray-400">Pending</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">${pendingExpenses.toLocaleString()}</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto dark:bg-gray-800 dark:border-gray-700">
                <table className="w-full text-left min-w-[700px]">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Amount</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {expenses.map((expense) => (
                            <tr key={expense.id} className="hover:bg-purple-50 transition-colors dark:hover:bg-gray-700">
                                <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-100">{expense.description}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${getCategoryColor(expense.category)}`}>
                                        {expense.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{expense.date}</td>
                                <td className="px-6 py-4 text-right font-bold text-red-600 dark:text-red-400">${expense.amount.toLocaleString()}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${expense.status === 'paid' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                                        {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-purple-600 font-bold text-sm hover:underline dark:text-purple-400">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-lg dark:bg-gray-800">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 dark:text-gray-100">Record New Expense</h3>
                        <div className="space-y-4">
                            <input type="text" placeholder="Description..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <option>Select Category...</option>
                                <option>Utilities</option>
                                <option>Operations</option>
                                <option>Maintenance</option>
                                <option>HR</option>
                                <option>Educational</option>
                            </select>
                            <input type="number" placeholder="Amount ($)..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            <input type="date" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700">Save Expense</button>
                            <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseManager;
