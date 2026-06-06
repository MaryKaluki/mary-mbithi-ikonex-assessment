import React, { useState, useEffect } from 'react';

const GRADE_COLOR = {
    'A':  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'A-': 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    'B+': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'B':  'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
    'B-': 'bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-200',
    'C+': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    'C':  'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-200',
    'C-': 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300',
    'D+': 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300',
    'D':  'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-200',
    'D-': 'bg-red-200 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    'E':  'bg-slate-200 text-slate-700 dark:bg-gray-700 dark:text-gray-300',
};

const GradeBadge = ({ grade }) => (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${GRADE_COLOR[grade] || 'bg-slate-100 text-slate-500'}`}>
        {grade}
    </span>
);

const TeacherSPC = () => {
    const [students,     setStudents]     = useState([]);
    const [gradeFilter,  setGradeFilter]  = useState('');
    const [gradeLevels,  setGradeLevels]  = useState([]);
    const [search,       setSearch]       = useState('');
    const [selected,     setSelected]     = useState(null);
    const [report,       setReport]       = useState(null);
    const [loading,      setLoading]      = useState(true);
    const [reportLoading, setReportLoading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await window.axios.get('/api/teacher/spc/students');
                setStudents(res.data);
                const levels = [...new Set(res.data.map(s => s.grade_level))].sort();
                setGradeLevels(levels);
            } catch { window.showToast?.('error', 'Failed to load students.'); }
            finally { setLoading(false); }
        })();
    }, []);

    const loadReport = async (student) => {
        setSelected(student); setReport(null); setReportLoading(true);
        try {
            const res = await window.axios.get(`/api/teacher/spc/${student.id}`);
            setReport(res.data);
        } catch { window.showToast?.('error', 'Failed to load progress card.'); }
        finally { setReportLoading(false); }
    };

    const filtered = students.filter(s => {
        const matchGrade  = !gradeFilter || s.grade_level === gradeFilter;
        const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.admission_number.toLowerCase().includes(search.toLowerCase());
        return matchGrade && matchSearch;
    });

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Teacher <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Student Progress Cards</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Student Progress Cards</h1>
                </div>
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap gap-2 items-center flex-shrink-0">
                <select value={gradeFilter} onChange={e => { setGradeFilter(e.target.value); setSelected(null); setReport(null); }}
                    className="px-2.5 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All Classes</option>
                    {gradeLevels.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <input type="text" placeholder="Search name or adm no…" value={search} onChange={e => setSearch(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"/>
            </div>

            <div className="flex gap-3 flex-1 min-h-0">

                {/* Student list */}
                <div className="w-56 flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                    <div className="flex-shrink-0 bg-slate-800 dark:bg-slate-900">
                        <div className="px-3 py-2 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Students</span>
                            <span className="text-[10px] text-slate-400">{filtered.length}</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="py-10 text-center text-xs text-slate-400">Loading…</div>
                        ) : filtered.length === 0 ? (
                            <div className="py-10 text-center text-xs text-slate-400">No students found.</div>
                        ) : filtered.map((s, i) => (
                            <button key={s.id} onClick={() => loadReport(s)}
                                className={`w-full text-left px-3 py-2 border-b border-slate-100 dark:border-gray-700/60 transition-colors ${
                                    selected?.id === s.id
                                        ? 'bg-primary/10 dark:bg-primary/20 border-l-2 border-l-primary'
                                        : i % 2 === 0 ? 'bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                                                      : 'bg-slate-50/70 dark:bg-gray-900/30 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                                }`}>
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{s.name}</p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{s.admission_number} · {s.grade_level}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Progress card */}
                <div className="flex-1 min-w-0 overflow-y-auto flex flex-col gap-2">
                    {!selected && (
                        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 flex items-center justify-center" style={{ minHeight: 200 }}>
                            <p className="text-slate-400 text-sm">Select a student to view their progress card.</p>
                        </div>
                    )}

                    {selected && reportLoading && (
                        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 flex items-center justify-center" style={{ minHeight: 200 }}>
                            <p className="text-slate-400 text-sm">Loading…</p>
                        </div>
                    )}

                    {report && !reportLoading && (
                        <>
                            {/* Student info strip */}
                            <div className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0">
                                    {report.student.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{report.student.name}</p>
                                    <p className="text-[10px] text-slate-400 font-mono">{report.student.admission_number} · {report.student.grade_level} · {report.student.gender}</p>
                                </div>
                            </div>

                            {report.exams.length === 0 ? (
                                <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 flex items-center justify-center py-10">
                                    <p className="text-slate-400 text-sm">No exam results recorded yet.</p>
                                </div>
                            ) : report.exams.map(exam => (
                                <div key={exam.exam_id} className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden">
                                    {/* Exam header */}
                                    <div className="px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between">
                                        <div>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{exam.exam_name}</span>
                                            <span className="text-[10px] text-slate-400 ml-2">Term {exam.term} · {exam.year}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-extrabold text-primary">{exam.average}%</span>
                                            <GradeBadge grade={exam.grade}/>
                                        </div>
                                    </div>
                                    {/* Subjects table */}
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                                <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-300">Subject</th>
                                                <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-center">Score</th>
                                                <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-40">Progress</th>
                                                <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-center">Grade</th>
                                                <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-300">Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {exam.subjects.map((sub, si) => {
                                                const pct = sub.out_of > 0 ? Math.round((sub.marks / sub.out_of) * 100) : 0;
                                                return (
                                                    <tr key={sub.subject}
                                                        className={`border-b border-slate-100 dark:border-gray-700/60 ${
                                                            si % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                                        }`}>
                                                        <td className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300">{sub.subject}</td>
                                                        <td className="px-3 py-2 text-center text-xs font-mono text-slate-500 dark:text-slate-400">{sub.marks}/{sub.out_of}</td>
                                                        <td className="px-3 py-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }}/>
                                                                </div>
                                                                <span className="text-[10px] font-bold text-slate-400 w-8 text-right">{pct}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2 text-center"><GradeBadge grade={sub.grade}/></td>
                                                        <td className="px-3 py-2 text-[10px] text-slate-400 italic">{sub.remarks || '—'}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherSPC;
