import React, { useState, useEffect } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

const CBC_LEVELS = ['EE', 'ME', 'AE', 'BE'];

const CBC_LEVEL_FULL = {
    EE: 'Exceeding Expectations',
    ME: 'Meeting Expectations',
    AE: 'Approaching Expectations',
    BE: 'Below Expectations',
};

// Derive grade + points from a percentage score (8-4-4)
const gradeFromPct = (marks, outOf) => {
    const p = (marks / outOf) * 100;
    if (p >= 80) return { grade: 'A',   points: 12 };
    if (p >= 75) return { grade: 'A-',  points: 11 };
    if (p >= 70) return { grade: 'B+',  points: 10 };
    if (p >= 65) return { grade: 'B',   points: 9  };
    if (p >= 60) return { grade: 'B-',  points: 8  };
    if (p >= 55) return { grade: 'C+',  points: 7  };
    if (p >= 50) return { grade: 'C',   points: 6  };
    if (p >= 45) return { grade: 'C-',  points: 5  };
    if (p >= 40) return { grade: 'D+',  points: 4  };
    if (p >= 35) return { grade: 'D',   points: 3  };
    if (p >= 30) return { grade: 'D-',  points: 2  };
    return           { grade: 'E',   points: 1  };
};

// Detect curriculum from the class object returned by the API
const detectCurriculum = (cls) => {
    if (!cls) return null;
    // Prefer explicit field
    if (cls.curriculum_type) return cls.curriculum_type;
    // Fall back to parsing the class name / grade_level string
    const raw = ((cls.grade_level || cls.name || '')).toLowerCase();
    if (raw.includes('form')) return '844';
    if (raw.includes('grade')) return 'CBC';
    return '844'; // default
};

// ─── Shared input style ───────────────────────────────────────────────────────

const inputCls =
    'w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm ' +
    'bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-400 ' +
    'disabled:bg-gray-50 dark:disabled:bg-gray-700/50 disabled:cursor-not-allowed';

const cellInputCls =
    'px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded text-sm ' +
    'bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-400 ' +
    'disabled:bg-gray-50 dark:disabled:bg-gray-700/60 disabled:cursor-not-allowed';

// ─── Component ────────────────────────────────────────────────────────────────

const TeacherGrades = () => {
    const [exams, setExams]       = useState([]);
    const [classes, setClasses]   = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [examId, setExamId]       = useState('');
    const [classId, setClassId]     = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [outOf, setOutOf]         = useState(100);
    const [term, setTerm]           = useState(1);
    const [year, setYear]           = useState(new Date().getFullYear());

    const [rows, setRows]                 = useState([]);
    const [curriculumType, setCurriculumType] = useState(null); // 'CBC' | '844'
    const [loading, setLoading]           = useState(false);
    const [saving, setSaving]             = useState(false);
    const [submitted, setSubmitted]       = useState(false);
    const [showConfirm, setShowConfirm]   = useState(false);

    // ── Initial data load ────────────────────────────────────────────────────

    useEffect(() => {
        Promise.all([
            window.axios.get('/api/teacher/grades/exams'),
            window.axios.get('/api/teacher/classes'),
        ]).then(([eRes, cRes]) => {
            setExams(eRes.data);
            setClasses(cRes.data);
            if (eRes.data.length) setExamId(String(eRes.data[0].id));
            if (cRes.data.length) {
                const first = cRes.data[0];
                setClassId(String(first.id));
                setCurriculumType(detectCurriculum(first));
            }
        }).catch(() => {});
    }, []);

    // ── Load subjects when class changes ─────────────────────────────────────

    useEffect(() => {
        if (!classId) return;
        const cls = classes.find(c => String(c.id) === classId);
        if (cls) setCurriculumType(detectCurriculum(cls));

        setSubjectId('');
        setRows([]);
        setSubmitted(false);

        window.axios.get(`/api/teacher/subjects?class_id=${classId}`)
            .then(res => setSubjects(res.data))
            .catch(() => setSubjects([]));
    }, [classId]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Load students ────────────────────────────────────────────────────────

    const canLoad = examId && classId && subjectId;

    const loadStudents = async () => {
        if (!canLoad) return;
        setLoading(true);
        setSubmitted(false);
        setRows([]);
        try {
            const params = new URLSearchParams({ class_id: classId, subject_id: subjectId });
            const res = await window.axios.get(`/api/teacher/grades/${examId}/students?${params}`);
            const students = res.data.students || res.data;
            setRows(students.map(s => ({
                ...s,
                marks: s.marks  ?? '',
                level: s.level  ?? null,
                remarks: s.remarks ?? '',
            })));
        } catch { /* silent — toast on 4xx already handled by interceptor */ }
        finally { setLoading(false); }
    };

    // ── Row field setters ────────────────────────────────────────────────────

    const setMark    = (i, v) => setRows(r => r.map((row, idx) => idx === i ? { ...row, marks: v }   : row));
    const setLevel   = (i, v) => setRows(r => r.map((row, idx) => idx === i ? { ...row, level: v }   : row));
    const setRemarks = (i, v) => setRows(r => r.map((row, idx) => idx === i ? { ...row, remarks: v } : row));

    // ── Build API payload ────────────────────────────────────────────────────

    const buildPayload = (isDraft) => ({
        exam_id:         examId,
        class_id:        classId,
        subject_id:      subjectId,
        out_of:          outOf,
        term,
        year,
        curriculum_type: curriculumType,
        is_submitted:    !isDraft,
        marks: rows
            .filter(r => curriculumType === 'CBC' ? r.level !== null : r.marks !== '')
            .map(r => ({
                student_id: r.student_id || r.id,
                marks:      curriculumType === '844' ? parseFloat(r.marks) : null,
                level:      curriculumType === 'CBC' ? r.level : null,
                remarks:    r.remarks || '',
            })),
    });

    // ── Save draft ───────────────────────────────────────────────────────────

    const handleDraft = async () => {
        setSaving(true);
        try {
            await window.axios.post('/api/teacher/grades', buildPayload(true));
            window.showToast?.('success', 'Draft saved.');
        } catch (err) {
            window.showToast?.('error', err.response?.data?.message || 'Failed to save draft.');
        } finally { setSaving(false); }
    };

    // ── Submit & release ─────────────────────────────────────────────────────

    const handleSubmit = async () => {
        setShowConfirm(false);
        setSaving(true);
        try {
            await window.axios.post('/api/teacher/grades', buildPayload(false));
            setSubmitted(true);
            window.showToast?.('success', 'Marks submitted and released to parents.');
        } catch (err) {
            window.showToast?.('error', err.response?.data?.message || 'Failed to submit marks.');
        } finally { setSaving(false); }
    };

    // ── Summary calculations ─────────────────────────────────────────────────

    const summary844 = () => {
        const entered = rows.filter(r => r.marks !== '' && !isNaN(Number(r.marks)));
        if (!entered.length) return null;
        const scores = entered.map(r => Number(r.marks));
        const pcts   = scores.map(s => (s / Number(outOf)) * 100);
        const mean   = pcts.reduce((a, b) => a + b, 0) / pcts.length;
        return {
            count:   entered.length,
            mean:    mean.toFixed(1),
            highest: Math.max(...scores),
            lowest:  Math.min(...scores),
        };
    };

    const summaryCBC = () => {
        const entered = rows.filter(r => r.level);
        if (!entered.length) return null;
        const counts = { EE: 0, ME: 0, AE: 0, BE: 0 };
        entered.forEach(r => { if (r.level in counts) counts[r.level]++; });
        return { counts, total: entered.length };
    };

    // ── Derived UI values ────────────────────────────────────────────────────

    const selectedExam    = exams.find(e => String(e.id) === examId);
    const selectedSubject = subjects.find(s => String(s.id) === subjectId);

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="space-y-5 pb-20">

            {/* Page header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Enter Grades</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {curriculumType === 'CBC'
                            ? 'CBC — assign a performance level per student per subject.'
                            : curriculumType === '844'
                            ? '8-4-4 — enter scores and grades are calculated automatically.'
                            : 'Select a class to determine the assessment mode.'}
                    </p>
                </div>
                {curriculumType && (
                    <span className="mt-1 shrink-0 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-[10px] font-semibold px-2.5 py-1 rounded uppercase tracking-wider">
                        {curriculumType === 'CBC' ? 'CBC' : '8-4-4'}
                    </span>
                )}
            </div>

            {/* ── Filter / selection panel ── */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Assessment Details
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
                            Class
                        </label>
                        <select
                            value={classId}
                            onChange={e => setClassId(e.target.value)}
                            className={inputCls}
                        >
                            <option value="">Select class</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                            Subject
                        </label>
                        <select
                            value={subjectId}
                            onChange={e => setSubjectId(e.target.value)}
                            disabled={!classId || subjects.length === 0}
                            className={inputCls}
                        >
                            <option value="">
                                {!classId ? 'Select a class first' : subjects.length === 0 ? 'No subjects assigned' : 'Select subject'}
                            </option>
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                            Term
                        </label>
                        <select
                            value={term}
                            onChange={e => setTerm(Number(e.target.value))}
                            className={inputCls}
                        >
                            <option value={1}>Term 1</option>
                            <option value={2}>Term 2</option>
                            <option value={3}>Term 3</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                            Year
                        </label>
                        <input
                            type="number"
                            min="2020"
                            max="2040"
                            value={year}
                            onChange={e => setYear(Number(e.target.value))}
                            className={inputCls}
                        />
                    </div>
                    {curriculumType === '844' && (
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                Maximum Score
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="1000"
                                value={outOf}
                                onChange={e => setOutOf(Number(e.target.value))}
                                className={inputCls}
                            />
                        </div>
                    )}
                </div>

                <div className="mt-4 flex items-center gap-4">
                    <button
                        onClick={loadStudents}
                        disabled={!canLoad || loading}
                        className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200 disabled:opacity-40 transition-colors"
                    >
                        {loading ? 'Loading students...' : 'Load Students'}
                    </button>
                    {selectedExam && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                            {selectedExam.name}
                            {selectedExam.assessment_type && ` \u00b7 ${selectedExam.assessment_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
                        </span>
                    )}
                </div>
            </div>

            {/* ── Marks entry table ── */}
            {rows.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">

                    {/* Table header bar */}
                    <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
                        <div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {selectedSubject?.name || 'Subject'}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                                {rows.length} student{rows.length !== 1 ? 's' : ''}
                                {' '}&middot;{' '}Term {term} &middot; {year}
                                {curriculumType === '844' && ` \u00b7 Out of ${outOf}`}
                            </span>
                        </div>
                        {submitted && (
                            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border border-gray-300 dark:border-gray-600 px-2 py-0.5 rounded">
                                Submitted
                            </span>
                        )}
                    </div>

                    <div className="overflow-x-auto">

                        {/* ── 8-4-4 marks table ── */}
                        {curriculumType === '844' && (
                            <table className="w-full text-left min-w-[620px]">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                    <tr>
                                        <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10">#</th>
                                        <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                                        <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">Score</th>
                                        <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20 text-center">Grade</th>
                                        <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16 text-center">Pts</th>
                                        <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                    {rows.map((row, i) => {
                                        const result =
                                            row.marks !== '' && !isNaN(Number(row.marks))
                                                ? gradeFromPct(Number(row.marks), Number(outOf))
                                                : null;
                                        return (
                                            <tr
                                                key={row.student_id || row.id || i}
                                                className="hover:bg-gray-50/60 dark:hover:bg-gray-700/25 transition-colors"
                                            >
                                                <td className="px-5 py-3 text-xs text-gray-400 dark:text-gray-500">
                                                    {i + 1}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                        {row.name}
                                                    </p>
                                                    {row.admission_number && (
                                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                                            {row.admission_number}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={outOf}
                                                        value={row.marks}
                                                        onChange={e => setMark(i, e.target.value)}
                                                        disabled={submitted}
                                                        placeholder="—"
                                                        className={`w-20 text-center font-semibold ${cellInputCls}`}
                                                    />
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                        {result
                                                            ? result.grade
                                                            : <span className="text-gray-300 dark:text-gray-600 font-normal">—</span>}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                                                    {result ? result.points : '—'}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <input
                                                        type="text"
                                                        value={row.remarks}
                                                        onChange={e => setRemarks(i, e.target.value)}
                                                        disabled={submitted}
                                                        placeholder="Optional remark"
                                                        className={`w-full text-xs ${cellInputCls}`}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}

                        {/* ── CBC performance level table ── */}
                        {curriculumType === 'CBC' && (
                            <table className="w-full text-left min-w-[640px]">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                    <tr>
                                        <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10">#</th>
                                        <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                                        <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Performance Level
                                        </th>
                                        <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24 text-center">
                                            Score (opt.)
                                        </th>
                                        <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Remarks
                                        </th>
                                    </tr>
                                </thead>
                                <thead className="border-b border-gray-100 dark:border-gray-700/60">
                                    <tr>
                                        <td colSpan="5" className="px-5 py-2 text-[10px] text-gray-400 dark:text-gray-500">
                                            EE &mdash; {CBC_LEVEL_FULL.EE}&nbsp;&nbsp;
                                            ME &mdash; {CBC_LEVEL_FULL.ME}&nbsp;&nbsp;
                                            AE &mdash; {CBC_LEVEL_FULL.AE}&nbsp;&nbsp;
                                            BE &mdash; {CBC_LEVEL_FULL.BE}
                                        </td>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                    {rows.map((row, i) => (
                                        <tr
                                            key={row.student_id || row.id || i}
                                            className="hover:bg-gray-50/60 dark:hover:bg-gray-700/25 transition-colors"
                                        >
                                            <td className="px-5 py-3 text-xs text-gray-400 dark:text-gray-500">
                                                {i + 1}
                                            </td>
                                            <td className="px-5 py-3">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    {row.name}
                                                </p>
                                                {row.admission_number && (
                                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                                        {row.admission_number}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex gap-1.5">
                                                    {CBC_LEVELS.map(lvl => (
                                                        <button
                                                            key={lvl}
                                                            type="button"
                                                            title={CBC_LEVEL_FULL[lvl]}
                                                            onClick={() => {
                                                                if (!submitted) setLevel(i, row.level === lvl ? null : lvl);
                                                            }}
                                                            disabled={submitted}
                                                            className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors disabled:cursor-default ${
                                                                row.level === lvl
                                                                    ? 'border-gray-900 dark:border-gray-100 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                                                                    : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-500 dark:hover:border-gray-400'
                                                            }`}
                                                        >
                                                            {lvl}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={row.marks}
                                                    onChange={e => setMark(i, e.target.value)}
                                                    disabled={submitted}
                                                    placeholder="—"
                                                    className={`w-16 text-center text-xs ${cellInputCls}`}
                                                />
                                            </td>
                                            <td className="px-5 py-3">
                                                <input
                                                    type="text"
                                                    value={row.remarks}
                                                    onChange={e => setRemarks(i, e.target.value)}
                                                    disabled={submitted}
                                                    placeholder="Optional remark"
                                                    className={`w-full text-xs ${cellInputCls}`}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* ── Summary row ── */}
                    {curriculumType === '844' && (() => {
                        const s = summary844();
                        return s ? (
                            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                    <span>
                                        <span className="font-semibold text-gray-900 dark:text-gray-100">{s.count}</span> marked
                                    </span>
                                    <span>
                                        Class mean: <span className="font-semibold text-gray-900 dark:text-gray-100">{s.mean}%</span>
                                    </span>
                                    <span>
                                        Highest: <span className="font-semibold text-gray-900 dark:text-gray-100">{s.highest}</span>
                                    </span>
                                    <span>
                                        Lowest: <span className="font-semibold text-gray-900 dark:text-gray-100">{s.lowest}</span>
                                    </span>
                                </div>
                            </div>
                        ) : null;
                    })()}

                    {curriculumType === 'CBC' && (() => {
                        const s = summaryCBC();
                        return s ? (
                            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                    <span>
                                        <span className="font-semibold text-gray-900 dark:text-gray-100">{s.total}</span> assessed
                                    </span>
                                    {Object.entries(s.counts).map(([lvl, cnt]) => (
                                        <span key={lvl}>
                                            {lvl}: <span className="font-semibold text-gray-900 dark:text-gray-100">{cnt}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : null;
                    })()}

                    {/* ── Action bar ── */}
                    {!submitted ? (
                        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                Submitting will release marks to parents and lock this record.
                            </p>
                            <div className="flex gap-3 shrink-0">
                                <button
                                    onClick={handleDraft}
                                    disabled={saving}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                                >
                                    Save Draft
                                </button>
                                <button
                                    onClick={() => setShowConfirm(true)}
                                    disabled={saving}
                                    className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200 disabled:opacity-50 transition-colors"
                                >
                                    Submit &amp; Release
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 text-center text-sm text-gray-400 dark:text-gray-500">
                            Marks have been submitted. Contact school administration to unlock for editing.
                        </div>
                    )}
                </div>
            )}

            {/* ── Submit confirmation dialog ── */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl w-full max-w-sm p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            Submit &amp; Release Marks
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                            This will lock the marks record and release results to parents immediately.
                            This action cannot be undone without administrator approval.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
                            >
                                Confirm Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherGrades;
