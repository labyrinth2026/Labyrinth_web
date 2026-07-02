import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchFromSheet } from '../../services/api';
import { Plus, Trash2, Shield, Users, RefreshCw, X } from 'lucide-react';

export default function RoleManager() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'admins' | 'committees' | 'verticals'>('admins');
  const [loading, setLoading] = useState(true);
  
  // Data lists
  const [users, setUsers] = useState<any[]>([]);
  const [committees, setCommittees] = useState<any[]>([]);
  const [verticals, setVerticals] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any>({ committee: [], vertical: [] });

  // Creation forms state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminRole, setAdminRole] = useState('COORDINATOR');

  const [commName, setCommName] = useState('');
  const [commDesc, setCommDesc] = useState('');
  
  const [vertName, setVertName] = useState('');
  const [vertDesc, setVertDesc] = useState('');
  const [vertCat, setVertCat] = useState<'tech' | 'non-tech'>('tech');

  // Assignment forms state
  const [assignCommEmail, setAssignCommEmail] = useState('');
  const [assignCommId, setAssignCommId] = useState('');

  const [assignVertEmail, setAssignVertEmail] = useState('');
  const [assignVertId, setAssignVertId] = useState('');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const usersData: any = await fetchFromSheet('getRoles');
      setUsers(usersData || []);

      const commData: any = await fetchFromSheet('getCoreCommittees');
      setCommittees(commData || []);
      if (commData && commData.length > 0) setAssignCommId(commData[0].id);

      const vertData: any = await fetchFromSheet('getVerticals');
      setVerticals(vertData || []);
      if (vertData && vertData.length > 0) setAssignVertId(vertData[0].id);

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

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminName) return;
    try {
      await fetchFromSheet('addRole', {
        data: { email: adminEmail, name: adminName, role: adminRole }
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

  const handleAssignCommitteeHead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignCommEmail || !assignCommId) return;
    try {
      await fetchFromSheet('assignCoreHead', { userEmail: assignCommEmail, committeeId: assignCommId });
      setAssignCommEmail('');
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to assign committee head.');
    }
  };

  const handleRemoveCommitteeAssignment = async (id: string) => {
    if (!confirm('Remove this committee head assignment?')) return;
    try {
      await fetchFromSheet('removeCoreAssignment', { id });
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove assignment.');
    }
  };

  const handleAssignVerticalHead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignVertEmail || !assignVertId) return;
    try {
      await fetchFromSheet('assignVerticalHead', { userEmail: assignVertEmail, verticalId: assignVertId });
      setAssignVertEmail('');
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to assign vertical head.');
    }
  };

  const handleRemoveVerticalAssignment = async (id: string) => {
    if (!confirm('Remove this vertical head assignment?')) return;
    try {
      await fetchFromSheet('removeVerticalAssignment', { id });
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove assignment.');
    }
  };

  const isHod = user?.role === 'HOD';

  const inputClass = "w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CD0000]/15 focus:border-[#CD0000] text-slate-800 placeholder:text-slate-400 disabled:opacity-50";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">Role &amp; System Configuration</h1>
          <p className="text-[#667085] text-sm mt-0.5">Control administrative permissions and head assignments.</p>
        </div>
        <button onClick={loadAllData} className="p-2 text-slate-500 hover:text-[#CD0000] rounded-lg hover:bg-slate-50 transition-colors">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Tab Nav */}
      <div className="flex border-b border-slate-200">
        {[
          { id: 'admins', label: 'Admin Portals & Staff', icon: Shield },
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
          {/* TAB 1: ADMINS */}
          {activeTab === 'admins' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Form: Add Admin */}
              <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-xs self-start">
                <h3 className="text-sm font-bold text-[#CD0000] mb-4 uppercase tracking-wider">Grant Admin Access</h3>
                <form onSubmit={handleAddAdmin} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Email</label>
                    <input type="email" required disabled={!isHod} value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className={inputClass} placeholder="staff@christ.edu" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Name</label>
                    <input type="text" required disabled={!isHod} value={adminName} onChange={e => setAdminName(e.target.value)} className={inputClass} placeholder="Staff Name" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Admin Level</label>
                    <select value={adminRole} disabled={!isHod} onChange={e => setAdminRole(e.target.value)} className={inputClass}>
                      <option value="COORDINATOR">Faculty Coordinator</option>
                      <option value="ASSOCIATE">Faculty Associate</option>
                      <option value="HOD">HOD (System Administrator)</option>
                    </select>
                  </div>
                  <button type="submit" disabled={!isHod} className="w-full py-2.5 bg-[#CD0000] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#A30000] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
                    <Plus size={15} /> Grant Access
                  </button>
                  {!isHod && (
                    <p className="text-[10px] text-amber-600 font-semibold text-center mt-1">Only the HOD can modify administrative access rights.</p>
                  )}
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
                      {users.filter(u => ['HOD', 'COORDINATOR', 'ASSOCIATE'].includes(u.role)).map(u => (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 text-slate-800 font-semibold">{u.name}</td>
                          <td className="p-4 text-slate-600">{u.email}</td>
                          <td className="p-4">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border border-slate-200">
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              disabled={!isHod || u.role === 'HOD'}
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

          {/* TAB 2: COMMITTEES */}
          {activeTab === 'committees' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Create Committee */}
                <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-xs self-start">
                  <h3 className="text-sm font-bold text-[#CD0000] mb-4 uppercase tracking-wider">Create Core Committee</h3>
                  <form onSubmit={handleAddCommittee} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Committee Name *</label>
                      <input type="text" required disabled={!isHod} value={commName} onChange={e => setCommName(e.target.value)} className={inputClass} placeholder="e.g. Publicity Committee" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Description</label>
                      <textarea rows={3} disabled={!isHod} value={commDesc} onChange={e => setCommDesc(e.target.value)} className={inputClass} placeholder="Explain committee roles..." />
                    </div>
                    <button type="submit" disabled={!isHod} className="w-full py-2.5 bg-[#CD0000] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#A30000] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
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
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        {committees.map(c => (
                          <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 text-slate-800 font-semibold">{c.name}</td>
                            <td className="p-4 text-slate-600">{c.description}</td>
                            <td className="p-4 text-right">
                              <button
                                disabled={!isHod}
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

              {/* Assign Committee Head Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 border-t border-slate-200 pt-6">
                {/* Assign Form */}
                <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-xs self-start">
                  <h3 className="text-sm font-bold text-[#CD0000] mb-4 uppercase tracking-wider">Assign Committee Head</h3>
                  <form onSubmit={handleAssignCommitteeHead} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Head User Email *</label>
                      <input type="email" required value={assignCommEmail} onChange={e => setAssignCommEmail(e.target.value)} className={inputClass} placeholder="student@cs.christuniversity.in" />
                      <p className="text-[9px] text-slate-400 font-semibold mt-1">Note: User account must be pre-registered (pending/active status).</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Target Committee *</label>
                      <select value={assignCommId} onChange={e => setAssignCommId(e.target.value)} className={inputClass}>
                        {committees.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-[#CD0000] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#A30000] transition-colors flex items-center justify-center gap-1.5">
                      <Plus size={15} /> Assign Head
                    </button>
                  </form>
                </div>

                {/* Assignments List */}
                <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs lg:col-span-2">
                  <div className="p-4 border-b border-[#E5E7EB] bg-slate-50">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Committee Head Assignments</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-100/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                          <th className="p-4">Name</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Assigned Committee</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        {(assignments.committee || []).map((a: any) => (
                          <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 text-slate-800 font-semibold">{a.userName}</td>
                            <td className="p-4 text-slate-600">{a.userEmail}</td>
                            <td className="p-4">
                              <span className="bg-indigo-50 border border-indigo-150 text-indigo-600 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                                {a.committeeName}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleRemoveCommitteeAssignment(a.id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove Assignment"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {(!assignments.committee || assignments.committee.length === 0) && (
                          <tr><td colSpan={4} className="p-6 text-center text-slate-400">No active committee heads assigned.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VERTICALS */}
          {activeTab === 'verticals' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Create Vertical */}
                <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-xs self-start">
                  <h3 className="text-sm font-bold text-[#CD0000] mb-4 uppercase tracking-wider">Create Vertical Domain</h3>
                  <form onSubmit={handleAddVertical} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Vertical Name *</label>
                      <input type="text" required disabled={!isHod} value={vertName} onChange={e => setVertName(e.target.value)} className={inputClass} placeholder="e.g. CodeCraft" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Description</label>
                      <textarea rows={3} disabled={!isHod} value={vertDesc} onChange={e => setVertDesc(e.target.value)} className={inputClass} placeholder="Explain domain focus..." />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Category</label>
                      <select value={vertCat} disabled={!isHod} onChange={e => setVertCat(e.target.value as any)} className={inputClass}>
                        <option value="tech">Technical</option>
                        <option value="non-tech">Management &amp; Creative</option>
                      </select>
                    </div>
                    <button type="submit" disabled={!isHod} className="w-full py-2.5 bg-[#CD0000] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#A30000] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
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
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        {verticals.map(v => (
                          <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 text-slate-800 font-semibold">{v.name}</td>
                            <td className="p-4 text-slate-500 uppercase text-xs font-semibold">{v.category}</td>
                            <td className="p-4 text-slate-600 text-xs leading-relaxed max-w-xs truncate">{v.description}</td>
                            <td className="p-4 text-right">
                              <button
                                disabled={!isHod}
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

              {/* Assign Vertical Head Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 border-t border-slate-200 pt-6">
                {/* Assign Form */}
                <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-xs self-start">
                  <h3 className="text-sm font-bold text-[#CD0000] mb-4 uppercase tracking-wider">Assign Vertical Head</h3>
                  <form onSubmit={handleAssignVerticalHead} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Head User Email *</label>
                      <input type="email" required value={assignVertEmail} onChange={e => setAssignVertEmail(e.target.value)} className={inputClass} placeholder="student@cs.christuniversity.in" />
                      <p className="text-[9px] text-slate-400 font-semibold mt-1">Note: User account must be pre-registered (pending/active status).</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Target Vertical *</label>
                      <select value={assignVertId} onChange={e => setAssignVertId(e.target.value)} className={inputClass}>
                        {verticals.map(v => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-[#CD0000] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#A30000] transition-colors flex items-center justify-center gap-1.5">
                      <Plus size={15} /> Assign Head
                    </button>
                  </form>
                </div>

                {/* Assignments List */}
                <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs lg:col-span-2">
                  <div className="p-4 border-b border-[#E5E7EB] bg-slate-50">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Vertical Head Assignments</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-100/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                          <th className="p-4">Name</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Assigned Vertical</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        {(assignments.vertical || []).map((a: any) => (
                          <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 text-slate-800 font-semibold">{a.userName}</td>
                            <td className="p-4 text-slate-600">{a.userEmail}</td>
                            <td className="p-4">
                              <span className="bg-emerald-50 border border-emerald-150 text-emerald-600 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                                {a.verticalName}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleRemoveVerticalAssignment(a.id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove Assignment"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {(!assignments.vertical || assignments.vertical.length === 0) && (
                          <tr><td colSpan={4} className="p-6 text-center text-slate-400">No active vertical heads assigned.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
