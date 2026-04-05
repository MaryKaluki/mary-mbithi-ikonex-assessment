import React, { useState, useEffect } from 'react';

const TYPE_COLORS = {
    Academic:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    General:   'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    Event:     'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    Finance:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    Health:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    Transport: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
};

const PostNoticeModal = ({ onClose, onSaved }) => {
    const [form, setForm] = useState({ title: '', content: '', type: 'General', published_at: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await window.axios.post('/api/notices', form);
            onSaved();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post notice.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-base font-bold text-gray-800 dark:text-white">Post New Notice</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Title</label>
                        <input
                            required
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                            placeholder="Notice title..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Category</label>
                        <select
                            value={form.type}
                            onChange={e => setForm({ ...form, type: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                            {Object.keys(TYPE_COLORS).map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Content</label>
                        <textarea
                            required
                            rows={4}
                            value={form.content}
                            onChange={e => setForm({ ...form, content: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                            placeholder="Notice content..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Publish Date</label>
                        <input
                            type="date"
                            value={form.published_at}
                            onChange={e => setForm({ ...form, published_at: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400">Cancel</button>
                        <button type="submit" disabled={saving} className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-60">
                            {saving ? 'Posting...' : 'Post Notice'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const NoticeBoard = () => {
    const [notices, setNotices]     = useState([]);
    const [loading, setLoading]     = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [expanded, setExpanded]   = useState(null);

    const fetchNotices = async () => {
        setLoading(true);
        try {
            const res = await window.axios.get('/api/notices');
            setNotices(res.data);
        } catch {
            // silently fail — notices just won't load
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNotices(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this notice?')) return;
        try {
            await window.axios.delete(`/api/notices/${id}`);
            setNotices(prev => prev.filter(n => n.id !== id));
            window.showToast?.('success', 'Notice deleted.');
        } catch {
            window.showToast?.('error', 'Could not delete notice.');
        }
    };

    return (
        <div className="space-y-6">
            {showModal && (
                <PostNoticeModal
                    onClose={() => setShowModal(false)}
                    onSaved={fetchNotices}
                />
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Notice Board</h2>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">School-wide announcements and updates</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-sm"
                >
                    + Post New Notice
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                ) : notices.length === 0 ? (
                    <div className="text-center py-20">
                        <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-sm text-gray-400">No notices posted yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-600">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Announcement</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Posted By</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider text-right">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {notices.map((notice) => (
                                    <React.Fragment key={notice.id}>
                                        <tr className="group hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-5 max-w-xs">
                                                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 group-hover:text-primary transition-colors">{notice.title}</h3>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">{notice.content}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${TYPE_COLORS[notice.type] || TYPE_COLORS.General}`}>
                                                    {notice.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{notice.author}</span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{notice.published_at}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => setExpanded(expanded === notice.id ? null : notice.id)}
                                                        className="text-primary font-bold text-[10px] uppercase hover:underline"
                                                    >
                                                        {expanded === notice.id ? 'Hide' : 'View'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(notice.id)}
                                                        className="text-red-400 font-bold text-[10px] uppercase hover:underline"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expanded === notice.id && (
                                            <tr className="bg-gray-50/50 dark:bg-gray-700/20">
                                                <td colSpan={5} className="px-6 py-4">
                                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{notice.content}</p>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NoticeBoard;
