import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../StatsCard';
import { SkeletonLoader } from '../common/Loader';

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState({
        stats: {
            total_students: 0,
            total_users: 0,
            total_revenue: 0,
            pending_tickets: 0,
            system_health: '100%',
            buses_active: 0
        },
        notices: [],
        fee_chart: [],
        goal_status: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await window.axios.get('/api/admin/stats');
                setData(res.data);
            } catch (err) {
                console.error('Failed to fetch admin stats:', err);
                window.showToast('error', 'Failed to load dashboard data.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KSh' }).format(val);
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Super Admin Dashboard</h1>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {isLoading ? (
                    [...Array(4)].map((_, i) => <SkeletonLoader key={i} type="card" />)
                ) : (
                    <>
                        <StatsCard
                            title="Total Students"
                            value={data.stats.total_students.toLocaleString()}
                            percentage="+0%"
                            trend="up"
                            colorClass="bg-blue-100 text-blue-600"
                            progressColor="bg-blue-500"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                        />
                        <StatsCard
                            title="Revenue"
                            value={formatCurrency(data.stats.total_revenue)}
                            percentage="This Term"
                            trend="up"
                            colorClass="bg-green-100 text-green-600"
                            progressColor="bg-green-500"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                        <StatsCard
                            title="Transport Fleet"
                            value={`${data.stats.buses_active} Buses`}
                            percentage="100% Active"
                            trend="up"
                            colorClass="bg-yellow-100 text-yellow-600"
                            progressColor="bg-yellow-500"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
                        />
                        <StatsCard
                            title="Pending Tickets"
                            value={data.stats.pending_tickets.toString()}
                            percentage="Active Req"
                            trend="down"
                            colorClass="bg-red-100 text-red-600"
                            progressColor="bg-red-500"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
                        />
                    </>
                )}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Notice Board Preview */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Latest Notices</h3>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => window.showToast('success', 'All notices marked as read.')}
                                className="text-sm text-primary font-bold hover:underline"
                            >
                                Mark all as read
                            </button>
                        </div>
                    </div>
                    {isLoading ? (
                        <SkeletonLoader type="table" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-gray-100 dark:border-gray-700">
                                    <tr>
                                        <th className="pb-3 text-[10px] font-black uppercase text-gray-400">Notice Title</th>
                                        <th className="pb-3 text-[10px] font-black uppercase text-gray-400 text-center">Category</th>
                                        <th className="pb-3 text-[10px] font-black uppercase text-gray-400 text-right">Published</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                    {data.notices.map((notice, i) => (
                                        <tr
                                            key={i}
                                            onClick={() => navigate('/notices')}
                                            className="group cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                                        >
                                            <td className="py-4">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`font-bold text-sm ${notice.isNew ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {notice.title}
                                                    </span>
                                                    {notice.isNew && <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>}
                                                </div>
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500">Sent to stakeholders</p>
                                            </td>
                                            <td className="py-4 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${notice.color}`}>
                                                    {notice.tag}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">{notice.date}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Interactive Fee Collection Chart */}
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 flex flex-col">
                    <div className="flex justify-between items-center mb-4 md:mb-6">
                        <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-100">Fee Collection</h3>
                        <div className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded">+12%</div>
                    </div>

                    <div className="flex-1 flex items-end justify-between h-36 md:h-48 px-1 md:px-2 space-x-1 md:space-x-2 mb-4">
                        {data.fee_chart.map((item, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center group cursor-pointer">
                                <div className="w-full relative">
                                    <div
                                        className="w-full bg-gray-100 dark:bg-gray-700 rounded-t-lg transition-all duration-500 group-hover:bg-primary/20"
                                        style={{ height: '120px' }}
                                    >
                                        <div
                                            className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-lg transition-all duration-700 ease-out group-hover:brightness-110"
                                            style={{ height: isLoading ? '0%' : `${item.val}%` }}
                                        >
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-50 transition-all duration-300">
                                                KSh {item.val}k
                                                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-tighter">{item.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-2 p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400 font-medium">Goal Status</span>
                            <span className="font-black text-primary">{data.goal_status}%</span>
                        </div>
                        <div className="mt-2 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-primary animate-pulse" style={{ width: `${data.goal_status}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
