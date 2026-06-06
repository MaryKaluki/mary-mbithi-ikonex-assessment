import React, { useState, useEffect, useCallback, useRef } from 'react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const statusBadge = (status) => {
    const cls = status === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : status === 'Processed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-gray-400';
    return <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${cls}`}>{status}</span>;
};

const PayslipHistory = () => {
    const today = new Date();
    const [year,  setYear]  = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [data,  setData]  = useState({ payslips: [], summary: {} });
    const [loading,    setLoading]    = useState(true);
    const [viewingId,  setViewingId]  = useState(null);
    const [processing, setProcessing] = useState({});
    const [error, setError] = useState('');

    const YEARS = Array.from({ length: 6 }, (_, i) => today.getFullYear() - i);

    const fetchPayslips = useCallback(() => {
        setLoading(true); setError('');
        window.axios.get(`/api/hr/payslips?year=${year}&month=${month}`)
            .then(res => setData(res.data))
            .catch(() => setError('Failed to load payslip records.'))
            .finally(() => setLoading(false));
    }, [year, month]);

    useEffect(() => { fetchPayslips(); }, [fetchPayslips]);

    const markPaid = async (id) => {
        setProcessing(p => ({ ...p, [id]: true }));
        try {
            await window.axios.put(`/api/hr/payslips/${id}/mark-paid`);
            window.showToast?.('success', 'Payslip marked as Paid.');
            fetchPayslips();
        } catch (e) {
            setError(e?.response?.data?.error || 'Failed to update status.');
        } finally {
            setProcessing(p => ({ ...p, [id]: false }));
        }
    };

    const deletePayslip = async (id) => {
        if (!window.confirm('Delete this payslip? This cannot be undone.')) return;
        setProcessing(p => ({ ...p, [`del_${id}`]: true }));
        try {
            await window.axios.delete(`/api/hr/payslips/${id}`);
            window.showToast?.('success', 'Payslip deleted.');
            fetchPayslips();
        } catch (e) {
            setError(e?.response?.data?.error || 'Failed to delete payslip.');
        } finally {
            setProcessing(p => ({ ...p, [`del_${id}`]: false }));
        }
    };

    const fmt = v => `KES ${Number(v || 0).toLocaleString()}`;
    const s   = data.summary || {};
    const payslips = data.payslips || [];
    const inputCls = "px-3 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white";

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        HR <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Payslip History</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">
                        Payslip History
                        {!loading && payslips.length > 0 && <span className="ml-2 text-xs font-normal text-slate-400">— {payslips.length} payslips</span>}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <select value={month} onChange={e => setMonth(+e.target.value)} className={inputCls}>
                        {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                    <select value={year} onChange={e => setYear(+e.target.value)} className={inputCls}>
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md flex-shrink-0">{error}</p>}

            {/* Summary strip */}
            {!loading && payslips.length > 0 && (
                <div className="flex gap-2 flex-shrink-0 flex-wrap">
                    {[
                        { label: 'Staff Paid',   value: s.count || 0 },
                        { label: 'Total Gross',  value: fmt(s.total_gross) },
                        { label: 'Tax & Levies', value: fmt(s.total_deductions) },
                        { label: 'Net Payout',   value: fmt(s.total_net) },
                    ].map(card => (
                        <div key={card.label} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-md">
                            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{card.value}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{card.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Loading payslips…</div>
                ) : payslips.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <p className="text-slate-400 text-sm">No payslips for {MONTHS[month - 1]} {year}.</p>
                        <p className="text-slate-300 dark:text-slate-600 text-xs mt-1">Generate payslips from Payroll → Generate Payslips.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-left border-collapse" style={{ minWidth: 860 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Employee</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28 text-right">Basic</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28 text-right">Gross</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-red-400 w-24 text-right">PAYE</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-orange-400 w-24 text-right">NSSF</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-yellow-400 w-24 text-right">SHIF</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-amber-400 w-24 text-right">Housing</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-200 w-28 text-right">Net Pay</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Status</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payslips.map((p, i) => (
                                        <tr key={p.id}
                                            className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                                i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                            }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">
                                                {String(i + 1).padStart(2, '0')}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{p.name}</span>
                                                <span className="ml-2 text-[10px] text-slate-400">{p.role}</span>
                                            </td>
                                            <td className="px-3 py-2 text-right text-xs font-mono text-slate-500 dark:text-slate-400">{fmt(p.basic_salary)}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold text-slate-700 dark:text-slate-300">{fmt(p.gross_salary)}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold text-red-500">{fmt(p.paye)}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold text-orange-500">{fmt(p.nssf)}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold text-yellow-600">{fmt(p.shif)}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold text-amber-600">{fmt(p.housing_levy)}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold text-slate-800 dark:text-white">{fmt(p.net_salary)}</td>
                                            <td className="px-3 py-2 text-center">{statusBadge(p.status)}</td>
                                            <td className="px-3 py-2 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => setViewingId(p.id)}
                                                        className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">
                                                        View
                                                    </button>
                                                    {p.status === 'Processed' && (
                                                        <button onClick={() => markPaid(p.id)} disabled={processing[p.id]}
                                                            className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-800 disabled:opacity-50 transition-colors">
                                                            {processing[p.id] ? '…' : 'Paid'}
                                                        </button>
                                                    )}
                                                    {p.status !== 'Paid' && (
                                                        <button onClick={() => deletePayslip(p.id)} disabled={processing[`del_${p.id}`]}
                                                            className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors">
                                                            {processing[`del_${p.id}`] ? '…' : 'Del'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{payslips.length} payslip{payslips.length !== 1 ? 's' : ''} · {MONTHS[month - 1]} {year}</p>
                        </div>
                    </>
                )}
            </div>

            {viewingId && <PayslipViewerModal id={viewingId} onClose={() => setViewingId(null)}/>}
        </div>
    );
};

/* ── Payslip viewer modal — kept intact (print-optimised layout) ── */
const PayslipViewerModal = ({ id, onClose }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const printRef = useRef();

    useEffect(() => {
        window.axios.get(`/api/hr/payslips/${id}`)
            .then(res => setData(res.data))
            .finally(() => setLoading(false));
    }, [id]);

    const handlePrint = () => {
        const content = printRef.current.innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`<html><head><title>Payslip</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }</style>
            </head><body class="bg-white text-gray-900 p-8 font-sans">${content}
            <script>setTimeout(() => { window.print(); window.close(); }, 800);</script>
            </body></html>`);
        win.document.close();
    };

    const fmt = v => `KES ${Number(v || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
    const p   = data?.payslip  || {};
    const e   = data?.employee || {};

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex justify-center p-4 sm:p-6 overflow-y-auto" onClick={ev => ev.target === ev.currentTarget && onClose()}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl flex flex-col h-fit max-h-[95vh] my-auto overflow-hidden border border-slate-200 dark:border-gray-700">
                <div className="flex-shrink-0 flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-gray-900/50 border-b border-slate-200 dark:border-gray-800">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Payslip Document</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrint}
                            className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                            Print / Save PDF
                        </button>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                    </div>
                </div>
                <div className="overflow-y-auto flex-1 p-6 bg-gray-50 dark:bg-gray-900 min-h-[400px]">
                    {loading ? (
                        <div className="h-full flex items-center justify-center text-slate-400">Loading…</div>
                    ) : (
                        <div ref={printRef} className="max-w-3xl mx-auto bg-white p-8 md:p-12 shadow-sm rounded-lg border border-gray-200">
                            <div className="flex flex-col md:flex-row justify-between md:items-start border-b-[3px] border-indigo-950 pb-4 mb-6">
                                <div>
                                    <div className="text-2xl font-black text-indigo-950 uppercase tracking-tight">IKONEX SCHOOL SYSTEM</div>
                                    <div className="text-[10px] text-gray-500 font-bold tracking-[0.15em] uppercase mt-1">Official Payslip — Confidential</div>
                                </div>
                                <div className="mt-4 md:mt-0 text-left md:text-right">
                                    <div className="bg-indigo-950 text-white px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest inline-block">PAY PERIOD: {p.month_label}</div>
                                    <div className="mt-2 text-[10px] text-gray-500 font-bold tracking-widest uppercase">REF: PAY-{String(p.id || 0).padStart(6,'0')} | {p.status?.toUpperCase()}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">Employee Details</h3>
                                    <div className="space-y-1.5">
                                        {[['Full Name', e.name],['Role', e.role],['Department', e.department],['Designation', e.designation],['Date Joined', e.date_of_joining]].map(([k, v]) => (
                                            <div key={k} className="flex justify-between items-center text-xs">
                                                <span className="text-gray-500">{k}</span>
                                                <span className="font-bold text-gray-800">{v || '—'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">Statutory Registration</h3>
                                    <div className="space-y-1.5">
                                        {[['National ID', e.id_number],['KRA PIN', e.kra_pin],['NSSF No.', e.nssf_no],['SHIF No.', e.shif_no],['Bank', e.bank_name],['Account No.', e.account_number]].map(([k, v]) => (
                                            <div key={k} className="flex justify-between items-center text-xs">
                                                <span className="text-gray-500">{k}</span>
                                                <span className="font-bold text-gray-800">{v || '—'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-hidden rounded-lg border border-gray-200 mb-6">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-100 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-gray-500">Description</th>
                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-gray-500 text-right">Earnings (KES)</th>
                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-gray-500 text-right">Deductions (KES)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        {[
                                            { label: 'Basic Salary', earn: fmt(p.basic_salary), deduct: null },
                                            { label: 'Allowance',    earn: fmt(p.allowance),    deduct: null },
                                            { label: 'NSSF',         earn: null, deduct: fmt(p.nssf) },
                                            { label: 'SHIF',         earn: null, deduct: fmt(p.shif) },
                                            { label: 'Affordable Housing Levy (1.5%)', earn: null, deduct: fmt(p.housing_levy) },
                                            { label: 'PAYE',         earn: null, deduct: fmt(p.paye) },
                                            ...(p.other_deductions > 0 ? [{ label: 'Other Deductions', earn: null, deduct: fmt(p.other_deductions) }] : []),
                                        ].map(row => (
                                            <tr key={row.label}>
                                                <td className="px-4 py-3 text-gray-800 font-semibold">{row.label}</td>
                                                <td className="px-4 py-3 text-right font-black text-gray-800">{row.earn || '—'}</td>
                                                <td className={`px-4 py-3 text-right font-bold ${row.deduct ? 'text-red-500' : 'text-gray-400'}`}>{row.deduct || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-gray-50 border-t-2 border-gray-200 text-sm">
                                            <td className="px-4 py-3 font-black text-gray-800">TOTALS</td>
                                            <td className="px-4 py-3 text-right font-black text-gray-900">{fmt(p.gross_salary)}</td>
                                            <td className="px-4 py-3 text-right font-black text-red-600">{fmt(p.total_deductions)}</td>
                                        </tr>
                                        <tr className="bg-indigo-950 text-white">
                                            <td colSpan="2" className="px-4 py-4 font-black uppercase tracking-widest text-sm">NET PAY — {p.month_label}</td>
                                            <td className="px-4 py-4 text-right font-black text-green-400 text-lg">{fmt(p.net_salary)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between items-center border-t border-gray-200 pt-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                <span>Generated: {p.processed_at} by {p.generated_by}</span>
                                <span className="mt-2 sm:mt-0">Computer-generated payslip — no signature required.</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export { PayslipViewerModal };
export default PayslipHistory;
