import React, { useState, useEffect } from 'react';

const SaaSInvoices = () => {
    const [filter, setFilter] = useState('All');
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.axios.get('/api/platform/invoices').then(res => {
            setInvoices(res.data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const filtered = filter === 'All' ? invoices : invoices.filter(i => i.status === filter);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">SaaS Invoices</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage billing and invoices for platform tenants.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg">
                        Generate Invoice
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4">
                {['All', 'Paid', 'Pending', 'Overdue'].map(f => (
                    <button 
                        key={f} 
                        onClick={() => setFilter(f)} 
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${filter === f ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Invoice List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 dark:bg-gray-900/50 dark:border-gray-700 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-3">Invoice / Plan</div>
                    <div className="col-span-3">School Name</div>
                    <div className="col-span-2 text-right">Amount</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {loading ? <div className="p-10 text-center text-gray-400 font-bold">Loading invoices...</div> : filtered.map(inv => (
                        <div key={inv.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="col-span-3">
                                <span className="font-mono text-sm font-bold text-gray-800 dark:text-gray-200">{inv.invoice_number}</span>
                                <div className="text-[10px] text-gray-400 uppercase font-black tracking-tighter mt-0.5">{inv.plan} Plan</div>
                            </div>
                            <div className="col-span-3">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{inv.school?.name || 'Unknown Tenant'}</span>
                                <div className="text-xs text-gray-500 dark:text-gray-500">Due: {new Date(inv.due_date).toLocaleDateString()}</div>
                            </div>
                            <div className="col-span-2 text-left md:text-right font-bold text-gray-800 dark:text-gray-200">
                                ${(parseFloat(inv.amount)).toFixed(2)}
                            </div>
                            <div className="col-span-2 flex md:justify-center">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    inv.status === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    inv.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                    {inv.status}
                                </span>
                            </div>
                            <div className="col-span-2 flex justify-end space-x-2">
                                <button className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors dark:hover:bg-purple-900/30 dark:hover:text-purple-400" title="Download PDF">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </button>
                                <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors dark:hover:bg-green-900/30 dark:hover:text-green-400" title="Mark as Paid">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                            No invoices found matching the current filter.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SaaSInvoices;
