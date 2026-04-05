import React, { useState, useEffect } from 'react';

const SchoolManager = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSchools = () => {
        window.axios.get('/api/platform/schools').then(res => {
            setSchools(res.data);
            setLoading(false);
        }).catch(err => {
            console.error('Failed to load schools', err);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchSchools();
    }, []);

    const handleImpersonate = (schoolName) => {
        if (window.confirm(`GOD MODE: You are about to login as the Super Admin of ${schoolName}. Continue?`)) {
            // Logic to switch context
            window.showToast('success', `Accessing ${schoolName} as Super Admin...`);
        }
    };

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingSchool, setEditingSchool] = useState(null);
    const [newSchool, setNewSchool] = useState({ 
        name: '', domain: '', adminEmail: '', plan: 'Standard', schoolType: 'Primary (CBC)',
        phone: '', address: '', deploymentDate: new Date().toISOString().split('T')[0]
    });

    const handleCreateSchool = (e) => {
        e.preventDefault();
        const payload = {
            name: newSchool.name,
            domain: newSchool.domain,
            school_type: newSchool.schoolType,
            phone: newSchool.phone,
            address: newSchool.address,
            deployment_date: newSchool.deploymentDate,
            admin_email: newSchool.adminEmail,
            plan: newSchool.plan
        };
        
        window.axios.post('/api/platform/schools', payload).then(res => {
            setShowCreateModal(false);
            setNewSchool({ 
                name: '', domain: '', adminEmail: '', plan: 'Standard', schoolType: 'Primary (CBC)',
                phone: '', address: '', deploymentDate: new Date().toISOString().split('T')[0]
            });
            window.showToast('success', `${payload.name} has been deployed successfully!`);
            fetchSchools(); // Refresh the list
        }).catch(err => {
            console.error(err);
            window.showToast('error', err.response?.data?.message || 'Failed to deploy school.');
        });
    };

    const handleEditSchool = (school) => {
        setEditingSchool({
            ...school,
            schoolType: school.school_type,
            deploymentDate: school.deployment_date || '',
            storage_limit_mb: school.storage_limit_mb || 5000
        });
        setShowEditModal(true);
    };

    const handleUpdateSchool = (e) => {
        e.preventDefault();
        const payload = {
            name: editingSchool.name,
            domain: editingSchool.domain,
            school_type: editingSchool.schoolType,
            phone: editingSchool.phone,
            address: editingSchool.address,
            deployment_date: editingSchool.deploymentDate,
            plan: editingSchool.plan,
            status: editingSchool.status,
            storage_limit_mb: editingSchool.storage_limit_mb
        };
        
        window.axios.put(`/api/platform/schools/${editingSchool.id}`, payload).then(res => {
            setShowEditModal(false);
            window.showToast('success', `${payload.name} updated successfully!`);
            fetchSchools();
        }).catch(err => {
            console.error(err);
            window.showToast('error', err.response?.data?.message || 'Update failed.');
        });
    };

    const handleNuke = (schoolId) => {
        if (window.prompt('GOD MODE: Type "NUKE" to confirm complete deletion of this tenant database. This is irreversible.') === 'NUKE') {
            window.showToast('error', 'Initiating destruction protocol...');
            window.axios.delete(`/api/platform/schools/${schoolId}`).then(res => {
                window.showToast('success', 'Tenant database completely purged.');
                fetchSchools();
            }).catch(err => {
                window.showToast('error', 'Failed to destroy tenant. Check logs.');
            });
        }
    };

    const filteredSchools = schools.filter(school => school.name.toLowerCase().includes(searchTerm.toLowerCase()) || school.domain.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                        <span className="p-2 bg-slate-800 text-white rounded-lg mr-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </span>
                        Manage Schools (Tenants)
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Platform Admin Control Panel</p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <button className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                        Global Panic Stop
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-black transition-colors shadow-lg hover:-translate-y-0.5 transform flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Deploy New School
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <input
                    type="text"
                    placeholder="Search by School Name, Domain, or Admin..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Schools List */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 dark:bg-gray-900/50 dark:border-gray-700 text-xs font-bold text-gray-500 uppercase">
                    <div className="col-span-4">School Details</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-2 text-center">Plan</div>
                    <div className="col-span-2 text-right">Renewal</div>
                    <div className="col-span-2 text-center">Actions</div>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {loading ? <div className="text-center p-8 font-bold text-gray-400">Loading Tenants...</div> : 
                     filteredSchools.length === 0 ? <div className="text-center p-8 font-bold text-gray-400">No schools matching search.</div> : 
                     filteredSchools.map((school) => (
                        <div key={school.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors dark:hover:bg-gray-700/30">
                            <div className="col-span-4 flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white uppercase shrink-0 ${school.name.includes('Msingi') ? 'bg-orange-500' : 'bg-slate-600'}`}>
                                    {school.name.substring(0, 2)}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-gray-800 text-sm truncate dark:text-gray-100">{school.name}</h3>
                                    <p className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{school.id} - {school.school_type} - {school.domain}.skullu.com</p>
                                </div>
                            </div>
                            
                            <div className="col-span-2 text-left lg:text-center flex items-center lg:justify-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${school.status === 'Suspended' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    {school.status}
                                </span>
                            </div>

                            <div className="col-span-2 text-left lg:text-center font-bold text-xs uppercase">
                                <span className={`${school.plan === 'Enterprise' ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                    {school.plan}
                                </span>
                            </div>

                            <div className="col-span-2 text-right text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                {school.subscription?.next_billing_date ? new Date(school.subscription.next_billing_date).toLocaleDateString() : 'N/A'}
                            </div>

                            <div className="col-span-2 flex items-center justify-end lg:justify-center gap-1">
                                <button
                                    onClick={() => handleEditSchool(school)}
                                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:hover:bg-blue-900/30"
                                    title="Edit Information"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button
                                    onClick={() => handleImpersonate(school.name)}
                                    className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors dark:hover:bg-purple-900/30"
                                    title="Impersonate"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                                </button>
                                <button className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:hover:bg-blue-900/30" title="Manage Subscription">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                </button>
                                <button
                                    onClick={() => handleNuke(school.id)}
                                    className="p-1.5 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/30"
                                    title="Nuke"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create School Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden dark:bg-gray-800 animate-scale-in">
                        <div className="bg-slate-800 p-6 flex justify-between items-center text-white">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                Deploy New Tenant
                            </h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateSchool} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">School Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="e.g. Hilltop Academy"
                                    value={newSchool.name}
                                    onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Subdomain</label>
                                    <div className="flex">
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-slate-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="hilltop"
                                            value={newSchool.domain}
                                            onChange={(e) => setNewSchool({ ...newSchool, domain: e.target.value })}
                                        />
                                        <span className="bg-gray-100 px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg text-gray-500 text-sm flex items-center dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300">
                                            .skullu.com
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Deployment Date</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={newSchool.deploymentDate}
                                        onChange={(e) => setNewSchool({ ...newSchool, deploymentDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Phone Number</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="+254..."
                                        value={newSchool.phone}
                                        onChange={(e) => setNewSchool({ ...newSchool, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Plan</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={newSchool.plan}
                                        onChange={(e) => setNewSchool({ ...newSchool, plan: e.target.value })}
                                    >
                                        <option value="Basic">Basic (Free Trial)</option>
                                        <option value="Standard">Standard</option>
                                        <option value="Enterprise">Enterprise</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Admin Email</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="admin@school.com"
                                    value={newSchool.adminEmail}
                                    onChange={(e) => setNewSchool({ ...newSchool, adminEmail: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1">Default password will be sent to this email.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Physical Address</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    rows="2"
                                    placeholder="e.g. Mombasa Road, Nairobi"
                                    value={newSchool.address}
                                    onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">School Type</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={newSchool.schoolType}
                                    onChange={(e) => setNewSchool({ ...newSchool, schoolType: e.target.value })}
                                >
                                    <option value="Kindergarten">Kindergarten</option>
                                    <option value="Primary (CBC)">Primary (CBC)</option>
                                    <option value="Junior School">Junior School</option>
                                    <option value="Senior School">Senior School</option>
                                    <option value="Hybrid">Hybrid (8-4-4 & CBC)</option>
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-lg"
                                >
                                    Launch School
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit School Modal */}
            {showEditModal && editingSchool && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden dark:bg-gray-800 animate-scale-in">
                        <div className="bg-blue-800 p-6 flex justify-between items-center text-white">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                Edit School Info
                            </h3>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateSchool} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">School Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={editingSchool.name}
                                    onChange={(e) => setEditingSchool({ ...editingSchool, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Phone</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={editingSchool.phone || ''}
                                        onChange={(e) => setEditingSchool({ ...editingSchool, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">System Status</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={editingSchool.status}
                                        onChange={(e) => setEditingSchool({ ...editingSchool, status: e.target.value })}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Suspended">Suspended</option>
                                        <option value="Trial">Trial</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Physical Address</label>
                                    <textarea
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        rows="2"
                                        value={editingSchool.address || ''}
                                        onChange={(e) => setEditingSchool({ ...editingSchool, address: e.target.value })}
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Total Storage Limit (MB)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={editingSchool.storage_limit_mb || 5000}
                                        onChange={(e) => setEditingSchool({ ...editingSchool, storage_limit_mb: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Deployment Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={editingSchool.deploymentDate || ''}
                                        onChange={(e) => setEditingSchool({ ...editingSchool, deploymentDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Plan</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={editingSchool.plan}
                                        onChange={(e) => setEditingSchool({ ...editingSchool, plan: e.target.value })}
                                    >
                                        <option value="Basic">Basic</option>
                                        <option value="Standard">Standard</option>
                                        <option value="Enterprise">Enterprise</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchoolManager;
