import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const inputCls = "px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

// Outstanding Balances = Defaulters view but showing all students with any balance
const OutstandingBalances = () => {
    const [students, setStudents] = useState([]);
    const [summary, setSummary]   = useState(null);
    const [loading, setLoading]   = useState(true);
    const [grade, setGrade]       = useState('');
    const [term, setTerm]         = useState('');
    const [year, setYear]         = useState(new Date().getFullYear().toString());

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = { min_balance: 1 };
            if (grade) params.grade = grade;
            if (term)  params.term  = term;
            if (year)  params.academic_year = year;
            const res = await window.axios.get('/api/finance/defaulters', { params });
            setStudents(res.data.defaulters);
            setSummary(res.data.summary);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const total = summary?.total_outstanding || 0;
    const avg   = students.length > 0 ? Math.round(total / students.length) : 0;

    const exportCsv = () => {
        const rows = [['Adm No','Student','Grade','Parent','Phone','Total Charged','Paid','Balance']];
        students.forEach(s => rows.push([
            s.admission_number, `${s.first_name} ${s.last_name}`,
            s.grade_level, s.parent_name, s.parent_phone,
            s.total_charged, s.total_paid, s.balance,
        ]));
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `outstanding-balances-${year}.csv`;
        a.click();
    };

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Finance <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Outstanding Balances</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Outstanding Balances</h1>
                </div>
                <button onClick={exportCsv}
                    className="px-4 py-1.5 border border-slate-300 dark:border-gray-600 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                    Export CSV
                </button>
            </div>

            {/* Stats strip */}
            {!loading && summary && (
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                    {[
                        { label: 'Total Outstanding',      value: `KSh ${Number(total).toLocaleString()}`, cls: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' },
                        { label: 'Students with Balance',  value: students.length,                         cls: 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800' },
                        { label: 'Avg. Balance',           value: `KSh ${avg.toLocaleString()}`,           cls: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20' },
                    ].map(c => (
                        <div key={c.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${c.cls}`}>
                            <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{c.value}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{c.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Filter bar */}
            <div className="flex flex-wrap gap-2 items-end flex-shrink-0">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Year</label>
                    <input value={year} onChange={e => setYear(e.target.value)} className={inputCls} style={{ width: 80 }}/>
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
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Grade</label>
                    <input value={grade} onChange={e => setGrade(e.target.value)} placeholder="e.g. Form 1" className={inputCls}/>
                </div>
                <button onClick={fetchData}
                    className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                    Filter
                </button>
            </div>

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {loading ? (
                    <div className="p-6"><SkeletonLoader type="table"/></div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left" style={{ minWidth: 880 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Adm No</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Student</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20">Grade</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Parent</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Phone</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28 text-right">Charged</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Paid</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Balance</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-right">SMS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((s, i) => (
                                        <tr key={s.invoice_id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                            i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                        }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{s.admission_number}</td>
                                            <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{s.first_name} {s.last_name}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500">{s.grade_level}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500">{s.parent_name}</td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{s.parent_phone}</td>
                                            <td className="px-3 py-2 text-right text-xs font-mono text-slate-600 dark:text-slate-300">KSh {Number(s.total_charged).toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold text-emerald-600">KSh {Number(s.total_paid).toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold text-red-500">KSh {Number(s.balance).toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right">
                                                <button className="text-[10px] font-bold uppercase tracking-wider text-blue-500 hover:text-blue-700 transition-colors">SMS</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {students.length === 0 && (
                                <div className="py-12 text-center text-xs text-slate-400 italic">No outstanding balances found.</div>
                            )}
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{students.length} student{students.length !== 1 ? 's' : ''}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default OutstandingBalances;
