import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const statusBadge = (s) =>
    s === 'invoiced' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
    s === 'paid'     ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                       'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';

const TransportBilling = () => {
    const [routes, setRoutes]     = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [generating, setGenerating] = useState(false);
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [term, setTerm] = useState('1');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [routesRes, studentsRes] = await Promise.all([
                window.axios.get('/api/transport/routes').catch(() => ({ data: [] })),
                window.axios.get('/api/transport/billing', { params: { academic_year: year, term } }).catch(() => ({ data: [] })),
            ]);
            setRoutes(routesRes.data.data || routesRes.data || []);
            setStudents(studentsRes.data.data || studentsRes.data || []);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleGenerateInvoices = async () => {
        if (!window.confirm(`Generate transport invoices for all assigned students — ${year} Term ${term}?`)) return;
        setGenerating(true);
        try {
            await window.axios.post('/api/transport/billing/generate', { academic_year: year, term });
            window.showToast?.('success', 'Transport invoices generated.');
            fetchData();
        } catch (err) {
            window.showToast?.('error', err.response?.data?.message || 'Could not generate invoices.');
        } finally { setGenerating(false); }
    };

    const totalStudents = routes.reduce((a, r) => a + (r.student_count ?? 0), 0);
    const totalRevenue  = routes.reduce((a, r) => a + Number(r.cost_per_term ?? 0) * (r.student_count ?? 0), 0);

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Finance <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Transport Billing</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Transport Billing</h1>
                </div>
                <div className="flex items-center gap-2">
                    <select value={year} onChange={e => setYear(e.target.value)}
                        className="px-3 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {[2026, 2025, 2024].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select value={term} onChange={e => setTerm(e.target.value)}
                        className="px-3 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="1">Term 1</option>
                        <option value="2">Term 2</option>
                        <option value="3">Term 3</option>
                    </select>
                    <button onClick={handleGenerateInvoices} disabled={generating || routes.length === 0}
                        className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">
                        {generating ? 'Generating…' : 'Generate Invoices'}
                    </button>
                </div>
            </div>

            {/* Stats strip */}
            {!loading && (
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                    {[
                        { label: 'Routes',       value: routes.length,                          cls: 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800' },
                        { label: 'Students',     value: totalStudents,                          cls: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' },
                        { label: 'Term Revenue', value: `KSh ${totalRevenue.toLocaleString()}`, cls: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' },
                    ].map(c => (
                        <div key={c.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${c.cls}`}>
                            <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{c.value}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{c.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {loading ? (
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm p-6">
                    <SkeletonLoader type="table"/>
                </div>
            ) : routes.length === 0 ? (
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center py-16">
                    <p className="text-slate-400 text-sm">No transport routes configured.</p>
                    <p className="text-[10px] text-slate-300 mt-1">Set up routes in Transport Management to enable billing.</p>
                </div>
            ) : (
                <>
                    {/* Route summary */}
                    <div className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
                        <div className="px-4 py-2.5 bg-slate-800 dark:bg-slate-900 rounded-t-lg">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Route Summary</span>
                        </div>
                        <div className="overflow-auto">
                            <table className="w-full text-left" style={{ minWidth: 500 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Route Name</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-right">Students</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28 text-right">Per Term</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {routes.map((r, i) => (
                                        <tr key={r.id} className={`border-b border-slate-100 dark:border-gray-700/60 ${
                                            i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                        }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                            <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{r.name}</td>
                                            <td className="px-3 py-2 text-right text-xs font-mono text-slate-600 dark:text-slate-300">{r.student_count ?? 0}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold font-mono text-slate-700 dark:text-slate-200">
                                                KSh {Number(r.cost_per_term ?? 0).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Students table */}
                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                        <div className="flex-shrink-0 px-4 py-2.5 bg-slate-800 dark:bg-slate-900 rounded-t-lg">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                                Assigned Students — {year} Term {term}
                            </span>
                        </div>
                        {students.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center py-10">
                                <p className="text-xs text-slate-400 italic">No students assigned to routes for this period.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 overflow-auto">
                                    <table className="w-full text-left" style={{ minWidth: 680 }}>
                                        <thead className="sticky top-0 z-10">
                                            <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Student</th>
                                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Route</th>
                                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Pick-up Point</th>
                                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Term Bill</th>
                                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.map((s, i) => (
                                                <tr key={s.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                                    i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                                }`}>
                                                    <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                                    <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{s.first_name} {s.last_name}</td>
                                                    <td className="px-3 py-2 text-xs text-slate-500">{s.route_name}</td>
                                                    <td className="px-3 py-2 text-xs text-slate-500">{s.pickup_point || '—'}</td>
                                                    <td className="px-3 py-2 text-right text-xs font-bold font-mono text-slate-700 dark:text-slate-200">
                                                        KSh {Number(s.term_bill ?? 0).toLocaleString()}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${statusBadge(s.billing_status)}`}>
                                                            {s.billing_status || 'pending'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{students.length} student{students.length !== 1 ? 's' : ''}</p>
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default TransportBilling;
