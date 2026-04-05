import React, { useState, useEffect } from 'react';

const LeaveRequests = () => {
    const [activeTab, setActiveTab]       = useState('Pending');
    const [requests, setRequests]         = useState([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    const fetchLeaves = () => {
        setLoading(true);
        setError('');
        window.axios.get('/api/hr/leave')
            .then(res => setRequests(res.data.leaves))
            .catch(() => setError('Failed to load leave requests.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchLeaves(); }, []);

    const handleAction = (id, action) => {
        setActionLoading(id + action);
        window.axios.post(`/api/hr/leave/${id}/${action}`)
            .then(() => fetchLeaves())
            .catch(() => setError(`Failed to ${action} leave request.`))
            .finally(() => setActionLoading(null));
    };

    const tabs = [
        { id: 'Pending',  label: 'Pending' },
        { id: 'Approved', label: 'Approved' },
        { id: 'Rejected', label: 'Rejected' },
    ];

    const filteredRequests = requests.filter(r => r.status === activeTab);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Leave Requests</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Review and manage staff leave applications.</p>
            </div>

            {error && (
                <div className="p-3 border border-gray-200 bg-gray-50 rounded-lg text-gray-700 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">
                    {error}
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                {tabs.map(tab => {
                    const count = requests.filter(r => r.status === tab.id).length;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                                activeTab === tab.id
                                    ? 'border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-100'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        >
                            {tab.label}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                activeTab === tab.id
                                    ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Request Cards */}
            {loading ? (
                <div className="text-center py-12 text-sm text-gray-500 dark:text-gray-400">Loading leave requests...</div>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.length === 0 ? (
                        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center dark:bg-gray-800 dark:border-gray-700">
                            <p className="text-sm text-gray-500 dark:text-gray-400">No {activeTab.toLowerCase()} leave requests.</p>
                        </div>
                    ) : filteredRequests.map(request => (
                        <div key={request.id} className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm flex-shrink-0 dark:bg-gray-600 dark:text-gray-300">
                                        {(request.name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-100">{request.name}</h4>
                                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                                {request.type}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{request.role}</p>
                                        <div className="flex flex-wrap gap-4 mt-2 text-sm">
                                            <span className="text-gray-600 dark:text-gray-300">
                                                <span className="font-bold">From:</span> {request.start_date}
                                            </span>
                                            <span className="text-gray-600 dark:text-gray-300">
                                                <span className="font-bold">To:</span> {request.end_date}
                                            </span>
                                            {request.days && (
                                                <span className="text-gray-500 dark:text-gray-400">{request.days} day(s)</span>
                                            )}
                                        </div>
                                        {request.reason && (
                                            <p className="text-sm text-gray-500 mt-2 italic dark:text-gray-400">"{request.reason}"</p>
                                        )}
                                        {request.approved_by && activeTab !== 'Pending' && (
                                            <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">
                                                {activeTab} by {request.approved_by}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {activeTab === 'Pending' && (
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <button
                                            onClick={() => handleAction(request.id, 'approve')}
                                            disabled={actionLoading === request.id + 'approve'}
                                            className="flex-1 md:flex-none px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
                                        >
                                            {actionLoading === request.id + 'approve' ? '...' : 'Approve'}
                                        </button>
                                        <button
                                            onClick={() => handleAction(request.id, 'reject')}
                                            disabled={actionLoading === request.id + 'reject'}
                                            className="flex-1 md:flex-none px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                        >
                                            {actionLoading === request.id + 'reject' ? '...' : 'Reject'}
                                        </button>
                                    </div>
                                )}

                                {activeTab !== 'Pending' && (
                                    <span className="px-3 py-1.5 border border-gray-300 rounded text-xs font-bold text-gray-600 dark:border-gray-600 dark:text-gray-300">
                                        {activeTab}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LeaveRequests;
