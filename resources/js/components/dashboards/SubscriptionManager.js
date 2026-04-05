import React, { useState } from 'react';

const SubscriptionManager = () => {
    // Mock Plans Data
    const plans = [
        { id: 1, name: 'Basic', price: 99, period: '/mo', features: ['Up to 100 Students', 'Core Modules', 'Email Support'], recommended: false, color: 'blue' },
        { id: 2, name: 'Standard', price: 249, period: '/mo', features: ['Up to 500 Students', 'Advanced Finance', 'Parent Portal', 'Priority Support'], recommended: true, color: 'purple' },
        { id: 3, name: 'Enterprise', price: 499, period: '/mo', features: ['Unlimited Students', 'All Modules', 'Dedicated Account Manager', 'API Access', 'Custom Branding'], recommended: false, color: 'slate' }
    ];

    // Mock Invoices
    const invoices = [
        { id: 'INV-2024-001', school: 'Msingi Thabiti Learning Centre', date: '2024-02-01', amount: 499, status: 'Paid', plan: 'Enterprise' },
        { id: 'INV-2024-002', school: 'Hilltop Academy', date: '2024-02-01', amount: 249, status: 'Paid', plan: 'Standard' },
        { id: 'INV-2024-003', school: 'Riverside High', date: '2024-01-28', amount: 499, status: 'Overdue', plan: 'Enterprise' },
        { id: 'INV-2024-004', school: 'Sunshine Kindergarten', date: '2024-02-05', amount: 99, status: 'Pending', plan: 'Basic' },
    ];

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Subscription Management</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage billing plans and view global revenue</p>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div key={plan.id} className={`relative bg-white rounded-2xl shadow-sm border overflow-hidden transition-transform hover:-translate-y-1 dark:bg-gray-800 ${plan.recommended ? 'border-purple-500 ring-2 ring-purple-500 ring-opacity-50' : 'border-gray-200 dark:border-gray-700'}`}>
                        {plan.recommended && (
                            <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                                MOST POPULAR
                            </div>
                        )}
                        <div className="p-6">
                            <h3 className={`text-xl font-bold text-${plan.color}-600 dark:text-${plan.color}-400 mb-2`}>{plan.name}</h3>
                            <div className="flex items-baseline mb-4">
                                <span className="text-4xl font-extrabold text-gray-800 dark:text-white">${plan.price}</span>
                                <span className="text-gray-500 dark:text-gray-400">{plan.period}</span>
                            </div>
                            <ul className="space-y-3 mb-6">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button className={`w-full py-2 rounded-lg font-bold transition-colors ${plan.recommended ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'}`}>
                                Edit Plan
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Revenue Overview & Invoices */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart Placeholder */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Revenue Overview</h3>
                    <div className="h-48 flex items-end gap-2 justify-between px-2">
                        {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                            <div key={i} className="w-full bg-purple-100 dark:bg-purple-900/30 rounded-t-lg relative group">
                                <div style={{ height: `${h}%` }} className="absolute bottom-0 w-full bg-purple-500 rounded-t-lg transition-all group-hover:bg-purple-600"></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-gray-500">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                    <div className="mt-6 flex justify-between items-center">
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Total MRR</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">$12,450</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase">Growth</p>
                            <p className="text-lg font-bold text-green-500">+18%</p>
                        </div>
                    </div>
                </div>

                {/* Recent Invoices */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100">Global Invoices</h3>
                        <button className="text-sm text-purple-600 font-bold hover:underline">View All</button>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Invoice ID</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">School</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{inv.id}</td>
                                    <td className="px-6 py-3">
                                        <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{inv.school}</div>
                                        <div className="text-xs text-gray-500">{inv.plan} Plan</div>
                                    </td>
                                    <td className="px-6 py-3 font-bold text-gray-700 dark:text-gray-300">${inv.amount}</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${inv.status === 'Paid' ? 'bg-green-100 text-green-600' :
                                                inv.status === 'Overdue' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionManager;
