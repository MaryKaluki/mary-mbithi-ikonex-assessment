import React from 'react';
import StatsCard from '../StatsCard';

const LibrarianDashboard = () => (
    <div>
        {/* Library Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
                title="Total Books"
                value="12,450"
                percentage="+150 New"
                trend="up"
                colorClass="bg-indigo-100 text-indigo-600"
                progressColor="bg-indigo-500"
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
            />
            <StatsCard
                title="Books Issued"
                value="485"
                percentage="Active"
                trend="neutral"
                colorClass="bg-blue-100 text-blue-600"
                progressColor="bg-blue-500"
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>}
            />
            <StatsCard
                title="Overdue Books"
                value="24"
                percentage="Need Action"
                trend="down"
                colorClass="bg-red-100 text-red-600"
                progressColor="bg-red-500"
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <StatsCard
                title="Fine Collected"
                value="$120"
                percentage="This Month"
                trend="up"
                colorClass="bg-green-100 text-green-600"
                progressColor="bg-green-500"
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Quick Issue/Return */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 dark:bg-gray-800 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 mb-6 dark:text-gray-100">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                    <button className="flex flex-col items-center justify-center p-6 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors border-2 border-transparent hover:border-indigo-200">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </div>
                        <span className="font-bold text-gray-700">Issue Book</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-xl hover:bg-green-100 transition-colors border-2 border-transparent hover:border-green-200">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </div>
                        <span className="font-bold text-gray-700">Return Book</span>
                    </button>
                </div>
                <div className="mt-6">
                    <input type="text" placeholder="Scan ISBN or Enter Book ID..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
            </div>

            {/* Overdue List */}
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 dark:bg-gray-800 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 mb-4 dark:text-gray-100">Overdue Books</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left min-w-[500px]">
                        <thead>
                            <tr className="text-gray-400 border-b">
                                <th className="pb-2">Student</th>
                                <th className="pb-2">Book Title</th>
                                <th className="pb-2">Due Date</th>
                                <th className="pb-2">Fine</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b">
                                <td className="py-3 font-medium">Alex Johnson</td>
                                <td className="text-gray-500">Physics 101</td>
                                <td className="text-red-500 font-bold">2 Days Ago</td>
                                <td className="text-gray-700">$2.00</td>
                            </tr>
                            <tr className="border-b last:border-0">
                                <td className="py-3 font-medium">Maria Garcia</td>
                                <td className="text-gray-500">World History</td>
                                <td className="text-orange-500 font-bold">Today</td>
                                <td className="text-gray-700">$0.00</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <button className="w-full mt-4 py-2 text-primary font-semibold text-sm hover:underline">View All Overdue Report</button>
            </div>
        </div>
    </div>
);

export default LibrarianDashboard;
