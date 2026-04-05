import React from 'react';

const PlaceholderView = ({ title, icon }) => (
    <div className="flex flex-col items-center justify-center h-48 md:h-64 text-gray-400 dark:text-gray-500 px-4">
        <div className="mb-4 p-3 md:p-4 bg-gray-100 rounded-full dark:bg-gray-800">
            {icon || <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
        </div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-500 dark:text-gray-300 text-center">{title}</h2>
        <p className="text-sm dark:text-gray-500">This module is under construction.</p>
    </div>
);

export default PlaceholderView;
