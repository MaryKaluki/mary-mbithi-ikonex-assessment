import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const EVENT_COLORS = {
    Academic: 'bg-blue-500',
    Holiday:  'bg-red-500',
    Sports:   'bg-green-500',
    Cultural: 'bg-yellow-500',
    Meeting:  'bg-purple-500',
    Other:    'bg-gray-400',
};

const EVENT_BORDER = {
    Academic: 'border-l-4 border-blue-500',
    Holiday:  'border-l-4 border-red-500',
    Sports:   'border-l-4 border-green-500',
    Cultural: 'border-l-4 border-yellow-500',
    Meeting:  'border-l-4 border-purple-500',
    Other:    'border-l-4 border-gray-400',
};

const TYPE_PILL = {
    Academic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    Holiday:  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    Sports:   'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    Cultural: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    Meeting:  'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    Other:    'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

const SchoolEvents = () => {
    const navigate  = useNavigate();
    const now       = new Date();
    const authUser  = (() => { try { return JSON.parse(localStorage.getItem('auth_user') || '{}'); } catch (_) { return {}; } })();
    const isAdmin   = ['admin','super_admin','school_admin'].includes(authUser?.role);

    const [currentYear, setCurrentYear]   = useState(now.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
    const [events, setEvents]             = useState([]);
    const [loading, setLoading]           = useState(true);
    const [selectedDay, setSelectedDay]   = useState(null);
    const [view, setView]                 = useState('calendar'); // 'calendar' | 'list'

    useEffect(() => {
        setLoading(true);
        window.axios.get(`/api/events?month=${currentMonth}&year=${currentYear}`)
            .then(res => setEvents(res.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [currentMonth, currentYear]);

    const prevMonth = () => {
        if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(y => y - 1); }
        else setCurrentMonth(m => m - 1);
        setSelectedDay(null);
    };
    const nextMonth = () => {
        if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(y => y + 1); }
        else setCurrentMonth(m => m + 1);
        setSelectedDay(null);
    };
    const goToday = () => {
        setCurrentYear(now.getFullYear());
        setCurrentMonth(now.getMonth() + 1);
        setSelectedDay(now.getDate());
    };

    const daysInMonth   = new Date(currentYear, currentMonth, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay();

    const eventsByDay = events.reduce((acc, evt) => {
        const key = evt.day ?? new Date(evt.start_date).getDate();
        (acc[key] = acc[key] || []).push(evt);
        return acc;
    }, {});

    const selectedEvents = selectedDay ? (eventsByDay[selectedDay] || []) : events;
    const listLabel      = selectedDay
        ? `${MONTHS[currentMonth - 1]} ${selectedDay}, ${currentYear}`
        : `${MONTHS[currentMonth - 1]} ${currentYear}`;

    return (
        <div className="space-y-5 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">School Calendar &amp; Events</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        School-wide events, holidays, and schedules
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* View toggle */}
                    <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden text-sm">
                        {[{ k: 'calendar', label: 'Calendar' }, { k: 'list', label: 'List' }].map(v => (
                            <button
                                key={v.k}
                                onClick={() => setView(v.k)}
                                className={`px-4 py-1.5 font-medium transition-colors ${
                                    view === v.k
                                        ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                            >
                                {v.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={goToday}
                        className="px-3 py-1.5 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        Today
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => navigate('/admin/events')}
                            className="px-4 py-1.5 text-sm font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Manage Events
                        </button>
                    )}
                </div>
            </div>

            {/* Month navigation bar */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-3">
                <button
                    onClick={prevMonth}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors font-bold"
                >
                    ‹
                </button>
                <span className="text-base font-bold text-gray-900 dark:text-gray-100 tracking-wide">
                    {MONTHS[currentMonth - 1]} {currentYear}
                </span>
                <button
                    onClick={nextMonth}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors font-bold"
                >
                    ›
                </button>
            </div>

            {view === 'calendar' ? (
                <div className="flex flex-col lg:flex-row gap-5">
                    {/* Calendar grid */}
                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {/* Day-of-week headers */}
                        <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700">
                            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                                <div key={d} className="py-2.5 text-center text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                                    {d}
                                </div>
                            ))}
                        </div>
                        {/* Days */}
                        <div className="grid grid-cols-7 auto-rows-[minmax(4rem,1fr)]">
                            {Array.from({ length: firstDayOfWeek }, (_, i) => (
                                <div key={`pad-${i}`} className="border-b border-r border-gray-50 dark:border-gray-700/50" />
                            ))}
                            {Array.from({ length: daysInMonth }, (_, i) => {
                                const day       = i + 1;
                                const dayEvts   = eventsByDay[day] || [];
                                const isToday   = day === now.getDate() && currentMonth === now.getMonth() + 1 && currentYear === now.getFullYear();
                                const isSelected = day === selectedDay;
                                return (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                                        className={`text-left p-1.5 border-b border-r border-gray-50 dark:border-gray-700/50 transition-colors ${
                                            isSelected
                                                ? 'bg-purple-50 dark:bg-purple-900/20'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                                        }`}
                                    >
                                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                            isToday
                                                ? 'bg-purple-600 text-white'
                                                : isSelected
                                                ? 'bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300'
                                                : 'text-gray-700 dark:text-gray-300'
                                        }`}>
                                            {day}
                                        </span>
                                        <div className="mt-0.5 space-y-0.5">
                                            {dayEvts.slice(0, 2).map(evt => (
                                                <div
                                                    key={evt.id}
                                                    className={`w-full px-1 py-0.5 text-white text-[9px] font-semibold rounded truncate ${EVENT_COLORS[evt.type] || 'bg-gray-400'}`}
                                                >
                                                    {evt.title}
                                                </div>
                                            ))}
                                            {dayEvts.length > 2 && (
                                                <div className="text-[9px] text-purple-600 dark:text-purple-400 font-bold pl-1">
                                                    +{dayEvts.length - 2} more
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sidebar — event list for selected day or month */}
                    <div className="w-full lg:w-72 shrink-0 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">{listLabel}</h3>
                            {selectedDay && (
                                <button
                                    onClick={() => setSelectedDay(null)}
                                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    Show all
                                </button>
                            )}
                        </div>
                        {loading && (
                            <p className="text-sm text-gray-400 dark:text-gray-500">Loading events…</p>
                        )}
                        {!loading && selectedEvents.length === 0 && (
                            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                No events {selectedDay ? 'on this day' : 'this month'}.
                            </div>
                        )}
                        {selectedEvents.map(evt => (
                            <div
                                key={evt.id}
                                className={`bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all ${EVENT_BORDER[evt.type] || EVENT_BORDER.Other}`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex-1 min-w-0">{evt.title}</h4>
                                    <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${TYPE_PILL[evt.type] || TYPE_PILL.Other}`}>
                                        {evt.type}
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                                    {evt.start_date}{evt.end_date && evt.end_date !== evt.start_date ? ` → ${evt.end_date}` : ''}
                                </p>
                                {evt.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-snug">{evt.description}</p>
                                )}
                            </div>
                        ))}

                        {/* Legend */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 mt-2">
                            <p className="text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 tracking-widest mb-3">Event Types</p>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                                {Object.entries(EVENT_COLORS).map(([type, cls]) => (
                                    <div key={type} className="flex items-center gap-1.5">
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${cls}`} />
                                        <span className="text-[11px] text-gray-600 dark:text-gray-400">{type}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* List view */
                <div className="space-y-3">
                    {loading && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center text-sm text-gray-400">
                            Loading events…
                        </div>
                    )}
                    {!loading && events.length === 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 py-16 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">No events this month.</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try navigating to a different month.</p>
                        </div>
                    )}
                    {events.map(evt => (
                        <div
                            key={evt.id}
                            className={`bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start gap-4 ${EVENT_BORDER[evt.type] || EVENT_BORDER.Other}`}
                        >
                            {/* Date bubble */}
                            <div className="shrink-0 w-12 text-center">
                                <p className="text-xl font-extrabold text-gray-800 dark:text-gray-100 leading-none">
                                    {evt.day ?? new Date(evt.start_date).getDate()}
                                </p>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                                    {MONTHS[currentMonth - 1].slice(0, 3)}
                                </p>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">{evt.title}</h4>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${TYPE_PILL[evt.type] || TYPE_PILL.Other}`}>
                                        {evt.type}
                                    </span>
                                </div>
                                {evt.end_date && evt.end_date !== evt.start_date && (
                                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                                        {evt.start_date} → {evt.end_date}
                                    </p>
                                )}
                                {evt.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-snug">{evt.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SchoolEvents;
