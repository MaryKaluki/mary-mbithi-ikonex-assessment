import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = ['07:30', '08:30', '09:30', '10:30', '11:30', '12:30', '13:30', '14:30'];

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const TimetableManager = () => {
    const [classes, setClasses]             = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedClass, setSelectedClass] = useState(null);
    const [slots, setSlots]                 = useState([]);
    const [isLoading, setIsLoading]         = useState(false);
    const [isSaving, setIsSaving]           = useState(false);

    useEffect(() => {
        window.axios.get('/api/admin/classes')
            .then(res => setClasses(res.data))
            .catch(() => window.showToast('error', 'Failed to load classes.'));
    }, []);

    useEffect(() => {
        if (!selectedClassId) return;
        setIsLoading(true);
        window.axios.get(`/api/admin/timetables?class_id=${selectedClassId}`)
            .then(res => { setSelectedClass(res.data.class); setSlots(res.data.slots); })
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
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Admin <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Timetable Manager</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Timetable Manager</h1>
                </div>
                <div className="flex items-center gap-2">
                    <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}
                        className="px-3 py-1.5 text-xs border border-slate-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select a class…</option>
                        {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                    </select>
                    {selectedClassId && (
                        <button onClick={handleSave} disabled={isSaving}
                            className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">
                            {isSaving ? 'Saving…' : 'Save'}
                        </button>
                    )}
                </div>
            </div>

            {/* Timetable grid */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {!selectedClassId ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-sm text-slate-400">Select a class above to view its timetable.</p>
                    </div>
                ) : isLoading ? (
                    <div className="p-6"><SkeletonLoader type="table"/></div>
                ) : (
                    <>
                        <div className="flex-shrink-0 px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                {selectedClass ? selectedClass.name : ''} — Weekly Schedule
                            </span>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left" style={{ minWidth: 680 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-20">Time</th>
                                        {DAYS.map(day => (
                                            <th key={day} className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">{day}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {TIME_SLOTS.map((time, i) => (
                                        <tr key={time} className={`border-b border-slate-100 dark:border-gray-700/60 transition-colors ${
                                            i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                        }`}>
                                            <td className="px-3 py-2 text-[10px] font-bold font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">{time}</td>
                                            {DAYS.map(day => {
                                                const slot = getSlot(day, time);
                                                return (
                                                    <td key={day} className="px-3 py-2">
                                                        {slot ? (
                                                            <div className={`px-2 py-1 rounded text-[10px] ${
                                                                slot.is_break
                                                                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                                                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                                            }`}>
                                                                <p className="font-bold truncate">{slot.is_break ? 'Break' : slot.subject || 'Free'}</p>
                                                                {!slot.is_break && slot.teacher && (
                                                                    <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{slot.teacher}</p>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="h-8 rounded border border-dashed border-slate-200 dark:border-gray-600"/>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {slots.length === 0 && (
                            <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider">No slots configured yet.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default TimetableManager;
