import React, { useState, useEffect } from 'react';

const ACTION_COLORS = {
    'Login/Logout':      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    'Data Modification': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    'Security':          'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    'System':            'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300',
};

const AuditLog = ({ mode = 'school' }) => {
    const [searchTerm, setSearchTerm]   = useState('');
    const [eventFilter, setEventFilter] = useState('All Events');
    const [dateFilter, setDateFilter]   = useState('');
    const [rawLogs, setRawLogs]         = useState([]);
    const [loading, setLoading]         = useState(true);

    useEffect(() => {
        const endpoint = mode === 'global' ? '/api/platform/audit-logs' : '/api/admin/audit-logs';
        window.axios.get(endpoint)
            .then(res => setRawLogs(Array.isArray(res.data) ? res.data : []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [mode]);

    const filteredLogs = rawLogs.filter(log => {
        const userStr = log.user?.name || 'System';
        const matchesSearch = userStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (log.ip_address || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesEvent = eventFilter === 'All Events' || log.action_type === eventFilter;
        const matchesDate  = !dateFilter || log.created_at.startsWith(dateFilter);
        return matchesSearch && matchesEvent && matchesDate;
    });

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Admin <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Audit Log</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">
                        {mode === 'global' ? 'Global System Audit Logs' : 'System Audit Logs'}
                    </h1>
                </div>
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap gap-2 items-end flex-shrink-0">
                <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                <select value={eventFilter} onChange={e => setEventFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All Events</option>
                    <option>Login/Logout</option>
                    <option>Data Modification</option>
                    <option>Security</option>
                    <option>System</option>
                </select>
                <div className="flex-1 relative min-w-48">
                    <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input type="text" placeholder="Search user, IP, or details…"
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                </div>
                <div className="flex items-center px-3 py-1.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-md text-xs text-slate-500 whitespace-nowrap select-none">
                    <span className="font-bold text-slate-700 dark:text-slate-200 mr-1">{filteredLogs.length}</span> entries
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left" style={{ minWidth: 700 }}>
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-40">Timestamp / IP</th>
                                {mode === 'global' && (
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-32">School</th>
                                )}
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-36">User</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-36 text-center">Action Type</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="px-3 py-10 text-center text-sm text-slate-400">Loading audit logs…</td></tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr><td colSpan="6" className="px-3 py-12 text-center text-sm text-slate-400">No audit logs match your criteria.</td></tr>
                            ) : filteredLogs.map((log, i) => (
                                <tr key={log.id || i} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                    i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                }`}>
                                    <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                    <td className="px-3 py-2">
                                        <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400">{new Date(log.created_at).toLocaleString()}</p>
                                        <p className="text-[10px] text-slate-400 font-mono">{log.ip_address || 'System'}</p>
                                    </td>
                                    {mode === 'global' && (
                                        <td className="px-3 py-2">
                                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                                {log.school?.name || 'All'}
                                            </span>
                                        </td>
                                    )}
                                    <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{log.user?.name || 'System'}</td>
                                    <td className="px-3 py-2 text-center">
                                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${ACTION_COLORS[log.action_type] || ACTION_COLORS['System']}`}>
                                            {log.action_type}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-400">{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{filteredLogs.length} entries</p>
                </div>
            </div>
        </div>
    );
};

export default AuditLog;
