import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

// Billing groups are derived from fee structures' applicable_to field (all / boarding / day).
// We display active structures grouped by their applicable_to category.

const GROUP_LABELS = { all: 'All Students', boarding: 'Boarding Students', day: 'Day Students' };
const GROUP_COLORS = {
    all:      'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    boarding: 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
    day:      'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
};

const StudentGroups = () => {
    const [structures, setStructures] = useState([]);
    const [loading, setLoading]       = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await window.axios.get('/api/finance/fee-structures');
            setStructures(res.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    // Group structures by applicable_to
    const groups = structures.reduce((acc, s) => {
        const key = s.applicable_to || 'all';
        if (!acc[key]) acc[key] = [];
        acc[key].push(s);
        return acc;
    }, {});

    const groupKeys = Object.keys(groups);

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Finance <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Student Groups</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Student Billing Groups</h1>
                </div>
                <button onClick={fetchData}
                    className="px-4 py-1.5 border border-slate-300 dark:border-gray-600 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                    Refresh
                </button>
            </div>

            {/* Stats strip */}
            {!loading && (
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{groupKeys.length}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Billing Groups</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{structures.length}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fee Structures</span>
                    </div>
                </div>
            )}

            {/* Groups */}
            <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-auto">
                {loading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm p-6">
                        <SkeletonLoader type="table"/>
                    </div>
                ) : groupKeys.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm py-16">
                        <p className="text-slate-400 text-sm">No fee structures found.</p>
                        <p className="text-[10px] text-slate-300 mt-1">Billing groups are derived from fee structures.</p>
                    </div>
                ) : groupKeys.map(key => (
                    <div key={key} className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col">
                        {/* Group header */}
                        <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-800 dark:bg-slate-900 rounded-t-lg">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${GROUP_COLORS[key] || GROUP_COLORS.all}`}>
                                {key}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                                {GROUP_LABELS[key] || key} — {groups[key].length} structure{groups[key].length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        {/* Structures in group */}
                        <div className="overflow-auto">
                            <table className="w-full text-left" style={{ minWidth: 580 }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Structure Name</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Grade</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-center">Term</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Active</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28 text-right">Base Fee</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groups[key].map((s, i) => (
                                        <tr key={s.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                            i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                        }`}>
                                            <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                            <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{s.name}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500">{s.grade_level || 'All'}</td>
                                            <td className="px-3 py-2 text-xs text-slate-500 text-center">T{s.term}</td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`inline-block w-2 h-2 rounded-full ${s.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}/>
                                            </td>
                                            <td className="px-3 py-2 text-right text-xs font-bold font-mono text-slate-700 dark:text-slate-200">
                                                KSh {Number(s.total_amount).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentGroups;
