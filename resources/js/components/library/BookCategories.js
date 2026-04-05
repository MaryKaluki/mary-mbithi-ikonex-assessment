import React, { useState } from 'react';

const BookCategories = () => {
    const [categories, setCategories] = useState([
        { id: 1, name: 'Literature', books: 1250, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' },
        { id: 2, name: 'Science', books: 890, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' },
        { id: 3, name: 'Mathematics', books: 650, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300' },
        { id: 4, name: 'History', books: 480, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300' },
        { id: 5, name: 'Academic / Textbooks', books: 1800, color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300' },
        { id: 6, name: 'Fiction', books: 920, color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300' },
        { id: 7, name: 'Non-Fiction', books: 540, color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300' },
        { id: 8, name: 'Reference', books: 320, color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300' },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [newCategory, setNewCategory] = useState('');

    const handleAdd = () => {
        if (newCategory.trim()) {
            setCategories([...categories, { id: Date.now(), name: newCategory, books: 0, color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' }]);
            setNewCategory('');
            setShowModal(false);
        }
    };

    const totalBooks = categories.reduce((a, b) => a + b.books, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Book Categories</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Organize your library by genre and section.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg w-full sm:w-auto"
                >
                    + Add Category
                </button>
            </div>

            {/* Summary */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold dark:text-gray-400">Total Categories</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{categories.length}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold dark:text-gray-400">Total Books</p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalBooks.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categories.map((cat) => (
                    <div key={cat.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${cat.color}`}>
                                {cat.name}
                            </span>
                            <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                        <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{cat.books.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Books in category</p>
                        <button className="w-full mt-4 py-2 text-purple-600 font-semibold text-sm hover:underline dark:text-purple-400">
                            View Books →
                        </button>
                    </div>
                ))}
            </div>

            {/* Add Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-md dark:bg-gray-800">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 dark:text-gray-100">Add New Category</h3>
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="Category name..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={handleAdd}
                                className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700"
                            >
                                Add Category
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookCategories;
