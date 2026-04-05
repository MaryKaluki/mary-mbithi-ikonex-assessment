import React from 'react';

const ProfileSelect = ({ onSelectProfile, schoolName, schoolLogo }) => {
    const profiles = [
        { id: 'platform_admin', label: 'Platform Admin', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', color: 'bg-slate-800', description: 'Multischool SaaS' },
        { id: 'super_admin', label: 'Super Admin', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: 'bg-purple-600', description: 'Full System Access' },
        { id: 'admin', label: 'Administrator', icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-indigo-600', description: 'School Operations' },
        { id: 'hr_manager', label: 'HR Manager', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'bg-pink-600', description: 'Staff & Payroll' },
        { id: 'accountant', label: 'Accountant', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-green-600', description: 'Fees & Expenses' },
        { id: 'teacher', label: 'Teacher', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'bg-indigo-600', description: 'Classes & Grades' },
        { id: 'librarian', label: 'Librarian', icon: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z', color: 'bg-orange-600', description: 'Books & Inventory' },
        { id: 'student', label: 'Student', icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z', color: 'bg-blue-600', description: 'My Portal' },
        { id: 'parent', label: 'Parent', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', color: 'bg-teal-600', description: 'Children & Fees' },
        { id: 'driver', label: 'Driver', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', color: 'bg-yellow-600', description: 'Routes & Transport' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-5xl w-full">
                <div className="text-center mb-12 animate-fadeIn">
                    {schoolLogo && (
                        <img src={schoolLogo} className="w-24 h-24 rounded-2xl mx-auto mb-6 object-cover shadow-xl" alt="Logo" />
                    )}
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4 dark:text-white">Welcome to {schoolName || 'Skullu 2.0'}</h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto dark:text-gray-400">Select your profile to sign in to the dashboard.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {profiles.map((profile, i) => (
                        <button
                            key={profile.id}
                            onClick={() => onSelectProfile(profile.id)}
                            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group text-left relative overflow-hidden dark:bg-gray-800 dark:border-gray-700"
                        >
                            <div className={`absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8 rounded-full opacity-10 ${profile.color} group-hover:scale-110 transition-transform`}></div>

                            <div className={`w-14 h-14 rounded-xl ${profile.color} text-white flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={profile.icon} />
                                </svg>
                            </div>

                            <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-purple-600 transition-colors dark:text-gray-100 dark:group-hover:text-purple-400">{profile.label}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{profile.description}</p>

                            <div className="mt-6 flex items-center text-sm font-bold text-gray-400 group-hover:text-purple-600 transition-colors dark:group-hover:text-purple-400">
                                <span>Sign In</span>
                                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-12 text-center text-sm text-gray-400 dark:text-gray-600">
                    <p>&copy; 2026 Skullu Education Systems. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default ProfileSelect;
