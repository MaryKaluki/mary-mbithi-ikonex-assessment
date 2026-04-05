import React, { useState } from 'react';

const Header = ({ darkMode, toggleDarkMode, onLogout, toggleSidebar, schoolName, userName, hideMenu }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    return (
        <div className={`h-16 shadow-sm flex items-center justify-between px-4 md:px-8 fixed left-0 ${hideMenu ? '' : 'md:left-64'} right-0 top-0 z-30 transition-colors duration-300 ${darkMode ? 'bg-zinc-900 border-b border-zinc-800' : 'bg-white/80 backdrop-blur-md border-b border-gray-200'}`}>
            {/* Left Side - Hamburger + Title */}
            <div className="flex items-center min-w-0">
                {!hideMenu && (
                    <button
                        onClick={toggleSidebar}
                        className={`p-2 rounded-lg mr-2 md:hidden ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                )}
                <div className="min-w-0">
                    <h2 className={`text-lg md:text-xl font-bold truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>Dashboard</h2>
                    <p className={`text-xs md:text-sm hidden sm:block truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{schoolName || 'Skullu School System'}</p>
                </div>
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
                {/* Search - Hidden on Mobile */}
                <div className="relative hidden lg:block">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </span>
                    <input type="text" placeholder="Search anything..." className={`pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-48 xl:w-64 transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800'}`} />
                </div>

                {/* New Button - Hidden on Mobile */}
                <div className="relative group">
                    <button className="hidden md:flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        New
                    </button>
                    {/* Quick Action Dropdown */}
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                        <div className="p-2">
                            <button onClick={() => window.location.hash = '/students/admit'} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary rounded-lg">Admit Student</button>
                            <button onClick={() => window.location.hash = '/hr/staff/create'} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary rounded-lg">Add Staff</button>
                            <button onClick={() => window.location.hash = '/notices'} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary rounded-lg">Post Notice</button>
                        </div>
                    </div>
                </div>

                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleDarkMode}
                    className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    title="Toggle Theme"
                >
                    {darkMode ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    )}
                </button>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-primary/10 text-primary' : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100')}`}
                    >
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full dark:border-zinc-900 animate-pulse"></span>
                    </button>

                    {showNotifications && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                            <div className={`fixed md:absolute right-2 md:right-0 left-2 md:left-auto mt-2 md:w-80 rounded-2xl shadow-2xl z-50 overflow-hidden animate-modal-pop transform origin-top-right border ${darkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-100'}`}>
                                <div className="p-4 border-b border-gray-100 dark:border-zinc-700 flex justify-between items-center bg-primary/5">
                                    <h3 className="font-black text-primary uppercase text-xs tracking-widest">Notifications</h3>
                                    <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full">3 New</span>
                                </div>
                                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                    {[
                                        {
                                            id: 1,
                                            title: 'Fee Payment Received',
                                            desc: 'John Smith paid KSh 15,000 for Term 2.',
                                            time: '2 mins ago',
                                            color: 'green',
                                            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        },
                                        {
                                            id: 2,
                                            title: 'Low Stock Alert',
                                            desc: 'Library book "React Guide" is currently out of stock.',
                                            time: '1 hour ago',
                                            color: 'orange',
                                            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                        },
                                        {
                                            id: 3,
                                            title: 'System Update',
                                            desc: 'New reports module has been successfully integrated.',
                                            time: '5 hours ago',
                                            color: 'blue',
                                            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        },
                                    ].map(n => (
                                        <div key={n.id} className="p-4 border-b border-gray-50 dark:border-zinc-700/50 hover:bg-gray-50 dark:hover:bg-zinc-700/30 cursor-pointer transition-colors group">
                                            <div className="flex space-x-3">
                                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${n.color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                                    n.color === 'orange' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                                                        'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}>
                                                    {n.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 group-hover:text-primary transition-colors">{n.title}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.desc}</p>
                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 font-medium">{n.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 text-center bg-gray-50 dark:bg-zinc-700/20 border-t border-gray-100 dark:border-zinc-700">
                                    <button className="text-xs font-bold text-primary hover:underline">View All Notifications</button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Profile Avatar */}
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 cursor-pointer dark:border-gray-600 flex-shrink-0">
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'User')}&background=0D8ABC&color=fff`} alt={userName || 'User'} className="w-full h-full object-cover" />
                </div>

                {/* Notification Demo Buttons - Temporary for you to see the animations */}
                <div className="hidden lg:flex items-center space-x-2 mr-4">
                    <button
                        onClick={() => window.showToast('success', 'This is a success animation! Everything is working perfectly.')}
                        className="px-3 py-1.5 text-xs font-bold bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500 hover:text-white transition-all"
                    >
                        Demo Success
                    </button>
                    <button
                        onClick={() => window.showToast('error', 'This is a failure animation! Something went wrong.')}
                        className="px-3 py-1.5 text-xs font-bold bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                    >
                        Demo Error
                    </button>
                </div>

                <button
                    onClick={onLogout}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300 group"
                    title="Sign Out"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
            </div>
        </div>
    );
};

export default Header;
