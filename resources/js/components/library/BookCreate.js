import React, { useState } from 'react';

const BookCreate = () => {
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        publisher: '',
        category: '',
        edition: '',
        copies: 1,
        shelf: '',
        description: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Book added successfully!');
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Add New Book</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Catalog a new book to the library inventory.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-600 mb-2 dark:text-gray-300">Book Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="Enter full book title..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    {/* Author */}
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-2 dark:text-gray-300">Author *</label>
                        <input
                            type="text"
                            name="author"
                            value={formData.author}
                            onChange={handleChange}
                            required
                            placeholder="Author name..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    {/* ISBN */}
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-2 dark:text-gray-300">ISBN *</label>
                        <input
                            type="text"
                            name="isbn"
                            value={formData.isbn}
                            onChange={handleChange}
                            required
                            placeholder="978-0-XXX-XXXXX-X"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    {/* Publisher */}
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-2 dark:text-gray-300">Publisher</label>
                        <input
                            type="text"
                            name="publisher"
                            value={formData.publisher}
                            onChange={handleChange}
                            placeholder="Publisher name..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-2 dark:text-gray-300">Category *</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">Select category...</option>
                            <option value="Literature">Literature</option>
                            <option value="Science">Science</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="History">History</option>
                            <option value="Academic">Academic / Textbooks</option>
                            <option value="Reference">Reference</option>
                            <option value="Fiction">Fiction</option>
                            <option value="Non-Fiction">Non-Fiction</option>
                        </select>
                    </div>

                    {/* Edition */}
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-2 dark:text-gray-300">Edition</label>
                        <input
                            type="text"
                            name="edition"
                            value={formData.edition}
                            onChange={handleChange}
                            placeholder="e.g., 2nd Edition"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    {/* Number of Copies */}
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-2 dark:text-gray-300">Number of Copies *</label>
                        <input
                            type="number"
                            name="copies"
                            value={formData.copies}
                            onChange={handleChange}
                            min="1"
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    {/* Shelf Location */}
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-2 dark:text-gray-300">Shelf Location</label>
                        <input
                            type="text"
                            name="shelf"
                            value={formData.shelf}
                            onChange={handleChange}
                            placeholder="e.g., A-12, Fiction-3"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-600 mb-2 dark:text-gray-300">Description / Notes</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Brief description or notes about the book..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        ></textarea>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                    <button
                        type="submit"
                        className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-lg"
                    >
                        Add Book to Inventory
                    </button>
                    <button
                        type="button"
                        className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-300"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookCreate;
