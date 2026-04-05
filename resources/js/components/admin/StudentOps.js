import React, { useState } from 'react';

const StudentOps = () => {
    const [activeTab, setActiveTab] = useState('promotion');

    return (
        <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Student Operations</h2>

            <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto custom-scrollbar">
                <button
                    onClick={() => setActiveTab('promotion')}
                    className={`px-8 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'promotion' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    Promote Students
                </button>
                <button
                    onClick={() => setActiveTab('alumni')}
                    className={`px-8 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'alumni' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    Alumni Management
                </button>
            </div>

            {activeTab === 'promotion' ? (
                <div className="bg-purple-50 p-8 rounded-2xl shadow-sm border border-purple-100 max-w-2xl dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 dark:text-gray-100">Class Promotion Wizard</h3>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-2 dark:text-gray-400">Promote From</label>
                                <select className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                                    <option>Grade 1</option>
                                    <option>Grade 2</option>
                                    <option>Grade 3</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-2 dark:text-gray-400">To Class</label>
                                <select className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                                    <option>Grade 2</option>
                                    <option>Grade 3</option>
                                    <option>Grade 4</option>
                                </select>
                            </div>
                        </div>

                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100 dark:bg-yellow-900/10 dark:border-yellow-900/30">
                            <h4 className="font-bold text-yellow-800 mb-1 dark:text-yellow-200">Warning</h4>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">This action will move all eligible students to the next grade. Students with 'Fail' status will remain in their current grade.</p>
                        </div>

                        <button className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-lg">
                            Process Promotion
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto dark:bg-gray-800 dark:border-gray-700">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Graduation Year</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Current Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {[
                                { name: 'Sarah Connor', year: '2023', contact: 'sarah@uni.edu', status: 'University' },
                                { name: 'John Wick', year: '2022', contact: 'john@work.com', status: 'Employed' },
                            ].map((alum, i) => (
                                <tr key={i} className="hover:bg-purple-50 transition-colors dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-100">{alum.name}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{alum.year}</td>
                                    <td className="px-6 py-4 text-gray-500 text-sm dark:text-gray-400">{alum.contact}</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold">{alum.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StudentOps;
