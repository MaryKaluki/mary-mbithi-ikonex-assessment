import React, { useState, useEffect, useRef } from 'react';
import { SkeletonLoader } from '../common/Loader';

const CATEGORIES = ['All Files', 'Policies', 'Exams', 'Finance', 'HR', 'General'];

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const fileTypeCls = (type) => {
    const map = { pdf: 'text-red-500', xls: 'text-green-600', doc: 'text-blue-600' };
    return map[type] || 'text-slate-500';
};

const DocumentRepository = () => {
    const [activeCategory, setActiveCategory]         = useState('All Files');
    const [files, setFiles]                           = useState([]);
    const [quota, setQuota]                           = useState({ used_mb: 0, limit_mb: 0, percent: 0 });
    const [isLoading, setIsLoading]                   = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen]   = useState(false);
    const [isUploading, setIsUploading]               = useState(false);
    const [uploadCategory, setUploadCategory]         = useState('General');
    const [uploadVisibility, setUploadVisibility]     = useState('all_teachers');
    const [visibleToUserId, setVisibleToUserId]       = useState('');
    const [teachers, setTeachers]                     = useState([]);
    const [selectedFile, setSelectedFile]             = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => { fetchFiles(); fetchTeachers(); }, [activeCategory]);

    const fetchFiles = async () => {
        setIsLoading(true);
        try {
            const res = await window.axios.get(`/api/admin/documents?category=${activeCategory}`);
            setFiles(res.data.documents || []);
            if (res.data.quota) setQuota(res.data.quota);
        } catch {
            window.showToast('error', 'Failed to load documents.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const res = await window.axios.get('/api/admin/documents/teachers');
            setTeachers(res.data || []);
        } catch { /* silent */ }
    };

    const handleFileSelect = (e) => {
        if (e.target.files[0]) { setSelectedFile(e.target.files[0]); setIsUploadModalOpen(true); }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;
        if (uploadVisibility === 'specific_teacher' && !visibleToUserId) {
            window.showToast('error', 'Please select a specific teacher.'); return;
        }
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('category', uploadCategory);
        formData.append('visibility_type', uploadVisibility);
        if (uploadVisibility === 'specific_teacher') formData.append('visible_to_user_id', visibleToUserId);
        try {
            await window.axios.post('/api/admin/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            window.showToast('success', 'Document uploaded successfully.');
            setIsUploadModalOpen(false);
            setSelectedFile(null);
            fetchFiles();
        } catch (err) {
            window.showToast('error', err.response?.data?.message || 'Failed to upload. Max 20MB.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this document?')) return;
        try {
            await window.axios.delete(`/api/admin/documents/${id}`);
            setFiles(prev => prev.filter(f => f.id !== id));
            window.showToast('success', 'Document deleted.');
            fetchFiles();
        } catch { window.showToast('error', 'Failed to delete document.'); }
    };

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Admin <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Document Repository</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Document Hub</h1>
                </div>
                <div className="flex items-center gap-3">
                    {quota.limit_mb > 0 && (
                        <div className="w-40">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                                <span>Storage</span>
                                <span>{quota.used_mb}MB / {quota.limit_mb}MB</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className={`h-full ${quota.percent > 90 ? 'bg-red-500' : 'bg-primary'}`}
                                    style={{ width: `${Math.min(quota.percent, 100)}%` }}/>
                            </div>
                        </div>
                    )}
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg"/>
                    <button onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                        + Upload File
                    </button>
                </div>
            </div>

            {/* Category tabs */}
            <div className="flex border-b border-slate-200 dark:border-gray-700 flex-shrink-0 overflow-x-auto">
                {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors ${
                            activeCategory === cat
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {isLoading ? (
                    <div className="p-6"><SkeletonLoader type="table"/></div>
                ) : files.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                        <p className="text-xs font-bold uppercase tracking-wider">No documents in this category</p>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left" style={{ minWidth: 680 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">File Name</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Category</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28 text-center">Visibility</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-32">Uploaded By</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Date</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {files.map((file, i) => (
                                        <tr key={file.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group ${
                                            i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                        }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-gray-700 tracking-wider ${fileTypeCls(file.type)}`}>{file.type}</span>
                                                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate max-w-xs">{file.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-[10px] text-slate-500 dark:text-slate-400">{file.category}</td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                                    file.visibility === 'All Teachers'
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                                }`}>{file.visibility}</span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{file.owner}</p>
                                                <p className="text-[10px] text-slate-400">{file.size}</p>
                                            </td>
                                            <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{file.date}</td>
                                            <td className="px-3 py-2 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <a href={file.url} target="_blank" rel="noreferrer"
                                                        className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">
                                                        Download
                                                    </a>
                                                    <button onClick={() => handleDelete(file.id)}
                                                        className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors">
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{files.length} documents</p>
                        </div>
                    </>
                )}
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-slate-200 dark:border-gray-700 w-full max-w-sm">
                        <div className="px-5 py-3.5 bg-slate-50 dark:bg-gray-900/50 border-b border-slate-100 dark:border-gray-700 rounded-t-lg flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">Upload Settings</span>
                            <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                        </div>
                        <form onSubmit={handleUploadSubmit} className="p-5 flex flex-col gap-3">
                            {selectedFile && (
                                <div className="px-3 py-2 bg-slate-50 dark:bg-gray-700 rounded-md">
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{selectedFile.name}</p>
                                    <p className="text-[10px] font-mono text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Category</label>
                                <select value={uploadCategory} onChange={e => setUploadCategory(e.target.value)} className={inputCls}>
                                    {CATEGORIES.filter(c => c !== 'All Files').map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Share With</label>
                                <select value={uploadVisibility} onChange={e => setUploadVisibility(e.target.value)} className={inputCls}>
                                    <option value="all_teachers">All Staff</option>
                                    <option value="specific_teacher">Specific Staff Member</option>
                                </select>
                            </div>
                            {uploadVisibility === 'specific_teacher' && (
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Select Staff</label>
                                    <select value={visibleToUserId} onChange={e => setVisibleToUserId(e.target.value)} className={inputCls} required>
                                        <option value="">-- Select Staff --</option>
                                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="flex gap-2 mt-1">
                                <button type="submit" disabled={isUploading}
                                    className="flex-1 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors">
                                    {isUploading ? 'Uploading…' : 'Confirm Upload'}
                                </button>
                                <button type="button" onClick={() => setIsUploadModalOpen(false)}
                                    className="flex-1 py-2 border border-slate-300 dark:border-gray-600 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentRepository;
