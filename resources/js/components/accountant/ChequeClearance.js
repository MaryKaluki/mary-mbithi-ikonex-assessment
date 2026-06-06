import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const statusBadge = (s) =>
    s === 'cleared'    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
    s === 'deposited'  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
    s === 'received'   ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' :
    s === 'bounced'    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                         'bg-slate-100 dark:bg-slate-700 text-slate-500';

const ChequeClearance = () => {
    const [cheques, setCheques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter]   = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = filter ? { status: filter } : {};
            const res = await window.axios.get('/api/finance/mpesa/cheques', { params })
                .catch(() => ({ data: [] }));
            setCheques(res.data.data || res.data || []);
        } catch { setCheques([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [filter]);

    const handleClear = async (id) => {
        if (!window.confirm('Mark this cheque as cleared?')) return;
        try {
            await window.axios.patch(`/api/finance/mpesa/cheques/${id}/clear`);
            fetchData();
            window.showToast?.('success', 'Cheque marked as cleared.');
        } catch (err) {
            window.showToast?.('error', err.response?.data?.message || 'Could not clear cheque.');
        }
    };

    const handleBounce = async (id) => {
        const reason = window.prompt('Bounce reason (optional):');
        if (reason === null) return; // cancelled
        try {
            await window.axios.patch(`/api/finance/mpesa/cheques/${id}/bounce`, { reason });
            fetchData();
            window.showToast?.('success', 'Cheque marked as bounced.');
        } catch (err) {
            window.showToast?.('error', err.response?.data?.message || 'Could not bounce cheque.');
        }
    };

    const cleared  = cheques.filter(c => c.status === 'cleared').length;
    const pending  = cheques.filter(c => c.status === 'received' || c.status === 'deposited').length;
    const bounced  = cheques.filter(c => c.status === 'bounced').length;
    const totalVal = cheques.reduce((a, c) => a + Number(c.amount ?? 0), 0);

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Finance <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Cheque Clearance</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Cheque Clearance</h1>
                </div>
                <div className="flex items-center gap-2">
                    <select value={filter} onChange={e => setFilter(e.target.value)}
                        className="px-3 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All Status</option>
                        <option value="received">Received</option>
                        <option value="deposited">Deposited</option>
                        <option value="cleared">Cleared</option>
                        <option value="bounced">Bounced</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <button onClick={fetchData}
                        className="px-4 py-1.5 border border-slate-300 dark:border-gray-600 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats strip */}
            {!loading && (
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                    {[
                        { label: 'Total Value', value: `KSh ${totalVal.toLocaleString()}`,  cls: 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800' },
                        { label: 'Cleared',     value: cleared,                              cls: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' },
                        { label: 'Pending',     value: pending,                              cls: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' },
                        { label: 'Bounced',     value: bounced,                              cls: bounced > 0 ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' : 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800' },
                    ].map(c => (
                        <div key={c.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${c.cls}`}>
                            <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{c.value}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{c.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {loading ? (
                    <div className="p-6"><SkeletonLoader type="table"/></div>
                ) : cheques.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16">
                        <p className="text-slate-400 text-sm">No cheque records found.</p>
                        <p className="text-[10px] text-slate-300 mt-1">Cheques linked to fee payments will appear here.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left" style={{ minWidth: 800 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Cheque No</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Payer / Student</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Drawn On</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Amount</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Received</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Status</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cheques.map((c, i) => (
                                        <tr key={c.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                            i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                        }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-500">{c.cheque_number}</td>
                                            <td className="px-3 py-2">
                                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{c.payer_name || c.student_name || '—'}</p>
                                                {c.student_name && c.payer_name && c.student_name !== c.payer_name && (
                                                    <p className="text-[10px] text-slate-400">{c.student_name}</p>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-xs text-slate-500">{c.drawn_on_bank || '—'}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold font-mono text-slate-700 dark:text-slate-200">KSh {Number(c.amount).toLocaleString()}</td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{c.received_date}</td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${statusBadge(c.status)}`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                {(c.status === 'received' || c.status === 'deposited') ? (
                                                    <div className="flex gap-2 justify-end">
                                                        <button onClick={() => handleClear(c.id)}
                                                            className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-800 transition-colors">Clear</button>
                                                        <button onClick={() => handleBounce(c.id)}
                                                            className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors">Bounce</button>
                                                    </div>
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
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{cheques.length} cheque{cheques.length !== 1 ? 's' : ''}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChequeClearance;
