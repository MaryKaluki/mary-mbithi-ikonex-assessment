import React, { useState } from 'react';

const FeeStructures = () => {
    const [showModal, setShowModal] = useState(false);

    const feeHeads = [
        { id: 1, name: 'Tuition Fee', description: 'Main academic fee', type: 'Mandatory', frequency: 'Per Term', status: 'active' },
        { id: 2, name: 'Transport Fee', description: 'School bus transport', type: 'Optional', frequency: 'Per Term', status: 'active' },
        { id: 3, name: 'Library Fee', description: 'Library access and books', type: 'Mandatory', frequency: 'Annual', status: 'active' },
        { id: 4, name: 'Lab Fee', description: 'Science laboratory usage', type: 'Mandatory', frequency: 'Per Term', status: 'active' },
        { id: 5, name: 'Sports Fee', description: 'Sports activities and equipment', type: 'Optional', frequency: 'Annual', status: 'active' },
        { id: 6, name: 'Boarding Fee', description: 'Dormitory accommodation', type: 'Conditional', frequency: 'Per Term', status: 'active' },
        { id: 7, name: 'Computer Lab Fee', description: 'Computer lab access', type: 'Mandatory', frequency: 'Annual', status: 'inactive' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Fee Heads & Structures</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Define fee categories and their properties</p>
                </div>
                <button onClick={() => setShowModal(true)} className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors">
                    + Add Fee Head
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto dark:bg-gray-800 dark:border-gray-700">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-4 py-3">Fee Head Name</th>
                            <th className="px-4 py-3">Description</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Frequency</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {feeHeads.map(head => (
                            <tr key={head.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{head.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{head.description}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${head.type === 'Mandatory' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300' :
                                            head.type === 'Optional' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' :
                                                'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300'
                                        }`}>
                                        {head.type}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{head.frequency}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${head.status === 'active' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-600 dark:text-gray-400'}`}>
                                        {head.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right space-x-3">
                                    <button className="text-purple-600 font-medium text-sm hover:underline dark:text-purple-400">Edit</button>
                                    <button className="text-red-600 font-medium text-sm hover:underline dark:text-red-400">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-lg dark:bg-gray-800">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 dark:text-gray-100">Add New Fee Head</h3>
                        <div className="space-y-4">
                            <input type="text" placeholder="Fee Head Name" className="w-full px-4 py-3 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            <textarea placeholder="Description" rows="2" className="w-full px-4 py-3 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                            <select className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <option>Select Type</option>
                                <option>Mandatory</option>
                                <option>Optional</option>
                                <option>Conditional</option>
                            </select>
                            <select className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <option>Select Frequency</option>
                                <option>Per Term</option>
                                <option>Annual</option>
                                <option>One-time</option>
                            </select>
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

export default FeeStructures;
