import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SkeletonLoader } from '../common/Loader';

const ROLES = [
    { value: 'teacher',      label: 'Teacher' },
    { value: 'accountant',   label: 'Accountant' },
    { value: 'librarian',    label: 'Librarian' },
    { value: 'hr_manager',   label: 'HR Manager' },
    { value: 'driver',       label: 'Driver' },
    { value: 'school_admin', label: 'School Admin' },
];

const DEPARTMENTS = [
    'Mathematics', 'Sciences', 'Languages', 'Social Studies', 'Creative Arts',
    'Physical Education', 'Technical', 'Religious Education', 'Administration',
    'Finance', 'Library', 'Transport', 'Other',
];

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const EditModal = ({ staff, onClose, onSaved }) => {
    const [form, setForm] = useState({
        name:       staff.name       ?? '',
        email:      staff.email      ?? '',
        role:       staff.role       ?? 'teacher',
        phone:      staff.phone      ?? '',
        department: staff.department ?? '',
        join_date:  staff.join_date  ?? '',
        password:   '',
    });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPass, setShowPass] = useState(false);

    const set = (k, v) => {
        setForm(f => ({ ...f, [k]: v }));
        if (errors[k]) setErrors(e => ({ ...e, [k]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        try {
            await window.axios.put(`/api/admin/users/${staff.id}`, payload);
            window.showToast?.('success', 'Staff member updated.');
            onSaved();
            onClose();
        } catch (err) {
            if (err.response?.status === 422) {
                const raw = err.response.data.errors || {};
                const flat = {};
                Object.keys(raw).forEach(k => { flat[k] = raw[k][0]; });
                setErrors(flat);
            } else {
                window.showToast?.('error', err.response?.data?.message || 'Failed to update.');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg border border-slate-200 dark:border-gray-700">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 rounded-t-lg">
                    <div>
                        <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wide">Edit Staff Member</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{staff.name}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none transition-colors">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 mb-1 uppercase tracking-wider">Full Name</label>
                            <input required value={form.name} onChange={e => set('name', e.target.value)} className={inputCls}/>
                            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 mb-1 uppercase tracking-wider">Email</label>
                            <input required type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputCls}/>
                            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 mb-1 uppercase tracking-wider">Role</label>
                            <select value={form.role} onChange={e => set('role', e.target.value)} className={inputCls}>
                                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 mb-1 uppercase tracking-wider">Phone</label>
                            <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+254 7XX…" className={inputCls}/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 mb-1 uppercase tracking-wider">Department</label>
                            <select value={form.department} onChange={e => set('department', e.target.value)} className={inputCls}>
                                <option value="">— Select —</option>
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 mb-1 uppercase tracking-wider">Join Date</label>
                            <input type="date" value={form.join_date} onChange={e => set('join_date', e.target.value)} className={inputCls}/>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 mb-1 uppercase tracking-wider">
                                New Password <span className="text-slate-400 font-normal normal-case">(leave blank to keep current)</span>
                            </label>
                            <div className="relative">
                                <input type={showPass ? 'text' : 'password'} value={form.password}
                                    onChange={e => set('password', e.target.value)}
                                    placeholder="Minimum 8 characters" className={inputCls + ' pr-10'}/>
                                <button type="button" onClick={() => setShowPass(p => !p)}
                                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showPass
                                            ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                            : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"}
                                        />
                                    </svg>
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-gray-700">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            className="px-5 py-2 bg-blue-700 text-white font-bold text-sm rounded-md hover:bg-blue-800 disabled:opacity-60 transition-all duration-200">
                            {saving ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const StaffList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('All');
    const [staff, setStaff]           = useState([]);
    const [isLoading, setIsLoading]   = useState(true);
    const [editTarget, setEditTarget] = useState(null);

    const fetchStaff = async () => {
        setIsLoading(true);
        try {
            const res = await window.axios.get('/api/admin/users?type=staff');
            setStaff(res.data.users || []);
        } catch {
            window.showToast?.('error', 'Failed to load staff list.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchStaff(); }, []);

    const filteredStaff = staff.filter(member => {
        const matchesSearch =
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase());
        const displayRole = member.role.replace('_', ' ').toLowerCase();
        const matchesFilter = filterRole === 'All' || displayRole === filterRole.toLowerCase();
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-4 pb-20">
            {editTarget && (
                <EditModal staff={editTarget} onClose={() => setEditTarget(null)} onSaved={fetchStaff}/>
            )}

            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <nav className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">
                        <span>Admin</span>
                        <span className="mx-1.5">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-medium">Staff Management</span>
                    </nav>
                    <h1 className="text-lg font-bold text-slate-800 dark:text-gray-100">Staff Management</h1>
                </div>
                <button
                    onClick={() => navigate('/admin/users/staff/create')}
                    className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary/90 text-sm transition-all duration-200 flex items-center gap-1.5 shadow-sm"
                >
                    <span className="text-base leading-none">+</span> Add Staff
                </button>
            </div>

            {/* Search + Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                    <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name or email…"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="px-3 py-2 text-sm border border-slate-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-200 w-full sm:w-44"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                >
                    <option value="All">All Roles</option>
                    {ROLES.map(r => <option key={r.value} value={r.label}>{r.label}</option>)}
                </select>
                {!isLoading && (
                    <div className="flex items-center px-3 py-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-md text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap select-none">
                        <span className="font-bold text-slate-700 dark:text-slate-200 mr-1">{filteredStaff.length}</span> records
                    </div>
                )}
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-6"><SkeletonLoader type="table" /></div>
                ) : filteredStaff.length === 0 ? (
                    <div className="py-16 text-center">
                        <p className="text-slate-400 dark:text-gray-500 text-sm mb-4">
                            {searchTerm || filterRole !== 'All'
                                ? 'No staff match your filters.'
                                : 'No staff members have been added yet.'}
                        </p>
                        <button
                            onClick={() => navigate('/admin/users/staff/create')}
                            className="px-4 py-2 bg-primary text-white font-bold text-sm rounded-md hover:bg-primary/90 transition-all duration-200"
                        >
                            + Add First Staff Member
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[750px]">
                            <thead className="bg-slate-100 dark:bg-gray-900/50 border-b border-slate-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Employee</th>
                                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Role</th>
                                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Department</th>
                                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Contact</th>
                                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Joined</th>
                                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStaff.map((member) => (
                                    <tr key={member.id} className="border-b border-slate-200 dark:border-gray-700 hover:bg-blue-50/50 dark:hover:bg-gray-700/40 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs bg-primary/10 text-primary flex-shrink-0">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm text-slate-800 dark:text-gray-200 leading-tight">{member.name}</p>
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{member.pin ? 'PIN Active' : 'No PIN'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-slate-100 dark:bg-gray-700 dark:text-gray-300 text-slate-600">
                                                {member.role.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-500 dark:text-gray-400">
                                            {member.department || <span className="text-slate-300 dark:text-gray-600">—</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-xs text-slate-600 dark:text-gray-400">{member.email}</p>
                                            {member.phone && <p className="text-xs text-slate-400 mt-0.5">{member.phone}</p>}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500 dark:text-gray-400">
                                            {member.join_date || <span className="text-slate-300 dark:text-gray-600">—</span>}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/hr/staff/${member.id}/documents`); }}
                                                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                                                >
                                                    Docs
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setEditTarget(member); }}
                                                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                            </div>
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

export default StaffList;
