import React from 'react';

const DriverRoutes = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">My Assigned Routes</h2>

            <div className="space-y-4">
                {[
                    { name: 'Morning Route A', time: '06:30 AM', stops: 12, students: 24, status: 'Completed', color: 'border-green-500' },
                    { name: 'Afternoon Route B', time: '03:15 PM', stops: 10, students: 20, status: 'Upcoming', color: 'border-purple-500' },
                ].map((route, i) => (
                    <div key={i} className={`bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm border-l-4 ${route.color} hover:shadow-lg transition-all duration-300 dark:bg-gray-800 dark:border-gray-700`}>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                            <div>
                                <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">{route.name}</h3>
                                <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-2 text-gray-500 text-sm dark:text-gray-400">
                                    <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> {route.time}</span>
                                    <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> {route.stops} Stops</span>
                                    <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> {route.students} Students</span>
                                </div>
                            </div>
                            <span className={`px-3 py-1 text-sm font-bold rounded-full ${route.status === 'Completed' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300'}`}>
                                {route.status}
                            </span>
                        </div>
                        <div className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-3">
                            <button className="flex-1 py-2 bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600">
                                View Stop List
                            </button>
                            <button className="flex-1 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-md">
                                Start Navigation
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DriverRoutes;
