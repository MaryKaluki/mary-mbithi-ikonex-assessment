import React, { useState } from 'react';

const FeeAmounts = () => {
    const [selectedClass, setSelectedClass] = useState('all');
    const [showModal, setShowModal] = useState(false);

    const feeAmounts = [
        { id: 1, feeHead: 'Tuition Fee', class: 'Grade 1', term1: 12000, term2: 12000, term3: 12000, annual: 36000 },
        { id: 2, feeHead: 'Tuition Fee', class: 'Grade 2', term1: 12000, term2: 12000, term3: 12000, annual: 36000 },
        { id: 3, feeHead: 'Tuition Fee', class: 'Grade 3', term1: 13000, term2: 13000, term3: 13000, annual: 39000 },
        { id: 4, feeHead: 'Library Fee', class: 'All Classes', term1: 500, term2: 0, term3: 0, annual: 500 },
        { id: 5, feeHead: 'Sports Fee', class: 'All Classes', term1: 800, term2: 0, term3: 0, annual: 800 },
        { id: 6, feeHead: 'Lab Fee', class: 'Grade 3+', term1: 500, term2: 500, term3: 500, annual: 1500 },
        { id: 7, feeHead: 'Transport Fee', class: 'All Classes', term1: 4000, term2: 4000, term3: 4000, annual: 12000 },
    ];

    const classes = ['all', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Set Fee Amounts</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Configure fee amounts per class and term</p>
                </div>
                <button onClick={() => setShowModal(true)} className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors">
                    + Add Fee Amount
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {classes.map(cls => (
                    <button
                        key={cls}
                        onClick={() => setSelectedClass(cls)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm ${selectedClass === cls ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                        {cls === 'all' ? 'All Classes' : cls}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto dark:bg-gray-800 dark:border-gray-700">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-4 py-3">Fee Head</th>
                            <th className="px-4 py-3">Applicable To</th>
                            <th className="px-4 py-3 text-right">Term 1</th>
                            <th className="px-4 py-3 text-right">Term 2</th>
                            <th className="px-4 py-3 text-right">Term 3</th>
                            <th className="px-4 py-3 text-right bg-purple-50 dark:bg-purple-900/20">Annual Total</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {feeAmounts.map(fee => (
                            <tr key={fee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{fee.feeHead}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{fee.class}</td>
                                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{fee.term1 > 0 ? `KSh ${fee.term1.toLocaleString()}` : '-'}</td>
                                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{fee.term2 > 0 ? `KSh ${fee.term2.toLocaleString()}` : '-'}</td>
                                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{fee.term3 > 0 ? `KSh ${fee.term3.toLocaleString()}` : '-'}</td>
                                <td className="px-4 py-3 text-right font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400">KSh {fee.annual.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right">
                                    <button className="text-purple-600 font-medium text-sm hover:underline dark:text-purple-400">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-lg dark:bg-gray-800">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 dark:text-gray-100">Set Fee Amount</h3>
                        <div className="space-y-4">
                            <select className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <option>Select Fee Head</option>
                                <option>Tuition Fee</option>
                                <option>Library Fee</option>
                                <option>Lab Fee</option>
                                <option>Sports Fee</option>
                                <option>Transport Fee</option>
                            </select>
                            <select className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <option>Select Class</option>
                                <option>All Classes</option>
                                {classes.filter(c => c !== 'all').map(c => <option key={c}>{c}</option>)}
                            </select>
                            <div className="grid grid-cols-3 gap-3">
                                <input type="number" placeholder="Term 1" className="px-4 py-3 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                <input type="number" placeholder="Term 2" className="px-4 py-3 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                <input type="number" placeholder="Term 3" className="px-4 py-3 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
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

export default FeeAmounts;
