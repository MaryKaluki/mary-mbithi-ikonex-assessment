import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from '../common/Loader';

const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const TransportOps = () => {
    const [activeTab, setActiveTab] = useState('vehicles');

    const [vehicles, setVehicles]     = useState([]);
    const [routes, setRoutes]         = useState([]);
    const [drivers, setDrivers]       = useState([]);
    const [loading, setLoading]       = useState(true);
    const [allStudents, setAllStudents] = useState([]);

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            window.axios.get('/api/admin/transport/vehicles'),
            window.axios.get('/api/admin/transport/routes'),
            window.axios.get('/api/admin/transport/drivers'),
            window.axios.get('/api/admin/students'),
        ]).then(([vRes, rRes, dRes, sRes]) => {
            setVehicles(vRes.data);
            setRoutes(rRes.data);
            setDrivers(dRes.data);
            setAllStudents(Array.isArray(sRes.data) ? sRes.data : (sRes.data?.data || []));
        }).catch(() => {
            window.showToast?.('error', 'Failed to load transport data.');
        }).finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    // Vehicle modal
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [vForm, setVForm] = useState({ plate_number: '', make: '', model: '', capacity: 30, status: 'Active' });

    const saveVehicle = async () => {
        try {
            await window.axios.post('/api/admin/transport/vehicles', vForm);
            window.showToast?.('success', 'Vehicle saved.');
            setShowVehicleModal(false);
            fetchData();
        } catch { window.showToast?.('error', 'Failed to save vehicle.'); }
    };

    const deleteVehicle = async (id) => {
        if (!window.confirm('Delete this vehicle?')) return;
        try {
            await window.axios.delete(`/api/admin/transport/vehicles/${id}`);
            window.showToast?.('success', 'Vehicle deleted.');
            fetchData();
        } catch { window.showToast?.('error', 'Delete failed.'); }
    };

    // Route modal
    const [showRouteModal, setShowRouteModal] = useState(false);
    const [rForm, setRForm] = useState({ name: '', vehicle_id: '', driver_id: '', status: 'Active' });

    const saveRoute = async () => {
        try {
            await window.axios.post('/api/admin/transport/routes', rForm);
            window.showToast?.('success', 'Route created.');
            setShowRouteModal(false);
            fetchData();
        } catch { window.showToast?.('error', 'Failed to save route.'); }
    };

    const deleteRoute = async (id) => {
        if (!window.confirm('Delete this route?')) return;
        try {
            await window.axios.delete(`/api/admin/transport/routes/${id}`);
            window.showToast?.('success', 'Route deleted.');
            fetchData();
        } catch { window.showToast?.('error', 'Delete failed.'); }
    };

    // Manifest modal
    const [manifest, setManifest] = useState({ show: false, route: null, students: [] });

    const openManifest = async (route) => {
        try {
            const res = await window.axios.get(`/api/admin/transport/routes/${route.id}/students`);
            setManifest({ show: true, route, students: res.data.map(s => s.id) });
        } catch { window.showToast?.('error', 'Failed to load manifest.'); }
    };

    const toggleStudent = (id) => setManifest(prev => ({
        ...prev,
        students: prev.students.includes(id)
            ? prev.students.filter(s => s !== id)
            : [...prev.students, id],
    }));

    const saveManifest = async () => {
        try {
            await window.axios.post(`/api/admin/transport/routes/${manifest.route.id}/students`, {
                student_ids: manifest.students,
            });
            window.showToast?.('success', 'Manifest updated.');
            setManifest({ show: false, route: null, students: [] });
        } catch { window.showToast?.('error', 'Failed to sync manifest.'); }
    };

    const tabs = ['vehicles', 'routes', 'drivers'];

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Admin <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Transport Network</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Transport Network</h1>
                </div>
                <div className="flex gap-2">
                    {activeTab === 'vehicles' && (
                        <button onClick={() => { setVForm({ plate_number: '', make: '', model: '', capacity: 30, status: 'Active' }); setShowVehicleModal(true); }}
                            className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                            + Register Vehicle
                        </button>
                    )}
                    {activeTab === 'routes' && (
                        <button onClick={() => { setRForm({ name: '', vehicle_id: '', driver_id: '', status: 'Active' }); setShowRouteModal(true); }}
                            className="px-4 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                            + Add Route
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-gray-700 flex-shrink-0">
                {tabs.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider capitalize border-b-2 transition-colors ${
                            activeTab === tab
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
                {loading ? (
                    <div className="p-6"><SkeletonLoader type="table"/></div>
                ) : (
                    <>
                        {/* ── Vehicles ── */}
                        {activeTab === 'vehicles' && (
                            vehicles.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center py-16">
                                    <p className="text-slate-400 text-sm">No vehicles registered yet.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1 overflow-auto">
                                        <table className="w-full text-left" style={{ minWidth: 580 }}>
                                            <thead className="sticky top-0 z-10">
                                                <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Plate Number</th>
                                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-40">Make &amp; Model</th>
                                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-center">Capacity</th>
                                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-center">Status</th>
                                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {vehicles.map((v, i) => (
                                                    <tr key={v.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group ${
                                                        i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                                    }`}>
                                                        <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                                        <td className="px-3 py-2 text-xs font-mono font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wide">{v.plate_number}</td>
                                                        <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{v.make} {v.model}</td>
                                                        <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 text-center">{v.capacity}</td>
                                                        <td className="px-3 py-2 text-center">
                                                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                                                v.status === 'Active'
                                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                            }`}>{v.status}</span>
                                                        </td>
                                                        <td className="px-3 py-2 text-right">
                                                            <button onClick={() => deleteVehicle(v.id)}
                                                                className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">{vehicles.length} vehicles</p>
                                    </div>
                                </>
                            )
                        )}

                        {/* ── Routes ── */}
                        {activeTab === 'routes' && (
                            routes.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center py-16">
                                    <p className="text-slate-400 text-sm">No routes configured yet.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1 overflow-auto">
                                        <table className="w-full text-left" style={{ minWidth: 640 }}>
                                            <thead className="sticky top-0 z-10">
                                                <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Route Name</th>
                                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-36">Driver</th>
                                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28">Bus</th>
                                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Status</th>
                                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-32 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {routes.map((r, i) => (
                                                    <tr key={r.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group ${
                                                        i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                                    }`}>
                                                        <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                                        <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{r.name}</td>
                                                        <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{r.driver || '—'}</td>
                                                        <td className="px-3 py-2 text-xs font-mono text-slate-400">{r.plate || '—'}</td>
                                                        <td className="px-3 py-2 text-center">
                                                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                                                r.status === 'Active'
                                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                                    : 'bg-slate-100 dark:bg-gray-700 text-slate-500'
                                                            }`}>{r.status}</span>
                                                        </td>
                                                        <td className="px-3 py-2 text-right">
                                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => openManifest(r)}
                                                                    className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">
                                                                    Manifest
                                                                </button>
                                                                <button onClick={() => deleteRoute(r.id)}
                                                                    className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors">
                                                                    Del
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">{routes.length} routes</p>
                                    </div>
                                </>
                            )
                        )}

                        {/* ── Drivers ── */}
                        {activeTab === 'drivers' && (
                            drivers.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center py-16">
                                    <p className="text-slate-400 text-sm">No drivers registered. Add a driver as a staff member with role "Driver".</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1 overflow-auto">
                                        <table className="w-full text-left" style={{ minWidth: 480 }}>
                                            <thead className="sticky top-0 z-10">
                                                <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-8">#</th>
                                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Driver</th>
                                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-48">Email</th>
                                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-32">Phone</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {drivers.map((d, i) => (
                                                    <tr key={d.id} className={`border-b border-slate-100 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                                                        i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                                    }`}>
                                                        <td className="px-3 py-2 text-[11px] font-mono text-slate-300 dark:text-slate-600 select-none">{String(i + 1).padStart(2, '0')}</td>
                                                        <td className="px-3 py-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                                                    {d.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">{d.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2 text-xs text-slate-400">{d.email}</td>
                                                        <td className="px-3 py-2 text-xs text-slate-400">{d.phone || '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">{drivers.length} drivers</p>
                                    </div>
                                </>
                            )
                        )}
                    </>
                )}
            </div>

            {/* Vehicle Modal */}
            {showVehicleModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm border border-slate-200 dark:border-gray-700">
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 rounded-t-lg">
                            <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wide">Register Vehicle</h3>
                            <button onClick={() => setShowVehicleModal(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Plate Number</label>
                                <input value={vForm.plate_number} onChange={e => setVForm({...vForm, plate_number: e.target.value})}
                                    placeholder="KCB 123G" className={inputCls + ' uppercase'}/>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Make</label>
                                    <input value={vForm.make} onChange={e => setVForm({...vForm, make: e.target.value})}
                                        placeholder="Toyota" className={inputCls}/>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Model</label>
                                    <input value={vForm.model} onChange={e => setVForm({...vForm, model: e.target.value})}
                                        placeholder="Coaster" className={inputCls}/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Seat Capacity</label>
                                <input type="number" value={vForm.capacity}
                                    onChange={e => setVForm({...vForm, capacity: +e.target.value})} className={inputCls}/>
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button onClick={saveVehicle}
                                    className="flex-1 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                                    Save Vehicle
                                </button>
                                <button onClick={() => setShowVehicleModal(false)}
                                    className="flex-1 py-2 border border-slate-300 dark:border-gray-600 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Route Modal */}
            {showRouteModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm border border-slate-200 dark:border-gray-700">
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 rounded-t-lg">
                            <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wide">Add Route</h3>
                            <button onClick={() => setShowRouteModal(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Route Name</label>
                                <input value={rForm.name} onChange={e => setRForm({...rForm, name: e.target.value})}
                                    placeholder="KILIMANI — CBD" className={inputCls}/>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Assign Bus</label>
                                <select value={rForm.vehicle_id} onChange={e => setRForm({...rForm, vehicle_id: e.target.value})} className={inputCls}>
                                    <option value="">— No Bus —</option>
                                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate_number} ({v.capacity} pax)</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Assign Driver</label>
                                <select value={rForm.driver_id} onChange={e => setRForm({...rForm, driver_id: e.target.value})} className={inputCls}>
                                    <option value="">— No Driver —</option>
                                    {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button onClick={saveRoute}
                                    className="flex-1 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                                    Save Route
                                </button>
                                <button onClick={() => setShowRouteModal(false)}
                                    className="flex-1 py-2 border border-slate-300 dark:border-gray-600 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Manifest Modal */}
            {manifest.show && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg border border-slate-200 dark:border-gray-700 flex flex-col max-h-[80vh]">
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 rounded-t-lg flex-shrink-0">
                            <div>
                                <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wide">Passenger Manifest</h3>
                                <p className="text-[10px] text-slate-400 mt-0.5">Route: {manifest.route.name}</p>
                            </div>
                            <button onClick={() => setManifest({ show: false, route: null, students: [] })}
                                className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                        </div>
                        <div className="flex-1 overflow-auto p-3">
                            <div className="space-y-1">
                                {allStudents.map(student => {
                                    const isAssigned = manifest.students.includes(student.id);
                                    return (
                                        <div key={student.id} onClick={() => toggleStudent(student.id)}
                                            className={`px-3 py-2 rounded-md cursor-pointer flex items-center justify-between transition-colors border ${
                                                isAssigned
                                                    ? 'bg-primary/5 border-primary/30 dark:bg-primary/10'
                                                    : 'bg-white dark:bg-gray-700 border-slate-100 dark:border-gray-600 hover:border-slate-300'
                                            }`}>
                                            <div>
                                                <p className={`text-xs font-semibold ${isAssigned ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>
                                                    {student.first_name} {student.last_name}
                                                </p>
                                                <p className="text-[10px] font-mono text-slate-400">ADM: {student.admission_number}</p>
                                            </div>
                                            <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${isAssigned ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-gray-600'}`}>
                                                {isAssigned && (
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="flex-shrink-0 flex gap-2 px-5 py-3.5 border-t border-slate-100 dark:border-gray-700">
                            <button onClick={saveManifest}
                                className="flex-1 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors">
                                Save Manifest ({manifest.students.length} assigned)
                            </button>
                            <button onClick={() => setManifest({ show: false, route: null, students: [] })}
                                className="flex-1 py-2 border border-slate-300 dark:border-gray-600 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransportOps;
