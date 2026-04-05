import React, { useState, useEffect } from 'react';
import StatsCard from '../StatsCard';
import { SkeletonLoader } from '../common/Loader';

const AdminDashboard = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Administrator Dashboard</h1>
            {/* Stats Grid - Focused on Daily Ops */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {isLoading ? (
                    [...Array(4)].map((_, i) => <SkeletonLoader key={i} type="card" />)
                ) : (
                    <>
                        <StatsCard
                            title="Total Students"
                            value="1,245"
                            percentage="+3.2%"
                            trend="up"
                            colorClass="bg-blue-100 text-blue-600"
                            progressColor="bg-blue-500"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                        />
                        <StatsCard
                            title="Today's Attendance"
                            value="96%"
                            percentage="-1%"
                            trend="down"
                            colorClass="bg-indigo-100 text-indigo-600"
                            progressColor="bg-indigo-500"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
                        />
                        <StatsCard
                            title="Pending Leave"
                            value="4 Requests"
                            percentage="Action Required"
                            trend="neutral"
                            colorClass="bg-orange-100 text-orange-600"
                            progressColor="bg-orange-500"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                        <StatsCard
                            title="Transport Fleet"
                            value="12 Buses"
                            percentage="100% Active"
                            trend="up"
                            colorClass="bg-yellow-100 text-yellow-600"
                            progressColor="bg-yellow-500"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
                        />
                    </>
                )}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Notice Board Preview */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Latest Notices</h3>
                        <div className="flex space-x-2">
                            <button className="text-sm text-primary font-bold hover:underline">Mark all as read</button>
                        </div>
                    </div>
                    {isLoading ? (
                        <SkeletonLoader type="table" />
                    ) : (
                        <div className="space-y-4">
                            {[
                                { title: 'Term 2 Final Exams Schedule', date: '2 hours ago', tag: 'Academic', color: 'bg-blue-100 text-blue-600', isNew: true },
                                { title: 'Parent-Teacher Meeting Postponed', date: 'Yesterday', tag: 'Events', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300', isNew: true },
                                { title: 'New Library Books Arrival', date: 'Oct 23', tag: 'Library', color: 'bg-green-100 text-green-600', isNew: false },
                            ].map((notice, i) => (
                                <div key={i} className="group relative flex flex-col sm:flex-row items-start p-4 bg-gray-50/50 hover:bg-white dark:bg-gray-700/30 dark:hover:bg-gray-700 rounded-2xl transition-all duration-300 border border-transparent hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 cursor-pointer">
                                    <div className="flex-1 mb-2 sm:mb-0">
                                        <div className="flex items-center space-x-2">
                                            <h4 className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors">{notice.title}</h4>
                                            {notice.isNew && <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Sent to All Parents & Staff • Click to read details</p>
                                    </div>
                                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${notice.color}`}>{notice.tag}</span>
                                        <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 mt-2">{notice.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions Panel */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 dark:text-gray-100">Quick Actions</h3>
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-white hover:shadow-md transition-all rounded-xl border border-gray-100 dark:bg-gray-700 dark:border-gray-600 group">
                            <div className="flex items-center">
                                <span className="p-2 bg-purple-100 text-purple-600 rounded-lg mr-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                </span>
                                <span className="font-semibold text-gray-700 dark:text-gray-200">Admit Student</span>
                            </div>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-white hover:shadow-md transition-all rounded-xl border border-gray-100 dark:bg-gray-700 dark:border-gray-600 group">
                            <div className="flex items-center">
                                <span className="p-2 bg-blue-100 text-blue-600 rounded-lg mr-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </span>
                                <span className="font-semibold text-gray-700 dark:text-gray-200">Post Notice</span>
                            </div>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-white hover:shadow-md transition-all rounded-xl border border-gray-100 dark:bg-gray-700 dark:border-gray-600 group">
                            <div className="flex items-center">
                                <span className="p-2 bg-green-100 text-green-600 rounded-lg mr-3 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </span>
                                <span className="font-semibold text-gray-700 dark:text-gray-200">View Timetable</span>
                            </div>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
