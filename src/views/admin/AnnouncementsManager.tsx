"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchFromSheet } from '@/services/api';
import { Plus, Trash2, Megaphone, RefreshCw, Layers, BookOpen, AlertTriangle } from 'lucide-react';

export default function AnnouncementsManager() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [verticals, setVerticals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audienceType, setAudienceType] = useState<'club' | 'vertical'>('club');
  const [audienceId, setAudienceId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [annData, vData]: any[] = await Promise.all([
        fetchFromSheet('getAnnouncements'),
        fetchFromSheet('getVerticals')
      ]);
      setAnnouncements(annData || []);
      setVerticals(vData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setIsSaving(true);
    try {
      await fetchFromSheet('addAnnouncement', {
        title,
        content,
        audience_type: audienceType,
        audience_id: audienceType === 'club' ? null : audienceId || null
      });
      setTitle('');
      setContent('');
      setAudienceType('club');
      setAudienceId('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to post announcement.');
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await fetchFromSheet('deleteAnnouncement', { id });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete announcement.');
    }
  };

  const inputClass = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CD0000]/10 focus:border-slate-400 text-slate-800 placeholder:text-slate-400 bg-white";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">Announcements Board</h1>
          <p className="text-slate-500 text-sm mt-0.5 font-medium">Broadcast news, notifications, or target specific divisions.</p>
        </div>
        <button onClick={loadData} className="p-2.5 text-slate-500 hover:text-[#CD0000] border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-16 text-center text-slate-400">
          <RefreshCw size={24} className="animate-spin text-[#CD0000] mx-auto mb-2" />
          Loading announcements...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Form */}
          <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-sm self-start space-y-4">
            <h3 className="text-sm font-bold text-[#CD0000] uppercase tracking-wider flex items-center gap-1.5"><Megaphone size={16} /> Publish News</h3>
            <form onSubmit={handlePublish} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Headline *</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className={inputClass} placeholder="Short headline..." />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Audience scope</label>
                <select value={audienceType} onChange={e => { setAudienceType(e.target.value as any); setAudienceId(''); }} className={inputClass}>
                  <option value="club">Public / Club-Wide</option>
                  <option value="vertical">Vertical Domain Only</option>
                </select>
              </div>

              {audienceType !== 'club' && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Target Group</label>
                  <select required value={audienceId} onChange={e => setAudienceId(e.target.value)} className={inputClass}>
                    <option value="">Select target group...</option>
                    {verticals.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Content *</label>
                <textarea rows={4} required value={content} onChange={e => setContent(e.target.value)} className={inputClass} placeholder="Details of broadcast..." />
              </div>

              <button type="submit" disabled={isSaving} className="w-full py-2.5 bg-[#CD0000] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#A30000] transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Megaphone size={14} />} Broadcast
              </button>
            </form>
          </div>

          {/* History */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm lg:col-span-2">
            <div className="p-4 border-b border-[#E5E7EB] bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Broadcast History</h4>
            </div>
            <div className="divide-y divide-[#E5E7EB]">
              {announcements.map(ann => {
                let badge = { text: 'Club-Wide', bg: 'bg-red-50 text-red-600 border-red-200' };
                if (ann.targetType === 'vertical') {
                  const vert = verticals.find(v => v.id === ann.targetId);
                  badge = { text: vert ? vert.name : 'Vertical', bg: 'bg-purple-50 text-purple-600 border-purple-200' };
                }

                return (
                  <div key={ann.id} className="p-5 flex justify-between gap-4 hover:bg-slate-50/30 transition-colors">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${badge.bg}`}>{badge.text}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{ann.timestamp ? new Date(ann.timestamp).toLocaleString('en-GB') : ''}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">{ann.title}</h4>
                      <p className="text-xs text-slate-500 whitespace-pre-wrap leading-relaxed">{ann.content}</p>
                      <p className="text-[10px] text-slate-400 font-medium italic">Published by: {ann.createdBy || 'Administrator'}</p>
                    </div>
                    <button onClick={() => handleDelete(ann.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 shrink-0 self-start transition-colors"><Trash2 size={14} /></button>
                  </div>
                );
              })}
              {announcements.length === 0 && (
                <div className="p-12 text-center text-slate-400">No announcements posted yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
