import React, { useState } from 'react';

const QuickBooks = () => {
    const [isConnected, setIsConnected] = useState(true);

    return (
        <div className="space-y-6 pb-20">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">QuickBooks Online Integration</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Connection Status */}
                <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex flex-col items-center text-center">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isConnected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                        </div>
                        <h3 className="font-bold text-xl mb-1">{isConnected ? 'Connected' : 'Disconnected'}</h3>
                        <p className="text-sm text-gray-500 mb-6">{isConnected ? 'Last synced: Just now' : 'Connect to sync data'}</p>

                        <button
                            onClick={() => setIsConnected(!isConnected)}
                            className={`w-full py-2 rounded-lg font-bold transition-all ${isConnected ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-600 text-white hover:bg-green-700'}`}
                        >
                            {isConnected ? 'Disconnect' : 'Connect QuickBooks'}
                        </button>
                    </div>
                </div>

                {/* Sync Activity */}
                <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">Sync Activity Log</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <div>
                                    <div className="font-bold text-sm">Synced 45 Fee Invoices</div>
                                    <div className="text-xs text-gray-500">Sales Record Update</div>
                                </div>
                            </div>
                            <div className="text-xs font-mono text-gray-400">10:45 AM</div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <div>
                                    <div className="font-bold text-sm">Update Student Customer Profiles</div>
                                    <div className="text-xs text-gray-500">Customer Data Sync</div>
                                </div>
                            </div>
                            <div className="text-xs font-mono text-gray-400">09:30 AM</div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30">
                            <div className="flex items-center space-x-3">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                <div>
                                    <div className="font-bold text-sm text-red-700 dark:text-red-400">Failed: Expense Record #998</div>
                                    <div className="text-xs text-red-500">Account mapping error</div>
                                </div>
                            </div>
                            <div className="text-xs font-mono text-red-400">Yesterday</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Mapping */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">Chart of Accounts Mapping</h3>
                    <button className="text-purple-600 font-bold text-sm hover:underline">Edit Mappings</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Revenue Accounts</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 border-b">
                                <span className="text-sm">Tuition Fees</span>
                                <span className="text-sm font-mono text-blue-600">4000 - Sales Income</span>
                            </div>
                            <div className="flex justify-between items-center p-2 border-b">
                                <span className="text-sm">Transport Charges</span>
                                <span className="text-sm font-mono text-blue-600">4100 - Service Income</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Asset Accounts</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 border-b">
                                <span className="text-sm">Bank (KCB)</span>
                                <span className="text-sm font-mono text-blue-600">1010 - Checking</span>
                            </div>
                            <div className="flex justify-between items-center p-2 border-b">
                                <span className="text-sm">Petty Cash</span>
                                <span className="text-sm font-mono text-blue-600">1020 - Cash on Hand</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickBooks;
