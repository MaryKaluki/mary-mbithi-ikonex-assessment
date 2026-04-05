import React, { useEffect, useState } from 'react';

const GRADE_STYLE = {
    A:  { card: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300',  circle: 'bg-green-500' },
    B:  { card: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',      circle: 'bg-blue-500' },
    C:  { card: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300', circle: 'bg-yellow-500' },
    D:  { card: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300', circle: 'bg-orange-500' },
    E:  { card: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300',          circle: 'bg-red-500' },
};

const gradeStyle = (grade) => {
    if (!grade) return { card: 'bg-gray-100 text-gray-500', circle: 'bg-gray-400' };
    const key = grade[0].toUpperCase();
    return GRADE_STYLE[key] || { card: 'bg-gray-100 text-gray-500', circle: 'bg-gray-400' };
};

const StudentGrades = () => {
    const [exams, setExams]       = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        fetch('/api/student/grades', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => {
                if (d.error) { setError(d.error); return; }
                const list = d.exams || [];
                setExams(list);
                if (list.length > 0) setSelected(list[0].exam_id);
                setLoading(false);
            })
            .catch(() => { setError('Failed to load grades.'); setLoading(false); });
    }, []);

    if (loading) return <div className="flex items-center justify-center h-48 text-gray-400">Loading grades…</div>;
    if (error)   return <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">{error}</div>;

    const currentExam = exams.find(e => e.exam_id === selected);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">My Assessments</h2>
                {exams.length > 1 && (
                    <select
                        value={selected ?? ''}
                        onChange={e => setSelected(Number(e.target.value))}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    >
                        {exams.map(ex => (
                            <option key={ex.exam_id} value={ex.exam_id}>
                                {ex.exam_name}{ex.term ? ` — ${ex.term}` : ''}{ex.year ? ` ${ex.year}` : ''}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {exams.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 text-gray-500 p-8 rounded-xl text-center dark:bg-gray-800 dark:border-gray-700">
                    No exam results available yet.
                </div>
            ) : currentExam && (
                <>
                    {/* Overall average banner */}
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-center justify-between dark:bg-purple-900/20 dark:border-purple-800">
                        <div>
                            <p className="text-sm text-purple-600 font-semibold dark:text-purple-300">{currentExam.exam_name}</p>
                            <p className="text-xs text-purple-400">{currentExam.term} {currentExam.year}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-extrabold text-purple-700 dark:text-purple-300">{currentExam.average}%</p>
                            <p className="text-xs text-purple-500">Overall Average</p>
                        </div>
                    </div>

                    {/* Subject cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {currentExam.subjects.map((item, i) => {
                            const style = gradeStyle(item.grade);
                            return (
                                <div key={i} className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group dark:bg-gray-800 dark:border-gray-700">
                                    <div className={`absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8 rounded-full opacity-20 group-hover:scale-110 transition-transform ${style.circle}`}></div>
                                    <div className="relative z-10">
                                        <h3 className="text-base font-bold text-gray-700 mb-1 dark:text-gray-200">{item.subject}</h3>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">
                                            {item.marks}/{item.out_of} marks
                                        </p>
                                        <div className="flex items-baseline space-x-2">
                                            <span className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">{item.grade || '—'}</span>
                                            <span className="text-sm text-gray-500 ml-1">{item.percent}%</span>
                                        </div>
                                        {item.remarks && (
                                            <p className="mt-4 text-sm text-gray-500 italic dark:text-gray-400">"{item.remarks}"</p>
                                        )}
                                        {/* Progress bar */}
                                        <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5 dark:bg-gray-700">
                                            <div
                                                className={`h-1.5 rounded-full ${style.circle}`}
                                                style={{ width: `${item.percent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* SPC-style bar chart */}
                    <div className="bg-white p-4 md:p-8 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6">Performance by Subject</h3>
                        <div className="space-y-3">
                            {currentExam.subjects.map((item, i) => {
                                const style = gradeStyle(item.grade);
                                return (
                                    <div key={i} className="flex items-center gap-3">
                                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 w-36 shrink-0 truncate">{item.subject}</p>
                                        <div className="flex-1 bg-gray-100 rounded-full h-3 dark:bg-gray-700">
                                            <div
                                                className={`h-3 rounded-full transition-all duration-700 ${style.circle}`}
                                                style={{ width: `${item.percent}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300 w-10 text-right">{item.percent}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default StudentGrades;
