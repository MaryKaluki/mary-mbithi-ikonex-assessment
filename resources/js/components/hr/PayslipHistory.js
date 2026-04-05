import React, { useState, useEffect, useCallback, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// PayslipHistory — Payroll run list with generate action + mark-paid buttons
// Route: /hr/payroll/history
// ─────────────────────────────────────────────────────────────────────────────
const PayslipHistory = () => {
    const today = new Date();
    const [year,  setYear]  = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [data,  setData]  = useState({ payslips: [], summary: {} });
    const [loading, setLoading] = useState(true);
    const [viewingId, setViewingId]  = useState(null);
    const [processing, setProcessing] = useState({});
    const [error, setError] = useState('');

    const months = [
        'January','February','March','April','May','June',
        'July','August','September','October','November','December',
    ];
    const years = Array.from({ length: 6 }, (_, i) => today.getFullYear() - i);

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

    const fmt  = v => `KES ${Number(v || 0).toLocaleString()}`;
    const s    = data.summary || {};

    const statusPill = (status) => {
        const styles = {
            Paid:      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            Processed: 'bg-blue-100  text-blue-700  dark:bg-blue-900/30  dark:text-blue-400',
            Draft:     'bg-gray-100  text-gray-600  dark:bg-gray-700     dark:text-gray-400',
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${styles[status] || styles.Draft}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-6 animate-page-fade">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">Payslip History</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View, manage, and mark payslips as paid.</p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={month} onChange={e => setMonth(+e.target.value)}
                        className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
                        {months.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                    </select>
                    <select value={year} onChange={e => setYear(+e.target.value)}
                        className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-bold dark:bg-red-900/20 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* Summary Strip */}
            {!loading && (data.payslips || []).length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Staff Paid',   value: s.count || 0,                   mono: true },
                        { label: 'Total Gross',  value: fmt(s.total_gross),              mono: false },
                        { label: 'Tax & Levies', value: fmt(s.total_deductions),         mono: false },
                        { label: 'Net Payout',   value: fmt(s.total_net), highlight: true },
                    ].map(card => (
                        <div key={card.label} className={`rounded-2xl p-5 border ${card.highlight ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700'}`}>
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${card.highlight ? 'text-purple-200' : 'text-gray-400'}`}>{card.label}</p>
                            <p className={`text-2xl font-black ${card.highlight ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>{card.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                {loading ? (
                    <div className="py-20 flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading...</p>
                    </div>
                ) : (data.payslips || []).length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-gray-400 font-bold uppercase text-sm tracking-widest">No payslips found for {months[month-1]} {year}</p>
                        <p className="text-gray-300 text-xs mt-2 dark:text-gray-600">Generate payslips from Payroll → Generate Payslips</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[900px]">
                            <thead className="bg-gray-50/50 dark:bg-gray-700/50">
                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4 text-right">Basic</th>
                                    <th className="px-6 py-4 text-right">Gross</th>
                                    <th className="px-6 py-4 text-right">PAYE</th>
                                    <th className="px-6 py-4 text-right">NSSF</th>
                                    <th className="px-6 py-4 text-right">SHIF</th>
                                    <th className="px-6 py-4 text-right">Housing</th>
                                    <th className="px-6 py-4 text-right font-black text-gray-600 dark:text-gray-300">Net Pay</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {(data.payslips || []).map(p => (
                                    <tr key={p.id} className="group hover:bg-purple-50/20 dark:hover:bg-purple-900/10 transition-colors">
                                        <td className="px-6 py-5">
                                            <p className="font-black text-sm text-gray-800 dark:text-white uppercase tracking-tight">{p.name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{p.role}</p>
                                        </td>
                                        <td className="px-6 py-5 text-right text-sm font-bold text-gray-600 dark:text-gray-400">{fmt(p.basic_salary)}</td>
                                        <td className="px-6 py-5 text-right text-sm font-bold text-gray-700 dark:text-gray-300">{fmt(p.gross_salary)}</td>
                                        <td className="px-6 py-5 text-right text-sm text-red-500 font-bold">{fmt(p.paye)}</td>
                                        <td className="px-6 py-5 text-right text-sm text-orange-500 font-bold">{fmt(p.nssf)}</td>
                                        <td className="px-6 py-5 text-right text-sm text-yellow-600 font-bold">{fmt(p.shif)}</td>
                                        <td className="px-6 py-5 text-right text-sm text-amber-600 font-bold">{fmt(p.housing_levy)}</td>
                                        <td className="px-6 py-5 text-right font-black text-gray-900 dark:text-white">{fmt(p.net_salary)}</td>
                                        <td className="px-6 py-5 text-center">{statusPill(p.status)}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => setViewingId(p.id)}
                                                    className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all dark:bg-gray-700 dark:text-gray-400">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </button>
                                                {p.status === 'Processed' && (
                                                    <button onClick={() => markPaid(p.id)} disabled={processing[p.id]}
                                                        className="px-3 py-1.5 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-green-600 hover:text-white transition-all dark:bg-green-900/20 dark:text-green-400 disabled:opacity-50">
                                                        {processing[p.id] ? '...' : 'Mark Paid'}
                                                    </button>
                                                )}
                                                {p.status !== 'Paid' && (
                                                    <button onClick={() => deletePayslip(p.id)} disabled={processing[`del_${p.id}`]}
                                                        className="w-8 h-8 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all dark:bg-red-900/20 disabled:opacity-50">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* PayslipViewer Modal */}
            {viewingId && (
                <PayslipViewerModal id={viewingId} onClose={() => setViewingId(null)} />
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// PayslipViewerModal — triggered from PayslipHistory row
// ─────────────────────────────────────────────────────────────────────────────
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
        win.document.write(`
            <html><head><title>Payslip</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
            </style>
            </head>
            <body class="bg-white text-gray-900 p-8 font-sans">
                ${content}
                <script>
                    // Wait for Tailwind to process classes before printing
                    setTimeout(() => { window.print(); window.close(); }, 800);
                </script>
            </body></html>
        `);
        win.document.close();
    };

    const fmt = v => `KES ${Number(v || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
    const p   = data?.payslip   || {};
    const e   = data?.employee  || {};

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center p-4 sm:p-6 overflow-y-auto" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col h-fit max-h-[95vh] my-auto overflow-hidden border border-gray-100 dark:border-gray-700">
                {/* Modal header (Fixed at top) */}
                <div className="flex-shrink-0 flex items-center justify-between px-6 md:px-8 py-5 border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900 z-10">
                    <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tight">Payslip Document</h3>
                    <div className="flex items-center gap-3">
                        <button onClick={handlePrint}
                            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 dark:shadow-none">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Print / Save
                        </button>
                        <button onClick={onClose} className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                {/* Printable content wrapper (Scrolls) */}
                <div className="overflow-y-auto flex-1 p-4 md:p-8 bg-gray-100/50 dark:bg-gray-900 min-h-[400px]">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div ref={printRef} className="max-w-3xl mx-auto bg-white p-8 md:p-12 shadow-sm rounded-xl border border-gray-200 print:border-none print:shadow-none">
                            
                            {/* ── Printable Header ── */}
                            <div className="flex flex-col md:flex-row justify-between md:items-start border-b-[3px] border-indigo-950 pb-4 mb-6">
                                <div>
                                    <div className="text-2xl font-black text-indigo-950 uppercase tracking-tight">SKULLU SCHOOL SYSTEM</div>
                                    <div className="text-[10px] text-gray-500 font-bold tracking-[0.15em] uppercase mt-1">Official Payslip — Confidential</div>
                                </div>
                                <div className="mt-4 md:mt-0 text-left md:text-right">
                                    <div className="bg-indigo-950 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block">
                                        PAY PERIOD: {p.month_label}
                                    </div>
                                    <div className="mt-2 text-[10px] text-gray-500 font-bold tracking-widest uppercase">
                                        REF: PAY-{String(p.id).padStart(6,'0')} | {p.status?.toUpperCase()}
                                    </div>
                                </div>
                            </div>

                            {/* ── Employee + Statutory Info ── */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">Employee Details</h3>
                                    <div className="space-y-1.5">
                                        {[
                                            ['Full Name',    e.name],
                                            ['Role',         e.role],
                                            ['Department',   e.department],
                                            ['Designation',  e.designation],
                                            ['Date Joined',  e.date_of_joining],
                                        ].map(([k, v]) => (
                                            <div key={k} className="flex justify-between items-center text-xs">
                                                <span className="text-gray-500">{k}</span>
                                                <span className="font-bold text-gray-800">{v || '—'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">Statutory Registration</h3>
                                    <div className="space-y-1.5">
                                        {[
                                            ['National ID',    e.id_number],
                                            ['KRA PIN',        e.kra_pin],
                                            ['NSSF No.',       e.nssf_no],
                                            ['SHIF No.',       e.shif_no],
                                            ['Bank',           e.bank_name],
                                            ['Account No.',    e.account_number],
                                        ].map(([k, v]) => (
                                            <div key={k} className="flex justify-between items-center text-xs">
                                                <span className="text-gray-500">{k}</span>
                                                <span className="font-bold text-gray-800">{v || '—'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* ── Earnings & Deductions Table ── */}
                            <div className="overflow-x-auto overflow-hidden rounded-xl border border-gray-200 mb-6">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-100 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-gray-500">Description</th>
                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-gray-500 text-right">Earnings (KES)</th>
                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-gray-500 text-right">Deductions (KES)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        <tr>
                                            <td className="px-4 py-3 text-gray-800 font-semibold">Basic Salary</td>
                                            <td className="px-4 py-3 text-right font-black text-gray-800">{fmt(p.basic_salary)}</td>
                                            <td className="px-4 py-3 text-right text-gray-400">—</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 text-gray-800 font-semibold">Allowance</td>
                                            <td className="px-4 py-3 text-right font-black text-gray-800">{fmt(p.allowance)}</td>
                                            <td className="px-4 py-3 text-right text-gray-400">—</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 text-gray-600">NSSF (National Social Security Fund)</td>
                                            <td className="px-4 py-3 text-right text-gray-400">—</td>
                                            <td className="px-4 py-3 text-right font-bold text-red-500">{fmt(p.nssf)}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 text-gray-600">SHIF (Social Health Insurance Fund)</td>
                                            <td className="px-4 py-3 text-right text-gray-400">—</td>
                                            <td className="px-4 py-3 text-right font-bold text-red-500">{fmt(p.shif)}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 text-gray-600">Affordable Housing Levy (1.5%)</td>
                                            <td className="px-4 py-3 text-right text-gray-400">—</td>
                                            <td className="px-4 py-3 text-right font-bold text-red-500">{fmt(p.housing_levy)}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 text-gray-600">PAYE (Pay-As-You-Earn Tax)</td>
                                            <td className="px-4 py-3 text-right text-gray-400">—</td>
                                            <td className="px-4 py-3 text-right font-bold text-red-500">{fmt(p.paye)}</td>
                                        </tr>
                                        {p.other_deductions > 0 && (
                                            <tr>
                                                <td className="px-4 py-3 text-gray-600">Other Deductions</td>
                                                <td className="px-4 py-3 text-right text-gray-400">—</td>
                                                <td className="px-4 py-3 text-right font-bold text-red-500">{fmt(p.other_deductions)}</td>
                                            </tr>
                                        )}
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

                            {/* ── Footer ── */}
                            <div className="flex flex-col sm:flex-row justify-between items-center border-t border-gray-200 pt-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-8">
                                <span>Generated: {p.processed_at} by {p.generated_by}</span>
                                <span className="mt-2 sm:mt-0">This is a computer-generated payslip and requires no signature.</span>
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
