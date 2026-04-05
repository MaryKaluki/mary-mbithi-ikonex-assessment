import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const StaffDocuments = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        title: '',
        document_type: 'contract',
        expiry_date: '',
        expiry_alert_days: 30,
        file: null
    });

    const docTypes = [
        { value: 'contract', label: 'Employment Contract' },
        { value: 'id_card', label: 'National ID / Passport' },
        { value: 'kra_pin', label: 'KRA PIN Certificate' },
        { value: 'resume', label: 'Resume / CV' },
        { value: 'certificate', label: 'Academic Certificate' },
        { value: 'tsc_cert', label: 'TSC Certificate' },
        { value: 'good_conduct', label: 'Certificate of Good Conduct' },
        { value: 'medical', label: 'Medical Clearance' },
        { value: 'other', label: 'Other Document' }
    ];

    const fetchDocuments = () => {
        setLoading(true);
        window.axios.get(`/api/hr/staff-documents/${id}`)
            .then(res => setDocuments(res.data))
            .catch(() => setError('Failed to load documents.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchDocuments();
    }, [id]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setForm(f => ({ ...f, file: e.target.files[0] }));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!form.file) return setError('Please select a file to upload.');
        if (!form.title) return setError('Document title is required.');

        setUploading(true);
        setError('');

        const fd = new FormData();
        fd.append('title', form.title);
        fd.append('document_type', form.document_type);
        fd.append('file', form.file);
        if (form.expiry_date) fd.append('expiry_date', form.expiry_date);
        fd.append('expiry_alert_days', form.expiry_alert_days);

        try {
            await window.axios.post(`/api/hr/staff-documents/${id}`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            window.showToast?.('success', 'Document uploaded successfully.');
            
            // Reset form
            setForm({
                title: '',
                document_type: 'contract',
                expiry_date: '',
                expiry_alert_days: 30,
                file: null
            });
            if (fileInputRef.current) fileInputRef.current.value = '';
            
            fetchDocuments();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload document.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (docId) => {
        if (!window.confirm('Delete this document? This cannot be undone.')) return;
        
        try {
            await window.axios.delete(`/api/hr/staff-documents/${docId}`);
            window.showToast?.('success', 'Document deleted.');
            fetchDocuments();
        } catch (err) {
            setError('Failed to delete document.');
        }
    };

    const inputCls = "w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white";

    return (
        <div className="space-y-6 animate-page-fade pb-10">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/hr/staff')}
                    className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <div>
                    <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">Staff Documents</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage compliance docs, contracts, and certifications.</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-bold dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400">
                    ⚠ {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Upload Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 sticky top-6">
                        <h3 className="text-lg font-black text-gray-800 mb-4 dark:text-white">Upload Document</h3>
                        
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Document Type</label>
                                <select value={form.document_type} onChange={e => setForm(f => ({ ...f, document_type: e.target.value }))} className={inputCls}>
                                    {docTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Title / Description</label>
                                <input type="text" required placeholder="e.g. Signed 2026 Contract" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputCls} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Expiry Date <span className="normal-case font-normal">(Optional)</span></label>
                                    <input type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} className={inputCls} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Alert Days Before</label>
                                    <input type="number" min="1" max="90" value={form.expiry_alert_days} onChange={e => setForm(f => ({ ...f, expiry_alert_days: e.target.value }))} className={inputCls} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">File (PDF, JPG, PNG)</label>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900/30 dark:file:text-purple-400" />
                            </div>

                            <button type="submit" disabled={uploading} className="w-full py-3 mt-2 bg-purple-600 text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50">
                                {uploading ? 'Uploading...' : 'Upload Document'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Document List */}
                <div className="lg:col-span-2">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center gap-3 bg-white rounded-3xl dark:bg-gray-800">
                            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading documents...</p>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="py-20 text-center bg-white rounded-3xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 dark:bg-gray-700">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <p className="text-gray-400 font-bold uppercase text-sm tracking-widest">No Documents Uploaded</p>
                            <p className="text-xs text-gray-400 mt-1">Upload files using the panel on the left.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {documents.map(doc => (
                                <div key={doc.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col hover:border-purple-200 transition-colors group dark:bg-gray-800 dark:border-gray-700">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                            </div>
                                            <div>
                                                <p className="font-black text-sm text-gray-800 dark:text-white line-clamp-1">{doc.title}</p>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                                                    {(docTypes.find(t => t.value === doc.document_type) || {}).label || doc.document_type || 'Document'}
                                                </p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDelete(doc.id)} className="text-gray-300 hover:text-red-500 transition-colors dark:text-gray-600 dark:hover:text-red-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                    
                                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between dark:border-gray-700/50">
                                        <div>
                                            {doc.expiry_date ? (
                                                doc.is_expired ? (
                                                    <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest dark:bg-red-900/20 dark:text-red-400">Expired: {doc.expiry_date}</span>
                                                ) : doc.is_expiring_soon ? (
                                                    <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest dark:bg-orange-900/20 dark:text-orange-400">Expiring: {doc.expiry_date}</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-md bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest dark:bg-gray-700 dark:text-gray-300">Valid til {doc.expiry_date}</span>
                                                )
                                            ) : (
                                                <span className="text-[10px] text-gray-400 font-bold">Uploaded {doc.created_at}</span>
                                            )}
                                        </div>
                                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-xs font-black text-purple-600 hover:text-purple-800 uppercase tracking-widest dark:text-purple-400">View File &rarr;</a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffDocuments;
