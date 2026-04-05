import React, { useEffect, useState } from 'react';

const PATHWAYS = [
    {
        id: 'STEM',
        name: 'STEM Pathway',
        fullName: 'Science, Technology, Engineering & Mathematics',
        color: 'bg-blue-600',
        lightColor: 'bg-blue-50',
        ringColor: 'ring-blue-200',
        borderColor: 'border-blue-400',
        description: 'Focuses on Sciences, Mathematics, and Technology. Ideal for future engineers, doctors, and scientists.',
        subjects: ['Mathematics Adv', 'Physics', 'Chemistry', 'Biology', 'Computer Science'],
    },
    {
        id: 'Arts & Sports Science',
        name: 'Arts & Sports Science',
        fullName: 'Arts and Sports Science Pathway',
        color: 'bg-pink-600',
        lightColor: 'bg-pink-50',
        ringColor: 'ring-pink-200',
        borderColor: 'border-pink-400',
        description: 'Focuses on creative arts, performing arts, and physical education. Ideal for artists, musicians, and athletes.',
        subjects: ['Performing Arts', 'Visual Arts', 'Sports Science', 'Music', 'History'],
    },
    {
        id: 'Social Sciences',
        name: 'Social Sciences',
        fullName: 'Social Sciences Pathway',
        color: 'bg-yellow-600',
        lightColor: 'bg-yellow-50',
        ringColor: 'ring-yellow-200',
        borderColor: 'border-yellow-400',
        description: 'Focuses on languages, humanities, and business studies. Ideal for lawyers, business leaders, and diplomats.',
        subjects: ['History & Gov', 'Religious Education', 'Business Studies', 'Geography', 'Languages'],
    },
];

const PathwaySelector = () => {
    const [selected, setSelected]   = useState(null);   // currently highlighted choice
    const [confirmed, setConfirmed] = useState(null);   // saved value from DB
    const [saving, setSaving]       = useState(false);
    const [loading, setLoading]     = useState(true);

    const token = localStorage.getItem('auth_token');

    useEffect(() => {
        fetch('/api/student/pathway', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => {
                if (d.pathway) {
                    setConfirmed(d.pathway);
                    setSelected(d.pathway);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const confirmSelection = () => {
        if (!selected) return;
        if (!window.confirm('Are you sure? This pathway choice will be saved to your profile.')) return;
        setSaving(true);
        fetch('/api/student/pathway', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ pathway: selected }),
        })
            .then(r => r.json())
            .then(d => {
                if (d.pathway) setConfirmed(d.pathway);
                setSaving(false);
            })
            .catch(() => setSaving(false));
    };

    if (loading) return <div className="flex items-center justify-center h-48 text-gray-400">Loading pathway…</div>;

    const confirmedPathway = PATHWAYS.find(p => p.id === confirmed);

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Senior School Pathway Selection</h2>
                <p className="text-gray-500 mt-2 dark:text-gray-400">Choose your specialization track for Grade 10–12.</p>
            </div>

            {confirmed && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 max-w-xl mx-auto dark:bg-green-900/20 dark:border-green-800">
                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">✓</div>
                    <div>
                        <p className="text-sm font-bold text-green-800 dark:text-green-300">Current pathway: {confirmedPathway?.name}</p>
                        <p className="text-xs text-green-600 dark:text-green-500">You can update your selection below.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {PATHWAYS.map(pathway => (
                    <div
                        key={pathway.id}
                        onClick={() => setSelected(pathway.id)}
                        className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-xl bg-white dark:bg-gray-800
                            ${selected === pathway.id
                                ? `${pathway.borderColor} ring-4 ${pathway.ringColor} scale-105 z-10`
                                : 'border-gray-100 hover:border-gray-200 dark:border-gray-700'}`}
                    >
                        <div className={`w-14 h-14 rounded-2xl ${pathway.lightColor} dark:bg-opacity-20 flex items-center justify-center mb-4`}>
                            <div className={`w-8 h-8 rounded-full ${pathway.color}`}></div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2 dark:text-gray-100">{pathway.name}</h3>
                        <p className="text-sm text-gray-500 mb-6 min-h-[60px] dark:text-gray-400">{pathway.description}</p>
                        <div className="space-y-2">
                            <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">Key Subjects</p>
                            <div className="flex flex-wrap gap-2">
                                {pathway.subjects.map(sub => (
                                    <span key={sub} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs font-bold rounded border border-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">{sub}</span>
                                ))}
                            </div>
                        </div>
                        {selected === pathway.id && (
                            <div className="absolute top-4 right-4 text-blue-500">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex justify-center">
                <button
                    onClick={confirmSelection}
                    disabled={!selected || saving || selected === confirmed}
                    className={`px-10 py-4 rounded-xl font-bold text-lg shadow-xl transition-all
                        ${selected && selected !== confirmed
                            ? 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-600'}`}
                >
                    {saving ? 'Saving…' : confirmed && selected === confirmed ? 'Pathway Saved' : 'Confirm Pathway Choice'}
                </button>
            </div>
        </div>
    );
};

export default PathwaySelector;
