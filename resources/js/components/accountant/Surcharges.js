import React from 'react';

const Surcharges = () => {
    return (
        <div className="space-y-6 pb-20">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Penalty Configuration</h2>
            <p className="text-gray-500">Configure automated surcharges for late payments.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">Standard Late Fee</h3>
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="p-3 bg-red-50 rounded-lg text-red-600">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Current Setting</div>
                            <div className="text-2xl font-bold">5%</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Grace Period (Days)</label>
                            <input type="number" className="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600" defaultValue="7" />
                            <p className="text-xs text-gray-400 mt-1">Days after term starts before penalty applies.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Penalty Type</label>
                            <select className="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600">
                                <option>Percentage (%) of Outstanding</option>
                                <option>Fixed Amount (KSh)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Value</label>
                            <input type="number" className="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600" defaultValue="5" />
                        </div>
                        <button className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-black transition-colors">
                            Update Rules
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">Penalty History</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                            <div className="text-sm font-medium">Applied last month</div>
                            <div className="font-bold text-red-600">KSh 125,000</div>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                            <div className="text-sm font-medium">Waived (Hardship)</div>
                            <div className="font-bold text-green-600">KSh 15,000</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Surcharges;
