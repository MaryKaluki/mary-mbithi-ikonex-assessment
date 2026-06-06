import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const inputCls = "px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const statusBadge = (s) =>
    s === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
    s === 'active'    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
    s === 'overdue'   ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                        'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';

const FeeInstallments = () => {
    const [plans, setPlans]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch]   = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            const res = await window.axios.get('/api/finance/installment-plans', { params });
            setPlans(res.data.data || res.data || []);
        } catch { setPlans([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const active    = plans.filter(p => p.status === 'active').length;
    const overdue   = plans.filter(p => p.status === 'overdue').length;
    const completed = plans.filter(p => p.status === 'completed').length;

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Finance <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Fee Installments</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Fee Installment Plans</h1>
                </div>
            </div>

            {/* Stats strip */}
            {!loading && plans.length > 0 && (
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                    {[
                        { label: 'Total Plans', value: plans.length,  cls: 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800' },
                        { label: 'Active',      value: active,         cls: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' },
                        { label: 'Overdue',     value: overdue,        cls: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' },
                        { label: 'Completed',   value: completed,      cls: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' },
                    ].map(c => (
                        <div key={c.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${c.cls}`}>
                            <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{c.value}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{c.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Search */}
            {plans.length > 0 && (
                <div className="flex gap-2 items-end flex-shrink-0">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Search</label>
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && fetchData()}
                            placeholder="Student or plan ID…" className={inputCls} style={{ width: 240 }}/>
                    </div>
                    <button onClick={fetchData}
                        className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                        Search
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {loading ? (
                    <div className="p-6"><SkeletonLoader type="table"/></div>
                ) : plans.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16">
                        <p className="text-slate-400 text-sm">No installment plans on record.</p>
                        <p className="text-[10px] text-slate-300 mt-1">Installment plans will appear here once the feature is configured.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left" style={{ minWidth: 780 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Plan ID</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Student</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Plan Type</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Total</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Paid</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Next Due</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plans.map((p, i) => (
                                        <tr key={p.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                            i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                        }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{p.plan_number || p.id}</td>
                                            <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{p.first_name} {p.last_name}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500">{p.plan_type}</td>
                                            <td className="px-3 py-2 text-right text-xs font-mono text-slate-600 dark:text-slate-300">KSh {Number(p.total_amount).toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold font-mono text-emerald-600">KSh {Number(p.amount_paid).toLocaleString()}</td>
                                            <td className="px-3 py-2">
                                                {p.next_due_date ? (
                                                    <>
                                                        <p className="text-[10px] font-mono text-slate-400">{p.next_due_date}</p>
                                                        {p.next_installment_amount > 0 && (
                                                            <p className="text-[9px] text-red-400 font-bold">KSh {Number(p.next_installment_amount).toLocaleString()}</p>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-[10px] text-slate-300">—</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${statusBadge(p.status)}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{plans.length} plan{plans.length !== 1 ? 's' : ''}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FeeInstallments;
