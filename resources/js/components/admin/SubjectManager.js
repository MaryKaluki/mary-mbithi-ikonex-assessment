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

// grade_levels is stored as a JSON array in the DB — we use only the first entry
const firstGradeLabel = (gradeLevels) => {
    if (!gradeLevels) return '—';
    const arr = Array.isArray(gradeLevels) ? gradeLevels : [];
    return GRADE_LABEL[arr[0]] || arr[0] || '—';
};

const DEPARTMENTS = [
    'Mathematics',
    'Languages',
    'Sciences',
    'Humanities',
    'Creative Arts',
    'Technical',
    'Physical Education',
    'Religious Education',
];

const inputCls =
    'w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm ' +
    'bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500';

const SubjectManager = () => {
    const [subjects, setSubjects]     = useState([]);
    const [isLoading, setIsLoading]   = useState(true);
    const [showModal, setShowModal]   = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [curriculumFilter, setCurriculumFilter] = useState('all');
    const [search, setSearch]         = useState('');
    const [form, setForm] = useState({
        name: '',
        code: '',
        department: '',
        curriculum_type: 'CBC',
        grade_level: 'grade_1',
        is_elective: false,
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
            name: sub.name,
            code: sub.code || '',
            department: sub.department || '',
            curriculum_type: sub.curriculum_type,
            grade_level: savedGrade,
            is_elective: sub.is_elective || false,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // DB stores grade_levels as a JSON array — wrap the single selection
        const payload = {
            ...form,
            grade_levels: [form.grade_level],
            grade_level: undefined,
        };
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
        const defaultGrade = ct === 'CBC' ? 'grade_1' : 'form_1';
        setForm(f => ({ ...f, curriculum_type: ct, grade_level: defaultGrade }));
    };

    const gradeLevels =
        form.curriculum_type === 'CBC' ? GRADE_LEVELS_CBC :
        form.curriculum_type === '844' ? GRADE_LEVELS_844 :
        ALL_GRADE_LEVELS;

    const filtered = subjects.filter(s => {
        const matchCurriculum = curriculumFilter === 'all' || s.curriculum_type === curriculumFilter;
        const matchSearch =
            !search ||
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            (s.code || '').toLowerCase().includes(search.toLowerCase());
        return matchCurriculum && matchSearch;
    });

    return (
        <div className="space-y-5 pb-20">

            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Subjects &amp; Learning Areas
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Manage CBC learning areas and 8-4-4 subjects offered by this school.
                    </p>
                </div>
                <button
                    onClick={openAdd}
                    className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors w-full sm:w-auto"
                >
                    Add Subject
                </button>
            </div>

            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden text-sm">
                    {[['all', 'All'], ['CBC', 'CBC'], ['844', '8-4-4']].map(([val, label]) => (
                        <button
                            key={val}
                            onClick={() => setCurriculumFilter(val)}
                            className={`px-4 py-2 font-medium transition-colors ${
                                curriculumFilter === val
                                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <input
                    type="text"
                    placeholder="Search by name or code..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-400 placeholder-gray-400"
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {isLoading ? (
                    <div className="p-6"><SkeletonLoader type="table" /></div>
                ) : filtered.length === 0 ? (
                    <div className="py-14 text-center text-sm text-gray-400 dark:text-gray-500">
                        {subjects.length === 0
                            ? 'No subjects added yet. Add your first subject above.'
                            : 'No subjects match your current filter.'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[680px]">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject Name</th>
                                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Code</th>
                                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grade Level</th>
                                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Curriculum</th>
                                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                    <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                {filtered.map(sub => (
                                    <tr
                                        key={sub.id}
                                        className="hover:bg-gray-50/70 dark:hover:bg-gray-700/30 group transition-colors"
                                    >
                                        <td className="px-5 py-3.5 font-semibold text-sm text-gray-900 dark:text-gray-100">
                                            {sub.name}
                                        </td>
                                        <td className="px-5 py-3.5 text-sm font-mono text-gray-500 dark:text-gray-400">
                                            {sub.code || '—'}
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-300">
                                            {firstGradeLabel(sub.grade_levels)}
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-300">
                                            {sub.department || '—'}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="inline-block border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                                                {sub.curriculum_type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400">
                                            {sub.is_elective ? 'Elective' : 'Compulsory'}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <button
                                                onClick={() => openEdit(sub)}
                                                className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 mr-4 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(sub.id)}
                                                className="text-sm font-medium text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {!isLoading && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                    Showing {filtered.length} of {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
                </p>
            )}

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {editTarget ? 'Edit Subject' : 'Add Subject'}
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
                                    Subject Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Mathematics Activities"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className={inputCls}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                        Subject Code
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. MAT-04"
                                        value={form.code}
                                        onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                        Curriculum
                                    </label>
                                    <select
                                        value={form.curriculum_type}
                                        onChange={e => handleCurriculumChange(e.target.value)}
                                        className={inputCls}
                                    >
                                        <option value="CBC">CBC</option>
                                        <option value="844">8-4-4</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                        Grade Level
                                    </label>
                                    <select
                                        value={form.grade_level}
                                        onChange={e => setForm(f => ({ ...f, grade_level: e.target.value }))}
                                        className={inputCls}
                                    >
                                        {gradeLevels.map(g => (
                                            <option key={g.value} value={g.value}>{g.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                        Department
                                    </label>
                                    <select
                                        value={form.department}
                                        onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                                        className={inputCls}
                                    >
                                        <option value="">No Department</option>
                                        {DEPARTMENTS.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 pt-1">
                                <input
                                    type="checkbox"
                                    id="is_elective"
                                    checked={form.is_elective}
                                    onChange={e => setForm(f => ({ ...f, is_elective: e.target.checked }))}
                                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 accent-gray-900"
                                />
                                <label htmlFor="is_elective" className="text-sm text-gray-600 dark:text-gray-300 select-none cursor-pointer">
                                    Mark as elective subject
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700 mt-4">
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
