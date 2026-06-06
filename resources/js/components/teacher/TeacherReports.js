import React, { useState, useEffect, useRef } from 'react';

const ASSESS_LABEL = {
    cat1:        'CAT 1',
    cat2:        'CAT 2',
    end_of_term: 'End of Term Examination',
    mock:        'Mock Examination',
    national:    'National Examination',
};

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' }) : '';

const inputCls = "w-full px-2.5 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

// ─── Report card (print-optimized — do not change layout) ─────────────────────
const ReportCard = React.forwardRef(({ data }, ref) => {
    if (!data) return null;
    const { school, student, exam, subjects, summary } = data;
    const assessLabel = ASSESS_LABEL[exam?.assessment_type] ?? (exam?.name ?? '');
    const isCBC       = student.curriculum_type === 'CBC';

    return (
        <div ref={ref} id="report-card-print" className="bg-white text-gray-900 font-sans"
            style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
            <div className="border-b-2 border-gray-900 pb-4 mb-5 text-center">
                {school.logo_path && (
                    <img src={school.logo_path} alt="School logo"
                        className="h-16 w-16 object-contain mx-auto mb-2"
                        onError={e => { e.target.style.display = 'none'; }}/>
                )}
                <h1 className="text-xl font-bold uppercase tracking-wide">{school.name}</h1>
                {school.address && <p className="text-xs text-gray-500 mt-0.5">{school.address}</p>}
                {school.phone  && <p className="text-xs text-gray-500">Tel: {school.phone}</p>}
                <div className="mt-3 border border-gray-900 inline-block px-8 py-1">
                    <p className="text-sm font-bold uppercase tracking-widest">Academic Progress Report</p>
                </div>
            </div>

            <div className="flex justify-between items-start mb-5 text-sm">
                <div>
                    <span className="font-semibold">Document Type: </span>
                    <span>{assessLabel}</span>
                </div>
                <div className="text-right">
                    <p><span className="font-semibold">Term: </span>{exam ? `Term ${exam.term}` : '—'}</p>
                    <p><span className="font-semibold">Year: </span>{exam?.year ?? '—'}</p>
                    {exam?.start_date && (
                        <p className="text-xs text-gray-500 mt-0.5">{fmtDate(exam.start_date)} – {fmtDate(exam.end_date)}</p>
                    )}
                </div>
            </div>

            <div className="border border-gray-300 rounded mb-5">
                <div className="bg-gray-100 px-4 py-1.5 border-b border-gray-300">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-600">Student Information</p>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 px-4 py-3 text-sm">
                    <div><span className="text-gray-500">Full Name: </span><span className="font-semibold">{student.name}</span></div>
                    <div><span className="text-gray-500">Admission No.: </span><span className="font-semibold font-mono">{student.admission_number}</span></div>
                    <div><span className="text-gray-500">Class: </span><span className="font-semibold">{student.class_name}</span></div>
                    <div><span className="text-gray-500">Gender: </span><span className="font-semibold capitalize">{student.gender ?? '—'}</span></div>
                    <div><span className="text-gray-500">Curriculum: </span><span className="font-semibold">{isCBC ? 'CBC' : '8-4-4'}</span></div>
                    {summary.rank && (
                        <div><span className="text-gray-500">Overall Rank: </span><span className="font-semibold text-primary">{summary.rank} of {summary.total_students}</span></div>
                    )}
                </div>
            </div>

            <table className="w-full text-sm border-collapse mb-5">
                <thead>
                    <tr className="bg-gray-100 border border-gray-300">
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold uppercase tracking-wider w-6">#</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold uppercase tracking-wider">Subject</th>
                        <th className="border border-gray-300 px-3 py-2 text-center text-xs font-bold uppercase tracking-wider w-16">Marks</th>
                        <th className="border border-gray-300 px-3 py-2 text-center text-xs font-bold uppercase tracking-wider w-16">Out of</th>
                        <th className="border border-gray-300 px-3 py-2 text-center text-xs font-bold uppercase tracking-wider w-14">%</th>
                        <th className="border border-gray-300 px-3 py-2 text-center text-xs font-bold uppercase tracking-wider w-14">Grade</th>
                        {!isCBC && <th className="border border-gray-300 px-3 py-2 text-center text-xs font-bold uppercase tracking-wider w-12">Pts</th>}
                        <th className="border border-gray-300 px-3 py-2 text-center text-xs font-bold uppercase tracking-wider w-16">Pos</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold uppercase tracking-wider">Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    {subjects.length === 0 ? (
                        <tr>
                            <td colSpan={isCBC ? 8 : 9} className="border border-gray-300 px-3 py-4 text-center text-gray-400 text-xs">
                                No marks recorded for this examination.
                            </td>
                        </tr>
                    ) : subjects.map((s, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 px-3 py-2 text-xs text-gray-500">{i + 1}</td>
                            <td className="border border-gray-300 px-3 py-2 font-medium">{s.subject}</td>
                            <td className="border border-gray-300 px-3 py-2 text-center">{s.marks}</td>
                            <td className="border border-gray-300 px-3 py-2 text-center text-gray-500">{s.out_of}</td>
                            <td className="border border-gray-300 px-3 py-2 text-center">{s.percent}%</td>
                            <td className="border border-gray-300 px-3 py-2 text-center font-bold">{s.grade}</td>
                            {!isCBC && <td className="border border-gray-300 px-3 py-2 text-center text-gray-600">{s.points}</td>}
                            <td className="border border-gray-300 px-3 py-2 text-center text-xs font-bold">{s.rank !== '—' ? `${s.rank}/${s.total_students}` : '—'}</td>
                            <td className="border border-gray-300 px-3 py-2 text-xs text-gray-500">{s.remarks || '—'}</td>
                        </tr>
                    ))}
                </tbody>
                {summary.subjects_sat > 0 && (
                    <tfoot>
                        <tr className="bg-gray-100 font-bold">
                            <td className="border border-gray-300 px-3 py-2 text-xs" colSpan={2}>TOTAL / MEAN</td>
                            <td className="border border-gray-300 px-3 py-2 text-center text-sm">{summary.total_marks}</td>
                            <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-500">{summary.total_out_of}</td>
                            <td className="border border-gray-300 px-3 py-2 text-center text-sm">
                                {summary.average_pct !== null ? `${summary.average_pct}%` : '—'}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-center text-sm">{summary.mean_grade}</td>
                            {!isCBC && <td className="border border-gray-300 px-3 py-2 text-center text-sm">{summary.mean_points ?? '—'}</td>}
                            <td className="border border-gray-300 px-3 py-2" colSpan={2}></td>
                        </tr>
                    </tfoot>
                )}
            </table>

            {!isCBC && (
                <div className="mb-5 text-xs text-gray-500">
                    <span className="font-semibold mr-2">Grading Scale:</span>
                    A(80–100) &nbsp; A-(75–79) &nbsp; B+(70–74) &nbsp; B(65–69) &nbsp; B-(60–64) &nbsp;
                    C+(55–59) &nbsp; C(50–54) &nbsp; C-(45–49) &nbsp; D+(40–44) &nbsp; D(35–39) &nbsp;
                    D-(30–34) &nbsp; E(0–29)
                </div>
            )}
            {isCBC && (
                <div className="mb-5 text-xs text-gray-500">
                    <span className="font-semibold mr-2">Performance Scale:</span>
                    EE — Exceeding Expectations &nbsp; ME — Meeting Expectations &nbsp;
                    AE — Approaching Expectations &nbsp; BE — Below Expectations
                </div>
            )}

            <div className="grid grid-cols-3 gap-8 mt-8 pt-4 border-t border-gray-300 text-sm">
                {['Class Teacher', 'Principal / Head Teacher', 'Parent / Guardian'].map(role => (
                    <div key={role}>
                        <div className="border-b border-gray-400 mb-1 h-8"></div>
                        <p className="text-xs text-gray-500">{role}</p>
                    </div>
                ))}
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-6">
                This is an official academic document of {school.name}.
                Report generated on {new Date().toLocaleDateString('en-KE')}.
            </p>
        </div>
    );
});

// ─── Main component ───────────────────────────────────────────────────────────
const TeacherReports = () => {
    const [classes,  setClasses]  = useState([]);
    const [exams,    setExams]    = useState([]);
    const [students, setStudents] = useState([]);

    const [classId, setClassId]   = useState('');
    const [examId,  setExamId]    = useState('');
    const [search,  setSearch]    = useState('');

    const [loadingList, setLoadingList]         = useState(true);
    const [loadingCard, setLoadingCard]         = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [reportData, setReportData]           = useState(null);

    const printRef = useRef(null);

    useEffect(() => {
        setLoadingList(true);
        window.axios.get('/api/teacher/report-card/students')
            .then(res => {
                setClasses(res.data.classes || []);
                setExams(res.data.exams || []);
                setStudents(res.data.students || []);
                if (res.data.exams?.length) setExamId(String(res.data.exams[0].id));
            })
            .catch(() => {})
            .finally(() => setLoadingList(false));
    }, []);

    useEffect(() => {
        setSelectedStudent(null); setReportData(null); setSearch(''); setLoadingList(true);
        window.axios.get(`/api/teacher/report-card/students${classId ? `?class_id=${classId}` : ''}`)
            .then(res => {
                setStudents(res.data.students || []);
                if (!exams.length && res.data.exams?.length) {
                    setExams(res.data.exams);
                    setExamId(String(res.data.exams[0].id));
                }
            })
            .catch(() => {})
            .finally(() => setLoadingList(false));
    }, [classId]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadCard = (student) => {
        setSelectedStudent(student); setReportData(null); setLoadingCard(true);
        const params = examId ? `?exam_id=${examId}` : '';
        window.axios.get(`/api/teacher/report-card/${student.id}${params}`)
            .then(res => setReportData(res.data))
            .catch(() => window.showToast?.('error', 'Failed to load report card.'))
            .finally(() => setLoadingCard(false));
    };

    useEffect(() => {
        if (selectedStudent && examId) loadCard(selectedStudent);
    }, [examId]); // eslint-disable-line react-hooks/exhaustive-deps

    const handlePrint = () => {
        const content = document.getElementById('report-card-print');
        if (!content) return;
        const win = window.open('', '_blank', 'width=850,height=1100');
        win.document.write(`<!DOCTYPE html><html><head>
            <title>Report Card – ${reportData?.student?.name ?? 'Student'}</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #111; padding: 32px 40px; }
                h1 { font-size: 18px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #888; padding: 6px 10px; }
                th { background: #f0f0f0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
                tfoot tr { background: #f0f0f0; font-weight: bold; }
                .bg-gray-50 { background: #f9f9f9; }
                .border-b-2 { border-bottom: 2px solid #111; padding-bottom: 16px; margin-bottom: 20px; }
                .text-center { text-align: center; } .text-right { text-align: right; }
                .grid-cols-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
                .grid-cols-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px; }
                .border { border: 1px solid #ccc; border-radius: 4px; margin-bottom: 20px; }
                .border-header { background: #f0f0f0; padding: 6px 16px; border-bottom: 1px solid #ccc;
                                 font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; }
                .student-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; padding: 12px 16px; font-size: 13px; }
                .sig-line { border-bottom: 1px solid #666; height: 32px; margin-bottom: 4px; }
                .scale { font-size: 11px; color: #666; margin-bottom: 20px; }
                .footer { text-align: center; font-size: 10px; color: #999; margin-top: 24px; }
                @media print { @page { margin: 20mm 15mm; } }
            </style></head><body>${content.innerHTML}</body></html>`);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); }, 400);
    };

    const filtered = students.filter(s =>
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.admission_number ?? '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Teacher <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Report Cards</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">
                        Report Cards
                        {!loadingList && <span className="ml-2 text-xs font-normal text-slate-400">— {students.length} students</span>}
                    </h1>
                </div>
                <div className="flex gap-2">
                    {classId && examId && (
                        <a href={`/api/teacher/class-performance/pdf?class_id=${classId}&exam_id=${examId}`} target="_blank" rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-indigo-700 transition-colors flex items-center decoration-none">
                            Class Performance PDF
                        </a>
                    )}
                    {selectedStudent && reportData && (
                        <>
                            <button onClick={handlePrint}
                                className="px-3 py-1.5 bg-slate-600 text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-slate-700 transition-colors">
                                Print Preview
                            </button>
                            <a href={`/api/teacher/report-card/${selectedStudent.id}/pdf?exam_id=${examId}`} target="_blank" rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors flex items-center decoration-none">
                                Download PDF
                            </a>
                        </>
                    )}
                </div>
            </div>

            <div className="flex gap-3 flex-1 min-h-0">

                {/* Left: student selector */}
                <div className="w-64 flex-shrink-0 flex flex-col gap-2">

                    {/* Filters */}
                    <div className="flex-shrink-0 flex flex-col gap-2">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Class</label>
                            <select value={classId} onChange={e => setClassId(e.target.value)} className={inputCls}>
                                <option value="">All classes</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Examination</label>
                            <select value={examId} onChange={e => setExamId(e.target.value)} className={inputCls}>
                                <option value="">Select examination</option>
                                {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>
                        <input type="text" placeholder="Search by name or adm no…"
                            value={search} onChange={e => setSearch(e.target.value)} className={inputCls}/>
                    </div>

                    {/* Student list */}
                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                        <div className="flex-shrink-0 bg-slate-800 dark:bg-slate-900">
                            <div className="px-3 py-2 flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Students</span>
                                <span className="text-[10px] text-slate-400">{filtered.length}</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {loadingList ? (
                                <div className="py-10 text-center text-xs text-slate-400">Loading…</div>
                            ) : filtered.length === 0 ? (
                                <div className="py-10 text-center text-xs text-slate-400">No students found.</div>
                            ) : filtered.map((s, i) => (
                                <button key={s.id} onClick={() => loadCard(s)}
                                    className={`w-full text-left px-3 py-2 border-b border-slate-100 dark:border-gray-700/60 transition-colors ${
                                        selectedStudent?.id === s.id
                                            ? 'bg-primary/10 dark:bg-primary/20 border-l-2 border-l-primary'
                                            : i % 2 === 0 ? 'bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                                                          : 'bg-slate-50/70 dark:bg-gray-900/30 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                                    }`}>
                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{s.name}</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                                        {s.admission_number} · {s.grade_level}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: report card preview */}
                <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-auto">
                    {!selectedStudent && (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-slate-400 text-sm">Select a student to preview their report card.</p>
                        </div>
                    )}
                    {selectedStudent && loadingCard && (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-slate-400 text-sm">Loading report card…</p>
                        </div>
                    )}
                    {selectedStudent && !loadingCard && reportData && (
                        <>
                            <div className="flex-shrink-0 px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                    {reportData.student.name} · {reportData.exam?.name ?? 'No exam'}
                                </span>
                                <button onClick={handlePrint}
                                    className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">
                                    Print →
                                </button>
                            </div>
                            <div className="p-6">
                                <ReportCard ref={printRef} data={reportData}/>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherReports;
