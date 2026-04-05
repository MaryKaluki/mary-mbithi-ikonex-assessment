import React, { useState, useEffect } from 'react';

const STATUS_COLOR = {
    'Pass':          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'Needs Support': 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300',
    'No Marks':      'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
};

const GRADE_COLOR = {
    'A': 'text-green-600 dark:text-green-400', 'A-': 'text-green-500',
    'B+': 'text-blue-600 dark:text-blue-400',  'B': 'text-blue-500', 'B-': 'text-blue-400',
    'C+': 'text-yellow-600',  'C': 'text-yellow-500', 'C-': 'text-orange-500',
    'D+': 'text-red-500', 'D': 'text-red-600', 'D-': 'text-red-700', 'E': 'text-gray-500',
};

const EndOfTermReports = () => {
    const [data, setData]             = useState({ students: [], exams: [], grade_levels: [], active_exam: null });
    const [loading, setLoading]       = useState(true);
    const [activeExam, setActiveExam] = useState('');
    const [gradeFilter, setGradeFilter] = useState('');

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

    const handleExamChange = (id) => {
        setActiveExam(id);
        load(id, gradeFilter);
    };

    const handleGradeChange = (grade) => {
        setGradeFilter(grade);
        load(activeExam, grade);
    };

    const passCount   = data.students.filter(s => s.status === 'Pass').length;
    const supportCount = data.students.filter(s => s.status === 'Needs Support').length;
    const noMarksCount = data.students.filter(s => s.status === 'No Marks').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">End of Term Reports</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Consolidated student performance by examination</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <select value={activeExam} onChange={e => handleExamChange(e.target.value)}
                        className="border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40">
                        <option value="">Select Exam</option>
                        {data.exams.map(e => (
                            <option key={e.id} value={e.id}>{e.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 text-center">
                    <p className="text-3xl font-extrabold text-green-600">{passCount}</p>
                    <p className="text-xs font-black uppercase text-gray-400 tracking-wider mt-1">Passed</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 text-center">
                    <p className="text-3xl font-extrabold text-red-500">{supportCount}</p>
                    <p className="text-xs font-black uppercase text-gray-400 tracking-wider mt-1">Needs Support</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 text-center">
                    <p className="text-3xl font-extrabold text-gray-400">{noMarksCount}</p>
                    <p className="text-xs font-black uppercase text-gray-400 tracking-wider mt-1">No Marks</p>
                </div>
            </div>

            {/* Grade filter */}
            <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase text-gray-400 tracking-wider mr-1">Filter:</span>
                <button onClick={() => handleGradeChange('')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${!gradeFilter ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400'}`}>
                    All
                </button>
                {data.grade_levels.map(g => (
                    <button key={g} onClick={() => handleGradeChange(g)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${gradeFilter === g ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400'}`}>
                        {g}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[640px]">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">#</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Adm No</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Grade</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider text-center">Avg Score</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider text-center">Letter</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {data.students.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">
                                            {activeExam ? 'No students found for this selection.' : 'Select an exam to view results.'}
                                        </td>
                                    </tr>
                                ) : data.students.map((s, i) => (
                                    <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 text-xs font-bold text-gray-400">{i + 1}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{s.name}</p>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-gray-400">{s.admission_number}</td>
                                        <td className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400">{s.grade_level}</td>
                                        <td className="px-6 py-4 text-center">
                                            {s.average !== null ? (
                                                <span className="text-sm font-extrabold text-gray-800 dark:text-gray-100">{s.average}%</span>
                                            ) : (
                                                <span className="text-xs text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-sm font-extrabold ${GRADE_COLOR[s.grade] || 'text-gray-400'}`}>{s.grade}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${STATUS_COLOR[s.status] || ''}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EndOfTermReports;
