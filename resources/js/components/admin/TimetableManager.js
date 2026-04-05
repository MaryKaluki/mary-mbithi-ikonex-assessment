import React, { useState, useEffect } from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = ['07:30', '08:30', '09:30', '10:30', '11:30', '12:30', '13:30', '14:30'];

const TimetableManager = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedClass, setSelectedClass] = useState(null);
    const [slots, setSlots] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        window.axios.get('/api/admin/classes')
            .then(res => setClasses(res.data))
            .catch(() => window.showToast('error', 'Failed to load classes.'));
    }, []);

    useEffect(() => {
        if (!selectedClassId) return;
        setIsLoading(true);
        window.axios.get(`/api/admin/timetables?class_id=${selectedClassId}`)
            .then(res => {
                setSelectedClass(res.data.class);
                setSlots(res.data.slots);
            })
            .catch(() => window.showToast('error', 'Failed to load timetable.'))
            .finally(() => setIsLoading(false));
    }, [selectedClassId]);

    const getSlot = (day, time) => slots.find(s => s.day === day && s.time_slot === time);

    const handleSave = async () => {
        if (!selectedClassId) return;
        setIsSaving(true);
        try {
            await window.axios.put(`/api/admin/timetables/${selectedClassId}`, { slots });
            window.showToast('success', 'Timetable saved successfully.');
        } catch {
            window.showToast('error', 'Failed to save timetable.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Timetable Manager</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">View and edit weekly class schedules.</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={selectedClassId}
                        onChange={e => setSelectedClassId(e.target.value)}
                        className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 cursor-pointer"
                    >
                        <option value="">Select a class...</option>
                        {classes.map(cls => (
                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                    </select>
                    {selectedClassId && (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Timetable'}
                        </button>
                    )}
                </div>
            </div>

            {!selectedClassId && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 p-12 text-center text-gray-500 dark:text-gray-400 font-bold">
                    Select a class above to view its timetable.
                </div>
            )}

            {selectedClassId && isLoading && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 p-12 text-center text-gray-500 font-bold">
                    Loading timetable...
                </div>
            )}

            {selectedClassId && !isLoading && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100">
                            {selectedClass ? selectedClass.name : ''} - Weekly Schedule
                        </h3>
                        {slots.length === 0 && (
                            <p className="text-sm text-gray-400 mt-1">No slots configured yet. Slot data can be added via the API or database seeder.</p>
                        )}
                    </div>
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-4 py-3 w-24">Time</th>
                                {DAYS.map(day => (
                                    <th key={day} className="px-4 py-3">{day}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {TIME_SLOTS.map(time => (
                                <tr key={time} className="hover:bg-purple-50/30 dark:hover:bg-gray-700/30">
                                    <td className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">{time}</td>
                                    {DAYS.map(day => {
                                        const slot = getSlot(day, time);
                                        return (
                                            <td key={day} className="px-4 py-3">
                                                {slot ? (
                                                    <div className={`rounded-lg px-2 py-1 text-xs ${slot.is_break ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'}`}>
                                                        <p className="font-bold truncate">{slot.is_break ? 'Break' : slot.subject || 'Free'}</p>
                                                        {!slot.is_break && slot.teacher && (
                                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{slot.teacher}</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="h-8 rounded-lg border border-dashed border-gray-200 dark:border-gray-600"></div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TimetableManager;
