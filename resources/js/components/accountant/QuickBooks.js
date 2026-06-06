import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const QuickBooks = () => {
    const [status, setStatus]   = useState(null);
    const [syncLog, setSyncLog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const res = await window.axios.get('/api/finance/quickbooks/status').catch(() => ({ data: null }));
            setStatus(res.data);
            const logRes = await window.axios.get('/api/finance/quickbooks/sync-log').catch(() => ({ data: [] }));
            setSyncLog(logRes.data.data || logRes.data || []);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchStatus(); }, []);

    const handleConnect = async () => {
        try {
            const res = await window.axios.get('/api/finance/quickbooks/auth-url');
            if (res.data?.url) window.open(res.data.url, '_blank');
        } catch { window.showToast?.('error', 'Could not initiate QuickBooks connection.'); }
    };

    const handleDisconnect = async () => {
        if (!window.confirm('Disconnect QuickBooks integration?')) return;
        try {
            await window.axios.delete('/api/finance/quickbooks/disconnect');
            fetchStatus();
            window.showToast?.('success', 'QuickBooks disconnected.');
        } catch { window.showToast?.('error', 'Could not disconnect.'); }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await window.axios.post('/api/finance/quickbooks/sync');
            window.showToast?.('success', 'Sync triggered.');
            fetchStatus();
        } catch (err) {
            window.showToast?.('error', err.response?.data?.message || 'Sync failed.');
        } finally { setSyncing(false); }
    };

    const connected = status?.connected === true;
    const errors    = syncLog.filter(l => l.status === 'error').length;

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Finance <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">QuickBooks</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">QuickBooks Online Integration</h1>
                </div>
                {connected && (
                    <button onClick={handleSync} disabled={syncing}
                        className="px-4 py-1.5 bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-emerald-700 disabled:opacity-60 transition-colors">
                        {syncing ? 'Syncing…' : 'Sync Now'}
                    </button>
                )}
            </div>

            {/* Stats strip */}
            {!loading && (
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${
                        connected ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' : 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800'
                    }`}>
                        <span className={`text-base font-extrabold ${connected ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-400'}`}>
                            {connected ? 'Connected' : 'Disconnected'}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">QuickBooks</span>
                    </div>
                    {errors > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                            <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{errors}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sync Errors</span>
                        </div>
                    )}
                </div>
            )}

            <div className="flex gap-3 flex-1 min-h-0">

                {/* Connection panel */}
                <div className="w-56 flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col">
                    <div className="flex-shrink-0 px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700 rounded-t-lg">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Connection</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center p-4 gap-3 text-center">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-extrabold ${
                            connected ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                        }`}>
                            QB
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{connected ? 'Connected' : 'Not Connected'}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                                {connected
                                    ? `Last sync: ${status.last_sync_at || 'Never'}`
                                    : 'Connect to sync financial data'
                                }
                            </p>
                        </div>
                        {connected ? (
                            <button onClick={handleDisconnect}
                                className="w-full py-1.5 text-xs font-bold uppercase tracking-wider rounded-md border border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                Disconnect
                            </button>
                        ) : (
                            <button onClick={handleConnect}
                                className="w-full py-1.5 text-xs font-bold uppercase tracking-wider rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                                Connect QB
                            </button>
                        )}
                    </div>
                </div>

                {/* Right stack */}
                <div className="flex-1 min-w-0 flex flex-col gap-3 min-h-0">

                    {/* Sync log */}
                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                        <div className="flex-shrink-0 px-4 py-2.5 bg-slate-800 dark:bg-slate-900 rounded-t-lg">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Sync Activity Log</span>
                        </div>
                        {loading ? (
                            <div className="p-6"><SkeletonLoader type="table"/></div>
                        ) : syncLog.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center py-10">
                                <p className="text-xs text-slate-400 italic">
                                    {connected ? 'No sync activity yet.' : 'Connect QuickBooks to view sync logs.'}
                                </p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-auto">
                                <table className="w-full text-left" style={{ minWidth: 420 }}>
                                    <thead className="sticky top-0 z-10">
                                        <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Description</th>
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Time</th>
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {syncLog.map((l, i) => (
                                            <tr key={l.id} className={`border-b border-slate-100 dark:border-gray-700/60 ${
                                                l.status === 'error' ? 'bg-red-50/60 dark:bg-red-900/10' : i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                            }`}>
                                                <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                                <td className="px-3 py-2">
                                                    <p className={`text-xs font-semibold ${l.status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-100'}`}>{l.description}</p>
                                                    {l.details && <p className="text-[10px] text-slate-400">{l.details}</p>}
                                                </td>
                                                <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{l.created_at?.split('T')[0]}</td>
                                                <td className="px-3 py-2 text-center">
                                                    <span className={`inline-block w-2 h-2 rounded-full ${l.status === 'success' || l.status === 'ok' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Account mapping info */}
                    <div className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
                        <div className="px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700 rounded-t-lg">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Integration Notes</span>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">What syncs</p>
                                {['Fee invoices → QB Sales Receipts', 'Payments → QB Payments', 'Expenses → QB Bills'].map((item, i) => (
                                    <p key={i} className="text-[10px] text-slate-500 dark:text-slate-400 py-1 border-b border-slate-50 dark:border-gray-700 last:border-0">{item}</p>
                                ))}
                            </div>
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Sync frequency</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 py-1">Auto-sync: On payment recorded</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 py-1">Manual: Use "Sync Now" button</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 py-1">Nightly: 2:00 AM scheduled sync</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickBooks;
