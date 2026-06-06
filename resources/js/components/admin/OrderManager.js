import React, { useState } from 'react';

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const ORDERS = [
    { id: 'ORD-2024-101', title: 'Grade 5 Math Textbooks',    supplier: 'Text Book Centre Ltd', cost: 62500,  status: 'Dispatched',       type: 'books'   },
    { id: 'ORD-2024-102', title: 'New Fiction Collection',     supplier: 'Kenya Book Publishers', cost: 38000,  status: 'Pending Approval', type: 'library' },
    { id: 'ORD-2024-103', title: 'Grade 7 Science Textbooks',  supplier: 'EAEP Ltd',              cost: 94000,  status: 'Dispatched',       type: 'books'   },
    { id: 'ORD-2024-104', title: 'Reference Encyclopaedias',   supplier: 'Longhorn Publishers',   cost: 22500,  status: 'Pending Approval', type: 'library' },
    { id: 'ORD-2024-105', title: 'CBC Workbooks — Grade 1-3',  supplier: 'Text Book Centre Ltd', cost: 47800,  status: 'Received',         type: 'books'   },
    { id: 'ORD-2024-106', title: 'Periodical Subscriptions',   supplier: 'Nation Media Group',    cost: 18000,  status: 'Received',         type: 'library' },
];

const statusBadge = (s) => {
    if (s === 'Dispatched')       return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    if (s === 'Received')         return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
    if (s === 'Pending Approval') return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
    return 'bg-slate-100 text-slate-500';
};

const OrderManager = () => {
    const [activeTab, setActiveTab]   = useState('books');
    const [showModal, setShowModal]   = useState(false);

    const filtered = ORDERS.filter(o => o.type === activeTab);
    const totalCost = filtered.reduce((a, b) => a + b.cost, 0);

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Admin <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Procurement</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Procurement &amp; Orders</h1>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                    + Create Order
                </button>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-2 flex-shrink-0">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                    <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{filtered.length}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Orders</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                    <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">KSh {totalCost.toLocaleString()}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Value</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                    <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{filtered.filter(o => o.status === 'Pending Approval').length}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-gray-700 flex-shrink-0">
                {[['books', 'Textbook Orders'], ['library', 'Library Acquisitions']].map(([val, label]) => (
                    <button key={val} onClick={() => setActiveTab(val)}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                            activeTab === val
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left" style={{ minWidth: 640 }}>
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-32">Order ID</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Title</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Supplier</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28 text-right">Cost</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-32 text-center">Status</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-right">View</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((o, i) => (
                                <tr key={o.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                    i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                }`}>
                                    <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                    <td className="px-3 py-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">{o.id}</td>
                                    <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{o.title}</td>
                                    <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{o.supplier}</td>
                                    <td className="px-3 py-2 text-right text-xs font-bold font-mono text-slate-700 dark:text-slate-200">KSh {o.cost.toLocaleString()}</td>
                                    <td className="px-3 py-2 text-center">
                                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${statusBadge(o.status)}`}>{o.status}</span>
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <button className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{filtered.length} orders</p>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-slate-200 dark:border-gray-700 w-full max-w-sm">
                        <div className="px-5 py-3.5 bg-slate-50 dark:bg-gray-900/50 border-b border-slate-100 dark:border-gray-700 rounded-t-lg">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">Create New Order</span>
                        </div>
                        <div className="p-5 flex flex-col gap-3">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Order Title</label>
                                <input type="text" placeholder="e.g. Grade 5 Math Textbooks" className={inputCls}/>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Type</label>
                                <select className={inputCls}>
                                    <option>Textbook Order</option>
                                    <option>Library Acquisition</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Supplier</label>
                                <input type="text" placeholder="Supplier name" className={inputCls}/>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Estimated Cost (KSh)</label>
                                <input type="number" placeholder="0" className={inputCls}/>
                            </div>
                            <div className="flex gap-2 mt-1">
                                <button className="flex-1 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">Submit</button>
                                <button onClick={() => setShowModal(false)}
                                    className="flex-1 py-2 border border-slate-300 dark:border-gray-600 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManager;
