import React, { useState, useEffect } from 'react';

const GRADE_COLOR = {
    'A':  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'A-': 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300',
    'B+': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'B':  'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
    'B-': 'bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-200',
    'C+': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    'C':  'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-200',
    'C-': 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300',
    'D+': 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300',
    'D':  'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-200',
    'D-': 'bg-red-200 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    'E':  'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

const GradeBadge = ({ grade }) => (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${GRADE_COLOR[grade] || 'bg-gray-100 text-gray-500'}`}>
        {grade}
    </span>
);

const BarChart = ({ value, max = 100 }) => {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-bold text-gray-500 w-8 text-right">{value}</span>
        </div>
    );
};

const TeacherSPC = () => {
    const [students, setStudents]         = useState([]);
    const [gradeFilter, setGradeFilter]   = useState('');
    const [gradeLevels, setGradeLevels]   = useState([]);
    const [search, setSearch]             = useState('');
    const [selected, setSelected]         = useState(null);
    const [report, setReport]             = useState(null);
    const [loading, setLoading]           = useState(true);
    const [reportLoading, setReportLoading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await window.axios.get('/api/teacher/spc/students');
                setStudents(res.data);
                const levels = [...new Set(res.data.map(s => s.grade_level))].sort();
                setGradeLevels(levels);
            } catch {
                window.showToast?.('error', 'Failed to load students.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const loadReport = async (student) => {
        setSelected(student);
        setReport(null);
        setReportLoading(true);
        try {
            const res = await window.axios.get(`/api/teacher/spc/${student.id}`);
            setReport(res.data);
        } catch {
            window.showToast?.('error', 'Failed to load progress card.');
        } finally {
            setReportLoading(false);
        }
    };

    const filtered = students.filter(s => {
        const matchGrade = !gradeFilter || s.grade_level === gradeFilter;
        const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.admission_number.toLowerCase().includes(search.toLowerCase());
        return matchGrade && matchSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Student Progress Cards</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">View academic performance for your school's students</p>
                </div>
                <select value={gradeFilter} onChange={e => { setGradeFilter(e.target.value); setSelected(null); setReport(null); }}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40">
                    <option value="">All Classes</option>
                    {gradeLevels.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Student list */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 space-y-2">
                        <p className="text-xs font-black uppercase text-gray-400 tracking-wider">Students ({filtered.length})</p>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search name or admission…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                            />
                            <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
                    ) : filtered.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">No students found.</div>
                    ) : (
                        <div className="divide-y divide-gray-50 dark:divide-gray-700/50 max-h-[500px] overflow-y-auto">
                            {filtered.map(s => (
                                <button key={s.id} onClick={() => loadReport(s)}
                                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selected?.id === s.id ? 'bg-primary/5 border-l-4 border-primary' : ''}`}>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{s.name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{s.admission_number} · {s.grade_level}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Progress card */}
                <div className="lg:col-span-2 space-y-4">
                    {!selected && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-16 flex flex-col items-center justify-center text-center">
                            <svg className="w-12 h-12 text-gray-200 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                            <p className="text-sm text-gray-400">Select a student to view their progress card.</p>
                        </div>
                    )}

                    {selected && reportLoading && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-16 text-center">
                            <svg className="animate-spin w-8 h-8 text-primary mx-auto" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                        </div>
                    )}

                    {report && !reportLoading && (
                        <>
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0">
                                    {report.student.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-extrabold text-gray-800 dark:text-white">{report.student.name}</p>
                                    <p className="text-xs text-gray-400">{report.student.admission_number} · {report.student.grade_level} · {report.student.gender}</p>
                                </div>
                            </div>

                            {report.exams.length === 0 ? (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-10 text-center text-gray-400 text-sm">
                                    No exam results recorded yet.
                                </div>
                            ) : report.exams.map(exam => (
                                <div key={exam.exam_id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                    <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-sm text-gray-800 dark:text-white">{exam.exam_name}</p>
                                            <p className="text-xs text-gray-400">Term {exam.term} · {exam.year}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-extrabold text-primary">{exam.average}%</p>
                                            <GradeBadge grade={exam.grade} />
                                        </div>
                                    </div>
                                    <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                        {exam.subjects.map(sub => (
                                            <div key={sub.subject} className="px-5 py-3 flex items-center gap-4">
                                                <div className="w-40 flex-shrink-0">
                                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{sub.subject}</p>
                                                    <p className="text-xs text-gray-400">{sub.remarks}</p>
                                                </div>
                                                <div className="flex-1">
                                                    <BarChart value={sub.marks} max={sub.out_of} />
                                                </div>
                                                <div className="w-12 text-right flex-shrink-0">
                                                    <GradeBadge grade={sub.grade} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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
