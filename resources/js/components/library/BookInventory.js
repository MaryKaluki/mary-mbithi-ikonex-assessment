import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const inputCls = "px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const BOOKS = [
    { id: 1, title: 'The Great Gatsby',       author: 'F. Scott Fitzgerald', isbn: '978-0743273565', category: 'Literature',  stock: 12, issued: 3  },
    { id: 2, title: 'To Kill a Mockingbird',  author: 'Harper Lee',          isbn: '978-0446310789', category: 'Literature',  stock: 5,  issued: 2  },
    { id: 3, title: '1984',                   author: 'George Orwell',       isbn: '978-0451524935', category: 'Sci-Fi',      stock: 8,  issued: 5  },
    { id: 4, title: 'Chemistry 101',          author: 'Dr. A. Smith',        isbn: '978-1234567890', category: 'Academic',    stock: 20, issued: 7  },
    { id: 5, title: 'Advanced Biology',       author: 'Prof. J. Wangari',    isbn: '978-9876543210', category: 'Academic',    stock: 15, issued: 10 },
    { id: 6, title: 'World History Vol. 1',   author: 'K. Mwangi',           isbn: '978-1122334455', category: 'History',     stock: 10, issued: 4  },
];

const BookInventory = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');

    const categories = ['All', ...new Set(BOOKS.map(b => b.category))];

    const filtered = BOOKS.filter(b => {
        const q = search.toLowerCase();
        const matchQ = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.isbn.includes(q);
        const matchCat = category === 'All' || b.category === category;
        return matchQ && matchCat;
    });

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Library <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Book Inventory</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Book Inventory</h1>
                </div>
                <button onClick={() => navigate('/library/books/create')}
                    className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                    + Add Book
                </button>
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap gap-2 items-end flex-shrink-0">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Search</label>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Title, author, ISBN…" className={inputCls + ' w-56'}/>
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
                        {categories.map(c => <option key={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left" style={{ minWidth: 640 }}>
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Title</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-36">Author</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-36">ISBN</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Category</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-center">Stock</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-center">Issued</th>
                                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((b, i) => (
                                <tr key={b.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                    i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                }`}>
                                    <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">
                                        {String(i + 1).padStart(2, '0')}
                                    </td>
                                    <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{b.title}</td>
                                    <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{b.author}</td>
                                    <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{b.isbn}</td>
                                    <td className="px-3 py-2">
                                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300">
                                            {b.category}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <span className={`text-xs font-bold ${b.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{b.stock}</span>
                                    </td>
                                    <td className="px-3 py-2 text-center text-xs text-slate-500 dark:text-slate-400">{b.issued}</td>
                                    <td className="px-3 py-2 text-right">
                                        <button className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="py-12 text-center text-xs text-slate-400 italic">No books match your search.</div>
                    )}
                </div>
                <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{filtered.length} book{filtered.length !== 1 ? 's' : ''}</p>
                </div>
            </div>
        </div>
    );
};

export default BookInventory;
