import React, { useState } from 'react';

const LearnerPortfolio = () => {
    const [activeTab, setActiveTab] = useState('all');

    // Mock Portfolio Data
    const portfolioItems = [
        { id: 1, title: 'Environmental Clean-up', type: 'image', url: 'https://via.placeholder.com/300', date: '2023-10-15', tags: ['Community Service', 'Environment'], description: 'Participated in the local market clean-up exercise.' },
        { id: 2, title: 'English Poem Recital', type: 'audio', url: '#', date: '2023-10-10', tags: ['Language', 'Speaking'], description: 'Reciting "The Road Not Taken" for English assessment.' },
        { id: 3, title: 'Science Project: Volcano', type: 'video', url: '#', date: '2023-09-28', tags: ['Science', 'Project'], description: 'Demonstration of a volcanic eruption using baking soda and vinegar.' },
        { id: 4, title: 'Math Shapes Model', type: 'image', url: 'https://via.placeholder.com/300', date: '2023-09-05', tags: ['Mathematics', 'Creative'], description: 'Built a 3D model of a city using geometric shapes.' },
    ];

    const filteredItems = activeTab === 'all' ? portfolioItems : portfolioItems.filter(item => item.type === activeTab);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">My Learner Portfolio</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Evidence of my learning journey and practical projects.</p>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    Upload Evidence
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
                {['all', 'image', 'video', 'audio', 'document'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setActiveTab(type)}
                        className={`px-4 py-2 rounded-full text-sm font-bold capitalize whitespace-nowrap transition-colors ${activeTab === type
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
                            }`}
                    >
                        {type === 'all' ? 'All Items' : type + 's'}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group dark:bg-gray-800 dark:border-gray-700">
                        {/* Preview Area */}
                        <div className="h-48 bg-gray-100 dark:bg-gray-700 relative flex items-center justify-center overflow-hidden">
                            {item.type === 'image' ? (
                                <img src={item.url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            ) : (
                                <div className="text-gray-400 flex flex-col items-center">
                                    {item.type === 'video' && <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                    {item.type === 'audio' && <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>}
                                    <span className="uppercase font-bold text-xs tracking-wider">{item.type}</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <button className="bg-white text-gray-800 p-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex gap-1 flex-wrap">
                                    {item.tags.map(tag => (
                                        <span key={tag} className="text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-500 px-2 py-0.5 rounded dark:bg-gray-700 dark:text-gray-400">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <span className="text-xs text-gray-400">{item.date}</span>
                            </div>
                            <h3 className="font-bold text-gray-800 mb-1 group-hover:text-purple-600 transition-colors dark:text-gray-100 dark:group-hover:text-purple-400">{item.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 dark:text-gray-400">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LearnerPortfolio;
