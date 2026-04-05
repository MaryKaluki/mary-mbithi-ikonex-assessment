import React, { useEffect, useState } from 'react';

const palette = ['#6366f1','#ec4899','#10b981','#f59e0b','#3b82f6','#8b5cf6'];

const scoreColor = (score) => {
    if (score >= 80) return { bar: 'bg-green-500', text: 'text-green-600' };
    if (score >= 60) return { bar: 'bg-blue-500',  text: 'text-blue-600'  };
    if (score >= 45) return { bar: 'bg-yellow-500',text: 'text-yellow-600'};
    return { bar: 'bg-red-500', text: 'text-red-600' };
};

const gradeColor = (grade) => {
    if (!grade) return 'text-gray-400';
    if (grade.startsWith('A')) return 'text-green-600';
    if (grade.startsWith('B')) return 'text-blue-600';
    if (grade.startsWith('C')) return 'text-yellow-600';
    return 'text-red-500';
};

const ChildrenAcademic = () => {
    const [children, setChildren] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        fetch('/api/parent/academic', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => {
                const kids = d.children || [];
                setChildren(kids);
                if (kids.length > 0) setActiveId(kids[0].id);
                setLoading(false);
            })
            .catch(() => { setError('Failed to load academic data.'); setLoading(false); });
    }, []);

    if (loading) return (
        <div className="space-y-3 animate-pulse">
            <div className="h-10 bg-white rounded-2xl"></div>
            <div className="h-48 bg-white rounded-2xl"></div>
        </div>
    );
    if (error) return <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl text-red-600 text-sm">{error}</div>;
    if (children.length === 0) return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700 text-gray-400 text-sm">
            No academic data available yet.
        </div>
    );

    const child = children.find(c => c.id === activeId) || children[0];
    const idx   = children.indexOf(child);

    return (
        <div className="space-y-4">
            {/* Child selector chips */}
            {children.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    {children.map((c, i) => (
                        <button
                            key={c.id}
                            onClick={() => setActiveId(c.id)}
                            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${c.id === activeId ? 'text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}
                            style={c.id === activeId ? { background: palette[i % palette.length] } : {}}
                        >
                            {c.name.split(' ')[0]}
                        </button>
                    ))}
                </div>
            )}

            {/* Child summary card */}
            <div
                className="rounded-2xl p-5 text-white shadow-lg relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${palette[idx % palette.length]}, ${palette[(idx+1) % palette.length]})` }}
            >
                <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white opacity-10"></div>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center font-bold text-xl border-2 border-white/30">
                        {(child.name || '?').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold text-lg">{child.name}</p>
                        <p className="text-white/70 text-sm">{child.grade_level}</p>
                    </div>
                    <div className="ml-auto text-right">
                        <p className={`text-4xl font-black ${gradeColor(child.overall_grade).replace('text-','text-white')}`} style={{color:'rgba(255,255,255,0.95)'}}>
                            {child.overall_grade || '—'}
                        </p>
                        <p className="text-white/70 text-xs">{child.overall_percentage ? `${child.overall_percentage}%` : 'overall'}</p>
                    </div>
                </div>
                <div className="flex gap-4 mt-4 pt-4 border-t border-white/20 text-sm text-white/80">
                    <span>{child.attendance_rate !== undefined ? `${child.attendance_rate}% attendance` : ''}</span>
                    <span>{(child.subjects || []).length} subjects</span>
                </div>
            </div>

            {/* Subjects */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-700">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">Subject Performance</h3>
                </div>
                {(!child.subjects || child.subjects.length === 0) ? (
                    <div className="px-5 py-8 text-center text-gray-400 text-sm">No subject data available.</div>
                ) : (
                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                        {child.subjects.map((subj, si) => {
                            const sc = scoreColor(subj.average || 0);
                            return (
                                <div key={si} className="px-5 py-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{subj.name}</p>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-black ${sc.text}`}>{subj.average !== undefined ? `${subj.average}%` : '—'}</span>
                                            <span className={`font-bold text-sm ${gradeColor(subj.grade)}`}>{subj.grade || ''}</span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-700 ${sc.bar}`} style={{ width: `${Math.min(subj.average || 0, 100)}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChildrenAcademic;
