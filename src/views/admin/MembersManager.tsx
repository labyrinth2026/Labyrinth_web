"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchFromSheet } from '@/services/api';
import { 
  Plus, Search, Shield, Ban, Check, Edit2, Trash2, 
  Users, RefreshCw, X, AlertTriangle, UserCheck, Inbox, Download
} from 'lucide-react';

export default function MembersManager() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'directory' | 'recruitment'>('directory');
  const [loading, setLoading] = useState(true);
  
  // Lists
  const [users, setUsers] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [committees, setCommittees] = useState<any[]>([]);
  const [verticals, setVerticals] = useState<any[]>([]);

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Modals / forms
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('MEMBER');
  const [newUserCommittee, setNewUserCommittee] = useState('');
  const [newUserVertical, setNewUserVertical] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState('');
  const [editingUserName, setEditingUserName] = useState('');
  const [editingUserRole, setEditingUserRole] = useState('MEMBER');
  const [editingUserCommittee, setEditingUserCommittee] = useState('');
  const [editingUserVertical, setEditingUserVertical] = useState('');
  const [editingUserDesignation, setEditingUserDesignation] = useState('');
  const [editingUserPhoto, setEditingUserPhoto] = useState('');
  const [editingUserGithub, setEditingUserGithub] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uData, rData, cData, vData]: any[] = await Promise.all([
        fetchFromSheet('getRoles'),
        fetchFromSheet('getJoinRegistrations'),
        fetchFromSheet('getCoreCommittees'),
        fetchFromSheet('getVerticals')
      ]);
      setUsers(uData || []);
      setRegistrations(rData || []);
      setCommittees(cData || []);
      setVerticals(vData || []);
    } catch (e) {
      console.error('Failed to load members data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail)) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      await fetchFromSheet('createUser', {
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        committeeId: newUserCommittee || undefined,
        verticalId: newUserVertical || undefined
      });
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('MEMBER');
      setNewUserCommittee('');
      setNewUserVertical('');
      setShowCreateModal(false);
      await loadData();
      alert('User created successfully. Default temporary password: Labyrinth@123');
    } catch (err: any) {
      alert(err.message || 'Failed to create user.');
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchFromSheet('updateUserDetails', {
        userId: editingUserId,
        name: editingUserName,
        role: editingUserRole,
        committeeId: editingUserCommittee || undefined,
        verticalId: editingUserVertical || undefined,
        designation: editingUserDesignation || undefined,
        profilePhoto: editingUserPhoto || undefined,
        github: editingUserGithub || undefined
      });
      setShowEditModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update user.');
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await fetchFromSheet('updateUserStatus', { userId, status: nextStatus });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await fetchFromSheet('deleteUser', { id: userId });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove user.');
    }
    setDeleteConfirm(null);
  };

  const handleApproveRegistration = async (id: string) => {
    try {
      await fetchFromSheet('approveRegistration', { id });
      await loadData();
    } catch (e) {
      alert('Failed to approve registration.');
    }
  };

  const handleRejectRegistration = async (id: string) => {
    try {
      await fetchFromSheet('rejectRegistration', { id });
      await loadData();
    } catch (e) {
      alert('Failed to reject registration.');
    }
  };

  const openEditUser = (u: any) => {
    setEditingUserId(u.id);
    setEditingUserName(u.name || u.full_name || '');
    setEditingUserRole(u.role || 'MEMBER');
    setEditingUserCommittee(u.committeeId || u.committee_id || '');
    setEditingUserVertical(u.verticalId || u.vertical_id || '');
    setEditingUserDesignation(u.designation || '');
    setEditingUserPhoto(u.profilePhoto || u.profile_photo || '');
    setEditingUserGithub(u.github || '');
    setShowEditModal(true);
  };

  const handleExportCSV = () => {
    if (registrations.length === 0) return;
    const headers = ['Name', 'Email', 'Phone', 'Course', 'Year', 'Preferred Vertical', 'Reason', 'Date'];
    const rows = registrations.map(r => [
      r.name, r.email, r.phone, r.course, r.year, r.preferredVertical, r.reason, r.timestamp
    ].map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `labyrinth_recruits_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter(u => 
    (u.name || u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inputClass = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#CD0000]/10 focus:border-slate-400 transition-all bg-white";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">Members Workspace</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage directory access, roles, and review new registration recruits.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={loadData} className="p-2.5 text-slate-500 hover:text-[#CD0000] border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shrink-0">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setShowCreateModal(true)} 
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-[#CD0000] hover:bg-[#A30000] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <Plus size={15} /> Add Member
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'directory'
              ? 'border-[#CD0000] text-[#CD0000] bg-red-50/20'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users size={14} /> Active Directory ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('recruitment')}
          className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'recruitment'
              ? 'border-[#CD0000] text-[#CD0000] bg-red-50/20'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Inbox size={14} /> Recruitment Queue ({registrations.length})
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-16 text-center text-slate-400">
          <RefreshCw size={24} className="animate-spin text-[#CD0000] mx-auto mb-2" />
          Loading workspace...
        </div>
      ) : activeTab === 'directory' ? (
        /* Active Directory */
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="max-w-xs relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={14} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search name, email, or role..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#CD0000]/10"
            />
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-sm text-[#667085]">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-[#8c97a8] uppercase tracking-wider">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Assignments</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredUsers.map(u => {
                  const commName = committees.find(c => c.id === u.committeeId)?.name;
                  const vertName = verticals.find(v => v.id === u.verticalId)?.name;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors text-slate-700">
                      <td className="p-4 text-slate-900 font-bold">{u.name || u.full_name}</td>
                      <td className="p-4 text-slate-500 font-semibold">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          u.role === 'ADMIN' ? 'bg-[#CD0000]/5 border-[#CD0000]/15 text-[#CD0000]' : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          u.status === 'active' ? 'bg-green-50 border-green-150 text-green-600' : 'bg-red-50 border-red-150 text-red-500'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-bold text-slate-800">
                        {commName && <div className="text-[#CD0000]">{commName} (Comm)</div>}
                        {vertName && <div className="text-purple-600">{vertName} (Domain)</div>}
                        {!commName && !vertName && <span className="text-slate-400 italic font-normal">—</span>}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button onClick={() => openEditUser(u)} className="p-1.5 text-slate-400 hover:text-[#CD0000] hover:bg-red-50 rounded-lg transition-colors" title="Edit"><Edit2 size={13} /></button>
                          <button onClick={() => handleToggleStatus(u.id, u.status)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title={u.status === 'active' ? 'Deactivate' : 'Activate'}>
                            {u.status === 'active' ? <Ban size={13} /> : <Check size={13} />}
                          </button>
                          <button onClick={() => setDeleteConfirm(u.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Remove"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr><td colSpan={6} className="p-10 text-center text-slate-400">No members found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Recruitment applications */
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Candidate Queue</h3>
            <button
              onClick={handleExportCSV}
              disabled={registrations.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-[rgba(205, 0, 0, 0.03)] text-[#CD0000] text-sm font-semibold rounded-xl hover:bg-[rgba(205, 0, 0, 0.07)] transition-colors disabled:opacity-40"
            >
              <Download size={15} /> Export recruits list
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-sm text-[#667085]">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-[#8c97a8] uppercase tracking-wider">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Course / Year</th>
                  <th className="p-4">Domain Selection</th>
                  <th className="p-4">Reasoning</th>
                  <th className="p-4 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {registrations.map((reg, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors text-slate-700">
                    <td className="p-4 text-slate-900 font-bold">{reg.name}</td>
                    <td className="p-4 text-slate-500 font-semibold">{reg.email}</td>
                    <td className="p-4 text-slate-500 font-semibold">{reg.phone}</td>
                    <td className="p-4 font-bold text-slate-800">
                      {reg.course} <span className="text-[10px] font-black uppercase text-slate-400">(Y{reg.year})</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-600 text-xs font-semibold whitespace-nowrap">
                        {reg.preferredVertical}
                      </span>
                    </td>
                    <td className="p-4 text-xs leading-relaxed max-w-xs">{reg.reason}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => handleApproveRegistration(reg.id)} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors border border-green-150" title="Approve applicant"><Check size={14} /></button>
                        <button onClick={() => handleRejectRegistration(reg.id)} className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors border border-red-150" title="Reject applicant"><X size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {registrations.length === 0 && (
                  <tr><td colSpan={7} className="p-10 text-center text-slate-400">No recruitment registrations pending.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE MEMBER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] w-full max-w-md">
            <form onSubmit={handleCreateUser}>
              <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]">
                <h2 className="font-bold text-[#CD0000]">Invite Member</h2>
                <button type="button" onClick={() => setShowCreateModal(false)} className="text-[#8c97a8] hover:text-[#CD0000]">
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-5 space-y-4 text-left">
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Full Name *</label>
                  <input type="text" required value={newUserName} onChange={e => setNewUserName(e.target.value)} className={inputClass} placeholder="Full Name" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">University Email *</label>
                  <input type="email" required value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className={inputClass} placeholder="student@cs.christuniversity.in" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">System Role *</label>
                  <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className={inputClass}>
                    <option value="MEMBER">Member (No Login)</option>
                    <option value="ADMIN">Administrator (CMS Login)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Assign Committee</label>
                  <select value={newUserCommittee} onChange={e => setNewUserCommittee(e.target.value)} className={inputClass}>
                    <option value="">None</option>
                    {committees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Assign Vertical</label>
                  <select value={newUserVertical} onChange={e => setNewUserVertical(e.target.value)} className={inputClass}>
                    <option value="">None</option>
                    {verticals.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-5 border-t border-[#E5E7EB]">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-[#667085] hover:text-[#CD0000]">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] transition-colors">
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] w-full max-w-md">
            <form onSubmit={handleEditUser}>
              <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]">
                <h2 className="font-bold text-[#CD0000]">Edit Member Details</h2>
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
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">System Role *</label>
                  <select value={editingUserRole} onChange={e => setEditingUserRole(e.target.value)} className={inputClass}>
                    <option value="MEMBER">Member (No Login)</option>
                    <option value="ADMIN">Administrator (CMS Login)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Assign Committee</label>
                  <select value={editingUserCommittee} onChange={e => setEditingUserCommittee(e.target.value)} className={inputClass}>
                    <option value="">None</option>
                    {committees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Assign Vertical</label>
                  <select value={editingUserVertical} onChange={e => setEditingUserVertical(e.target.value)} className={inputClass}>
                    <option value="">None</option>
                    {verticals.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>

                {/* Designation */}
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Designation / Title</label>
                  <input type="text" value={editingUserDesignation}
                    onChange={e => setEditingUserDesignation(e.target.value)}
                    className={inputClass} placeholder="e.g. Vertical Head, Core Member…" />
                </div>

                {/* Photo URL + live preview */}
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Photo URL</label>
                  <div className="flex gap-3 items-center">
                    <input type="url" value={editingUserPhoto}
                      onChange={e => setEditingUserPhoto(e.target.value)}
                      className={inputClass} placeholder="https://drive.google.com/… or any image URL" />
                    <div className="w-12 h-12 rounded-xl border border-[#E5E7EB] bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-400">
                      {editingUserPhoto
                        ? <img src={editingUserPhoto} alt="Preview" className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        : 'IMG'
                      }
                    </div>
                  </div>
                </div>

                {/* GitHub */}
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">GitHub URL</label>
                  <input type="url" value={editingUserGithub}
                    onChange={e => setEditingUserGithub(e.target.value)}
                    className={inputClass} placeholder="https://github.com/username" />
                </div>
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

      {/* DELETE USER CONFIRM MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4 text-red-500">
              <AlertTriangle size={28} />
            </div>
            <h3 className="font-bold text-[#CD0000] mb-2">Delete Member Profile?</h3>
            <p className="text-slate-500 text-sm mb-6">This action will clear their profile details and revoke all role assignments. It cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 text-sm font-semibold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={() => handleDeleteUser(deleteConfirm)} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
