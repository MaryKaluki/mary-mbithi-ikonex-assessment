import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const KENYA_COUNTIES = [
    'Baringo','Bomet','Bungoma','Busia','Elgeyo Marakwet','Embu','Garissa','Homa Bay',
    'Isiolo','Kajiado','Kakamega','Kericho','Kiambu','Kilifi','Kirinyaga','Kisii',
    'Kisumu','Kitui','Kwale','Laikipia','Lamu','Machakos','Makueni','Mandera',
    'Marsabit','Meru','Migori','Mombasa',"Murang'a",'Nairobi','Nakuru','Nandi',
    'Narok','Nyamira','Nyandarua','Nyeri','Samburu','Siaya','Taita Taveta','Tana River',
    'Tharaka Nithi','Trans Nzoia','Turkana','Uasin Gishu','Vihiga','Wajir','West Pokot',
];

const CURRICULUM_TYPES = ['CBC', 'IGCSE', '8-4-4 (Legacy)', 'KCSE'];
const SCHOOL_TYPES     = ['Pre-Primary', 'Primary (CBC)', 'Junior School (Grade 7-9)', 'Senior School (Grade 10-12)', 'Secondary (8-4-4)', 'Hybrid'];
const GRADING_SCALES   = ['Kenya CBC (A-E)', 'Kenya KCSE (A-E Points)', 'Percentage (0-100)', 'GPA (0-4.0)'];

const COLORS = [
    { name: 'Purple', value: '#9333ea' }, { name: 'Blue',   value: '#2563eb' },
    { name: 'Green',  value: '#16a34a' }, { name: 'Red',    value: '#dc2626' },
    { name: 'Indigo', value: '#4f46e5' }, { name: 'Pink',   value: '#db2777' },
    { name: 'Teal',   value: '#0d9488' }, { name: 'Orange', value: '#ea580c' },
];

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const Section = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 rounded-t-lg">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{title}</p>
        </div>
        <div className="p-5">{children}</div>
    </div>
);

const Field = ({ label, hint, children }) => (
    <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 mb-1">{label}</label>
        {hint && <p className="text-[10px] text-slate-400 mb-1">{hint}</p>}
        {children}
    </div>
);

const Toggle = ({ checked, onChange, label }) => (
    <label className="flex items-center gap-3 cursor-pointer">
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)}/>
            <div className={`w-10 h-5 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-slate-200 dark:bg-gray-600'}`}/>
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`}/>
        </div>
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
    </label>
);

const SystemSettings = ({ primaryColor, setPrimaryColor, themeStyle, setThemeStyle, schoolLogo, setSchoolLogo, schoolName, setSchoolName }) => {
    const [s, setS] = useState({
        school_name: schoolName || '', principal_name: '', contact_email: '',
        contact_phone: '', address: '', motto: '', county: '', sub_county: '',
        nemis_school_code: '', school_type: 'Primary (CBC)', curriculum_type: 'CBC', kra_pin: '',
        academic_year: '2025 - 2026', current_term: '1', grading_scale: 'Kenya CBC (A-E)',
        passing_mark: '50', max_class_size: '40',
        late_fee_percentage: '5', installment_limit: '3', currency: 'KES',
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
                    school_name:         d.school_name         || schoolName || '',
                    principal_name:      d.principal_name      || '',
                    contact_email:       d.contact_email       || '',
                    contact_phone:       d.contact_phone       || '',
                    address:             d.address             || '',
                    motto:               d.motto               || '',
                    county:              d.county              || '',
                    sub_county:          d.sub_county          || '',
                    nemis_school_code:   d.nemis_school_code   || '',
                    school_type:         d.school_type         || 'Primary (CBC)',
                    curriculum_type:     d.curriculum_type     || 'CBC',
                    kra_pin:             d.kra_pin             || '',
                    academic_year:       d.academic_year       || '2025 - 2026',
                    current_term:        d.current_term        || '1',
                    grading_scale:       d.grading_scale       || 'Kenya CBC (A-E)',
                    passing_mark:        d.passing_mark        || '50',
                    max_class_size:      d.max_class_size      || '40',
                    late_fee_percentage: d.late_fee_percentage || '5',
                    installment_limit:   d.installment_limit   || '3',
                    currency:            d.currency            || 'KES',
                    sms_notifications:      d.sms_notifications      === 'true',
                    email_notifications:    d.email_notifications    !== 'false',
                    parent_portal_enabled:  d.parent_portal_enabled  !== 'false',
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

    if (isLoading) return (
        <div className="p-6"><SkeletonLoader type="table"/></div>
    );

    if (isPlatformAdmin) return (
        <div className="flex flex-col space-y-3 h-full pb-6">
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Admin <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">System Settings</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">School Settings</h1>
                </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">Platform Admin — No School Settings</p>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                    School settings are per-school. Log in as a school admin to configure settings for a specific school.
                </p>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col space-y-3 pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Admin <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">System Settings</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">School Settings</h1>
                </div>
                <button onClick={handleSave} disabled={isSaving}
                    className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">
                    {isSaving ? 'Saving…' : 'Save Settings'}
                </button>
            </div>

            <p className="text-[10px] text-slate-400 uppercase tracking-wider flex-shrink-0">
                Settings apply only to this school — other schools are not affected.
            </p>

            {/* General */}
            <Section title="General Information">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                        <Field label="School Name">
                            <input type="text" value={s.school_name} onChange={setV('school_name')}
                                placeholder="e.g. Kasee Academy" className={inputCls}/>
                        </Field>
                    </div>
                    <div>
                        <Field label="Principal's Name">
                            <input type="text" value={s.principal_name} onChange={setV('principal_name')}
                                placeholder="Full name" className={inputCls}/>
                        </Field>
                    </div>
                    <div>
                        <Field label="Contact Email">
                            <input type="email" value={s.contact_email} onChange={setV('contact_email')}
                                placeholder="school@example.ac.ke" className={inputCls}/>
                        </Field>
                    </div>
                    <div>
                        <Field label="Phone Number">
                            <input type="tel" value={s.contact_phone} onChange={setV('contact_phone')}
                                placeholder="07XXXXXXXX" className={inputCls}/>
                        </Field>
                    </div>
                    <div>
                        <Field label="County">
                            <select value={s.county} onChange={setV('county')} className={inputCls}>
                                <option value="">Select county…</option>
                                {KENYA_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </Field>
                    </div>
                    <div>
                        <Field label="Sub-County">
                            <input type="text" value={s.sub_county} onChange={setV('sub_county')}
                                placeholder="e.g. Westlands" className={inputCls}/>
                        </Field>
                    </div>
                    <div>
                        <Field label="Physical Address">
                            <input type="text" value={s.address} onChange={setV('address')}
                                placeholder="P.O. Box or street address" className={inputCls}/>
                        </Field>
                    </div>
                    <div>
                        <Field label="School Motto">
                            <input type="text" value={s.motto} onChange={setV('motto')}
                                placeholder="e.g. Excellence Through Knowledge" className={inputCls}/>
                        </Field>
                    </div>
                </div>
            </Section>

            {/* Kenya Compliance */}
            <Section title="Kenya Education Compliance">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Field label="NEMIS School Code" hint="National Education Management Information System">
                            <input type="text" value={s.nemis_school_code} onChange={setV('nemis_school_code')}
                                placeholder="e.g. 123456789" className={inputCls}/>
                        </Field>
                    </div>
                    <div>
                        <Field label="KRA PIN" hint="For fee receipts and tax compliance">
                            <input type="text" value={s.kra_pin} onChange={setV('kra_pin')}
                                placeholder="Axxxxxxxxx" className={inputCls}/>
                        </Field>
                    </div>
                    <div>
                        <Field label="School Type">
                            <select value={s.school_type} onChange={setV('school_type')} className={inputCls}>
                                {SCHOOL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </Field>
                    </div>
                    <div>
                        <Field label="Curriculum">
                            <select value={s.curriculum_type} onChange={setV('curriculum_type')} className={inputCls}>
                                {CURRICULUM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </Field>
                    </div>
                </div>
            </Section>

            {/* Academic */}
            <Section title="Academic Settings">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                        <Field label="Academic Year">
                            <input type="text" value={s.academic_year} onChange={setV('academic_year')}
                                placeholder="2025 - 2026" className={inputCls}/>
                        </Field>
                    </div>
                    <div>
                        <Field label="Current Term">
                            <select value={s.current_term} onChange={setV('current_term')} className={inputCls}>
                                <option value="1">Term 1</option>
                                <option value="2">Term 2</option>
                                <option value="3">Term 3</option>
                            </select>
                        </Field>
                    </div>
                    <div>
                        <Field label="Grading Scale">
                            <select value={s.grading_scale} onChange={setV('grading_scale')} className={inputCls}>
                                {GRADING_SCALES.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </Field>
                    </div>
                    <div>
                        <Field label="Passing Mark (%)" hint="Minimum score to pass">
                            <input type="number" min="0" max="100" value={s.passing_mark}
                                onChange={setV('passing_mark')} className={inputCls}/>
                        </Field>
                    </div>
                    <div>
                        <Field label="Max Class Size" hint="Students per class">
                            <input type="number" min="1" max="100" value={s.max_class_size}
                                onChange={setV('max_class_size')} className={inputCls}/>
                        </Field>
                    </div>
                </div>
            </Section>

            {/* Finance */}
            <Section title="Finance Settings">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                        <Field label="Currency">
                            <select value={s.currency} onChange={setV('currency')} className={inputCls}>
                                <option value="KES">KES — Kenyan Shilling</option>
                                <option value="USD">USD — US Dollar</option>
                                <option value="GBP">GBP — British Pound</option>
                            </select>
                        </Field>
                    </div>
                    <div>
                        <Field label="Late Fee (%)" hint="Penalty on overdue balances">
                            <input type="number" min="0" max="50" value={s.late_fee_percentage}
                                onChange={setV('late_fee_percentage')} className={inputCls}/>
                        </Field>
                    </div>
                    <div>
                        <Field label="Max Installments" hint="Fee payment splits allowed">
                            <input type="number" min="1" max="12" value={s.installment_limit}
                                onChange={setV('installment_limit')} className={inputCls}/>
                        </Field>
                    </div>
                </div>
            </Section>

            {/* Notifications */}
            <Section title="Notifications & Portals">
                <div className="space-y-3">
                    <Toggle checked={s.sms_notifications}     onChange={set('sms_notifications')}     label="SMS notifications to parents (requires SMS credits)"/>
                    <Toggle checked={s.email_notifications}   onChange={set('email_notifications')}   label="Email notifications to parents and staff"/>
                    <Toggle checked={s.parent_portal_enabled} onChange={set('parent_portal_enabled')} label="Enable parent portal (parents can log in to view reports & fees)"/>
                </div>
            </Section>

            {/* Appearance */}
            <Section title="Appearance">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Primary Colour</p>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map(c => (
                                <button key={c.value} type="button" onClick={() => setPrimaryColor?.(c.value)}
                                    title={c.name}
                                    className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${primaryColor === c.value ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-gray-800' : ''}`}
                                    style={{ backgroundColor: c.value }}/>
                            ))}
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-5 mb-2">Dark Mode Style</p>
                        <div className="flex gap-2">
                            {['normal', 'accented'].map(style => (
                                <button key={style} type="button" onClick={() => setThemeStyle?.(style)}
                                    className={`flex-1 px-4 py-2.5 rounded-md border-2 transition-all ${
                                        themeStyle === style
                                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                            : 'border-slate-200 dark:border-gray-600 hover:border-primary/50'
                                    }`}>
                                    <p className="font-bold text-xs text-slate-800 dark:text-slate-100 capitalize">{style}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{style === 'normal' ? 'Plain gray borders' : 'Coloured borders'}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">School Logo</p>
                        <div className="flex items-start gap-3">
                            {schoolLogo && (
                                <img src={schoolLogo} className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-gray-700 flex-shrink-0" alt="Logo"/>
                            )}
                            <label className="flex-1 cursor-pointer">
                                <div className="border-2 border-dashed border-slate-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-primary hover:bg-primary/5 transition-all">
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Click to upload PNG or JPG</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Max 2MB · Recommended 200×200px</p>
                                    <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*"/>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </Section>

            <div className="flex items-center justify-between pt-1">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Changes apply only to this school.</p>
                <button onClick={handleSave} disabled={isSaving}
                    className="px-6 py-2 bg-primary text-white font-bold text-sm rounded-md hover:bg-primary/90 disabled:opacity-60 transition-all duration-200">
                    {isSaving ? 'Saving…' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
};

export default SystemSettings;
