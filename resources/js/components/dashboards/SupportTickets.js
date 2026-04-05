import React, { useState, useEffect } from 'react';

const SupportTickets = () => {
    const [filter, setFilter] = useState('All');
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = () => {
        window.axios.get('/api/platform/tickets').then(res => {
            setTickets(res.data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const markResolved = (id) => {
        window.axios.put(`/api/platform/tickets/${id}`).then(() => {
            window.showToast('success', `Ticket #${id} marked as resolved.`);
            fetchTickets();
        }).catch(err => console.error(err));
    };

    const filtered = filter === 'All' ? tickets : tickets.filter(t => t.status === filter);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Support Tickets</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">View and respond to issues raised by school administrators.</p>
                </div>
                <button className="px-5 py-2.5 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 dark:shadow-purple-900/20">
                    Create Global Alert
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {['All', 'Open', 'Resolved'].map(f => (
                    <button 
                        key={f} 
                        onClick={() => setFilter(f)} 
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${filter === f ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Tickets List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 dark:bg-gray-900/50 dark:border-gray-700 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-1 border-r border-gray-200 dark:border-gray-700">ID</div>
                    <div className="col-span-5 pl-4">Subject & School</div>
                    <div className="col-span-2 text-center">Priority</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {loading ? <div className="p-10 text-center text-gray-400 font-bold">Loading tickets...</div> : filtered.map(ticket => (
                        <div key={ticket.id} className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 px-6 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="col-span-1 font-mono text-sm font-bold text-gray-500 dark:text-gray-400">
                                TIC-{ticket.id}
                            </div>
                            
                            <div className="col-span-5 lg:pl-4">
                                <h4 className="font-bold text-gray-800 text-sm md:text-base dark:text-gray-100">{ticket.subject}</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">{ticket.school?.name || 'Unknown School'}</span>
                                    <span className="text-gray-300 dark:text-gray-600">&bull;</span>
                                    <span className="text-xs text-gray-400">{new Date(ticket.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            
                            <div className="col-span-2 flex lg:justify-center">
                                <span className={`flex items-center space-x-1 ${
                                    ticket.priority === 'High' ? 'text-red-500' :
                                    ticket.priority === 'Medium' ? 'text-orange-500' : 'text-blue-500'
                                }`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    <span className="text-[10px] font-black uppercase tracking-wider">{ticket.priority}</span>
                                </span>
                            </div>

                            <div className="col-span-2 flex lg:justify-center">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    ticket.status === 'Open' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                }`}>
                                    {ticket.status}
                                </span>
                            </div>

                            <div className="col-span-2 flex justify-end space-x-2">
                                <button className="px-3 py-1.5 bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-purple-700 rounded-lg text-xs font-bold transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-purple-900/30 dark:hover:text-purple-400">
                                    View Thread
                                </button>
                                {ticket.status === 'Open' && (
                                    <button 
                                        onClick={() => markResolved(ticket.id)}
                                        className="p-1.5 text-green-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors title='Resolve' dark:hover:bg-green-900/30 dark:hover:text-green-400"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                            No tickets found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupportTickets;
