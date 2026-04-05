import React, { useState } from 'react';

const FinanceTemplates = ({ type }) => {
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const templates = [
        { id: 1, title: 'Fee Balance Reminder (Friendly)', type: 'SMS', content: 'Dear Parent, this is a gentle reminder that {student_name} has a pending balance of {balance}. Please clear by {date}.' },
        { id: 2, title: 'Fee Balance Warning (Urgent)', type: 'SMS', content: 'URGENT: Outstanding fees for {student_name} are overdue. Please pay {balance} immediately to avoid disruption.' },
        { id: 3, title: 'Payment Receipt', type: 'Email', content: 'Dear Parent,\n\nWe have received your payment of {amount} for {student_name}.\n\nThank you,\nFinance Office' },
    ];

    const filteredTemplates = templates.filter(t => type ? t.type.toLowerCase() === type : true);

    return (
        <div className="space-y-6 pb-20">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{type ? type.toUpperCase() : ''} Communication Templates</h2>
            <p className="text-gray-500">Manage standard messages for finance notifications.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Template List */}
                <div className="md:col-span-1 space-y-3">
                    {filteredTemplates.map(temp => (
                        <div
                            key={temp.id}
                            onClick={() => setSelectedTemplate(temp)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedTemplate?.id === temp.id ? 'bg-purple-50 border-purple-500 dark:bg-purple-900/20' : 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700 hover:border-purple-300'}`}
                        >
                            <div className="font-bold text-gray-800 dark:text-gray-200">{temp.title}</div>
                            <div className="text-xs text-gray-500 mt-1 truncate">{temp.content}</div>
                            <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400">{temp.type}</span>
                        </div>
                    ))}
                    <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-purple-500 hover:text-purple-600 transition-colors">
                        + Create New Template
                    </button>
                </div>

                {/* Editor */}
                <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    {selectedTemplate ? (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Template Name</label>
                                <input type="text" className="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600" defaultValue={selectedTemplate.title} />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Message Content</label>
                                <textarea className="w-full border rounded-lg px-4 py-2 h-48 dark:bg-gray-700 dark:border-gray-600 font-mono text-sm" defaultValue={selectedTemplate.content}></textarea>
                                <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                                    {['{student_name}', '{balance}', '{amount}', '{date}', '{term}'].map(variable => (
                                        <span key={variable} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono cursor-pointer hover:bg-gray-200">{variable}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button className="px-4 py-2 text-gray-500 font-bold hover:text-gray-800">Delete</button>
                                <button className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700">Save Changes</button>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 flex-col">
                            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            <p>Select a template to edit</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinanceTemplates;
