import React from 'react';

export const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
    const sizeClasses = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4'
    };

    return (
        <div className="flex items-center justify-center p-4">
            <div className={`animate-spin rounded-full border-t-transparent ${sizeClasses[size] || sizeClasses.md} ${color === 'primary' ? 'border-primary' : 'border-white'}`}></div>
        </div>
    );
};

export const SkeletonLoader = ({ type = 'table' }) => {
    if (type === 'card') {
        return (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-pulse dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4 dark:bg-gray-700"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 dark:bg-gray-700"></div>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded dark:bg-gray-700"></div>
                    <div className="h-3 bg-gray-200 rounded dark:bg-gray-700"></div>
                </div>
            </div>
        );
    }

    if (type === 'table') {
        return (
            <div className="space-y-4 animate-pulse">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
                        <div className="flex-1 h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
                        <div className="w-24 h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
                        <div className="w-16 h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
                    </div>
                ))}
            </div>
        );
    }

    return null;
};

export const SplashLoader = ({ schoolName, schoolLogo }) => {
    return (
        <div className="fixed inset-0 bg-white dark:bg-black z-[9999] flex flex-col items-center justify-center">
            <div className="mb-8 relative">
                {schoolLogo ? (
                    <img src={schoolLogo} className="w-20 h-20 rounded-2xl object-cover animate-bounce shadow-2xl" alt="Logo" />
                ) : (
                    <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center animate-bounce shadow-xl shadow-primary/30">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                        </svg>
                    </div>
                )}
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-black animate-pulse"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 animate-pulse">{schoolName || 'Skullu 2.0'}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 tracking-widest uppercase">Initializing System...</p>
            <div className="w-48 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-progress-flow"></div>
            </div>
            <style jsx="true">{`
                @keyframes progress-flow {
                    0% { width: 0%; transform: translateX(-100%); }
                    50% { width: 50%; transform: translateX(50%); }
                    100% { width: 100%; transform: translateX(100%); }
                }
                .animate-progress-flow {
                    animation: progress-flow 2s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
};

export const NotificationToast = ({ type = 'success', message, onClose }) => {
    const icons = {
        success: (
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            </div>
        ),
        error: (
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
        )
    };

    return (
        <div className="fixed top-20 right-4 z-[9999] animate-slide-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 flex items-center space-x-4 min-w-[300px]">
                {icons[type]}
                <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{type === 'success' ? 'Success!' : 'System Error'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{message}</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>
    );
};

export const FeedbackModal = ({ type = 'success', message, onClose }) => {
    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-10 max-w-sm w-full text-center animate-modal-pop border border-white/20">
                <div className="mb-8 flex justify-center">
                    {type === 'success' ? (
                        <div className="w-28 h-28 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-green-500/40 animate-checkmark-bounce">
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    ) : (
                        <div className="w-28 h-28 bg-red-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-red-500/40 animate-error-shake">
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    )}
                </div>

                <h3 className={`text-3xl font-black mb-3 ${type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {type === 'success' ? 'Success!' : 'Oops!'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-10 text-lg leading-relaxed">
                    {message}
                </p>

                <button
                    onClick={onClose}
                    className={`w-full py-5 rounded-2xl font-black text-white text-lg transition-all transform active:scale-95 shadow-xl ${type === 'success'
                        ? 'bg-green-600 hover:bg-green-700 shadow-green-200 dark:shadow-none'
                        : 'bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none'
                        }`}
                >
                    Got it!
                </button>
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes modal-pop {
                    0% { transform: scale(0.5); opacity: 0; }
                    70% { transform: scale(1.08); }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes checkmark-bounce {
                    0% { transform: scale(0); rotate: -45deg; }
                    50% { transform: scale(1.2); rotate: 10deg; }
                    100% { transform: scale(1); rotate: 0; }
                }
                @keyframes error-shake {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-10px); }
                    40% { transform: translateX(10px); }
                    60% { transform: translateX(-10px); }
                    80% { transform: translateX(10px); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
                .animate-modal-pop { animation: modal-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
                .animate-checkmark-bounce { animation: checkmark-bounce 0.6s 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
                .animate-error-shake { animation: error-shake 0.5s 0.2s ease-in-out; }
            `}</style>
        </div>
    );
};

export const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, type = 'danger' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 max-w-sm w-full text-center animate-modal-pop border border-white/10">
                <div className="mb-4 md:mb-6 flex justify-center text-4xl md:text-5xl">
                    {type === 'danger' ? '⚠️' : '❓'}
                </div>

                <h3 className="text-xl md:text-2xl font-black mb-2 text-gray-800 dark:text-gray-100">
                    {title || 'Are you sure?'}
                </h3>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-6 md:mb-8 leading-relaxed">
                    {message || 'This action cannot be undone. Please confirm to proceed.'}
                </p>

                <div className="flex space-x-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3.5 rounded-2xl font-bold bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600 transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-3.5 rounded-2xl font-bold text-white transition-all transform active:scale-95 shadow-lg ${type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'
                            }`}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};
