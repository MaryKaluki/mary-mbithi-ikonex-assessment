import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const inputCls = "px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const METHOD_LABELS = {
    mpesa: 'M-Pesa', bank_transfer: 'Bank Transfer', cash: 'Cash',
    cheque: 'Cheque', standing_order: 'Standing Order', card: 'Card',
};

const ReceiptsRegister = () => {
    const [receipts, setReceipts]   = useState([]);
    const [meta, setMeta]           = useState({ total: 0, current_page: 1, last_page: 1 });
    const [loading, setLoading]     = useState(true);
    const [from, setFrom]           = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [to, setTo]               = useState(new Date().toISOString().split('T')[0]);
    const [method, setMethod]       = useState('');
    const [search, setSearch]       = useState('');

    const fetchReceipts = async (page = 1) => {
        setLoading(true);
        try {
            const params = { from, to, page, per_page: 50 };
            if (method) params.method = method;
            if (search) params.search = search;
            const res = await window.axios.get('/api/finance/receipts', { params });
            setReceipts(res.data.data);
            setMeta({ total: res.data.total, current_page: res.data.current_page, last_page: res.data.last_page });
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchReceipts(); }, []);

    const totalAmount = receipts.reduce((a, r) => a + Number(r.amount), 0);

    const exportCsv = () => {
        const rows = [['Receipt No','Date','Student','Adm No','Amount','Method','Reference']];
        receipts.forEach(r => rows.push([
            r.receipt_number, r.payment_date,
            `${r.first_name} ${r.last_name}`, r.admission_number,
            r.amount, METHOD_LABELS[r.payment_method] || r.payment_method,
            r.mpesa_code || r.bank_ref || '—',
        ]));
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `receipts-${from}-to-${to}.csv`;
        a.click();
    };

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Finance <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Receipts Register</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Receipts Register</h1>
                </div>
                <button onClick={exportCsv}
                    className="px-4 py-1.5 border border-slate-300 dark:border-gray-600 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                    Export CSV
                </button>
            </div>

            {/* Stats strip */}
            {!loading && (
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20">
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">KSh {totalAmount.toLocaleString()}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Collections</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{meta.total}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Receipts</span>
                    </div>
                </div>
            )}

            {/* Filter bar */}
            <div className="flex flex-wrap gap-2 items-end flex-shrink-0">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">From</label>
                    <input type="date" value={from} onChange={e => setFrom(e.target.value)} className={inputCls}/>
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">To</label>
                    <input type="date" value={to} onChange={e => setTo(e.target.value)} className={inputCls}/>
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Method</label>
                    <select value={method} onChange={e => setMethod(e.target.value)} className={inputCls}>
                        <option value="">All Methods</option>
                        {Object.entries(METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-36">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Search</label>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Receipt no, student…" className={inputCls + ' w-full'}/>
                </div>
                <button onClick={() => fetchReceipts(1)}
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
                            <table className="w-full text-left" style={{ minWidth: 960 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-32">Receipt No</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Date</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Student</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20">Adm No</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20">Grade</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Amount</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Method</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Reference</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-right">Print</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {receipts.map((r, i) => (
                                        <tr key={r.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                            i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                        }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{r.receipt_number}</td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{r.payment_date}</td>
                                            <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{r.first_name} {r.last_name}</td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{r.admission_number}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{r.grade_level}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold font-mono text-emerald-600">KSh {Number(r.amount).toLocaleString()}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{METHOD_LABELS[r.payment_method] || r.payment_method}</td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{r.mpesa_code || r.bank_ref || '—'}</td>
                                            <td className="px-3 py-2 text-right">
                                                <button className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">Print</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {receipts.length === 0 && !loading && (
                                <div className="py-12 text-center text-xs text-slate-400 italic">No receipts for this period.</div>
                            )}
                        </div>
                        {/* Pagination */}
                        {meta.last_page > 1 && (
                            <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                                <button disabled={meta.current_page <= 1}
                                    onClick={() => fetchReceipts(meta.current_page - 1)}
                                    className="text-[10px] font-bold uppercase tracking-wider text-primary disabled:text-slate-300 disabled:cursor-not-allowed">
                                    ← Prev
                                </button>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                                    Page {meta.current_page} of {meta.last_page} — {meta.total} receipts
                                </p>
                                <button disabled={meta.current_page >= meta.last_page}
                                    onClick={() => fetchReceipts(meta.current_page + 1)}
                                    className="text-[10px] font-bold uppercase tracking-wider text-primary disabled:text-slate-300 disabled:cursor-not-allowed">
                                    Next →
                                </button>
                            </div>
                        )}
                        {meta.last_page <= 1 && (
                            <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{receipts.length} receipts</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ReceiptsRegister;
