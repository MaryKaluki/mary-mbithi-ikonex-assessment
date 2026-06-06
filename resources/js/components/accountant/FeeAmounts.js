import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const APPLICABLE_LABELS = { all: 'All', boarding: 'Boarding', day: 'Day' };

const FeeAmounts = () => {
    const [structures, setStructures] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [expanded, setExpanded]     = useState({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await window.axios.get('/api/finance/fee-structures');
            setStructures(res.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Finance <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Fee Amounts</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Fee Amounts by Structure</h1>
                </div>
                <button onClick={fetchData}
                    className="px-4 py-1.5 border border-slate-300 dark:border-gray-600 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                    Refresh
                </button>
            </div>

            {/* Stats */}
            {!loading && (
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{structures.length}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fee Structures</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                            {structures.reduce((a, s) => a + (s.items?.length ?? 0), 0)}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fee Items</span>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {loading ? (
                    <div className="p-6"><SkeletonLoader type="table"/></div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left" style={{ minWidth: 700 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8"></th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Structure / Fee Item</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Grade</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20">Applies To</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Optional</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28 text-right bg-slate-700">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {structures.map((s, si) => (
                                        <React.Fragment key={s.id}>
                                            {/* Structure header row */}
                                            <tr
                                                className={`border-b border-slate-100 dark:border-gray-700/60 cursor-pointer select-none ${
                                                    si % 2 === 0 ? 'bg-slate-50 dark:bg-gray-900/20' : 'bg-slate-100/70 dark:bg-gray-900/40'
                                                }`}
                                                onClick={() => toggle(s.id)}
                                            >
                                                <td className="px-3 py-2 text-[11px] font-mono text-slate-400">
                                                    <span className="select-none">{expanded[s.id] ? '▾' : '▸'}</span>
                                                </td>
                                                <td className="px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">{s.name}</td>
                                                <td className="px-3 py-2 text-xs text-slate-500">{s.grade_level || 'All'}</td>
                                                <td className="px-3 py-2 text-xs text-slate-500">—</td>
                                                <td className="px-3 py-2 text-center text-xs text-slate-400">—</td>
                                                <td className="px-3 py-2 text-right text-xs font-bold font-mono text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800/60">
                                                    KSh {Number(s.total_amount).toLocaleString()}
                                                </td>
                                            </tr>
                                            {/* Expanded items */}
                                            {expanded[s.id] && (s.items || []).map((item, ii) => (
                                                <tr key={item.id} className={`border-b border-slate-50 dark:border-gray-700/40 ${
                                                    ii % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/50 dark:bg-gray-900/20'
                                                }`}>
                                                    <td className="px-3 py-1.5"></td>
                                                    <td className="px-3 py-1.5 pl-6 text-xs text-slate-700 dark:text-slate-300">{item.name}</td>
                                                    <td className="px-3 py-1.5 text-xs text-slate-400">—</td>
                                                    <td className="px-3 py-1.5 text-[10px] text-slate-400 capitalize">
                                                        {APPLICABLE_LABELS[item.applicable_to] || item.applicable_to}
                                                    </td>
                                                    <td className="px-3 py-1.5 text-center">
                                                        {item.is_optional ? (
                                                            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">Opt</span>
                                                        ) : (
                                                            <span className="text-[10px] text-slate-300">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 text-right text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-gray-800/50">
                                                        KSh {Number(item.amount).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                            {structures.length === 0 && (
                                <div className="py-12 text-center text-xs text-slate-400 italic">No fee structures configured.</div>
                            )}
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{structures.length} structure{structures.length !== 1 ? 's' : ''} · click row to expand</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FeeAmounts;
