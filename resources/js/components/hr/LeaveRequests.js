import React, { useState, useEffect } from 'react';

const TABS = [
    { id: 'Pending',  label: 'Pending' },
    { id: 'Approved', label: 'Approved' },
    { id: 'Rejected', label: 'Rejected' },
];

const statusBadge = (status) => {
    if (status === 'Approved') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (status === 'Rejected') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
};

const LeaveRequests = () => {
    const [activeTab, setActiveTab]         = useState('Pending');
    const [requests, setRequests]           = useState([]);
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    const fetchLeaves = () => {
        setLoading(true);
        setError('');
        window.axios.get('/api/hr/leave')
            .then(res => setRequests(res.data.leaves))
            .catch(() => setError('Failed to load leave requests.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchLeaves(); }, []);

    const handleAction = (id, action) => {
        setActionLoading(id + action);
        window.axios.post(`/api/hr/leave/${id}/${action}`)
            .then(() => fetchLeaves())
            .catch(() => setError(`Failed to ${action} leave request.`))
            .finally(() => setActionLoading(null));
    };

    const filteredRequests = requests.filter(r => r.status === activeTab);

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        HR <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Leave Requests</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">
                        Leave Requests
                        {!loading && <span className="ml-2 text-xs font-normal text-slate-400">— {filteredRequests.length} {activeTab.toLowerCase()}</span>}
                    </h1>
                </div>
            </div>

            {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md flex-shrink-0">{error}</p>}

            {/* Tabs */}
            <div className="flex flex-shrink-0 border-b border-slate-200 dark:border-gray-700 gap-0.5">
                {TABS.map(tab => {
                    const count = requests.filter(r => r.status === tab.id).length;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-all duration-150 flex items-center gap-2 ${
                                activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}>
                            {tab.label}
                            <span className={`text-[10px] rounded px-1 py-0.5 font-bold ${
                                activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400 dark:bg-gray-700'
                            }`}>{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Loading leave requests…</div>
                ) : filteredRequests.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-slate-400 text-sm">No {activeTab.toLowerCase()} leave requests.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-left border-collapse" style={{ minWidth: 680 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Staff Member</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Type</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">From</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">To</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-center">Days</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Reason</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28 text-right">
                                            {activeTab === 'Pending' ? 'Action' : 'Status'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests.map((req, i) => (
                                        <tr key={req.id}
                                            className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                                i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                            }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">
                                                {String(i + 1).padStart(2, '0')}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{req.name}</span>
                                                <span className="ml-2 text-[10px] text-slate-400">{req.role}</span>
                                                {req.approved_by && activeTab !== 'Pending' && (
                                                    <p className="text-[10px] text-slate-400 mt-0.5">{activeTab} by {req.approved_by}</p>
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-gray-300">
                                                    {req.type}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-xs font-mono text-slate-500 dark:text-slate-400">{req.start_date}</td>
                                            <td className="px-3 py-2 text-xs font-mono text-slate-500 dark:text-slate-400">{req.end_date}</td>
                                            <td className="px-3 py-2 text-center text-xs font-bold text-slate-600 dark:text-slate-300">{req.days || '—'}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 italic max-w-xs truncate">
                                                {req.reason || '—'}
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                {activeTab === 'Pending' ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => handleAction(req.id, 'approve')}
                                                            disabled={actionLoading === req.id + 'approve'}
                                                            className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-800 disabled:opacity-50 transition-colors">
                                                            {actionLoading === req.id + 'approve' ? '…' : 'Approve'}
                                                        </button>
                                                        <button onClick={() => handleAction(req.id, 'reject')}
                                                            disabled={actionLoading === req.id + 'reject'}
                                                            className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors">
                                                            {actionLoading === req.id + 'reject' ? '…' : 'Reject'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${statusBadge(req.status)}`}>
                                                        {req.status}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                                {filteredRequests.length} {activeTab.toLowerCase()} request{filteredRequests.length !== 1 ? 's' : ''}
                                {' · '}{requests.length} total
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LeaveRequests;
