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

const inputCls = "w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40";

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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-white">Edit Staff Member</h3>
                        <p className="text-xs text-gray-400">{staff.name}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Full Name</label>
                            <input required value={form.name} onChange={e => set('name', e.target.value)} className={inputCls}/>
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Email</label>
                            <input required type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputCls}/>
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Role</label>
                            <select value={form.role} onChange={e => set('role', e.target.value)} className={inputCls}>
                                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Phone</label>
                            <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+254 7XX…" className={inputCls}/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Department</label>
                            <select value={form.department} onChange={e => set('department', e.target.value)} className={inputCls}>
                                <option value="">— Select —</option>
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Join Date</label>
                            <input type="date" value={form.join_date} onChange={e => set('join_date', e.target.value)} className={inputCls}/>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                                New Password <span className="text-gray-300 font-normal">(leave blank to keep current)</span>
                            </label>
                            <div className="relative">
                                <input type={showPass ? 'text' : 'password'} value={form.password}
                                    onChange={e => set('password', e.target.value)}
                                    placeholder="Minimum 8 characters" className={inputCls + ' pr-10'}/>
                                <button type="button" onClick={() => setShowPass(p => !p)}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showPass
                                            ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                            : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"}
                                        />
                                    </svg>
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-500">Cancel</button>
                        <button type="submit" disabled={saving}
                            className="px-6 py-2 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 disabled:opacity-60">
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
    const [searchTerm, setSearchTerm]   = useState('');
    const [filterRole, setFilterRole]   = useState('All');
    const [staff, setStaff]             = useState([]);
    const [isLoading, setIsLoading]     = useState(true);
    const [editTarget, setEditTarget]   = useState(null);

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
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase());
        const displayRole = member.role.replace('_', ' ').toLowerCase();
        const matchesFilter = filterRole === 'All' || displayRole === filterRole.toLowerCase();
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6 pb-20">
            {editTarget && (
                <EditModal staff={editTarget} onClose={() => setEditTarget(null)} onSaved={fetchStaff}/>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Staff Management</h2>
                <button onClick={() => navigate('/admin/users/staff/create')}
                    className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 text-sm w-full sm:w-auto text-center">
                    + Add New Staff
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-zinc-800 p-3 md:p-4 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700 flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <input type="text" placeholder="Search by Name or Email…"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-zinc-900 dark:text-gray-200 dark:placeholder-gray-500"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                </div>
                <select className="px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-zinc-900 dark:text-gray-200 w-full sm:w-auto"
                    value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                    <option value="All">All Roles</option>
                    {ROLES.map(r => <option key={r.value} value={r.label}>{r.label}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700 overflow-hidden">
                {isLoading ? (
                    <div className="p-6"><SkeletonLoader type="table" /></div>
                ) : filteredStaff.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 font-bold dark:text-gray-400">
                        No staff members found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                            <thead className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-700">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Employee</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Department</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-zinc-700/50">
                                {filteredStaff.map((member) => (
                                    <tr key={member.id} className="hover:bg-primary/5 dark:hover:bg-zinc-700/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm bg-primary/10 text-primary flex-shrink-0">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 dark:text-gray-200">{member.name}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">{member.pin ? 'PIN Active' : 'No PIN'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-gray-100 dark:bg-gray-700 dark:text-gray-300 text-gray-600">
                                                {member.role.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {member.department || <span className="text-gray-300 dark:text-gray-600 italic text-xs">—</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-gray-600 dark:text-gray-400">{member.email}</p>
                                            {member.phone && <p className="text-xs text-gray-400">{member.phone}</p>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e) => { e.stopPropagation(); navigate(`/hr/staff/${member.id}/documents`); }}
                                                    className="text-purple-600 font-bold text-sm hover:underline dark:text-purple-400">
                                                    Docs
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); setEditTarget(member); }}
                                                    className="text-primary font-bold text-sm hover:underline">
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
