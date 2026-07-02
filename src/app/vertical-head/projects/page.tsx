"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { fetchFromSheet } from '../../../services/api';
import { Plus, Check, Edit2, Trash2, X, AlertTriangle, RefreshCw, Code2, ExternalLink } from 'lucide-react';

interface Project {
  id?: string;
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed';
  url: string;
}

const EMPTY_PROJECT: Project = { title: '', description: '', status: 'planning', url: '' };

export default function VerticalProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProj, setEditingProj] = useState<Project | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadProjects = async () => {
    if (user?.verticalId) {
      setLoading(true);
      try {
        const data: any = await fetchFromSheet('getVerticalProjects', { verticalId: user.verticalId });
        setProjects(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadProjects();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProj || !editingProj.title) return;

    try {
      if (editingProj.id) {
        await fetchFromSheet('updateVerticalProject', { id: editingProj.id, data: editingProj });
      } else {
        await fetchFromSheet('addVerticalProject', { verticalId: user?.verticalId, ...editingProj });
      }
      setShowModal(false);
      loadProjects();
    } catch (err) {
      console.error(err);
      alert('Failed to save project.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetchFromSheet('deleteVerticalProject', { id });
      setDeleteConfirm(null);
      loadProjects();
    } catch (err) {
      console.error(err);
      alert('Failed to delete project.');
    }
  };

  const handleStatusChange = async (proj: any, newStatus: string) => {
    try {
      await fetchFromSheet('updateVerticalProject', { id: proj.id, data: { status: newStatus } });
      loadProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setEditingProj(EMPTY_PROJECT);
    setShowModal(true);
  };

  const openEditModal = (proj: any) => {
    setEditingProj({
      id: proj.id,
      title: proj.title,
      description: proj.description,
      status: proj.status,
      url: proj.url || ''
    });
    setShowModal(true);
  };

  const inputClass = "w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CD0000]/15 focus:border-[#CD0000] text-slate-800 placeholder:text-slate-400";

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">Vertical Projects</h1>
          <p className="text-[#667085] text-sm mt-0.5">Manage open source repositories, projects, or applications.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] transition-colors"
        >
          <Plus size={15} /> Add Project
        </button>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#667085]">
            <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-[#CD0000]" />
            Loading projects...
          </div>
        ) : projects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#667085]">
              <thead className="bg-[rgba(205, 0, 0, 0.03)] border-b border-[rgba(205, 0, 0, 0.07)] text-xs font-bold text-[#8c97a8] uppercase tracking-wider">
                <tr>
                  <th className="p-4">Project</th>
                  <th className="p-4">Repository / URL</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {projects.map(proj => (
                  <tr key={proj.id} className="hover:bg-[rgba(205, 0, 0, 0.03)]/30 transition-colors">
                    <td className="p-4">
                      <h4 className="font-semibold text-slate-800">{proj.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{proj.description}</p>
                    </td>
                    <td className="p-4">
                      {proj.url ? (
                        <a href={proj.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#CD0000] font-bold hover:underline">
                          View Code <ExternalLink size={12} />
                        </a>
                      ) : 'N/A'}
                    </td>
                    <td className="p-4">
                      <select 
                        value={proj.status} 
                        onChange={(e) => handleStatusChange(proj, e.target.value)}
                        className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border focus:outline-none ${
                          proj.status === 'completed' 
                            ? 'bg-green-50 border-green-200 text-green-600'
                            : proj.status === 'in-progress'
                            ? 'bg-blue-50 border-blue-200 text-blue-600'
                            : 'bg-yellow-50 border-yellow-200 text-yellow-600'
                        }`}
                      >
                        <option value="planning">Planning</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button 
                          onClick={() => openEditModal(proj)}
                          className="p-1.5 text-[#8c97a8] hover:text-[#CD0000] hover:bg-[rgba(205, 0, 0, 0.03)] rounded-lg transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm(proj.id)}
                          className="p-1.5 text-[#8c97a8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Code2 size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-base font-bold text-slate-800 mb-1">No Active Projects</h3>
            <p className="text-[#667085]">There are no active projects listed for your vertical. Register one now.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && editingProj && (
        <div className="fixed inset-0 z-50 bg-[#CD0000]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] w-full max-w-md">
            <form onSubmit={handleSave}>
              <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]">
                <h2 className="font-bold text-[#CD0000]">{editingProj.id ? 'Edit Project' : 'Add New Project'}</h2>
                <button type="button" onClick={() => setShowModal(false)} className="text-[#8c97a8] hover:text-[#CD0000]">
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 space-y-4 text-left">
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Project Name *</label>
                  <input type="text" required value={editingProj.title} onChange={e => setEditingProj({ ...editingProj, title: e.target.value })} className={inputClass} placeholder="e.g. Labyrinth AI Chatbot" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Description</label>
                  <textarea rows={3} value={editingProj.description} onChange={e => setEditingProj({ ...editingProj, description: e.target.value })} className={inputClass} placeholder="Explain project scope and tech stack..." />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Repository / Deployment URL</label>
                  <input type="url" value={editingProj.url} onChange={e => setEditingProj({ ...editingProj, url: e.target.value })} className={inputClass} placeholder="https://github.com/..." />
                </div>
                {editingProj.id && (
                  <div>
                    <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Status</label>
                    <select value={editingProj.status} onChange={e => setEditingProj({ ...editingProj, status: e.target.value as any })} className={inputClass}>
                      <option value="planning">Planning</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 p-5 border-t border-[#E5E7EB]">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-[#667085] hover:text-[#CD0000]">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] transition-colors">
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-[#CD0000]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h3 className="font-bold text-[#CD0000] mb-2">Delete this project?</h3>
            <p className="text-[#667085] text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 text-sm font-semibold text-[#667085] border border-[#E5E7EB] rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
