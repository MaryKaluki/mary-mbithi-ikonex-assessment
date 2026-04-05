import React from 'react';

const Discounts = () => {
    const discounts = [
        { id: 1, name: 'Second Sibling', type: 'Percentage', value: '10%', recipients: 120, status: 'Active' },
        { id: 2, name: 'Third Sibling', type: 'Percentage', value: '15%', recipients: 45, status: 'Active' },
        { id: 3, name: 'Staff Child', type: 'Fixed Amount', value: 'KSh 20,000', recipients: 30, status: 'Active' },
        { id: 4, name: 'Academic Scholarship', type: 'Percentage', value: '100%', recipients: 5, status: 'Active' },
    ];

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Discounts & Scholarships</h2>
                    <p className="text-sm text-gray-500">Manage automated tuition waivers.</p>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg shadow hover:bg-purple-700 transition-all">
                    + New Discount Rule
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Description</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Value</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Beneficiaries</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {discounts.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">{item.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{item.type}</td>
                                <td className="px-6 py-4 font-mono font-bold text-green-600">{item.value}</td>
                                <td className="px-6 py-4 text-sm font-medium">{item.recipients} Students</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-600">Active</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-purple-600 font-bold text-xs uppercase hover:underline">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Discounts;
