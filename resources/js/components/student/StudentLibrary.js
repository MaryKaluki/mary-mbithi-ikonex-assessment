import React from 'react';

const StudentLibrary = () => {
    const borrowedBooks = [
        { id: 1, title: 'Introduction to Physics', author: 'John Maxwell', isbn: '978-0743273565', borrowDate: '2024-10-15', dueDate: '2024-11-05', status: 'active' },
        { id: 2, title: 'World History: A Journey', author: 'Sarah Collins', isbn: '978-0446310789', borrowDate: '2024-10-20', dueDate: '2024-11-10', status: 'active' },
    ];

    const borrowHistory = [
        { id: 3, title: 'Basic Chemistry', author: 'Dr. Lee Chen', borrowDate: '2024-09-01', returnDate: '2024-09-20' },
        { id: 4, title: 'English Literature', author: 'Jane Austen', borrowDate: '2024-08-15', returnDate: '2024-09-01' },
    ];

    const getDaysRemaining = (dueDate) => {
        const due = new Date(dueDate);
        const today = new Date();
        const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const getDueColor = (days) => {
        if (days <= 0) return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
        if (days <= 3) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">My Library Books</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Track your borrowed books and due dates.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 p-4 rounded-xl dark:bg-purple-900/20">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{borrowedBooks.length}</p>
                    <p className="text-xs text-purple-700 dark:text-purple-300">Currently Borrowed</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl dark:bg-gray-700">
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">{borrowHistory.length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Returned This Term</p>
                </div>
            </div>

            {/* Current Books */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">Currently Borrowed</h3>
                </div>
                <div className="p-4 space-y-4">
                    {borrowedBooks.map((book) => {
                        const daysLeft = getDaysRemaining(book.dueDate);
                        return (
                            <div key={book.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl dark:bg-gray-700">
                                <div className="w-16 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253" /></svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-800 dark:text-gray-100">{book.title}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">by {book.author}</p>
                                    <p className="text-xs text-gray-400 font-mono mt-1">{book.isbn}</p>
                                    <div className="flex flex-wrap items-center gap-3 mt-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Borrowed: {book.borrowDate}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${getDueColor(daysLeft)}`}>
                                            {daysLeft <= 0 ? 'Overdue!' : `${daysLeft} days left`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">Reading History</h3>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-700">
                    {borrowHistory.map((book) => (
                        <div key={book.id} className="p-4 flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-800 dark:text-gray-100">{book.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">by {book.author}</p>
                            </div>
                            <div className="text-right text-xs text-gray-400">
                                <p>Returned: {book.returnDate}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentLibrary;
