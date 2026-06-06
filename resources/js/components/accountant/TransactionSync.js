import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const statusBadge = (s) =>
    s === 'matched'   ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
    s === 'unmatched' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
    s === 'failed'    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                        'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';

const TransactionSync = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [syncing, setSyncing]   = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await window.axios.get('/api/finance/mpesa-c2b').catch(() => ({ data: [] }));
            setTransactions(res.data.data || res.data || []);
        } catch { setTransactions([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSync = async () => {
        setSyncing(true);
        try {
            await window.axios.post('/api/finance/mpesa-c2b/sync');
            window.showToast?.('success', 'Sync triggered.');
            fetchData();
        } catch (err) {
            window.showToast?.('error', err.response?.data?.message || 'Sync failed.');
        } finally { setSyncing(false); }
    };

    const handleRetry = async (id) => {
        try {
            await window.axios.post(`/api/finance/mpesa-c2b/${id}/match`);
            window.showToast?.('success', 'Transaction re-queued for matching.');
            fetchData();
        } catch { window.showToast?.('error', 'Retry failed.'); }
    };

    const synced   = transactions.filter(t => t.status === 'matched').length;
    const failed   = transactions.filter(t => t.status === 'failed').length;
    const unmatched = transactions.filter(t => t.status === 'unmatched').length;

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Finance <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Transaction Sync</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">M-Pesa Transaction Sync</h1>
                </div>
                <button onClick={handleSync} disabled={syncing}
                    className="px-4 py-1.5 bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-emerald-700 disabled:opacity-60 transition-colors">
                    {syncing ? 'Syncing…' : 'Sync Now'}
                </button>
            </div>

            {/* Stats strip */}
            {!loading && (
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20">
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{synced}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Matched</span>
                    </div>
                    {unmatched > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                            <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{unmatched}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unmatched</span>
                        </div>
                    )}
                    {failed > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                            <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{failed}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Failed</span>
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {loading ? (
                    <div className="p-6"><SkeletonLoader type="table"/></div>
                ) : transactions.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16">
                        <p className="text-slate-400 text-sm">No M-Pesa C2B transactions.</p>
                        <p className="text-[10px] text-slate-300 mt-1">M-Pesa Paybill C2B integration (Phase 3) will populate this list.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left" style={{ minWidth: 700 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">M-Pesa Ref</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Payer</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Matched To</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Amount</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-32">Timestamp</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Status</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((t, i) => (
                                        <tr key={t.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                            i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                        }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{t.mpesa_reference}</td>
                                            <td className="px-3 py-2 text-xs text-slate-700 dark:text-slate-200">{t.payer_name || t.phone_number}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500">{t.matched_student || '—'}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold font-mono text-emerald-600">KSh {Number(t.amount).toLocaleString()}</td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{t.transaction_time}</td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${statusBadge(t.status)}`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                {(t.status === 'failed' || t.status === 'unmatched') ? (
                                                    <button onClick={() => handleRetry(t.id)}
                                                        className="text-[10px] font-bold uppercase tracking-wider text-blue-500 hover:text-blue-700 transition-colors">Retry</button>
                                                ) : (
                                                    <span className="text-[10px] text-slate-300">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{transactions.length} transactions</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TransactionSync;
