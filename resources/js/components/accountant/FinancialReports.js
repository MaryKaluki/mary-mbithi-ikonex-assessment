import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const REPORTS = [
    { key: 'collection-summary',   label: 'Collection Summary',      params: ['year', 'term'] },
    { key: 'daily-collection',     label: 'Daily Collection',         params: ['date'] },
    { key: 'receipts-register',    label: 'Receipts Register',        params: ['from', 'to'] },
    { key: 'outstanding-balances', label: 'Outstanding Balances',     params: ['year', 'term'] },
    { key: 'defaulters',           label: 'Defaulters List',          params: ['year', 'term'] },
    { key: 'income-statement',     label: 'Income Statement',         params: ['from', 'to'] },
    { key: 'budget-vs-actual',     label: 'Budget vs Actual',         params: ['year'] },
    { key: 'expense-ledger',       label: 'Expense Ledger',           params: ['from', 'to'] },
    { key: 'mpesa-transactions',   label: 'M-Pesa Transactions',      params: ['from', 'to'] },
    { key: 'arrears-ageing',       label: 'Arrears Ageing',           params: ['as_of'] },
    { key: 'annual-summary',       label: 'Annual Summary',           params: ['year'] },
    { key: 'petty-cash',           label: 'Petty Cash Report',        params: ['from', 'to'] },
    { key: 'bank-reconciliation',  label: 'Bank Reconciliation',      params: ['from', 'to'] },
];

const inputCls = "px-3 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const FinancialReports = () => {
    const today = new Date().toISOString().slice(0, 10);
    const curYear = new Date().getFullYear().toString();
    const firstOfMonth = today.slice(0, 8) + '01';

    const [activeReport, setActiveReport] = useState(REPORTS[0]);
    const [params, setParams] = useState({
        year:  curYear,
        term:  '',
        from:  firstOfMonth,
        to:    today,
        date:  today,
        as_of: today,
    });
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    const buildApiParams = (report) => {
        const p = {};
        report.params.forEach(k => { if (params[k]) p[k] = params[k]; });
        return p;
    };

    const loadReport = async (report) => {
        setData(null);
        setLoading(true);
        try {
            const res = await window.axios.get(
                `/api/finance/reports/${report.key}`,
                { params: buildApiParams(report) }
            );
            setData(res.data);
        } catch (err) {
            window.showToast?.('error', err.response?.data?.message || 'Failed to load report.');
        } finally { setLoading(false); }
    };

    useEffect(() => { loadReport(activeReport); }, [activeReport]);

    const handleLoad = () => loadReport(activeReport);

    const handleExport = async () => {
        setExporting(true);
        try {
            const res = await window.axios.get(
                `/api/finance/reports/${activeReport.key}/export`,
                { params: buildApiParams(activeReport), responseType: 'blob' }
            );
            const url  = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ikonex-${activeReport.key}-${today}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch { window.showToast?.('error', 'Export failed.'); }
        finally { setExporting(false); }
    };

    const setParam = (k, v) => setParams(p => ({ ...p, [k]: v }));

    const renderSummaryStats = () => {
        if (!data) return null;

        // Per-report stat strip
        const s = data.summary ?? data.totals ?? null;
        if (!s) return null;

        const entries = Object.entries(s).filter(([, v]) => typeof v === 'number').slice(0, 5);
        return (
            <div className="flex flex-wrap gap-2 flex-shrink-0">
                {entries.map(([k, v]) => {
                    const label = k.replace(/_/g, ' ');
                    const isAmt = k.includes('amount') || k.includes('income') ||
                                  k.includes('expense') || k.includes('collected') ||
                                  k.includes('billed') || k.includes('balance') ||
                                  k.includes('surplus') || k.includes('invoiced');
                    return (
                        <div key={k} className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                            <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                                {isAmt ? `KSh ${Number(v).toLocaleString()}` : Number(v).toLocaleString()}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderTable = () => {
        if (!data) return null;

        // Try to find the main data array
        const rows = data.data ?? data.receipts ?? data.transactions ?? data.monthly_series ?? null;
        if (!rows || !Array.isArray(rows) || rows.length === 0) {
            return (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-xs text-slate-400 italic">No data for this period.</p>
                </div>
            );
        }

        const keys = Object.keys(rows[0]).filter(k =>
            !['id', 'school_id', 'student_id', 'invoice_id', 'category_id',
              'raw_payload', 'is_matched', 'match_method', 'parent_id'].includes(k)
        ).slice(0, 10);

        return (
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left" style={{ minWidth: Math.max(keys.length * 100, 400) }}>
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                            {keys.map(k => (
                                <th key={k} className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                                    {k.replace(/_/g, ' ')}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={i} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                            }`}>
                                <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                {keys.map(k => {
                                    const v = row[k];
                                    const isAmt = typeof v === 'number' && (
                                        k.includes('amount') || k.includes('income') || k.includes('expense') ||
                                        k.includes('balance') || k.includes('billed') || k.includes('collected') ||
                                        k.includes('budget') || k.includes('actual') || k.includes('surplus')
                                    );
                                    return (
                                        <td key={k} className={`px-3 py-2 text-xs ${isAmt ? 'text-right font-bold font-mono text-emerald-600' : 'text-slate-700 dark:text-slate-200'}`}>
                                            {isAmt ? `KSh ${Number(v ?? 0).toLocaleString()}` : (v ?? '—')}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const hasExport = ['daily-collection', 'receipts-register', 'outstanding-balances',
                       'defaulters', 'expense-ledger', 'mpesa-transactions'].includes(activeReport.key);

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Finance <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Financial Reports</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Financial Reports</h1>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                    {/* Contextual param controls */}
                    {activeReport.params.includes('date') && (
                        <input type="date" value={params.date} onChange={e => setParam('date', e.target.value)} className={inputCls}/>
                    )}
                    {activeReport.params.includes('from') && (
                        <>
                            <input type="date" value={params.from} onChange={e => setParam('from', e.target.value)} className={inputCls}/>
                            <span className="text-slate-400 text-xs">to</span>
                            <input type="date" value={params.to} onChange={e => setParam('to', e.target.value)} className={inputCls}/>
                        </>
                    )}
                    {activeReport.params.includes('year') && (
                        <select value={params.year} onChange={e => setParam('year', e.target.value)} className={inputCls}>
                            {[2026, 2025, 2024, 2023].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    )}
                    {activeReport.params.includes('term') && (
                        <select value={params.term} onChange={e => setParam('term', e.target.value)} className={inputCls}>
                            <option value="">All Terms</option>
                            <option value="1">Term 1</option>
                            <option value="2">Term 2</option>
                            <option value="3">Term 3</option>
                        </select>
                    )}
                    {activeReport.params.includes('as_of') && (
                        <input type="date" value={params.as_of} onChange={e => setParam('as_of', e.target.value)} className={inputCls}/>
                    )}
                    <button onClick={handleLoad} disabled={loading}
                        className="px-4 py-1.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">
                        Load
                    </button>
                    {hasExport && (
                        <button onClick={handleExport} disabled={exporting || !data}
                            className="px-4 py-1.5 border border-slate-300 dark:border-gray-600 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors">
                            {exporting ? 'Exporting…' : 'Export CSV'}
                        </button>
                    )}
                </div>
            </div>

            {/* Stats strip */}
            {!loading && renderSummaryStats()}

            {/* Main layout */}
            <div className="flex gap-3 flex-1 min-h-0">

                {/* Report selector */}
                <div className="w-52 flex-shrink-0 flex flex-col gap-1 overflow-y-auto">
                    {REPORTS.map(r => (
                        <button key={r.key} onClick={() => setActiveReport(r)}
                            className={`text-left px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                                activeReport.key === r.key
                                    ? 'bg-primary/10 border-primary text-primary dark:bg-primary/20'
                                    : 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                            }`}>
                            {r.label}
                        </button>
                    ))}
                </div>

                {/* Report output */}
                <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col min-h-0">
                    <div className="flex-shrink-0 px-4 py-2.5 bg-slate-800 dark:bg-slate-900 rounded-t-lg">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{activeReport.label}</span>
                    </div>
                    {loading ? (
                        <div className="p-6"><SkeletonLoader type="table"/></div>
                    ) : (
                        <>
                            {renderTable()}
                            {data && (
                                <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                                        {(data.data ?? data.receipts ?? data.transactions ?? data.monthly_series ?? []).length} rows
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinancialReports;
