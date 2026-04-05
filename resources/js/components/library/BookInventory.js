import React, { useState } from 'react';

const BookInventory = () => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Book Inventory</h2>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Search ISBN, Title..."
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-64 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg hover:-translate-y-0.5 transform w-full sm:w-auto">
                        + Add Book
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0743273565', stock: 12, category: 'Literature' },
                    { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '978-0446310789', stock: 5, category: 'Literature' },
                    { title: '1984', author: 'George Orwell', isbn: '978-0451524935', stock: 8, category: 'Science Fiction' },
                    { title: 'Chemistry 101', author: 'Dr. A. Smith', isbn: '978-1234567890', stock: 20, category: 'Academic' },
                ].map((book, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer dark:bg-gray-800 dark:border-gray-700">
                        <div className="h-40 bg-gray-100 rounded-xl mb-4 flex items-center justify-center text-gray-400 group-hover:bg-purple-50 group-hover:text-purple-400 transition-colors dark:bg-gray-700 dark:group-hover:bg-gray-600">
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1 truncate dark:text-gray-100">{book.title}</h3>
                        <p className="text-sm text-gray-500 mb-3 dark:text-gray-400">{book.author}</p>
                        <div className="flex justify-between items-center text-sm">
                            <span className="px-2 py-1 bg-gray-100 rounded text-gray-600 font-medium dark:bg-gray-700 dark:text-gray-300">{book.category}</span>
                            <span className={`font-bold ${book.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>{book.stock} in stock</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BookInventory;
