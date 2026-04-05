import React, { useEffect, useState } from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const subjectColor = (name) => {
    if (!name) return 'bg-gray-300';
    const map = {
        mathematics: 'bg-blue-500', english: 'bg-red-500', science: 'bg-green-500',
        history: 'bg-orange-500', art: 'bg-pink-500', 'physical education': 'bg-purple-500',
        music: 'bg-yellow-500', kiswahili: 'bg-teal-500', geography: 'bg-lime-500',
    };
    const key = Object.keys(map).find(k => name.toLowerCase().includes(k));
    return map[key] || 'bg-indigo-400';
};

const StudentTimetable = () => {
    const [timetable, setTimetable] = useState({});
    const [className, setClassName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const dayMap = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const todayName = dayMap[new Date().getDay()];

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        fetch('/api/student/timetable', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => {
                if (d.error) { setError(d.error); return; }
                setTimetable(d.timetable || {});
                setClassName(d.class?.name || '');
                setLoading(false);
            })
            .catch(() => { setError('Failed to load timetable.'); setLoading(false); });
    }, []);

    if (loading) return <div className="flex items-center justify-center h-48 text-gray-400">Loading timetable…</div>;
    if (error)   return <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">{error}</div>;

    const todaySlots = timetable[todayName] || [];
    const hasAnyData = DAYS.some(d => (timetable[d] || []).length > 0);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">My Timetable</h2>
                {className && <p className="text-sm text-gray-500 dark:text-gray-400">Class: {className}</p>}
            </div>

            {/* Today's Classes */}
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 dark:bg-purple-900/20 dark:border-purple-800">
                <h3 className="font-bold text-purple-700 mb-4 dark:text-purple-300">
                    Today's Classes ({todayName})
                </h3>
                {todaySlots.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No classes today.</p>
                ) : (
                    <div className="space-y-2">
                        {todaySlots.map((slot, i) => (
                            <div key={i} className="bg-white p-3 rounded-lg flex items-center gap-4 shadow-sm dark:bg-gray-800">
                                <span className="text-sm font-bold text-gray-500 w-14 dark:text-gray-400">{slot.time_slot}</span>
                                <div className={`w-2 h-10 rounded-full ${slot.is_break ? 'bg-gray-300' : subjectColor(slot.subject_name)}`}></div>
                                <div className="flex-1">
                                    <p className="font-bold text-gray-800 dark:text-gray-100">
                                        {slot.is_break ? 'Break' : (slot.subject_name || 'Free Period')}
                                    </p>
                                    {!slot.is_break && slot.teacher_name && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{slot.teacher_name}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Full Week Grid */}
            {hasAnyData ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="font-bold text-gray-800 p-4 border-b border-gray-100 dark:text-gray-100 dark:border-gray-700">
                        Full Week Schedule
                    </h3>
                    <div className="overflow-x-auto">
                        <div className="flex min-w-max">
                            {DAYS.map(day => {
                                const slots = timetable[day] || [];
                                return (
                                    <div key={day} className={`flex-1 min-w-32 ${day === todayName ? 'bg-purple-50 dark:bg-purple-900/10' : ''}`}>
                                        <div className={`p-3 text-center font-bold border-b ${day === todayName ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300'} border-gray-100 dark:border-gray-700`}>
                                            {day.slice(0, 3)}
                                        </div>
                                        <div className="p-2 space-y-2">
                                            {slots.length === 0 ? (
                                                <div className="p-2 rounded text-xs text-center text-gray-300">—</div>
                                            ) : slots.map((slot, i) => (
                                                <div key={i} className={`p-2 rounded text-xs text-center ${slot.is_break ? 'bg-gray-100 text-gray-400 dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-700'}`}>
                                                    <div className={`w-full h-1 rounded mb-1 ${slot.is_break ? 'bg-gray-300' : subjectColor(slot.subject_name)}`}></div>
                                                    <p className="font-bold text-gray-700 truncate dark:text-gray-200">
                                                        {slot.is_break ? 'Break' : (slot.subject_name || '—')}
                                                    </p>
                                                    <p className="text-gray-400">{slot.time_slot}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 border border-gray-200 text-gray-500 p-6 rounded-xl text-center dark:bg-gray-800 dark:border-gray-700">
                    No timetable has been set up for your class yet.
                </div>
            )}
        </div>
    );
};

export default StudentTimetable;
