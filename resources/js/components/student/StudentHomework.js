import React, { useEffect, useState } from 'react';

const StudentHomework = () => {
    const [assignments, setAssignments] = useState([]);
    const [filter, setFilter]           = useState('all');
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        fetch('/api/student/homework', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => {
                if (d.error) { setError(d.error); return; }
                setAssignments(d.homework || []);
                setLoading(false);
            })
            .catch(() => { setError('Failed to load homework.'); setLoading(false); });
    }, []);

    const filtered = filter === 'all' ? assignments : assignments.filter(a => a.status === filter);

    const getStatusColor = (status) => {
        const colors = {
            pending:   'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300',
            overdue:   'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300',
        };
        return colors[status] || colors.pending;
    };

    const getSubjectAbbr = (subject) => {
        if (!subject) return 'HW';
        return subject.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    };

    const daysLeft = (due) => {
        const diff = Math.ceil((new Date(due) - new Date()) / (1000 * 60 * 60 * 24));
        if (diff < 0)  return `${Math.abs(diff)}d overdue`;
        if (diff === 0) return 'Due today';
        return `${diff}d left`;
    };

    if (loading) return <div className="flex items-center justify-center h-48 text-gray-400">Loading homework…</div>;
    if (error)   return <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">{error}</div>;

    const pending  = assignments.filter(a => a.status === 'pending').length;
    const overdue  = assignments.filter(a => a.status === 'overdue').length;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">My Homework</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Track your assignments and due dates.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded-xl text-center dark:bg-yellow-900/20">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pending}</p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">Pending</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl text-center dark:bg-red-900/20">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{overdue}</p>
                    <p className="text-xs text-red-700 dark:text-red-300">Overdue</p>
                </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {['all', 'pending', 'overdue'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg font-bold text-sm capitalize whitespace-nowrap transition-colors ${filter === f ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* List */}
            {filtered.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 text-gray-500 p-8 rounded-xl text-center dark:bg-gray-800 dark:border-gray-700">
                    {filter === 'all' ? 'No homework assigned yet.' : `No ${filter} assignments.`}
                </div>
            ) : (
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 dark:bg-gray-900/50 dark:border-gray-700 text-xs font-bold text-gray-500 uppercase">
                        <div className="col-span-1">Icon</div>
                        <div className="col-span-4">Title</div>
                        <div className="col-span-2 text-center">Status</div>
                        <div className="col-span-3">Subject</div>
                        <div className="col-span-2 text-right">Due Date</div>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filtered.map(hw => (
                            <div key={hw.id} className={`grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors border-l-4 ${hw.status === 'overdue' ? 'border-l-red-500' : 'border-l-yellow-500'} dark:hover:bg-gray-700/30`}>
                                <div className="col-span-1 hidden md:flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-[10px]">
                                        {getSubjectAbbr(hw.subject)}
                                    </div>
                                </div>
                                <div className="col-span-4 min-w-0">
                                    <h4 className="font-bold text-gray-800 text-sm truncate dark:text-gray-100">{hw.title}</h4>
                                    {hw.description && <p className="text-xs text-gray-400 truncate">{hw.description}</p>}
                                </div>
                                <div className="col-span-2 text-left md:text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(hw.status)}`}>
                                        {hw.status}
                                    </span>
                                </div>
                                <div className="col-span-3">
                                    <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">{hw.subject}</p>
                                </div>
                                <div className="col-span-2 text-right">
                                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400">{hw.due_date}</p>
                                    <p className={`text-[10px] font-medium ${hw.status === 'overdue' ? 'text-red-500' : 'text-gray-400'}`}>
                                        {daysLeft(hw.due_date)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentHomework;
