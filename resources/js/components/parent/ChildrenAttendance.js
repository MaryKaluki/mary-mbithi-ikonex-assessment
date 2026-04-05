import React, { useEffect, useState } from 'react';

const palette = ['#6366f1','#ec4899','#10b981','#f59e0b'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const STATUS = {
    Present: { bg: 'bg-green-500',  text: 'P', label: 'Present'  },
    Absent:  { bg: 'bg-red-500',    text: 'A', label: 'Absent'   },
    Late:    { bg: 'bg-yellow-400', text: 'L', label: 'Late'     },
    Excused: { bg: 'bg-blue-400',   text: 'E', label: 'Excused'  },
};

const ChildrenAttendance = () => {
    const now = new Date();
    const [children, setChildren]   = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [year, setYear]           = useState(now.getFullYear());
    const [month, setMonth]         = useState(now.getMonth() + 1);
    const [records, setRecords]     = useState([]);
    const [stats, setStats]         = useState({});
    const [firstDow, setFirstDow]   = useState(0);
    const [daysInMonth, setDaysInMonth] = useState(30);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);

    // Fetch children list first
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        fetch('/api/parent/children', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => {
                const kids = d.children || [];
                setChildren(kids);
                if (kids.length > 0) setSelectedId(kids[0].id);
            }).catch(() => {});
    }, []);

    // Fetch attendance when selection/month changes
    useEffect(() => {
        if (!selectedId) return;
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        fetch(`/api/parent/attendance?year=${year}&month=${month}&child_id=${selectedId}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json())
          .then(d => {
              setRecords(d.records || []);
              setStats(d.stats || {});
              setFirstDow(d.first_dow || 0);
              setDaysInMonth(new Date(year, month, 0).getDate());
              setLoading(false);
          }).catch(() => { setError('Failed to load attendance.'); setLoading(false); });
    }, [selectedId, year, month]);

    const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y-1); } else setMonth(m => m-1); };
    const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y+1); } else setMonth(m => m+1); };

    const getDayStatus = (day) => {
        const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const rec = records.find(r => r.date === dateStr);
        return rec?.status || null;
    };

    if (error) return <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl text-red-600 text-sm">{error}</div>;

    return (
        <div className="space-y-4">
            {/* Child selector */}
            {children.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    {children.map((c, i) => (
                        <button
                            key={c.id}
                            onClick={() => setSelectedId(c.id)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all ${c.id === selectedId ? 'text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}
                            style={c.id === selectedId ? { background: palette[i % palette.length] } : {}}
                        >
                            {c.name.split(' ')[0]}
                        </button>
                    ))}
                </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2">
                {[
                    { key:'present', label:'Present', color:'bg-green-500' },
                    { key:'absent',  label:'Absent',  color:'bg-red-500'   },
                    { key:'late',    label:'Late',    color:'bg-yellow-400'},
                    { key:'excused', label:'Excused', color:'bg-blue-400'  },
                ].map(s => (
                    <div key={s.key} className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <div className={`w-2 h-2 rounded-full mx-auto mb-1.5 ${s.color}`}></div>
                        <p className="text-xl font-black text-gray-800 dark:text-gray-100">{stats[s.key] || 0}</p>
                        <p className="text-[10px] text-gray-400 font-semibold">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Calendar card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* Month nav */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-gray-700">
                    <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors active:scale-90">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                    </button>
                    <p className="font-bold text-gray-800 dark:text-gray-100">{MONTHS[month-1]} {year}</p>
                    <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors active:scale-90">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Loading calendar...</div>
                ) : (
                    <div className="p-4">
                        {/* Day headers */}
                        <div className="grid grid-cols-7 mb-2">
                            {DAYS.map(d => <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase">{d}</div>)}
                        </div>
                        {/* Day cells */}
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`}></div>)}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const status = getDayStatus(day);
                                const st = status ? STATUS[status] : null;
                                const isToday = day === now.getDate() && month === now.getMonth()+1 && year === now.getFullYear();
                                return (
                                    <div key={day} className={`aspect-square flex items-center justify-center rounded-xl text-xs font-bold relative ${st ? `${st.bg} text-white` : 'bg-gray-50 dark:bg-gray-700/50 text-gray-400'} ${isToday ? 'ring-2 ring-offset-1 ring-purple-600' : ''}`}
                                        style={isToday ? { ringColor: 'var(--primary-color)' } : {}}>
                                        {st ? st.text : day}
                                        {isToday && !st && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-600" style={{background:'var(--primary-color)'}}></span>}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap justify-center gap-3 mt-4 pt-3 border-t border-gray-50 dark:border-gray-700">
                            {Object.entries(STATUS).map(([key, val]) => (
                                <div key={key} className="flex items-center gap-1.5">
                                    <div className={`w-5 h-5 rounded-lg ${val.bg} flex items-center justify-center text-white text-[9px] font-bold`}>{val.text}</div>
                                    <span className="text-[10px] text-gray-400">{val.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChildrenAttendance;
