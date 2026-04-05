import React, { useState } from 'react';

const IssueReturn = () => {
    const [activeTab, setActiveTab] = useState('issue');
    const [studentId, setStudentId] = useState('');
    const [isbn, setIsbn] = useState('');

    const recentTransactions = [
        { id: 1, type: 'issue', student: 'Tommy Smith', book: 'Physics 101', isbn: '978-0743273565', time: '10 mins ago' },
        { id: 2, type: 'return', student: 'Alice Brown', book: 'World History', isbn: '978-0446310789', time: '25 mins ago' },
        { id: 3, type: 'issue', student: 'John Doe', book: 'Chemistry Basics', isbn: '978-0451524935', time: '1 hour ago' },
        { id: 4, type: 'return', student: 'Sarah Connor', book: 'English Literature', isbn: '978-1234567890', time: '2 hours ago' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`${activeTab === 'issue' ? 'Issuing' : 'Returning'} book ${isbn} for student ${studentId}`);
        setStudentId('');
        setIsbn('');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Issue & Return</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Quick library checkout counter.</p>
            </div>

            {/* Main Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Issue/Return Form */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    {/* Tabs */}
                    <div className="flex mb-6">
                        <button
                            onClick={() => setActiveTab('issue')}
                            className={`flex-1 py-3 font-bold rounded-l-xl transition-colors ${activeTab === 'issue' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
                        >
                            📖 Issue Book
                        </button>
                        <button
                            onClick={() => setActiveTab('return')}
                            className={`flex-1 py-3 font-bold rounded-r-xl transition-colors ${activeTab === 'return' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
                        >
                            ✅ Return Book
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-2 dark:text-gray-300">
                                {activeTab === 'issue' ? 'Student ID / Name' : 'Return By (Student ID or Scan)'}
                            </label>
                            <input
                                type="text"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                placeholder="Enter student ID or scan card..."
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-2 dark:text-gray-300">
                                ISBN / Book ID
                            </label>
                            <input
                                type="text"
                                value={isbn}
                                onChange={(e) => setIsbn(e.target.value)}
                                placeholder="Scan barcode or enter ISBN..."
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                            />
                        </div>
                        <button
                            type="submit"
                            className={`w-full py-4 font-bold rounded-xl text-white text-lg transition-colors shadow-lg ${activeTab === 'issue' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            {activeTab === 'issue' ? '📖 Issue This Book' : '✅ Process Return'}
                        </button>
                    </form>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">485</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Books Out</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">24</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Returned Today</p>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 dark:text-gray-100">Recent Activity</h3>
                    <div className="space-y-3">
                        {recentTransactions.map((tx) => (
                            <div key={tx.id} className={`p-4 rounded-xl border-l-4 ${tx.type === 'issue' ? 'bg-purple-50 border-purple-500 dark:bg-purple-900/20' : 'bg-green-50 border-green-500 dark:bg-green-900/20'}`}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`text-xs font-bold uppercase ${tx.type === 'issue' ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400'}`}>
                                        {tx.type === 'issue' ? '📖 Issued' : '✅ Returned'}
                                    </span>
                                    <span className="text-xs text-gray-400">{tx.time}</span>
                                </div>
                                <p className="font-bold text-gray-800 dark:text-gray-100">{tx.book}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{tx.student} • {tx.isbn}</p>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 py-2 text-purple-600 font-semibold text-sm hover:underline dark:text-purple-400">
                        View Full Transaction Log
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IssueReturn;
