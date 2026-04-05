import React, { useState, useEffect, useRef } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ASSESS_LABEL = {
    cat1:        'CAT 1',
    cat2:        'CAT 2',
    end_of_term: 'End of Term Examination',
    mock:        'Mock Examination',
    national:    'National Examination',
};

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' }) : '';

const inputCls =
    'w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm ' +
    'bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-400';

// ─── Report card preview (print target) ───────────────────────────────────────

const ReportCard = React.forwardRef(({ data }, ref) => {
    if (!data) return null;
    const { school, student, exam, subjects, summary } = data;

    const assessLabel = ASSESS_LABEL[exam?.assessment_type] ?? (exam?.name ?? '');
    const isCBC       = student.curriculum_type === 'CBC';

    return (
        <div
            ref={ref}
            id="report-card-print"
            className="bg-white text-gray-900 font-sans"
            style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
        >
            {/* ── School header ── */}
            <div className="border-b-2 border-gray-900 pb-4 mb-5 text-center">
                {school.logo_path && (
                    <img
                        src={school.logo_path}
                        alt="School logo"
                        className="h-16 w-16 object-contain mx-auto mb-2"
                        onError={e => { e.target.style.display = 'none'; }}
                    />
                )}
                <h1 className="text-xl font-bold uppercase tracking-wide">{school.name}</h1>
                {school.address && (
                    <p className="text-xs text-gray-500 mt-0.5">{school.address}</p>
                )}
                {school.phone && (
                    <p className="text-xs text-gray-500">Tel: {school.phone}</p>
                )}
                <div className="mt-3 border border-gray-900 inline-block px-8 py-1">
                    <p className="text-sm font-bold uppercase tracking-widest">
                        Academic Progress Report
                    </p>
                </div>
            </div>

            {/* ── Document type & period ── */}
            <div className="flex justify-between items-start mb-5 text-sm">
                <div>
                    <span className="font-semibold">Document Type: </span>
                    <span>{assessLabel}</span>
                </div>
                <div className="text-right">
                    <p>
                        <span className="font-semibold">Term: </span>
                        {exam ? `Term ${exam.term}` : '—'}
                    </p>
                    <p>
                        <span className="font-semibold">Year: </span>
                        {exam?.year ?? '—'}
                    </p>
                    {exam?.start_date && (
                        <p className="text-xs text-gray-500 mt-0.5">
                            {fmtDate(exam.start_date)} – {fmtDate(exam.end_date)}
                        </p>
                    )}
                </div>
            </div>

            {/* ── Student details ── */}
            <div className="border border-gray-300 rounded mb-5">
                <div className="bg-gray-100 px-4 py-1.5 border-b border-gray-300">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-600">Student Information</p>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 px-4 py-3 text-sm">
                    <div>
                        <span className="text-gray-500">Full Name: </span>
                        <span className="font-semibold">{student.name}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Admission No.: </span>
                        <span className="font-semibold font-mono">{student.admission_number}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Class: </span>
                        <span className="font-semibold">{student.class_name}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Gender: </span>
                        <span className="font-semibold capitalize">{student.gender ?? '—'}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Curriculum: </span>
                        <span className="font-semibold">{isCBC ? 'CBC' : '8-4-4'}</span>
                    </div>
                </div>
            </div>

            {/* ── Marks table ── */}
            <table className="w-full text-sm border-collapse mb-5">
                <thead>
                    <tr className="bg-gray-100 border border-gray-300">
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold uppercase tracking-wider w-6">#</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold uppercase tracking-wider">Subject</th>
                        <th className="border border-gray-300 px-3 py-2 text-center text-xs font-bold uppercase tracking-wider w-16">Marks</th>
                        <th className="border border-gray-300 px-3 py-2 text-center text-xs font-bold uppercase tracking-wider w-16">Out of</th>
                        <th className="border border-gray-300 px-3 py-2 text-center text-xs font-bold uppercase tracking-wider w-14">%</th>
                        <th className="border border-gray-300 px-3 py-2 text-center text-xs font-bold uppercase tracking-wider w-14">Grade</th>
                        {!isCBC && (
                            <th className="border border-gray-300 px-3 py-2 text-center text-xs font-bold uppercase tracking-wider w-12">Pts</th>
                        )}
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold uppercase tracking-wider">Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    {subjects.length === 0 ? (
                        <tr>
                            <td colSpan={isCBC ? 7 : 8} className="border border-gray-300 px-3 py-4 text-center text-gray-400 text-xs">
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
                            {!isCBC && (
                                <td className="border border-gray-300 px-3 py-2 text-center text-gray-600">{s.points}</td>
                            )}
                            <td className="border border-gray-300 px-3 py-2 text-xs text-gray-500">{s.remarks || '—'}</td>
                        </tr>
                    ))}
                </tbody>
                {summary.subjects_sat > 0 && (
                    <tfoot>
                        <tr className="bg-gray-100 font-bold">
                            <td className="border border-gray-300 px-3 py-2 text-xs" colSpan={2}>
                                TOTAL / MEAN
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-center text-sm">
                                {summary.total_marks}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-500">
                                {summary.total_out_of}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-center text-sm">
                                {summary.average_pct !== null ? `${summary.average_pct}%` : '—'}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-center text-sm">
                                {summary.mean_grade}
                            </td>
                            {!isCBC && (
                                <td className="border border-gray-300 px-3 py-2 text-center text-sm">
                                    {summary.mean_points ?? '—'}
                                </td>
                            )}
                            <td className="border border-gray-300 px-3 py-2"></td>
                        </tr>
                    </tfoot>
                )}
            </table>

            {/* ── Grading scale reference ── */}
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
                    EE — Exceeding Expectations &nbsp;
                    ME — Meeting Expectations &nbsp;
                    AE — Approaching Expectations &nbsp;
                    BE — Below Expectations
                </div>
            )}

            {/* ── Signatures ── */}
            <div className="grid grid-cols-3 gap-8 mt-8 pt-4 border-t border-gray-300 text-sm">
                <div>
                    <div className="border-b border-gray-400 mb-1 h-8"></div>
                    <p className="text-xs text-gray-500">Class Teacher</p>
                </div>
                <div>
                    <div className="border-b border-gray-400 mb-1 h-8"></div>
                    <p className="text-xs text-gray-500">Principal / Head Teacher</p>
                </div>
                <div>
                    <div className="border-b border-gray-400 mb-1 h-8"></div>
                    <p className="text-xs text-gray-500">Parent / Guardian</p>
                </div>
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
    const [classes, setClasses]       = useState([]);
    const [exams, setExams]           = useState([]);
    const [students, setStudents]     = useState([]);

    const [classId, setClassId]       = useState('');
    const [examId, setExamId]         = useState('');
    const [search, setSearch]         = useState('');

    const [loadingList, setLoadingList]   = useState(true);
    const [loadingCard, setLoadingCard]   = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [reportData, setReportData]     = useState(null);

    const printRef = useRef(null);

    // ── Load classes, exams, students on mount ────────────────────────────────
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

    // ── Reload student list when class changes ────────────────────────────────
    useEffect(() => {
        setSelectedStudent(null);
        setReportData(null);
        setSearch('');
        setLoadingList(true);
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

    // ── Load report card for selected student ─────────────────────────────────
    const loadCard = (student) => {
        setSelectedStudent(student);
        setReportData(null);
        setLoadingCard(true);
        const params = examId ? `?exam_id=${examId}` : '';
        window.axios.get(`/api/teacher/report-card/${student.id}${params}`)
            .then(res => setReportData(res.data))
            .catch(() => window.showToast?.('error', 'Failed to load report card.'))
            .finally(() => setLoadingCard(false));
    };

    // When exam changes, reload card for current student
    useEffect(() => {
        if (selectedStudent && examId) {
            loadCard(selectedStudent);
        }
    }, [examId]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Print handler ─────────────────────────────────────────────────────────
    const handlePrint = () => {
        const content = document.getElementById('report-card-print');
        if (!content) return;
        const win = window.open('', '_blank', 'width=850,height=1100');
        win.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Report Card – ${reportData?.student?.name ?? 'Student'}</title>
                <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: Arial, Helvetica, sans-serif; font-size: 13px;
                           color: #111; padding: 32px 40px; }
                    h1 { font-size: 18px; font-weight: bold; text-transform: uppercase;
                         letter-spacing: 0.05em; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #888; padding: 6px 10px; }
                    th { background: #f0f0f0; font-size: 11px; text-transform: uppercase;
                         letter-spacing: 0.05em; }
                    tfoot tr { background: #f0f0f0; font-weight: bold; }
                    .bg-gray-50 { background: #f9f9f9; }
                    .border-b-2 { border-bottom: 2px solid #111; padding-bottom: 16px; margin-bottom: 20px; }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .grid-cols-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
                    .grid-cols-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px; }
                    .border { border: 1px solid #ccc; border-radius: 4px; margin-bottom: 20px; }
                    .border-header { background: #f0f0f0; padding: 6px 16px;
                                     border-bottom: 1px solid #ccc; font-size: 11px;
                                     font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; }
                    .student-grid { display: grid; grid-template-columns: 1fr 1fr;
                                    gap: 8px 24px; padding: 12px 16px; font-size: 13px; }
                    .sig-line { border-bottom: 1px solid #666; height: 32px; margin-bottom: 4px; }
                    .scale { font-size: 11px; color: #666; margin-bottom: 20px; }
                    .footer { text-align: center; font-size: 10px; color: #999; margin-top: 24px; }
                    @media print { @page { margin: 20mm 15mm; } }
                </style>
            </head>
            <body>
                ${content.innerHTML}
            </body>
            </html>
        `);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); }, 400);
    };

    // ── Filtered students ─────────────────────────────────────────────────────
    const filtered = students.filter(s =>
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.admission_number ?? '').toLowerCase().includes(search.toLowerCase())
    );

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-5 pb-20">

            {/* Page header */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Report Cards</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Select a student to preview and print their report card.
                </p>
            </div>

            <div className="flex gap-5 items-start">

                {/* ── LEFT: student selector ─────────────────────────────────── */}
                <div className="w-72 shrink-0 space-y-3">

                    {/* Filters */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                Class
                            </label>
                            <select
                                value={classId}
                                onChange={e => setClassId(e.target.value)}
                                className={inputCls}
                            >
                                <option value="">All classes</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                Examination
                            </label>
                            <select
                                value={examId}
                                onChange={e => setExamId(e.target.value)}
                                className={inputCls}
                            >
                                <option value="">Select examination</option>
                                {exams.map(e => (
                                    <option key={e.id} value={e.id}>{e.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                Search student
                            </label>
                            <input
                                type="text"
                                placeholder="Name or admission no."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className={inputCls}
                            />
                        </div>
                    </div>

                    {/* Student list */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Students
                            </span>
                            <span className="text-[11px] text-gray-400 dark:text-gray-500">
                                {filtered.length}
                            </span>
                        </div>
                        <div className="max-h-[520px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/50">
                            {loadingList ? (
                                <div className="py-10 text-center text-sm text-gray-400">Loading...</div>
                            ) : filtered.length === 0 ? (
                                <div className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                                    No students found.
                                </div>
                            ) : filtered.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => loadCard(s)}
                                    className={`w-full text-left px-4 py-3 transition-colors ${
                                        selectedStudent?.id === s.id
                                            ? 'bg-gray-900 dark:bg-gray-100'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
                                    }`}
                                >
                                    <p className={`text-sm font-semibold ${
                                        selectedStudent?.id === s.id
                                            ? 'text-white dark:text-gray-900'
                                            : 'text-gray-900 dark:text-gray-100'
                                    }`}>
                                        {s.name}
                                    </p>
                                    <p className={`text-xs mt-0.5 ${
                                        selectedStudent?.id === s.id
                                            ? 'text-gray-300 dark:text-gray-600'
                                            : 'text-gray-400 dark:text-gray-500'
                                    }`}>
                                        {s.admission_number} &middot; {s.grade_level}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: report card preview ─────────────────────────────── */}
                <div className="flex-1 min-w-0">
                    {!selectedStudent && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center" style={{ minHeight: 480 }}>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-gray-400 dark:text-gray-500">
                                    No student selected
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    Choose a student from the list to preview their report card.
                                </p>
                            </div>
                        </div>
                    )}

                    {selectedStudent && loadingCard && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center" style={{ minHeight: 480 }}>
                            <p className="text-sm text-gray-400">Loading report card...</p>
                        </div>
                    )}

                    {selectedStudent && !loadingCard && reportData && (
                        <div className="space-y-3">
                            {/* Action bar */}
                            <div className="flex items-center justify-between gap-3">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Previewing: <span className="font-semibold text-gray-900 dark:text-gray-100">{reportData.student.name}</span>
                                    <span className="mx-2">&middot;</span>
                                    {reportData.exam?.name ?? 'No exam selected'}
                                </div>
                                <button
                                    onClick={handlePrint}
                                    className="shrink-0 flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Print / Save PDF
                                </button>
                            </div>

                            {/* Preview wrapper — white A4-like card */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-8 py-7">
                                    <ReportCard ref={printRef} data={reportData} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherReports;
