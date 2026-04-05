import React from 'react';

const Sponsorships = () => {
    const sponsors = [
        { id: 1, name: 'Equity Wings to Fly', students: 12, commitment: 'KSh 1,200,000', paid: 'KSh 800,000', balance: 'KSh 400,000' },
        { id: 2, name: 'Constituency Development Fund (CDF)', students: 45, commitment: 'KSh 2,500,000', paid: 'KSh 2,000,000', balance: 'KSh 500,000' },
        { id: 3, name: 'Elimu Trust', students: 4, commitment: 'KSh 400,000', paid: 'KSh 400,000', balance: 'KSh 0' },
    ];

    return (
        <div className="space-y-6 pb-20">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Sponsorship Management</h2>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Sponsor Organization</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Beneficiaries</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Total Commitment</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Amount Paid</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Pending Balance</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {sponsors.map((sp) => (
                            <tr key={sp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">{sp.name}</td>
                                <td className="px-6 py-4 text-sm font-medium">{sp.students} Students</td>
                                <td className="px-6 py-4 font-mono font-medium">{sp.commitment}</td>
                                <td className="px-6 py-4 font-mono font-medium text-green-600">{sp.paid}</td>
                                <td className="px-6 py-4 font-mono font-bold text-red-500">{sp.balance}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-purple-600 font-bold text-xs uppercase hover:underline">Manage</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Sponsorships;
