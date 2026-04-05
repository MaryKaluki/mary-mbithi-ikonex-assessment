import React, { useEffect, useState } from 'react';

const StudentSubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        fetch('/api/student/subjects', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => {
                if (d.error) { setError(d.error); return; }
                setSubjects(d.subjects || []);
                setLoading(false);
            })
            .catch(() => { setError('Failed to load subjects.'); setLoading(false); });
    }, []);

    const getGradeColor = (grade) => {
        if (!grade) return 'bg-gray-100 text-gray-400';
        if (grade.startsWith('A')) return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300';
        if (grade.startsWith('B')) return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300';
        if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300';
        return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300';
    };

    const getProgressColor = (progress) => {
        if (progress === null) return 'bg-gray-300';
        if (progress >= 80) return 'bg-green-500';
        if (progress >= 60) return 'bg-blue-500';
        if (progress >= 45) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const teacherInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    };

    if (loading) return <div className="flex items-center justify-center h-48 text-gray-400">Loading subjects…</div>;
    if (error)   return <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">{error}</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">My Subjects</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">View your enrolled subjects and contact your teachers.</p>
            </div>

            {subjects.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 text-gray-500 p-8 rounded-xl text-center dark:bg-gray-800 dark:border-gray-700">
                    No subjects found for your class. Check back after your timetable is set up.
                </div>
            ) : (
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                    <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 dark:bg-gray-900/50 dark:border-gray-700 text-xs font-bold text-gray-500 uppercase">
                        <div className="col-span-3">Subject Name</div>
                        <div className="col-span-2 text-center">Grade</div>
                        <div className="col-span-4">Academic Progress</div>
                        <div className="col-span-3">Assigned Teacher</div>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {subjects.map((subject, idx) => (
                            <div key={idx} className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors dark:hover:bg-gray-700/30">
                                <div className="col-span-3">
                                    <h3 className="font-bold text-gray-800 text-base dark:text-gray-100">{subject.subject_name}</h3>
                                </div>

                                <div className="col-span-2 text-center flex items-center justify-start lg:justify-center gap-2">
                                    <span className="lg:hidden text-xs text-gray-500 font-bold uppercase">Grade:</span>
                                    {subject.grade ? (
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getGradeColor(subject.grade)}`}>
                                            {subject.grade}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">No data</span>
                                    )}
                                </div>

                                <div className="col-span-4 space-y-1">
                                    {subject.progress !== null ? (
                                        <>
                                            <div className="flex justify-between text-[11px] mb-1">
                                                <span className="text-gray-500 dark:text-gray-400 font-bold uppercase">Progress</span>
                                                <span className="font-bold text-gray-700 dark:text-gray-300">{subject.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5 dark:bg-gray-700">
                                                <div className={`h-1.5 rounded-full ${getProgressColor(subject.progress)}`} style={{ width: `${subject.progress}%` }}></div>
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">No exam data yet</span>
                                    )}
                                </div>

                                <div className="col-span-3 flex items-center gap-3">
                                    {subject.teacher_name ? (
                                        <>
                                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-[10px] dark:bg-purple-900/50 dark:text-purple-300 shrink-0">
                                                {teacherInitials(subject.teacher_name)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-800 text-xs truncate dark:text-gray-100">{subject.teacher_name}</p>
                                                {subject.teacher_email && (
                                                    <p className="text-[10px] text-gray-400 truncate">{subject.teacher_email}</p>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Not assigned</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentSubjects;
