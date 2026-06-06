import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

const Field = ({ label, error, children }) => (
    <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</label>
        {children}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
);

const StaffCreate = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '', email: '', password: '', role: 'teacher',
        phone: '', department: '', join_date: '',
    });
    const [errors,   setErrors]   = useState({});
    const [saving,   setSaving]   = useState(false);
    const [showPass, setShowPass] = useState(false);

    const set = (field, val) => {
        setForm(f => ({ ...f, [field]: val }));
        if (errors[field]) setErrors(e => ({ ...e, [field]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setErrors({});
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
        } finally { setSaving(false); }
    };

    return (
        <div className="flex flex-col space-y-3 h-full pb-6 max-w-2xl">

            {/* Header */}
            <div className="flex items-center gap-3 flex-shrink-0">
                <button onClick={() => navigate('/admin/users/staff')}
                    className="px-3 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                    ← Back
                </button>
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        HR <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Add Staff Member</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Add Staff Member</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">

                {/* Personal Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
                    <div className="px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Personal Information</span>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Full Name *" error={errors.name}>
                            <input required value={form.name} onChange={e => set('name', e.target.value)}
                                className={inputCls} placeholder="e.g. Jane Wanjiru Kamau"/>
                        </Field>
                        <Field label="Phone Number" error={errors.phone}>
                            <input value={form.phone} onChange={e => set('phone', e.target.value)}
                                className={inputCls} placeholder="+254 7XX XXX XXX"/>
                        </Field>
                        <div className="sm:col-span-2">
                            <Field label="Email Address *" error={errors.email}>
                                <input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
                                    className={inputCls} placeholder="jane@school.ac.ke"/>
                            </Field>
                        </div>
                        <div className="sm:col-span-2">
                            <Field label="Login Password *" error={errors.password}>
                                <div className="relative">
                                    <input required type={showPass ? 'text' : 'password'} value={form.password}
                                        onChange={e => set('password', e.target.value)}
                                        className={inputCls + ' pr-10'} placeholder="Minimum 8 characters"/>
                                    <button type="button" onClick={() => setShowPass(p => !p)}
                                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors">
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
                    </div>
                </div>

                {/* Employment Details */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
                    <div className="px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Employment Details</span>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Role *" error={errors.role}>
                            <select required value={form.role} onChange={e => set('role', e.target.value)} className={inputCls}>
                                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Department" error={errors.department}>
                            <select value={form.department} onChange={e => set('department', e.target.value)} className={inputCls}>
                                <option value="">— Select Department —</option>
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </Field>
                        <Field label="Joining Date" error={errors.join_date}>
                            <input type="date" value={form.join_date} onChange={e => set('join_date', e.target.value)}
                                className={inputCls}/>
                        </Field>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 flex-shrink-0">
                    <button type="button" onClick={() => navigate('/admin/users/staff')}
                        className="px-4 py-1.5 border border-slate-300 dark:border-gray-600 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={saving}
                        className="px-5 py-1.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">
                        {saving ? 'Saving…' : 'Add Staff Member'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StaffCreate;
