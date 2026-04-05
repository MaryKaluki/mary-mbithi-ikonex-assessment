import React, { useState } from 'react';

const VehicleMaintenance = () => {
    const [showModal, setShowModal] = useState(false);

    const vehicles = [
        { id: 1, name: 'Bus A', reg: 'KCB 123', lastService: '2024-10-10', nextService: '2024-12-10', mileage: 45200, fuel: 85, status: 'Good' },
        { id: 2, name: 'Bus B', reg: 'KAT 456', lastService: '2024-09-22', nextService: '2024-11-22', mileage: 52400, fuel: 42, status: 'Due Soon' },
        { id: 3, name: 'Van C', reg: 'KDD 789', lastService: '2024-08-15', nextService: '2024-10-15', mileage: 38100, fuel: 20, status: 'Overdue' },
    ];

    const maintenanceLogs = [
        { id: 1, vehicle: 'Bus A', type: 'Oil Change', date: '2024-10-10', cost: 120, mechanic: 'John Auto' },
        { id: 2, vehicle: 'Bus B', type: 'Tire Rotation', date: '2024-09-22', cost: 80, mechanic: 'City Garage' },
        { id: 3, vehicle: 'Van C', type: 'Brake Inspection', date: '2024-08-15', cost: 150, mechanic: 'Quick Fix' },
    ];

    const getStatusColor = (status) => {
        const colors = {
            Good: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300',
            'Due Soon': 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300',
            Overdue: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300',
        };
        return colors[status] || colors.Good;
    };

    const getFuelColor = (level) => {
        if (level >= 60) return 'bg-green-500';
        if (level >= 30) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Vehicle Maintenance</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Track service history, fuel, and mileage.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg w-full sm:w-auto"
                >
                    + Log Service
                </button>
            </div>

            {/* Vehicle Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles.map((v) => (
                    <div key={v.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg dark:text-gray-100">{v.name}</h3>
                                <p className="text-sm text-gray-500 font-mono dark:text-gray-400">{v.reg}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(v.status)}`}>{v.status}</span>
                        </div>

                        {/* Fuel Gauge */}
                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-500 dark:text-gray-400">Fuel Level</span>
                                <span className="font-bold text-gray-700 dark:text-gray-300">{v.fuel}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                <div className={`h-2 rounded-full ${getFuelColor(v.fuel)}`} style={{ width: `${v.fuel}%` }}></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-gray-50 p-2 rounded-lg dark:bg-gray-700">
                                <p className="text-xs text-gray-400">Mileage</p>
                                <p className="font-bold text-gray-800 dark:text-gray-100">{v.mileage.toLocaleString()} km</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-lg dark:bg-gray-700">
                                <p className="text-xs text-gray-400">Next Service</p>
                                <p className="font-bold text-gray-800 dark:text-gray-100">{v.nextService}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Service History */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 mb-4 dark:text-gray-100">Recent Service Logs</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-4 py-3">Vehicle</th>
                                <th className="px-4 py-3">Service Type</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Mechanic</th>
                                <th className="px-4 py-3 text-right">Cost</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {maintenanceLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-purple-50 transition-colors dark:hover:bg-gray-700">
                                    <td className="px-4 py-3 font-bold text-gray-800 dark:text-gray-100">{log.vehicle}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{log.type}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{log.date}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{log.mechanic}</td>
                                    <td className="px-4 py-3 text-right font-bold text-gray-800 dark:text-gray-100">${log.cost}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-lg dark:bg-gray-800">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 dark:text-gray-100">Log New Service</h3>
                        <div className="space-y-4">
                            <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <option>Select Vehicle...</option>
                                <option>Bus A (KCB 123)</option>
                                <option>Bus B (KAT 456)</option>
                                <option>Van C (KDD 789)</option>
                            </select>
                            <input type="text" placeholder="Service Type (e.g., Oil Change)..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            <input type="number" placeholder="Cost ($)..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            <input type="date" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700">Save Log</button>
                            <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleMaintenance;
