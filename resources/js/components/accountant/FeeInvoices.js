import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const inputCls = "px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";
const inputClsW = "w-full " + inputCls;

const STATUS_BADGE = {
    draft:     'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
    issued:    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    partial:   'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    paid:      'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    overpaid:  'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-400 dark:text-red-400',
};

const GenerateModal = ({ onClose, onSaved }) => {
    const [mode, setMode]   = useState('single');  // 'single' | 'bulk'
    const [form, setForm]   = useState({ student_id: '', grade_level: '', term: '', academic_year: new Date().getFullYear().toString() });
    const [saving, setSaving] = useState(false);
    const [error, setError]   = useState(null);
    const [result, setResult] = useState(null);

    const setField = (f, v) => setForm(p => ({ ...p, [f]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setError(null); setResult(null);
        try {
            if (mode === 'single') {
                await window.axios.post('/api/finance/invoices', {
                    student_id:    parseInt(form.student_id),
                    term:          parseInt(form.term),
                    academic_year: form.academic_year,
                });
                window.showToast?.('success', 'Invoice generated.');
                onSaved(); onClose();
            } else {
                const res = await window.axios.post('/api/finance/invoices/bulk-issue', {
                    grade_level:   form.grade_level,
                    term:          parseInt(form.term),
                    academic_year: form.academic_year,
                });
                setResult(res.data);
                onSaved();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate invoice.');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-slate-200 dark:border-gray-700 w-full max-w-md">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 rounded-t-lg">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wide">Generate Invoice</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {error && <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">{error}</p>}
                    {result && (
                        <div className="text-xs bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-md text-emerald-700 dark:text-emerald-300">
                            Issued: {result.issued} · Skipped: {result.skipped} · Errors: {result.errors?.length || 0}
                        </div>
                    )}

                    {/* Mode toggle */}
                    <div className="flex border border-slate-200 dark:border-gray-700 rounded-md overflow-hidden">
                        {[['single', 'Single Student'], ['bulk', 'Entire Grade']].map(([v, label]) => (
                            <button key={v} type="button" onClick={() => setMode(v)}
                                className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                                    mode === v ? 'bg-slate-800 text-white' : 'bg-white dark:bg-gray-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-gray-600'
                                }`}>
                                {label}
                            </button>
                        ))}
                    </div>

                    {mode === 'single' ? (
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Student ID *</label>
                            <input required type="number" value={form.student_id} onChange={e => setField('student_id', e.target.value)}
                                placeholder="Student database ID" className={inputClsW}/>
                            <p className="text-[10px] text-slate-400 mt-0.5">Use the student's numeric ID from the students table.</p>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Grade Level *</label>
                            <input required value={form.grade_level} onChange={e => setField('grade_level', e.target.value)}
                                placeholder="e.g. Form 1, Grade 4" className={inputClsW}/>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Term *</label>
                            <select required value={form.term} onChange={e => setField('term', e.target.value)} className={inputClsW}>
                                <option value="">Select…</option>
                                <option value="1">Term 1</option>
                                <option value="2">Term 2</option>
                                <option value="3">Term 3</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Year *</label>
                            <input required value={form.academic_year} onChange={e => setField('academic_year', e.target.value)}
                                placeholder="2026" className={inputClsW}/>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                        <button type="submit" disabled={saving}
                            className="flex-1 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">
                            {saving ? 'Generating…' : 'Generate'}
                        </button>
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2 border border-slate-300 dark:border-gray-600 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                            {result ? 'Close' : 'Cancel'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const FeeInvoices = () => {
    const [invoices, setInvoices]       = useState([]);
    const [meta, setMeta]               = useState({ total: 0 });
    const [loading, setLoading]         = useState(true);
    const [search, setSearch]           = useState('');
    const [statusFilter, setStatus]     = useState('');
    const [term, setTerm]               = useState('');
    const [year, setYear]               = useState(new Date().getFullYear().toString());
    const [showModal, setShowModal]     = useState(false);

    const fetchInvoices = async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, per_page: 50 };
            if (search)       params.search = search;
            if (statusFilter) params.status = statusFilter;
            if (term)         params.term   = term;
            if (year)         params.academic_year = year;
            const res = await window.axios.get('/api/finance/invoices', { params });
            setInvoices(res.data.data);
            setMeta(res.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchInvoices(); }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this invoice?')) return;
        try {
            await window.axios.patch(`/api/finance/invoices/${id}/cancel`, { reason: 'Cancelled by accountant' });
            setInvoices(p => p.map(inv => inv.id === id ? { ...inv, status: 'cancelled' } : inv));
            window.showToast?.('success', 'Invoice cancelled.');
        } catch (err) {
            window.showToast?.('error', err.response?.data?.message || 'Could not cancel.');
        }
    };

    const totalBalance = invoices.reduce((a, inv) => a + Number(inv.balance), 0);

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">
            {showModal && <GenerateModal onClose={() => setShowModal(false)} onSaved={() => fetchInvoices()}/>}

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Finance <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Fee Invoices</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Fee Invoices</h1>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                    + Generate Invoice
                </button>
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap gap-2 items-end flex-shrink-0">
                <div className="flex-1 min-w-40">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Search</label>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Student, adm no, invoice #…" className={inputCls + ' w-full'}/>
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Status</label>
                    <select value={statusFilter} onChange={e => setStatus(e.target.value)} className={inputCls}>
                        <option value="">All</option>
                        {Object.keys(STATUS_BADGE).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Term</label>
                    <select value={term} onChange={e => setTerm(e.target.value)} className={inputCls}>
                        <option value="">All</option>
                        <option value="1">Term 1</option>
                        <option value="2">Term 2</option>
                        <option value="3">Term 3</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Year</label>
                    <input value={year} onChange={e => setYear(e.target.value)} placeholder="2026" className={inputCls} style={{ width: 80 }}/>
                </div>
                <button onClick={() => fetchInvoices(1)}
                    className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                    Filter
                </button>
            </div>

            {/* Stats strip */}
            {!loading && (
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{meta.total}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Invoices</span>
                    </div>
                    {totalBalance > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                            <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">KSh {totalBalance.toLocaleString()}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Outstanding (Page)</span>
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {loading ? (
                    <div className="p-6"><SkeletonLoader type="table"/></div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left" style={{ minWidth: 940 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-32">Invoice #</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Student</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20">Adm No</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20">Term</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Total</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Paid</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Balance</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Status</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((inv, i) => (
                                        <tr key={inv.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                            i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                        }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{inv.invoice_number}</td>
                                            <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{inv.first_name} {inv.last_name}</td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{inv.admission_number}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500">T{inv.term} {inv.academic_year}</td>
                                            <td className="px-3 py-2 text-right text-xs font-mono text-slate-600 dark:text-slate-300">KSh {Number(inv.total_charged).toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold font-mono text-emerald-600">KSh {Number(inv.total_paid).toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold font-mono text-red-500">
                                                {Number(inv.balance) > 0 ? `KSh ${Number(inv.balance).toLocaleString()}` : '—'}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${STATUS_BADGE[inv.status] || STATUS_BADGE.draft}`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <button className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">View</button>
                                                    {inv.status !== 'cancelled' && inv.status !== 'paid' && (
                                                        <button onClick={() => handleCancel(inv.id)}
                                                            className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors">Cancel</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {invoices.length === 0 && (
                                <div className="py-12 text-center text-xs text-slate-400 italic">No invoices match your filter.</div>
                            )}
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{meta.total} invoice{meta.total !== 1 ? 's' : ''}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FeeInvoices;
