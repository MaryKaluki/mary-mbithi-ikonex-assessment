import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const StudentAdmit = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '', middle_name: '', last_name: '', date_of_birth: '', gender: 'Male',
        blood_group: '', religion: '', nationality: 'Kenyan',
        medical_conditions: '', allergies: '', has_special_needs: false, special_needs_details: '',
        grade_level: 'Grade 1', house_group: '', mode_of_transport: 'Walking', previous_school: '',
        residential_address: '',
        parent_name: '', parent_relationship: 'Father', parent_phone: '', parent_email: '',
        secondary_parent_name: '', secondary_parent_relationship: '', secondary_parent_phone: '',
        nemis_upi: '', birth_certificate_number: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await window.axios.post('/api/admin/students/admit', formData);
            window.showToast('success', res.data.message || 'Student admitted successfully!');
            navigate('/admin/users/students');
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.errors) {
                const firstError = Object.values(err.response.data.errors)[0][0];
                window.showToast('error', firstError);
            } else {
                window.showToast('error', 'Failed to admit student. Please check all fields.');
            }
            setIsSubmitting(false);
        }
    };

    const SectionHeader = ({ title, icon }) => (
        <div className="flex items-center space-x-2 border-b border-gray-100 dark:border-gray-700 pb-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">{title}</h3>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="flex items-center mb-8">
                <button onClick={() => navigate(-1)} className="mr-4 text-gray-400 hover:text-primary transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <div className="min-w-0">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Admit Student</h2>
                    <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Complete the comprehensive registration form below.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Identification & Demographics */}
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:bg-zinc-800 dark:border-zinc-700">
                    <SectionHeader title="Identification & Demographics" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">First Name *</label>
                            <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-primary dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Middle Name</label>
                            <input type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-primary dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Last Name *</label>
                            <input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-primary dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Date of Birth *</label>
                            <input type="date" name="date_of_birth" required value={formData.date_of_birth} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-primary dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Gender *</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-primary dark:bg-zinc-900 dark:border-zinc-700 dark:text-white">
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nationality *</label>
                            <input type="text" name="nationality" required value={formData.nationality} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-primary dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Religion</label>
                            <input type="text" name="religion" value={formData.religion} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-primary dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" placeholder="e.g. Christian, Islamic" />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Blood Group</label>
                            <select name="blood_group" value={formData.blood_group} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-primary dark:bg-zinc-900 dark:border-zinc-700 dark:text-white">
                                <option value="">Select...</option>
                                <option>A+</option><option>A-</option>
                                <option>B+</option><option>B-</option>
                                <option>O+</option><option>O-</option>
                                <option>AB+</option><option>AB-</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">NEMIS UPI</label>
                            <input type="text" name="nemis_upi" value={formData.nemis_upi} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-primary dark:bg-zinc-900 dark:border-zinc-700 dark:text-white font-mono" />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Birth Cert. No.</label>
                            <input type="text" name="birth_certificate_number" value={formData.birth_certificate_number} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-primary dark:bg-zinc-900 dark:border-zinc-700 dark:text-white font-mono" />
                        </div>
                    </div>
                </div>

                {/* Health & Special Needs */}
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:bg-zinc-800 dark:border-zinc-700">
                    <SectionHeader title="Health & Special Needs" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Medical Conditions</label>
                            <textarea name="medical_conditions" value={formData.medical_conditions} onChange={handleChange} rows="2" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-primary dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" placeholder="Any pre-existing conditions..." />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Known Allergies</label>
                            <textarea name="allergies" value={formData.allergies} onChange={handleChange} rows="2" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-primary dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" placeholder="e.g. Nuts, Dust..." />
                        </div>
                        <div className="md:col-span-2 flex items-center space-x-4 p-4 bg-gray-50 dark:bg-zinc-900 rounded-xl">
                            <input type="checkbox" name="has_special_needs" checked={formData.has_special_needs} onChange={handleChange} className="w-5 h-5 rounded text-primary border-gray-300 focus:ring-primary" id="needs_check" />
                            <label htmlFor="needs_check" className="text-sm font-bold text-gray-700 dark:text-gray-300">This student has special educational needs / physical requirements</label>
                        </div>
                        {formData.has_special_needs && (
                            <div className="md:col-span-2 animate-fadeIn">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Special Needs Details</label>
                                <textarea name="special_needs_details" value={formData.special_needs_details} onChange={handleChange} rows="2" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-primary dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" placeholder="Specific details for faculty attention..." />
                            </div>
                        )}
                    </div>
                </div>

                {/* Academic & Academic Background */}
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:bg-zinc-800 dark:border-zinc-700">
                    <SectionHeader title="Academic & Logistics" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.168.477-4.5 1.253" />} />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Grade / Class *</label>
                            <select name="grade_level" value={formData.grade_level} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-primary dark:bg-zinc-900 dark:border-zinc-700 dark:text-white font-bold">
                                {['Kindergarten', 'PP1', 'PP2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Form 1', 'Form 2', 'Form 3', 'Form 4'].map(g => (
                                    <option key={g}>{g}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">House / Group</label>
                            <input type="text" name="house_group" value={formData.house_group} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-primary dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" placeholder="e.g. Red House" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Transport Mode *</label>
                            <select name="mode_of_transport" value={formData.mode_of_transport} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-primary dark:bg-zinc-900 dark:border-zinc-700 dark:text-white">
                                <option>Walking</option>
                                <option>Private</option>
                                <option>School Bus</option>
                                <option>Public</option>
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Previous School</label>
                            <input type="text" name="previous_school" value={formData.previous_school} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-primary dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" />
                        </div>
                        <div className="md:col-span-4">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Residential Physical Address</label>
                            <input type="text" name="residential_address" value={formData.residential_address} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-primary dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" placeholder="Street, Area / Estate, City" />
                        </div>
                    </div>
                </div>

                {/* Parent / Guardian Information */}
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:bg-zinc-800 dark:border-zinc-700">
                    <SectionHeader title="Parent / Guardian Primary & Secondary" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Primary Parent */}
                        <div className="space-y-4">
                            <div className="text-xs font-black text-primary uppercase tracking-widest mb-4 border-l-2 border-primary pl-2">Primary Guardian</div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Name *</label>
                                <input type="text" name="parent_name" required value={formData.parent_name} onChange={handleChange} className="w-full px-4 py-2 border border-blue-50 dark:border-zinc-700 bg-blue-50/10 rounded-lg" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Relationship *</label>
                                    <select name="parent_relationship" value={formData.parent_relationship} onChange={handleChange} className="w-full px-4 py-2 border border-blue-50 dark:border-zinc-700 bg-blue-50/10 rounded-lg">
                                        <option>Father</option><option>Mother</option><option>Guardian</option><option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone Number *</label>
                                    <input type="tel" name="parent_phone" required value={formData.parent_phone} onChange={handleChange} className="w-full px-4 py-2 border border-blue-50 dark:border-zinc-700 bg-blue-50/10 rounded-lg" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Address</label>
                                <input type="email" name="parent_email" value={formData.parent_email} onChange={handleChange} className="w-full px-4 py-2 border border-blue-50 dark:border-zinc-700 bg-blue-50/10 rounded-lg" />
                            </div>
                        </div>

                        {/* Secondary Parent */}
                        <div className="space-y-4">
                            <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 border-l-2 border-gray-300 pl-2 dark:text-gray-400 dark:border-gray-600">Secondary / Alternative Guardian</div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</label>
                                <input type="text" name="secondary_parent_name" value={formData.secondary_parent_name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-50 dark:border-zinc-700 bg-gray-50/10 rounded-lg" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Relationship</label>
                                    <input type="text" name="secondary_parent_relationship" value={formData.secondary_parent_relationship} onChange={handleChange} className="w-full px-4 py-2 border border-gray-50 dark:border-zinc-700 bg-gray-50/10 rounded-lg" placeholder="e.g. Uncle" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone Number</label>
                                    <input type="tel" name="secondary_parent_phone" value={formData.secondary_parent_phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-50 dark:border-zinc-700 bg-gray-50/10 rounded-lg" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end space-x-4 bg-zinc-900 p-6 rounded-2xl shadow-xl">
                    <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 font-bold text-gray-400 hover:text-white transition-colors">Cancel</button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-10 py-3 bg-primary text-white font-black uppercase tracking-widest rounded-xl shadow-lg transition-all transform hover:scale-105 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? 'Registering Student...' : 'Finalize Admission'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StudentAdmit;
