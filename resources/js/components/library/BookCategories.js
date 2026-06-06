import React, { useState } from 'react';

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const INIT = [
    { id: 1, name: 'Literature',          books: 1250 },
    { id: 2, name: 'Science',             books: 890  },
    { id: 3, name: 'Mathematics',         books: 650  },
    { id: 4, name: 'History',             books: 480  },
    { id: 5, name: 'Academic/Textbooks',  books: 1800 },
    { id: 6, name: 'Fiction',             books: 920  },
    { id: 7, name: 'Non-Fiction',         books: 540  },
    { id: 8, name: 'Reference',           books: 320  },
];

const BookCategories = () => {
    const [categories, setCategories] = useState(INIT);
    const [showModal, setShowModal] = useState(false);
    const [newName, setNewName] = useState('');

    const handleAdd = () => {
        if (!newName.trim()) return;
        setCategories(c => [...c, { id: Date.now(), name: newName.trim(), books: 0 }]);
        setNewName('');
        setShowModal(false);
    };

    const handleDelete = (id) => {
        if (!window.confirm('Delete this category?')) return;
        setCategories(c => c.filter(x => x.id !== id));
    };

    const total = categories.reduce((a, b) => a + b.books, 0);

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Library <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Book Categories</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Book Categories</h1>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                    + Add Category
                </button>
            </div>

            {/* Stats strip */}
            <div className="flex gap-2 flex-shrink-0">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                    <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{categories.length}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Categories</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                    <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{total.toLocaleString()}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Books</span>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left" style={{ minWidth: 400 }}>
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Category Name</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-right">Books</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat, i) => (
                                <tr key={cat.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                    i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                }`}>
                                    <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">
                                        {String(i + 1).padStart(2, '0')}
                                    </td>
                                    <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{cat.name}</td>
                                    <td className="px-3 py-2 text-right text-xs font-bold font-mono text-slate-700 dark:text-slate-200">
                                        {cat.books.toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <button onClick={() => handleDelete(cat.id)}
                                            className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors">
                                            Del
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{categories.length} categories</p>
                </div>
            </div>

            {/* Add Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-xl w-full max-w-sm">
                        <div className="px-5 py-3.5 bg-slate-50 dark:bg-gray-900/50 border-b border-slate-200 dark:border-gray-700 rounded-t-lg flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-gray-100">Add Category</h3>
                            <button onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors text-lg leading-none">✕</button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Category Name</label>
                                <input value={newName} onChange={e => setNewName(e.target.value)}
                                    placeholder="e.g. Geography" className={inputCls}
                                    onKeyDown={e => e.key === 'Enter' && handleAdd()}/>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setShowModal(false)}
                                    className="px-4 py-1.5 border border-slate-300 dark:border-gray-600 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleAdd}
                                    className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                                    Add Category
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookCategories;
