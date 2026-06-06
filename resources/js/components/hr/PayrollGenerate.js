import React, { useState, useEffect, useCallback } from 'react';

const PayrollGenerate = () => {
    const today = new Date();
    const [year,  setYear]  = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [staffList,     setStaffList]     = useState([]);
    const [selectedStaff, setSelectedStaff] = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error,      setError]      = useState('');
    const [result,     setResult]     = useState(null);
    const [editingId,  setEditingId]  = useState(null);
    const [salaryForm, setSalaryForm] = useState({ basic_salary: '', allowance: '' });
    const [savingId,   setSavingId]   = useState(null);
    const [preview,    setPreview]    = useState(null);

    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const YEARS  = Array.from({ length: 6 }, (_, i) => today.getFullYear() - i);

    const fetchStaff = useCallback(() => {
        setLoading(true); setError(''); setResult(null);
        window.axios.get(`/api/hr/payroll/staff?year=${year}&month=${month}`)
            .then(res => { setStaffList(res.data.staff || []); setSelectedStaff([]); })
            .catch(() => setError('Failed to load staff payroll data.'))
            .finally(() => setLoading(false));
    }, [year, month]);

    useEffect(() => { fetchStaff(); }, [fetchStaff]);

    const withSalaryCount = staffList.filter(s => s.has_salary).length;

    const toggleSelect = id => {
        const member = staffList.find(s => s.id === id);
        if (!member?.has_salary) return;
        setSelectedStaff(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const selectAll = () => {
        const withSalary = staffList.filter(s => s.has_salary).map(s => s.id);
        setSelectedStaff(selectedStaff.length === withSalary.length ? [] : withSalary);
    };

    const generate = async () => {
        setGenerating(true); setError(''); setResult(null);
        try {
            const res = await window.axios.post('/api/hr/payslips/generate', { year, month, user_ids: selectedStaff });
            setResult(res.data);
            window.showToast?.('success', res.data.message);
            fetchStaff();
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to generate payslips.');
        } finally {
            setGenerating(false);
        }
    };

    const openSalaryEdit = (member) => {
        setEditingId(member.id); setPreview(null);
        setSalaryForm({ basic_salary: member.basic_salary || '', allowance: member.allowance || '' });
    };

    const saveSalary = async (userId) => {
        setSavingId(userId);
        try {
            const res = await window.axios.put(`/api/hr/salary/${userId}`, {
                basic_salary: parseFloat(salaryForm.basic_salary) || 0,
                allowance:    parseFloat(salaryForm.allowance)    || 0,
            });
            setPreview(res.data.preview);
            window.showToast?.('success', 'Salary saved.');
            setEditingId(null); setPreview(null);
            fetchStaff();
        } catch {
            setError('Failed to update salary.');
        } finally {
            setSavingId(null);
        }
    };

    const sel    = staffList.filter(s => selectedStaff.includes(s.id));
    const totals = {
        gross:      sel.reduce((a, b) => a + (b.gross_salary     || 0), 0),
        deductions: sel.reduce((a, b) => a + (b.total_deductions || 0), 0),
        housing:    sel.reduce((a, b) => a + (b.housing_levy     || 0), 0),
        net:        sel.reduce((a, b) => a + (b.net_salary       || 0), 0),
    };

    const fmt = v => `KES ${Number(v || 0).toLocaleString()}`;

    const statusBadge = (status) => {
        if (!status) return null;
        const cls = status === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : status === 'Processed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : '';
        return <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${cls}`}>{status}</span>;
    };

    const inputCls = "px-3 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white";

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        HR <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Generate Payslips</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Generate Payslips</h1>
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

            {result && (
                <div className="flex-shrink-0 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-md">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{result.message}</p>
                    {result.skipped?.length > 0 && result.skipped.map((s, i) => (
                        <p key={i} className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">{s.name}: {s.reason}</p>
                    ))}
                </div>
            )}

            {/* Selection summary */}
            {selectedStaff.length > 0 && (
                <div className="flex gap-2 flex-shrink-0 flex-wrap">
                    {[
                        { label: `${selectedStaff.length} Selected · Gross`, value: fmt(totals.gross) },
                        { label: 'Total Deductions',                          value: fmt(totals.deductions) },
                        { label: 'Housing Levy',                              value: fmt(totals.housing) },
                        { label: 'Net Payout',                                value: fmt(totals.net) },
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
                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <input type="checkbox"
                            checked={selectedStaff.length === withSalaryCount && withSalaryCount > 0}
                            onChange={selectAll}
                            className="w-3.5 h-3.5 rounded border-slate-400 cursor-pointer accent-primary"/>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-bold text-slate-700 dark:text-slate-200">{selectedStaff.length}</span> / {withSalaryCount} selected
                            {staffList.length - withSalaryCount > 0 && (
                                <span className="ml-2 text-[10px] text-amber-500 font-bold">({staffList.length - withSalaryCount} no salary)</span>
                            )}
                        </span>
                    </div>
                    <button onClick={generate} disabled={selectedStaff.length === 0 || generating}
                        className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        {generating ? 'Generating…' : `Generate ${selectedStaff.length > 0 ? selectedStaff.length : ''} Payslip${selectedStaff.length !== 1 ? 's' : ''}`}
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Loading staff data…</div>
                ) : staffList.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-slate-400 text-sm">No staff found.</p>
                    </div>
                ) : (
                    <div className="overflow-auto flex-1">
                        <table className="w-full text-left border-collapse" style={{ minWidth: 900 }}>
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                    <th className="px-3 py-2.5 w-8">
                                        <input type="checkbox"
                                            checked={selectedStaff.length === withSalaryCount && withSalaryCount > 0}
                                            onChange={selectAll}
                                            className="w-3.5 h-3.5 rounded border-slate-500 cursor-pointer accent-primary"/>
                                    </th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Staff Member</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28 text-right">Basic</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Allow.</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28 text-right">Gross</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-red-400 w-24 text-right">NSSF</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-orange-400 w-24 text-right">SHIF</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-amber-400 w-24 text-right">Housing</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-rose-400 w-24 text-right">PAYE</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-200 w-28 text-right">Net Pay</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Status</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-right">Salary</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staffList.map((member, i) => (
                                    <React.Fragment key={member.id}>
                                        <tr onClick={() => toggleSelect(member.id)}
                                            className={`border-b border-slate-100 dark:border-gray-700/60 transition-colors ${
                                                !member.has_salary ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                            } ${
                                                selectedStaff.includes(member.id) ? 'bg-primary/5 dark:bg-primary/10'
                                                : i % 2 === 0 ? 'bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                                                : 'bg-slate-50/70 dark:bg-gray-900/30 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                                            }`}>
                                            <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                                                <input type="checkbox"
                                                    checked={selectedStaff.includes(member.id)}
                                                    onChange={() => toggleSelect(member.id)}
                                                    disabled={!member.has_salary}
                                                    className="w-3.5 h-3.5 rounded border-slate-300 cursor-pointer accent-primary"/>
                                            </td>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">
                                                {String(i + 1).padStart(2, '0')}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{member.name}</span>
                                                <span className="ml-2 text-[10px] text-slate-400">{member.role}</span>
                                            </td>
                                            <td className="px-3 py-2 text-right text-xs font-mono text-slate-500 dark:text-slate-400">
                                                {member.has_salary ? fmt(member.basic_salary) : <span className="text-amber-500 font-bold">Not set</span>}
                                            </td>
                                            <td className="px-3 py-2 text-right text-xs font-mono text-slate-500 dark:text-slate-400">{member.has_salary ? fmt(member.allowance) : '—'}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold text-slate-700 dark:text-slate-300">{member.has_salary ? fmt(member.gross_salary) : '—'}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold text-red-500">{member.has_salary ? fmt(member.nssf) : '—'}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold text-orange-500">{member.has_salary ? fmt(member.shif) : '—'}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold text-amber-500">{member.has_salary ? fmt(member.housing_levy) : '—'}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold text-rose-500">{member.has_salary ? fmt(member.paye) : '—'}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold text-slate-800 dark:text-white">{member.has_salary ? fmt(member.net_salary) : '—'}</td>
                                            <td className="px-3 py-2 text-center">{statusBadge(member.payslip_status)}</td>
                                            <td className="px-3 py-2 text-right" onClick={e => e.stopPropagation()}>
                                                <button onClick={() => openSalaryEdit(member)}
                                                    className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">
                                                    {member.has_salary ? 'Edit' : 'Set'}
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Inline salary edit row */}
                                        {editingId === member.id && (
                                            <tr className="bg-blue-50 dark:bg-blue-900/10">
                                                <td colSpan="13" className="px-4 py-3">
                                                    <div className="flex flex-wrap items-end gap-3">
                                                        <div>
                                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Basic Salary (KES)</label>
                                                            <input type="number" value={salaryForm.basic_salary}
                                                                onChange={e => setSalaryForm(f => ({ ...f, basic_salary: e.target.value }))}
                                                                className="w-36 px-3 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                                                placeholder="e.g. 45000"/>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Allowance (KES)</label>
                                                            <input type="number" value={salaryForm.allowance}
                                                                onChange={e => setSalaryForm(f => ({ ...f, allowance: e.target.value }))}
                                                                className="w-32 px-3 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                                                placeholder="e.g. 5000"/>
                                                        </div>
                                                        <button onClick={() => saveSalary(member.id)} disabled={savingId === member.id}
                                                            className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors">
                                                            {savingId === member.id ? 'Saving…' : 'Save'}
                                                        </button>
                                                        <button onClick={() => { setEditingId(null); setPreview(null); }}
                                                            className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700 transition-colors">
                                                            Cancel
                                                        </button>
                                                        {preview && (
                                                            <div className="flex gap-4 ml-2 px-4 py-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-md">
                                                                {[
                                                                    { label: 'Gross',   value: preview.gross_salary },
                                                                    { label: 'NSSF',    value: preview.nssf        },
                                                                    { label: 'PAYE',    value: preview.paye        },
                                                                    { label: 'Net Pay', value: preview.net_salary  },
                                                                ].map(p => (
                                                                    <div key={p.label}>
                                                                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{p.label}</p>
                                                                        <p className="text-xs font-bold text-slate-800 dark:text-white font-mono">{fmt(p.value)}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && staffList.length > 0 && (
                    <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                            {staffList.length} staff · {withSalaryCount} with salary configured
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PayrollGenerate;
