import React, { useEffect, useState } from 'react';
import StatsCard from '../StatsCard';

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

    if (loading) return <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500">Loading dashboard...</div>;

    const { stats, pending_requests } = data || {};

    const attendancePct = stats?.total_staff > 0 && stats?.marked_today > 0
        ? Math.round((stats.present_today / stats.marked_today) * 100)
        : null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Staff"
                    value={String(stats?.total_staff ?? '—')}
                    percentage="Active employees"
                    trend="neutral"
                    colorClass="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    progressColor="bg-gray-400"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                />
                <StatsCard
                    title="Present Today"
                    value={stats?.marked_today > 0 ? String(stats.present_today) : 'N/A'}
                    percentage={attendancePct !== null ? `${attendancePct}%` : 'Not marked yet'}
                    trend={attendancePct !== null && attendancePct >= 80 ? 'up' : 'down'}
                    colorClass="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    progressColor="bg-gray-400"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <StatsCard
                    title="Leave Requests"
                    value={String(stats?.pending_leave ?? 0)}
                    percentage="Pending"
                    trend={stats?.pending_leave > 0 ? 'up' : 'neutral'}
                    colorClass="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    progressColor="bg-gray-400"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                />
                <StatsCard
                    title={`Payroll (${stats?.payroll_month ?? '—'})`}
                    value={stats?.payroll_gross > 0 ? `KES ${Number(stats.payroll_gross).toLocaleString()}` : 'Not generated'}
                    percentage={stats?.payroll_net > 0 ? `Net: KES ${Number(stats.payroll_net).toLocaleString()}` : 'No records'}
                    trend="neutral"
                    colorClass="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    progressColor="bg-gray-400"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Column: Pending Leave & Probation */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Pending Leave Requests
                            </h3>
                            {pending_requests?.length > 0 && (
                                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-lg dark:bg-gray-700 dark:text-gray-300">{pending_requests.length} New</span>
                            )}
                        </div>
                        {!pending_requests?.length ? (
                            <p className="text-sm text-gray-400 italic dark:text-gray-500 py-4 text-center">No pending leave requests.</p>
                        ) : (
                            <div className="space-y-3">
                                {pending_requests.map(req => (
                                    <div key={req.id} className="flex flex-col xl:flex-row xl:items-center justify-between p-3 bg-gray-50 rounded-xl gap-3 border border-gray-100 dark:bg-gray-700/50 dark:border-gray-600/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm shrink-0 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">
                                                {req.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm dark:text-gray-100">{req.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-white border border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">{req.type}</span>
                                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{req.start_date} &rarr; {req.end_date}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button disabled={actionId === req.id} onClick={() => handleLeave(req.id, 'approve')} className="px-3 py-1.5 bg-gray-900 text-white text-[10px] uppercase font-black tracking-widest rounded-lg hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300">
                                                Approve
                                            </button>
                                            <button disabled={actionId === req.id} onClick={() => handleLeave(req.id, 'reject')} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-[10px] uppercase font-black tracking-widest rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                        <h3 className="text-base font-bold text-gray-800 mb-4 dark:text-gray-100 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Probation Ending Soon
                        </h3>
                        {(!data?.probation_alerts || data.probation_alerts.length === 0) ? (
                            <p className="text-sm text-gray-400 italic dark:text-gray-500 py-2">No upcoming probation ends.</p>
                        ) : (
                            <div className="space-y-2">
                                {data.probation_alerts.map(a => (
                                    <div key={a.user_id} className="flex justify-between items-center p-3 rounded-lg bg-blue-50/50 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30">
                                        <div>
                                            <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{a.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Ends: {a.probation_end}</p>
                                        </div>
                                        <span className="px-2.5 py-1 bg-white border border-blue-200 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm dark:bg-blue-900/50 dark:border-blue-800 dark:text-blue-300">
                                            In {a.days_left} Days
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Contracts & Documents */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                        <h3 className="text-base font-bold text-gray-800 mb-4 dark:text-gray-100 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            Contract Renewals
                        </h3>
                        {(!data?.contract_alerts || data.contract_alerts.length === 0) ? (
                            <p className="text-sm text-gray-400 italic dark:text-gray-500 py-2">No contracts expiring within 30 days.</p>
                        ) : (
                            <div className="space-y-2">
                                {data.contract_alerts.map(a => (
                                    <div key={a.user_id} className="flex justify-between items-center p-3 rounded-lg bg-amber-50/50 border border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30">
                                        <div>
                                            <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{a.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Expiring: {a.contract_end_date}</p>
                                        </div>
                                        <span className="px-2.5 py-1 bg-white border border-amber-200 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm dark:bg-amber-900/50 dark:border-amber-800 dark:text-amber-400">
                                            In {a.days_left} Days
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                Document Expiry Alerts
                            </h3>
                            {data?.document_alerts?.some(d => d.is_expired) && (
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            )}
                        </div>
                        {(!data?.document_alerts || data.document_alerts.length === 0) ? (
                            <p className="text-sm text-gray-400 italic dark:text-gray-500 py-2">All staff documents are currently compliant.</p>
                        ) : (
                            <div className="space-y-2">
                                {data.document_alerts.map(d => (
                                    <div key={d.document_id} className={`flex justify-between items-center p-3 rounded-lg border ${d.is_expired ? 'bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30' : 'bg-orange-50/50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/30'}`}>
                                        <div>
                                            <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{d.user_name}</p>
                                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{d.title}</p>
                                        </div>
                                        <div className="text-right">
                                            {d.is_expired ? (
                                                <span className="px-2.5 py-1 bg-white border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm dark:bg-red-900/50 dark:border-red-800 dark:text-red-400">
                                                    Expired
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 bg-white border border-orange-200 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm dark:bg-orange-900/50 dark:border-orange-800 dark:text-orange-400">
                                                    In {d.days_left} Days
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HrDashboard;
