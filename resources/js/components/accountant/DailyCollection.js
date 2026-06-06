import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const METHOD_COLORS = {
    mpesa:          'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    bank_transfer:  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    cash:           'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    cheque:         'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
    standing_order: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    card:           'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
};

const METHOD_LABELS = {
    mpesa: 'M-Pesa', bank_transfer: 'Bank Transfer', cash: 'Cash',
    cheque: 'Cheque', standing_order: 'Standing Order', card: 'Card',
};

const DailyCollection = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData]     = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCollection = async (date) => {
        setLoading(true);
        try {
            const res = await window.axios.get('/api/finance/daily-collection', { params: { date } });
            setData(res.data);
        } catch { setData(null); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCollection(selectedDate); }, [selectedDate]);

    const breakdown = data?.breakdown || {};
    const grandTotal = data?.grand_total || 0;
    const timeline = data?.timeline || [];

    const statCards = [
        { label: 'Total',    value: grandTotal,                      cls: 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800' },
        { label: 'M-Pesa',  value: breakdown.mpesa?.total  || 0,    cls: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' },
        { label: 'Bank',    value: breakdown.bank_transfer?.total || 0, cls: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' },
        { label: 'Cash',    value: breakdown.cash?.total   || 0,    cls: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20' },
        { label: 'Cheque',  value: breakdown.cheque?.total || 0,    cls: 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800' },
    ];

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Finance <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Daily Collection</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Daily Collection Report</h1>
                </div>
                <div className="flex gap-2 items-center">
                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                        className="px-3 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    <button onClick={() => window.print()}
                        className="px-4 py-1.5 border border-slate-300 dark:border-gray-600 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                        Print
                    </button>
                </div>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-2 flex-shrink-0">
                {statCards.map(c => (
                    <div key={c.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${c.cls}`}>
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                            KSh {Number(c.value).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{c.label}</span>
                    </div>
                ))}
            </div>

            {/* Breakdown table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {loading ? (
                    <div className="p-6"><SkeletonLoader type="table"/></div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left" style={{ minWidth: 480 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Payment Method</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Transactions</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-36 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(breakdown).map(([method, stats], i) => (
                                        <tr key={method} className={`border-b border-slate-100 dark:border-gray-700/60 ${
                                            i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                        }`}>
                                            <td className="px-3 py-2.5">
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${METHOD_COLORS[method] || METHOD_COLORS.cash}`}>
                                                    {METHOD_LABELS[method] || method}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5 text-right text-xs font-mono text-slate-500">
                                                {stats.count}
                                            </td>
                                            <td className="px-3 py-2.5 text-right text-xs font-bold font-mono text-emerald-600">
                                                {stats.total > 0 ? `KSh ${Number(stats.total).toLocaleString()}` : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-50 dark:bg-gray-900/30 border-t border-slate-200 dark:border-gray-700">
                                        <td className="px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                                            Total for {selectedDate}
                                        </td>
                                        <td className="px-3 py-2.5 text-right text-xs font-mono text-slate-500">
                                            {Object.values(breakdown).reduce((a, b) => a + b.count, 0)} txns
                                        </td>
                                        <td className="px-3 py-2.5 text-right text-xs font-bold font-mono text-slate-800 dark:text-slate-100">
                                            KSh {Number(grandTotal).toLocaleString()}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                            {grandTotal === 0 && (
                                <div className="py-12 text-center text-xs text-slate-400 italic">No collections recorded for {selectedDate}.</div>
                            )}
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                                {Object.values(breakdown).reduce((a, b) => a + b.count, 0)} transactions — {selectedDate}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DailyCollection;
