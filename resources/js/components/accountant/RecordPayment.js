import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const METHOD_LABELS = {
    cash: 'Cash', mpesa: 'M-Pesa', bank_transfer: 'Bank Transfer',
    cheque: 'Cheque', standing_order: 'Standing Order', card: 'Card',
};

const RecordPayment = () => {
    const [query, setQuery]     = useState('');
    const [suggestions, setSug] = useState([]);
    const [selected, setSelected] = useState(null);   // student
    const [invoices, setInvoices] = useState([]);
    const [invoiceId, setInvoiceId] = useState('');
    const [amount, setAmount]   = useState('');
    const [method, setMethod]   = useState('cash');
    const [reference, setReference] = useState('');
    const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
    const [saving, setSaving]   = useState(false);
    const [recentPayments, setRecentPayments] = useState([]);
    const [loadingRecent, setLoadingRecent]   = useState(true);

    // Fetch today's payments
    const fetchRecent = async () => {
        setLoadingRecent(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const res = await window.axios.get('/api/finance/receipts', {
                params: { from: today, to: today, per_page: 20 }
            });
            setRecentPayments(res.data.data || []);
        } catch { /* silent */ }
        finally { setLoadingRecent(false); }
    };

    useEffect(() => { fetchRecent(); }, []);

    // Student search
    useEffect(() => {
        if (query.length < 2) { setSug([]); return; }
        const timer = setTimeout(async () => {
            try {
                const res = await window.axios.get('/api/students', { params: { search: query, per_page: 8 } });
                setSug(res.data.data || res.data || []);
            } catch { setSug([]); }
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    // Load student's open invoices when selected
    const selectStudent = async (student) => {
        setSelected(student);
        setQuery('');
        setSug([]);
        setInvoiceId('');
        try {
            const res = await window.axios.get('/api/finance/invoices', {
                params: { student_id: student.id, status: 'partial,issued', per_page: 10 }
            });
            const open = (res.data.data || []).filter(inv => ['issued', 'partial'].includes(inv.status));
            setInvoices(open);
            if (open.length === 1) {
                setInvoiceId(open[0].id);
                setAmount(open[0].balance);
            }
        } catch { setInvoices([]); }
    };

    const handleRecord = async () => {
        if (!selected || !amount || !method || !invoiceId) {
            window.showToast?.('error', 'Select a student, invoice, amount and method.');
            return;
        }
        setSaving(true);
        try {
            const meta = {};
            if (method === 'mpesa')         meta.mpesa_code = reference;
            if (method === 'bank_transfer') meta.bank_ref = reference;
            if (method === 'cheque')        meta.cheque_number = reference;
            meta.payment_date = payDate;

            await window.axios.post('/api/finance/payments', {
                invoice_id:     parseInt(invoiceId),
                amount:         parseInt(amount),
                payment_method: method,
                ...meta,
            });

            window.showToast?.('success', `Payment of KSh ${parseInt(amount).toLocaleString()} recorded.`);
            setSelected(null); setQuery(''); setInvoices([]); setInvoiceId('');
            setAmount(''); setReference('');
            fetchRecent();
        } catch (err) {
            window.showToast?.('error', err.response?.data?.message || 'Failed to record payment.');
        } finally { setSaving(false); }
    };

    // Which reference field label to show
    const refLabel = { mpesa: 'M-Pesa Code', bank_transfer: 'Bank Ref', cheque: 'Cheque No' }[method] || 'Reference';
    const showRef  = ['mpesa', 'bank_transfer', 'cheque'].includes(method);

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex-shrink-0">
                <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                    Finance <span className="mx-1">/</span>
                    <span className="text-slate-600 dark:text-slate-300 font-semibold">Record Payment</span>
                </nav>
                <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Record Payment</h1>
            </div>

            <div className="flex gap-3 flex-1 min-h-0">

                {/* Payment Form */}
                <div className="w-80 flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col">
                    <div className="flex-shrink-0 px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700 rounded-t-lg">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">New Payment</span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto">

                        {/* Student search */}
                        <div className="relative">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Search Student</label>
                            <input value={query} onChange={e => { setQuery(e.target.value); setSelected(null); }}
                                placeholder="Name or admission no…" className={inputCls}/>
                            {suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-md mt-1 shadow-lg z-20">
                                    {suggestions.map(s => (
                                        <div key={s.id} onClick={() => selectStudent(s)}
                                            className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-gray-600 cursor-pointer">
                                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{s.first_name} {s.last_name}</p>
                                            <p className="text-[10px] text-slate-400">{s.admission_number} — {s.grade_level}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected student card */}
                        {selected && (
                            <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{selected.first_name} {selected.last_name}</p>
                                <p className="text-[10px] text-slate-400">{selected.admission_number} — {selected.grade_level}</p>
                            </div>
                        )}

                        {/* Invoice selector */}
                        {invoices.length > 0 && (
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Invoice *</label>
                                <select value={invoiceId} onChange={e => {
                                    setInvoiceId(e.target.value);
                                    const inv = invoices.find(i => i.id == e.target.value);
                                    if (inv) setAmount(inv.balance);
                                }} className={inputCls}>
                                    <option value="">Select invoice…</option>
                                    {invoices.map(inv => (
                                        <option key={inv.id} value={inv.id}>
                                            {inv.invoice_number} — Bal: KSh {Number(inv.balance).toLocaleString()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Amount (KSh) *</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" min="1" className={inputCls}/>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Payment Method *</label>
                            <select value={method} onChange={e => setMethod(e.target.value)} className={inputCls}>
                                {Object.entries(METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>

                        {showRef && (
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{refLabel}</label>
                                <input value={reference} onChange={e => setReference(e.target.value)}
                                    placeholder={method === 'mpesa' ? 'e.g. QDX4KLMNOP' : 'Reference'}
                                    className={inputCls + ' font-mono'}/>
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Payment Date</label>
                            <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} className={inputCls}/>
                        </div>

                        <button onClick={handleRecord} disabled={saving || !selected || !invoiceId || !amount}
                            className="mt-auto px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">
                            {saving ? 'Recording…' : 'Record Payment'}
                        </button>
                    </div>
                </div>

                {/* Recent Payments Today */}
                <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col min-h-0">
                    <div className="flex-shrink-0 px-4 py-2.5 bg-slate-800 dark:bg-slate-900 rounded-t-lg">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Recent Payments Today</span>
                    </div>
                    {loadingRecent ? (
                        <div className="p-6"><SkeletonLoader type="table"/></div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-auto">
                                <table className="w-full text-left" style={{ minWidth: 480 }}>
                                    <thead className="sticky top-0 z-10">
                                        <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Receipt</th>
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Student</th>
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Method</th>
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentPayments.map((p, i) => (
                                            <tr key={p.id} className={`border-b border-slate-100 dark:border-gray-700/60 ${
                                                i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                            }`}>
                                                <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                                <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{p.receipt_number}</td>
                                                <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{p.first_name} {p.last_name}</td>
                                                <td className="px-3 py-2 text-xs text-slate-500">{METHOD_LABELS[p.payment_method] || p.payment_method}</td>
                                                <td className="px-3 py-2 text-right text-xs font-bold font-mono text-emerald-600">
                                                    +KSh {Number(p.amount).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {recentPayments.length === 0 && (
                                    <div className="py-12 text-center text-xs text-slate-400 italic">No payments recorded today.</div>
                                )}
                            </div>
                            <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{recentPayments.length} payments today</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecordPayment;
