import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from './Loader';

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const TYPE_BADGE = {
    Academic:  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    General:   'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300',
    Event:     'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    Finance:   'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    Health:    'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    Transport: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
};

const PostNoticeModal = ({ onClose, onSaved }) => {
    const [form, setForm]   = useState({ title: '', content: '', type: 'General', published_at: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError]   = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setError(null);
        try {
            await window.axios.post('/api/notices', form);
            onSaved(); onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post notice.');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg border border-slate-200 dark:border-gray-700">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 rounded-t-lg">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wide">Post New Notice</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none transition-colors">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {error && <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">{error}</p>}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Title *</label>
                        <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                            placeholder="Notice title…" className={inputCls}/>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Category</label>
                            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className={inputCls}>
                                {Object.keys(TYPE_BADGE).map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Publish Date</label>
                            <input type="date" value={form.published_at}
                                onChange={e => setForm({...form, published_at: e.target.value})} className={inputCls}/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Content *</label>
                        <textarea required rows={4} value={form.content}
                            onChange={e => setForm({...form, content: e.target.value})}
                            placeholder="Notice content…" className={inputCls + ' resize-none'}/>
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button type="submit" disabled={saving}
                            className="flex-1 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">
                            {saving ? 'Posting…' : 'Post Notice'}
                        </button>
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2 border border-slate-300 dark:border-gray-600 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                            Cancel
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
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchNotices(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this notice?')) return;
        try {
            await window.axios.delete(`/api/notices/${id}`);
            setNotices(prev => prev.filter(n => n.id !== id));
            window.showToast?.('success', 'Notice deleted.');
        } catch { window.showToast?.('error', 'Could not delete notice.'); }
    };

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">
            {showModal && <PostNoticeModal onClose={() => setShowModal(false)} onSaved={fetchNotices}/>}

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Dashboard <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Notice Board</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">
                        Notice Board
                        {!loading && <span className="ml-2 text-xs font-normal text-slate-400">— {notices.length} notices</span>}
                    </h1>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                    + Post New Notice
                </button>
            </div>

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {loading ? (
                    <div className="p-6"><SkeletonLoader type="table"/></div>
                ) : notices.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16">
                        <p className="text-slate-400 text-sm mb-4">No notices posted yet.</p>
                        <button onClick={() => setShowModal(true)}
                            className="px-4 py-2 bg-primary text-white font-bold text-sm rounded-md hover:bg-primary/90 transition-all duration-200">
                            + Post First Notice
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left" style={{ minWidth: 680 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Announcement</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Category</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-36">Posted By</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28 text-right">Date</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {notices.map((notice, i) => (
                                        <React.Fragment key={notice.id}>
                                            <tr className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors cursor-default ${
                                                i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                            }`}>
                                                <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                                <td className="px-3 py-2 max-w-xs">
                                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">{notice.title}</p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{notice.content}</p>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${TYPE_BADGE[notice.type] || TYPE_BADGE.General}`}>
                                                        {notice.type}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{notice.author}</td>
                                                <td className="px-3 py-2 text-right text-[10px] font-mono text-slate-400 whitespace-nowrap">{notice.published_at}</td>
                                                <td className="px-3 py-2 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button onClick={() => setExpanded(expanded === notice.id ? null : notice.id)}
                                                            className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">
                                                            {expanded === notice.id ? 'Hide' : 'View'}
                                                        </button>
                                                        <button onClick={() => handleDelete(notice.id)}
                                                            className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors">
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expanded === notice.id && (
                                                <tr className="bg-slate-50/50 dark:bg-gray-700/20 border-b border-slate-100 dark:border-gray-700/60">
                                                    <td colSpan={6} className="px-3 py-3">
                                                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{notice.content}</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{notices.length} notices</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default NoticeBoard;
