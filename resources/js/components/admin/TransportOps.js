import React, { useState, useEffect } from 'react';

const TransportOps = () => {
    const [activeTab, setActiveTab] = useState('vehicles');
    
    // Data states
    const [vehicles, setVehicles] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [allStudents, setAllStudents] = useState([]); // for manifesting

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            window.axios.get('/api/admin/transport/vehicles'),
            window.axios.get('/api/admin/transport/routes'),
            window.axios.get('/api/admin/transport/drivers'),
            window.axios.get('/api/admin/students') // get all students for manifest matching
        ]).then(([vRes, rRes, dRes, sRes]) => {
            setVehicles(vRes.data);
            setRoutes(rRes.data);
            setDrivers(dRes.data);
            // student payload could be paginated or array. Safely handle:
            setAllStudents(Array.isArray(sRes.data) ? sRes.data : (sRes.data?.data || []));
            setLoading(false);
        }).catch(() => {
            window.showToast?.('error', 'Failed to load transport data');
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ── Forms ──
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [vForm, setVForm] = useState({ plate_number: '', make: '', model: '', capacity: 30, status: 'Active' });

    const saveVehicle = async () => {
        try {
            await window.axios.post('/api/admin/transport/vehicles', vForm);
            window.showToast?.('success', 'Vehicle saved');
            setShowVehicleModal(false);
            fetchData();
        } catch (e) {
            window.showToast?.('error', 'Failed to save vehicle');
        }
    };

    const deleteVehicle = async (id) => {
        if(!window.confirm("Delete this vehicle?")) return;
        try {
            await window.axios.delete(`/api/admin/transport/vehicles/${id}`);
            window.showToast?.('success', 'Vehicle deleted');
            fetchData();
        } catch(e) { window.showToast?.('error', 'Delete failed'); }
    }

    const [showRouteModal, setShowRouteModal] = useState(false);
    const [rForm, setRForm] = useState({ name: '', vehicle_id: '', driver_id: '', status: 'Active' });

    const saveRoute = async () => {
        try {
            await window.axios.post('/api/admin/transport/routes', rForm);
            window.showToast?.('success', 'Route created');
            setShowRouteModal(false);
            fetchData();
        } catch (e) {
            window.showToast?.('error', 'Failed to save route');
        }
    };

    const deleteRoute = async (id) => {
        if(!window.confirm("Delete this route?")) return;
        try {
            await window.axios.delete(`/api/admin/transport/routes/${id}`);
            window.showToast?.('success', 'Route deleted');
            fetchData();
        } catch(e) { window.showToast?.('error', 'Delete failed'); }
    }

    const [manifestModal, setManifestModal] = useState({ show: false, route: null, students: [] });
    const openManifest = async (route) => {
        try {
            const res = await window.axios.get(`/api/admin/transport/routes/${route.id}/students`);
            const assignedIds = res.data.map(s => s.id);
            setManifestModal({ show: true, route, students: assignedIds });
        } catch(e) {
            window.showToast?.('error', 'Failed to load manifest');
        }
    };

    const toggleManifestStudent = (studentId) => {
        setManifestModal(prev => {
            const has = prev.students.includes(studentId);
            return {
                ...prev,
                students: has ? prev.students.filter(id => id !== studentId) : [...prev.students, studentId]
            };
        });
    };

    const saveManifest = async () => {
        try {
            await window.axios.post(`/api/admin/transport/routes/${manifestModal.route.id}/students`, {
                student_ids: manifestModal.students
            });
            window.showToast?.('success', 'Manifest updated');
            setManifestModal({ show: false, route: null, students: [] });
        } catch(e) {
            window.showToast?.('error', 'Failed to sync manifest');
        }
    };

    return (
        <div className="space-y-6 animate-page-fade">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight">Transport Network</h2>
                    <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Manage Vehicles, Routes & Assignments</p>
                </div>
            </div>

            <div className="flex space-x-2 border-b border-gray-100 dark:border-gray-800 overflow-x-auto pb-[-1px]">
                {['vehicles', 'routes', 'drivers'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-6 py-4 text-[11px] font-black uppercase tracking-[0.15em] border-b-[3px] transition-all whitespace-nowrap ${activeTab === tab ? 'border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-500' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="py-20 flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Network...</p>
                </div>
            ) : (
                <>
                    {/* ──── VEHICLES TAB ──── */}
                    {activeTab === 'vehicles' && (
                        <div className="space-y-4">
                            <div className="flex justify-start">
                                <button onClick={() => { setVForm({ plate_number: '', make: '', model: '', capacity: 30, status: 'Active' }); setShowVehicleModal(true); }}
                                    className="px-6 py-2.5 bg-black text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 dark:bg-white dark:text-black hover:scale-105 transition-all">
                                    + Register Vehicle
                                </button>
                            </div>
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <th className="px-6 py-4">Plate Number</th>
                                            <th className="px-6 py-4">Make & Model</th>
                                            <th className="px-6 py-4">Capacity</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-sm font-bold">
                                        {vehicles.map(v => (
                                            <tr key={v.id} className="hover:bg-purple-50/30 dark:hover:bg-purple-900/10">
                                                <td className="px-6 py-4 text-gray-800 dark:text-white uppercase tracking-wider">{v.plate_number}</td>
                                                <td className="px-6 py-4 text-gray-500">{v.make} {v.model}</td>
                                                <td className="px-6 py-4 text-indigo-600">{v.capacity} Seats</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${v.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{v.status}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => deleteVehicle(v.id)} className="text-[10px] text-red-500 hover:text-red-700 uppercase tracking-wider">Remove</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ──── ROUTES TAB ──── */}
                    {activeTab === 'routes' && (
                        <div className="space-y-4">
                            <div className="flex justify-start">
                                <button onClick={() => { setRForm({ name: '', vehicle_id: '', driver_id: '', status: 'Active' }); setShowRouteModal(true); }}
                                    className="px-6 py-2.5 bg-black text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 dark:bg-white dark:text-black hover:scale-105 transition-all">
                                    + Assign New Route
                                </button>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {routes.map(r => (
                                    <div key={r.id} className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm dark:bg-gray-800 dark:border-gray-700 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4">
                                            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[9px] font-black uppercase tracking-widest">{r.status}</span>
                                        </div>
                                        <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase mb-4">{r.name}</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between p-3 bg-gray-50 rounded-xl dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Driver</span>
                                                <span className="text-sm font-black text-indigo-900 dark:text-indigo-400">{r.driver}</span>
                                            </div>
                                            <div className="flex justify-between p-3 bg-gray-50 rounded-xl dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bus Plate</span>
                                                <span className="text-sm font-black text-gray-600 dark:text-gray-300">{r.plate} ({r.capacity} Pax)</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <button onClick={() => openManifest(r)} className="flex-1 py-3 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Manage Manifest</button>
                                            <button onClick={() => deleteRoute(r.id)} className="w-[100px] py-3 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ──── DRIVERS TAB ──── */}
                    {activeTab === 'drivers' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700 p-8">
                            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6">Registered Drivers</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {drivers.map(d => (
                                    <div key={d.id} className="p-4 border-2 border-indigo-50 rounded-2xl dark:border-gray-700 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-black text-xl">
                                            {d.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm text-gray-800 dark:text-gray-100 uppercase tracking-tight">{d.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 ml-0.5">{d.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Vehicle Modal */}
            {showVehicleModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl p-8 shadow-2xl">
                        <h3 className="text-lg font-black uppercase tracking-tighter mb-6 text-gray-800 dark:text-white">Register Vehicle</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Plate Number</label>
                                <input value={vForm.plate_number} onChange={e => setVForm({...vForm, plate_number: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold dark:bg-gray-900 dark:border-gray-700 uppercase" placeholder="KCB 123G" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Make</label>
                                    <input value={vForm.make} onChange={e => setVForm({...vForm, make: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold dark:bg-gray-900 dark:border-gray-700" placeholder="Toyota" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Model</label>
                                    <input value={vForm.model} onChange={e => setVForm({...vForm, model: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold dark:bg-gray-900 dark:border-gray-700" placeholder="Coaster" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Seat Capacity</label>
                                <input type="number" value={vForm.capacity} onChange={e => setVForm({...vForm, capacity: +e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold dark:bg-gray-900 dark:border-gray-700" />
                            </div>
                        </div>
                        <div className="mt-8 flex gap-3">
                            <button onClick={() => setShowVehicleModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-500 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-200">Cancel</button>
                            <button onClick={saveVehicle} className="flex-1 py-3 bg-purple-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-purple-200 hover:bg-purple-700 dark:shadow-none">Save Vehicle</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Route Modal */}
            {showRouteModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl p-8 shadow-2xl">
                        <h3 className="text-lg font-black uppercase tracking-tighter mb-6 text-gray-800 dark:text-white">Assign Route</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Route Name</label>
                                <input value={rForm.name} onChange={e => setRForm({...rForm, name: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold dark:bg-gray-900 dark:border-gray-700 uppercase" placeholder="KILIMANI - CBD" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Assign Bus (Vehicle)</label>
                                <select value={rForm.vehicle_id} onChange={e => setRForm({...rForm, vehicle_id: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold dark:bg-gray-900 dark:border-gray-700">
                                    <option value="">-- No Bus --</option>
                                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate_number} ({v.capacity} Pax)</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Assign Driver</label>
                                <select value={rForm.driver_id} onChange={e => setRForm({...rForm, driver_id: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold dark:bg-gray-900 dark:border-gray-700">
                                    <option value="">-- No Driver --</option>
                                    {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="mt-8 flex gap-3">
                            <button onClick={() => setShowRouteModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-500 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-200">Cancel</button>
                            <button onClick={saveRoute} className="flex-1 py-3 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 dark:shadow-none">Save Route</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manifest Modal */}
            {manifestModal.show && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 py-10">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl p-8 shadow-2xl flex flex-col max-h-full">
                        <h3 className="text-lg font-black uppercase tracking-tighter mb-1 text-gray-800 dark:text-white">Passenger Manifest</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Route: {manifestModal.route.name}</p>
                        
                        <div className="flex-1 overflow-y-auto min-h-0 space-y-2 border border-gray-100 dark:border-gray-700 rounded-2xl p-2 bg-gray-50/50 dark:bg-gray-900/50">
                            {allStudents.map(student => {
                                const isAssigned = manifestModal.students.includes(student.id);
                                return (
                                    <div key={student.id} onClick={() => toggleManifestStudent(student.id)}
                                        className={`p-3 rounded-xl cursor-pointer flex justify-between items-center transition-all border-2 ${isAssigned ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'bg-white border-transparent hover:border-gray-200 dark:bg-gray-800 dark:hover:border-gray-700'}`}>
                                        <div>
                                            <p className={`text-sm font-black uppercase ${isAssigned ? 'text-indigo-800 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-200'}`}>
                                                {student.first_name} {student.last_name}
                                            </p>
                                            <p className="text-[10px] font-bold text-gray-400 mt-0.5">ADM: {student.admission_number}</p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isAssigned ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-transparent dark:bg-gray-700'}`}>
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 flex gap-3 flex-shrink-0">
                            <button onClick={() => setManifestModal({ show: false, route: null, students: [] })} className="flex-1 py-3 bg-gray-100 text-gray-500 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-200">Close</button>
                            <button onClick={saveManifest} className="flex-1 py-3 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 dark:shadow-none">Save Manifest</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransportOps;
