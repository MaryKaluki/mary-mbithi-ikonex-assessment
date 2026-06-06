import React, { useState } from 'react';

const GATEWAYS = [
    { key: 'mpesa',  label: 'M-Pesa (Daraja)',   enabled: true  },
    { key: 'stripe', label: 'Stripe',             enabled: true  },
    { key: 'paypal', label: 'PayPal',             enabled: false },
];

const COMMS = [
    { key: 'at',   label: "Africa's Talking", connected: true  },
    { key: 'twil', label: 'Twilio',           connected: false },
    { key: 'smtp', label: 'SMTP (Gmail)',      connected: true  },
];

const Integrations = () => {
    const [gateways, setGateways] = useState(
        GATEWAYS.reduce((acc, g) => ({ ...acc, [g.key]: g.enabled }), {})
    );

    const toggle = (key) => setGateways(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="flex flex-col space-y-3 h-full pb-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <nav className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                        Admin <span className="mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Integrations</span>
                    </nav>
                    <h1 className="text-base font-bold text-slate-800 dark:text-gray-100 leading-tight">Third-Party Integrations</h1>
                </div>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-2 flex-shrink-0">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20">
                    <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                        {Object.values(gateways).filter(Boolean).length}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Gateways</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20">
                    <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                        {COMMS.filter(c => c.connected).length}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Connected Comms</span>
                </div>
            </div>

            <div className="flex gap-3 flex-1 min-h-0">

                {/* Payment Gateways */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col">
                    <div className="flex-shrink-0 px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700 rounded-t-lg">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Payment Gateways</span>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Provider</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-24 text-center">Status</th>
                                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-20 text-center">Toggle</th>
                                </tr>
                            </thead>
                            <tbody>
                                {GATEWAYS.map((g, i) => (
                                    <tr key={g.key} className={`border-b border-slate-100 dark:border-gray-700/60 ${
                                        i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                    }`}>
                                        <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{g.label}</td>
                                        <td className="px-3 py-2 text-center">
                                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                                gateways[g.key]
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                    : 'bg-slate-100 dark:bg-gray-700 text-slate-400 dark:text-gray-500'
                                            }`}>{gateways[g.key] ? 'Enabled' : 'Disabled'}</span>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <button onClick={() => toggle(g.key)}
                                                className={`w-10 h-5 rounded-full relative transition-colors ${gateways[g.key] ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-gray-600'}`}>
                                                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${gateways[g.key] ? 'translate-x-5' : 'translate-x-0.5'}`}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30">
                        <button className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">Configure API Keys</button>
                    </div>
                </div>

                {/* Right column */}
                <div className="flex-1 flex flex-col gap-3">

                    {/* SMS / Email */}
                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col">
                        <div className="flex-shrink-0 px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700 rounded-t-lg">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">SMS &amp; Email Providers</span>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">Provider</th>
                                        <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 w-28 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {COMMS.map((c, i) => (
                                        <tr key={c.key} className={`border-b border-slate-100 dark:border-gray-700/60 ${
                                            i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/70 dark:bg-gray-900/30'
                                        }`}>
                                            <td className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{c.label}</td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                                    c.connected
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                        : 'bg-slate-100 dark:bg-gray-700 text-slate-400 dark:text-gray-500'
                                                }`}>{c.connected ? 'Connected' : 'Inactive'}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* API Key */}
                    <div className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
                        <div className="px-4 py-2.5 bg-slate-50 dark:bg-gray-900/30 border-b border-slate-100 dark:border-gray-700 rounded-t-lg">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Developer API</span>
                        </div>
                        <div className="p-4">
                            <div className="bg-slate-900 rounded-md px-3 py-2 font-mono text-xs text-emerald-400 overflow-x-auto mb-3">
                                sk_live_51J2xxxxxxx...
                            </div>
                            <div className="flex gap-4">
                                <button className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors">Regenerate Key</button>
                                <button className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors">View Docs</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Integrations;
