import React, { useState, useEffect } from 'react';

const CBC_LEVELS = ['EE', 'ME', 'AE', 'BE'];
const CBC_LEVEL_FULL = {
    EE: 'Exceeding Expectations',
    ME: 'Meeting Expectations',
    AE: 'Approaching Expectations',
    BE: 'Below Expectations',
};

const gradeFromPct = (marks, outOf) => {
    const p = (marks / outOf) * 100;
    if (p >= 80) return { grade: 'A',  points: 12 };
    if (p >= 75) return { grade: 'A-', points: 11 };
    if (p >= 70) return { grade: 'B+', points: 10 };
    if (p >= 65) return { grade: 'B',  points: 9  };
    if (p >= 60) return { grade: 'B-', points: 8  };
    if (p >= 55) return { grade: 'C+', points: 7  };
    if (p >= 50) return { grade: 'C',  points: 6  };
    if (p >= 45) return { grade: 'C-', points: 5  };
    if (p >= 40) return { grade: 'D+', points: 4  };
    if (p >= 35) return { grade: 'D',  points: 3  };
    if (p >= 30) return { grade: 'D-', points: 2  };
    return           { grade: 'E',  points: 1  };
};

const detectCurriculum = (cls) => {
    if (!cls) return null;
    if (cls.curriculum_type) return cls.curriculum_type;
    const raw = ((cls.grade_level || cls.name || '')).toLowerCase();
    if (raw.includes('form'))  return '844';
    if (raw.includes('grade')) return 'CBC';
    return '844';
};

const inputCls = "px-2.5 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed";
const cellInputCls = "px-2 py-1 border border-slate-200 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 dark:disabled:bg-gray-700/60 disabled:cursor-not-allowed";

const TeacherGrades = () => {
    const [exams,    setExams]    = useState([]);
    const [classes,  setClasses]  = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [examId,    setExamId]    = useState('');
    const [classId,   setClassId]   = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [outOf,     setOutOf]     = useState(100);
    const [term,      setTerm]      = useState(1);
    const [year,      setYear]      = useState(new Date().getFullYear());

    const [rows,           setRows]           = useState([]);
    const [curriculumType, setCurriculumType] = useState(null);
    const [loading,        setLoading]        = useState(false);
    const [saving,         setSaving]         = useState(false);
    const [submitted,      setSubmitted]      = useState(false);
    const [showConfirm,    setShowConfirm]    = useState(false);

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

    useEffect(() => {
        if (!classId) return;
        const cls = classes.find(c => String(c.id) === classId);
        if (cls) setCurriculumType(detectCurriculum(cls));
        setSubjectId(''); setRows([]); setSubmitted(false);
        window.axios.get(`/api/teacher/subjects?class_id=${classId}`)
            .then(res => setSubjects(res.data))
            .catch(() => setSubjects([]));
    }, [classId]); // eslint-disable-line react-hooks/exhaustive-deps

    const canLoad = examId && classId && subjectId;

    const loadStudents = async () => {
        if (!canLoad) return;
        setLoading(true); setSubmitted(false); setRows([]);
        try {
            const params = new URLSearchParams({ class_id: classId, subject_id: subjectId });
            const res = await window.axios.get(`/api/teacher/grades/${examId}/students?${params}`);
            const students = res.data.students || res.data;
            setRows(students.map(s => ({ ...s, marks: s.marks ?? '', level: s.level ?? null, remarks: s.remarks ?? '' })));
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    const setMark    = (i, v) => setRows(r => r.map((row, idx) => idx === i ? { ...row, marks: v }   : row));
    const setLevel   = (i, v) => setRows(r => r.map((row, idx) => idx === i ? { ...row, level: v }   : row));
    const setRemarks = (i, v) => setRows(r => r.map((row, idx) => idx === i ? { ...row, remarks: v } : row));

    const buildPayload = (isDraft) => ({
        exam_id: examId, class_id: classId, subject_id: subjectId,
        out_of: outOf, term, year, curriculum_type: curriculumType,
        is_submitted: !isDraft,
        marks: rows
            .filter(r => curriculumType === 'CBC' ? r.level !== null : r.marks !== '')
            .map(r => ({
                student_id: r.student_id || r.id,
                marks:   curriculumType === '844' ? parseFloat(r.marks) : null,
                level:   curriculumType === 'CBC' ? r.level : null,
                remarks: r.remarks || '',
            })),
    });

    const handleDraft = async () => {
        setSaving(true);
        try {
            await window.axios.post('/api/teacher/grades', buildPayload(true));
            window.showToast?.('success', 'Draft saved.');
        } catch (err) {
            window.showToast?.('error', err.response?.data?.message || 'Failed to save draft.');
        } finally { setSaving(false); }
    };

    const handleSubmit = async () => {
        setShowConfirm(false); setSaving(true);
        try {
            await window.axios.post('/api/teacher/grades', buildPayload(false));
            setSubmitted(true);
            window.showToast?.('success', 'Marks submitted and released to parents.');
        } catch (err) {
            window.showToast?.('error', err.response?.data?.message || 'Failed to submit marks.');
        } finally { setSaving(false); }
    };

    const summary844 = () => {
        const entered = rows.filter(r => r.marks !== '' && !isNaN(Number(r.marks)));
        if (!entered.length) return null;
        const scores = entered.map(r => Number(r.marks));
        const pcts   = scores.map(s => (s / Number(outOf)) * 100);
        const mean   = pcts.reduce((a, b) => a + b, 0) / pcts.length;
        return { count: entered.length, mean: mean.toFixed(1), highest: Math.max(...scores), lowest: Math.min(...scores) };
    };

    const summaryCBC = () => {
        const entered = rows.filter(r => r.level);
        if (!entered.length) return null;
        const counts = { EE: 0, ME: 0, AE: 0, BE: 0 };
        entered.forEach(r => { if (r.level in counts) counts[r.level]++; });
        return { counts, total: entered.length };
    };

    const selectedExam    = exams.find(e => String(e.id) === examId);
    const selectedSubject = subjects.find(s => String(s.id) === subjectId);

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Teacher <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Enter Grades</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">
                        Enter Grades
                        {curriculumType && (
                            <span className="ml-2 text-[10px] font-bold uppercase tracking-wider border border-slate-300 dark:border-gray-600 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">
                                {curriculumType === 'CBC' ? 'CBC' : '8-4-4'}
                            </span>
                        )}
                    </h1>
                </div>
                {submitted && (
                    <span className="inline-block px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Submitted ✓
                    </span>
                )}
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap gap-2 items-end flex-shrink-0">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Examination</label>
                    <select value={examId} onChange={e => setExamId(e.target.value)} className={inputCls}>
                        <option value="">Select examination</option>
                        {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Class</label>
                    <select value={classId} onChange={e => setClassId(e.target.value)} className={inputCls}>
                        <option value="">Select class</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Subject</label>
                    <select value={subjectId} onChange={e => setSubjectId(e.target.value)}
                        disabled={!classId || subjects.length === 0} className={inputCls}>
                        <option value="">
                            {!classId ? 'Select class first' : subjects.length === 0 ? 'No subjects' : 'Select subject'}
                        </option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Term</label>
                    <select value={term} onChange={e => setTerm(Number(e.target.value))} className={inputCls}>
                        <option value={1}>Term 1</option>
                        <option value={2}>Term 2</option>
                        <option value={3}>Term 3</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Year</label>
                    <input type="number" min="2020" max="2040" value={year}
                        onChange={e => setYear(Number(e.target.value))} className={inputCls} style={{ width: 72 }}/>
                </div>
                {curriculumType === '844' && (
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Max Score</label>
                        <input type="number" min="1" max="1000" value={outOf}
                            onChange={e => setOutOf(Number(e.target.value))} className={inputCls} style={{ width: 72 }}/>
                    </div>
                )}
                <button onClick={loadStudents} disabled={!canLoad || loading}
                    className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors self-end">
                    {loading ? 'Loading…' : 'Load Students'}
                </button>
                {selectedExam && (
                    <span className="text-[10px] text-slate-400 self-end pb-1.5">
                        {selectedExam.name}
                        {selectedExam.assessment_type && ` · ${selectedExam.assessment_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
                    </span>
                )}
            </div>

            {/* Marks table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {rows.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-slate-400 text-sm">
                            {loading ? 'Loading students…' : 'Select exam, class and subject then click Load Students.'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Table header bar */}
                        <div className="flex-shrink-0 px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                {selectedSubject?.name || 'Marks Entry'} —{' '}
                                {rows.length} student{rows.length !== 1 ? 's' : ''} · Term {term} · {year}
                                {curriculumType === '844' && ` · out of ${outOf}`}
                                {curriculumType === 'CBC' && ' · EE ME AE BE'}
                            </span>
                            {submitted && (
                                <span className="text-[9px] font-bold uppercase tracking-wider border border-slate-300 dark:border-gray-600 text-slate-500 px-1.5 py-0.5 rounded">
                                    Submitted — locked
                                </span>
                            )}
                        </div>

                        <div className="overflow-auto flex-1">

                            {/* 8-4-4 table */}
                            {curriculumType === '844' && (
                                <table className="w-full text-left border-collapse" style={{ minWidth: 620 }}>
                                    <thead className="sticky top-0 z-10">
                                        <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Adm No</th>
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Student</th>
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28 text-center">Score / {outOf}</th>
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-center">Grade</th>
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-12 text-center">Pts</th>
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row, i) => {
                                            const result = row.marks !== '' && !isNaN(Number(row.marks))
                                                ? gradeFromPct(Number(row.marks), Number(outOf)) : null;
                                            return (
                                                <tr key={row.student_id || row.id || i}
                                                    className={`border-b border-slate-100 dark:border-gray-700/60 transition-colors ${
                                                        i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                                    }`}>
                                                    <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">
                                                        {String(i + 1).padStart(2, '0')}
                                                    </td>
                                                    <td className="px-3 py-2 font-mono text-xs text-slate-500 dark:text-slate-400 tracking-wide">
                                                        {row.admission_number || '—'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                        {row.name}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <input type="number" min="0" max={outOf}
                                                            value={row.marks} onChange={e => setMark(i, e.target.value)}
                                                            disabled={submitted} placeholder="—"
                                                            className={`w-20 text-center font-semibold ${cellInputCls}`}/>
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-sm font-bold text-slate-800 dark:text-slate-100">
                                                        {result ? result.grade : <span className="text-slate-300 dark:text-slate-600 font-normal">—</span>}
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-xs text-slate-500 dark:text-slate-400">
                                                        {result ? result.points : '—'}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input type="text" value={row.remarks}
                                                            onChange={e => setRemarks(i, e.target.value)}
                                                            disabled={submitted} placeholder="Optional remark"
                                                            className={`w-full ${cellInputCls}`}/>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}

                            {/* CBC table */}
                            {curriculumType === 'CBC' && (
                                <table className="w-full text-left border-collapse" style={{ minWidth: 640 }}>
                                    <thead className="sticky top-0 z-10">
                                        <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Adm No</th>
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Student</th>
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-48">
                                                Level — EE · ME · AE · BE
                                            </th>
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Score</th>
                                            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row, i) => (
                                            <tr key={row.student_id || row.id || i}
                                                className={`border-b border-slate-100 dark:border-gray-700/60 transition-colors ${
                                                    i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                                }`}>
                                                <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">
                                                    {String(i + 1).padStart(2, '0')}
                                                </td>
                                                <td className="px-3 py-2 font-mono text-xs text-slate-500 dark:text-slate-400 tracking-wide">
                                                    {row.admission_number || '—'}
                                                </td>
                                                <td className="px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                    {row.name}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="flex gap-1">
                                                        {CBC_LEVELS.map(lvl => (
                                                            <button key={lvl} type="button" title={CBC_LEVEL_FULL[lvl]}
                                                                onClick={() => { if (!submitted) setLevel(i, row.level === lvl ? null : lvl); }}
                                                                disabled={submitted}
                                                                className={`w-8 h-7 flex items-center justify-center rounded text-[10px] font-black transition-colors disabled:cursor-default ${
                                                                    row.level === lvl
                                                                        ? 'bg-primary text-white'
                                                                        : 'bg-slate-100 text-slate-400 dark:bg-gray-700 dark:text-gray-500 hover:bg-slate-200 dark:hover:bg-gray-600'
                                                                }`}>
                                                                {lvl}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <input type="number" min="0" max="100"
                                                        value={row.marks} onChange={e => setMark(i, e.target.value)}
                                                        disabled={submitted} placeholder="—"
                                                        className={`w-16 text-center ${cellInputCls}`}/>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input type="text" value={row.remarks}
                                                        onChange={e => setRemarks(i, e.target.value)}
                                                        disabled={submitted} placeholder="Optional remark"
                                                        className={`w-full ${cellInputCls}`}/>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Summary + actions footer */}
                        <div className="flex-shrink-0 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            {/* Summary strip */}
                            {curriculumType === '844' && (() => {
                                const s = summary844();
                                return s ? (
                                    <div className="px-4 py-1.5 border-b border-slate-100 dark:border-gray-700 flex flex-wrap gap-x-6 gap-y-1">
                                        {[
                                            { label: 'Marked',  value: s.count },
                                            { label: 'Mean',    value: `${s.mean}%` },
                                            { label: 'Highest', value: s.highest },
                                            { label: 'Lowest',  value: s.lowest },
                                        ].map(item => (
                                            <span key={item.label} className="text-[10px] text-slate-400 uppercase tracking-wider">
                                                {item.label}: <span className="font-bold text-slate-700 dark:text-slate-200">{item.value}</span>
                                            </span>
                                        ))}
                                    </div>
                                ) : null;
                            })()}
                            {curriculumType === 'CBC' && (() => {
                                const s = summaryCBC();
                                return s ? (
                                    <div className="px-4 py-1.5 border-b border-slate-100 dark:border-gray-700 flex flex-wrap gap-x-6 gap-y-1">
                                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                                            Assessed: <span className="font-bold text-slate-700 dark:text-slate-200">{s.total}</span>
                                        </span>
                                        {Object.entries(s.counts).map(([lvl, cnt]) => (
                                            <span key={lvl} className="text-[10px] text-slate-400 uppercase tracking-wider">
                                                {lvl}: <span className="font-bold text-slate-700 dark:text-slate-200">{cnt}</span>
                                            </span>
                                        ))}
                                    </div>
                                ) : null;
                            })()}

                            {/* Action bar */}
                            {!submitted ? (
                                <div className="px-4 py-2 flex items-center justify-between gap-3">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                                        Submitting will release marks to parents and lock this record.
                                    </p>
                                    <div className="flex gap-2">
                                        <button onClick={handleDraft} disabled={saving}
                                            className="px-4 py-1.5 border border-slate-300 dark:border-gray-600 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors">
                                            {saving ? 'Saving…' : 'Save Draft'}
                                        </button>
                                        <button onClick={() => setShowConfirm(true)} disabled={saving}
                                            className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors">
                                            Submit &amp; Release
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="px-4 py-2 text-center text-[10px] text-slate-400 uppercase tracking-wider">
                                    Marks submitted — contact administration to unlock for editing.
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Confirm modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-xl w-full max-w-sm">
                        <div className="px-5 py-3.5 bg-slate-50 dark:bg-gray-900/50 border-b border-slate-200 dark:border-gray-700 rounded-t-lg">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-gray-100">Submit &amp; Release Marks</h3>
                        </div>
                        <div className="px-5 py-4">
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                This will lock the marks record and release results to parents immediately.
                                This action cannot be undone without administrator approval.
                            </p>
                        </div>
                        <div className="px-5 py-3 border-t border-slate-100 dark:border-gray-700 flex justify-end gap-2">
                            <button onClick={() => setShowConfirm(false)}
                                className="px-4 py-1.5 border border-slate-300 dark:border-gray-600 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSubmit}
                                className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
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
