import React, { useState } from 'react';

const PinManager = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Access Pin Management</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                {/* Generate */}
                <div className="bg-purple-50 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-purple-100 dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 dark:text-gray-100">Generate New Pins</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-2 dark:text-gray-300">Batch Name</label>
                            <input type="text" placeholder="e.g. Term 1 Exam Access" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-2 dark:text-gray-300">Quantity</label>
                            <input type="number" defaultValue="50" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" />
                        </div>
                        <button className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-lg">
                            Generate Pins
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="bg-purple-600 text-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold opacity-90">Pin Usage Stats</h3>
                        <p className="text-sm opacity-70">Overview of generated access codes.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-white/10 p-4 rounded-xl">
                            <p className="text-3xl font-extrabold">1,250</p>
                            <p className="text-xs uppercase tracking-wider opacity-80">Total Pins</p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-xl">
                            <p className="text-3xl font-extrabold text-green-300">85%</p>
                            <p className="text-xs uppercase tracking-wider opacity-80">Used</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto dark:bg-gray-800 dark:border-gray-700">
                <div className="p-4 border-b border-gray-50 font-bold text-gray-700 dark:border-gray-700 dark:text-gray-200">Recent Batches</div>
                <table className="w-full text-left min-w-[700px]">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-4">Batch ID</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Created Date</th>
                            <th className="px-6 py-4">Count</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {[
                            { id: '#B001', name: 'Term 1 Results', date: 'Oct 20, 2024', count: 100, status: 'Active' },
                            { id: '#B002', name: 'Special Entry', date: 'Sep 15, 2024', count: 20, status: 'Expired' },
                        ].map((batch, i) => (
                            <tr key={i} className="hover:bg-purple-50 transition-colors dark:hover:bg-gray-700">
                                <td className="px-6 py-4 font-mono text-sm text-gray-500 dark:text-gray-400">{batch.id}</td>
                                <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-100">{batch.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{batch.date}</td>
                                <td className="px-6 py-4 font-bold dark:text-gray-200">{batch.count}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${batch.status === 'Active' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300'}`}>{batch.status}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-purple-600 hover:underline text-sm font-bold dark:text-purple-400">Export</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PinManager;
