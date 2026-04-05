import React, { useState, useEffect } from 'react';

const EVENT_COLORS = {
    'Academic':  'bg-blue-500',
    'Holiday':   'bg-red-500',
    'Sports':    'bg-green-500',
    'Cultural':  'bg-yellow-500',
    'Meeting':   'bg-purple-500',
    'Other':     'bg-gray-400',
};

const EVENT_BADGE = {
    'Academic':  'border-l-4 border-blue-500',
    'Holiday':   'border-l-4 border-red-500',
    'Sports':    'border-l-4 border-green-500',
    'Cultural':  'border-l-4 border-yellow-500',
    'Meeting':   'border-l-4 border-purple-500',
    'Other':     'border-l-4 border-gray-400',
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const EventCalendar = () => {
    const now = new Date();
    const [currentYear, setCurrentYear] = useState(now.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1); // 1-based
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: '', type: 'Academic', start_date: '', end_date: '', description: '' });

    useEffect(() => {
        setIsLoading(true);
        window.axios.get(`/api/admin/events?month=${currentMonth}&year=${currentYear}`)
            .then(res => setEvents(res.data))
            .catch(() => window.showToast('error', 'Failed to load events.'))
            .finally(() => setIsLoading(false));
    }, [currentMonth, currentYear]);

    const prevMonth = () => {
        if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(y => y - 1); }
        else setCurrentMonth(m => m - 1);
    };

    const nextMonth = () => {
        if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(y => y + 1); }
        else setCurrentMonth(m => m + 1);
    };

    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();

    const eventDays = events.reduce((acc, evt) => {
        acc[evt.day] = acc[evt.day] || [];
        acc[evt.day].push(evt);
        return acc;
    }, {});

    const handleAddEvent = async (e) => {
        e.preventDefault();
        try {
            await window.axios.post('/api/admin/events', form);
            window.showToast('success', 'Event added.');
            setShowModal(false);
            setForm({ title: '', type: 'Academic', start_date: '', end_date: '', description: '' });
            // Re-fetch
            const res = await window.axios.get(`/api/admin/events?month=${currentMonth}&year=${currentYear}`);
            setEvents(res.data);
        } catch {
            window.showToast('error', 'Failed to add event.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await window.axios.delete(`/api/admin/events/${id}`);
            setEvents(prev => prev.filter(e => e.id !== id));
            window.showToast('success', 'Event deleted.');
        } catch {
            window.showToast('error', 'Failed to delete event.');
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">School Calendar &amp; Events</h2>
                <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg w-full sm:w-auto text-center">
                    + Add Event
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Calendar grid */}
                <div className="flex-1 bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 overflow-x-auto dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">
                            {MONTHS[currentMonth - 1]} {currentYear}
                        </h3>
                        <div className="flex space-x-2">
                            <button onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-gray-600 dark:text-gray-300 transition-colors">&lt;</button>
                            <button onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-gray-600 dark:text-gray-300 transition-colors">&gt;</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs min-w-[460px]">
                        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                            <div key={d} className="font-bold text-gray-400 py-2">{d}</div>
                        ))}
                        {Array.from({ length: firstDayOfMonth }, (_, i) => <div key={`e-${i}`} />)}
                        {Array.from({ length: daysInMonth }, (_, i) => {
                            const day = i + 1;
                            const dayEvents = eventDays[day] || [];
                            const isToday = day === now.getDate() && currentMonth === now.getMonth() + 1 && currentYear === now.getFullYear();
                            return (
                                <div key={day} className={`h-14 md:h-20 border rounded-lg p-1 text-left relative hover:bg-purple-50 transition-colors dark:hover:bg-gray-700 ${isToday ? 'bg-purple-50 ring-2 ring-purple-500 dark:bg-gray-700' : 'border-gray-50 dark:border-gray-700'}`}>
                                    <span className={`text-xs font-semibold ${isToday ? 'text-purple-700 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`}>{day}</span>
                                    <div className="flex flex-wrap gap-0.5 mt-0.5">
                                        {dayEvents.slice(0, 2).map(evt => (
                                            <div key={evt.id} className={`w-full px-1 py-0.5 text-white text-[9px] rounded truncate ${EVENT_COLORS[evt.type] || 'bg-gray-400'}`}>
                                                {evt.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Event list */}
                <div className="w-full lg:w-80 space-y-3">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        {MONTHS[currentMonth - 1]} Events
                    </h3>
                    {isLoading && <p className="text-sm text-gray-400">Loading events...</p>}
                    {!isLoading && events.length === 0 && (
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 text-center text-sm text-gray-500 dark:text-gray-400 font-bold">
                            No events this month.
                        </div>
                    )}
                    {events.map((evt) => (
                        <div key={evt.id} className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 ${EVENT_BADGE[evt.type] || EVENT_BADGE['Other']} hover:shadow-md transition-all dark:bg-gray-800 dark:border-gray-700 group`}>
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm">{evt.title}</h4>
                                <button onClick={() => handleDelete(evt.id)} className="text-red-400 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600">
                                    Remove
                                </button>
                            </div>
                            <p className="text-[10px] text-purple-600 font-bold uppercase mt-1 mb-1 dark:text-purple-400">{evt.type} &middot; {evt.start_date}</p>
                            {evt.description && <p className="text-xs text-gray-500 leading-snug dark:text-gray-400">{evt.description}</p>}
                        </div>
                    ))}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6">Add School Event</h3>
                        <form onSubmit={handleAddEvent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Title</label>
                                <input type="text" required placeholder="e.g. Term 1 Final Exams" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Type</label>
                                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                        {['Academic','Holiday','Sports','Cultural','Meeting','Other'].map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Start Date</label>
                                    <input type="date" required value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">End Date (optional)</label>
                                <input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Description</label>
                                <textarea rows={2} placeholder="Optional details..." value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none" />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-purple-600 text-white font-bold text-sm rounded-lg hover:bg-purple-700">Add Event</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventCalendar;
