import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { SkeletonLoader, ConfirmationModal } from '../common/Loader';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const res = await window.axios.get('/api/admin/students');
            setStudents(res.data.students || []);
        } catch (err) {
            window.showToast('error', 'Failed to load students directory.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredStudents = students.filter(student =>
        student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admission_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredStudents.length && filteredStudents.length > 0) setSelectedIds([]);
        else setSelectedIds(filteredStudents.map(s => s.id));
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(item => item !== id));
        else setSelectedIds([...selectedIds, id]);
    };

    const handleBulkDelete = async () => {
        setIsDeleteModalOpen(false);
        try {
            await window.axios.delete('/api/admin/students', { data: { ids: selectedIds } });
            window.showToast('success', `${selectedIds.length} student records permanently deleted.`);
            setSelectedIds([]);
            fetchStudents(); // Refresh list
        } catch (err) {
            window.showToast('error', 'Failed to delete students.');
            console.error(err);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Student Directory</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage all admitted student records.</p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <button onClick={fetchStudents} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Refresh Directory
                    </button>
                    <NavLink to="/students/admit" className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 flex items-center justify-center">
                        + Admit Student
                    </NavLink>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-zinc-800 dark:border-zinc-700">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Search by Name or Admission Number..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-gray-200 dark:placeholder-gray-500 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-zinc-800 dark:border-zinc-700">
                {isLoading ? (
                    <div className="p-6"><SkeletonLoader type="table" /></div>
                ) : filteredStudents.length === 0 ? (
                    <div className="p-12 text-center">
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-4 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">No Students Found</h3>
                        <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">There are no student records matching your search or your database is empty.</p>
                        <NavLink to="/students/admit" className="inline-block mt-4 text-sm font-bold text-primary hover:underline">Admit a Student now &rarr;</NavLink>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-700">
                                <tr>
                                    <th className="px-6 py-4 w-10">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary cursor-pointer"
                                            checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="px-6 py-4 text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">Adm No.</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">Student Name</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">Class</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">Parent/Guardian</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-700/50">
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className={`transition-colors duration-150 group cursor-pointer ${selectedIds.includes(student.id) ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-gray-50 dark:hover:bg-zinc-700/50'}`}>
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary cursor-pointer"
                                                checked={selectedIds.includes(student.id)}
                                                onChange={() => toggleSelect(student.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wider">{student.admission_number}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                    {student.first_name[0]}{student.last_name[0]}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-gray-800 dark:text-gray-200 block">{student.first_name} {student.last_name}</span>
                                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest">{student.gender}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">{student.grade_level}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">{student.parent_name}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{student.parent_phone}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${student.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                {student.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Floating Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-4 md:bottom-8 left-2 right-2 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 z-50 animate-modal-pop">
                    <div className="bg-zinc-900 border border-zinc-800 text-white px-4 md:px-6 py-3 rounded-2xl md:rounded-full shadow-2xl flex items-center justify-between md:justify-start md:space-x-6">
                        <div className="flex items-center space-x-2 pr-4 md:pr-6 border-r border-white/10">
                            <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-[10px] font-black">{selectedIds.length}</span>
                            <span className="text-xs uppercase font-black text-gray-300 tracking-wider">Selected</span>
                        </div>
                        <div className="flex items-center space-x-2 pl-2">
                            <button onClick={() => setIsDeleteModalOpen(true)} className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-xs font-bold transition-colors">
                                Delete Records
                            </button>
                            <button onClick={() => setSelectedIds([])} className="p-2 ml-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                title={`Delete ${selectedIds.length} Student Record(s)?`}
                message="You are about to permanently remove these students from the system. This cannot be undone."
                onConfirm={handleBulkDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
            />
        </div>
    );
};

export default StudentList;
