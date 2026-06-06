import React, { useState, useEffect } from 'react';

const ASSESSMENT_TYPES = [
    { value: 'cat1',        label: 'CAT 1',        desc: 'Continuous Assessment Test 1' },
    { value: 'cat2',        label: 'CAT 2',        desc: 'Continuous Assessment Test 2' },
    { value: 'end_of_term', label: 'End of Term',  desc: 'Terminal Examination' },
    { value: 'mock',        label: 'Mock Exam',    desc: 'Practice / Trial Examination' },
    { value: 'national',    label: 'National Exam', desc: 'KCSE / KPSEA / JCE' },
];
const CURRICULUM_TARGETS = [
    { value: 'all', label: 'All Sections'      },
    { value: 'CBC', label: 'CBC (Grade 1–9)'   },
    { value: '844', label: '8-4-4 (Form 1–4)' },
];
const SCALE_844 = [
    { grade: 'A',  range: '80–100', points: 12 },
    { grade: 'A-', range: '75–79',  points: 11 },
    { grade: 'B+', range: '70–74',  points: 10 },
    { grade: 'B',  range: '65–69',  points: 9  },
    { grade: 'B-', range: '60–64',  points: 8  },
    { grade: 'C+', range: '55–59',  points: 7  },
    { grade: 'C',  range: '50–54',  points: 6  },
    { grade: 'C-', range: '45–49',  points: 5  },
    { grade: 'D+', range: '40–44',  points: 4  },
    { grade: 'D',  range: '35–39',  points: 3  },
    { grade: 'D-', range: '30–34',  points: 2  },
    { grade: 'E',  range: '0–29',   points: 1  },
];
const SCALE_CBC = [
    { level: 'EE', label: 'Exceeding Expectations',   points: 4, desc: 'Student consistently exceeds the expected level of competency.' },
    { level: 'ME', label: 'Meeting Expectations',     points: 3, desc: 'Student meets the expected level of competency.' },
    { level: 'AE', label: 'Approaching Expectations', points: 2, desc: 'Student is approaching but has not yet met the expected level.' },
    { level: 'BE', label: 'Below Expectations',       points: 1, desc: 'Student has not yet reached the expected level of competency.' },
];

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";
const ASSESS_LABEL = ASSESSMENT_TYPES.reduce((acc, t) => ({ ...acc, [t.value]: t.label }), {});

const statusBadge = (status) => {
    if (status === 'Active')    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (status === 'Upcoming')  return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    return 'bg-slate-100 text-slate-500 dark:bg-gray-700 dark:text-gray-400';
};

const ExamManager = () => {
    const [exams, setExams]         = useState([]);
    const [loading, setLoading]     = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [activeScale, setActiveScale] = useState('844');
    const [form, setForm] = useState({
        name: '', assessment_type: 'end_of_term', curriculum: 'all',
        term: '1', year: String(new Date().getFullYear()),
        start_date: '', end_date: '', max_score: 100,
    });

    useEffect(() => { fetchExams(); }, []);

    const fetchExams = () => {
        setLoading(true);
        window.axios.get('/api/admin/exams')
            .then(res => setExams(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    const openSchedule = () => {
        setForm({
            name: '', assessment_type: 'end_of_term', curriculum: 'all',
            term: '1', year: String(new Date().getFullYear()),
            start_date: '', end_date: '', max_score: 100,
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        window.axios.post('/api/admin/exams', form)
            .then(() => { setShowModal(false); window.showToast('success', 'Examination scheduled.'); fetchExams(); })
            .catch(() => { window.showToast('error', 'Failed to schedule examination.'); });
    };

    const examStatus = (exam) => {
        const now = new Date(), start = new Date(exam.start_date), end = new Date(exam.end_date);
        if (now < start) return 'Upcoming';
        if (now > end)   return 'Completed';
        return 'Active';
    };

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Admin <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Examinations</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">
                        Examination Management
                        {!loading && <span className="ml-2 text-xs font-normal text-slate-400">— {exams.length} scheduled</span>}
                    </h1>
                </div>
                <button onClick={openSchedule}
                    className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary/90 text-sm transition-all duration-200">
                    + Schedule Exam
                </button>
            </div>

            {/* Exams table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col" style={{ minHeight: 0 }}>
                <div className="overflow-auto">
                    <table className="w-full text-left border-collapse" style={{ minWidth: 720 }}>
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Examination</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Type</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Term / Year</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-40">Date Range</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Curriculum</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-center">Status</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="text-center py-10 text-sm text-slate-400">Loading…</td></tr>
                            ) : exams.length === 0 ? (
                                <tr><td colSpan="8" className="text-center py-12 text-sm text-slate-400">No examinations scheduled yet.</td></tr>
                            ) : exams.map((exam, i) => {
                                const status = examStatus(exam);
                                return (
                                    <tr key={exam.id || i}
                                        className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                            i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                        }`}>
                                        <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">
                                            {String(i + 1).padStart(2, '0')}
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{exam.name}</span>
                                        </td>
                                        <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                                            {ASSESS_LABEL[exam.assessment_type] || exam.assessment_type || '—'}
                                        </td>
                                        <td className="px-3 py-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                                            T{exam.term} · {exam.year}
                                        </td>
                                        <td className="px-3 py-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                                            {exam.start_date ? new Date(exam.start_date).toLocaleDateString('en-KE') : '—'}
                                            {' – '}
                                            {exam.end_date ? new Date(exam.end_date).toLocaleDateString('en-KE') : '—'}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                                {exam.curriculum === 'all' ? 'All' : exam.curriculum || '—'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${statusBadge(status)}`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <button className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {!loading && exams.length > 0 && (
                    <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">{exams.length} examination{exams.length !== 1 ? 's' : ''}</p>
                    </div>
                )}
            </div>

            {/* Grading scales reference */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex-shrink-0">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Grading Scales Reference</span>
                    <div className="flex border border-slate-300 dark:border-gray-600 rounded-md overflow-hidden">
                        {[['844', '8-4-4'], ['CBC', 'CBC']].map(([val, label]) => (
                            <button key={val} onClick={() => setActiveScale(val)}
                                className={`px-3 py-1 text-[10px] font-bold transition-colors ${
                                    activeScale === val
                                        ? 'bg-slate-800 dark:bg-slate-700 text-white'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-gray-700/50'
                                }`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-4">
                    {activeScale === '844' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse" style={{ minWidth: 300 }}>
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-gray-700">
                                        <th className="pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 w-16">Grade</th>
                                        <th className="pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Score Range (%)</th>
                                        <th className="pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 w-20">Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {SCALE_844.map((g, i) => (
                                        <tr key={g.grade} className={`border-b border-slate-50 dark:border-gray-700/50 ${i % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-gray-900/20'}`}>
                                            <td className="py-1.5 font-bold text-sm text-slate-800 dark:text-slate-100">{g.grade}</td>
                                            <td className="py-1.5 text-xs font-mono text-slate-500 dark:text-slate-400">{g.range}</td>
                                            <td className="py-1.5 text-xs text-slate-500 dark:text-slate-400">{g.points}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-gray-700/50">
                            {SCALE_CBC.map(g => (
                                <div key={g.level} className="flex items-start gap-4 py-2.5">
                                    <span className="w-8 shrink-0 font-bold text-sm text-slate-800 dark:text-slate-100">{g.level}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{g.label}</p>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{g.desc}</p>
                                    </div>
                                    <span className="shrink-0 text-xs font-bold text-slate-500 dark:text-slate-400">{g.points} pts</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Schedule modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-slate-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-gray-900/50 border-b border-slate-200 dark:border-gray-700 sticky top-0">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Schedule Examination</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Examination Name *</label>
                                <input required type="text" placeholder="e.g. End of Term 2 Examination"
                                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className={inputCls}/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Assessment Type</label>
                                    <select value={form.assessment_type} onChange={e => setForm(f => ({ ...f, assessment_type: e.target.value }))} className={inputCls}>
                                        {ASSESSMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Curriculum Target</label>
                                    <select value={form.curriculum} onChange={e => setForm(f => ({ ...f, curriculum: e.target.value }))} className={inputCls}>
                                        {CURRICULUM_TARGETS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Term</label>
                                    <select value={form.term} onChange={e => setForm(f => ({ ...f, term: e.target.value }))} className={inputCls}>
                                        <option value="1">Term 1</option>
                                        <option value="2">Term 2</option>
                                        <option value="3">Term 3</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Academic Year</label>
                                    <input required type="number" min="2020" max="2040"
                                        value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                                        className={inputCls}/>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Start Date</label>
                                    <input required type="date" value={form.start_date}
                                        onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className={inputCls}/>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">End Date</label>
                                    <input required type="date" value={form.end_date}
                                        onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className={inputCls}/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Maximum Score</label>
                                <input type="number" min="1" max="1000" value={form.max_score}
                                    onChange={e => setForm(f => ({ ...f, max_score: e.target.value }))} className={inputCls}/>
                                <p className="text-[10px] text-slate-400 mt-1">Applies to 8-4-4 scored assessments only.</p>
                            </div>
                            <div className="flex justify-end gap-2 pt-1 border-t border-slate-100 dark:border-gray-700">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="px-5 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                                    Schedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamManager;
