import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const AddSponsorModal = ({ onClose, onSaved }) => {
    const [form, setForm] = useState({
        student_id: '', sponsor_name: '', sponsor_contact: '',
        amount_per_term: '', covers: '', start_term: '', start_year: new Date().getFullYear().toString(),
        end_term: '', end_year: '', notes: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError]   = useState(null);
    const setField = (f, v) => setForm(p => ({ ...p, [f]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setError(null);
        try {
            await window.axios.post('/api/finance/sponsorships', {
                ...form,
                student_id:      parseInt(form.student_id),
                amount_per_term: parseInt(form.amount_per_term),
            });
            window.showToast?.('success', 'Sponsorship added.');
            onSaved(); onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save.');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-slate-200 dark:border-gray-700 w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 rounded-t-lg flex-shrink-0">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wide">Add Sponsorship</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-3 overflow-y-auto flex-1">
                    {error && <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">{error}</p>}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Student ID *</label>
                        <input required type="number" value={form.student_id} onChange={e => setField('student_id', e.target.value)} className={inputCls}/>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Sponsor Name *</label>
                        <input required value={form.sponsor_name} onChange={e => setField('sponsor_name', e.target.value)} className={inputCls}/>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Contact</label>
                            <input value={form.sponsor_contact} onChange={e => setField('sponsor_contact', e.target.value)} className={inputCls}/>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Amount / Term (KSh) *</label>
                            <input required type="number" value={form.amount_per_term} onChange={e => setField('amount_per_term', e.target.value)} className={inputCls}/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Covers</label>
                        <input value={form.covers} onChange={e => setField('covers', e.target.value)} placeholder="e.g. Full fees, Tuition only" className={inputCls}/>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Start Trm</label>
                            <select value={form.start_term} onChange={e => setField('start_term', e.target.value)} className={inputCls}>
                                <option value="">—</option>
                                <option value="1">T1</option><option value="2">T2</option><option value="3">T3</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Start Yr</label>
                            <input value={form.start_year} onChange={e => setField('start_year', e.target.value)} className={inputCls}/>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">End Trm</label>
                            <select value={form.end_term} onChange={e => setField('end_term', e.target.value)} className={inputCls}>
                                <option value="">—</option>
                                <option value="1">T1</option><option value="2">T2</option><option value="3">T3</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">End Yr</label>
                            <input value={form.end_year} onChange={e => setField('end_year', e.target.value)} className={inputCls}/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Notes</label>
                        <textarea rows={2} value={form.notes} onChange={e => setField('notes', e.target.value)} className={inputCls + ' resize-none'}/>
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button type="submit" disabled={saving}
                            className="flex-1 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">
                            {saving ? 'Saving…' : 'Save Sponsorship'}
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

const Sponsorships = () => {
    const [sponsors, setSponsors] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [showModal, setShowModal] = useState(false);

    const fetchSponsors = async () => {
        setLoading(true);
        try {
            const res = await window.axios.get('/api/finance/sponsorships');
            setSponsors(res.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchSponsors(); }, []);

    const handleDeactivate = async (id) => {
        if (!window.confirm('Deactivate this sponsorship?')) return;
        try {
            await window.axios.delete(`/api/finance/sponsorships/${id}`);
            setSponsors(p => p.filter(s => s.id !== id));
            window.showToast?.('success', 'Sponsorship deactivated.');
        } catch { window.showToast?.('error', 'Could not deactivate.'); }
    };

    const totalPerTerm = sponsors.filter(s => s.active).reduce((a, s) => a + Number(s.amount_per_term), 0);

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">
            {showModal && <AddSponsorModal onClose={() => setShowModal(false)} onSaved={fetchSponsors}/>}

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Finance <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Sponsorships</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Sponsorship Management</h1>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                    + Add Sponsorship
                </button>
            </div>

            {/* Stats strip */}
            {!loading && (
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{sponsors.filter(s => s.active).length}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20">
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">KSh {totalPerTerm.toLocaleString()}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Per Term</span>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {loading ? (
                    <div className="p-6"><SkeletonLoader type="table"/></div>
                ) : sponsors.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16">
                        <p className="text-slate-400 text-sm mb-4">No sponsorships recorded.</p>
                        <button onClick={() => setShowModal(true)}
                            className="px-4 py-2 bg-primary text-white font-bold text-sm rounded-md hover:bg-primary/90 transition-colors">
                            + Add First Sponsorship
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left" style={{ minWidth: 860 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Student</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20">Grade</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Sponsor</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28 text-right">Amt/Term</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-32">Covers</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Period</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-center">Active</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-right">Del</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sponsors.map((sp, i) => (
                                        <tr key={sp.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                            i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                        }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                            <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{sp.first_name} {sp.last_name}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500">{sp.grade_level}</td>
                                            <td className="px-3 py-2 text-xs text-slate-700 dark:text-slate-200">{sp.sponsor_name}</td>
                                            <td className="px-3 py-2 text-right text-xs font-bold font-mono text-emerald-600">KSh {Number(sp.amount_per_term).toLocaleString()}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500">{sp.covers || '—'}</td>
                                            <td className="px-3 py-2 text-[10px] text-slate-400">
                                                {sp.start_year ? `T${sp.start_term || 1} ${sp.start_year}` : '—'}
                                                {sp.end_year ? ` → T${sp.end_term || 3} ${sp.end_year}` : ''}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`inline-block w-2 h-2 rounded-full ${sp.active ? 'bg-emerald-500' : 'bg-slate-300'}`}/>
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                {sp.active && (
                                                    <button onClick={() => handleDeactivate(sp.id)}
                                                        className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors">Del</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{sponsors.length} sponsorship{sponsors.length !== 1 ? 's' : ''}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Sponsorships;
