import React, { useState } from 'react';

const MembersList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    const members = [
        { id: 1, name: 'Tommy Smith', type: 'Student', grade: 'Grade 4A', booksOut: 2, limit: 3, status: 'active' },
        { id: 2, name: 'Alice Brown', type: 'Student', grade: 'Grade 5B', booksOut: 1, limit: 3, status: 'active' },
        { id: 3, name: 'John Doe', type: 'Student', grade: 'Grade 6A', booksOut: 3, limit: 3, status: 'maxed' },
        { id: 4, name: 'Sarah Connor', type: 'Staff', grade: 'Science Teacher', booksOut: 4, limit: 5, status: 'active' },
        { id: 5, name: 'Emily Davis', type: 'Staff', grade: 'Librarian', booksOut: 0, limit: 10, status: 'active' },
        { id: 6, name: 'Mike Johnson', type: 'Student', grade: 'Grade 3C', booksOut: 0, limit: 3, status: 'suspended' },
    ];

    const filteredMembers = members.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.grade.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || m.type.toLowerCase() === filter || m.status === filter;
        return matchesSearch && matchesFilter;
    });

    const getStatusBadge = (status) => {
        const styles = {
            active: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300',
            maxed: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300',
            suspended: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300',
        };
        return styles[status] || styles.active;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Library Members</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Students and staff with active library accounts.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{members.length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Members</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{members.filter(m => m.status === 'active').length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{members.reduce((a, b) => a + b.booksOut, 0)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Books Borrowed</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{members.filter(m => m.status === 'suspended').length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Suspended</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 dark:bg-gray-800 dark:border-gray-700">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search by name or class..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                </div>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                    <option value="all">All Members</option>
                    <option value="student">Students Only</option>
                    <option value="staff">Staff Only</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto dark:bg-gray-800 dark:border-gray-700">
                <table className="w-full text-left min-w-[700px]">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-4">Member</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4 text-center">Books Out</th>
                            <th className="px-6 py-4 text-center">Limit</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {filteredMembers.map((member) => (
                            <tr key={member.id} className="hover:bg-purple-50 transition-colors dark:hover:bg-gray-700">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm mr-3 dark:bg-purple-900/50 dark:text-purple-300">
                                            {member.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 dark:text-gray-100">{member.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{member.grade}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${member.type === 'Staff' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                        {member.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-gray-800 dark:text-gray-100">{member.booksOut}</td>
                                <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">{member.limit}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${getStatusBadge(member.status)}`}>
                                        {member.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-purple-600 font-bold text-sm hover:underline dark:text-purple-400">View Books</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MembersList;
