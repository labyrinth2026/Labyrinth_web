"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchFromSheet } from '@/services/api';
import { Plus, Trash2, Shield, Users, RefreshCw, X, Check, Award } from 'lucide-react';

export default function CommitteesManager() {
  const { user } = useAuth();
  const [committees, setCommittees] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [commName, setCommName] = useState('');
  const [commDesc, setCommDesc] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [cData, uData]: any[] = await Promise.all([
        fetchFromSheet('getCoreCommittees'),
        fetchFromSheet('getRoles')
      ]);
      setCommittees(cData || []);
      setUsers(uData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddCommittee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commName) return;
    try {
      await fetchFromSheet('addCoreCommittee', { name: commName, description: commDesc });
      setCommName('');
      setCommDesc('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create committee.');
    }
  };

  const handleDeleteCommittee = async (id: string) => {
    if (!confirm('Deleting this committee will revoke all head assignments for it. Proceed?')) return;
    try {
      await fetchFromSheet('deleteCoreCommittee', { id });
      await loadData();
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
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to assign committee head.');
    }
  };

  const inputClass = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CD0000]/10 focus:border-slate-400 text-slate-800 placeholder:text-slate-400 bg-white";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">Core Committees Workspace</h1>
          <p className="text-[#667085] text-sm mt-0.5 font-medium">Create administrative committees and assign heads.</p>
        </div>
        <button onClick={loadData} className="p-2.5 text-slate-500 hover:text-[#CD0000] border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-16 text-center text-slate-400">
          <RefreshCw size={24} className="animate-spin text-[#CD0000] mx-auto mb-2" />
          Fetching committee data...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Form: Create Committee */}
          <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-sm self-start space-y-4">
            <h3 className="text-sm font-bold text-[#CD0000] uppercase tracking-wider">Create Committee</h3>
            <form onSubmit={handleAddCommittee} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Committee Name *</label>
                <input type="text" required value={commName} onChange={e => setCommName(e.target.value)} className={inputClass} placeholder="e.g. Publicity Committee" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Description</label>
                <textarea rows={3} value={commDesc} onChange={e => setCommDesc(e.target.value)} className={inputClass} placeholder="Explain committee roles..." />
              </div>
              <button type="submit" className="w-full py-2.5 bg-[#CD0000] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#A30000] transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                <Plus size={15} /> Create
              </button>
            </form>
          </div>

          {/* Right List: Committees */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm lg:col-span-2">
            <div className="p-4 border-b border-[#E5E7EB] bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Registered Committees</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
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
                      <td className="p-4 text-slate-900 font-bold">{c.name}</td>
                      <td className="p-4 text-xs leading-relaxed max-w-xs text-slate-500">{c.description || 'No description provided.'}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Award size={14} className="text-amber-500 shrink-0" />
                          <select 
                            value={c.head_id || ''} 
                            onChange={(e) => handleAssignCommitteeHead(c.id, e.target.value)}
                            className="border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#CD0000] bg-white max-w-[180px] truncate"
                          >
                            <option value="">No Head Assigned</option>
                            {users.filter(u => u.role === 'MEMBER').map(u => (
                              <option key={u.id} value={u.id}>{u.name || u.full_name}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteCommittee(c.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Committee"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {committees.length === 0 && (
                    <tr><td colSpan={4} className="p-10 text-center text-slate-400">No committees created yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
