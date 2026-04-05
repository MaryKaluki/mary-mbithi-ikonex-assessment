import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ROLES = [
    { value: 'teacher',     label: 'Teacher' },
    { value: 'accountant',  label: 'Accountant' },
    { value: 'librarian',   label: 'Librarian' },
    { value: 'hr_manager',  label: 'HR Manager' },
    { value: 'driver',      label: 'Driver' },
    { value: 'school_admin', label: 'School Admin' },
];

const DEPARTMENTS = [
    'Mathematics', 'Sciences', 'Languages', 'Social Studies', 'Creative Arts',
    'Physical Education', 'Technical', 'Religious Education', 'Administration',
    'Finance', 'Library', 'Transport', 'Other',
];

const Field = ({ label, error, children }) => (
    <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">{label}</label>
        {children}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
);

const inputClass = "w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white dark:focus:bg-gray-600 transition-colors";

const StaffCreate = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '', email: '', password: '', role: 'teacher',
        phone: '', department: '', join_date: '',
    });
    const [errors, setErrors]   = useState({});
    const [saving, setSaving]   = useState(false);
    const [showPass, setShowPass] = useState(false);

    const set = (field, val) => {
        setForm(f => ({ ...f, [field]: val }));
        if (errors[field]) setErrors(e => ({ ...e, [field]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        try {
            await window.axios.post('/api/admin/users', form);
            window.showToast?.('success', 'Staff member added successfully.');
            navigate('/admin/users/staff');
        } catch (err) {
            if (err.response?.status === 422) {
                const raw = err.response.data.errors || {};
                const flat = {};
                Object.keys(raw).forEach(k => { flat[k] = raw[k][0]; });
                setErrors(flat);
            } else {
                window.showToast?.('error', err.response?.data?.message || 'Failed to save staff member.');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/users/staff')}
                    className="text-gray-400 hover:text-primary transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                    </svg>
                </button>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Add Staff Member</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Create a new login account for a staff member</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
                    <h3 className="text-sm font-black uppercase text-gray-400 tracking-wider border-b border-gray-100 dark:border-gray-700 pb-2">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Full Name" error={errors.name}>
                            <input required value={form.name} onChange={e => set('name', e.target.value)}
                                className={inputClass} placeholder="e.g. Jane Wanjiru Kamau" />
                        </Field>
                        <Field label="Phone Number" error={errors.phone}>
                            <input value={form.phone} onChange={e => set('phone', e.target.value)}
                                className={inputClass} placeholder="+254 7XX XXX XXX" />
                        </Field>
                    </div>
                    <Field label="Email Address" error={errors.email}>
                        <input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
                            className={inputClass} placeholder="jane@school.ac.ke" />
                    </Field>
                    <Field label="Login Password" error={errors.password}>
                        <div className="relative">
                            <input required type={showPass ? 'text' : 'password'} value={form.password}
                                onChange={e => set('password', e.target.value)}
                                className={inputClass + ' pr-10'} placeholder="Minimum 8 characters" />
                            <button type="button" onClick={() => setShowPass(p => !p)}
                                className="absolute right-3 top-2 text-gray-400 hover:text-gray-600">
                                {showPass ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </Field>
                </div>

                {/* Employment */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
                    <h3 className="text-sm font-black uppercase text-gray-400 tracking-wider border-b border-gray-100 dark:border-gray-700 pb-2">Employment Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Role" error={errors.role}>
                            <select required value={form.role} onChange={e => set('role', e.target.value)} className={inputClass}>
                                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Department" error={errors.department}>
                            <select value={form.department} onChange={e => set('department', e.target.value)} className={inputClass}>
                                <option value="">— Select Department —</option>
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </Field>
                        <Field label="Joining Date" error={errors.join_date}>
                            <input type="date" value={form.join_date} onChange={e => set('join_date', e.target.value)}
                                className={inputClass} />
                        </Field>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => navigate('/admin/users/staff')}
                        className="px-5 py-2.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={saving}
                        className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-60 shadow-lg shadow-primary/20 transition-all">
                        {saving ? 'Saving...' : 'Add Staff Member'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StaffCreate;
