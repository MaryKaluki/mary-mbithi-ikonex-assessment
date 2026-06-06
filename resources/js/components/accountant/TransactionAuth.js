import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const METHOD_LABELS = {
    cash: 'Cash', mpesa: 'M-Pesa', bank_transfer: 'Bank Transfer',
    cheque: 'Cheque', standing_order: 'Standing Order', card: 'Card',
};

const TransactionAuth = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading]   = useState(true);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await window.axios.get('/api/finance/receipts', {
                params: { status: 'pending', per_page: 50 },
            });
            setPayments(res.data.data || []);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchPending(); }, []);

    const handleConfirm = async (id) => {
        if (!window.confirm('Confirm this payment?')) return;
        try {
            await window.axios.patch(`/api/finance/payments/${id}/confirm`);
            setPayments(p => p.filter(x => x.payment_id !== id));
            window.showToast?.('success', 'Payment confirmed.');
        } catch (err) {
            window.showToast?.('error', err.response?.data?.message || 'Could not confirm payment.');
        }
    };

    const totalPending = payments.reduce((a, p) => a + Number(p.amount), 0);

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Finance <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Transaction Auth</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Authorize Payments</h1>
                </div>
                <button onClick={fetchPending}
                    className="px-4 py-1.5 border border-slate-300 dark:border-gray-600 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                    Refresh
                </button>
            </div>

            {/* Stats strip */}
            {!loading && (
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${payments.length > 0 ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20' : 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800'}`}>
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{payments.length}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Review</span>
                    </div>
                    {totalPending > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                            <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">KSh {totalPending.toLocaleString()}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Pending</span>
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {loading ? (
                    <div className="p-6"><SkeletonLoader type="table"/></div>
                ) : payments.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16">
                        <p className="text-slate-400 text-sm">No transactions pending authorization.</p>
                        <p className="text-[10px] text-slate-300 mt-1">Pending payments (e.g. unmatched M-Pesa) will appear here.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left" style={{ minWidth: 740 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Receipt No</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Student</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Method</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Amount</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Date</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((p, i) => (
                                        <tr key={p.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                            i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                        }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{p.receipt_number}</td>
                                            <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{p.first_name} {p.last_name}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500">{METHOD_LABELS[p.payment_method] || p.payment_method}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold font-mono text-slate-700 dark:text-slate-200">KSh {Number(p.amount).toLocaleString()}</td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{p.payment_date}</td>
                                            <td className="px-3 py-2 text-right">
                                                <button onClick={() => handleConfirm(p.payment_id)}
                                                    className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-800 transition-colors">
                                                    Confirm
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{payments.length} pending</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TransactionAuth;
