import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const Field = ({ label, children }) => (
    <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</label>
        {children}
    </div>
);

const BookCreate = () => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        title: '', author: '', isbn: '', publisher: '',
        category: '', edition: '', copies: 1, shelf: '', description: '',
    });

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await window.axios.post('/api/library/books', form);
            window.showToast?.('success', 'Book added to inventory.');
            navigate('/library/books');
        } catch (err) {
            window.showToast?.('error', err.response?.data?.message || 'Failed to add book.');
        } finally { setSaving(false); }
    };

    return (
        <div className="flex flex-col space-y-3 pb-6 max-w-3xl">

            {/* Header */}
            <div className="flex items-center gap-3 flex-shrink-0">
                <button onClick={() => navigate('/library/books')}
                    className="px-3 py-1.5 border border-slate-300 dark:border-gray-600 rounded-md text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                    ← Back
                </button>
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Library <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Add New Book</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Add New Book</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">

                {/* Book Details */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
                    <div className="px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Book Details</span>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <Field label="Book Title *">
                                <input required value={form.title} onChange={e => set('title', e.target.value)}
                                    placeholder="Enter full book title…" className={inputCls}/>
                            </Field>
                        </div>
                        <Field label="Author *">
                            <input required value={form.author} onChange={e => set('author', e.target.value)}
                                placeholder="Author name…" className={inputCls}/>
                        </Field>
                        <Field label="ISBN *">
                            <input required value={form.isbn} onChange={e => set('isbn', e.target.value)}
                                placeholder="978-0-XXX-XXXXX-X" className={inputCls + ' font-mono'}/>
                        </Field>
                        <Field label="Publisher">
                            <input value={form.publisher} onChange={e => set('publisher', e.target.value)}
                                placeholder="Publisher name…" className={inputCls}/>
                        </Field>
                        <Field label="Category *">
                            <select required value={form.category} onChange={e => set('category', e.target.value)} className={inputCls}>
                                <option value="">Select category…</option>
                                <option>Literature</option>
                                <option>Science</option>
                                <option>Mathematics</option>
                                <option>History</option>
                                <option>Academic / Textbooks</option>
                                <option>Reference</option>
                                <option>Fiction</option>
                                <option>Non-Fiction</option>
                            </select>
                        </Field>
                        <Field label="Edition">
                            <input value={form.edition} onChange={e => set('edition', e.target.value)}
                                placeholder="e.g. 2nd Edition" className={inputCls}/>
                        </Field>
                        <Field label="Number of Copies *">
                            <input required type="number" min="1" value={form.copies} onChange={e => set('copies', e.target.value)}
                                className={inputCls}/>
                        </Field>
                        <Field label="Shelf Location">
                            <input value={form.shelf} onChange={e => set('shelf', e.target.value)}
                                placeholder="e.g. A-12, Fiction-3" className={inputCls}/>
                        </Field>
                        <div className="md:col-span-2">
                            <Field label="Description / Notes">
                                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                                    rows={3} placeholder="Brief description or notes…"
                                    className={inputCls + ' resize-none'}/>
                            </Field>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => navigate('/library/books')}
                        className="px-4 py-1.5 border border-slate-300 dark:border-gray-600 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={saving}
                        className="px-5 py-1.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">
                        {saving ? 'Saving…' : 'Add to Inventory'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookCreate;
