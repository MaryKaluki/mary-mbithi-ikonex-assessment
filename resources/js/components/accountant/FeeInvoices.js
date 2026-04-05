import React, { useState } from 'react';

const FeeInvoices = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Mock Data
    const invoices = [
        { id: 'INV-2024-001', student: 'Alice Walker', admission: 'ST-001', term: 'Term 1 2024', amount: 'KSh 45,000', paid: 'KSh 45,000', balance: 'KSh 0', status: 'Paid', date: '2024-01-05' },
        { id: 'INV-2024-002', student: 'Bob Smith', admission: 'ST-002', term: 'Term 1 2024', amount: 'KSh 45,000', paid: 'KSh 20,000', balance: 'KSh 25,000', status: 'Partial', date: '2024-01-06' },
        { id: 'INV-2024-003', student: 'Charlie Brown', admission: 'ST-003', term: 'Term 1 2024', amount: 'KSh 45,000', paid: 'KSh 0', balance: 'KSh 45,000', status: 'Unpaid', date: '2024-01-07' },
        { id: 'INV-2024-004', student: 'Diana Prince', admission: 'ST-004', term: 'Term 1 2024', amount: 'KSh 45,000', paid: 'KSh 45,000', balance: 'KSh 0', status: 'Paid', date: '2024-01-05' },
        { id: 'INV-2024-005', student: 'Evan Wright', admission: 'ST-005', term: 'Term 1 2024', amount: 'KSh 45,000', paid: 'KSh 10,000', balance: 'KSh 35,000', status: 'Partial', date: '2024-01-08' },
    ];

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.admission.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
            case 'Partial': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
            case 'Unpaid': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Fee Invoices</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage student invoices and track payments.</p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
                        Export Report
                    </button>
                    <button className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg hover:-translate-y-0.5 transform">
                        + Generate Invoice
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Search Student Name, Admission or Invoice #..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <select
                        className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Paid">Paid</option>
                        <option value="Partial">Partial</option>
                        <option value="Unpaid">Unpaid</option>
                    </select>
                    <input type="date" className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto hover:shadow-lg transition-all duration-300 dark:bg-gray-800 dark:border-gray-700">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                            <th className="px-6 py-4">Invoice #</th>
                            <th className="px-6 py-4">Student Details</th>
                            <th className="px-6 py-4">Term</th>
                            <th className="px-6 py-4">Total Amount</th>
                            <th className="px-6 py-4">Paid</th>
                            <th className="px-6 py-4">Balance</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {filteredInvoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">{inv.id}</td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-800 dark:text-gray-200">{inv.student}</div>
                                    <div className="text-xs text-gray-500">{inv.admission}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{inv.term}</td>
                                <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">{inv.amount}</td>
                                <td className="px-6 py-4 text-green-600 font-medium">{inv.paid}</td>
                                <td className="px-6 py-4 text-red-500 font-bold">{inv.balance}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(inv.status)}`}>
                                        {inv.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button className="text-gray-400 hover:text-purple-600 transition-colors" title="View Details">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    </button>
                                    <button className="text-gray-400 hover:text-blue-600 transition-colors" title="Print Invoice">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FeeInvoices;
