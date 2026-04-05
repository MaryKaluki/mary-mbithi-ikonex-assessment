import React, { useEffect, useState } from 'react';

const categoryStyle = (cat) => {
    if (cat === 'Positive')  return { bg: 'bg-green-100 text-green-700',  dot: 'bg-green-500',  border: 'border-green-200 dark:border-green-800' };
    if (cat === 'Reminder')  return { bg: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500', border: 'border-yellow-200 dark:border-yellow-800' };
    if (cat === 'Concern')   return { bg: 'bg-red-100 text-red-700',      dot: 'bg-red-500',    border: 'border-red-200 dark:border-red-800' };
    return { bg: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400', border: 'border-gray-200 dark:border-gray-700' };
};

const FILTERS = ['All', 'Positive', 'Reminder', 'Concern'];

const ParentalEngagement = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [filter, setFilter]     = useState('All');

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        fetch('/api/parent/engagement', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => { setComments(d.comments || []); setLoading(false); })
            .catch(() => { setError('Failed to load messages.'); setLoading(false); });
    }, []);

    const filtered = filter === 'All' ? comments : comments.filter(c => c.category === filter);
    const unread   = comments.filter(c => !c.is_read_by_parent).length;

    if (loading) return (
        <div className="space-y-3 animate-pulse">
            <div className="h-12 bg-white rounded-2xl"></div>
            {[1,2,3].map(i => <div key={i} className="h-28 bg-white rounded-2xl"></div>)}
        </div>
    );
    if (error) return <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl text-red-600 text-sm">{error}</div>;

    return (
        <div className="space-y-4">
            {/* Unread banner */}
            {unread > 0 && (
                <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl px-5 py-3" style={{background:'var(--primary-color)1a',borderColor:'var(--primary-color)33'}}>
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" style={{background:'var(--primary-color)'}}></span>
                    <p className="text-sm font-bold text-purple-700 dark:text-purple-300" style={{color:'var(--primary-color)'}}>
                        {unread} new teacher message{unread !== 1 ? 's' : ''}
                    </p>
                </div>
            )}

            {/* Filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {FILTERS.map(f => {
                    const count = f === 'All' ? comments.length : comments.filter(c => c.category === f).length;
                    return (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${f === filter ? 'text-white shadow-md bg-purple-600' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}
                            style={f === filter ? { background: 'var(--primary-color)' } : {}}
                        >
                            {f}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${f === filter ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* Comment cards */}
            {filtered.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                    </div>
                    <p className="font-bold text-gray-600 dark:text-gray-300">No messages yet</p>
                    <p className="text-xs text-gray-400 mt-1">Teacher comments will appear here</p>
                </div>
            ) : filtered.map((comment, i) => {
                const cs = categoryStyle(comment.category);
                return (
                    <div
                        key={i}
                        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border overflow-hidden transition-all ${!comment.is_read_by_parent ? cs.border : 'border-gray-100 dark:border-gray-700'}`}
                    >
                        <div className="flex items-start gap-4 p-5">
                            {/* Teacher avatar */}
                            <div className="w-11 h-11 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0" style={{background:'var(--primary-color)'}}>
                                {(comment.teacher_name || 'T').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 flex-wrap">
                                    <div>
                                        <p className="font-bold text-sm text-gray-800 dark:text-gray-100">{comment.teacher_name || 'Teacher'}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">re: {comment.student_name}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {!comment.is_read_by_parent && (
                                            <span className={`w-2 h-2 rounded-full ${cs.dot}`}></span>
                                        )}
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${cs.bg}`}>{comment.category}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed italic">
                                    "{comment.comment}"
                                </p>
                                <p className="text-[10px] text-gray-400 mt-2">
                                    {comment.created_at ? new Date(comment.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : ''}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ParentalEngagement;
