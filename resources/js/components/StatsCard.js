import React from 'react';

const StatsCard = ({ title, value, percentage, trend, icon, colorClass, progressColor }) => (
    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-indigo-100 cursor-pointer group dark:bg-gray-800 dark:border-gray-700">
        <div className="flex justify-between items-start mb-3 md:mb-4">
            <div className="min-w-0 flex-1 mr-3">
                <p className="text-gray-500 text-xs md:text-sm font-medium dark:text-gray-400 truncate">{title}</p>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mt-1 dark:text-gray-100 truncate">{value}</h3>
            </div>
            <div className={`p-2 md:p-3 rounded-xl flex-shrink-0 ${colorClass}`}>
                {icon}
            </div>
        </div>

        <div className="flex items-center mb-3 md:mb-4">
            <span className={`flex items-center text-xs font-bold ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trend === 'up' ? '↑' : '↓'} {percentage}
            </span>
            <span className="text-gray-400 text-xs ml-2 dark:text-gray-500 hidden sm:inline">vs last month</span>
        </div>

        <div className="h-1 md:h-1.5 w-full bg-gray-100 rounded-full overflow-hidden dark:bg-gray-700">
            <div className={`h-full rounded-full ${progressColor}`} style={{ width: '65%' }}></div>
        </div>
    </div>
);

export default StatsCard;
