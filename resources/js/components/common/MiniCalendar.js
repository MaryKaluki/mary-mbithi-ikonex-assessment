import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const MiniCalendar = () => {
    const navigate = useNavigate();
    const now = new Date();
    const [currentYear, setCurrentYear] = useState(now.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1); // 1-based
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        window.axios.get(`/api/events?month=${currentMonth}&year=${currentYear}`)
            .then(res => setEvents(res.data))
            .catch(() => {})
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
        acc[evt.day] = true;
        return acc;
    }, {});

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => navigate('/events')}
                    className="font-bold text-gray-800 dark:text-white hover:text-primary transition-colors text-left"
                >
                    School Calendar
                </button>
                <div className="flex gap-1">
                    <button onClick={prevMonth} className="w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-400">&lt;</button>
                    <button onClick={nextMonth} className="w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-400">&gt;</button>
                </div>
            </div>

            <div className="text-center mb-3">
                <span className="text-sm font-black text-primary uppercase tracking-widest">{MONTHS[currentMonth - 1]} {currentYear}</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                {['S','M','T','W','T','F','S'].map(d => (
                    <div key={d} className="font-bold text-gray-300 py-1">{d}</div>
                ))}
                
                {Array.from({ length: firstDayOfMonth }, (_, i) => <div key={`e-${i}`} />)}
                
                {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const hasEvent = eventDays[day];
                    const isToday = day === now.getDate() && currentMonth === now.getMonth() + 1 && currentYear === now.getFullYear();
                    
                    return (
                        <div key={day} className="relative py-1.5 flex flex-col items-center justify-center">
                            <span className={`text-xs font-bold ${isToday ? 'text-primary' : 'text-gray-600 dark:text-gray-400'} ${isToday ? 'bg-primary/10 w-7 h-7 rounded-full flex items-center justify-center' : ''}`}>
                                {day}
                            </span>
                            {hasEvent && (
                                <div className="absolute bottom-0 w-1 h-1 rounded-full bg-purple-500" />
                            )}
                        </div>
                    );
                })}
            </div>

            {events.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Upcoming this month</p>
                    <div className="space-y-2">
                        {events.slice(0, 2).map((evt, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-purple-500 shrink-0" />
                                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 truncate">{evt.title}</span>
                            </div>
                        ))}
                        {events.length > 2 && (
                            <p className="text-[10px] text-primary font-bold">+ {events.length - 2} more events</p>
                        )}
                        <button
                            onClick={() => navigate('/events')}
                            className="text-[10px] text-primary font-bold hover:underline mt-1 block"
                        >
                            View all events →
                        </button>
                    </div>
                </div>
            )}

            {!isLoading && events.length === 0 && (
                <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700">
                    <p className="text-[10px] text-gray-400 text-center">No events scheduled.</p>
                    <button
                        onClick={() => navigate('/events')}
                        className="text-[10px] text-primary font-bold hover:underline mt-1 block w-full text-center"
                    >
                        View calendar →
                    </button>
                </div>
            )}
        </div>
    );
};

export default MiniCalendar;
