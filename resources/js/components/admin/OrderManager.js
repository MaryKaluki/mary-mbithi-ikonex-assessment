import React, { useState } from 'react';

const OrderManager = () => {
    const [activeTab, setActiveTab] = useState('books');

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Procurement & Orders</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Manage purchase requests for textbooks and library resources.</p>
                </div>
                <button className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg">
                    + Create New Order
                </button>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('books')}
                    className={`px-8 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'books' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                >
                    Textbook Orders
                </button>
                <button
                    onClick={() => setActiveTab('library')}
                    className={`px-8 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'library' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                >
                    Library Acquisitions
                </button>
            </div>

            {/* Order Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div key={item} className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer group dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500">#ORD-2024-{100 + item}</span>
                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${item % 2 === 0 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300'}`}>
                                {item % 2 === 0 ? 'Pending Approval' : 'Dispatched'}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1 dark:text-gray-100">
                            {activeTab === 'books' ? 'Grade 5 Math Textbooks' : 'New Fiction Collection'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">Supplier: Text Book Centre Ltd</p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold dark:text-gray-500">Total Cost</p>
                                <p className="font-bold text-gray-800 dark:text-gray-100">$1,250.00</p>
                            </div>
                            <button className="text-purple-600 font-bold text-sm hover:underline dark:text-purple-400">View Details</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderManager;
