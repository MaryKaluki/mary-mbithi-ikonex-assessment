import React, { useState } from 'react';

const MessagingCenter = () => {
    const [channel, setChannel] = useState('sms');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 lg:h-[calc(100vh-140px)]">
            {/* Sidebar / Compose */}
            <div className="lg:col-span-1 bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 flex flex-col dark:bg-gray-800 dark:border-gray-700">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 dark:text-gray-100">Messaging Center</h2>

                {/* Channel Toggle */}
                <div className="bg-gray-100 p-1 rounded-xl flex mb-6 dark:bg-gray-700">
                    <button
                        onClick={() => setChannel('sms')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${channel === 'sms' ? 'bg-white text-purple-600 shadow-sm dark:bg-gray-600 dark:text-purple-300' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                        SMS
                    </button>
                    <button
                        onClick={() => setChannel('email')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${channel === 'email' ? 'bg-white text-purple-600 shadow-sm dark:bg-gray-600 dark:text-purple-300' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                        Email
                    </button>
                </div>

                {/* Form */}
                <div className="space-y-4 flex-1">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 dark:text-gray-400">To</label>
                        <select className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <option>All Parents</option>
                            <option>All Staff</option>
                            <option>Grade 5 Parents</option>
                            <option>Transport Drivers</option>
                        </select>
                    </div>

                    {channel === 'email' && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 dark:text-gray-400">Subject</label>
                            <input type="text" className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Newsletter..." />
                        </div>
                    )}

                    <div className="flex-1 flex flex-col">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 dark:text-gray-400">Message</label>
                        <textarea
                            className="w-full flex-1 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 bg-gray-50 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder={channel === 'sms' ? "Type your short message here..." : "Compose your email..."}
                        ></textarea>
                        {channel === 'sms' && <p className="text-xs text-right text-gray-400 mt-1 dark:text-gray-500">0/160 characters</p>}
                    </div>

                    <button className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-lg hover:-translate-y-1">
                        Send {channel === 'sms' ? 'Broadcast' : 'Email'}
                    </button>
                </div>
            </div>

            {/* History / Logs */}
            <div className="lg:col-span-2 bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                <div className="p-4 md:p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between gap-3 dark:border-gray-700">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">Communication Logs</h3>
                    <div className="flex space-x-2">
                        <input type="text" placeholder="Search logs..." className="border border-gray-200 rounded-lg px-3 py-1 text-sm focus:ring-purple-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto p-0">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase sticky top-0 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Title/Preview</th>
                                <th className="px-6 py-4">Recipient</th>
                                <th className="px-6 py-4">Channel</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {[
                                { date: 'Oct 24, 10:00 AM', title: 'School Closing Early', to: 'All Parents', type: 'SMS', status: 'Delivered', color: 'bg-green-100 text-green-600' },
                                { date: 'Oct 20, 08:30 AM', title: 'Term 1 Newsletter', to: 'All Parents', type: 'Email', status: 'Sent', color: 'bg-blue-100 text-blue-600' },
                                { date: 'Oct 18, 02:15 PM', title: 'Staff Meeting Reminder', to: 'All Staff', type: 'SMS', status: 'Failed (2)', color: 'bg-red-100 text-red-600' },
                                { date: 'Oct 15, 09:00 AM', title: 'Fee Balance Reminder', to: 'Grade 6 Parents', type: 'SMS', status: 'Delivered', color: 'bg-green-100 text-green-600' },
                            ].map((msg, i) => (
                                <tr key={i} className="hover:bg-purple-50 transition-colors dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400">{msg.date}</td>
                                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-100">{msg.title}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{msg.to}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${msg.type === 'SMS' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'}`}>{msg.type}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${msg.color} dark:bg-opacity-20`}>{msg.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MessagingCenter;
