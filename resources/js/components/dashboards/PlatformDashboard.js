import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const PlatformDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({
        schools_count: 0,
        total_students: 0,
        mrr: 0,
        recent_schools: [],
        recent_logs: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.axios.get('/api/platform/stats').then(res => {
            setData(res.data);
            setLoading(false);
        }).catch(err => {
            console.error('Failed to fetch dashboard stats', err);
            setLoading(false);
        });
    }, []);

    const stats = [
        { title: 'Active Schools', value: data.schools_count, change: '+3 this month', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'bg-blue-500' },
        { title: 'Total Students', value: data.total_students.toLocaleString(), change: '+1.2k this month', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'bg-green-500' },
        { title: 'Monthly Revenue', value: '$' + parseFloat(data.mrr || 0).toLocaleString(), change: '+12% vs last month', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-purple-500' },
        { title: 'System Load', value: '34%', change: 'Healthy', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'bg-orange-500' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Platform Overview</h1>
                    <p className="text-gray-500 dark:text-gray-400">Welcome back, System Operator. Here is the network status.</p>
                </div>
                <button onClick={() => navigate('/platform/schools')} className="px-4 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-black transition-colors shadow-lg">
                    + Register New School
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs uppercase font-bold text-gray-400 tracking-wider">{stat.title}</p>
                                <h3 className="text-2xl font-extrabold text-gray-800 mt-2 dark:text-white">{stat.value}</h3>
                                <p className="text-xs text-green-500 font-bold mt-1">{stat.change}</p>
                            </div>
                            <div className={`p-3 rounded-xl text-white shadow-lg ${stat.color}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                                </svg>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Schools Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100">Recent Registrations</h2>
                        <button className="text-sm font-bold text-purple-600 hover:text-purple-700">View All</button>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">School Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Plan</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Students</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {loading ? <tr><td colSpan="5" className="px-6 py-6 text-center font-bold text-gray-400">Loading data...</td></tr> : 
                             data.recent_schools.length === 0 ? <tr><td colSpan="5" className="px-6 py-6 text-center font-bold text-gray-400">No schools registered yet.</td></tr> :
                             data.recent_schools.map((school) => (
                                <tr key={school.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-800 dark:text-gray-200">{school.name}</div>
                                        <div className="text-xs text-gray-500">Subdomain: {school.domain}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold dark:bg-gray-600 dark:text-gray-300 capitalize">{school.plan || 'Standard'}</span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">-</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${school.status === 'Active' ? 'bg-green-100 text-green-600' :
                                                school.status === 'Trial' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                                            } capitalize`}>
                                            {school.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => navigate('/platform/schools')} className="text-slate-600 font-bold text-xs uppercase hover:underline dark:text-slate-400">Manage</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* System Alerts */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 p-6">
                    <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4">Operations Log</h2>
                    <div className="space-y-6">
                        {loading ? <div className="text-center text-gray-400 font-bold py-4">Loading logs...</div> : data.recent_logs.length === 0 ? <div className="text-center text-gray-400 font-bold py-4">No operations logged yet.</div> : data.recent_logs.map(log => (
                            <div key={log.id} className="flex gap-4">
                                <div className="mt-1">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${log.color === 'red' ? 'bg-red-100 text-red-600' : log.color === 'green' ? 'bg-green-100 text-green-600' : log.color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-gray-200">{log.action_type}</h4>
                                    <p className="text-sm text-gray-500">{log.details}</p>
                                    <span className="text-xs text-gray-400 mt-1 block">{new Date(log.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => navigate('/platform/audit')} className="w-full mt-6 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                        View Audit Log
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlatformDashboard;
