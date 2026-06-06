import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const GRADE_LEVELS_CBC = [
    { value: 'grade_1', label: 'Grade 1' },
    { value: 'grade_2', label: 'Grade 2' },
    { value: 'grade_3', label: 'Grade 3' },
    { value: 'grade_4', label: 'Grade 4' },
    { value: 'grade_5', label: 'Grade 5' },
    { value: 'grade_6', label: 'Grade 6' },
    { value: 'grade_7', label: 'Grade 7' },
    { value: 'grade_8', label: 'Grade 8' },
    { value: 'grade_9', label: 'Grade 9' },
];
const GRADE_LEVELS_844 = [
    { value: 'form_1', label: 'Form 1' },
    { value: 'form_2', label: 'Form 2' },
    { value: 'form_3', label: 'Form 3' },
    { value: 'form_4', label: 'Form 4' },
];
const ALL_GRADE_LEVELS = [...GRADE_LEVELS_CBC, ...GRADE_LEVELS_844];
const GRADE_LABEL = ALL_GRADE_LEVELS.reduce((acc, g) => ({ ...acc, [g.value]: g.label }), {});

const firstGradeLabel = (gradeLevels) => {
    if (!gradeLevels) return '—';
    const arr = Array.isArray(gradeLevels) ? gradeLevels : [];
    return GRADE_LABEL[arr[0]] || arr[0] || '—';
};

const DEPARTMENTS = [
    'Mathematics', 'Languages', 'Sciences', 'Humanities',
    'Creative Arts', 'Technical', 'Physical Education', 'Religious Education',
];

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const SubjectManager = () => {
    const [subjects, setSubjects]     = useState([]);
    const [isLoading, setIsLoading]   = useState(true);
    const [showModal, setShowModal]   = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [curriculumFilter, setCurriculumFilter] = useState('all');
    const [search, setSearch]         = useState('');
    const [form, setForm] = useState({
        name: '', code: '', department: '',
        curriculum_type: 'CBC', grade_level: 'grade_1', is_elective: false,
    });

    useEffect(() => { fetchSubjects(); }, []);

    const fetchSubjects = async () => {
        setIsLoading(true);
        try {
            const res = await window.axios.get('/api/admin/subjects');
            setSubjects(res.data);
        } catch {
            window.showToast('error', 'Failed to load subjects.');
        } finally {
            setIsLoading(false);
        }
    };

    const openAdd = () => {
        setEditTarget(null);
        setForm({ name: '', code: '', department: '', curriculum_type: 'CBC', grade_level: 'grade_1', is_elective: false });
        setShowModal(true);
    };

    const openEdit = (sub) => {
        setEditTarget(sub);
        const savedGrade = Array.isArray(sub.grade_levels) ? (sub.grade_levels[0] || 'grade_1') : 'grade_1';
        setForm({
            name: sub.name, code: sub.code || '', department: sub.department || '',
            curriculum_type: sub.curriculum_type, grade_level: savedGrade, is_elective: sub.is_elective || false,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...form, grade_levels: [form.grade_level], grade_level: undefined };
        try {
            if (editTarget) {
                await window.axios.put(`/api/admin/subjects/${editTarget.id}`, payload);
                window.showToast('success', 'Subject updated.');
            } else {
                await window.axios.post('/api/admin/subjects', payload);
                window.showToast('success', 'Subject added.');
            }
            setShowModal(false);
            fetchSubjects();
        } catch {
            window.showToast('error', 'Failed to save subject.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this subject? This cannot be undone.')) return;
        try {
            await window.axios.delete(`/api/admin/subjects/${id}`);
            window.showToast('success', 'Subject deleted.');
            fetchSubjects();
        } catch {
            window.showToast('error', 'Failed to delete subject.');
        }
    };

    const handleCurriculumChange = (ct) => {
        setForm(f => ({ ...f, curriculum_type: ct, grade_level: ct === 'CBC' ? 'grade_1' : 'form_1' }));
    };

    const gradeLevels =
        form.curriculum_type === 'CBC' ? GRADE_LEVELS_CBC :
        form.curriculum_type === '844' ? GRADE_LEVELS_844 :
        ALL_GRADE_LEVELS;

    const filtered = subjects.filter(s => {
        const matchCurriculum = curriculumFilter === 'all' || s.curriculum_type === curriculumFilter;
        const matchSearch = !search ||
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            (s.code || '').toLowerCase().includes(search.toLowerCase());
        return matchCurriculum && matchSearch;
    });

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Admin <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Subjects</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">
                        Subjects &amp; Learning Areas
                        {!isLoading && <span className="ml-2 text-xs font-normal text-slate-400">— {filtered.length} subject{filtered.length !== 1 ? 's' : ''}</span>}
                    </h1>
                </div>
                <button onClick={openAdd}
                    className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary/90 text-sm transition-all duration-200">
                    + Add Subject
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-shrink-0">
                <div className="flex border border-slate-300 dark:border-gray-600 rounded-md overflow-hidden text-xs">
                    {[['all', 'All'], ['CBC', 'CBC'], ['844', '8-4-4']].map(([val, label]) => (
                        <button key={val} onClick={() => setCurriculumFilter(val)}
                            className={`px-3 py-1.5 font-bold transition-colors ${
                                curriculumFilter === val
                                    ? 'bg-slate-800 dark:bg-slate-700 text-white'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-gray-700/50'
                            }`}>
                            {label}
                        </button>
                    ))}
                </div>
                <div className="flex-1 relative">
                    <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input type="text" placeholder="Search by name or code…"
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                        value={search} onChange={e => setSearch(e.target.value)}/>
                </div>
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
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-slate-400 text-sm">
                            {subjects.length === 0 ? 'No subjects added yet.' : 'No subjects match your filter.'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-left border-collapse" style={{ minWidth: 680 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Subject Name</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Code</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Grade</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-36">Department</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Curriculum</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-center">Category</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((sub, i) => (
                                        <tr key={sub.id}
                                            className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group ${
                                                i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                            }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">
                                                {String(i + 1).padStart(2, '0')}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{sub.name}</span>
                                            </td>
                                            <td className="px-3 py-2 font-mono text-xs text-slate-500 dark:text-slate-400">{sub.code || '—'}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{firstGradeLabel(sub.grade_levels)}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{sub.department || '—'}</td>
                                            <td className="px-3 py-2 text-center">
                                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                                    {sub.curriculum_type}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                                    sub.is_elective
                                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                        : 'bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                    {sub.is_elective ? 'Elective' : 'Core'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button onClick={() => openEdit(sub)}
                                                        className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDelete(sub.id)}
                                                        className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors">
                                                        Del
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                                {filtered.length} subject{filtered.length !== 1 ? 's' : ''}
                                {(search || curriculumFilter !== 'all') && ` · filtered from ${subjects.length}`}
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-slate-200 dark:border-gray-700">
                        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-gray-900/50 border-b border-slate-200 dark:border-gray-700">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                                {editTarget ? 'Edit Subject' : 'Add Subject'}
                            </h3>
                            <button onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Subject Name *</label>
                                <input type="text" required placeholder="e.g. Mathematics Activities"
                                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className={inputCls}/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Subject Code</label>
                                    <input type="text" placeholder="e.g. MAT-04"
                                        value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                                        className={inputCls}/>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Curriculum</label>
                                    <select value={form.curriculum_type} onChange={e => handleCurriculumChange(e.target.value)} className={inputCls}>
                                        <option value="CBC">CBC</option>
                                        <option value="844">8-4-4</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Grade Level</label>
                                    <select value={form.grade_level} onChange={e => setForm(f => ({ ...f, grade_level: e.target.value }))} className={inputCls}>
                                        {gradeLevels.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Department</label>
                                    <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className={inputCls}>
                                        <option value="">No Department</option>
                                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                                <input type="checkbox" id="is_elective" checked={form.is_elective}
                                    onChange={e => setForm(f => ({ ...f, is_elective: e.target.checked }))}
                                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-gray-600 accent-primary"/>
                                <label htmlFor="is_elective" className="text-xs text-slate-600 dark:text-slate-300 select-none cursor-pointer">
                                    Mark as elective subject
                                </label>
                            </div>
                            <div className="flex justify-end gap-2 pt-1 border-t border-slate-100 dark:border-gray-700">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="px-5 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                                    {editTarget ? 'Save Changes' : 'Add Subject'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectManager;
