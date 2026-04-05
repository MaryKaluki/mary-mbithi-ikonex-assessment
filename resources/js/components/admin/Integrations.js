import React, { useState } from 'react';

const Integrations = () => {
    const [enabled, setEnabled] = useState({
        stripe: true,
        mpesa: true,
        paypal: false,
    });

    const toggle = (key) => setEnabled(prev => ({ ...prev, [key]: !prev[key] }));

    const ToggleSwitch = ({ id }) => (
        <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
            <input
                type="checkbox"
                checked={enabled[id]}
                onChange={() => toggle(id)}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
            />
            <label
                className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${enabled[id] ? 'bg-green-400' : 'bg-gray-300'}`}
            />
        </div>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Third-Party Integrations</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Payment Gateways */}
                <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center dark:text-gray-100">
                        <svg className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        Payment Gateways
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg dark:border-gray-700">
                            <span className="font-bold text-gray-700 dark:text-gray-300">Stripe</span>
                            <ToggleSwitch id="stripe" />
                        </div>
                        <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg dark:border-gray-700">
                            <span className="font-bold text-gray-700 dark:text-gray-300">M-Pesa (Daraja)</span>
                            <ToggleSwitch id="mpesa" />
                        </div>
                        <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg dark:border-gray-700">
                            <span className="font-bold text-gray-700 dark:text-gray-300">PayPal</span>
                            <ToggleSwitch id="paypal" />
                        </div>
                    </div>
                    <button className="mt-4 w-full py-2 bg-purple-50 text-purple-600 font-bold rounded-lg text-sm hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50">Configure Keys</button>
                </div>

                {/* Communication & SMS */}
                <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center dark:text-gray-100">
                        <svg className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        SMS & Email Providers
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg dark:border-gray-700">
                            <span className="font-bold text-gray-700 dark:text-gray-300">Africa's Talking</span>
                            <span className="text-xs text-green-600 font-bold bg-green-100 px-2 py-1 rounded dark:bg-green-900/30 dark:text-green-300">Connected</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg dark:border-gray-700">
                            <span className="font-bold text-gray-700 dark:text-gray-300">Twilio</span>
                            <span className="text-xs text-gray-400 font-bold bg-gray-100 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-500">Inactive</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg dark:border-gray-700">
                            <span className="font-bold text-gray-700 dark:text-gray-300">SMTP (Gmail)</span>
                            <span className="text-xs text-green-600 font-bold bg-green-100 px-2 py-1 rounded dark:bg-green-900/30 dark:text-green-300">Connected</span>
                        </div>
                    </div>
                </div>

                {/* API Access */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-2 dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 dark:text-gray-100">Developer API</h3>
                    <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">Manage API keys for external applications to access school data.</p>
                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
                        sk_live_51J2xxxxxxx...
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row gap-4">
                        <button className="text-sm font-bold text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">Regenerate Key</button>
                        <button className="text-sm font-bold text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">View Documentation</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Integrations;

