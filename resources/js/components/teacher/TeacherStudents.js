import React, { useState, useEffect } from 'react';

/* ── compact info pair used inside the profile drawer ── */
const Field = ({ label, value, mono }) => (
    <div>
        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
        <p className={`text-xs text-slate-800 dark:text-slate-200 ${mono ? 'font-mono' : 'font-medium'}`}>{value || '—'}</p>
    </div>
);

/* ── gender badge ── */
const GBadge = ({ g }) => {
    const m = g?.toLowerCase() === 'male';
    return (
        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
            m ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
        }`}>{g?.[0] ?? '?'}</span>
    );
};

const TeacherStudents = () => {
    const [classes, setClasses]         = useState([]);
    const [activeClass, setActiveClass] = useState(null);
    const [students, setStudents]       = useState([]);
    const [search, setSearch]           = useState('');
    const [loading, setLoading]         = useState(true);
    const [studLoading, setStudLoading] = useState(false);
    const [profile, setProfile]         = useState(null);   // selected student for drawer

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
        s.admission_number.toLowerCase().includes(search.toLowerCase()) ||
        (s.parent_phone || '').includes(search)
    );

    return (
        <div className="flex flex-col h-full space-y-3 pb-6">

            {/* ── Page Header ── */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Teacher <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Class Register</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">
                        {activeClass ? activeClass.name : 'My Students'}
                        {!studLoading && activeClass && (
                            <span className="ml-2 text-xs font-normal text-slate-400">
                                — {filtered.length} student{filtered.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </h1>
                </div>

                {/* Search */}
                <div className="relative w-56">
                    <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search name, adm no, phone…"
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"/>
                </div>
            </div>

            {/* ── Class Tabs ── */}
            {!loading && classes.length > 0 && (
                <div className="flex flex-shrink-0 border-b border-slate-200 dark:border-gray-700 gap-0.5 overflow-x-auto">
                    {classes.map(cls => (
                        <button key={cls.id} onClick={() => loadStudents(cls)}
                            className={`px-4 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-all duration-150 flex items-center gap-2 ${
                                activeClass?.id === cls.id
                                    ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}>
                            {cls.name}
                            <span className={`text-[10px] rounded px-1 py-0.5 font-bold ${
                                activeClass?.id === cls.id
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-slate-100 text-slate-400 dark:bg-gray-700'
                            }`}>{cls.student_count}</span>
                            {cls.attendance_marked_today && (
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" title="Attendance marked"/>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* ── Register Table ── */}
            {loading ? (
                <div className="text-center text-slate-400 py-16 text-sm">Loading classes…</div>
            ) : classes.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-slate-400 text-sm">No classes assigned. Contact your admin.</p>
                </div>
            ) : (
                /* Scrollable table region — fills remaining height */
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                    {studLoading ? (
                        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Loading…</div>
                    ) : filtered.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-slate-400 text-sm">{search ? 'No matches found.' : 'No students in this class.'}</p>
                        </div>
                    ) : (
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-left border-collapse" style={{ minWidth: 620 }}>
                                {/* Dark sticky header — old-system register feel */}
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest w-10 text-slate-400">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest w-28 text-slate-300">Adm No</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Full Name</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest w-14 text-center text-slate-300">Sex</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest w-24 text-slate-300">Grade / Form</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest w-36 text-slate-300">Parent Contact</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest w-16 text-right text-slate-300">Info</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((s, i) => (
                                        <tr key={s.id}
                                            className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors cursor-default ${
                                                i % 2 === 0
                                                    ? 'bg-white dark:bg-gray-800'
                                                    : 'bg-slate-50/70 dark:bg-gray-900/30'
                                            }`}>
                                            {/* Row number */}
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">
                                                {String(i + 1).padStart(2, '0')}
                                            </td>
                                            {/* Admission No */}
                                            <td className="px-3 py-2 font-mono text-xs text-slate-500 dark:text-slate-400 tracking-wide">
                                                {s.admission_number}
                                            </td>
                                            {/* Name — primary column */}
                                            <td className="px-3 py-2">
                                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">{s.name}</span>
                                            </td>
                                            {/* Gender badge */}
                                            <td className="px-3 py-2 text-center">
                                                <GBadge g={s.gender}/>
                                            </td>
                                            {/* Grade */}
                                            <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                                                {s.grade_level || activeClass?.name || '—'}
                                            </td>
                                            {/* Parent contact — actionable data for teacher */}
                                            <td className="px-3 py-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                                                {s.parent_phone || <span className="text-slate-300 dark:text-slate-600 font-sans">—</span>}
                                            </td>
                                            {/* Profile link */}
                                            <td className="px-3 py-2 text-right">
                                                <button onClick={() => setProfile(s)}
                                                    className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Footer — record count */}
                    {!studLoading && filtered.length > 0 && (
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30 flex items-center justify-between">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                                {activeClass?.name} · {filtered.length} student{filtered.length !== 1 ? 's' : ''}
                                {search && ` · filtered from ${students.length}`}
                            </p>
                            <p className="text-[10px] text-slate-300 dark:text-slate-600">
                                {activeClass?.attendance_marked_today
                                    ? <span className="text-green-500 font-bold">✓ Attendance marked today</span>
                                    : <span className="text-amber-500 font-bold">⚠ Attendance not marked</span>
                                }
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ── Student Profile Drawer / Modal ── */}
            {profile && (
                <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40" onClick={() => setProfile(null)}>
                    <div className="bg-white dark:bg-gray-800 h-full w-full max-w-sm shadow-2xl border-l border-slate-200 dark:border-gray-700 flex flex-col overflow-y-auto"
                        onClick={e => e.stopPropagation()}>

                        {/* Drawer header */}
                        <div className="bg-slate-800 px-5 py-4 flex items-start justify-between flex-shrink-0">
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Student File</p>
                                <h3 className="text-base font-bold text-white leading-tight">{profile.name}</h3>
                                <p className="text-xs font-mono text-slate-400 mt-0.5">{profile.admission_number}</p>
                            </div>
                            <button onClick={() => setProfile(null)}
                                className="text-slate-400 hover:text-white transition-colors text-2xl leading-none mt-0.5">&times;</button>
                        </div>

                        {/* Drawer body */}
                        <div className="flex-1 p-5 space-y-5">

                            {/* Core Details */}
                            <section>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-gray-700 pb-1 mb-3">Academic Details</p>
                                <div className="grid grid-cols-3 gap-3">
                                    <Field label="Grade / Form" value={profile.grade_level}/>
                                    <Field label="Gender" value={profile.gender}/>
                                    <Field label="Date of Birth" value={profile.date_of_birth}/>
                                    {profile.nemis_upi && <Field label="NEMIS UPI" value={profile.nemis_upi} mono/>}
                                </div>
                            </section>

                            {/* Primary Guardian */}
                            <section>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-gray-700 pb-1 mb-3">Primary Guardian</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Name" value={profile.parent_name}/>
                                    <Field label="Relationship" value={profile.parent_relationship}/>
                                    <Field label="Phone" value={profile.parent_phone} mono/>
                                    {profile.parent_email && <Field label="Email" value={profile.parent_email}/>}
                                    {profile.residential_address && (
                                        <div className="col-span-2">
                                            <Field label="Address" value={profile.residential_address}/>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Secondary Guardian */}
                            {profile.secondary_parent_name && (
                                <section>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-gray-700 pb-1 mb-3">Secondary Guardian</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Name" value={profile.secondary_parent_name}/>
                                        <Field label="Relationship" value={profile.secondary_parent_relationship}/>
                                        <Field label="Phone" value={profile.secondary_parent_phone} mono/>
                                    </div>
                                </section>
                            )}

                            {/* Health */}
                            <section>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-red-400 border-b border-red-100 dark:border-red-900/30 pb-1 mb-3">Health Profile</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Blood Group</p>
                                        <p className="text-sm font-bold text-red-600 dark:text-red-400">{profile.blood_group || '—'}</p>
                                    </div>
                                    <Field label="Allergies" value={profile.allergies || 'None reported'}/>
                                    <div className="col-span-2">
                                        <Field label="Medical Conditions" value={profile.medical_conditions || 'None reported'}/>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherStudents;
