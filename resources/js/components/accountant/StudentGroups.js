import React from 'react';

const StudentGroups = () => {
    const groups = [
        { id: 1, name: 'Day Scholars', students: 850, baseFee: 'KSh 35,000', color: 'bg-blue-50 text-blue-600' },
        { id: 2, name: 'Boarders', students: 400, baseFee: 'KSh 65,000', color: 'bg-green-50 text-green-600' },
        { id: 3, name: 'International', students: 45, baseFee: '$ 2,500', color: 'bg-purple-50 text-purple-600' },
        { id: 4, name: 'Staff Children', students: 30, baseFee: 'KSh 15,000', color: 'bg-orange-50 text-orange-600' },
    ];

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Student Billing Groups</h2>
                    <p className="text-sm text-gray-500">Categorize students for automated fee billing.</p>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg shadow hover:bg-purple-700 transition-all">
                    + New Group
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {groups.map((group) => (
                    <div key={group.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 cursor-pointer">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${group.color}`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-1">{group.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">{group.students} Students Active</p>
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="text-xs text-gray-400 font-bold uppercase">Base Fee</div>
                            <div className="font-mono font-bold text-gray-700 dark:text-gray-300">{group.baseFee}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentGroups;
