import React, { useState } from 'react';

const TransportBilling = () => {
    const routes = [
        { id: 'RT-01', name: 'Westlands Route', students: 45, costPerTerm: 'KSh 12,000' },
        { id: 'RT-02', name: 'Kilimani Route', students: 32, costPerTerm: 'KSh 10,000' },
        { id: 'RT-03', name: 'Thika Road Route', students: 50, costPerTerm: 'KSh 15,000' },
    ];

    const students = [
        { id: 'ST-001', name: 'Alice Walker', route: 'Westlands Route', pickup: 'Sarit Centre', termBill: 'KSh 12,000', status: 'Invoiced' },
        { id: 'ST-004', name: 'Diana Prince', route: 'Kilimani Route', pickup: 'Yaya Centre', termBill: 'KSh 10,000', status: 'Pending' },
    ];

    return (
        <div className="space-y-6 pb-20">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Transport Billing</h2>

            {/* Route Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {routes.map(route => (
                    <div key={route.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex justify-between">
                            <h3 className="font-bold text-gray-800 dark:text-gray-100">{route.name}</h3>
                            <span className="text-xs font-mono text-gray-400">{route.id}</span>
                        </div>
                        <div className="mt-2 text-2xl font-black text-purple-600">{route.costPerTerm}</div>
                        <p className="text-xs text-gray-500 mt-1">{route.students} Students Assigned</p>
                    </div>
                ))}
            </div>

            {/* Billing List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
                    <h3 className="font-bold text-gray-700 dark:text-gray-200">Assigned Students</h3>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Student</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Route</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Pick-up Point</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Term Bill</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {students.map((st) => (
                            <tr key={st.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">{st.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{st.route}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{st.pickup}</td>
                                <td className="px-6 py-4 font-mono text-gray-800 dark:text-gray-200 font-bold">{st.termBill}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${st.status === 'Invoiced' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>{st.status}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-purple-600 hover:text-purple-800 text-xs font-bold uppercase">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransportBilling;
