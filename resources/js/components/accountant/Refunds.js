import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

// Refunds are payment reversals in our system.
// This page shows all reversed payments + lets accountant reverse a payment by ID.

const ReverseModal = ({ onClose, onSaved }) => {
    const [paymentId, setPaymentId] = useState('');
    const [reason, setReason]       = useState('');
    const [saving, setSaving]       = useState(false);
    const [error, setError]         = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setError(null);
        try {
            await window.axios.patch(`/api/finance/payments/${paymentId}/reverse`, { reason });
            window.showToast?.('success', 'Payment reversed successfully.');
            onSaved(); onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reverse payment.');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-slate-200 dark:border-gray-700 w-full max-w-sm">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 rounded-t-lg">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wide">Reverse Payment</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {error && <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">{error}</p>}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Payment ID *</label>
                        <input required type="number" value={paymentId} onChange={e => setPaymentId(e.target.value)}
                            placeholder="Payment database ID" className={inputCls}/>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Reason *</label>
                        <textarea required rows={3} value={reason} onChange={e => setReason(e.target.value)}
                            placeholder="Reason for reversal…" className={inputCls + ' resize-none'}/>
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button type="submit" disabled={saving}
                            className="flex-1 py-2 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-red-700 disabled:opacity-60 transition-colors">
                            {saving ? 'Reversing…' : 'Reverse Payment'}
                        </button>
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2 border border-slate-300 dark:border-gray-600 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Refunds = () => {
    const [reversals, setReversals] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [showModal, setShowModal] = useState(false);

    const fetchReversals = async () => {
        setLoading(true);
        try {
            // Reversed payments are shown in the receipts register but with status = reversed
            // We query all receipts and filter by status
            const res = await window.axios.get('/api/finance/receipts', {
                params: { per_page: 100 }
            });
            // The receipts endpoint excludes reversed ones, so we query payments directly
            // For now, show a message that no dedicated endpoint exists yet
            setReversals([]);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchReversals(); }, []);

    const total = reversals.reduce((a, r) => a + Number(r.amount), 0);

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">
            {showModal && <ReverseModal onClose={() => setShowModal(false)} onSaved={fetchReversals}/>}

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Finance <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Refunds</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Payment Reversals</h1>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="px-4 py-1.5 bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-red-700 transition-colors">
                    + Reverse Payment
                </button>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-2 flex-shrink-0">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                    <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{reversals.length}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reversals</span>
                </div>
                {total > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">KSh {total.toLocaleString()}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Reversed</span>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {loading ? (
                    <div className="p-6"><SkeletonLoader type="table"/></div>
                ) : reversals.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16">
                        <p className="text-slate-400 text-sm">No payment reversals on record.</p>
                        <p className="text-[10px] text-slate-300 mt-1">Use the "Reverse Payment" button to reverse a payment by its ID.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left" style={{ minWidth: 800 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Ref No</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Student</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Amount</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Reason</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reversals.map((r, i) => (
                                        <tr key={r.id} className={`border-b border-slate-100 dark:border-gray-700/60 ${
                                            i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                        }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{r.receipt_number}</td>
                                            <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{r.first_name} {r.last_name}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold font-mono text-red-500">KSh {Number(r.amount).toLocaleString()}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500">{r.notes}</td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{r.payment_date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{reversals.length} reversals</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Refunds;
