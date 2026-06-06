import React, { useEffect, useState } from 'react';

const HrDashboard = () => {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);

    const fetchData = () => {
        window.axios.get('/api/hr/dashboard')
            .then(res => { setData(res.data); })
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const handleLeave = (id, action) => {
        setActionId(id);
        window.axios.post(`/api/hr/leave/${id}/${action}`)
            .then(() => fetchData())
            .catch(() => window.showToast?.('error', `Failed to ${action} request.`))
            .finally(() => setActionId(null));
    };

    const stats = data?.stats ?? {};
    const pendingRequests = data?.pending_requests ?? [];
    const probationAlerts = data?.probation_alerts ?? [];
    const contractAlerts  = data?.contract_alerts ?? [];
    const documentAlerts  = data?.document_alerts ?? [];

    const attendancePct = stats.total_staff > 0 && stats.marked_today > 0
        ? Math.round((stats.present_today / stats.marked_today) * 100)
        : null;

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">HR Dashboard</nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">
                        Dashboard
                        <span className="ml-2 text-xs font-normal text-slate-400">Human Resources</span>
                    </h1>
                </div>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-2 flex-shrink-0">
                {[
                    { label: 'Total Staff',      value: loading ? '…' : (stats.total_staff ?? '—'),   cls: 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800' },
                    { label: 'Present Today',    value: loading ? '…' : (stats.marked_today > 0 ? stats.present_today : 'N/M'), cls: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' },
                    { label: 'Attendance',       value: loading ? '…' : (attendancePct !== null ? `${attendancePct}%` : 'N/M'), cls: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' },
                    { label: 'Leave Requests',   value: loading ? '…' : (stats.pending_leave ?? 0),  cls: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20' },
                    { label: `Payroll ${stats.payroll_month ?? ''}`, value: loading ? '…' : (stats.payroll_gross > 0 ? `KES ${Number(stats.payroll_gross).toLocaleString()}` : '—'), cls: 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800' },
                ].map(c => (
                    <div key={c.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${c.cls}`}>
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{c.value}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{c.label}</span>
                    </div>
                ))}
            </div>

            {/* Main grid */}
            <div className="flex gap-3 flex-1 min-h-0">

                {/* Left column */}
                <div className="flex-1 min-w-0 flex flex-col gap-3 min-h-0">

                    {/* Pending Leave Requests */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col min-h-0 flex-1">
                        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 bg-slate-800 dark:bg-slate-900 rounded-t-lg">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Pending Leave Requests</span>
                            {pendingRequests.length > 0 && (
                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500 text-white">
                                    {pendingRequests.length} pending
                                </span>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="py-8 text-center text-xs text-slate-400">Loading…</div>
                            ) : pendingRequests.length === 0 ? (
                                <div className="py-8 text-center text-xs text-slate-400 italic">No pending leave requests.</div>
                            ) : pendingRequests.map((req, i) => (
                                <div key={req.id} className={`px-4 py-2.5 border-b border-slate-100 dark:border-gray-700/60 flex items-center justify-between gap-3 ${
                                    i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                }`}>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{req.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300">
                                                {req.type}
                                            </span>
                                            <span className="text-[10px] font-mono text-slate-400">{req.start_date} → {req.end_date}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button disabled={actionId === req.id} onClick={() => handleLeave(req.id, 'approve')}
                                            className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-800 disabled:opacity-50 transition-colors">
                                            Approve
                                        </button>
                                        <button disabled={actionId === req.id} onClick={() => handleLeave(req.id, 'reject')}
                                            className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors">
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Probation Ending Soon */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex-shrink-0">
                        <div className="px-4 py-2.5 bg-slate-800 dark:bg-slate-900 rounded-t-lg">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Probation Ending Soon</span>
                        </div>
                        {probationAlerts.length === 0 ? (
                            <div className="px-4 py-3 text-xs text-slate-400 italic">No upcoming probation ends.</div>
                        ) : probationAlerts.map((a, i) => (
                            <div key={a.user_id} className={`px-4 py-2.5 border-b border-slate-100 dark:border-gray-700/60 flex items-center justify-between ${
                                i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                            }`}>
                                <div>
                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{a.name}</p>
                                    <p className="text-[10px] font-mono text-slate-400">Ends: {a.probation_end}</p>
                                </div>
                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                    {a.days_left}d left
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right column */}
                <div className="flex-1 min-w-0 flex flex-col gap-3 min-h-0">

                    {/* Contract Renewals */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex-shrink-0">
                        <div className="px-4 py-2.5 bg-slate-800 dark:bg-slate-900 rounded-t-lg">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Contract Renewals</span>
                        </div>
                        {contractAlerts.length === 0 ? (
                            <div className="px-4 py-3 text-xs text-slate-400 italic">No contracts expiring within 30 days.</div>
                        ) : contractAlerts.map((a, i) => (
                            <div key={a.user_id} className={`px-4 py-2.5 border-b border-slate-100 dark:border-gray-700/60 flex items-center justify-between ${
                                i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                            }`}>
                                <div>
                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{a.name}</p>
                                    <p className="text-[10px] font-mono text-slate-400">Expiring: {a.contract_end_date}</p>
                                </div>
                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                                    {a.days_left}d left
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Document Expiry Alerts */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex-1 flex flex-col min-h-0">
                        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 bg-slate-800 dark:bg-slate-900 rounded-t-lg">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Document Expiry Alerts</span>
                            {documentAlerts.some(d => d.is_expired) && (
                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-red-500 text-white">
                                    Expired
                                </span>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {documentAlerts.length === 0 ? (
                                <div className="px-4 py-3 text-xs text-slate-400 italic">All staff documents are currently compliant.</div>
                            ) : documentAlerts.map((d, i) => (
                                <div key={d.document_id} className={`px-4 py-2.5 border-b border-slate-100 dark:border-gray-700/60 flex items-center justify-between ${
                                    i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                }`}>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{d.user_name}</p>
                                        <p className="text-[10px] text-slate-400">{d.title}</p>
                                    </div>
                                    {d.is_expired ? (
                                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                            Expired
                                        </span>
                                    ) : (
                                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                                            {d.days_left}d left
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HrDashboard;
