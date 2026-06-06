import React, { useState } from 'react';

const EXPORT_TYPES = [
    'All Student Data',
    'Fee Payment Records',
    'Staff Payroll History',
    'Library Inventory',
    'Exam Results (Term 1)',
];

const DataCenter = () => {
    const [activeTab, setActiveTab] = useState('import');

    const handleExport = (type) => {
        window.axios.post('/api/admin/datacenter/export', { type })
            .then(res => window.showToast?.('success', res.data.message || `${type} export started.`))
            .catch(() => window.showToast?.('error', 'Export failed.'));
    };

    const handleBackup = () => {
        window.axios.post('/api/admin/datacenter/backup')
            .then(res => window.showToast?.('success', res.data.message || 'Backup initiated.'))
            .catch(() => window.showToast?.('error', 'Backup failed.'));
    };

    const handleClearCache = () => {
        window.axios.post('/api/admin/datacenter/clear-cache')
            .then(res => window.showToast?.('success', res.data.message || 'Cache cleared.'))
            .catch(() => window.showToast?.('error', 'Cache clear failed.'));
    };

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Admin <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Data Center</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Data Management Center</h1>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-gray-700 flex-shrink-0">
                {['import', 'export', 'backup'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider capitalize border-b-2 transition-colors ${
                            activeTab === tab
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Import */}
            {activeTab === 'import' && (
                <div className="flex-1 flex items-start">
                    <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col">
                        <div className="px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700 rounded-t-lg">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Bulk Import Data</span>
                        </div>
                        <div className="p-4 flex flex-col gap-4">
                            <div className="border-2 border-dashed border-slate-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                                <svg className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                                </svg>
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Click to Upload CSV</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">Supported: Students, Staff, Books, Inventory</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Select Data Type</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Student Records', 'Staff Details', 'Library Books', 'Fee Records'].map(t => (
                                        <label key={t} className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-gray-600 rounded-md cursor-pointer hover:border-primary text-xs dark:text-slate-300 bg-white dark:bg-gray-700">
                                            <input type="radio" name="dtype" className="accent-primary"/>
                                            {t}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button className="py-2 bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-slate-900 transition-colors">
                                Start Import
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Export */}
            {activeTab === 'export' && (
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                    <div className="flex-shrink-0 px-4 py-2.5 bg-slate-800 dark:bg-slate-900 rounded-t-lg">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Export System Data</span>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Dataset</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {EXPORT_TYPES.map((item, i) => (
                                    <tr key={item} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                        i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                    }`}>
                                        <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                        <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{item}</td>
                                        <td className="px-3 py-2 text-right">
                                            <button onClick={() => handleExport(item)}
                                                className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">
                                                Download CSV
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">{EXPORT_TYPES.length} datasets available</p>
                    </div>
                </div>
            )}

            {/* Backup */}
            {activeTab === 'backup' && (
                <div className="flex-1 flex gap-3">
                    <div className="flex-1 flex flex-col gap-3">
                        <div className="px-4 py-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-start gap-3">
                            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <div>
                                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">System is Healthy</p>
                                <p className="text-[10px] text-emerald-700 dark:text-emerald-400">Last successful backup was 4 hours ago.</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
                            <div className="px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700 rounded-t-lg">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Manual Database Backup</span>
                            </div>
                            <div className="p-4">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Create a full snapshot of all tenant databases. Runs in background.</p>
                                <button onClick={handleBackup}
                                    className="px-4 py-2 bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-slate-900 transition-colors">
                                    Start Full Backup
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
                            <div className="px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700 rounded-t-lg">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">System Maintenance</span>
                            </div>
                            <div className="p-4">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Clear application cache, compiled views, and op-codes.</p>
                                <button onClick={handleClearCache}
                                    className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider rounded-md hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors">
                                    Clear System Cache
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataCenter;
