import React, { useState, useEffect } from 'react';

const DriverDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [boardedIds, setBoardedIds] = useState([]);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const loadData = () => {
        window.axios.get('/api/driver/dashboard')
            .then(res => {
                setData(res.data);
                // Attempt to load previously checked IDs for today from localStorage (local mobile cache)
                try {
                    const cached = localStorage.getItem(`manifest_${res.data.route?.id}`);
                    if(cached) setBoardedIds(JSON.parse(cached));
                } catch(e){}
                setLoading(false);
            })
            .catch(() => {
                window.showToast?.('error', 'Failed to load route data');
                setLoading(false);
            });
    };

    useEffect(() => {
        loadData();
    }, []);

    const updateStatus = async (newStatus) => {
        setUpdatingStatus(true);
        try {
            await window.axios.put('/api/driver/route/status', { status: newStatus });
            setData(prev => ({...prev, route: {...prev.route, status: newStatus}}));
            window.showToast?.('success', `Status changed to ${newStatus}`);
        } catch(e) {
            window.showToast?.('error', 'Failed to update status');
        }
        setUpdatingStatus(false);
    };

    const toggleBoarded = (id) => {
        const newArr = boardedIds.includes(id) ? boardedIds.filter(i => i !== id) : [...boardedIds, id];
        setBoardedIds(newArr);
        if(data?.route?.id) {
            localStorage.setItem(`manifest_${data.route.id}`, JSON.stringify(newArr));
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Syncing Route...</p>
            </div>
        );
    }

    if (!data?.has_route) {
        return (
            <div className="flex flex-col items-center justify-center p-6 h-[70vh] text-center max-w-sm mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 dark:bg-gray-800">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h2 className="text-2xl font-black text-gray-800 mb-2 dark:text-gray-100">No Route Assigned</h2>
                <p className="text-sm font-bold text-gray-500 mb-8 dark:text-gray-400 leading-relaxed">You are not scheduled for any active transport routes today. Contact the Transport Manager if this is an error.</p>
                <button onClick={loadData} className="px-8 py-3 bg-black text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all dark:bg-white dark:text-black">Refresh Status</button>
            </div>
        );
    }

    const m = data.manifest || [];
    const boardedCount = boardedIds.length;
    const progress = m.length > 0 ? Math.round((boardedCount / m.length) * 100) : 0;
    
    // Status colors
    const st = data.route.status;
    let sColor = "bg-gray-500";
    if (st === 'In Transit') sColor = "bg-blue-500";
    if (st === 'Active') sColor = "bg-green-500";
    if (st === 'Arrived') sColor = "bg-indigo-600";
    if (st === 'Delayed') sColor = "bg-red-500";

    return (
        <div className="max-w-md mx-auto min-h-[90vh] pb-24 md:max-w-3xl space-y-4 animate-page-fade">
            
            {/* Header Card */}
            <div className={`rounded-[2rem] p-6 text-white shadow-xl transition-all duration-500 ${sColor} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M19 8l-4-4h-3c-2.76 0-5 2.24-5 5v2l-4 4v3h2v2c0 1.1.9 2 2 2s2-.9 2-2v-2h6v2c0 1.1.9 2 2 2s2-.9 2-2v-2h2v-3l-4-4V9c0-1.66 1.34-3 3-3h3V8h2z"/></svg>
                </div>
                
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/70 mb-1">Current Route</h3>
                <h1 className="text-3xl font-black tracking-tight mb-8 drop-shadow-sm">{data.route.name}</h1>
                
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-black tracking-widest uppercase text-white/70 mb-1">Status</p>
                        <select 
                            disabled={updatingStatus}
                            value={data.route.status}
                            onChange={(e) => updateStatus(e.target.value)}
                            className={`appearance-none bg-white/20 border-2 border-white/30 text-white text-sm font-black uppercase tracking-wider py-2 pl-4 pr-10 rounded-xl backdrop-blur-sm outline-none focus:border-white/60 transition-all ${updatingStatus ? 'opacity-50' : ''}`}
                        >
                            <option className="text-black" value="Active">Active</option>
                            <option className="text-black" value="In Transit">In Transit</option>
                            <option className="text-black" value="Delayed">Delayed</option>
                            <option className="text-black" value="Arrived">Arrived</option>
                        </select>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black tracking-widest uppercase text-white/70 mb-1">Vehicle</p>
                        <p className="text-lg font-black">{data.vehicle.plate}</p>
                    </div>
                </div>
            </div>

            {/* Manifest Summary */}
            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 flex items-center justify-between shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <div>
                    <h4 className="text-xl font-black text-gray-800 dark:text-white leading-none mb-1">{boardedCount} / {m.length}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Students Boarded</p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-gray-100 flex items-center justify-center relative overflow-hidden dark:border-gray-700">
                    <div className="absolute inset-0 bg-indigo-500 origin-bottom transition-all duration-700" style={{ transform: `scaleY(${progress/100})` }}></div>
                    <span className="relative z-10 text-sm font-black mix-blend-difference text-white">{progress}%</span>
                </div>
            </div>

            {/* Manifest List */}
            <div className="pt-2 pb-6 space-y-3">
                <h4 className="px-2 text-xs font-black text-gray-400 uppercase tracking-widest">Passenger Manifest</h4>
                {m.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                        <p className="text-sm font-bold text-gray-500 tracking-wide">No students assigned to this route.</p>
                    </div>
                ) : (
                    m.map(student => {
                        const isBoarded = boardedIds.includes(student.id);
                        return (
                            <div key={student.id} onClick={() => toggleBoarded(student.id)} 
                                className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all border-2 active:scale-[0.98] ${isBoarded ? 'bg-indigo-50 border-indigo-200 shadow-[inset_0_0_20px_rgba(79,70,229,0.05)] dark:bg-indigo-900/20 dark:border-indigo-800/50' : 'bg-white border-transparent shadow-sm dark:bg-gray-800 dark:border-gray-700'}`}>
                                
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isBoarded ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200' : 'bg-gray-100 text-transparent dark:bg-gray-700'}`}>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                </div>
                                
                                <div className="ml-4 flex-1">
                                    <h5 className={`text-[15px] font-black uppercase tracking-tight transition-colors ${isBoarded ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-800 dark:text-gray-100'}`}>{student.name}</h5>
                                    <div className="flex text-xs font-bold mt-1 text-gray-400 gap-3">
                                        <span>{student.class}</span>
                                        <span>•</span>
                                        <span>{student.admission_number}</span>
                                    </div>
                                </div>
                                
                                {student.emergency_contact && (
                                    <a href={`tel:${student.emergency_contact}`} onClick={e => e.stopPropagation()} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-green-50 hover:text-green-500 transition-colors border border-gray-100 dark:bg-gray-700/50 dark:border-gray-600 dark:hover:bg-green-900/30 dark:hover:text-green-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                                    </a>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default DriverDashboard;
