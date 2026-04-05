import React, { useState } from 'react';

const LoginForm = ({ onLoginSuccess }) => {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState(null);
    const [loading, setLoading]   = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                setError('Server error. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6 transition-colors duration-300">
            <div className="w-full max-w-md">
                {/* Logo / Brand */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg shadow-primary/30 mb-4">
                        <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Skullu 2.0</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">School Management System</p>
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

                <p className="mt-8 text-center text-xs text-gray-400 dark:text-gray-600">
                    &copy; {new Date().getFullYear()} Skullu Education Systems. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default LoginForm;
