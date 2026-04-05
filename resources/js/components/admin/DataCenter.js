import React, { useState } from 'react';

const DataCenter = () => {
    const [activeTab, setActiveTab] = useState('import');

    return (
        <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Data Management Center</h2>

            <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
                {['import', 'export', 'backup'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-3 text-sm font-bold border-b-2 capitalize transition-colors ${activeTab === tab ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'import' && (
                <div className="bg-purple-50 p-4 md:p-8 rounded-xl md:rounded-2xl shadow-sm border border-purple-100 max-w-2xl dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 dark:text-gray-100">Bulk Import Data</h3>
                    <p className="text-sm text-gray-500 mb-6 dark:text-gray-400">Upload CSV or Excel files to quickly populate the system.</p>

                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-white hover:border-purple-500 transition-all cursor-pointer dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <p className="font-bold text-gray-600 dark:text-gray-300">Click to Upload CSV</p>
                        <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">Supported: Students, Staff, Books, Inventory</p>
                    </div>

                    <div className="mt-6">
                        <p className="text-sm font-bold text-gray-700 mb-2 dark:text-gray-300">Select Data Type</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-purple-500 bg-white flex-1 dark:bg-gray-600 dark:border-gray-500 dark:hover:border-purple-400">
                                <input type="radio" name="dtype" className="text-purple-600 focus:ring-purple-500" />
                                <span className="text-sm dark:text-gray-100">Student Records</span>
                            </label>
                            <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-purple-500 bg-white flex-1 dark:bg-gray-600 dark:border-gray-500 dark:hover:border-purple-400">
                                <input type="radio" name="dtype" className="text-purple-600 focus:ring-purple-500" />
                                <span className="text-sm dark:text-gray-100">Staff Details</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'export' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-3xl dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 dark:text-gray-100">Export System Data</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {['All Student Data', 'Fee Payment Records', 'Staff Payroll History', 'Library Inventory', 'Exam Results (Term 1)'].map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-4 border border-gray-100 rounded-lg hover:border-purple-200 transition-colors bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700 dark:hover:border-purple-500/50">
                                <span className="font-bold text-gray-700 text-sm dark:text-gray-300">{item}</span>
                                <button 
                                    onClick={() => {
                                        window.axios.post('/api/admin/datacenter/export', { type: item }).then(res => {
                                            window.showToast('success', res.data.message || `${item} export started.`);
                                        }).catch(err => window.showToast('error', 'Export failed.'));
                                    }}
                                    className="text-purple-600 text-sm font-bold hover:underline dark:text-purple-400"
                                >
                                    Download CSV
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'backup' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <div className="bg-green-50 p-6 rounded-xl border border-green-100 flex items-start dark:bg-green-900/10 dark:border-green-900/30">
                            <svg className="w-8 h-8 text-green-600 mr-4 mt-1 dark:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <div>
                                <h3 className="text-lg font-bold text-green-800 dark:text-green-300">System is Healthy</h3>
                                <p className="text-green-700 text-sm dark:text-green-400">Last successful backup was 4 hours ago.</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                            <h3 className="font-bold text-gray-800 mb-2 dark:text-gray-100">Manual Database Backup</h3>
                            <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">Create a full snapshot of all tenant databases. This process runs in the background.</p>
                            <button 
                                onClick={() => {
                                    window.axios.post('/api/admin/datacenter/backup').then(res => {
                                        window.showToast('success', res.data.message || 'Full database backup initiated...');
                                    }).catch(err => window.showToast('error', 'Backup failed.'));
                                }}
                                className="px-6 py-2.5 bg-gray-800 text-white font-bold rounded-lg shadow-lg hover:bg-black transition-colors dark:bg-gray-700 dark:hover:bg-gray-600"
                            >
                                Start Full Backup
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                            <h3 className="font-bold text-gray-800 mb-2 dark:text-gray-100">System Maintenance</h3>
                            <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">Clear application cache, compiled views, and op-codes to resolve stale data issues.</p>
                            <button 
                                onClick={() => {
                                    window.axios.post('/api/admin/datacenter/clear-cache').then(res => {
                                        window.showToast('success', res.data.message || 'Application cache has been cleared successfully.');
                                    }).catch(err => window.showToast('error', 'Cache clear failed.'));
                                }}
                                className="px-6 py-2.5 bg-orange-100 text-orange-700 font-bold rounded-lg hover:bg-orange-200 transition-colors dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50"
                            >
                                Clear System Cache
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataCenter;
