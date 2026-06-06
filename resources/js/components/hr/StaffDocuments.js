import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const DOC_TYPES = [
    { value: 'contract',     label: 'Employment Contract' },
    { value: 'id_card',      label: 'National ID / Passport' },
    { value: 'kra_pin',      label: 'KRA PIN Certificate' },
    { value: 'resume',       label: 'Resume / CV' },
    { value: 'certificate',  label: 'Academic Certificate' },
    { value: 'tsc_cert',     label: 'TSC Certificate' },
    { value: 'good_conduct', label: 'Certificate of Good Conduct' },
    { value: 'medical',      label: 'Medical Clearance' },
    { value: 'other',        label: 'Other Document' },
];

const docLabel = (value) => (DOC_TYPES.find(t => t.value === value) || {}).label || value || 'Document';

const expiryBadge = (doc) => {
    if (!doc.expiry_date) return null;
    if (doc.is_expired)       return <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Expired {doc.expiry_date}</span>;
    if (doc.is_expiring_soon) return <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Expiring {doc.expiry_date}</span>;
    return <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Valid til {doc.expiry_date}</span>;
};

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const StaffDocuments = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [documents, setDocuments] = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error,     setError]     = useState('');
    const [form, setForm] = useState({
        title: '', document_type: 'contract', expiry_date: '', expiry_alert_days: 30, file: null,
    });

    const fetchDocuments = () => {
        setLoading(true);
        window.axios.get(`/api/hr/staff-documents/${id}`)
            .then(res => setDocuments(res.data))
            .catch(() => setError('Failed to load documents.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchDocuments(); }, [id]);

    const handleFileChange = (e) => {
        if (e.target.files?.[0]) setForm(f => ({ ...f, file: e.target.files[0] }));
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!form.file)  return setError('Please select a file to upload.');
        if (!form.title) return setError('Document title is required.');
        setUploading(true); setError('');
        const fd = new FormData();
        fd.append('title', form.title);
        fd.append('document_type', form.document_type);
        fd.append('file', form.file);
        if (form.expiry_date) fd.append('expiry_date', form.expiry_date);
        fd.append('expiry_alert_days', form.expiry_alert_days);
        try {
            await window.axios.post(`/api/hr/staff-documents/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            window.showToast?.('success', 'Document uploaded successfully.');
            setForm({ title: '', document_type: 'contract', expiry_date: '', expiry_alert_days: 30, file: null });
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
        } catch {
            setError('Failed to delete document.');
        }
    };

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center gap-3 flex-shrink-0">
                <button onClick={() => navigate('/hr/staff')}
                    className="px-3 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                    ← Back
                </button>
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        HR <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Staff Documents</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Staff Documents</h1>
                </div>
            </div>

            {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md flex-shrink-0">{error}</p>}

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 min-h-0">

                {/* Upload form */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm p-4 sticky top-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 pb-2 border-b border-slate-100 dark:border-gray-700">Upload Document</p>
                        <form onSubmit={handleUpload} className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Document Type</label>
                                <select value={form.document_type} onChange={e => setForm(f => ({ ...f, document_type: e.target.value }))} className={inputCls}>
                                    {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Title / Description *</label>
                                <input type="text" required placeholder="e.g. Signed 2026 Contract"
                                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputCls}/>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Expiry Date</label>
                                    <input type="date" value={form.expiry_date}
                                        onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} className={inputCls}/>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Alert Days</label>
                                    <input type="number" min="1" max="90" value={form.expiry_alert_days}
                                        onChange={e => setForm(f => ({ ...f, expiry_alert_days: e.target.value }))} className={inputCls}/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">File (PDF, JPG, PNG)</label>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-widest file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200 dark:file:bg-gray-700 dark:file:text-gray-300"/>
                            </div>
                            <button type="submit" disabled={uploading}
                                className="w-full py-2 mt-1 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors">
                                {uploading ? 'Uploading…' : 'Upload Document'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Document list */}
                <div className="lg:col-span-2 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">Loading documents…</div>
                    ) : documents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700">
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">No Documents Uploaded</p>
                            <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">Upload files using the panel on the left.</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Title</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-36">Type</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-32">Expiry</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map((doc, i) => (
                                        <tr key={doc.id}
                                            className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                                i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                            }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">
                                                {String(i + 1).padStart(2, '0')}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{doc.title}</span>
                                                {!doc.expiry_date && (
                                                    <span className="ml-2 text-[10px] text-slate-400">Uploaded {doc.created_at}</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-gray-300">
                                                    {docLabel(doc.document_type)}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2">{expiryBadge(doc)}</td>
                                            <td className="px-3 py-2 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                                                        className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">
                                                        View
                                                    </a>
                                                    <button onClick={() => handleDelete(doc.id)}
                                                        className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors">
                                                        Del
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{documents.length} document{documents.length !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffDocuments;
