import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const inputCls = "px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const METHOD_LABELS = {
    cash: 'Cash', mpesa: 'M-Pesa', bank_transfer: 'Bank Transfer',
    cheque: 'Cheque', standing_order: 'Standing Order', card: 'Card',
};

const statusBadge = (s) =>
    s === 'confirmed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
    s === 'reversed'  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                        'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';

const FeeList = () => {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [search, setSearch]     = useState('');
    const [page, setPage]         = useState(1);
    const [meta, setMeta]         = useState(null);

    const fetchData = async (p = 1) => {
        setLoading(true);
        try {
            const params = { per_page: 25, page: p };
            if (search) params.search = search;
            const res = await window.axios.get('/api/finance/receipts', { params });
            setReceipts(res.data.data || []);
            setMeta(res.data.meta || null);
            setPage(p);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(1); }, []);

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Finance <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Fee Collections</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Fee Collections</h1>
                </div>
                <button onClick={() => fetchData(1)}
                    className="px-4 py-1.5 border border-slate-300 dark:border-gray-600 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                    Refresh
                </button>
            </div>

            {/* Search */}
            <div className="flex flex-wrap gap-2 items-end flex-shrink-0">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Search</label>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && fetchData(1)}
                        placeholder="Student name or receipt no…" className={inputCls} style={{ width: 240 }}/>
                </div>
                <button onClick={() => fetchData(1)}
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
                            <table className="w-full text-left" style={{ minWidth: 700 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Receipt No</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Student</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Method</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Date</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Amount</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {receipts.map((r, i) => (
                                        <tr key={r.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                            i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                        }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{r.receipt_number}</td>
                                            <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{r.first_name} {r.last_name}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500">{METHOD_LABELS[r.payment_method] || r.payment_method}</td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{r.payment_date}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold font-mono text-emerald-600">
                                                KSh {Number(r.amount).toLocaleString()}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${statusBadge(r.status)}`}>
                                                    {r.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {receipts.length === 0 && (
                                <div className="py-12 text-center text-xs text-slate-400 italic">No fee collections found.</div>
                            )}
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30 flex items-center justify-between">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{meta?.total ?? receipts.length} collections</p>
                            {meta && meta.last_page > 1 && (
                                <div className="flex gap-2">
                                    <button disabled={page <= 1} onClick={() => fetchData(page - 1)}
                                        className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-primary disabled:opacity-40 transition-colors">Prev</button>
                                    <span className="text-[10px] text-slate-400 py-1">{page} / {meta.last_page}</span>
                                    <button disabled={page >= meta.last_page} onClick={() => fetchData(page + 1)}
                                        className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-primary disabled:opacity-40 transition-colors">Next</button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FeeList;
