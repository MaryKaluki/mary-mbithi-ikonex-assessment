import React from 'react';

const ChequeClearance = () => {
    const cheques = [
        { id: 'CHQ-8899', bank: 'KCB Bank', amount: 'KSh 50,000', payer: 'Alice Walker', date: '2024-02-01', status: 'Uncleared' },
        { id: 'CHQ-9900', bank: 'Equity Bank', amount: 'KSh 32,500', payer: 'Bob Smith', date: '2024-01-28', status: 'Deposited' },
        { id: 'CHQ-7766', bank: 'Absa Bank', amount: 'KSh 120,000', payer: 'Charlie Brown', date: '2024-01-25', status: 'Cleared' },
        { id: 'CHQ-5544', bank: 'NCBA Bank', amount: 'KSh 15,000', payer: 'Diana Prince', date: '2024-01-20', status: 'Bounced' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Cleared': return 'bg-green-100 text-green-600';
            case 'Deposited': return 'bg-blue-100 text-blue-600';
            case 'Uncleared': return 'bg-gray-100 text-gray-600';
            case 'Bounced': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Cheque Clearance</h2>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Cheque #</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Bank</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Payer</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {cheques.map((chq) => (
                            <tr key={chq.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">{chq.id}</td>
                                <td className="px-6 py-4 text-sm font-medium">{chq.bank}</td>
                                <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">{chq.amount}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{chq.payer}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{chq.date}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(chq.status)}`}>{chq.status}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {chq.status === 'Deposited' || chq.status === 'Uncleared' ? (
                                        <button className="text-green-600 text-xs font-bold uppercase hover:underline">Mark Cleared</button>
                                    ) : (
                                        <span className="text-gray-400 text-xs">-</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ChequeClearance;
