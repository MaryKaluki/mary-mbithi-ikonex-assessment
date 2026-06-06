import React, { useState, useEffect, useCallback } from 'react';
import { SkeletonLoader } from '../common/Loader';

const statusBadge = (r) => {
    if (r.fully_cleared)    return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
    if (r.fee_cleared && r.library_cleared) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    if (r.fee_cleared || r.library_cleared) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
};

const statusLabel = (r) => {
    if (r.exam_card_issued) return 'Exam Card Issued';
    if (r.fully_cleared)    return 'Cleared';
    if (r.fee_cleared && r.library_cleared && r.dorm_cleared) return 'Ready';
    if (r.fee_cleared || r.library_cleared || r.dorm_cleared) return 'Partial';
    return 'Pending';
};

const CheckIcon = ({ ok }) => (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
        ok ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-gray-600 text-slate-400'
    }`}>
        {ok ? '✓' : '✗'}
    </span>
);

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const Clearance = () => {
    const [records, setRecords]   = useState([]);
    const [summary, setSummary]   = useState({});
    const [loading, setLoading]   = useState(true);
    const [selected, setSelected] = useState(null);
    const [detail, setDetail]     = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // Filters
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [term, setTerm] = useState('1');
    const [status, setStatus] = useState('');

    // Initialize modal
    const [showInit, setShowInit] = useState(false);
    const [initForm, setInitForm] = useState({ grade_level: '', class_id: '', clearance_threshold: '' });
    const [initLoading, setInitLoading] = useState(false);
    const [initResult, setInitResult]   = useState(null);

    // Sign-off in progress
    const [signing, setSigning] = useState(null); // 'fee' | 'library' | 'dorm' | 'exam'

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        setSelected(null);
        setDetail(null);
        try {
            const res = await window.axios.get('/api/finance/clearance', {
                params: { academic_year: year, term, status: status || undefined }
            });
            setRecords(res.data.data || []);
            setSummary(res.data.summary || {});
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, [year, term, status]);

    useEffect(() => { fetchRecords(); }, [fetchRecords]);

    const fetchDetail = async (id) => {
        setDetailLoading(true);
        try {
            const res = await window.axios.get(`/api/finance/clearance/${id}`);
            setDetail(res.data);
        } catch { /* silent */ }
        finally { setDetailLoading(false); }
    };

    const handleSelect = (r) => {
        setSelected(r);
        fetchDetail(r.id);
    };

    const handleSignOff = async (dept) => {
        if (!detail) return;
        setSigning(dept);
        try {
            const url = dept === 'exam'
                ? `/api/finance/clearance/${detail.id}/exam-card`
                : `/api/finance/clearance/${detail.id}/${dept}`;
            const method = dept === 'exam' ? 'post' : 'patch';
            const payload = dept === 'exam' ? {} : { cleared: true };
            await window.axios[method](url, payload);
            window.showToast?.('success', dept === 'exam' ? 'Exam card issued!' : `${dept} clearance signed off.`);
            fetchDetail(detail.id);
            fetchRecords();
        } catch (err) {
            const msg = err.response?.data?.message || `Failed to sign off ${dept}.`;
            const blockers = err.response?.data?.blockers;
            window.showToast?.('error', blockers ? blockers.join(' ') : msg);
        } finally { setSigning(null); }
    };

    const handleRevoke = async (dept) => {
        if (!detail) return;
        setSigning(dept + '_revoke');
        try {
            await window.axios.patch(`/api/finance/clearance/${detail.id}/${dept}`, { cleared: false });
            window.showToast?.('success', `${dept} clearance revoked.`);
            fetchDetail(detail.id);
            fetchRecords();
        } catch (err) {
            window.showToast?.('error', err.response?.data?.message || 'Failed.');
        } finally { setSigning(null); }
    };

    const handleInitialize = async (e) => {
        e.preventDefault();
        setInitLoading(true);
        setInitResult(null);
        try {
            const res = await window.axios.post('/api/finance/clearance/initialize', {
                academic_year: year,
                term,
                grade_level: initForm.grade_level || undefined,
                class_id: initForm.class_id ? parseInt(initForm.class_id) : undefined,
                clearance_threshold: initForm.clearance_threshold ? parseInt(initForm.clearance_threshold) * 100 : 0,
            });
            setInitResult(res.data);
            fetchRecords();
        } catch (err) {
            window.showToast?.('error', err.response?.data?.message || 'Failed to initialize.');
        } finally { setInitLoading(false); }
    };

    const depts = [
        { key: 'fee',     label: 'Finance', icon: '💰', ok: detail?.fee_cleared,     at: detail?.fee_cleared_at },
        { key: 'library', label: 'Library', icon: '📚', ok: detail?.library_cleared, at: detail?.library_cleared_at },
        { key: 'dorm',    label: 'Dorm',    icon: '🏠', ok: detail?.dorm_cleared,    at: detail?.dorm_cleared_at },
    ];

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Finance <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">End-of-Term Clearance</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Student Clearance</h1>
                </div>
                <div className="flex items-center gap-2">
                    <select value={year} onChange={e => setYear(e.target.value)}
                        className="px-3 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {[2027, 2026, 2025].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select value={term} onChange={e => setTerm(e.target.value)}
                        className="px-3 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="1">Term 1</option>
                        <option value="2">Term 2</option>
                        <option value="3">Term 3</option>
                    </select>
                    <select value={status} onChange={e => setStatus(e.target.value)}
                        className="px-3 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All Statuses</option>
                        <option value="cleared">Cleared</option>
                        <option value="partial">Partial</option>
                        <option value="pending">Pending</option>
                    </select>
                    <button onClick={() => setShowInit(true)}
                        className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                        Initialize Term
                    </button>
                </div>
            </div>

            {/* KPI strip */}
            {!loading && (
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                    {[
                        { label: 'Total Students', value: summary.total ?? records.length, cls: 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800' },
                        { label: 'Fully Cleared',  value: summary.fully_cleared ?? 0,      cls: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' },
                        { label: 'Exam Cards Out', value: summary.exam_cards_out ?? 0,     cls: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' },
                        { label: 'Fee Cleared',    value: summary.fee_cleared ?? 0,        cls: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20' },
                    ].map(c => (
                        <div key={c.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${c.cls}`}>
                            <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{c.value}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{c.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Main panel */}
            <div className="flex-1 flex gap-3 min-h-0">

                {/* Student list */}
                <div className="w-80 flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">
                    <div className="flex-shrink-0 px-4 py-2.5 bg-slate-800 dark:bg-slate-900 rounded-t-lg">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                            Students — {year} Term {term}
                        </span>
                    </div>
                    {loading ? (
                        <div className="p-4"><SkeletonLoader type="list" /></div>
                    ) : records.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-10 text-center px-4">
                            <p className="text-slate-400 text-sm">No clearance records found.</p>
                            <p className="text-[10px] text-slate-300 mt-1">Click "Initialize Term" to create records for a class.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-auto">
                            {records.map(r => (
                                <button key={r.id} onClick={() => handleSelect(r)}
                                    className={`w-full text-left px-4 py-2.5 border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                        selected?.id === r.id ? 'bg-blue-50 dark:bg-blue-900/15 border-l-2 border-l-blue-500' : ''
                                    }`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                                                {r.first_name} {r.last_name}
                                            </p>
                                            <p className="text-[10px] text-slate-400">{r.admission_number} · {r.class_name || r.grade_level}</p>
                                        </div>
                                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${statusBadge(r)}`}>
                                            {statusLabel(r)}
                                        </span>
                                    </div>
                                    {/* Mini clearance dots */}
                                    <div className="flex gap-1 mt-1">
                                        {['fee', 'library', 'dorm'].map(d => (
                                            <span key={d} title={d}
                                                className={`inline-block w-2 h-2 rounded-full ${r[`${d}_cleared`] ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-gray-600'}`} />
                                        ))}
                                        {r.exam_card_issued && <span className="text-[9px] text-blue-500 font-bold ml-1">🎟</span>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail panel */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">
                    {!detail && !detailLoading ? (
                        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                            Select a student to view clearance details
                        </div>
                    ) : detailLoading ? (
                        <div className="p-6"><SkeletonLoader type="table" /></div>
                    ) : (
                        <>
                            {/* Student header */}
                            <div className="flex-shrink-0 px-6 py-4 bg-slate-800 dark:bg-slate-900 rounded-t-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-base font-bold text-white">
                                            {detail.first_name} {detail.last_name}
                                        </p>
                                        <p className="text-[11px] text-slate-400">
                                            {detail.admission_number} · {detail.class_name || detail.grade_level} · Term {detail.term} {detail.academic_year}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Current Balance</p>
                                        <p className={`text-lg font-extrabold font-mono ${
                                            (detail.current_balance ?? 0) > 0 ? 'text-red-400' : 'text-emerald-400'
                                        }`}>
                                            KES {((detail.current_balance ?? 0) / 100).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                                        </p>
                                        <p className="text-[9px] text-slate-500">
                                            Threshold: KES {((detail.clearance_threshold ?? 0) / 100).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto p-6 space-y-6">

                                {/* Department sign-offs */}
                                <div>
                                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Department Clearances</h2>
                                    <div className="grid grid-cols-3 gap-3">
                                        {depts.map(d => (
                                            <div key={d.key} className={`rounded-lg border p-4 text-center ${
                                                d.ok
                                                    ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20'
                                                    : 'border-slate-200 bg-slate-50 dark:border-gray-600 dark:bg-gray-900/30'
                                            }`}>
                                                <div className="text-2xl mb-1">{d.icon}</div>
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{d.label}</p>
                                                <div className="flex justify-center my-2">
                                                    <CheckIcon ok={d.ok} />
                                                </div>
                                                {d.ok ? (
                                                    <>
                                                        <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">CLEARED</p>
                                                        {d.at && <p className="text-[8px] text-slate-400 mt-0.5">{new Date(d.at).toLocaleDateString()}</p>}
                                                        {!detail.exam_card_issued && (
                                                            <button onClick={() => handleRevoke(d.key)}
                                                                disabled={signing === d.key + '_revoke'}
                                                                className="mt-2 text-[9px] text-red-500 hover:underline">
                                                                Revoke
                                                            </button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <button onClick={() => handleSignOff(d.key)}
                                                        disabled={!!signing || detail.exam_card_issued}
                                                        className="mt-2 px-3 py-1 bg-primary text-white text-[10px] font-bold rounded hover:bg-primary/90 disabled:opacity-50 transition-colors">
                                                        {signing === d.key ? 'Signing…' : 'Sign Off'}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Exam card */}
                                <div className={`rounded-lg border p-4 ${
                                    detail.exam_card_issued
                                        ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                                        : 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800'
                                }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">🎟</span>
                                            <div>
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Exam Card</p>
                                                {detail.exam_card_issued ? (
                                                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                                                        Issued on {detail.exam_card_issued_at ? new Date(detail.exam_card_issued_at).toLocaleDateString() : '—'}
                                                    </p>
                                                ) : (
                                                    <p className="text-[10px] text-slate-400">
                                                        Requires: fee + library{' '}
                                                        {detail.dorm_cleared !== null ? '+ dorm ' : ''}
                                                        clearance, balance ≤ KES {((detail.clearance_threshold ?? 0) / 100).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {!detail.exam_card_issued && (
                                            <button onClick={() => handleSignOff('exam')}
                                                disabled={!!signing || !detail.fee_cleared || !detail.library_cleared}
                                                className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors">
                                                {signing === 'exam' ? 'Issuing…' : 'Issue Exam Card'}
                                            </button>
                                        )}
                                        {detail.exam_card_issued && (
                                            <span className="inline-block px-3 py-1 rounded-full bg-blue-200 text-blue-800 text-[10px] font-bold uppercase">✓ Issued</span>
                                        )}
                                    </div>
                                </div>

                                {/* Invoices */}
                                {detail.invoices?.length > 0 && (
                                    <div>
                                        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Invoices — Term {detail.term}</h2>
                                        <div className="overflow-auto rounded-lg border border-slate-200 dark:border-gray-700">
                                            <table className="w-full text-left text-xs">
                                                <thead>
                                                    <tr className="bg-slate-800 text-white">
                                                        <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-300">Invoice</th>
                                                        <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-300 text-right">Charged</th>
                                                        <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-300 text-right">Paid</th>
                                                        <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-300 text-right">Balance</th>
                                                        <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-300">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {detail.invoices.map(inv => (
                                                        <tr key={inv.invoice_number} className="border-b border-slate-100 dark:border-gray-700/60">
                                                            <td className="px-3 py-2 font-mono text-[11px]">{inv.invoice_number}</td>
                                                            <td className="px-3 py-2 text-right font-mono">{((inv.total_charged ?? 0) / 100).toLocaleString()}</td>
                                                            <td className="px-3 py-2 text-right font-mono text-emerald-600">{((inv.total_paid ?? 0) / 100).toLocaleString()}</td>
                                                            <td className="px-3 py-2 text-right font-mono text-red-500 font-bold">{((inv.balance ?? 0) / 100).toLocaleString()}</td>
                                                            <td className="px-3 py-2">
                                                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300">
                                                                    {inv.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Initialize Term Modal */}
            {showInit && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-800 dark:text-gray-100">Initialize Clearance — {year} Term {term}</h2>
                            <button onClick={() => { setShowInit(false); setInitResult(null); }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold">✕</button>
                        </div>
                        {initResult ? (
                            <div className="p-6 text-center">
                                <div className="text-4xl mb-3">✅</div>
                                <p className="font-bold text-slate-800 dark:text-gray-100">{initResult.message}</p>
                                <p className="text-xs text-slate-400 mt-2">
                                    Created: {initResult.created} · Already existed: {initResult.already_existed}
                                </p>
                                <button onClick={() => { setShowInit(false); setInitResult(null); }}
                                    className="mt-4 px-6 py-2 bg-primary text-white font-bold text-sm rounded-md hover:bg-primary/90">Done</button>
                            </div>
                        ) : (
                            <form onSubmit={handleInitialize} className="p-6 space-y-4">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Creates a clearance record for every active student in the specified class/grade.
                                    Students already with a record for this term are skipped.
                                </p>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Grade Level</label>
                                    <input value={initForm.grade_level} onChange={e => setInitForm(p => ({ ...p, grade_level: e.target.value }))}
                                        placeholder="e.g. Form 1, Grade 6" className={inputCls} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">— or — Class ID</label>
                                    <input type="number" value={initForm.class_id} onChange={e => setInitForm(p => ({ ...p, class_id: e.target.value }))}
                                        placeholder="Class ID from admin panel" className={inputCls} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Fee Clearance Threshold (KES)</label>
                                    <input type="number" value={initForm.clearance_threshold} onChange={e => setInitForm(p => ({ ...p, clearance_threshold: e.target.value }))}
                                        placeholder="0 = must be fully paid" className={inputCls} />
                                    <p className="text-[10px] text-slate-400 mt-1">Students with balance ≤ threshold will be auto-marked fee-cleared.</p>
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setShowInit(false)}
                                        className="flex-1 px-4 py-2 border border-slate-300 dark:border-gray-600 text-sm font-bold rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={initLoading || (!initForm.grade_level && !initForm.class_id)}
                                        className="flex-1 px-4 py-2 bg-primary text-white font-bold text-sm rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors">
                                        {initLoading ? 'Creating…' : 'Initialize'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clearance;
