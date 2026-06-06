import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const FundTransfers = () => {
    const [accounts, setAccounts]   = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [from, setFrom]     = useState('');
    const [to, setTo]         = useState('');
    const [amount, setAmount] = useState('');
    const [note, setNote]     = useState('');
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [accsRes, trfRes] = await Promise.all([
                window.axios.get('/api/finance/bank-accounts').catch(() => ({ data: [] })),
                window.axios.get('/api/finance/fund-transfers').catch(() => ({ data: [] })),
            ]);
            setAccounts(accsRes.data.data || accsRes.data || []);
            setTransfers(trfRes.data.data || trfRes.data || []);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleTransfer = async () => {
        if (!from || !to || !amount) {
            window.showToast?.('error', 'Select accounts and enter amount.');
            return;
        }
        setSaving(true);
        try {
            await window.axios.post('/api/finance/fund-transfers', {
                from_account_id: from,
                to_account_id:   to,
                amount:          parseInt(amount),
                notes:           note,
            });
            window.showToast?.('success', 'Transfer initiated.');
            setFrom(''); setTo(''); setAmount(''); setNote('');
            fetchData();
        } catch (err) {
            window.showToast?.('error', err.response?.data?.message || 'Transfer failed.');
        } finally { setSaving(false); }
    };

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex-shrink-0">
                <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                    Finance <span className="mx-1">/</span>
                    <span className="text-slate-600 dark:text-slate-300 font-semibold">Fund Transfers</span>
                </nav>
                <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Fund Transfers</h1>
            </div>

            <div className="flex gap-3 flex-1 min-h-0">

                {/* Transfer Form */}
                <div className="w-80 flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col">
                    <div className="flex-shrink-0 px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700 rounded-t-lg">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">New Transfer</span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col gap-3">
                        {accounts.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                                <p className="text-xs text-slate-400">Bank accounts not yet configured.</p>
                                <p className="text-[10px] text-slate-300 mt-1">Phase 3 will add bank account management.</p>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">From Account</label>
                                    <select value={from} onChange={e => setFrom(e.target.value)} className={inputCls}>
                                        <option value="">Select…</option>
                                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">To Account</label>
                                    <select value={to} onChange={e => setTo(e.target.value)} className={inputCls}>
                                        <option value="">Select…</option>
                                        {accounts.filter(a => a.id != from).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Amount (KSh)</label>
                                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className={inputCls}/>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Reason / Note</label>
                                    <textarea value={note} onChange={e => setNote(e.target.value)} rows="3" className={inputCls + ' resize-none'}/>
                                </div>
                                <button onClick={handleTransfer} disabled={saving || !from || !to || !amount}
                                    className="mt-auto px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">
                                    {saving ? 'Processing…' : 'Initiate Transfer'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Recent Transfers */}
                <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col min-h-0">
                    <div className="flex-shrink-0 px-4 py-2.5 bg-slate-800 dark:bg-slate-900 rounded-t-lg">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Recent Transfers</span>
                    </div>
                    {loading ? (
                        <div className="p-6"><SkeletonLoader type="table"/></div>
                    ) : transfers.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-12">
                            <p className="text-slate-400 text-sm">No fund transfers recorded.</p>
                            <p className="text-[10px] text-slate-300 mt-1">Transfers between bank accounts will appear here.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-auto">
                                <table className="w-full text-left" style={{ minWidth: 480 }}>
                                    <thead className="sticky top-0 z-10">
                                        <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Ref</th>
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">From → To</th>
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Date</th>
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transfers.map((t, i) => (
                                            <tr key={t.id} className={`border-b border-slate-100 dark:border-gray-700/60 ${
                                                i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                            }`}>
                                                <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                                <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{t.reference}</td>
                                                <td className="px-3 py-2">
                                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{t.from_account_name}</p>
                                                    <p className="text-[10px] text-slate-400">→ {t.to_account_name}</p>
                                                </td>
                                                <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{t.transfer_date}</td>
                                                <td className="px-3 py-2 text-right text-xs font-bold font-mono text-slate-700 dark:text-slate-200">KSh {Number(t.amount).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{transfers.length} transfer{transfers.length !== 1 ? 's' : ''}</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FundTransfers;
