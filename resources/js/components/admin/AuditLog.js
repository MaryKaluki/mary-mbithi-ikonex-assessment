import React, { useState, useEffect } from 'react';

const AuditLog = ({ mode = 'school' }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [eventFilter, setEventFilter] = useState('All Events');
    const [dateFilter, setDateFilter] = useState('');
    const [rawLogs, setRawLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const endpoint = mode === 'global'
            ? '/api/platform/audit-logs'
            : '/api/admin/audit-logs';

        window.axios.get(endpoint).then(res => {
            setRawLogs(Array.isArray(res.data) ? res.data : []);
            setLoading(false);
        }).catch(() => {
            // Silently handle 403/404 — endpoint may not exist for this role
            setLoading(false);
        });
    }, [mode]);

    const filteredLogs = rawLogs.filter(log => {
        const userStr = log.user?.name || 'System';
        const matchesSearch = userStr.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (log.ip_address && log.ip_address.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesEvent = eventFilter === 'All Events' || log.action_type === eventFilter;
        const matchesDate = !dateFilter || log.created_at.startsWith(dateFilter);
        return matchesSearch && matchesEvent && matchesDate;
    });

    return (
        <div className="space-y-6 pb-20">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
                {mode === 'global' ? 'Global System Audit Logs (All Tenants)' : 'System Audit Logs'}
            </h2>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex gap-4 flex-1">
                    <input 
                        type="date" 
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full sm:w-auto border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" 
                    />
                    <select 
                        value={eventFilter}
                        onChange={(e) => setEventFilter(e.target.value)}
                        className="w-full sm:w-auto border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 cursor-pointer"
                    >
                        <option>All Events</option>
                        <option>Login/Logout</option>
                        <option>Data Modification</option>
                        <option>Security</option>
                        <option>System</option>
                    </select>
                </div>
                <div className="relative flex-1">
                    <input 
                        type="text" 
                        placeholder="Search User, IP, or Details..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" 
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 dark:bg-gray-900/50 dark:border-gray-700 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-2">Timestamp & IP</div>
                    {mode === 'global' && <div className="col-span-2">Tenant (School)</div>}
                    <div className={mode === 'global' ? 'col-span-2' : 'col-span-3'}>User</div>
                    <div className="col-span-3">Action Type</div>
                    <div className={mode === 'global' ? 'col-span-3' : 'col-span-4'}>Details</div>
                </div>
                
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {loading ? <div className="p-10 text-center text-gray-400 font-bold">Loading audit logs...</div> : filteredLogs.map((log, i) => (
                        <div key={log.id || i} className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 px-6 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="col-span-2">
                                <span className="text-xs font-mono font-bold text-gray-600 dark:text-gray-400 block">{new Date(log.created_at).toLocaleString()}</span>
                                <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 dark:text-gray-500">{log.ip_address || 'System'}</span>
                            </div>
                            
                            {mode === 'global' && (
                                <div className="col-span-2">
                                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider dark:bg-slate-700 dark:text-slate-300">{log.school?.name || 'All Schools'}</span>
                                </div>
                            )}
                            
                            <div className={`${mode === 'global' ? 'col-span-2' : 'col-span-3'} font-bold text-gray-800 text-sm dark:text-gray-200`}>
                                {log.user?.name || 'System'}
                            </div>
                            
                            <div className="col-span-3">
                                <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    log.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' :
                                    log.color === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                                    log.color === 'red' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                                    'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400'
                                }`}>
                                    {log.action_type}
                                </span>
                            </div>
                            
                            <div className={`${mode === 'global' ? 'col-span-3' : 'col-span-4'} text-sm text-gray-600 dark:text-gray-400`}>
                                {log.details}
                            </div>
                        </div>
                    ))}
                    
                    {!loading && filteredLogs.length === 0 && (
                        <div className="text-center py-10 text-gray-500 dark:text-gray-400 font-bold">
                            No audit logs found matching your criteria.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuditLog;
