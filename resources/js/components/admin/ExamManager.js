import React, { useState, useEffect } from 'react';

const ASSESSMENT_TYPES = [
    { value: 'cat1',        label: 'CAT 1',        desc: 'Continuous Assessment Test 1' },
    { value: 'cat2',        label: 'CAT 2',        desc: 'Continuous Assessment Test 2' },
    { value: 'end_of_term', label: 'End of Term',  desc: 'Terminal Examination' },
    { value: 'mock',        label: 'Mock Exam',    desc: 'Practice / Trial Examination' },
    { value: 'national',   label: 'National Exam', desc: 'KCSE / KPSEA / JCE' },
];

const CURRICULUM_TARGETS = [
    { value: 'all', label: 'All Sections'       },
    { value: 'CBC', label: 'CBC (Grade 1–9)'    },
    { value: '844', label: '8-4-4 (Form 1–4)'  },
];

const SCALE_844 = [
    { grade: 'A',   range: '80–100', points: 12 },
    { grade: 'A-',  range: '75–79',  points: 11 },
    { grade: 'B+',  range: '70–74',  points: 10 },
    { grade: 'B',   range: '65–69',  points: 9  },
    { grade: 'B-',  range: '60–64',  points: 8  },
    { grade: 'C+',  range: '55–59',  points: 7  },
    { grade: 'C',   range: '50–54',  points: 6  },
    { grade: 'C-',  range: '45–49',  points: 5  },
    { grade: 'D+',  range: '40–44',  points: 4  },
    { grade: 'D',   range: '35–39',  points: 3  },
    { grade: 'D-',  range: '30–34',  points: 2  },
    { grade: 'E',   range: '0–29',   points: 1  },
];

const SCALE_CBC = [
    { level: 'EE', label: 'Exceeding Expectations', points: 4, desc: 'Student consistently exceeds the expected level of competency.' },
    { level: 'ME', label: 'Meeting Expectations',   points: 3, desc: 'Student meets the expected level of competency.' },
    { level: 'AE', label: 'Approaching Expectations', points: 2, desc: 'Student is approaching but has not yet met the expected level.' },
    { level: 'BE', label: 'Below Expectations',     points: 1, desc: 'Student has not yet reached the expected level of competency.' },
];

const inputCls =
    'w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm ' +
    'bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-400';

const ASSESS_LABEL = ASSESSMENT_TYPES.reduce((acc, t) => ({ ...acc, [t.value]: t.label }), {});

const ExamManager = () => {
    const [exams, setExams]         = useState([]);
    const [loading, setLoading]     = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [activeScale, setActiveScale] = useState('844');
    const [form, setForm] = useState({
        name: '',
        assessment_type: 'end_of_term',
        curriculum: 'all',
        term: '1',
        year: String(new Date().getFullYear()),
        start_date: '',
        end_date: '',
        max_score: 100,
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
            name: '',
            assessment_type: 'end_of_term',
            curriculum: 'all',
            term: '1',
            year: String(new Date().getFullYear()),
            start_date: '',
            end_date: '',
            max_score: 100,
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        window.axios.post('/api/admin/exams', form)
            .then(() => {
                setShowModal(false);
                window.showToast('success', 'Examination scheduled.');
                fetchExams();
            })
            .catch(() => {
                window.showToast('error', 'Failed to schedule examination.');
            });
    };

    const examStatus = (exam) => {
        const now   = new Date();
        const start = new Date(exam.start_date);
        const end   = new Date(exam.end_date);
        if (now < start) return 'Upcoming';
        if (now > end)   return 'Completed';
        return 'Active';
    };

    return (
        <div className="space-y-6 pb-20">

            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Examination Management
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Schedule assessments and configure grading scales for CBC and 8-4-4 curricula.
                    </p>
                </div>
                <button
                    onClick={openSchedule}
                    className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors w-full sm:w-auto"
                >
                    Schedule Examination
                </button>
            </div>

            {/* Exams table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Scheduled Examinations
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[720px]">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Examination</th>
                                <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Term / Year</th>
                                <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date Range</th>
                                <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Curriculum</th>
                                <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-10 text-sm text-gray-400">
                                        Loading...
                                    </td>
                                </tr>
                            ) : exams.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-12 text-sm text-gray-400 dark:text-gray-500">
                                        No examinations scheduled. Use the button above to schedule one.
                                    </td>
                                </tr>
                            ) : exams.map((exam, i) => {
                                const status = examStatus(exam);
                                return (
                                    <tr
                                        key={exam.id || i}
                                        className="hover:bg-gray-50/70 dark:hover:bg-gray-700/30 group transition-colors"
                                    >
                                        <td className="px-5 py-3.5 font-semibold text-sm text-gray-900 dark:text-gray-100">
                                            {exam.name}
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-300">
                                            {ASSESS_LABEL[exam.assessment_type] || exam.assessment_type || '—'}
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-300">
                                            Term {exam.term} &middot; {exam.year}
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400">
                                            {exam.start_date
                                                ? new Date(exam.start_date).toLocaleDateString('en-KE')
                                                : '—'}
                                            {' '}–{' '}
                                            {exam.end_date
                                                ? new Date(exam.end_date).toLocaleDateString('en-KE')
                                                : '—'}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                                                {exam.curriculum === 'all' ? 'All' : exam.curriculum || '—'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`text-[11px] font-semibold uppercase tracking-wide ${
                                                status === 'Active'
                                                    ? 'text-gray-900 dark:text-gray-100'
                                                    : 'text-gray-400 dark:text-gray-500'
                                            }`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <button className="text-sm font-medium text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors opacity-0 group-hover:opacity-100">
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Grading scales reference */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Grading Scales
                    </span>
                    <div className="flex border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                        {[['844', '8-4-4'], ['CBC', 'CBC']].map(([val, label]) => (
                            <button
                                key={val}
                                onClick={() => setActiveScale(val)}
                                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                                    activeScale === val
                                        ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-5">
                    {activeScale === '844' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm min-w-[300px]">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-700">
                                        <th className="pb-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grade</th>
                                        <th className="pb-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score Range (%)</th>
                                        <th className="pb-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Points</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                    {SCALE_844.map(g => (
                                        <tr key={g.grade}>
                                            <td className="py-2 w-16 font-bold text-gray-900 dark:text-gray-100">{g.grade}</td>
                                            <td className="py-2 text-gray-600 dark:text-gray-300">{g.range}</td>
                                            <td className="py-2 text-gray-600 dark:text-gray-300">{g.points}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-700/50">
                            {SCALE_CBC.map(g => (
                                <div key={g.level} className="flex items-start gap-4 py-3">
                                    <div className="w-10 shrink-0 font-bold text-sm text-gray-900 dark:text-gray-100 pt-0.5">
                                        {g.level}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{g.label}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{g.desc}</p>
                                    </div>
                                    <div className="shrink-0 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        {g.points} pts
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Schedule modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                Schedule Examination
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                    Examination Name
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. End of Term 2 Examination"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className={inputCls}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                        Assessment Type
                                    </label>
                                    <select
                                        value={form.assessment_type}
                                        onChange={e => setForm(f => ({ ...f, assessment_type: e.target.value }))}
                                        className={inputCls}
                                    >
                                        {ASSESSMENT_TYPES.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                        Curriculum Target
                                    </label>
                                    <select
                                        value={form.curriculum}
                                        onChange={e => setForm(f => ({ ...f, curriculum: e.target.value }))}
                                        className={inputCls}
                                    >
                                        {CURRICULUM_TARGETS.map(c => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                        Term
                                    </label>
                                    <select
                                        value={form.term}
                                        onChange={e => setForm(f => ({ ...f, term: e.target.value }))}
                                        className={inputCls}
                                    >
                                        <option value="1">Term 1</option>
                                        <option value="2">Term 2</option>
                                        <option value="3">Term 3</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                        Academic Year
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        min="2020"
                                        max="2040"
                                        value={form.year}
                                        onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                                        className={inputCls}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                        Start Date
                                    </label>
                                    <input
                                        required
                                        type="date"
                                        value={form.start_date}
                                        onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                        End Date
                                    </label>
                                    <input
                                        required
                                        type="date"
                                        value={form.end_date}
                                        onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                                        className={inputCls}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                    Maximum Score
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="1000"
                                    value={form.max_score}
                                    onChange={e => setForm(f => ({ ...f, max_score: e.target.value }))}
                                    className={inputCls}
                                />
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    Applies to 8-4-4 scored assessments only.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
                                >
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
