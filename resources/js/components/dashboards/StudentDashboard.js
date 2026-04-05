import React, { useEffect, useState } from 'react';
import StatsCard from '../StatsCard';

const StudentDashboard = () => {
    const [data, setData]     = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        fetch('/api/student/dashboard', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const dayMap = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const todayName = dayMap[new Date().getDay()];

    if (loading) {
        return <div className="flex items-center justify-center h-48 text-gray-400">Loading dashboard…</div>;
    }

    if (!data || data.error) {
        return <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-xl">No student profile linked to this account. Please contact your school admin.</div>;
    }

    const { student, stats, today_slots } = data;

    const attendanceValue = stats.attendance_rate !== null ? `${stats.attendance_rate}%` : 'N/A';
    const attendanceSub   = stats.attendance_rate !== null
        ? (stats.attendance_rate >= 90 ? 'Excellent' : stats.attendance_rate >= 75 ? 'Good' : 'Needs Improvement')
        : 'No records yet';

    const gradeValue = stats.latest_grade ?? 'N/A';
    const homeworkValue = stats.pending_homework.toString();

    const getSubjectColor = (name) => {
        if (!name) return 'bg-gray-300';
        const map = {
            mathematics: 'bg-blue-500', english: 'bg-red-500', science: 'bg-green-500',
            history: 'bg-orange-500', art: 'bg-pink-500', pe: 'bg-purple-500',
            music: 'bg-yellow-500', kiswahili: 'bg-teal-500',
        };
        const key = Object.keys(map).find(k => name.toLowerCase().includes(k));
        return map[key] || 'bg-indigo-400';
    };

    // Determine status label for timetable slots
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const parseMins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    Welcome back, {student.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {student.grade_level} &bull; {student.admission_number}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatsCard
                    title="Attendance"
                    value={attendanceValue}
                    percentage={attendanceSub}
                    trend={stats.attendance_rate >= 90 ? 'up' : 'down'}
                    colorClass="bg-green-100 text-green-600"
                    progressColor="bg-green-500"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <StatsCard
                    title="Pending Homework"
                    value={homeworkValue}
                    percentage="Due upcoming"
                    trend={stats.pending_homework > 0 ? 'down' : 'up'}
                    colorClass="bg-red-100 text-red-600"
                    progressColor="bg-red-500"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                />
                <StatsCard
                    title="Latest Grade"
                    value={gradeValue}
                    percentage="Most recent exam"
                    trend="neutral"
                    colorClass="bg-purple-100 text-purple-600"
                    progressColor="bg-purple-500"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 dark:bg-gray-800 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 mb-4 dark:text-gray-100">
                    Today's Timetable ({todayName})
                </h3>

                {today_slots.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No classes scheduled for today.</p>
                ) : (
                    <div className="space-y-3">
                        {today_slots.map((slot, i) => {
                            const slotMins = parseMins(slot.time_slot);
                            let status = 'Upcoming';
                            if (nowMins > slotMins + 50) status = 'Done';
                            else if (nowMins >= slotMins) status = 'Now';

                            return (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                                        <span className="font-bold text-gray-600 dark:text-gray-300 w-14">{slot.time_slot}</span>
                                        <div className={`w-2 h-8 rounded-full ${slot.is_break ? 'bg-gray-300' : getSubjectColor(slot.subject_name)}`}></div>
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-100">
                                                {slot.is_break ? 'Break' : (slot.subject_name || 'Free Period')}
                                            </p>
                                            {!slot.is_break && slot.teacher_name && (
                                                <p className="text-xs text-gray-400">{slot.teacher_name}</p>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded font-bold ${
                                        status === 'Now'      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300' :
                                        status === 'Done'     ? 'bg-gray-200 text-gray-500 dark:bg-gray-600 dark:text-gray-400' :
                                                               'bg-blue-50 text-blue-500 dark:bg-blue-900/30 dark:text-blue-300'
                                    }`}>{status}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
