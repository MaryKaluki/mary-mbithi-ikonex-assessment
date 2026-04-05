import React, { useEffect, useState } from 'react';

const palette = ['#6366f1','#ec4899','#10b981','#f59e0b','#3b82f6','#8b5cf6'];

const FeePayments = () => {
    const [children, setChildren] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        fetch('/api/parent/fees', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => { setChildren(d.children || []); setLoading(false); })
            .catch(() => { setError('Failed to load fee data.'); setLoading(false); });
    }, []);

    if (loading) return (
        <div className="space-y-3 animate-pulse">
            {[1,2].map(i => <div key={i} className="h-24 bg-white rounded-2xl"></div>)}
        </div>
    );
    if (error) return <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl text-red-600 text-sm">{error}</div>;

    /* ── Detail view ─────────────────────────────────── */
    if (selected !== null) {
        const child = children.find(c => c.id === selected);
        if (!child) { setSelected(null); return null; }
        const balanceDue = (child.balance || 0) > 0;
        const initials = (child.name || '?').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
        const idx = children.indexOf(child);

        return (
            <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <button
                        onClick={() => setSelected(null)}
                        className="flex items-center gap-2 px-5 py-3 border-b border-gray-50 dark:border-gray-700 text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors w-full text-left"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                        Back to all children
                    </button>
                    <div className="flex items-center gap-4 px-5 py-4">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-sm" style={{ background: palette[idx % palette.length] }}>
                            {initials}
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 dark:text-gray-100 text-lg">{child.name}</p>
                            <p className="text-sm text-gray-400">{child.grade_level}</p>
                        </div>
                    </div>
                </div>

                {/* Balance card */}
                <div
                    className="rounded-2xl p-5 text-white shadow-lg relative overflow-hidden"
                    style={{ background: balanceDue ? 'linear-gradient(135deg,#ef4444,#b91c1c)' : 'linear-gradient(135deg,#10b981,#059669)' }}
                >
                    <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white opacity-10"></div>
                    <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">
                        {balanceDue ? 'Balance Due' : 'Account Status'}
                    </p>
                    <p className="text-3xl font-black mt-1">
                        {balanceDue ? `KES ${Number(child.balance).toLocaleString()}` : 'Fully Paid ✓'}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-white/80">
                        <span>Total: KES {Number(child.fee_total || 0).toLocaleString()}</span>
                        <span>Paid: KES {Number(child.total_paid || 0).toLocaleString()}</span>
                    </div>
                </div>

                {/* Transactions */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100">Payment History</h3>
                        <span className="text-xs text-gray-400">{(child.payments || []).length} record{(child.payments || []).length !== 1 ? 's' : ''}</span>
                    </div>
                    {(!child.payments || child.payments.length === 0) ? (
                        <div className="px-5 py-8 text-center text-gray-400 text-sm">No payments recorded yet.</div>
                    ) : (
                        <div className="divide-y divide-gray-50 dark:divide-gray-700">
                            {child.payments.map((p, pi) => (
                                <div key={pi} className="flex items-center gap-4 px-5 py-3.5">
                                    <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">{p.description || 'Fee Payment'}</p>
                                        <p className="text-xs text-gray-400">{p.payment_date} · {p.payment_method}</p>
                                    </div>
                                    <p className="font-bold text-green-600 text-sm flex-shrink-0">+KES {Number(p.amount).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    /* ── Child selection ─────────────────────────────── */
    return (
        <div className="space-y-3">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest px-1">Select a student</p>
            {children.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700 text-gray-400 text-sm">
                    No children linked to this account.
                </div>
            ) : children.map((child, i) => {
                const balanceDue = (child.balance || 0) > 0;
                const initials = (child.name || '?').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
                return (
                    <button
                        key={child.id}
                        onClick={() => setSelected(child.id)}
                        className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 px-5 py-4 hover:shadow-md active:scale-[0.98] transition-all text-left"
                    >
                        <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0 shadow-sm" style={{ background: palette[i % palette.length] }}>
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 dark:text-gray-100">{child.name}</p>
                            <p className="text-xs text-gray-400">{child.grade_level}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <p className={`font-bold text-sm ${balanceDue ? 'text-red-500' : 'text-green-600'}`}>
                                {balanceDue ? `KES ${Number(child.balance).toLocaleString()}` : 'Paid ✓'}
                            </p>
                            <p className="text-[10px] text-gray-400">{balanceDue ? 'balance due' : 'no balance'}</p>
                        </div>
                        <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                );
            })}
        </div>
    );
};

export default FeePayments;
