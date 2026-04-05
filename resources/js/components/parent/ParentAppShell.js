import React, { useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import ParentDashboard from '../dashboards/ParentDashboard';
import ParentChildren from './ParentChildren';
import FeePayments from './FeePayments';
import ChildrenAcademic from './ChildrenAcademic';
import ChildrenAttendance from './ChildrenAttendance';
import TransportStatus from './TransportStatus';
import ParentalEngagement from './ParentalEngagement';

const NAV_ITEMS = [
    {
        path: '/parent', exact: true, label: 'Home', group: 'main',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
    },
    {
        path: '/parent/children', label: 'Children', group: 'main',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    },
    {
        path: '/parent/fees', label: 'Fees', group: 'main',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    },
    {
        path: '/parent/academic', label: 'Grades', group: 'main',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
    },
    {
        path: '/parent/attendance', label: 'Attendance', group: 'more',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    },
    {
        path: '/parent/transport', label: 'Transport', group: 'more',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />,
    },
    {
        path: '/parent/engagement', label: 'Messages', group: 'more',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
    },
];

// Bottom nav shows first 4 + "More" dot-menu
const BOTTOM_MAIN = NAV_ITEMS.filter(n => n.group === 'main');
const MORE_ITEMS  = NAV_ITEMS.filter(n => n.group === 'more');

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
};

const NavIcon = ({ item, active, onClick, vertical }) => (
    <button
        onClick={onClick}
        className={`
            group flex items-center gap-3 transition-all active:scale-95
            ${vertical
                ? `w-full px-4 py-3 rounded-xl text-sm font-semibold ${active ? 'text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-200'}`
                : `flex-col px-2 py-1.5 rounded-xl text-[10px] font-bold ${active ? '' : 'text-gray-400 dark:text-gray-500'}`
            }
        `}
        style={active ? { background: vertical ? 'var(--primary-color)' : 'transparent', color: vertical ? 'white' : 'var(--primary-color)' } : {}}
    >
        <svg className={`flex-shrink-0 transition-transform ${vertical ? 'w-5 h-5' : 'w-6 h-6'} ${active && !vertical ? 'scale-110' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {item.icon}
        </svg>
        <span className={vertical ? 'flex-1 text-left' : ''}>{item.label}</span>
        {vertical && active && (
            <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
        )}
    </button>
);

const ParentAppShell = () => {
    const location  = useLocation();
    const navigate  = useNavigate();
    const [showMore, setShowMore] = useState(false);

    const authUser   = (() => { try { return JSON.parse(localStorage.getItem('auth_user') || '{}'); } catch (_) { return {}; } })();
    const schoolName = localStorage.getItem('schoolName') || 'School';
    const firstName  = (authUser.name || 'Parent').split(' ')[0];
    const fullName   = authUser.name || 'Parent';

    const isActive = (item) => location.pathname === item.path;
    const isMoreActive = MORE_ITEMS.some(i => i.path === location.pathname);
    const currentItem = NAV_ITEMS.find(i => i.path === location.pathname);

    return (
        /* Full height container: flex row on desktop, flex col on mobile */
        <div className="flex flex-col md:flex-row flex-1" style={{ minHeight: 'calc(100vh - 64px)' }}>

            {/* ════════════════════════════════════════════════════
                DESKTOP LEFT SIDEBAR  (hidden on mobile)
            ════════════════════════════════════════════════════ */}
            <aside className="hidden md:flex md:flex-col md:w-64 md:flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                {/* School / Parent info */}
                <div className="px-5 py-5 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                            style={{ background: 'var(--primary-color)' }}
                        >
                            {firstName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-gray-800 dark:text-gray-100 truncate text-sm">{fullName}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{schoolName}</p>
                        </div>
                    </div>
                    <div
                        className="text-xs font-semibold px-3 py-2 rounded-lg text-white/90"
                        style={{ background: 'var(--primary-color)' }}
                    >
                        {getGreeting()} 👋
                    </div>
                </div>

                {/* Main nav */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest px-3 mb-2">Main</p>
                    {BOTTOM_MAIN.map(item => (
                        <NavIcon
                            key={item.path}
                            item={item}
                            active={isActive(item)}
                            vertical
                            onClick={() => navigate(item.path)}
                        />
                    ))}

                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest px-3 mt-4 mb-2 pt-4 border-t border-gray-100 dark:border-gray-700">More</p>
                    {MORE_ITEMS.map(item => (
                        <NavIcon
                            key={item.path}
                            item={item}
                            active={isActive(item)}
                            vertical
                            onClick={() => navigate(item.path)}
                        />
                    ))}
                </nav>

                {/* Bottom branding */}
                <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] text-gray-300 dark:text-gray-600 text-center">Parent Portal</p>
                </div>
            </aside>

            {/* ════════════════════════════════════════════════════
                CONTENT AREA
            ════════════════════════════════════════════════════ */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Mobile gradient header (hidden on desktop) */}
                <div
                    className="md:hidden relative overflow-hidden px-5 pt-5 pb-16 flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-hover) 100%)' }}
                >
                    <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10 bg-white"></div>
                    <div className="absolute -bottom-12 -left-6 w-32 h-32 rounded-full opacity-10 bg-white"></div>
                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">{schoolName}</p>
                            <h1 className="text-white text-xl font-bold mt-0.5">{getGreeting()}, {firstName} 👋</h1>
                        </div>
                        <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30 text-white font-bold text-sm">
                            {firstName.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>

                {/* Mobile title card overlapping header (hidden on desktop) */}
                <div className="md:hidden mx-4 -mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 px-5 py-3 flex items-center gap-3 z-10 flex-shrink-0">
                    <div className="w-2 h-8 rounded-full bg-purple-600" style={{ background: 'var(--primary-color)' }}></div>
                    <div>
                        <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base leading-tight">{currentItem?.label || 'Portal'}</h2>
                        <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{location.pathname.replace('/parent/', '').replace('/parent', 'home')}</p>
                    </div>
                </div>

                {/* Desktop page title bar (hidden on mobile) */}
                <div className="hidden md:flex items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{currentItem?.label || 'Parent Portal'}</h2>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{schoolName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white"
                            style={{ background: 'var(--primary-color)' }}
                        >
                            {getGreeting()}, {firstName} 👋
                        </div>
                    </div>
                </div>

                {/* Scrollable content */}
                <div
                    className="flex-1 overflow-y-auto px-4 md:px-8 pt-4 md:pt-6 pb-24 md:pb-8"
                    style={{ background: '#F0F2F7' }}
                >
                    <Routes>
                        <Route index element={<ParentDashboard />} />
                        <Route path="children"   element={<ParentChildren />} />
                        <Route path="fees"       element={<FeePayments />} />
                        <Route path="academic"   element={<ChildrenAcademic />} />
                        <Route path="attendance" element={<ChildrenAttendance />} />
                        <Route path="transport"  element={<TransportStatus />} />
                        <Route path="engagement" element={<ParentalEngagement />} />
                    </Routes>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════
                MOBILE BOTTOM NAV  (hidden on desktop)
            ════════════════════════════════════════════════════ */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-20 px-2 py-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
                {BOTTOM_MAIN.map(item => (
                    <NavIcon
                        key={item.path}
                        item={item}
                        active={isActive(item)}
                        vertical={false}
                        onClick={() => { setShowMore(false); navigate(item.path); }}
                    />
                ))}
                {/* More button */}
                <button
                    onClick={() => setShowMore(v => !v)}
                    className={`flex flex-col items-center px-2 py-1.5 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${isMoreActive || showMore ? '' : 'text-gray-400 dark:text-gray-500'}`}
                    style={isMoreActive || showMore ? { color: 'var(--primary-color)' } : {}}
                >
                    <svg className={`w-6 h-6 transition-transform ${showMore ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                    <span>More</span>
                </button>
            </nav>

            {/* More overlay (mobile only) */}
            {showMore && (
                <div className="md:hidden fixed inset-0 z-30" onClick={() => setShowMore(false)}>
                    <div
                        className="absolute bottom-20 left-4 right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4"
                        onClick={e => e.stopPropagation()}
                    >
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">More Options</p>
                        <div className="grid grid-cols-3 gap-3">
                            {MORE_ITEMS.map(item => (
                                <button
                                    key={item.path}
                                    onClick={() => { setShowMore(false); navigate(item.path); }}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-transform active:scale-95 bg-gray-50 dark:bg-gray-700 ${location.pathname === item.path ? 'ring-2' : ''}`}
                                    style={location.pathname === item.path ? { ringColor: 'var(--primary-color)', color: 'var(--primary-color)' } : { color: '#6b7280' }}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
                                    <span className="text-xs font-bold">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParentAppShell;
