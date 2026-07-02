"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { fetchFromSheet } from '../../../services/api';
import { Plus, Trash2, X, RefreshCw, FolderOpen, ExternalLink } from 'lucide-react';

interface Resource {
  id?: string;
  title: string;
  description: string;
  url: string;
  type: string;
}

const EMPTY_RESOURCE: Resource = { title: '', description: '', url: '', type: 'link' };

export default function VerticalResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRes, setEditingRes] = useState<Resource | null>(null);

  const loadResources = async () => {
    if (user?.verticalId) {
      setLoading(true);
      try {
        const data: any = await fetchFromSheet('getVerticalResources', { verticalId: user.verticalId });
        setResources(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadResources();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRes || !editingRes.title || !editingRes.url) return;

    try {
      await fetchFromSheet('addVerticalResource', { verticalId: user?.verticalId, ...editingRes });
      setShowModal(false);
      loadResources();
    } catch (err) {
      console.error(err);
      alert('Failed to save resource.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
      await fetchFromSheet('deleteVerticalResource', { id });
      loadResources();
    } catch (err) {
      console.error(err);
    }
  };

  const inputClass = "w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CD0000]/15 focus:border-[#CD0000] text-slate-800 placeholder:text-slate-400";

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">Learning Resources</h1>
          <p className="text-[#667085] text-sm mt-0.5">Post roadmaps, code files, video references, or worksheets for vertical members.</p>
        </div>
        <button 
          onClick={() => { setEditingRes(EMPTY_RESOURCE); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] transition-colors"
        >
          <Plus size={15} /> Add Resource
        </button>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#667085]">
            <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-[#CD0000]" />
            Loading resources...
          </div>
        ) : resources.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#667085]">
              <thead className="bg-[rgba(205, 0, 0, 0.03)] border-b border-[rgba(205, 0, 0, 0.07)] text-xs font-bold text-[#8c97a8] uppercase tracking-wider">
                <tr>
                  <th className="p-4">Resource</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Link</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {resources.map((res) => (
                  <tr key={res.id} className="hover:bg-[rgba(205, 0, 0, 0.03)]/30 transition-colors">
                    <td className="p-4">
                      <h4 className="font-semibold text-slate-800">{res.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{res.description}</p>
                    </td>
                    <td className="p-4">
                      <span className="bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-100">
                        {res.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <a 
                        href={res.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-1.5 text-[#CD0000] font-bold hover:underline"
                      >
                        Open <ExternalLink size={13} />
                      </a>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(res.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <FolderOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-base font-bold text-slate-800 mb-1">No Resources</h3>
            <p className="text-[#667085]">There are no learning resources posted yet. Add one to get started.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && editingRes && (
        <div className="fixed inset-0 z-50 bg-[#CD0000]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] w-full max-w-md">
            <form onSubmit={handleSave}>
              <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]">
                <h2 className="font-bold text-[#CD0000]">Add Resource</h2>
                <button type="button" onClick={() => setShowModal(false)} className="text-[#8c97a8] hover:text-[#CD0000]">
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 space-y-4 text-left">
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Resource Title *</label>
                  <input type="text" required value={editingRes.title} onChange={e => setEditingRes({ ...editingRes, title: e.target.value })} className={inputClass} placeholder="e.g. PyTorch Notebook Walkthrough" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Description</label>
                  <input type="text" value={editingRes.description} onChange={e => setEditingRes({ ...editingRes, description: e.target.value })} className={inputClass} placeholder="Short overview of contents..." />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">URL / Link *</label>
                  <input type="url" required value={editingRes.url} onChange={e => setEditingRes({ ...editingRes, url: e.target.value })} className={inputClass} placeholder="https://..." />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Type</label>
                  <select value={editingRes.type} onChange={e => setEditingRes({ ...editingRes, type: e.target.value })} className={inputClass}>
                    <option value="link">Link</option>
                    <option value="document">Document</option>
                    <option value="video">Video</option>
                    <option value="code">Code / Notebook</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-5 border-t border-[#E5E7EB]">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-[#667085] hover:text-[#CD0000]">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] transition-colors">
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
