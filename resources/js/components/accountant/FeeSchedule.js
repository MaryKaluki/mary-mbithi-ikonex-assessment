import React, { useState } from 'react';

const FeeSchedule = () => {
    const [selectedTerm, setSelectedTerm] = useState('Term 1');

    const schedule = [
        { id: 1, class: 'Grade 1', tuition: 12000, library: 500, lab: 0, sports: 800, transport: 4000, total: 17300 },
        { id: 2, class: 'Grade 2', tuition: 12000, library: 500, lab: 0, sports: 800, transport: 4000, total: 17300 },
        { id: 3, class: 'Grade 3', tuition: 13000, library: 500, lab: 500, sports: 800, transport: 4000, total: 18800 },
        { id: 4, class: 'Grade 4', tuition: 13000, library: 500, lab: 500, sports: 800, transport: 4000, total: 18800 },
        { id: 5, class: 'Grade 5', tuition: 14000, library: 600, lab: 800, sports: 1000, transport: 4500, total: 20900 },
        { id: 6, class: 'Grade 6', tuition: 14000, library: 600, lab: 800, sports: 1000, transport: 4500, total: 20900 },
        { id: 7, class: 'Grade 7', tuition: 15000, library: 600, lab: 1000, sports: 1000, transport: 4500, total: 22100 },
        { id: 8, class: 'Grade 8', tuition: 16000, library: 700, lab: 1200, sports: 1200, transport: 5000, total: 24100 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Master Fee Schedule</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Fee breakdown by class and term</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={selectedTerm}
                        onChange={(e) => setSelectedTerm(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option>Term 1</option>
                        <option>Term 2</option>
                        <option>Term 3</option>
                    </select>
                    <button className="px-6 py-2 bg-purple-100 text-purple-700 font-bold rounded-lg dark:bg-gray-700 dark:text-purple-400">
                        Export PDF
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto dark:bg-gray-800 dark:border-gray-700">
                <table className="w-full text-left min-w-[900px]">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-4 py-3">Class</th>
                            <th className="px-4 py-3 text-right">Tuition</th>
                            <th className="px-4 py-3 text-right">Library</th>
                            <th className="px-4 py-3 text-right">Lab</th>
                            <th className="px-4 py-3 text-right">Sports</th>
                            <th className="px-4 py-3 text-right">Transport</th>
                            <th className="px-4 py-3 text-right bg-purple-50 dark:bg-purple-900/20">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {schedule.map(row => (
                            <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{row.class}</td>
                                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">KSh {row.tuition.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">KSh {row.library.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{row.lab > 0 ? `KSh ${row.lab.toLocaleString()}` : '-'}</td>
                                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">KSh {row.sports.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">KSh {row.transport.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400">KSh {row.total.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold dark:bg-gray-700">
                        <tr>
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-100">Average</td>
                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">KSh {Math.round(schedule.reduce((a, b) => a + b.tuition, 0) / schedule.length).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">KSh {Math.round(schedule.reduce((a, b) => a + b.library, 0) / schedule.length).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">KSh {Math.round(schedule.reduce((a, b) => a + b.lab, 0) / schedule.length).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">KSh {Math.round(schedule.reduce((a, b) => a + b.sports, 0) / schedule.length).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">KSh {Math.round(schedule.reduce((a, b) => a + b.transport, 0) / schedule.length).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400">KSh {Math.round(schedule.reduce((a, b) => a + b.total, 0) / schedule.length).toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default FeeSchedule;
