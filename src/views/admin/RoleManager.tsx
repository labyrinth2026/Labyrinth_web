import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchFromSheet } from '@/services/api';
import { Plus, Trash2, Shield, Users, RefreshCw, X, Search, ToggleLeft, ToggleRight, Check, Ban, Edit2 } from 'lucide-react';

export default function RoleManager() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users_dir' | 'admins' | 'committees' | 'verticals'>('users_dir');
  const [loading, setLoading] = useState(true);
  
  // Data lists
  const [users, setUsers] = useState<any[]>([]);
  const [committees, setCommittees] = useState<any[]>([]);
  const [verticals, setVerticals] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any>({ committee: [], vertical: [] });

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Creation modal/forms state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('MEMBER');
  const [newUserCommittee, setNewUserCommittee] = useState('');
  const [newUserVertical, setNewUserVertical] = useState('');

  // Edit details modal/forms state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState('');
  const [editingUserName, setEditingUserName] = useState('');
  const [editingUserRole, setEditingUserRole] = useState('MEMBER');
  const [editingUserCommittee, setEditingUserCommittee] = useState('');
  const [editingUserVertical, setEditingUserVertical] = useState('');

  // Admin section state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');

  const [commName, setCommName] = useState('');
  const [commDesc, setCommDesc] = useState('');
  
  const [vertName, setVertName] = useState('');
  const [vertDesc, setVertDesc] = useState('');
  const [vertCat, setVertCat] = useState<'tech' | 'non-tech'>('tech');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const usersData: any = await fetchFromSheet('getRoles');
      setUsers(usersData || []);

      const commData: any = await fetchFromSheet('getCoreCommittees');
      setCommittees(commData || []);

      const vertData: any = await fetchFromSheet('getVerticals');
      setVerticals(vertData || []);

      const assignData: any = await fetchFromSheet('getAssignments');
      setAssignments(assignData || { committee: [], vertical: [] });
    } catch (e) {
      console.error('Failed to load role/assignment data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Helper to check admin permission (all logged-in users on /admin have role === 'ADMIN')
  const isAdmin = user?.role === 'ADMIN';

  // --- USER DIRECTORY CRUD ---
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    try {
      await fetchFromSheet('createUser', {
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        committeeId: newUserRole === 'MEMBER' && newUserCommittee ? newUserCommittee : undefined,
        verticalId: newUserRole === 'MEMBER' && newUserVertical ? newUserVertical : undefined
      });
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('MEMBER');
      setNewUserCommittee('');
      setNewUserVertical('');
      setShowCreateModal(false);
      loadAllData();
      alert('User created successfully. Default temporary password: Labyrinth@123');
    } catch (err: any) {
      alert(err.message || 'Failed to create user.');
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await fetchFromSheet('updateUserStatus', { userId, status: nextStatus });
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status.');
    }
  };

  const openEditUser = (u: any) => {
    setEditingUserId(u.id);
    setEditingUserName(u.name || u.full_name || '');
    setEditingUserRole(u.role || 'MEMBER');
    setEditingUserCommittee(u.committeeId || '');
    setEditingUserVertical(u.verticalId || '');
    setShowEditModal(true);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchFromSheet('updateUserDetails', {
        userId: editingUserId,
        name: editingUserName,
        role: editingUserRole,
        committeeId: editingUserRole === 'MEMBER' && editingUserCommittee ? editingUserCommittee : undefined,
        verticalId: editingUserRole === 'MEMBER' && editingUserVertical ? editingUserVertical : undefined
      });
      setShowEditModal(false);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to update user.');
    }
  };

  // --- ADMIN ROLES MANAGEMENT ---
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminName) return;
    try {
      await fetchFromSheet('addRole', {
        data: { email: adminEmail, name: adminName, role: 'ADMIN' }
      });
      setAdminEmail('');
      setAdminName('');
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to add admin role.');
    }
  };

  const handleRevokeAdmin = async (id: string) => {
    if (!confirm('Are you sure you want to revoke admin permissions?')) return;
    try {
      await fetchFromSheet('deleteRole', { id });
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to revoke role.');
    }
  };

  // --- COMMITTEES ---
  const handleAddCommittee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commName) return;
    try {
      await fetchFromSheet('addCoreCommittee', { name: commName, description: commDesc });
      setCommName('');
      setCommDesc('');
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to create committee.');
    }
  };

  const handleDeleteCommittee = async (id: string) => {
    if (!confirm('Deleting this committee will also revoke all head assignments for it. Proceed?')) return;
    try {
      await fetchFromSheet('deleteCoreCommittee', { id });
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete committee.');
    }
  };

  const handleAssignCommitteeHead = async (committeeId: string, userId: string) => {
    try {
      if (userId === '') {
        const comm = committees.find(c => c.id === committeeId);
        if (comm && comm.head_id) {
          await fetchFromSheet('removeCoreAssignment', { id: comm.head_id, committeeId });
        }
      } else {
        const selectedUser = users.find(u => u.id === userId);
        if (selectedUser) {
          await fetchFromSheet('assignCoreHead', { userEmail: selectedUser.email, committeeId });
        }
      }
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to assign committee head.');
    }
  };

  // --- VERTICALS ---
  const handleAddVertical = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vertName) return;
    try {
      await fetchFromSheet('addVertical', {
        data: { name: vertName, description: vertDesc, category: vertCat, icon: 'Brain', color: '#CD0000' }
      });
      setVertName('');
      setVertDesc('');
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to create vertical.');
    }
  };

  const handleDeleteVertical = async (id: string) => {
    if (!confirm('Deleting this vertical will also revoke all head assignments for it. Proceed?')) return;
    try {
      await fetchFromSheet('deleteVertical', { id });
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete vertical.');
    }
  };

  const handleAssignVerticalHead = async (verticalId: string, userId: string) => {
    try {
      if (userId === '') {
        const vert = verticals.find(v => v.id === verticalId);
        if (vert && vert.head_id) {
          await fetchFromSheet('removeVerticalAssignment', { id: vert.head_id, verticalId });
        }
      } else {
        const selectedUser = users.find(u => u.id === userId);
        if (selectedUser) {
          await fetchFromSheet('assignVerticalHead', { userEmail: selectedUser.email, verticalId });
        }
      }
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to assign vertical head.');
    }
  };

  // Search filtering logic
  const filteredUsers = users.filter(u => 
    (u.name || u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inputClass = "w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CD0000]/15 focus:border-[#CD0000] text-slate-800 placeholder:text-slate-400 disabled:opacity-50";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">Role &amp; User Configuration</h1>
          <p className="text-[#667085] text-sm mt-0.5">Control administrative permissions and head assignments.</p>
        </div>
        <button onClick={loadAllData} className="p-2 text-slate-500 hover:text-[#CD0000] rounded-lg hover:bg-slate-50 transition-colors">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Tab Nav */}
      <div className="flex border-b border-slate-200">
        {[
          { id: 'users_dir', label: 'User Directory', icon: Users },
          { id: 'admins', label: 'Admin Access Control', icon: Shield },
          { id: 'committees', label: 'Core Committees', icon: Users },
          { id: 'verticals', label: 'Vertical Domains', icon: Users }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-[#CD0000] text-[#CD0000] bg-[#CD0000]/5'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center text-slate-500">
          <RefreshCw size={24} className="animate-spin text-[#CD0000] mx-auto mb-2" />
          Fetching system data...
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TAB 1: USER DIRECTORY */}
          {activeTab === 'users_dir' && (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search size={14} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search name, email, or role..."
                    className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#CD0000]/15"
                  />
                </div>

                <button
                  disabled={!isAdmin}
                  onClick={() => setShowCreateModal(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-[#CD0000] hover:bg-[#A30000] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Plus size={14} /> Create User
                </button>
              </div>

              <div className="overflow-x-auto border border-[#E5E7EB] rounded-xl">
                <table className="w-full text-left text-sm text-[#667085]">
                  <thead className="bg-[rgba(205, 0, 0, 0.03)] border-b border-[rgba(205, 0, 0, 0.07)] text-xs font-bold text-[#8c97a8] uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Committee</th>
                      <th className="p-4">Vertical</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {filteredUsers.map(u => {
                      const comm = committees.find(c => c.id === u.committeeId);
                      const vert = verticals.find(v => v.id === u.verticalId);
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/55 transition-colors">
                          <td className="p-4 text-slate-800 font-bold">{u.name || u.full_name}</td>
                          <td className="p-4 text-slate-600">{u.email}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              u.role === 'ADMIN' ? 'bg-[#CD0000]/5 border-[#CD0000]/15 text-[#CD0000]' : 'bg-slate-100 border-slate-200 text-slate-700'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              u.status === 'active' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-500'
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="p-4 text-slate-700 font-semibold">{comm ? comm.name : '-'}</td>
                          <td className="p-4 text-slate-700 font-semibold">{vert ? vert.name : '-'}</td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                disabled={!isAdmin}
                                onClick={() => openEditUser(u)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 transition-colors"
                                title="Edit User Details"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                disabled={!isAdmin}
                                onClick={() => handleToggleStatus(u.id, u.status)}
                                className={`p-1.5 rounded-lg disabled:opacity-30 transition-colors ${
                                  u.status === 'active' 
                                    ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' 
                                    : 'text-slate-400 hover:text-green-500 hover:bg-green-50'
                                }`}
                                title={u.status === 'active' ? 'Deactivate User' : 'Activate User'}
                              >
                                {u.status === 'active' ? <Ban size={14} /> : <Check size={14} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={7} className="p-8 text-center text-slate-400">No users found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ADMIN ACCESS CONTROL */}
          {activeTab === 'admins' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Form: Add Admin */}
              <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-xs self-start">
                <h3 className="text-sm font-bold text-[#CD0000] mb-4 uppercase tracking-wider">Grant Admin Access</h3>
                <form onSubmit={handleAddAdmin} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Email</label>
                    <input type="email" required disabled={!isAdmin} value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className={inputClass} placeholder="staff@christ.edu" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Name</label>
                    <input type="text" required disabled={!isAdmin} value={adminName} onChange={e => setAdminName(e.target.value)} className={inputClass} placeholder="Staff Name" />
                  </div>
                  <button type="submit" disabled={!isAdmin} className="w-full py-2.5 bg-[#CD0000] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#A30000] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
                    <Plus size={15} /> Grant Access
                  </button>
                </form>
              </div>

              {/* Right List: Admin Users */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs lg:col-span-2">
                <div className="p-4 border-b border-[#E5E7EB] bg-slate-50">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Staff &amp; Admins</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-100/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="p-4">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Level</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {users.filter(u => u.role === 'ADMIN').map(u => (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 text-slate-800 font-semibold">{u.name || u.full_name}</td>
                          <td className="p-4 text-slate-600">{u.email}</td>
                          <td className="p-4">
                            <span className="bg-[#CD0000]/5 text-[#CD0000] px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border border-[#CD0000]/10">
                              ADMIN
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              disabled={!isAdmin}
                              onClick={() => handleRevokeAdmin(u.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30 transition-colors"
                              title="Revoke Admin Access"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMMITTEES */}
          {activeTab === 'committees' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Create Committee */}
                <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-xs self-start">
                  <h3 className="text-sm font-bold text-[#CD0000] mb-4 uppercase tracking-wider">Create Core Committee</h3>
                  <form onSubmit={handleAddCommittee} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Committee Name *</label>
                      <input type="text" required disabled={!isAdmin} value={commName} onChange={e => setCommName(e.target.value)} className={inputClass} placeholder="e.g. Publicity Committee" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Description</label>
                      <textarea rows={3} disabled={!isAdmin} value={commDesc} onChange={e => setCommDesc(e.target.value)} className={inputClass} placeholder="Explain committee roles..." />
                    </div>
                    <button type="submit" disabled={!isAdmin} className="w-full py-2.5 bg-[#CD0000] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#A30000] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
                      <Plus size={15} /> Create Committee
                    </button>
                  </form>
                </div>

                {/* List Committees */}
                <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs lg:col-span-2">
                  <div className="p-4 border-b border-[#E5E7EB] bg-slate-50">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Registered Core Committees</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-100/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                          <th className="p-4">Name</th>
                          <th className="p-4">Description</th>
                          <th className="p-4">Committee Head</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        {committees.map(c => (
                          <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 text-slate-800 font-semibold">{c.name}</td>
                            <td className="p-4 text-slate-600 text-xs leading-relaxed max-w-xs">{c.description}</td>
                            <td className="p-4">
                              <select 
                                disabled={!isAdmin}
                                value={c.head_id || ''} 
                                onChange={(e) => handleAssignCommitteeHead(c.id, e.target.value)}
                                className="border border-[#E5E7EB] rounded-xl px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#CD0000]"
                              >
                                <option value="">No Head Assigned</option>
                                {users.filter(u => u.role === 'MEMBER').map(u => (
                                  <option key={u.id} value={u.id}>{u.name || u.full_name} ({u.email})</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                disabled={!isAdmin}
                                onClick={() => handleDeleteCommittee(c.id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VERTICALS */}
          {activeTab === 'verticals' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Create Vertical */}
                <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-xs self-start">
                  <h3 className="text-sm font-bold text-[#CD0000] mb-4 uppercase tracking-wider">Create Vertical Domain</h3>
                  <form onSubmit={handleAddVertical} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Vertical Name *</label>
                      <input type="text" required disabled={!isAdmin} value={vertName} onChange={e => setVertName(e.target.value)} className={inputClass} placeholder="e.g. CodeCraft" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Description</label>
                      <textarea rows={3} disabled={!isAdmin} value={vertDesc} onChange={e => setVertDesc(e.target.value)} className={inputClass} placeholder="Explain domain focus..." />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Category</label>
                      <select value={vertCat} disabled={!isAdmin} onChange={e => setVertCat(e.target.value as any)} className={inputClass}>
                        <option value="tech">Technical</option>
                        <option value="non-tech">Management &amp; Creative</option>
                      </select>
                    </div>
                    <button type="submit" disabled={!isAdmin} className="w-full py-2.5 bg-[#CD0000] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#A30000] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
                      <Plus size={15} /> Create Vertical
                    </button>
                  </form>
                </div>

                {/* List Verticals */}
                <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs lg:col-span-2">
                  <div className="p-4 border-b border-[#E5E7EB] bg-slate-50">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Registered Domain Verticals</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-100/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                          <th className="p-4">Name</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Description</th>
                          <th className="p-4">Vertical Head</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        {verticals.map(v => (
                          <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 text-slate-800 font-semibold">{v.name}</td>
                            <td className="p-4 text-slate-500 uppercase text-xs font-semibold">{v.category}</td>
                            <td className="p-4 text-slate-600 text-xs leading-relaxed max-w-xs truncate">{v.description}</td>
                            <td className="p-4">
                              <select 
                                disabled={!isAdmin}
                                value={v.head_id || ''} 
                                onChange={(e) => handleAssignVerticalHead(v.id, e.target.value)}
                                className="border border-[#E5E7EB] rounded-xl px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#CD0000]"
                              >
                                <option value="">No Head Assigned</option>
                                {users.filter(u => u.role === 'MEMBER').map(u => (
                                  <option key={u.id} value={u.id}>{u.name || u.full_name} ({u.email})</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                disabled={!isAdmin}
                                onClick={() => handleDeleteVertical(v.id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] w-full max-w-md">
            <form onSubmit={handleCreateUser}>
              <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]">
                <h2 className="font-bold text-[#CD0000]">Create New User (Invite)</h2>
                <button type="button" onClick={() => setShowCreateModal(false)} className="text-[#8c97a8] hover:text-[#CD0000]">
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-5 space-y-4 text-left">
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Full Name *</label>
                  <input type="text" required value={newUserName} onChange={e => setNewUserName(e.target.value)} className={inputClass} placeholder="e.g. Rishi Raj" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">University Email *</label>
                  <input type="email" required value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className={inputClass} placeholder="student@cs.christuniversity.in" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Role *</label>
                  <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className={inputClass}>
                    <option value="MEMBER">Club Member</option>
                    <option value="ADMIN">Club Administrator</option>
                  </select>
                </div>

                {newUserRole === 'MEMBER' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Assign Committee</label>
                      <select value={newUserCommittee} onChange={e => setNewUserCommittee(e.target.value)} className={inputClass}>
                        <option value="">None</option>
                        {committees.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Assign Vertical Domain</label>
                      <select value={newUserVertical} onChange={e => setNewUserVertical(e.target.value)} className={inputClass}>
                        <option value="">None</option>
                        {verticals.map(v => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 p-5 border-t border-[#E5E7EB]">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-[#667085] hover:text-[#CD0000]">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] transition-colors">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER DETAILS MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] w-full max-w-md">
            <form onSubmit={handleEditUser}>
              <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]">
                <h2 className="font-bold text-[#CD0000]">Edit User Details</h2>
                <button type="button" onClick={() => setShowEditModal(false)} className="text-[#8c97a8] hover:text-[#CD0000]">
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-5 space-y-4 text-left">
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Full Name *</label>
                  <input type="text" required value={editingUserName} onChange={e => setEditingUserName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Role *</label>
                  <select value={editingUserRole} onChange={e => setEditingUserRole(e.target.value)} className={inputClass}>
                    <option value="MEMBER">Club Member</option>
                    <option value="ADMIN">Club Administrator</option>
                  </select>
                </div>

                {editingUserRole === 'MEMBER' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Assign Committee</label>
                      <select value={editingUserCommittee} onChange={e => setEditingUserCommittee(e.target.value)} className={inputClass}>
                        <option value="">None</option>
                        {committees.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Assign Vertical Domain</label>
                      <select value={editingUserVertical} onChange={e => setEditingUserVertical(e.target.value)} className={inputClass}>
                        <option value="">None</option>
                        {verticals.map(v => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 p-5 border-t border-[#E5E7EB]">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm text-[#667085] hover:text-[#CD0000]">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] transition-colors">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
