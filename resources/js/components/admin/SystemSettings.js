import React, { useState, useEffect } from 'react';

const KENYA_COUNTIES = [
    'Baringo','Bomet','Bungoma','Busia','Elgeyo Marakwet','Embu','Garissa','Homa Bay',
    'Isiolo','Kajiado','Kakamega','Kericho','Kiambu','Kilifi','Kirinyaga','Kisii',
    'Kisumu','Kitui','Kwale','Laikipia','Lamu','Machakos','Makueni','Mandera',
    'Marsabit','Meru','Migori','Mombasa','Murang\'a','Nairobi','Nakuru','Nandi',
    'Narok','Nyamira','Nyandarua','Nyeri','Samburu','Siaya','Taita Taveta','Tana River',
    'Tharaka Nithi','Trans Nzoia','Turkana','Uasin Gishu','Vihiga','Wajir','West Pokot',
];

const CURRICULUM_TYPES = ['CBC', 'IGCSE', '8-4-4 (Legacy)', 'KCSE'];
const SCHOOL_TYPES     = ['Pre-Primary', 'Primary (CBC)', 'Junior School (Grade 7-9)', 'Senior School (Grade 10-12)', 'Secondary (8-4-4)', 'Hybrid'];
const GRADING_SCALES   = ['Kenya CBC (A-E)', 'Kenya KCSE (A-E Points)', 'Percentage (0-100)', 'GPA (0-4.0)'];

const Section = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                {icon}
            </div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100">{title}</h3>
        </div>
        <div className="p-6">{children}</div>
    </div>
);

const Field = ({ label, hint, children }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}
        {children}
    </div>
);

const inputCls = "w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all";
const selectCls = "w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40";

const Toggle = ({ checked, onChange, label }) => (
    <label className="flex items-center gap-3 cursor-pointer">
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
            <div className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'}`}></div>
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`}></div>
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
    </label>
);

const COLORS = [
    { name: 'Purple', value: '#9333ea' }, { name: 'Blue',   value: '#2563eb' },
    { name: 'Green',  value: '#16a34a' }, { name: 'Red',    value: '#dc2626' },
    { name: 'Indigo', value: '#4f46e5' }, { name: 'Pink',   value: '#db2777' },
    { name: 'Teal',   value: '#0d9488' }, { name: 'Orange', value: '#ea580c' },
];

const SystemSettings = ({ primaryColor, setPrimaryColor, themeStyle, setThemeStyle, schoolLogo, setSchoolLogo, schoolName, setSchoolName }) => {
    const [s, setS] = useState({
        // General
        school_name: schoolName || '', principal_name: '', contact_email: '',
        contact_phone: '', address: '', motto: '', county: '', sub_county: '',
        // Kenya
        nemis_school_code: '', school_type: 'Primary (CBC)', curriculum_type: 'CBC', kra_pin: '',
        // Academic
        academic_year: '2025 - 2026', current_term: '1', grading_scale: 'Kenya CBC (A-E)',
        passing_mark: '50', max_class_size: '40',
        // Finance
        late_fee_percentage: '5', installment_limit: '3', currency: 'KES',
        // Notifications
        sms_notifications: false, email_notifications: true, parent_portal_enabled: true,
    });
    const [isSaving, setIsSaving]   = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await window.axios.get('/api/admin/settings');
                const d = res.data;
                setS(prev => ({
                    ...prev,
                    school_name:        d.school_name        || schoolName || '',
                    principal_name:     d.principal_name     || '',
                    contact_email:      d.contact_email      || '',
                    contact_phone:      d.contact_phone      || '',
                    address:            d.address            || '',
                    motto:              d.motto              || '',
                    county:             d.county             || '',
                    sub_county:         d.sub_county         || '',
                    nemis_school_code:  d.nemis_school_code  || '',
                    school_type:        d.school_type        || 'Primary (CBC)',
                    curriculum_type:    d.curriculum_type    || 'CBC',
                    kra_pin:            d.kra_pin            || '',
                    academic_year:      d.academic_year      || '2025 - 2026',
                    current_term:       d.current_term       || '1',
                    grading_scale:      d.grading_scale      || 'Kenya CBC (A-E)',
                    passing_mark:       d.passing_mark       || '50',
                    max_class_size:     d.max_class_size     || '40',
                    late_fee_percentage:d.late_fee_percentage|| '5',
                    installment_limit:  d.installment_limit  || '3',
                    currency:           d.currency           || 'KES',
                    sms_notifications:  d.sms_notifications  === 'true',
                    email_notifications:d.email_notifications !== 'false',
                    parent_portal_enabled: d.parent_portal_enabled !== 'false',
                }));
                if (d.primary_color && setPrimaryColor) setPrimaryColor(d.primary_color);
                if (d.theme_style && setThemeStyle)     setThemeStyle(d.theme_style);
            } catch (err) {
                if (err.response?.status === 403) setIsPlatformAdmin(true);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await window.axios.post('/api/admin/settings', {
                ...s,
                sms_notifications:     String(s.sms_notifications),
                email_notifications:   String(s.email_notifications),
                parent_portal_enabled: String(s.parent_portal_enabled),
                primary_color: primaryColor,
                theme_style:   themeStyle,
            });
            if (setSchoolName && s.school_name) setSchoolName(s.school_name);
            window.showToast?.('success', 'Settings saved successfully.');
        } catch {
            window.showToast?.('error', 'Failed to save settings.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => { if (setSchoolLogo) setSchoolLogo(reader.result); };
        reader.readAsDataURL(file);
    };

    const set = (key) => (val) => setS(prev => ({ ...prev, [key]: val }));
    const setV = (key) => (e) => setS(prev => ({ ...prev, [key]: e.target.value }));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
            </div>
        );
    }

    if (isPlatformAdmin) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-8 text-center">
                    <svg className="w-12 h-12 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200 mb-2">Platform Admin — No School Settings</h3>
                    <p className="text-sm text-yellow-600 dark:text-yellow-300">
                        School settings are per-school. Log in as a school admin to configure settings for a specific school.
                        Platform-wide settings are managed in the <strong>Platform Admin Dashboard</strong>.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">School Settings</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Settings apply only to this school — other schools are not affected.</p>
            </div>

            {/* ── General Information ── */}
            <Section title="General Information" icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
            }>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="School Name">
                        <input type="text" value={s.school_name} onChange={setV('school_name')} className={inputCls} placeholder="e.g. Kasee Academy" />
                    </Field>
                    <Field label="Principal's Name">
                        <input type="text" value={s.principal_name} onChange={setV('principal_name')} className={inputCls} placeholder="Full name" />
                    </Field>
                    <Field label="Contact Email">
                        <input type="email" value={s.contact_email} onChange={setV('contact_email')} className={inputCls} placeholder="school@example.ac.ke" />
                    </Field>
                    <Field label="Phone Number">
                        <input type="tel" value={s.contact_phone} onChange={setV('contact_phone')} className={inputCls} placeholder="07XXXXXXXX" />
                    </Field>
                    <Field label="County">
                        <select value={s.county} onChange={setV('county')} className={selectCls}>
                            <option value="">Select county...</option>
                            {KENYA_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </Field>
                    <Field label="Sub-County">
                        <input type="text" value={s.sub_county} onChange={setV('sub_county')} className={inputCls} placeholder="e.g. Westlands" />
                    </Field>
                    <Field label="Physical Address" hint="Street, town or estate">
                        <input type="text" value={s.address} onChange={setV('address')} className={inputCls} placeholder="P.O. Box or street address" />
                    </Field>
                    <Field label="School Motto">
                        <input type="text" value={s.motto} onChange={setV('motto')} className={inputCls} placeholder="e.g. Excellence Through Knowledge" />
                    </Field>
                </div>
            </Section>

            {/* ── Kenya Compliance ── */}
            <Section title="Kenya Education Compliance" icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
            }>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="NEMIS School Code" hint="National Education Management Information System">
                        <input type="text" value={s.nemis_school_code} onChange={setV('nemis_school_code')} className={inputCls} placeholder="e.g. 123456789" />
                    </Field>
                    <Field label="KRA PIN" hint="For fee receipts and tax compliance">
                        <input type="text" value={s.kra_pin} onChange={setV('kra_pin')} className={inputCls} placeholder="Axxxxxxxxx" />
                    </Field>
                    <Field label="School Type">
                        <select value={s.school_type} onChange={setV('school_type')} className={selectCls}>
                            {SCHOOL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </Field>
                    <Field label="Curriculum">
                        <select value={s.curriculum_type} onChange={setV('curriculum_type')} className={selectCls}>
                            {CURRICULUM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </Field>
                </div>
            </Section>

            {/* ── Academic ── */}
            <Section title="Academic Settings" icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
            }>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Field label="Academic Year">
                        <input type="text" value={s.academic_year} onChange={setV('academic_year')} className={inputCls} placeholder="2025 - 2026" />
                    </Field>
                    <Field label="Current Term">
                        <select value={s.current_term} onChange={setV('current_term')} className={selectCls}>
                            <option value="1">Term 1</option>
                            <option value="2">Term 2</option>
                            <option value="3">Term 3</option>
                        </select>
                    </Field>
                    <Field label="Grading Scale">
                        <select value={s.grading_scale} onChange={setV('grading_scale')} className={selectCls}>
                            {GRADING_SCALES.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </Field>
                    <Field label="Passing Mark (%)" hint="Minimum score to pass">
                        <input type="number" min="0" max="100" value={s.passing_mark} onChange={setV('passing_mark')} className={inputCls} />
                    </Field>
                    <Field label="Max Class Size" hint="Students per class">
                        <input type="number" min="1" max="100" value={s.max_class_size} onChange={setV('max_class_size')} className={inputCls} />
                    </Field>
                </div>
            </Section>

            {/* ── Finance ── */}
            <Section title="Finance Settings" icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            }>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Field label="Currency">
                        <select value={s.currency} onChange={setV('currency')} className={selectCls}>
                            <option value="KES">KES — Kenyan Shilling</option>
                            <option value="USD">USD — US Dollar</option>
                            <option value="GBP">GBP — British Pound</option>
                        </select>
                    </Field>
                    <Field label="Late Fee (%)" hint="Penalty on overdue balances">
                        <input type="number" min="0" max="50" value={s.late_fee_percentage} onChange={setV('late_fee_percentage')} className={inputCls} />
                    </Field>
                    <Field label="Max Installments" hint="Fee payment splits allowed">
                        <input type="number" min="1" max="12" value={s.installment_limit} onChange={setV('installment_limit')} className={inputCls} />
                    </Field>
                </div>
            </Section>

            {/* ── Notifications ── */}
            <Section title="Notifications & Portals" icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
            }>
                <div className="space-y-4">
                    <Toggle checked={s.sms_notifications}     onChange={set('sms_notifications')}     label="SMS notifications to parents (requires SMS credits)" />
                    <Toggle checked={s.email_notifications}   onChange={set('email_notifications')}   label="Email notifications to parents and staff" />
                    <Toggle checked={s.parent_portal_enabled} onChange={set('parent_portal_enabled')} label="Enable parent portal (parents can log in to view reports & fees)" />
                </div>
            </Section>

            {/* ── Appearance ── */}
            <Section title="Appearance" icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
                </svg>
            }>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Primary Colour</p>
                        <div className="flex flex-wrap gap-3">
                            {COLORS.map(c => (
                                <button key={c.value} type="button" onClick={() => setPrimaryColor?.(c.value)}
                                    title={c.name}
                                    className={`w-9 h-9 rounded-full transition-transform hover:scale-110 ${primaryColor === c.value ? 'ring-4 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800' : ''}`}
                                    style={{ backgroundColor: c.value }} />
                            ))}
                        </div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-6 mb-3">Dark Mode Style</p>
                        <div className="flex gap-3">
                            {['normal', 'accented'].map(style => (
                                <button key={style} type="button" onClick={() => setThemeStyle?.(style)}
                                    className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${themeStyle === style ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-200 dark:border-gray-600 hover:border-primary/50'}`}>
                                    <p className="font-bold text-sm text-gray-800 dark:text-gray-100 capitalize">{style}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{style === 'normal' ? 'Plain gray borders' : 'Coloured borders'}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">School Logo</p>
                        <div className="flex items-start gap-4">
                            {schoolLogo && (
                                <img src={schoolLogo} className="w-16 h-16 rounded-xl object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0" alt="Logo" />
                            )}
                            <label className="flex-1 cursor-pointer">
                                <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-5 text-center hover:border-primary hover:bg-primary/5 transition-all dark:hover:bg-primary/10">
                                    <svg className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                    </svg>
                                    <p className="text-xs text-gray-400">Click to upload PNG or JPG</p>
                                    <p className="text-xs text-gray-300 dark:text-gray-500 mt-1">Max 2MB · Recommended 200×200px</p>
                                    <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Save */}
            <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-gray-400 dark:text-gray-500">Changes apply only to this school and do not affect other schools on the platform.</p>
                <button onClick={handleSave} disabled={isSaving}
                    className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 flex items-center gap-2">
                    {isSaving ? (
                        <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                            Saving...
                        </>
                    ) : 'Save Settings'}
                </button>
            </div>
        </div>
    );
};

export default SystemSettings;
