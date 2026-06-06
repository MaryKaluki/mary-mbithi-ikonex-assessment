import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { SkeletonLoader, ConfirmationModal } from '../common/Loader';

const Badge = ({ status }) => {
    const active = status === 'Active';
    return (
        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
            active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                   : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>{status}</span>
    );
};

const GBadge = ({ g }) => {
    const m = g?.toLowerCase() === 'male';
    return (
        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
            m ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
        }`}>{g?.[0] ?? '?'}</span>
    );
};

const StudentList = () => {
    const [students, setStudents]       = useState([]);
    const [isLoading, setIsLoading]     = useState(true);
    const [searchTerm, setSearchTerm]   = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [deleteOpen, setDeleteOpen]   = useState(false);

    useEffect(() => { fetchStudents(); }, []);

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const res = await window.axios.get('/api/admin/students');
            setStudents(res.data.students || []);
        } catch {
            window.showToast('error', 'Failed to load students.');
        } finally {
            setIsLoading(false);
        }
    };

    const classes = [...new Set(students.map(s => s.grade_level).filter(Boolean))].sort();

    const filtered = students.filter(s => {
        const q = searchTerm.toLowerCase();
        const matchSearch = !q ||
            `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
            s.admission_number.toLowerCase().includes(q) ||
            (s.parent_phone || '').includes(q);
        const matchClass = !filterClass || s.grade_level === filterClass;
        return matchSearch && matchClass;
    });

    const toggleAll = () => {
        setSelectedIds(selectedIds.length === filtered.length && filtered.length > 0
            ? [] : filtered.map(s => s.id));
    };
    const toggleOne = id => setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const handleBulkDelete = async () => {
        setDeleteOpen(false);
        try {
            await window.axios.delete('/api/admin/students', { data: { ids: selectedIds } });
            window.showToast('success', `${selectedIds.length} student(s) deleted.`);
            setSelectedIds([]);
            fetchStudents();
        } catch {
            window.showToast('error', 'Failed to delete students.');
        }
    };

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Admin <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Student Directory</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">
                        Student Directory
                        {!isLoading && <span className="ml-2 text-xs font-normal text-slate-400">— {filtered.length} student{filtered.length !== 1 ? 's' : ''}</span>}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchStudents}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-slate-200 dark:hover:bg-gray-600 transition-all duration-200">
                        Refresh
                    </button>
                    <NavLink to="/students/admit"
                        className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary/90 text-sm transition-all duration-200">
                        + Admit Student
                    </NavLink>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                <div className="flex-1 relative">
                    <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input type="text" placeholder="Search name, adm no, parent phone…"
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                </div>
                <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-200 w-full sm:w-40">
                    <option value="">All Classes</option>
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {!isLoading && (
                    <div className="flex items-center px-3 py-1.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-md text-xs text-slate-500 whitespace-nowrap select-none">
                        <span className="font-bold text-slate-700 dark:text-slate-200 mr-1">{filtered.length}</span> records
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {isLoading ? (
                    <div className="p-6"><SkeletonLoader type="table"/></div>
                ) : filtered.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16">
                        <p className="text-slate-400 text-sm mb-4">
                            {searchTerm || filterClass ? 'No students match your filters.' : 'No students have been admitted yet.'}
                        </p>
                        <NavLink to="/students/admit"
                            className="px-4 py-2 bg-primary text-white font-bold text-sm rounded-md hover:bg-primary/90 transition-all duration-200">
                            + Admit First Student
                        </NavLink>
                    </div>
                ) : (
                    <>
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-left border-collapse" style={{ minWidth: 700 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 w-8">
                                            <input type="checkbox"
                                                className="w-3.5 h-3.5 rounded border-slate-500 cursor-pointer accent-primary"
                                                checked={selectedIds.length === filtered.length && filtered.length > 0}
                                                onChange={toggleAll}/>
                                        </th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Adm No</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Full Name</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Class</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-14 text-center">Sex</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-36">Parent / Phone</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Status</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((s, i) => (
                                        <tr key={s.id}
                                            className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                                selectedIds.includes(s.id) ? 'bg-primary/5 dark:bg-primary/10'
                                                : i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                            }`}>
                                            <td className="px-3 py-2">
                                                <input type="checkbox"
                                                    className="w-3.5 h-3.5 rounded border-slate-300 cursor-pointer accent-primary"
                                                    checked={selectedIds.includes(s.id)}
                                                    onChange={() => toggleOne(s.id)}/>
                                            </td>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">
                                                {String(i + 1).padStart(2, '0')}
                                            </td>
                                            <td className="px-3 py-2 font-mono text-xs text-slate-500 dark:text-slate-400 tracking-wide">
                                                {s.admission_number}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{s.first_name} {s.last_name}</span>
                                            </td>
                                            <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{s.grade_level}</td>
                                            <td className="px-3 py-2 text-center"><GBadge g={s.gender}/></td>
                                            <td className="px-3 py-2">
                                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight">{s.parent_name}</p>
                                                <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{s.parent_phone}</p>
                                            </td>
                                            <td className="px-3 py-2 text-center"><Badge status={s.status}/></td>
                                            <td className="px-3 py-2 text-right">
                                                <NavLink to={`/students/admit?id=${s.id}`}
                                                    className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">
                                                    Edit
                                                </NavLink>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30 flex items-center justify-between">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                                {filtered.length} student{filtered.length !== 1 ? 's' : ''}
                                {(searchTerm || filterClass) && ` · filtered from ${students.length}`}
                            </p>
                            {selectedIds.length > 0 && (
                                <button onClick={() => setDeleteOpen(true)}
                                    className="text-[10px] font-bold uppercase tracking-wider text-red-600 hover:text-red-800 transition-colors">
                                    Delete {selectedIds.length} selected
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            <ConfirmationModal
                isOpen={deleteOpen}
                title={`Delete ${selectedIds.length} Student Record(s)?`}
                message="This will permanently remove these students. This cannot be undone."
                onConfirm={handleBulkDelete}
                onCancel={() => setDeleteOpen(false)}
            />
        </div>
    );
};

export default StudentList;
