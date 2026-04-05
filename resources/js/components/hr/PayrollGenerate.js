import React, { useState, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// PayrollGenerate — Batch payslip generation with live deduction preview
// Route: /hr/payroll/generate
// ─────────────────────────────────────────────────────────────────────────────
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

    // Salary edit inline
    const [editingId,  setEditingId]  = useState(null);
    const [salaryForm, setSalaryForm] = useState({ basic_salary: '', allowance: '' });
    const [savingId,   setSavingId]   = useState(null);
    const [preview,    setPreview]    = useState(null);  // live deduction preview on salary change

    const months = [
        'January','February','March','April','May','June',
        'July','August','September','October','November','December',
    ];
    const years = Array.from({ length: 6 }, (_, i) => today.getFullYear() - i);

    const fetchStaff = useCallback(() => {
        setLoading(true); setError(''); setResult(null);
        window.axios.get(`/api/hr/payroll/staff?year=${year}&month=${month}`)
            .then(res => {
                setStaffList(res.data.staff || []);
                setSelectedStaff([]);
            })
            .catch(() => setError('Failed to load staff payroll data.'))
            .finally(() => setLoading(false));
    }, [year, month]);

    useEffect(() => { fetchStaff(); }, [fetchStaff]);

    const toggleSelect = id => {
        const member = staffList.find(s => s.id === id);
        if (!member?.has_salary) return; // Can't select staff with no salary configured
        setSelectedStaff(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const selectAll = () => {
        const withSalary = staffList.filter(s => s.has_salary).map(s => s.id);
        setSelectedStaff(selectedStaff.length === withSalary.length ? [] : withSalary);
    };

    const generate = async () => {
        setGenerating(true); setError(''); setResult(null);
        try {
            const res = await window.axios.post('/api/hr/payslips/generate', {
                year, month, user_ids: selectedStaff,
            });
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
        setEditingId(member.id);
        setPreview(null);
        setSalaryForm({
            basic_salary: member.basic_salary || '',
            allowance:    member.allowance    || '',
        });
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

    // Totals for selected staff
    const sel   = staffList.filter(s => selectedStaff.includes(s.id));
    const totals = {
        gross: sel.reduce((a, b) => a + (b.gross_salary || 0), 0),
        nssf:  sel.reduce((a, b) => a + (b.nssf  || 0), 0),
        shif:  sel.reduce((a, b) => a + (b.shif  || 0), 0),
        housing: sel.reduce((a, b) => a + (b.housing_levy || 0), 0),
        paye:  sel.reduce((a, b) => a + (b.paye  || 0), 0),
        deductions: sel.reduce((a, b) => a + (b.total_deductions || 0), 0),
        net:   sel.reduce((a, b) => a + (b.net_salary || 0), 0),
    };

    const fmt = v => `KES ${Number(v || 0).toLocaleString()}`;

    const statusPill = (status) => {
        if (!status) return null;
        const styles = {
            Paid:      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            Processed: 'bg-blue-100  text-blue-700  dark:bg-blue-900/30  dark:text-blue-400',
        };
        return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${styles[status] || ''}`}>{status}</span>;
    };

    const withSalaryCount = staffList.filter(s => s.has_salary).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">Generate Payslips</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Select staff &amp; generate monthly payslips with auto Kenyan statutory deductions.
                    </p>
                </div>
                {/* Month/Year Controls */}
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
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-bold dark:bg-red-900/20 dark:border-red-900 dark:text-red-400">
                    ⚠ {error}
                </div>
            )}

            {result && (
                <div className="p-5 bg-green-50 border border-green-100 rounded-2xl dark:bg-green-900/20 dark:border-green-900">
                    <p className="font-black text-green-700 dark:text-green-400">✓ {result.message}</p>
                    {result.skipped?.length > 0 && (
                        <ul className="mt-2 space-y-0.5">
                            {result.skipped.map((s, i) => (
                                <li key={i} className="text-xs text-yellow-600 dark:text-yellow-400 font-bold">
                                    ⚡ {s.name}: {s.reason}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Live Deduction Preview Summary */}
            {selectedStaff.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: `${selectedStaff.length} Staff Selected`, value: fmt(totals.gross), sub: 'Gross total' },
                        { label: 'PAYE + NSSF + SHIF', value: fmt(totals.deductions), sub: 'Total statutory deductions', warn: true },
                        { label: 'Housing Levy', value: fmt(totals.housing), sub: '1.5% of gross' },
                        { label: 'Net Payout', value: fmt(totals.net), sub: 'After all deductions', hero: true },
                    ].map(card => (
                        <div key={card.label} className={`rounded-2xl p-5 border ${card.hero ? 'bg-purple-600 border-purple-500' : card.warn ? 'bg-orange-50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900' : 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700'}`}>
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${card.hero ? 'text-purple-200' : 'text-gray-400'}`}>{card.label}</p>
                            <p className={`text-xl font-black ${card.hero ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>{card.value}</p>
                            <p className={`text-[10px] mt-0.5 ${card.hero ? 'text-purple-300' : 'text-gray-400'}`}>{card.sub}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Staff Table */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                {/* Table toolbar */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <input type="checkbox"
                            checked={selectedStaff.length === withSalaryCount && withSalaryCount > 0}
                            onChange={selectAll}
                            className="w-5 h-5 rounded border-gray-300 accent-purple-600 focus:ring-purple-400"/>
                        <span className="text-sm font-black text-gray-600 dark:text-gray-300">
                            {selectedStaff.length} / {withSalaryCount} selected
                            {staffList.length - withSalaryCount > 0 && (
                                <span className="ml-2 text-[10px] text-amber-500 font-black">({staffList.length - withSalaryCount} missing salary)</span>
                            )}
                        </span>
                    </div>
                    <button
                        onClick={generate}
                        disabled={selectedStaff.length === 0 || generating}
                        className={`px-6 py-2.5 text-sm font-black rounded-xl transition-all ${
                            selectedStaff.length > 0 && !generating
                                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200 dark:shadow-none'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                        }`}>
                        {generating ? (
                            <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> Generating...</span>
                        ) : (
                            `⚡ Generate ${selectedStaff.length > 0 ? selectedStaff.length : ''} Payslip${selectedStaff.length !== 1 ? 's' : ''}`
                        )}
                    </button>
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading staff data...</p>
                    </div>
                ) : staffList.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-gray-400 font-bold uppercase text-sm tracking-widest">No staff found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[1000px]">
                            <thead className="bg-gray-50/50 dark:bg-gray-700/50">
                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <th className="px-5 py-4 w-12"></th>
                                    <th className="px-5 py-4">Staff Member</th>
                                    <th className="px-5 py-4 text-right">Basic</th>
                                    <th className="px-5 py-4 text-right">Allow.</th>
                                    <th className="px-5 py-4 text-right">Gross</th>
                                    <th className="px-5 py-4 text-right text-red-400">NSSF</th>
                                    <th className="px-5 py-4 text-right text-orange-400">SHIF</th>
                                    <th className="px-5 py-4 text-right text-amber-500">Housing</th>
                                    <th className="px-5 py-4 text-right text-rose-500">PAYE</th>
                                    <th className="px-5 py-4 text-right font-black text-gray-600 dark:text-gray-300">Net Pay</th>
                                    <th className="px-5 py-4 text-center">Status</th>
                                    <th className="px-5 py-4 text-right">Salary</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {staffList.map(member => (
                                    <React.Fragment key={member.id}>
                                        <tr onClick={() => toggleSelect(member.id)}
                                            className={`cursor-pointer transition-colors group ${
                                                selectedStaff.includes(member.id)
                                                    ? 'bg-purple-50 dark:bg-purple-900/20'
                                                    : member.has_salary
                                                        ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                        : 'opacity-50 cursor-not-allowed'
                                            }`}>
                                            <td className="px-5 py-5" onClick={e => e.stopPropagation()}>
                                                <input type="checkbox"
                                                    checked={selectedStaff.includes(member.id)}
                                                    onChange={() => toggleSelect(member.id)}
                                                    disabled={!member.has_salary}
                                                    className="w-5 h-5 rounded border-gray-300 accent-purple-600"/>
                                            </td>
                                            <td className="px-5 py-5">
                                                <p className="font-black text-sm text-gray-800 dark:text-white uppercase tracking-tight">{member.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{member.role}</p>
                                            </td>
                                            <td className="px-5 py-5 text-right text-sm font-bold text-gray-600 dark:text-gray-400">
                                                {member.has_salary ? fmt(member.basic_salary) : <span className="text-amber-500 text-[10px] font-black uppercase">Not set</span>}
                                            </td>
                                            <td className="px-5 py-5 text-right text-sm text-gray-500 dark:text-gray-500">{member.has_salary ? fmt(member.allowance) : '—'}</td>
                                            <td className="px-5 py-5 text-right text-sm font-bold text-gray-700 dark:text-gray-300">{member.has_salary ? fmt(member.gross_salary) : '—'}</td>
                                            <td className="px-5 py-5 text-right text-sm text-red-400 font-bold">{member.has_salary ? fmt(member.nssf) : '—'}</td>
                                            <td className="px-5 py-5 text-right text-sm text-orange-400 font-bold">{member.has_salary ? fmt(member.shif) : '—'}</td>
                                            <td className="px-5 py-5 text-right text-sm text-amber-500 font-bold">{member.has_salary ? fmt(member.housing_levy) : '—'}</td>
                                            <td className="px-5 py-5 text-right text-sm text-rose-500 font-bold">{member.has_salary ? fmt(member.paye) : '—'}</td>
                                            <td className="px-5 py-5 text-right font-black text-gray-900 dark:text-white">{member.has_salary ? fmt(member.net_salary) : '—'}</td>
                                            <td className="px-5 py-5 text-center">{statusPill(member.payslip_status)}</td>
                                            <td className="px-5 py-5 text-right" onClick={e => e.stopPropagation()}>
                                                <button onClick={() => openSalaryEdit(member)}
                                                    className="px-3 py-1.5 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-purple-600 hover:text-white transition-all dark:bg-gray-700 dark:text-gray-400">
                                                    {member.has_salary ? 'Edit' : '+ Set'}
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Inline salary edit row */}
                                        {editingId === member.id && (
                                            <tr className="bg-indigo-50 dark:bg-indigo-900/10">
                                                <td colSpan="12" className="px-5 py-5">
                                                    <div className="flex flex-wrap items-end gap-4">
                                                        <div>
                                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Basic Salary (KES)</label>
                                                            <input type="number" value={salaryForm.basic_salary}
                                                                onChange={e => setSalaryForm(f => ({ ...f, basic_salary: e.target.value }))}
                                                                className="w-40 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-400 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                                                placeholder="e.g. 45000"/>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Allowance (KES)</label>
                                                            <input type="number" value={salaryForm.allowance}
                                                                onChange={e => setSalaryForm(f => ({ ...f, allowance: e.target.value }))}
                                                                className="w-36 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-400 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                                                placeholder="e.g. 5000"/>
                                                        </div>
                                                        <button onClick={() => saveSalary(member.id)} disabled={savingId === member.id}
                                                            className="px-5 py-2.5 bg-purple-600 text-white text-xs font-black rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50">
                                                            {savingId === member.id ? 'Saving...' : 'Save Salary'}
                                                        </button>
                                                        <button onClick={() => { setEditingId(null); setPreview(null); }}
                                                            className="px-5 py-2.5 bg-gray-100 text-gray-600 text-xs font-black rounded-xl hover:bg-gray-200 transition-all dark:bg-gray-700 dark:text-gray-300">
                                                            Cancel
                                                        </button>

                                                        {/* Live preview panel */}
                                                        {preview && (
                                                            <div className="ml-4 flex-1 bg-white rounded-2xl border border-purple-100 p-4 dark:bg-gray-800 dark:border-purple-900 grid grid-cols-4 gap-3">
                                                                {[
                                                                    { label: 'Gross',   value: preview.gross_salary },
                                                                    { label: 'NSSF',    value: preview.nssf         },
                                                                    { label: 'PAYE',    value: preview.paye         },
                                                                    { label: 'Net Pay', value: preview.net_salary, green: true },
                                                                ].map(i => (
                                                                    <div key={i.label}>
                                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{i.label}</p>
                                                                        <p className={`text-sm font-black ${i.green ? 'text-green-600' : 'text-gray-800 dark:text-white'}`}>{fmt(i.value)}</p>
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
            </div>
        </div>
    );
};

export default PayrollGenerate;
