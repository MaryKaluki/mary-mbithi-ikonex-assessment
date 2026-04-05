import React, { useState } from 'react';
import { FeedbackModal } from '../common/Loader';

const RecordPayment = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);

    const students = [
        { id: 1, name: 'John Smith', admNo: 'ADM-001', class: 'Grade 4A', balance: 15000 },
        { id: 2, name: 'Alice Brown', admNo: 'ADM-002', class: 'Grade 5B', balance: 8500 },
        { id: 3, name: 'Tommy Davis', admNo: 'ADM-003', class: 'Grade 3C', balance: 22000 },
    ];

    const recentPayments = [
        { id: 1, receipt: 'RCP-0154', student: 'John Smith', amount: 5000, method: 'M-Pesa', date: '2024-10-28', time: '14:32' },
        { id: 2, receipt: 'RCP-0153', student: 'Alice Brown', amount: 12000, method: 'Bank Transfer', date: '2024-10-28', time: '11:15' },
        { id: 3, receipt: 'RCP-0152', student: 'Emily Davis', amount: 3500, method: 'Cash', date: '2024-10-27', time: '16:45' },
        { id: 4, receipt: 'RCP-0151', student: 'Michael Lee', amount: 8000, method: 'M-Pesa', date: '2024-10-27', time: '10:20' },
    ];

    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('');
    const [feedback, setFeedback] = useState(null);

    const filteredStudents = searchQuery.length >= 2
        ? students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.admNo.toLowerCase().includes(searchQuery.toLowerCase()))
        : [];

    const handleRecordPayment = () => {
        if (!selectedStudent || !amount || !method) {
            setFeedback({ type: 'error', message: 'Wait! You need to select a student and enter the amount/method before submitting.' });
            return;
        }

        // Success State
        setFeedback({
            type: 'success',
            message: `Amazing! The payment of KSh ${parseInt(amount).toLocaleString()} for ${selectedStudent.name} has been securely recorded.`
        });

        // Reset form
        setSelectedStudent(null);
        setAmount('');
        setMethod('');
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Record Payment</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Record fee payments from students</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Form */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="font-bold text-gray-800 mb-4 dark:text-gray-100">New Payment</h3>

                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search student by name or admission no..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            {filteredStudents.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-10 dark:bg-gray-700 dark:border-gray-600">
                                    {filteredStudents.map(s => (
                                        <div
                                            key={s.id}
                                            onClick={() => { setSelectedStudent(s); setSearchQuery(''); }}
                                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer dark:hover:bg-gray-600"
                                        >
                                            <p className="font-medium text-gray-800 dark:text-gray-100">{s.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{s.admNo} - {s.class}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedStudent && (
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 dark:bg-purple-900/20 dark:border-purple-800">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-gray-100">{selectedStudent.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedStudent.admNo} - {selectedStudent.class}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Balance Due</p>
                                        <p className="font-bold text-red-600 dark:text-red-400">KSh {selectedStudent.balance.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <input
                            type="number"
                            placeholder="Amount (KSh)"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />

                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">Select Payment Method</option>
                            <option value="Cash">Cash</option>
                            <option value="M-Pesa">M-Pesa</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Cheque">Cheque</option>
                        </select>

                        <input type="text" placeholder="Reference/Transaction ID" className="w-full px-4 py-3 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />

                        <textarea placeholder="Notes (optional)" rows="2" className="w-full px-4 py-3 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>

                        <button
                            onClick={handleRecordPayment}
                            className="w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg active:scale-95 duration-150"
                        >
                            Record Payment
                        </button>
                    </div>
                </div>

                {/* Recent Payments */}
                <div className="bg-white rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100">Recent Payments Today</h3>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                        {recentPayments.map(payment => (
                            <div key={payment.id} className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{payment.student}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{payment.receipt} | {payment.method} | {payment.time}</p>
                                </div>
                                <span className="font-bold text-green-600 dark:text-green-400">+KSh {payment.amount.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Premium Feedback Modal */}
            {feedback && (
                <FeedbackModal
                    type={feedback.type}
                    message={feedback.message}
                    onClose={() => setFeedback(null)}
                />
            )}
        </div>
    );
};

export default RecordPayment;
