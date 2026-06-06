import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const inputCls = "px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const bucketBadge = (bucket) => {
    if (bucket === '90+')  return 'bg-red-600 text-white';
    if (bucket === '61-90') return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300';
    if (bucket === '31-60') return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300';
    return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300';
};

const DefaultersList = () => {
    const [defaulters, setDefaulters] = useState([]);
    const [summary, setSummary]       = useState(null);
    const [loading, setLoading]       = useState(true);
    const [minBalance, setMinBalance] = useState('');
    const [grade, setGrade]           = useState('');
    const [term, setTerm]             = useState('');
    const [year, setYear]             = useState(new Date().getFullYear().toString());

    const fetchDefaulters = async () => {
        setLoading(true);
        try {
            const params = {};
            if (minBalance) params.min_balance = minBalance;
            if (grade)      params.grade = grade;
            if (term)       params.term = term;
            if (year)       params.academic_year = year;

            const res = await window.axios.get('/api/finance/defaulters', { params });
            setDefaulters(res.data.defaulters);
            setSummary(res.data.summary);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchDefaulters(); }, []);

    const total = summary?.total_outstanding || 0;

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Finance <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Defaulters List</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Defaulters List</h1>
                </div>
                <button onClick={() => window.showToast?.('info', 'Bulk SMS feature coming soon.')}
                    className="px-4 py-1.5 bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-blue-700 transition-colors">
                    Bulk SMS
                </button>
            </div>

            {/* Stats strip */}
            {!loading && summary && (
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">KSh {Number(total).toLocaleString()}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Outstanding</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{summary.total_defaulters}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Defaulters</span>
                    </div>
                    {Object.entries(summary.by_bucket || {}).map(([bucket, count]) => (
                        <div key={bucket} className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                            <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{count}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{bucket} days</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Filter bar */}
            <div className="flex flex-wrap gap-2 items-end flex-shrink-0">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Min Balance</label>
                    <select value={minBalance} onChange={e => setMinBalance(e.target.value)} className={inputCls}>
                        <option value="">Any</option>
                        <option value="5000">KSh 5,000+</option>
                        <option value="10000">KSh 10,000+</option>
                        <option value="20000">KSh 20,000+</option>
                        <option value="50000">KSh 50,000+</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Year</label>
                    <input value={year} onChange={e => setYear(e.target.value)} placeholder="2026" className={inputCls} style={{ width: 80 }}/>
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Term</label>
                    <select value={term} onChange={e => setTerm(e.target.value)} className={inputCls}>
                        <option value="">All Terms</option>
                        <option value="1">Term 1</option>
                        <option value="2">Term 2</option>
                        <option value="3">Term 3</option>
                    </select>
                </div>
                <button onClick={fetchDefaulters}
                    className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                    Filter
                </button>
            </div>

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {loading ? (
                    <div className="p-6"><SkeletonLoader type="table"/></div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left" style={{ minWidth: 900 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Adm No</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Student</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20">Grade</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Parent</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Phone</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28 text-right">Balance</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Due Date</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Age</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-right">SMS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {defaulters.map((s, i) => (
                                        <tr key={s.invoice_id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                            i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                        }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{s.admission_number}</td>
                                            <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{s.first_name} {s.last_name}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{s.grade_level}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{s.parent_name}</td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{s.parent_phone}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold text-red-500">KSh {Number(s.balance).toLocaleString()}</td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{s.due_date || '—'}</td>
                                            <td className="px-3 py-2 text-center">
                                                {s.age_bucket !== 'current' ? (
                                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${bucketBadge(s.age_bucket)}`}>
                                                        {s.days_overdue}d
                                                    </span>
                                                ) : <span className="text-[10px] text-slate-300">—</span>}
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <button className="text-[10px] font-bold uppercase tracking-wider text-blue-500 hover:text-blue-700 transition-colors">SMS</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {defaulters.length === 0 && (
                                <div className="py-12 text-center text-xs text-slate-400 italic">No defaulters match your filter.</div>
                            )}
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{defaulters.length} defaulter{defaulters.length !== 1 ? 's' : ''}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DefaultersList;
