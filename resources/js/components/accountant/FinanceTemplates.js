import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const VARIABLES = ['{student_name}', '{balance}', '{amount}', '{due_date}', '{term}', '{year}', '{school_name}'];

const typeBadge = (t) =>
    t === 'sms'   ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
    t === 'email' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                    'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';

const FinanceTemplates = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [selected, setSelected]   = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [saving, setSaving]       = useState(false);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const res = await window.axios.get('/api/finance/templates').catch(() => ({ data: [] }));
            setTemplates(res.data.data || res.data || []);
        } catch { setTemplates([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTemplates(); }, []);

    const selectTemplate = (t) => {
        setSelected(t);
        setEditTitle(t.title || t.name || '');
        setEditContent(t.content || t.body || '');
    };

    const handleSave = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            await window.axios.put(`/api/finance/templates/${selected.id}`, {
                title:   editTitle,
                content: editContent,
            });
            window.showToast?.('success', 'Template saved.');
            fetchTemplates();
        } catch (err) {
            window.showToast?.('error', err.response?.data?.message || 'Could not save template.');
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!selected) return;
        if (!window.confirm('Delete this template?')) return;
        try {
            await window.axios.delete(`/api/finance/templates/${selected.id}`);
            setSelected(null);
            fetchTemplates();
            window.showToast?.('success', 'Template deleted.');
        } catch { window.showToast?.('error', 'Could not delete template.'); }
    };

    const handleNew = async () => {
        try {
            const res = await window.axios.post('/api/finance/templates', {
                title:   'New Template',
                content: 'Dear Parent, {student_name}…',
                type:    'sms',
            });
            fetchTemplates();
            selectTemplate(res.data);
        } catch { window.showToast?.('error', 'Could not create template.'); }
    };

    const insertVariable = (v) => {
        setEditContent(prev => prev + v);
    };

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Finance <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Finance Templates</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Communication Templates</h1>
                </div>
            </div>

            <div className="flex gap-3 flex-1 min-h-0">

                {/* Template list */}
                <div className="w-64 flex-shrink-0 flex flex-col gap-2 overflow-y-auto">
                    {loading ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4">
                            <SkeletonLoader type="list"/>
                        </div>
                    ) : (
                        <>
                            {templates.map(t => (
                                <button key={t.id} onClick={() => selectTemplate(t)}
                                    className={`text-left px-3 py-2.5 rounded-lg border transition-colors ${
                                        selected?.id === t.id
                                            ? 'bg-primary/10 border-primary text-primary dark:bg-primary/20'
                                            : 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 hover:border-slate-400'
                                    }`}>
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-0.5 truncate">{t.title || t.name}</p>
                                    <p className="text-[10px] text-slate-400 line-clamp-2">{t.content || t.body}</p>
                                    <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${typeBadge(t.type)}`}>
                                        {t.type}
                                    </span>
                                </button>
                            ))}
                            <button onClick={handleNew}
                                className="px-3 py-2.5 rounded-lg border-2 border-dashed border-slate-300 dark:border-gray-600 text-xs font-bold uppercase tracking-wider text-slate-400 hover:border-primary hover:text-primary transition-colors">
                                + New Template
                            </button>
                        </>
                    )}
                </div>

                {/* Editor */}
                <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col min-h-0">
                    {selected ? (
                        <>
                            <div className="flex-shrink-0 px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700 rounded-t-lg">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Editing: {selected.title || selected.name}</span>
                            </div>
                            <div className="flex-1 p-4 flex flex-col gap-3 overflow-auto">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Template Name</label>
                                    <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className={inputCls}/>
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Message Content</label>
                                    <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                                        rows="8" className={inputCls + ' resize-none font-mono flex-1'}/>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {VARIABLES.map(v => (
                                            <button key={v} onClick={() => insertVariable(v)}
                                                className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-mono hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors">
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button onClick={handleSave} disabled={saving}
                                        className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">
                                        {saving ? 'Saving…' : 'Save Changes'}
                                    </button>
                                    <button onClick={handleDelete}
                                        className="px-4 py-2 border border-red-300 text-red-500 text-xs font-bold uppercase tracking-wider rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                            <p className="text-xs font-bold uppercase tracking-wider">Select a template to edit</p>
                            <p className="text-[10px] mt-1">or create a new one from the left panel</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinanceTemplates;
