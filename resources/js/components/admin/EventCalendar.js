import React, { useState, useEffect } from 'react';

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const EVENT_DOT = {
    'Academic': 'bg-blue-500',
    'Holiday':  'bg-red-500',
    'Sports':   'bg-emerald-500',
    'Cultural': 'bg-yellow-500',
    'Meeting':  'bg-purple-500',
    'Other':    'bg-slate-400',
};

const EVENT_BADGE = {
    'Academic': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    'Holiday':  'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    'Sports':   'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    'Cultural': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    'Meeting':  'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    'Other':    'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300',
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_ABBR = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const EVENT_TYPES = ['Academic','Holiday','Sports','Cultural','Meeting','Other'];

const AddEventModal = ({ onClose, onSaved }) => {
    const [form, setForm]     = useState({ title: '', type: 'Academic', start_date: '', end_date: '', description: '' });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await window.axios.post('/api/admin/events', form);
            window.showToast('success', 'Event added.');
            onSaved();
            onClose();
        } catch { window.showToast('error', 'Failed to add event.'); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-slate-200 dark:border-gray-700">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 rounded-t-lg">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wide">Add School Event</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Title *</label>
                        <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                            placeholder="e.g. Term 1 Final Exams" className={inputCls}/>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Type</label>
                            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className={inputCls}>
                                {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Start Date *</label>
                            <input required type="date" value={form.start_date}
                                onChange={e => setForm({...form, start_date: e.target.value})} className={inputCls}/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">End Date (optional)</label>
                        <input type="date" value={form.end_date}
                            onChange={e => setForm({...form, end_date: e.target.value})} className={inputCls}/>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Description</label>
                        <textarea rows={2} value={form.description}
                            onChange={e => setForm({...form, description: e.target.value})}
                            placeholder="Optional details…" className={inputCls + ' resize-none'}/>
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button type="submit" disabled={saving}
                            className="flex-1 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">
                            {saving ? 'Saving…' : 'Add Event'}
                        </button>
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2 border border-slate-300 dark:border-gray-600 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EventCalendar = () => {
    const now = new Date();
    const [currentYear, setCurrentYear]   = useState(now.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
    const [events, setEvents]             = useState([]);
    const [isLoading, setIsLoading]       = useState(true);
    const [showModal, setShowModal]       = useState(false);

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const res = await window.axios.get(`/api/admin/events?month=${currentMonth}&year=${currentYear}`);
            setEvents(res.data);
        } catch { window.showToast('error', 'Failed to load events.'); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchEvents(); }, [currentMonth, currentYear]);

    const prevMonth = () => {
        if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(y => y - 1); }
        else setCurrentMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(y => y + 1); }
        else setCurrentMonth(m => m + 1);
    };

    const handleDelete = async (id) => {
        try {
            await window.axios.delete(`/api/admin/events/${id}`);
            setEvents(prev => prev.filter(e => e.id !== id));
            window.showToast('success', 'Event deleted.');
        } catch { window.showToast('error', 'Failed to delete event.'); }
    };

    const daysInMonth    = new Date(currentYear, currentMonth, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();

    const eventDays = events.reduce((acc, evt) => {
        acc[evt.day] = acc[evt.day] || [];
        acc[evt.day].push(evt);
        return acc;
    }, {});

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">
            {showModal && <AddEventModal onClose={() => setShowModal(false)} onSaved={fetchEvents}/>}

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Admin <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Event Calendar</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">School Calendar &amp; Events</h1>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                    + Add Event
                </button>
            </div>

            <div className="flex gap-3 flex-1 min-h-0">

                {/* Calendar grid */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden min-h-0">
                    {/* Month nav */}
                    <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                            {MONTHS[currentMonth - 1]} {currentYear}
                        </span>
                        <div className="flex gap-1">
                            <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-500 transition-colors text-sm font-bold">&lt;</button>
                            <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-500 transition-colors text-sm font-bold">&gt;</button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto p-3">
                        <div className="grid grid-cols-7 gap-1 min-w-[360px]">
                            {DAYS_ABBR.map(d => (
                                <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-1 uppercase tracking-wider">{d}</div>
                            ))}
                            {Array.from({ length: firstDayOfMonth }, (_, i) => <div key={`e-${i}`}/>)}
                            {Array.from({ length: daysInMonth }, (_, i) => {
                                const day = i + 1;
                                const dayEvents = eventDays[day] || [];
                                const isToday = day === now.getDate() && currentMonth === now.getMonth() + 1 && currentYear === now.getFullYear();
                                return (
                                    <div key={day} className={`min-h-14 border rounded p-1 text-left hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors ${
                                        isToday
                                            ? 'bg-primary/5 ring-1 ring-primary/40 border-primary/30'
                                            : 'border-slate-100 dark:border-gray-700/60'
                                    }`}>
                                        <span className={`text-[10px] font-bold ${isToday ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}>{day}</span>
                                        <div className="flex flex-wrap gap-0.5 mt-0.5">
                                            {dayEvents.slice(0, 2).map(evt => (
                                                <div key={evt.id} className={`w-full px-1 py-0.5 text-white text-[8px] font-bold rounded truncate ${EVENT_DOT[evt.type] || 'bg-slate-400'}`}>
                                                    {evt.title}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Event list */}
                <div className="w-72 flex-shrink-0 flex flex-col gap-2 min-h-0 overflow-auto">
                    <div className="flex-shrink-0 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{MONTHS[currentMonth - 1]} Events</span>
                        <span className="text-[10px] font-bold text-slate-400">{events.length} total</span>
                    </div>

                    {isLoading ? (
                        <p className="text-xs text-slate-400 px-1">Loading events…</p>
                    ) : events.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6 text-center">
                            <p className="text-xs text-slate-400">No events this month.</p>
                        </div>
                    ) : events.map(evt => (
                        <div key={evt.id} className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-3 shadow-sm group">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{evt.title}</p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${EVENT_BADGE[evt.type] || EVENT_BADGE['Other']}`}>
                                            {evt.type}
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-400">{evt.start_date}</span>
                                    </div>
                                    {evt.description && <p className="text-[10px] text-slate-400 mt-1 leading-snug">{evt.description}</p>}
                                </div>
                                <button onClick={() => handleDelete(evt.id)}
                                    className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    Del
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EventCalendar;
