import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const inputCls = "px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const FeeSchedule = () => {
    const [structures, setStructures] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [year, setYear]             = useState(new Date().getFullYear().toString());
    const [term, setTerm]             = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = { academic_year: year };
            if (term) params.term = term;
            const res = await window.axios.get('/api/finance/fee-structures', { params });
            setStructures(res.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const grandTotal = structures.reduce((a, s) => a + Number(s.total_amount), 0);

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Finance <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Fee Schedule</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Master Fee Schedule</h1>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-end flex-shrink-0">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Year</label>
                    <input value={year} onChange={e => setYear(e.target.value)} className={inputCls} style={{ width: 80 }}/>
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Term</label>
                    <select value={term} onChange={e => setTerm(e.target.value)} className={inputCls}>
                        <option value="">All</option>
                        <option value="1">Term 1</option>
                        <option value="2">Term 2</option>
                        <option value="3">Term 3</option>
                    </select>
                </div>
                <button onClick={fetchData}
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
                            <table className="w-full text-left" style={{ minWidth: 760 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Structure Name</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Grade</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-center">Term</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-right">Items</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-32 text-right bg-slate-700">Total Fee</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Active</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {structures.map((s, i) => (
                                        <tr key={s.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                            i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                        }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                            <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{s.name}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500">{s.grade_level || 'All'}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500 text-center">T{s.term}</td>
                                            <td className="px-3 py-2 text-right text-xs font-mono text-slate-500">{s.items_count ?? (s.items?.length ?? '—')}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold font-mono text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/80">
                                                KSh {Number(s.total_amount).toLocaleString()}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`inline-block w-2 h-2 rounded-full ${s.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}/>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                {structures.length > 0 && (
                                    <tfoot>
                                        <tr className="bg-slate-100 dark:bg-gray-700 border-t-2 border-slate-300 dark:border-gray-500">
                                            <td colSpan="5" className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                {structures.length} structure{structures.length !== 1 ? 's' : ''}
                                            </td>
                                            <td className="px-3 py-2 text-right text-[10px] font-bold font-mono text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-gray-600">
                                                KSh {grandTotal.toLocaleString()}
                                            </td>
                                            <td/>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                            {structures.length === 0 && (
                                <div className="py-12 text-center text-xs text-slate-400 italic">No fee structures found.</div>
                            )}
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{structures.length} structures · {year}{term ? ` · Term ${term}` : ''}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FeeSchedule;
