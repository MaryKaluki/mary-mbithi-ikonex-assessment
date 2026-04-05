import React, { useState, useEffect, useRef } from 'react';
import { SkeletonLoader } from '../common/Loader';

const CATEGORIES = ['All Files', 'Policies', 'Exams', 'Finance', 'HR', 'General'];

const fileIcon = (type) => {
    const icons = {
        pdf: 'text-red-500', xls: 'text-green-600', doc: 'text-blue-600', file: 'text-gray-500',
    };
    return icons[type] || icons.file;
};

const DocumentRepository = () => {
    const [activeCategory, setActiveCategory] = useState('All Files');
    const [files, setFiles] = useState([]);
    const [quota, setQuota] = useState({ used_mb: 0, limit_mb: 0, percent: 0 });
    const [isLoading, setIsLoading] = useState(true);
    
    // Upload Modal State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadCategory, setUploadCategory] = useState('General');
    const [uploadVisibility, setUploadVisibility] = useState('all_teachers');
    const [visibleToUserId, setVisibleToUserId] = useState('');
    const [teachers, setTeachers] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchFiles();
        fetchTeachers();
    }, [activeCategory]);

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
        if (e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setIsUploadModalOpen(true);
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        if (uploadVisibility === 'specific_teacher' && !visibleToUserId) {
            window.showToast('error', 'Please select a specific teacher.');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('category', uploadCategory);
        formData.append('visibility_type', uploadVisibility);
        if (uploadVisibility === 'specific_teacher') {
            formData.append('visible_to_user_id', visibleToUserId);
        }

        try {
            await window.axios.post('/api/admin/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            window.showToast('success', 'Document uploaded successfully.');
            setIsUploadModalOpen(false);
            setSelectedFile(null);
            fetchFiles();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to upload document. Maximum 20MB allowed.';
            window.showToast('error', msg);
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
            // Refresh to update quota
            fetchFiles();
        } catch {
            window.showToast('error', 'Failed to delete document. Ensure you have the right permissions.');
        }
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header & Quota */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Document Hub</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload and manage secure school files.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 items-center">
                    {/* Quota Bar */}
                    {quota.limit_mb > 0 && (
                        <div className="w-full sm:w-64">
                            <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                                <span>Storage Quota</span>
                                <span>{quota.used_mb}MB / {quota.limit_mb}MB</span>
                            </div>
                            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${quota.percent > 90 ? 'bg-red-500' : 'bg-primary'}`} 
                                    style={{ width: `${Math.min(quota.percent, 100)}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2 w-full sm:w-auto">
                        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg" />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 whitespace-nowrap w-full sm:w-auto flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                            Upload File
                        </button>
                    </div>
                </div>
            </div>

            {/* Category tabs */}
            <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                            activeCategory === cat
                                ? 'border-primary text-primary dark:text-primary-light border-b-2'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                {isLoading ? (
                    <div className="p-6"><SkeletonLoader type="table" /></div>
                ) : files.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        </div>
                        <p className="text-gray-500 font-bold dark:text-gray-400">No documents found in this category.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">File Name</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Category</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Visibility</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Uploaded By</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {files.map((file) => (
                                    <tr key={file.id} className="hover:bg-primary/5 dark:hover:bg-gray-700/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 tracking-wider w-10 text-center ${fileIcon(file.type)}`}>{file.type}</span>
                                                <span className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate max-w-xs">{file.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{file.category}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {file.visibility === 'All Teachers' ? (
                                                <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                    All Teachers
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                                    {file.visibility}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-300">
                                            {file.owner} <span className="text-xs font-normal text-gray-400 block">{file.size}</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-gray-500 dark:text-gray-400">{file.date}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <a href={file.url} target="_blank" rel="noreferrer" className="text-[11px] font-black uppercase text-primary hover:text-primary-dark transition-colors">
                                                    Download
                                                </a>
                                                <button onClick={() => handleDelete(file.id)} className="text-[11px] font-black uppercase text-red-500 hover:text-red-700 transition-colors">
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Upload Settings Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Upload Settings</h3>
                            <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleUploadSubmit} className="p-6 space-y-6">
                            {selectedFile && (
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{selectedFile.name}</p>
                                        <p className="text-xs text-gray-500 font-mono">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-black uppercase text-gray-400 mb-2">Category</label>
                                <select 
                                    value={uploadCategory} 
                                    onChange={e => setUploadCategory(e.target.value)}
                                    className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm font-semibold bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    {CATEGORIES.filter(c => c !== 'All Files').map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase text-gray-400 mb-2">Share With</label>
                                <select 
                                    value={uploadVisibility} 
                                    onChange={e => setUploadVisibility(e.target.value)}
                                    className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm font-semibold bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="all_teachers">All Staff (Everyone)</option>
                                    <option value="specific_teacher">Specific Staff Member</option>
                                </select>
                            </div>

                            {uploadVisibility === 'specific_teacher' && (
                                <div className="animate-fade-in-up">
                                    <label className="block text-xs font-black uppercase text-gray-400 mb-2">Select Staff</label>
                                    <select 
                                        value={visibleToUserId} 
                                        onChange={e => setVisibleToUserId(e.target.value)}
                                        className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm font-semibold bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        required
                                    >
                                        <option value="" disabled>-- Select Staff --</option>
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={isUploading}
                                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30 disabled:opacity-50"
                            >
                                {isUploading ? 'Uploading...' : 'Confirm Upload'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentRepository;
