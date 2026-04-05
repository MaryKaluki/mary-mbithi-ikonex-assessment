import React, { useState, useEffect } from 'react';

const TeacherStudents = () => {
    const [classes, setClasses]     = useState([]);
    const [activeClass, setActiveClass] = useState(null);
    const [students, setStudents]   = useState([]);
    const [search, setSearch]       = useState('');
    const [loading, setLoading]     = useState(true);
    const [studLoading, setStudLoading] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await window.axios.get('/api/teacher/classes');
                setClasses(res.data);
                if (res.data.length > 0) loadStudents(res.data[0]);
            } catch { /* silent */ }
            finally { setLoading(false); }
        })();
    }, []);

    const loadStudents = async (cls) => {
        setActiveClass(cls);
        setStudLoading(true);
        setStudents([]);
        try {
            const res = await window.axios.get(`/api/teacher/classes/${cls.id}/students`);
            setStudents(res.data.students || []);
        } catch { /* silent */ }
        finally { setStudLoading(false); }
    };

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.admission_number.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">My Students</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Students in your assigned classes</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search student…"
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"/>
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                </div>
            </div>

            {/* Class tabs */}
            {loading ? (
                <div className="text-center text-gray-400 py-8">Loading classes…</div>
            ) : classes.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center text-gray-400">
                    No classes assigned yet. Ask your admin to assign you as a class teacher or add you to a timetable.
                </div>
            ) : (
                <>
                    <div className="flex flex-wrap gap-2">
                        {classes.map(cls => (
                            <button key={cls.id} onClick={() => loadStudents(cls)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeClass?.id === cls.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary/40'}`}>
                                {cls.name}
                                <span className={`ml-2 text-xs ${activeClass?.id === cls.id ? 'text-white/70' : 'text-gray-400'}`}>
                                    {cls.student_count}
                                </span>
                                {cls.attendance_marked_today && (
                                    <span className="ml-1 w-2 h-2 rounded-full bg-green-400 inline-block" title="Attendance marked today"/>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        {studLoading ? (
                            <div className="p-12 text-center text-gray-400">Loading students…</div>
                        ) : filtered.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 text-sm">
                                {search ? 'No students match your search.' : 'No students in this class.'}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[500px]">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">#</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Student</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Adm No</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Gender</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Grade</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                        {filtered.map((s, i) => (
                                            <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="px-6 py-3 text-xs text-gray-400 font-bold">{i + 1}</td>
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-extrabold text-primary flex-shrink-0">
                                                            {s.name.charAt(0)}
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{s.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-xs font-mono text-gray-400">{s.admission_number}</td>
                                                <td className="px-6 py-3 text-xs text-gray-500 dark:text-gray-400">{s.gender}</td>
                                                <td className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">{s.grade_level}</td>
                                                <td className="px-6 py-3 text-right">
                                                    <button onClick={() => setSelectedStudent(s)} className="text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                                        Profile
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Student Details Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Student Profile</h3>
                            <button onClick={() => setSelectedStudent(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-8">
                            {/* Academic & Basic Info */}
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-extrabold text-primary flex-shrink-0">
                                    {selectedStudent.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xl font-bold text-gray-800 dark:text-white">{selectedStudent.name}</h4>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                        <span className="text-sm text-gray-500 font-medium">Adm No: <span className="font-mono">{selectedStudent.admission_number}</span></span>
                                        <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Grade: {selectedStudent.grade_level}</span>
                                        {selectedStudent.nemis_upi && <span className="text-sm text-gray-500 font-medium whitespace-nowrap">NEMIS: {selectedStudent.nemis_upi}</span>}
                                        <span className="text-sm text-gray-500 font-medium whitespace-nowrap">DOB: {selectedStudent.date_of_birth ?? 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Parent / Guardian Details */}
                                <div>
                                    <h5 className="text-[11px] font-black uppercase text-gray-400 tracking-wider mb-3">Primary Guardian</h5>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
                                        <div>
                                            <p className="text-xs text-gray-400">Name</p>
                                            <p className="font-bold text-sm text-gray-800 dark:text-white">{selectedStudent.parent_name ?? 'N/A'} <span className="text-xs font-normal text-gray-500">({selectedStudent.parent_relationship ?? 'N/A'})</span></p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Phone</p>
                                            <p className="font-bold text-sm text-gray-800 dark:text-white">{selectedStudent.parent_phone ?? 'N/A'}</p>
                                        </div>
                                        {selectedStudent.parent_email && (
                                            <div>
                                                <p className="text-xs text-gray-400">Email</p>
                                                <p className="font-bold text-sm text-gray-800 dark:text-white">{selectedStudent.parent_email}</p>
                                            </div>
                                        )}
                                        {selectedStudent.residential_address && (
                                            <div>
                                                <p className="text-xs text-gray-400">Address</p>
                                                <p className="font-bold text-sm text-gray-800 dark:text-white">{selectedStudent.residential_address}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Secondary Guardian (if any) */}
                                {selectedStudent.secondary_parent_name && (
                                    <div>
                                        <h5 className="text-[11px] font-black uppercase text-gray-400 tracking-wider mb-3">Secondary Guardian</h5>
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
                                            <div>
                                                <p className="text-xs text-gray-400">Name</p>
                                                <p className="font-bold text-sm text-gray-800 dark:text-white">{selectedStudent.secondary_parent_name} <span className="text-xs font-normal text-gray-500">({selectedStudent.secondary_parent_relationship ?? 'N/A'})</span></p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">Phone</p>
                                                <p className="font-bold text-sm text-gray-800 dark:text-white">{selectedStudent.secondary_parent_phone ?? 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Health & Wellbeing */}
                                <div>
                                    <h5 className="text-[11px] font-black uppercase text-gray-400 tracking-wider mb-3">Health Profile</h5>
                                    <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 space-y-2">
                                        <div className="flex justify-between border-b border-red-100 dark:border-red-900/30 pb-2">
                                            <p className="text-xs text-gray-500 font-bold">Blood Group</p>
                                            <p className="font-bold text-sm text-red-600 dark:text-red-400">{selectedStudent.blood_group ?? 'Unknown'}</p>
                                        </div>
                                        <div className="pt-1">
                                            <p className="text-xs text-gray-500 font-bold mb-1">Allergies</p>
                                            <p className="text-sm text-gray-800 dark:text-gray-300">{selectedStudent.allergies || 'None reported'}</p>
                                        </div>
                                        <div className="pt-2 border-t border-red-100 dark:border-red-900/30 pt-2">
                                            <p className="text-xs text-gray-500 font-bold mb-1">Medical Conditions</p>
                                            <p className="text-sm text-gray-800 dark:text-gray-300">{selectedStudent.medical_conditions || 'None reported'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherStudents;
