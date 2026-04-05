import React from 'react';

const FundTransfers = () => {
    return (
        <div className="space-y-6 pb-20">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Fund Transfers</h2>
            <p className="text-gray-500">System-internal transfers between accounts.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Transfer Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">New Transfer</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Account</label>
                            <select className="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600">
                                <option>Main Operating Account (KCB)</option>
                                <option>Fee Collection Account (Equity)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Account</label>
                            <select className="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600">
                                <option>Petty Cash</option>
                                <option>Salaries Account</option>
                                <option>Development Fund</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                            <input type="text" className="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason / Note</label>
                            <textarea className="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600" rows="3"></textarea>
                        </div>
                        <button className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors">
                            Initiate Transfer
                        </button>
                    </div>
                </div>

                {/* Recent Transfers */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">Recent Transfers</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                <div>
                                    <div className="text-sm font-bold text-gray-800 dark:text-gray-200">Main Ops → Petty Cash</div>
                                    <div className="text-xs text-gray-500">Ref: TRF-2024-00{i} • 2 hours ago</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-gray-800 dark:text-gray-200">KSh 15,000</div>
                                    <div className="text-xs text-green-600 font-bold">Completed</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FundTransfers;
