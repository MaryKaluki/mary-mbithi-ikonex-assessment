import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const Field = ({ label, children }) => (
    <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</label>
        {children}
    </div>
);

const SectionCard = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{title}</span>
        </div>
        <div className="p-4">{children}</div>
    </div>
);

const GRADE_LEVELS = ['Kindergarten', 'PP1', 'PP2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Form 1', 'Form 2', 'Form 3', 'Form 4'];

const StudentAdmit = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '', middle_name: '', last_name: '', date_of_birth: '', gender: 'Male',
        blood_group: '', religion: '', nationality: 'Kenyan',
        medical_conditions: '', allergies: '', has_special_needs: false, special_needs_details: '',
        grade_level: 'Grade 1', house_group: '', mode_of_transport: 'Walking', previous_school: '',
        residential_address: '',
        parent_name: '', parent_relationship: 'Father', parent_phone: '', parent_email: '',
        secondary_parent_name: '', secondary_parent_relationship: '', secondary_parent_phone: '',
        nemis_upi: '', birth_certificate_number: '',
    });

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const editId = queryParams.get('id');
        if (editId) {
            setIsEdit(true);
            window.axios.get(`/api/admin/students/${editId}`)
                .then(res => {
                    const s = res.data.student;
                    setFormData({
                        first_name: s.first_name || '',
                        middle_name: s.middle_name || '',
                        last_name: s.last_name || '',
                        date_of_birth: s.date_of_birth || '',
                        gender: s.gender || 'Male',
                        blood_group: s.blood_group || '',
                        religion: s.religion || '',
                        nationality: s.nationality || 'Kenyan',
                        medical_conditions: s.medical_conditions || '',
                        allergies: s.allergies || '',
                        has_special_needs: !!s.has_special_needs,
                        special_needs_details: s.special_needs_details || '',
                        grade_level: s.grade_level || 'Grade 1',
                        house_group: s.house_group || '',
                        mode_of_transport: s.mode_of_transport || 'Walking',
                        previous_school: s.previous_school || '',
                        residential_address: s.residential_address || '',
                        parent_name: s.parent_name || '',
                        parent_relationship: s.parent_relationship || 'Father',
                        parent_phone: s.parent_phone || '',
                        parent_email: s.parent_email || '',
                        secondary_parent_name: s.secondary_parent_name || '',
                        secondary_parent_relationship: s.secondary_parent_relationship || '',
                        secondary_parent_phone: s.secondary_parent_phone || '',
                        nemis_upi: s.nemis_upi || '',
                        birth_certificate_number: s.birth_certificate_number || '',
                    });
                })
                .catch(() => {
                    window.showToast?.('error', 'Failed to load student details.');
                });
        }
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const queryParams = new URLSearchParams(window.location.search);
            const editId = queryParams.get('id');
            if (editId) {
                const res = await window.axios.put(`/api/admin/students/${editId}`, formData);
                window.showToast?.('success', res.data.message || 'Student updated successfully!');
            } else {
                const res = await window.axios.post('/api/admin/students/admit', formData);
                window.showToast?.('success', res.data.message || 'Student admitted successfully!');
            }
            navigate('/admin/users/students');
        } catch (err) {
            if (err.response?.data?.errors) {
                const firstError = Object.values(err.response.data.errors)[0][0];
                window.showToast?.('error', firstError);
            } else {
                window.showToast?.('error', 'Failed to save student details. Please check all fields.');
            }
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col space-y-3 pb-6 max-w-5xl">

            {/* Header */}
            <div className="flex items-center gap-3 flex-shrink-0">
                <button onClick={() => navigate(-1)}
                    className="px-3 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                    ← Back
                </button>
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Admin <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">{isEdit ? 'Edit Details' : 'Admit Student'}</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">{isEdit ? 'Edit Student Details' : 'Admit Student'}</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">

                {/* Identification */}
                <SectionCard title="Identification & Demographics">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Field label="First Name *">
                            <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} className={inputCls}/>
                        </Field>
                        <Field label="Middle Name">
                            <input type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} className={inputCls}/>
                        </Field>
                        <Field label="Last Name *">
                            <input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} className={inputCls}/>
                        </Field>
                        <Field label="Date of Birth *">
                            <input type="date" name="date_of_birth" required value={formData.date_of_birth} onChange={handleChange} className={inputCls}/>
                        </Field>
                        <Field label="Gender *">
                            <select name="gender" value={formData.gender} onChange={handleChange} className={inputCls}>
                                <option>Male</option><option>Female</option><option>Other</option>
                            </select>
                        </Field>
                        <Field label="Nationality *">
                            <input type="text" name="nationality" required value={formData.nationality} onChange={handleChange} className={inputCls}/>
                        </Field>
                        <Field label="Religion">
                            <input type="text" name="religion" value={formData.religion} onChange={handleChange} className={inputCls} placeholder="e.g. Christian, Islamic"/>
                        </Field>
                        <Field label="Blood Group">
                            <select name="blood_group" value={formData.blood_group} onChange={handleChange} className={inputCls}>
                                <option value="">Select…</option>
                                <option>A+</option><option>A-</option>
                                <option>B+</option><option>B-</option>
                                <option>O+</option><option>O-</option>
                                <option>AB+</option><option>AB-</option>
                            </select>
                        </Field>
                        <Field label="NEMIS UPI">
                            <input type="text" name="nemis_upi" value={formData.nemis_upi} onChange={handleChange} className={inputCls + ' font-mono'}/>
                        </Field>
                        <Field label="Birth Cert. No.">
                            <input type="text" name="birth_certificate_number" value={formData.birth_certificate_number} onChange={handleChange} className={inputCls + ' font-mono'}/>
                        </Field>
                    </div>
                </SectionCard>

                {/* Health */}
                <SectionCard title="Health & Special Needs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Medical Conditions">
                            <textarea name="medical_conditions" value={formData.medical_conditions} onChange={handleChange}
                                rows={2} className={inputCls + ' resize-none'} placeholder="Any pre-existing conditions…"/>
                        </Field>
                        <Field label="Known Allergies">
                            <textarea name="allergies" value={formData.allergies} onChange={handleChange}
                                rows={2} className={inputCls + ' resize-none'} placeholder="e.g. Nuts, Dust…"/>
                        </Field>
                        <div className="md:col-span-2 flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-gray-700/50 rounded-md">
                            <input type="checkbox" name="has_special_needs" id="needs_check"
                                checked={formData.has_special_needs} onChange={handleChange}
                                className="w-4 h-4 rounded text-primary border-slate-300 focus:ring-blue-500"/>
                            <label htmlFor="needs_check" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                This student has special educational needs / physical requirements
                            </label>
                        </div>
                        {formData.has_special_needs && (
                            <div className="md:col-span-2">
                                <Field label="Special Needs Details">
                                    <textarea name="special_needs_details" value={formData.special_needs_details} onChange={handleChange}
                                        rows={2} className={inputCls + ' resize-none'} placeholder="Specific details for faculty attention…"/>
                                </Field>
                            </div>
                        )}
                    </div>
                </SectionCard>

                {/* Academic */}
                <SectionCard title="Academic & Logistics">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Field label="Grade / Class *">
                            <select name="grade_level" value={formData.grade_level} onChange={handleChange} className={inputCls}>
                                {GRADE_LEVELS.map(g => <option key={g}>{g}</option>)}
                            </select>
                        </Field>
                        <Field label="House / Group">
                            <input type="text" name="house_group" value={formData.house_group} onChange={handleChange} className={inputCls} placeholder="e.g. Red House"/>
                        </Field>
                        <Field label="Transport Mode *">
                            <select name="mode_of_transport" value={formData.mode_of_transport} onChange={handleChange} className={inputCls}>
                                <option>Walking</option><option>Private</option><option>School Bus</option><option>Public</option>
                            </select>
                        </Field>
                        <Field label="Previous School">
                            <input type="text" name="previous_school" value={formData.previous_school} onChange={handleChange} className={inputCls}/>
                        </Field>
                        <div className="md:col-span-4">
                            <Field label="Residential Address">
                                <input type="text" name="residential_address" value={formData.residential_address} onChange={handleChange}
                                    className={inputCls} placeholder="Street, Area / Estate, City"/>
                            </Field>
                        </div>
                    </div>
                </SectionCard>

                {/* Parents */}
                <SectionCard title="Parent / Guardian Information">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Primary */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary border-l-2 border-primary pl-2">Primary Guardian</p>
                            <Field label="Full Name *">
                                <input type="text" name="parent_name" required value={formData.parent_name} onChange={handleChange} className={inputCls}/>
                            </Field>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Relationship *">
                                    <select name="parent_relationship" value={formData.parent_relationship} onChange={handleChange} className={inputCls}>
                                        <option>Father</option><option>Mother</option><option>Guardian</option><option>Other</option>
                                    </select>
                                </Field>
                                <Field label="Phone *">
                                    <input type="tel" name="parent_phone" required value={formData.parent_phone} onChange={handleChange} className={inputCls}/>
                                </Field>
                            </div>
                            <Field label="Email">
                                <input type="email" name="parent_email" value={formData.parent_email} onChange={handleChange} className={inputCls}/>
                            </Field>
                        </div>

                        {/* Secondary */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-l-2 border-slate-300 dark:border-gray-600 pl-2">Secondary Guardian (Optional)</p>
                            <Field label="Full Name">
                                <input type="text" name="secondary_parent_name" value={formData.secondary_parent_name} onChange={handleChange} className={inputCls}/>
                            </Field>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Relationship">
                                    <input type="text" name="secondary_parent_relationship" value={formData.secondary_parent_relationship} onChange={handleChange} className={inputCls} placeholder="e.g. Uncle"/>
                                </Field>
                                <Field label="Phone">
                                    <input type="tel" name="secondary_parent_phone" value={formData.secondary_parent_phone} onChange={handleChange} className={inputCls}/>
                                </Field>
                            </div>
                        </div>
                    </div>
                </SectionCard>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => navigate(-1)}
                        className="px-4 py-1.5 border border-slate-300 dark:border-gray-600 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting}
                        className="px-5 py-1.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">
                        {isSubmitting ? (isEdit ? 'Saving…' : 'Registering…') : (isEdit ? 'Save Changes' : 'Finalize Admission')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StudentAdmit;
