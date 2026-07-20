import React, { useState, useEffect } from 'react';
import { fetchFromSheet } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import {
  Edit2, Trash2, Plus, RefreshCw, X, Check, AlertTriangle, Github, Mail, Linkedin
} from 'lucide-react';

interface TeamMemberForm {
  id?: string;
  name: string;
  role: string;
  vertical: string;
  designation: string;
  department: string;
  email: string;
  linkedin: string;
  github: string;
  avatar: string;
  category: 'faculty' | 'mentors' | 'vertical_head' | 'sub_head';
}

const EMPTY_FORM: TeamMemberForm = {
  name: '', role: '', vertical: '', designation: '', department: '',
  email: '', linkedin: '', github: '', avatar: '', category: 'vertical_head'
};

const TeamManager: React.FC = () => {
  const { user, can } = useAuth();
  const [teamData, setTeamData] = useState<any>({ facultyCoordinators: [], mentors: [], verticalHeads: [], subHeads: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'faculty' | 'mentors' | 'heads' | 'subheads'>('heads');
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberForm | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadTeam = async () => {
    setIsLoading(true);
    try {
      const result: any = await fetchFromSheet('getTeam');
      if (result && !Array.isArray(result)) {
        setTeamData(result);
      }
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  useEffect(() => { loadTeam(); }, []);

  if (!can('manage_team')) {
    return (
      <div className="bg-white border border-red-100 rounded-2xl p-8 text-center">
        <p className="text-red-500 font-semibold">Unauthorized: You don't have permission to manage team members.</p>
      </div>
    );
  }

  const currentList = activeTab === 'faculty'
    ? teamData.facultyCoordinators
    : activeTab === 'mentors'
    ? teamData.mentors
    : activeTab === 'heads'
    ? teamData.verticalHeads
    : teamData.subHeads;

  const openAddModal = () => {
    const categoryMap = { faculty: 'faculty', mentors: 'mentors', heads: 'vertical_head', subheads: 'sub_head' } as const;
    setEditingMember({ ...EMPTY_FORM, category: categoryMap[activeTab] });
    setShowModal(true);
  };

  const openEditModal = (member: any) => {
    const categoryMap = { faculty: 'faculty', mentors: 'mentors', heads: 'vertical_head', subheads: 'sub_head' } as const;
    setEditingMember({
      id: member.id, name: member.name || '', role: member.role || '',
      vertical: member.vertical || '', designation: member.designation || '',
      department: member.department || '', email: member.email || '',
      linkedin: member.linkedin || '', github: member.github || '',
      avatar: member.avatar || '',
      category: categoryMap[activeTab]
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingMember) return;
    setIsSaving(true);
    try {
      if (editingMember.id) {
        await fetchFromSheet('updateTeamMember', { userEmail: user?.email, id: editingMember.id, data: editingMember });
      } else {
        await fetchFromSheet('addTeamMember', { userEmail: user?.email, data: { ...editingMember, id: `m${Date.now()}` } });
      }
      setShowModal(false);
      await loadTeam();
    } catch (e) {
      console.error(e);
      alert('Failed to save. Ensure Google Apps Script is configured.');
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetchFromSheet('deleteTeamMember', { userEmail: user?.email, id });
      await loadTeam();
    } catch (e) {
      console.error(e);
      alert('Failed to delete. Ensure Google Apps Script is configured.');
    }
    setDeleteConfirm(null);
  };

  const inputClass = "w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm text-[#CD0000] placeholder:text-[#8c97a8] focus:outline-none focus:ring-2 focus:ring-[#CD0000]/15 focus:border-[#CD0000] transition-all";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6 flex justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">Team Management</h1>
          <p className="text-[#667085] text-sm mt-0.5">Add, edit, and remove team members.</p>
        </div>
        <button onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] transition-colors"
        >
          <Plus size={15} /> Add Member
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-[#E5E7EB] overflow-x-auto">
          {[
            { id: 'faculty', label: 'Faculty' },
            { id: 'mentors', label: 'Mentors' },
            { id: 'heads', label: 'Vertical Heads' },
            { id: 'subheads', label: 'Sub-Heads' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-4 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#CD0000] text-[#CD0000] bg-[rgba(205, 0, 0, 0.03)]/50'
                  : 'border-transparent text-[#667085] hover:text-[#CD0000]'
              }`}
            >
              {tab.label} <span className="ml-1.5 text-xs bg-[rgba(205, 0, 0, 0.03)] text-[#CD0000] px-1.5 py-0.5 rounded-full">
                {tab.id === 'faculty' ? (teamData.facultyCoordinators?.length || 0) :
                 tab.id === 'mentors' ? (teamData.mentors?.length || 0) :
                 tab.id === 'heads' ? (teamData.verticalHeads?.length || 0) :
                 (teamData.subHeads?.length || 0)}
              </span>
            </button>
          ))}
          <button onClick={loadTeam} className="ml-auto px-4 py-4 text-[#8c97a8] hover:text-[#CD0000] transition-colors">
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {isLoading ? (
          <div className="p-10 flex justify-center">
            <RefreshCw size={22} className="animate-spin text-[#CD0000]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[rgba(205, 0, 0, 0.03)] border-b border-[rgba(205, 0, 0, 0.07)] text-xs font-bold text-[#8c97a8] uppercase tracking-wider">
                  <th className="p-4">Member</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Contact</th>
                  {(activeTab === 'heads' || activeTab === 'subheads') && <th className="p-4">Vertical</th>}
                  {activeTab === 'faculty' && <th className="p-4">Department</th>}
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {currentList.map((member: any) => (
                  <tr key={member.id} className="hover:bg-[rgba(205, 0, 0, 0.03)]/30 transition-colors text-sm">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-500">
                          {member.avatar
                            ? <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                            : (member.name || '').split(' ').map((n: string) => n[0]).slice(0,2).join('').toUpperCase()
                          }
                        </div>
                        <span className="text-[#CD0000] font-semibold">{member.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-[#667085]">{member.role}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        {member.email && (
                          <a href={`mailto:${member.email}`} title={member.email}
                            className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-[#CD0000] hover:text-white transition-all">
                            <Mail size={11} />
                          </a>
                        )}
                        {member.linkedin && member.linkedin !== '#' && (
                          <a href={member.linkedin} target="_blank" rel="noreferrer" title="LinkedIn"
                            className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-[#CD0000] hover:text-white transition-all">
                            <Linkedin size={11} />
                          </a>
                        )}
                        {member.github && member.github !== '#' && (
                          <a href={member.github} target="_blank" rel="noreferrer" title="GitHub"
                            className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-[#CD0000] hover:text-white transition-all">
                            <Github size={11} />
                          </a>
                        )}
                      </div>
                    </td>
                    {(activeTab === 'heads' || activeTab === 'subheads') && <td className="p-4"><span className="px-2 py-0.5 rounded-full bg-[rgba(205, 0, 0, 0.03)] text-[#CD0000] text-xs font-semibold">{member.vertical}</span></td>}
                    {activeTab === 'faculty' && <td className="p-4 text-[#667085]">{member.department}</td>}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => openEditModal(member)}
                          className="p-1.5 text-[#8c97a8] hover:text-[#CD0000] hover:bg-[rgba(205, 0, 0, 0.03)] rounded-lg transition-colors" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteConfirm(member.id)}
                          className="p-1.5 text-[#8c97a8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentList.length === 0 && (
                  <tr><td colSpan={5} className="p-10 text-center text-[#8c97a8] text-sm">No members yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && editingMember && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
              <h2 className="font-bold text-[#CD0000]">{editingMember.id ? 'Edit Member' : 'Add New Member'}</h2>
              <button onClick={() => setShowModal(false)} className="text-[#8c97a8] hover:text-[#CD0000] transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Full Name *</label>
                  <input type="text" value={editingMember.name} onChange={e => setEditingMember({ ...editingMember, name: e.target.value })} className={inputClass} placeholder="Full name" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Role / Title *</label>
                  <input type="text" value={editingMember.role} onChange={e => setEditingMember({ ...editingMember, role: e.target.value })} className={inputClass} placeholder="e.g., Vice President" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Email *</label>
                  <input type="email" value={editingMember.email} onChange={e => setEditingMember({ ...editingMember, email: e.target.value })} className={inputClass} placeholder="email@christ.edu" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">LinkedIn URL</label>
                  <input type="url" value={editingMember.linkedin} onChange={e => setEditingMember({ ...editingMember, linkedin: e.target.value })} className={inputClass} placeholder="https://linkedin.com/in/..." />
                </div>
              </div>
              {(editingMember.category === 'vertical_head' || editingMember.category === 'sub_head') && (
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Vertical</label>
                  <input type="text" value={editingMember.vertical} onChange={e => setEditingMember({ ...editingMember, vertical: e.target.value })} className={inputClass} placeholder="e.g., AI Creator's Lab" />
                </div>
              )}
              {editingMember.category === 'faculty' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Designation</label>
                    <input type="text" value={editingMember.designation} onChange={e => setEditingMember({ ...editingMember, designation: e.target.value })} className={inputClass} placeholder="e.g., Professor" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Department</label>
                    <input type="text" value={editingMember.department} onChange={e => setEditingMember({ ...editingMember, department: e.target.value })} className={inputClass} placeholder="e.g., Department of Computer Science" />
                  </div>
                </>
              )}
              {/* Photo URL + live preview */}
              <div>
                <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Photo URL</label>
                <div className="flex gap-3 items-start">
                  <input
                    type="url"
                    value={editingMember.avatar}
                    onChange={e => setEditingMember({ ...editingMember, avatar: e.target.value })}
                    className={inputClass}
                    placeholder="https://drive.google.com/... or any image URL"
                  />
                  <div className="w-12 h-12 rounded-xl border border-[#E5E7EB] bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-400">
                    {editingMember.avatar
                      ? <img src={editingMember.avatar} alt="Preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      : 'IMG'
                    }
                  </div>
                </div>
              </div>

              {/* GitHub URL */}
              <div>
                <label className="text-xs font-semibold text-[#8c97a8] block mb-1">GitHub URL</label>
                <input
                  type="url"
                  value={editingMember.github}
                  onChange={e => setEditingMember({ ...editingMember, github: e.target.value })}
                  className={inputClass}
                  placeholder="https://github.com/username"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-[#E5E7EB]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-[#667085] hover:text-[#CD0000] transition-colors font-medium">Cancel</button>
              <button onClick={handleSave} disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] transition-colors disabled:opacity-50"
              >
                {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                {isSaving ? 'Saving...' : 'Save Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h3 className="font-bold text-[#CD0000] mb-2">Remove Team Member?</h3>
            <p className="text-[#667085] text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-sm font-semibold text-[#667085] border border-[#E5E7EB] rounded-xl hover:bg-[rgba(205, 0, 0, 0.03)] transition-colors"
              >Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
              >Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManager;
