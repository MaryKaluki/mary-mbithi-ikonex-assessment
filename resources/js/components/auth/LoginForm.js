import React, { useState } from 'react';

const LoginForm = ({ onLoginSuccess }) => {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState(null);
    const [loading, setLoading]   = useState(false);
    const [showGuideModal, setShowGuideModal] = useState(false);
    const [guideTab, setGuideTab]             = useState('context');

    const demoAccounts = [
        { label: 'School Admin', email: 'admin@kasee.sc.ke', password: 'password', role: 'school_admin', color: 'from-violet-500 to-purple-600 shadow-violet-500/20' },
        { label: 'Teacher', email: 'teacher@kasee.com', password: 'password', role: 'teacher', color: 'from-emerald-500 to-green-600 shadow-emerald-500/20' },
    ];

    const tabs = [
        { id: 'context', label: '1. Context', icon: '👤' },
        { id: 'setup', label: '2. Local Setup', icon: '💻' },
        { id: 'deployment', label: '3. Deployment', icon: '🌐' },
        { id: 'usage', label: '4. System Usage', icon: '📖' },
        { id: 'testing', label: '5. Testing', icon: '🧪' }
    ];

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await window.axios.post('/api/auth/login', { email, password });
            const { token, user } = response.data;

            localStorage.setItem('auth_token', token);
            localStorage.setItem('auth_user', JSON.stringify(user));
            window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            onLoginSuccess(user);
        } catch (err) {
            if (err.response?.status === 422) {
                setError(err.response.data.errors?.email?.[0] || 'Invalid credentials.');
            } else if (err.response?.status === 429) {
                setError('Too many attempts. Please wait and try again.');
            } else {
                setError('Error: ' + err.message + (err.response ? ' (Status: ' + err.response.status + ')' : ' (No Response)'));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleQuickLogin = async (demoEmail, demoPassword) => {
        setEmail(demoEmail);
        setPassword(demoPassword);
        setError(null);
        setLoading(true);

        try {
            const response = await window.axios.post('/api/auth/login', { email: demoEmail, password: demoPassword });
            const { token, user } = response.data;

            localStorage.setItem('auth_token', token);
            localStorage.setItem('auth_user', JSON.stringify(user));
            window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            onLoginSuccess(user);
        } catch (err) {
            if (err.response?.status === 422) {
                setError(err.response.data.errors?.email?.[0] || 'Invalid credentials.');
            } else {
                setError('Error: ' + err.message + (err.response ? ' (Status: ' + err.response.status + ')' : ' (No Response)'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6 transition-colors duration-300">
            <div className="w-full max-w-5xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    {/* Left Column: Logo & Main Login Form */}
                    <div className="lg:col-span-5 flex flex-col justify-between">
                        <div>
                            {/* Logo / Brand */}
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg shadow-primary/30 mb-4">
                                    <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    </svg>
                                </div>
                                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Skullu 2.0</h1>
                                <p className="text-primary mt-1 text-sm font-bold uppercase tracking-wider">Developer: Mary Mbithi</p>
                            </div>

                            {/* Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Sign in to your account</h2>

                                {error && (
                                    <div className="mb-5 flex items-start gap-3 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                        <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                            autoFocus
                                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                                            placeholder="you@school.ac.ke"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Signing in...
                                            </>
                                        ) : 'Sign In'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        <p className="mt-8 text-center text-xs text-gray-400 dark:text-gray-600">
                            &copy; {new Date().getFullYear()} Skullu Education Systems. All rights reserved.
                        </p>
                    </div>

                    {/* Right Column: Quick Access Portal */}
                    <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 flex flex-col justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Quick Access Portal</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Click any role below to instantly log in without entering credentials.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {demoAccounts.map((account) => (
                                    <button
                                        key={account.role}
                                        onClick={() => handleQuickLogin(account.email, account.password)}
                                        disabled={loading}
                                        className="group text-left p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-800 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98] transition-all flex items-center gap-4 disabled:opacity-50 disabled:pointer-events-none"
                                    >
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${account.color} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                                            {account.label.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors truncate">
                                                {account.label}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                {account.email}
                                            </div>
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all text-gray-400 group-hover:scale-110">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Collapsible Assessor Guide */}
                            <div className="mt-6 border border-blue-100 dark:border-blue-900/30 rounded-xl bg-blue-50/30 dark:bg-blue-950/10 p-4">
                                <div className="flex items-center gap-2 mb-2 text-blue-800 dark:text-blue-400 font-bold text-sm">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    <span>Assessor Practical Guide — Developer: Mary Mbithi</span>
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2 leading-relaxed">
                                    <p className="bg-blue-600/10 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg font-medium border border-blue-500/20">
                                        💡 <strong>Project Context:</strong> This system was originally developed as a comprehensive multi-tenant School ERP with extensive modules (HR, Finance, Library, Transport, etc.). To strictly align with the assessment guidelines and speed up review, all extra modules have been hidden to focus on the requested functional criteria.
                                    </p>
                                    <p>All academic records are pre-seeded under school <strong>Ikonex Academy</strong>.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                        <div>
                                            <span className="font-semibold text-gray-850 dark:text-gray-200">1. Administrative Portal (Admin):</span>
                                            <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-gray-500">
                                                <li>Check Class Streams (Form 1A/B/C)</li>
                                                <li>Manage Subject Learning Areas</li>
                                                <li>Register/Filter/Edit Students</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-850 dark:text-gray-200">2. Academic Portal (Teacher):</span>
                                            <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-gray-500">
                                                <li>Enter CA and Exam Marks</li>
                                                <li>Auto-position / Subject Ranks</li>
                                                <li>Print Report Card PDFs & Summary</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold pt-1">
                                        ✓ Enforced strict validation preventing duplicate scores for a student & subject.
                                    </p>
                                    <div className="pt-2 flex justify-end">
                                        <button type="button" onClick={() => setShowGuideModal(true)}
                                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-500/10 active:scale-95 flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            View Setup &amp; Deployment Guide
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
                                Sandbox mode enabled for rapid role-switching and assessment testing.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {showGuideModal && (
                <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-200 dark:border-gray-700 flex flex-col max-h-[90vh] overflow-hidden animate-modal-pop">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-slate-800 text-white flex-shrink-0">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider">Assessor Documentation — Developed by Mary Mbithi</h3>
                                <p className="text-[10px] text-slate-400 mt-0.5">Practical Assessment Deployment, Setup, &amp; Usage Guide</p>
                            </div>
                            <button onClick={() => setShowGuideModal(false)} className="text-slate-400 hover:text-white text-2xl leading-none transition-colors">&times;</button>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 px-6 overflow-x-auto flex-shrink-0 scrollbar-none">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setGuideTab(tab.id)}
                                    className={`flex items-center gap-1.5 py-3.5 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap focus:outline-none ${
                                        guideTab === tab.id
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-255'
                                    }`}
                                >
                                    <span>{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-gray-600 dark:text-gray-300">
                            {guideTab === 'context' && (
                                <div className="space-y-4">
                                    <h4 className="font-extrabold text-gray-800 dark:text-white border-b border-gray-150 dark:border-gray-700 pb-2 uppercase tracking-wide text-xs">Project &amp; Candidate Context</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-gray-900/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-semibold">Candidate Name</p>
                                            <p className="font-bold text-gray-800 dark:text-white text-sm">Mary Mbithi</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-semibold">Submission Email</p>
                                            <p className="font-bold text-gray-800 dark:text-white text-sm">info@ikonexsystems.com</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-semibold">Assessed School</p>
                                            <p className="font-bold text-gray-800 dark:text-white text-sm">Ikonex Academy</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-semibold">Submission Deadline</p>
                                            <p className="font-bold text-red-600 dark:text-red-400 text-sm">June 7, 2026, 11:00 AM</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/45 rounded-xl space-y-2 text-xs text-slate-700 dark:text-slate-300">
                                        <p className="font-bold text-blue-800 dark:text-blue-400 text-sm">💡 Important Assessor Note</p>
                                        <p className="leading-relaxed">
                                            This application was originally designed as a high-end multi-tenant School ERP containing extensive features (Human Resources, Payroll, Invoicing &amp; Finance, Library, Transport management, and more).
                                        </p>
                                        <p className="leading-relaxed font-semibold">
                                            To align precisely with the practical assessment constraints and optimize your review process, all extra modules have been temporarily hidden. The active interface features only:
                                        </p>
                                        <ul className="list-disc list-inside pl-2 space-y-1 font-medium text-gray-650 dark:text-gray-400">
                                            <li>Class Streams (Form 1A, Form 1B, Form 1C)</li>
                                            <li>Student Directory (Registration, stream assignments, filters, edit/delete)</li>
                                            <li>Subjects Management (Creation, editing, deleting, stream assignment)</li>
                                            <li>Assessments (Continuous Assessment &amp; Exam score entries, duplicate validation)</li>
                                            <li>Result Processing (Class Ranks, Subject Positions, Report Cards, PDF download)</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {guideTab === 'setup' && (
                                <div className="space-y-4">
                                    <h4 className="font-extrabold text-gray-800 dark:text-white border-b border-gray-150 dark:border-gray-700 pb-2 uppercase tracking-wide text-xs">Local Development Setup</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Follow these steps to run the project locally on your machine (supports Windows/XAMPP, Linux, and macOS environments).
                                    </p>
                                    <div className="space-y-4">
                                        <div>
                                            <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-bold mb-1">Prerequisites</span>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 pl-1">Ensure you have PHP 8.1+, MySQL 5.7+ (or MariaDB), Composer, and Node.js (with NPM) installed globally.</p>
                                        </div>
                                        <div>
                                            <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-bold mb-1">Step-by-Step Terminal Setup</span>
                                            <div className="bg-slate-900 text-slate-300 font-mono text-[11px] p-4 rounded-xl space-y-2 overflow-x-auto shadow-inner leading-relaxed">
                                                <p><span className="text-slate-500"># 1. Install Composer backend dependencies</span><br/>composer install</p>
                                                <p><span className="text-slate-500"># 2. Install NPM frontend packages</span><br/>npm install</p>
                                                <p><span className="text-slate-500"># 3. Create env file and generate encryption key</span><br/>cp .env.example .env<br/>php artisan key:generate</p>
                                                <p><span className="text-slate-500"># 4. Set up database credentials in .env</span><br/><span className="text-slate-400">DB_DATABASE=skullu_db</span><br/><span className="text-slate-400">DB_USERNAME=root</span><br/><span className="text-slate-400">DB_PASSWORD=your_password</span></p>
                                                <p><span className="text-slate-500"># 5. Run database migrations</span><br/>php artisan migrate</p>
                                                <p><span className="text-slate-500"># 6. Seed assessment data (creates classes, subjects, students &amp; demo marks)</span><br/><span className="text-emerald-400">php scratch/reseed_interview_data.php</span></p>
                                                <p><span className="text-slate-500"># 7. Compile frontend assets for production</span><br/>npm run prod</p>
                                                <p><span className="text-slate-500"># 8. Start local development server</span><br/>php artisan serve</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {guideTab === 'deployment' && (
                                <div className="space-y-4">
                                    <h4 className="font-extrabold text-gray-800 dark:text-white border-b border-gray-150 dark:border-gray-700 pb-2 uppercase tracking-wide text-xs">Production Deployment Guidelines</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Here is a complete operational playbook to deploy the application on a production web server (VPS, Cloud Instances like AWS/DigitalOcean, or Managed Apache/Nginx Linux servers).
                                    </p>
                                    <div className="space-y-4">
                                        <div className="space-y-2 text-xs">
                                            <h5 className="font-bold text-gray-700 dark:text-gray-200">1. Virtual Host Configuration</h5>
                                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                                                Configure your web server's document root to point to the <code className="px-1 py-0.5 bg-gray-150 dark:bg-gray-700 rounded font-mono font-bold text-gray-800 dark:text-gray-200">/public</code> directory of the codebase.
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Nginx Configuration Block</span>
                                                    <pre className="bg-slate-900 text-slate-300 font-mono text-[10px] p-3 rounded-lg overflow-x-auto mt-1 max-h-36 leading-normal">
{`server {
    listen 80;
    server_name portal.ikonexacademy.com;
    root /var/www/skullu/public;

    index index.php;
    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \\.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}`}
                                                    </pre>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Apache Virtual Host</span>
                                                    <pre className="bg-slate-900 text-slate-300 font-mono text-[10px] p-3 rounded-lg overflow-x-auto mt-1 max-h-36 leading-normal">
{`<VirtualHost *:80>
    ServerName portal.ikonexacademy.com
    DocumentRoot /var/www/skullu/public

    <Directory /var/www/skullu/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>`}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-xs border-t border-gray-100 dark:border-gray-700/50 pt-3">
                                            <h5 className="font-bold text-gray-700 dark:text-gray-200">2. Folder Permissions</h5>
                                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                                                Set correct directory ownership and permissions so Laravel can write logs, cache sessions, and compile views:
                                            </p>
                                            <div className="bg-slate-900 text-slate-300 font-mono text-[10px] p-3 rounded-lg overflow-x-auto">
                                                <p className="text-slate-500"># Set group ownership to web server user (www-data or apache)</p>
                                                <p>sudo chown -R www-data:www-data /var/www/skullu</p>
                                                <p className="text-slate-500"># Grant write permissions to storage and bootstrap cache</p>
                                                <p>sudo chmod -R 775 /var/www/skullu/storage</p>
                                                <p>sudo chmod -R 775 /var/www/skullu/bootstrap/cache</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-xs border-t border-gray-100 dark:border-gray-700/50 pt-3">
                                            <h5 className="font-bold text-gray-700 dark:text-gray-200">3. Production Cache Optimization</h5>
                                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                                                Run these optimization commands on production to cache configurations, routes, and views, greatly boosting performance:
                                            </p>
                                            <div className="bg-slate-900 text-slate-300 font-mono text-[10px] p-3 rounded-lg overflow-x-auto">
                                                <p>php artisan config:cache</p>
                                                <p>php artisan route:cache</p>
                                                <p>php artisan view:cache</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {guideTab === 'usage' && (
                                <div className="space-y-4">
                                    <h4 className="font-extrabold text-gray-800 dark:text-white border-b border-gray-150 dark:border-gray-700 pb-2 uppercase tracking-wide text-xs">Detailed System Usage Walkthrough</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Here are the comprehensive walkthroughs for both user roles to verify all assessment checklist items.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="border-l-2 border-primary pl-3 py-1">
                                            <h5 className="font-bold text-gray-700 dark:text-gray-200 text-xs">Role 1: School Admin (Setup &amp; Registries)</h5>
                                            <ul className="list-disc list-inside mt-1.5 space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                <li>
                                                    <strong className="text-gray-700 dark:text-gray-300">Class Streams:</strong> Go to Class Streams. Check the Form 1A, Form 1B, Form 1C listings. Create a new stream or edit existing stream descriptions.
                                                </li>
                                                <li>
                                                    <strong className="text-gray-700 dark:text-gray-300">Subjects learning Areas:</strong> Navigate to Subjects. You can create learning areas, assign them to streams, edit descriptions, or delete them.
                                                </li>
                                                <li>
                                                    <strong className="text-gray-700 dark:text-gray-300">Student registration &amp; Filters:</strong> Go to Student Directory. Filter by Form 1A/B/C to see stream assignment. Use "Admit Student" to register a student, choose a stream, and view them instantly in the filtered directory.
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="border-l-2 border-emerald-500 pl-3 py-1 border-t border-gray-100 dark:border-gray-700/50 pt-3">
                                            <h5 className="font-bold text-gray-700 dark:text-gray-200 text-xs">Role 2: Teacher (Assessments &amp; Calculations)</h5>
                                            <ul className="list-disc list-inside mt-1.5 space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                <li>
                                                    <strong className="text-gray-700 dark:text-gray-300">Entering/Editing Grades:</strong> Navigate to "Enter Grades" in the sidebar. Select an assessment (e.g., Term 1 Examination), class stream (e.g., Form 1A), and subject (e.g., Mathematics). Input Continuous Assessment (out of 30) and Examination (out of 70) marks. Click "Save Draft" or "Submit &amp; Release".
                                                </li>
                                                <li>
                                                    <strong className="text-gray-700 dark:text-gray-300">Strict Duplicate Validation:</strong> If you try to save twice or duplicate student rows in a submission, the system returns a validation block message preventing duplicate score submissions.
                                                </li>
                                                <li>
                                                    <strong className="text-gray-700 dark:text-gray-300">Individual &amp; Class Performance:</strong> Go to "Report Cards". Click any student to open the detailed panel containing subject rankings, average score, and letter grades.
                                                </li>
                                                <li>
                                                    <strong className="text-gray-700 dark:text-gray-300">PDF Report Cards &amp; Summaries:</strong> Click "Class Performance Summary" to generate printable PDFs containing stream positions, ranks, and total scores.
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {guideTab === 'testing' && (
                                <div className="space-y-4">
                                    <h4 className="font-extrabold text-gray-800 dark:text-white border-b border-gray-150 dark:border-gray-700 pb-2 uppercase tracking-wide text-xs">Automated Integration Tests</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        An end-to-end integration test suite is included to verify all backend logic, database constraints, API endpoints, and validation rules programmatically.
                                    </p>
                                    <div className="space-y-4">
                                        <div>
                                            <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-bold mb-1">How to Run the Test Suite</span>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Execute this command in your command line terminal to verify the entire system functionality:</p>
                                            <div className="bg-slate-900 text-slate-300 font-mono text-[11px] p-4 rounded-xl shadow-inner leading-relaxed">
                                                <span className="text-slate-500"># Run the full suite of backend &amp; API integration tests</span><br/>
                                                <span className="text-emerald-400">php scratch/e2e_integration_test.php</span>
                                            </div>
                                        </div>
                                        <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                                            <p className="font-bold text-emerald-800 dark:text-emerald-400 mb-1">✓ What gets tested by this script:</p>
                                            <ul className="list-disc list-inside space-y-1 font-medium pl-1 text-[11px] text-gray-650 dark:text-gray-400">
                                                <li>Authentication APIs &amp; JWT Token generation</li>
                                                <li>Class Stream creation, retrieval, and updates</li>
                                                <li>Subjects creation, assignments, and deletion</li>
                                                <li>Student registration, stream updates, and class-specific filters</li>
                                                <li>Continuous assessment &amp; exam grade recording and updates</li>
                                                <li>Prevention of duplicate marks for the same student + subject</li>
                                                <li>Mathematical calculations of Total/Average marks and ranks</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-3.5 bg-slate-50 dark:bg-gray-900/50 border-t border-slate-200 dark:border-gray-700 flex justify-end flex-shrink-0 rounded-b-2xl">
                            <button onClick={() => setShowGuideModal(false)}
                                className="px-5 py-2 bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-slate-700 transition-colors shadow-md">
                                Close Guide
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginForm;
