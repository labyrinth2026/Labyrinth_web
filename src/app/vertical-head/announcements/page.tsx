"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { fetchFromSheet } from '../../../services/api';
import { Megaphone, Plus, Trash2, X, RefreshCw } from 'lucide-react';

export default function VerticalAnnouncementsPage() {
  const { user } = useAuth();
  const [anns, setAnns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'vertical'>('vertical');

  const loadAnnouncements = async () => {
    if (user?.verticalId) {
      setLoading(true);
      try {
        const list: any = await fetchFromSheet('getAnnouncements');
        // Filter: targetType is all, or targetId is my vertical
        const filtered = (list || []).filter((a: any) => 
          a.targetType === 'all' || (a.targetType === 'vertical' && a.targetId === user.verticalId)
        );
        setAnns(filtered);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      await fetchFromSheet('addAnnouncement', {
        title,
        content,
        targetType,
        targetId: targetType === 'vertical' ? user?.verticalId : undefined
      });
      setTitle('');
      setContent('');
      setShowModal(false);
      loadAnnouncements();
    } catch (e) {
      console.error(e);
      alert('Failed to post announcement.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await fetchFromSheet('deleteAnnouncement', { id });
      loadAnnouncements();
    } catch (e) {
      console.error(e);
    }
  };

  const inputClass = "w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CD0000]/15 focus:border-[#CD0000] text-slate-800 placeholder:text-slate-400";

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">Vertical Announcements</h1>
          <p className="text-[#667085] text-sm mt-0.5">Post and view updates or warnings for the club or vertical.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] transition-colors"
        >
          <Plus size={15} /> Post Announcement
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center text-slate-500">
            <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-[#CD0000]" />
            Loading announcements...
          </div>
        ) : anns.length > 0 ? (
          anns.map((ann) => (
            <div key={ann.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm relative overflow-hidden flex justify-between items-start gap-4 hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex gap-2 items-center">
                  <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    ann.targetType === 'all' 
                      ? 'bg-red-50 border-red-100 text-red-600' 
                      : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                  }`}>
                    {ann.targetType === 'all' ? 'All Club Notice' : 'Vertical Internal'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(ann.timestamp).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-800 tracking-tight">{ann.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-wrap">{ann.content}</p>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Posted by: <span className="text-slate-600">{ann.createdBy}</span>
                </div>
              </div>
              
              <button 
                onClick={() => handleDelete(ann.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                title="Delete Announcement"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        ) : (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center">
            <Megaphone size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-base font-bold text-slate-800 mb-1">No Announcements</h3>
            <p className="text-[#667085]">There are no active notices at this time.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#CD0000]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] w-full max-w-md">
            <form onSubmit={handleCreate}>
              <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]">
                <h2 className="font-bold text-[#CD0000]">Post Announcement</h2>
                <button type="button" onClick={() => setShowModal(false)} className="text-[#8c97a8] hover:text-[#CD0000]">
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 space-y-4 text-left">
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Title *</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className={inputClass} placeholder="e.g. Next workshop details" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Content *</label>
                  <textarea rows={4} required value={content} onChange={e => setContent(e.target.value)} className={inputClass} placeholder="Write announcement details here..." />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Audience Target</label>
                  <select value={targetType} onChange={e => setTargetType(e.target.value as any)} className={inputClass}>
                    <option value="vertical">Vertical Internal Only</option>
                    <option value="all">All Labyrinth Members</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-5 border-t border-[#E5E7EB]">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-[#667085] hover:text-[#CD0000]">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] transition-colors">
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
