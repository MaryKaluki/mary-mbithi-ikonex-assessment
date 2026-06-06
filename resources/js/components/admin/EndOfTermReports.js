import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const STATUS_BADGE = {
    'Pass':          'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    'Needs Support': 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    'No Marks':      'bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-gray-400',
};

const GRADE_CLS = {
    'A': 'text-emerald-600 dark:text-emerald-400', 'A-': 'text-emerald-500',
    'B+': 'text-blue-600 dark:text-blue-400',       'B': 'text-blue-500',   'B-': 'text-blue-400',
    'C+': 'text-yellow-600',  'C': 'text-yellow-500', 'C-': 'text-orange-500',
    'D+': 'text-red-500',     'D': 'text-red-600',    'D-': 'text-red-700',  'E': 'text-slate-400',
};

const EndOfTermReports = () => {
    const [data, setData]               = useState({ students: [], exams: [], grade_levels: [], active_exam: null });
    const [loading, setLoading]         = useState(true);
    const [activeExam, setActiveExam]   = useState('');
    const [gradeFilter, setGradeFilter] = useState('');
    const [search, setSearch]           = useState('');

    const load = async (examId = '', grade = '') => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (examId) params.set('exam_id', examId);
            if (grade)  params.set('grade_level', grade);
            const res = await window.axios.get(`/api/admin/term-reports?${params}`);
            setData(res.data);
            if (!examId && res.data.active_exam) setActiveExam(res.data.active_exam);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleExamChange = (id) => { setActiveExam(id); load(id, gradeFilter); };
    const handleGradeChange = (g) => { setGradeFilter(g); load(activeExam, g); };

    const passCount    = data.students.filter(s => s.status === 'Pass').length;
    const supportCount = data.students.filter(s => s.status === 'Needs Support').length;
    const noMarksCount = data.students.filter(s => s.status === 'No Marks').length;

    const filtered = data.students.filter(s =>
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.admission_number || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Admin <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Term Reports</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">End of Term Reports</h1>
                </div>
                <select value={activeExam} onChange={e => handleExamChange(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Exam…</option>
                    {data.exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-2 flex-shrink-0">
                {[
                    { label: 'Passed',        value: passCount,    cls: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' },
                    { label: 'Needs Support', value: supportCount, cls: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' },
                    { label: 'No Marks',      value: noMarksCount, cls: 'border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800' },
                ].map(c => (
                    <div key={c.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${c.cls}`}>
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{c.value}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{c.label}</span>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center flex-shrink-0">
                {/* Grade filter pills */}
                <div className="flex flex-wrap gap-1">
                    <button onClick={() => handleGradeChange('')}
                        className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${
                            !gradeFilter ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 text-slate-500 hover:border-slate-400'
                        }`}>All Grades</button>
                    {data.grade_levels.map(g => (
                        <button key={g} onClick={() => handleGradeChange(g)}
                            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${
                                gradeFilter === g ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 text-slate-500 hover:border-slate-400'
                            }`}>{g}</button>
                    ))}
                </div>
                <div className="flex-1 relative min-w-48">
                    <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input type="text" placeholder="Search name or adm no…"
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                        value={search} onChange={e => setSearch(e.target.value)}/>
                </div>
                <div className="flex items-center px-3 py-1.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-md text-xs text-slate-500 whitespace-nowrap select-none">
                    <span className="font-bold text-slate-700 dark:text-slate-200 mr-1">{filtered.length}</span> students
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {loading ? (
                    <div className="p-6"><SkeletonLoader type="table"/></div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left" style={{ minWidth: 640 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Student</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Adm No</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Grade</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28 text-center">Avg Score</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Letter</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-3 py-12 text-center text-sm text-slate-400">
                                                {activeExam ? 'No students found for this selection.' : 'Select an exam to view results.'}
                                            </td>
                                        </tr>
                                    ) : filtered.map((s, i) => (
                                        <tr key={s.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                            i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                        }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                            <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{s.name}</td>
                                            <td className="px-3 py-2 text-xs font-mono text-slate-400">{s.admission_number}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{s.grade_level}</td>
                                            <td className="px-3 py-2 text-center">
                                                {s.average !== null
                                                    ? <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{s.average}%</span>
                                                    : <span className="text-xs text-slate-300">—</span>}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`text-sm font-bold ${GRADE_CLS[s.grade] || 'text-slate-400'}`}>{s.grade || '—'}</span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${STATUS_BADGE[s.status] || ''}`}>
                                                    {s.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{filtered.length} students</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default EndOfTermReports;
