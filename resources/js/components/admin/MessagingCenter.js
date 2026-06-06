import React, { useState } from 'react';

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const LOGS = [
    { id: 1, date: 'Apr 10, 10:00', title: 'School Closing Early',       to: 'All Parents',    type: 'SMS',   status: 'Delivered', ok: true  },
    { id: 2, date: 'Apr 08, 08:30', title: 'Term 1 Newsletter',          to: 'All Parents',    type: 'Email', status: 'Sent',      ok: true  },
    { id: 3, date: 'Apr 06, 14:15', title: 'Staff Meeting Reminder',     to: 'All Staff',      type: 'SMS',   status: 'Failed (2)',ok: false },
    { id: 4, date: 'Apr 04, 09:00', title: 'Fee Balance Reminder',       to: 'Grade 6 Parents',type: 'SMS',   status: 'Delivered', ok: true  },
];

const MessagingCenter = () => {
    const [channel, setChannel] = useState('sms');

    const channelBadge = (t) =>
        t === 'SMS'
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Admin <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Messaging Center</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Messaging Center</h1>
                </div>
            </div>

            <div className="flex gap-3 flex-1 min-h-0">

                {/* Compose panel */}
                <div className="w-72 flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col">
                    <div className="flex-shrink-0 px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700 rounded-t-lg">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Compose Message</span>
                    </div>

                    {/* Channel toggle */}
                    <div className="flex border-b border-slate-100 dark:border-gray-700 flex-shrink-0">
                        {['sms', 'email'].map(c => (
                            <button key={c} onClick={() => setChannel(c)}
                                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                                    channel === c
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-slate-400 hover:text-slate-600'
                                }`}>
                                {c}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 p-4 flex flex-col gap-3">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">To</label>
                            <select className={inputCls}>
                                <option>All Parents</option>
                                <option>All Staff</option>
                                <option>Grade 5 Parents</option>
                                <option>Transport Drivers</option>
                            </select>
                        </div>
                        {channel === 'email' && (
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Subject</label>
                                <input type="text" placeholder="e.g. Newsletter…" className={inputCls}/>
                            </div>
                        )}
                        <div className="flex-1 flex flex-col min-h-0">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Message</label>
                            <textarea
                                rows="6"
                                placeholder={channel === 'sms' ? 'Short message…' : 'Compose email…'}
                                className={inputCls + ' resize-none flex-1'}/>
                            {channel === 'sms' && (
                                <p className="text-[10px] text-slate-400 text-right mt-0.5">0/160 characters</p>
                            )}
                        </div>
                        <button className="w-full py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                            Send {channel === 'sms' ? 'Broadcast' : 'Email'}
                        </button>
                    </div>
                </div>

                {/* Communication logs */}
                <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col min-h-0 overflow-hidden">
                    <div className="flex-shrink-0 px-4 py-2.5 bg-slate-800 dark:bg-slate-900 rounded-t-lg flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Communication Logs</span>
                        <input type="text" placeholder="Search…"
                            className="px-2 py-1 text-[10px] border border-slate-600 rounded bg-slate-700 text-slate-200 placeholder-slate-400 focus:outline-none w-32"/>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left" style={{ minWidth: 520 }}>
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Title / Preview</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-32">Recipient</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-16 text-center">Channel</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24">Date</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {LOGS.map((l, i) => (
                                    <tr key={l.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                        i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                    }`}>
                                        <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                        <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{l.title}</td>
                                        <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{l.to}</td>
                                        <td className="px-3 py-2 text-center">
                                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${channelBadge(l.type)}`}>{l.type}</span>
                                        </td>
                                        <td className="px-3 py-2 text-[10px] font-mono text-slate-400">{l.date}</td>
                                        <td className="px-3 py-2 text-center">
                                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                                l.ok
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                            }`}>{l.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">{LOGS.length} messages</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessagingCenter;
