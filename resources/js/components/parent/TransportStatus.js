import React, { useEffect, useState } from 'react';

const palette = ['#6366f1','#ec4899','#10b981','#f59e0b'];

const TransportStatus = () => {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        fetch('/api/parent/transport', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => { setError('Failed to load transport data.'); setLoading(false); });
    }, []);

    if (loading) return (
        <div className="space-y-3 animate-pulse">
            <div className="h-24 bg-white rounded-2xl"></div>
            <div className="h-36 bg-white rounded-2xl"></div>
        </div>
    );
    if (error) return <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl text-red-600 text-sm">{error}</div>;

    const busChildren    = data?.bus_children    || [];
    const nonBusChildren = data?.non_bus_children || [];
    const routes         = data?.routes          || [];

    return (
        <div className="space-y-4">

            {/* Bus children */}
            {busChildren.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50 dark:border-gray-700">
                        <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-gray-100">On School Bus</h3>
                            <p className="text-xs text-gray-400">{busChildren.length} student{busChildren.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                        {busChildren.map((child, i) => (
                            <div key={child.id} className="flex items-center gap-4 px-5 py-3.5">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0" style={{ background: palette[i % palette.length] }}>
                                    {(child.name || '?').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{child.name}</p>
                                    <p className="text-xs text-gray-400">{child.grade_level}</p>
                                </div>
                                <span className="px-2.5 py-1 bg-orange-100 text-orange-600 text-[10px] font-bold rounded-full">School Bus</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Other transport */}
            {nonBusChildren.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-700">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100">Other Transport</h3>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                        {nonBusChildren.map((child, i) => (
                            <div key={child.id} className="flex items-center gap-4 px-5 py-3.5">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0" style={{ background: palette[(i+2) % palette.length] }}>
                                    {(child.name || '?').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{child.name}</p>
                                </div>
                                <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold rounded-full">{child.mode_of_transport || 'Other'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Routes */}
            {routes.length > 0 && routes.map((route, ri) => (
                <div key={ri} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">{route.route_name}</p>
                                <p className="text-xs text-gray-400">{route.vehicle_plate}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${route.status === 'In Transit' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{route.status || 'Idle'}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-gray-50 dark:divide-gray-700">
                        <div className="px-5 py-3">
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Driver</p>
                            <p className="font-bold text-sm text-gray-800 dark:text-gray-100 mt-0.5">{route.driver_name || '—'}</p>
                        </div>
                        <div className="px-5 py-3">
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Contact</p>
                            <p className="font-bold text-sm text-gray-800 dark:text-gray-100 mt-0.5">{route.driver_phone || '—'}</p>
                        </div>
                    </div>
                </div>
            ))}

            {busChildren.length === 0 && nonBusChildren.length === 0 && routes.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                    </div>
                    <p className="font-bold text-gray-600 dark:text-gray-300">No transport configured</p>
                    <p className="text-xs text-gray-400 mt-1">Contact your school for transport details</p>
                </div>
            )}
        </div>
    );
};

export default TransportStatus;
