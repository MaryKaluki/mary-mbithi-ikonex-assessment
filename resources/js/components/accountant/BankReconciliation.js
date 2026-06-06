import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const BankReconciliation = () => {
    const [accounts, setAccounts]         = useState([]);
    const [selectedAccount, setSelected]  = useState('');
    const [systemRecords, setSystemRecords] = useState([]);
    const [bankStatements, setBankStatements] = useState([]);
    const [summary, setSummary]           = useState(null);
    const [loading, setLoading]           = useState(false);
    const [reconciling, setReconciling]   = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().toISOString().slice(0, 7)
    );

    // Fetch bank accounts on mount
    useEffect(() => {
        window.axios.get('/api/finance/bank-accounts').catch(() => ({ data: [] }))
            .then(res => {
                const list = res.data.data || res.data || [];
                setAccounts(list);
                if (list.length > 0) setSelected(String(list[0].id));
            });
    }, []);

    const fetchData = async () => {
        if (!selectedAccount) return;
        setLoading(true);
        try {
            const [year, month] = selectedMonth.split('-');
            const from = `${year}-${month}-01`;
            const lastDay = new Date(year, month, 0).getDate();
            const to = `${year}-${month}-${lastDay}`;

            const [sysRes, bankRes, summRes] = await Promise.all([
                window.axios.get('/api/finance/receipts', { params: { from, to, per_page: 100 } })
                    .catch(() => ({ data: { data: [] } })),
                window.axios.get('/api/finance/bank-statements', {
                    params: { bank_account_id: selectedAccount, month: selectedMonth }
                }).catch(() => ({ data: [] })),
                window.axios.get('/api/finance/bank-statements/summary', {
                    params: { bank_account_id: selectedAccount, from, to }
                }).catch(() => ({ data: null })),
            ]);

            setSystemRecords(sysRes.data.data || []);
            setBankStatements(bankRes.data.data || bankRes.data || []);
            setSummary(summRes.data || null);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { if (selectedAccount) fetchData(); }, [selectedAccount]);

    const handleReconcile = async () => {
        if (!selectedAccount) return;
        setReconciling(true);
        try {
            const [year, month] = selectedMonth.split('-');
            const from = `${year}-${month}-01`;
            const lastDay = new Date(year, month, 0).getDate();
            const to = `${year}-${month}-${lastDay}`;

            const res = await window.axios.post('/api/finance/bank-statements/reconcile', {
                bank_account_id: selectedAccount, from, to,
            });
            window.showToast?.('success', res.data.message || 'Reconciliation complete.');
            fetchData();
        } catch (err) {
            window.showToast?.('error', err.response?.data?.message || 'Reconciliation failed.');
        } finally { setReconciling(false); }
    };

    const systemTotal = systemRecords.reduce((a, r) => a + Number(r.amount ?? 0), 0);
    const bankTotal   = bankStatements.reduce((a, r) => a + Number(r.credit ?? 0), 0);
    const difference  = summary ? summary.difference : (bankTotal - systemTotal);
    const unmatched   = bankStatements.filter(r => !r.is_reconciled).length;

    const selectedAccountObj = accounts.find(a => String(a.id) === selectedAccount);

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Finance <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Bank Reconciliation</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Bank Reconciliation</h1>
                </div>
                <div className="flex gap-2 items-center">
                    <select value={selectedAccount} onChange={e => setSelected(e.target.value)}
                        className="px-3 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select account…</option>
                        {accounts.map(a => (
                            <option key={a.id} value={a.id}>{a.bank_name} — {a.account_name}</option>
                        ))}
                    </select>
                    <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
                        className="px-3 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    <button onClick={fetchData} disabled={!selectedAccount}
                        className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors">
                        Load
                    </button>
                    {bankStatements.length > 0 && (
                        <button onClick={handleReconcile} disabled={reconciling || !selectedAccount}
                            className="px-4 py-1.5 bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-emerald-700 disabled:opacity-60 transition-colors">
                            {reconciling ? 'Reconciling…' : 'Auto-Reconcile'}
                        </button>
                    )}
                </div>
            </div>

            {/* No accounts state */}
            {accounts.length === 0 && (
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center py-16">
                    <p className="text-slate-400 text-sm">No bank accounts configured.</p>
                    <p className="text-[10px] text-slate-300 mt-1">Add a bank account in Finance → Bank Accounts to enable reconciliation.</p>
                </div>
            )}

            {/* Stats strip */}
            {accounts.length > 0 && !loading && (
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                    {[
                        { label: 'System Credits', value: `KSh ${systemTotal.toLocaleString()}`,       cls: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' },
                        { label: 'Bank Credits',   value: `KSh ${bankTotal.toLocaleString()}`,         cls: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' },
                        { label: 'Difference',
                          value: `${difference >= 0 ? '+' : ''}KSh ${Math.abs(difference).toLocaleString()}`,
                          cls: difference === 0
                            ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20'
                            : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' },
                        { label: 'Unmatched',      value: unmatched,                                   cls: unmatched === 0 ? 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800' : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20' },
                    ].map(c => (
                        <div key={c.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${c.cls}`}>
                            <span className={`text-base font-extrabold ${c.label === 'Difference' && difference !== 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-100'}`}>{c.value}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{c.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Two-panel layout */}
            {accounts.length > 0 && (
                <div className="flex gap-3 flex-1 min-h-0">

                    {/* System Records */}
                    <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col min-h-0">
                        <div className="flex-shrink-0 px-4 py-2.5 bg-slate-800 dark:bg-slate-900 rounded-t-lg">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">System Records (Receipts)</span>
                        </div>
                        {loading ? <div className="p-6"><SkeletonLoader type="table"/></div> : (
                            <>
                                <div className="flex-1 overflow-auto">
                                    <table className="w-full text-left" style={{ minWidth: 380 }}>
                                        <thead className="sticky top-0 z-10">
                                            <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Date / Receipt</th>
                                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Student</th>
                                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {systemRecords.map((r, i) => (
                                                <tr key={r.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                                    i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                                }`}>
                                                    <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                                    <td className="px-3 py-2">
                                                        <p className="text-[10px] font-mono text-slate-400">{r.payment_date}</p>
                                                        <p className="text-[9px] font-mono text-slate-300 dark:text-slate-600">{r.receipt_number}</p>
                                                    </td>
                                                    <td className="px-3 py-2 text-xs text-slate-700 dark:text-slate-200">{r.first_name} {r.last_name}</td>
                                                    <td className="px-3 py-2 text-right text-xs font-bold font-mono text-emerald-600">
                                                        +KSh {Number(r.amount).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {systemRecords.length === 0 && (
                                        <div className="py-10 text-center text-xs text-slate-400 italic">No receipts for this period.</div>
                                    )}
                                </div>
                                <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{systemRecords.length} records</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Bank Statements */}
                    <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col min-h-0">
                        <div className="flex-shrink-0 px-4 py-2.5 bg-slate-800 dark:bg-slate-900 rounded-t-lg flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Bank Statement Lines</span>
                            {bankStatements.length > 0 && (
                                <span className="text-[9px] text-amber-400 uppercase tracking-wider">{unmatched} unmatched</span>
                            )}
                        </div>
                        {loading ? <div className="p-6"><SkeletonLoader type="table"/></div> : bankStatements.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-12">
                                <p className="text-slate-400 text-xs">No bank statement entries for this period.</p>
                                <p className="text-[10px] text-slate-300 mt-1">Import a bank statement CSV to populate this panel.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 overflow-auto">
                                    <table className="w-full text-left" style={{ minWidth: 380 }}>
                                        <thead className="sticky top-0 z-10">
                                            <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Date / Ref</th>
                                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Description</th>
                                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-center">Match</th>
                                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Credit</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bankStatements.map((tx, i) => (
                                                <tr key={tx.id} className={`border-b border-slate-100 dark:border-gray-700/60 ${
                                                    !tx.is_reconciled ? 'bg-amber-50/60 dark:bg-amber-900/10' : i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                                }`}>
                                                    <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                                    <td className="px-3 py-2">
                                                        <p className="text-[10px] font-mono text-slate-400">{tx.transaction_date}</p>
                                                        <p className="text-[9px] font-mono text-slate-300 dark:text-slate-600">{tx.reference || '—'}</p>
                                                    </td>
                                                    <td className="px-3 py-2 text-xs text-slate-700 dark:text-slate-200">{tx.description || '—'}</td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span className={`inline-block w-2 h-2 rounded-full ${tx.is_reconciled ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                    </td>
                                                    <td className="px-3 py-2 text-right text-xs font-bold font-mono text-emerald-600">
                                                        {tx.credit > 0 ? `+KSh ${Number(tx.credit).toLocaleString()}` : (
                                                            <span className="text-red-500">-KSh {Number(tx.debit).toLocaleString()}</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{bankStatements.length} lines · {unmatched} unmatched</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BankReconciliation;
