import React, { useState } from 'react';

const PickupList = () => {
    const [shift, setShift] = useState('morning');

    const [students, setStudents] = useState([
        { id: 1, name: 'Tommy Smith', grade: 'Grade 4A', stop: 'Central Park', time: '07:15', picked: true },
        { id: 2, name: 'Alice Brown', grade: 'Grade 5B', stop: 'Main Street', time: '07:22', picked: true },
        { id: 3, name: 'John Doe', grade: 'Grade 3C', stop: 'Oak Avenue', time: '07:30', picked: false },
        { id: 4, name: 'Sarah Connor', grade: 'Grade 6A', stop: 'Pine Road', time: '07:38', picked: false },
        { id: 5, name: 'Emily Davis', grade: 'Grade 4A', stop: 'Lake View', time: '07:45', picked: false },
    ]);

    const togglePicked = (id) => {
        setStudents(students.map(s => s.id === id ? { ...s, picked: !s.picked } : s));
    };

    const pickedCount = students.filter(s => s.picked).length;
    const totalCount = students.length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Student Pickup List</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mark students as picked up during your route.</p>
                </div>
                <div className="flex bg-gray-100 rounded-xl p-1 dark:bg-gray-700">
                    <button
                        onClick={() => setShift('morning')}
                        className={`px-6 py-2 font-bold rounded-lg transition-colors ${shift === 'morning' ? 'bg-white text-purple-600 shadow dark:bg-gray-800 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        🌅 Morning
                    </button>
                    <button
                        onClick={() => setShift('evening')}
                        className={`px-6 py-2 font-bold rounded-lg transition-colors ${shift === 'evening' ? 'bg-white text-purple-600 shadow dark:bg-gray-800 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        🌆 Evening
                    </button>
                </div>
            </div>

            {/* Progress */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-800 dark:text-gray-100">Progress</span>
                    <span className="text-purple-600 font-bold dark:text-purple-400">{pickedCount} / {totalCount}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                    <div
                        className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(pickedCount / totalCount) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Student Cards - Mobile Optimized */}
            <div className="space-y-3">
                {students.map((student) => (
                    <div
                        key={student.id}
                        onClick={() => togglePicked(student.id)}
                        className={`bg-white p-4 rounded-xl shadow-sm border-2 cursor-pointer transition-all duration-300 active:scale-98 dark:bg-gray-800 ${student.picked ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-100 dark:border-gray-700'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0 ${student.picked ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 dark:bg-gray-700'}`}>
                                {student.picked ? '✓' : student.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-800 dark:text-gray-100">{student.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{student.grade}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-purple-600 dark:text-purple-400">📍 {student.stop}</span>
                                    <span className="text-xs text-gray-400">• {student.time}</span>
                                </div>
                            </div>
                            <div className={`px-4 py-2 rounded-lg font-bold text-sm ${student.picked ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                {student.picked ? 'Picked' : 'Tap'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Complete Button */}
            {pickedCount === totalCount && (
                <button className="w-full py-4 bg-green-600 text-white font-bold text-lg rounded-xl hover:bg-green-700 transition-colors shadow-lg">
                    ✅ Complete Route
                </button>
            )}
        </div>
    );
};

export default PickupList;
