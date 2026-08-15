"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchFromSheet } from '@/services/api';
import { Plus, Edit2, Trash2, RefreshCw, Calendar, X, Check, AlertTriangle, FileDown, ChevronDown, ChevronUp } from 'lucide-react';
import { generateEventWordReport, generateSampleReportTemplate } from '@/utils/generateEventWordReport';

export default function EventsManager() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchFromSheet('getEvents');
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (showModal || deleteConfirm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showModal, deleteConfirm]);

  const [exportingId, setExportingId] = useState<string | null>(null);
  const [showReportFields, setShowReportFields] = useState(false);

  const handleDownloadReport = async (item: any) => {
    setExportingId(item.id || 'current');
    try {
      await generateEventWordReport(item);
    } catch (err) {
      alert('Failed to generate Activity Report document.');
    } finally {
      setExportingId(null);
    }
  };

  const openAddModal = () => {
    setEditingItem({ title: '', date: '', status: 'upcoming', description: '', banner: '', location: '' });
    setShowReportFields(false);
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem({ ...item });
    setShowReportFields(false);
    setShowModal(true);
  };

  const formatDateForInput = (d: any) => {
    if (!d) return '';
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    try {
      const dateObj = new Date(d);
      if (isNaN(dateObj.getTime())) return typeof d === 'string' ? d : '';
      return dateObj.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  const handleSave = async () => {
    if (!editingItem) return;
    setIsSaving(true);
    try {
      const action = editingItem.id ? 'updateEvent' : 'addEvent';
      await fetchFromSheet(action, { id: editingItem.id, data: editingItem });
      setShowModal(false);
      await loadData();
    } catch (e: any) {
      console.error('[EventsManager] handleSave error:', e);
      alert(e.message || 'Failed to save event.');
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetchFromSheet('deleteEvent', { id });
      await loadData();
    } catch (e: any) {
      console.error('[EventsManager] handleDelete error:', e);
      alert(e.message || 'Failed to delete event.');
    }
    setDeleteConfirm(null);
  };

  const inputClass = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#CD0000]/10 focus:border-slate-400 transition-all bg-white";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">Club Events</h1>
          <p className="text-slate-500 text-sm mt-0.5">Publish and manage community schedules, fests, and activity reports.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button onClick={loadData} className="p-2.5 text-slate-500 hover:text-[#CD0000] border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shrink-0" title="Refresh">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={openAddModal} className="px-4 py-2 bg-[#CD0000] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#A30000] transition-all flex items-center gap-2 shadow-xs">
            <Plus size={14} /> Publish Event
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={24} className="animate-spin text-[#CD0000]" />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Calendar size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-700 mb-1">No Events Found</h3>
          <p className="text-slate-500 text-xs mb-4">Get started by creating your first club event.</p>
          <button onClick={openAddModal} className="px-4 py-2 bg-[#CD0000] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#A30000] transition-all inline-flex items-center gap-2">
            <Plus size={14} /> Publish Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((item) => (
            <div key={item.id || item.title} className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between group hover:border-slate-300 transition-all">
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    item.status === 'upcoming'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {item.status || 'upcoming'}
                  </span>
                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDownloadReport(item)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Download Word Activity Report">
                      {exportingId === item.id ? <RefreshCw size={14} className="animate-spin text-[#CD0000]" /> : <FileDown size={14} />}
                    </button>
                    <button onClick={() => openEditModal(item)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setDeleteConfirm(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-800 text-base line-clamp-1">{item.title}</h3>
                <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{item.description}</p>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold">{item.date || 'TBD'}</span>
                <span>{item.location || 'Central Campus'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Add Modal */}
      {showModal && editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">{editingItem.id ? 'Edit Event Details' : 'Publish Event'}</h2>
              <button onClick={() => setShowModal(false)} className="text-[#8c97a8] hover:text-[#CD0000]"><X size={18} /></button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-4 flex-1 min-h-0">
              <div>
                <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Event Title *</label>
                <input type="text" value={editingItem.title || ''} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} className={inputClass} placeholder="Event name..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Date *</label>
                  <input type="date" value={formatDateForInput(editingItem.date)} onChange={e => setEditingItem({ ...editingItem, date: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Status</label>
                  <select value={editingItem.status || 'upcoming'} onChange={e => setEditingItem({ ...editingItem, status: e.target.value })} className={inputClass}>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Time</label>
                  <input type="text" value={editingItem.time || ''} onChange={e => setEditingItem({ ...editingItem, time: e.target.value })} className={inputClass} placeholder="e.g. 10:00 AM - 12:00 PM" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Location / Venue</label>
                  <input type="text" value={editingItem.location || ''} onChange={e => setEditingItem({ ...editingItem, location: e.target.value })} className={inputClass} placeholder="e.g. Council Room, Central Block" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Banner Image URL</label>
                <input type="url" value={editingItem.banner || editingItem.bannerUrl || ''} onChange={e => setEditingItem({ ...editingItem, banner: e.target.value, bannerUrl: e.target.value })} className={inputClass} placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Description / Summary</label>
                <textarea rows={3} value={editingItem.description || ''} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} className={inputClass} placeholder="Short event details..." />
              </div>

              {/* Collapsible Activity Report Fields */}
              <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
                <button
                  type="button"
                  onClick={() => setShowReportFields(!showReportFields)}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 text-left font-semibold text-xs text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileDown size={14} className="text-[#CD0000]" />
                    CHRIST Official Activity Report Data (Optional)
                  </span>
                  {showReportFields ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showReportFields && (
                  <div className="p-4 space-y-3 bg-white border-t border-slate-200">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">Type of Activity</label>
                      <textarea rows={2} value={editingItem.activityType || ''} onChange={e => setEditingItem({ ...editingItem, activityType: e.target.value })} className={inputClass} placeholder="1. Student Participation and Activities (5.3)..." />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Type of Participants</label>
                        <input type="text" value={editingItem.participantsType || ''} onChange={e => setEditingItem({ ...editingItem, participantsType: e.target.value })} className={inputClass} placeholder="e.g. Alumni, Faculty and students" />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">No. of Participants</label>
                        <input type="number" value={editingItem.participantCount || ''} onChange={e => setEditingItem({ ...editingItem, participantCount: e.target.value })} className={inputClass} placeholder="e.g. 50" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">Collaboration / Sponsor</label>
                      <input type="text" value={editingItem.collaboration || ''} onChange={e => setEditingItem({ ...editingItem, collaboration: e.target.value })} className={inputClass} placeholder="Department of Computer Science..." />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">Highlights (One per line)</label>
                      <textarea rows={2} value={Array.isArray(editingItem.highlights) ? editingItem.highlights.join('\n') : (editingItem.highlights || '')} onChange={e => setEditingItem({ ...editingItem, highlights: e.target.value.split('\n') })} className={inputClass} placeholder="1. Participation of multi-batch alumni..." />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">Key Takeaways (One per line)</label>
                      <textarea rows={2} value={Array.isArray(editingItem.keyTakeaways) ? editingItem.keyTakeaways.join('\n') : (editingItem.keyTakeaways || '')} onChange={e => setEditingItem({ ...editingItem, keyTakeaways: e.target.value.split('\n') })} className={inputClass} placeholder="1. Strengthened Alumni Engagement..." />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">Detailed Descriptive Report</label>
                      <textarea rows={4} value={editingItem.descriptiveReport || ''} onChange={e => setEditingItem({ ...editingItem, descriptiveReport: e.target.value })} className={inputClass} placeholder="Full event description, speeches, welcome address, etc." />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Rapporteur Name</label>
                        <input type="text" value={editingItem.rapporteurName || ''} onChange={e => setEditingItem({ ...editingItem, rapporteurName: e.target.value })} className={inputClass} placeholder="Dr. V. Vaidhehi" />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Rapporteur Email</label>
                        <input type="email" value={editingItem.rapporteurEmail || ''} onChange={e => setEditingItem({ ...editingItem, rapporteurEmail: e.target.value })} className={inputClass} placeholder="vaidhehi.v@christuniversity.in" />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Rapporteur Contact</label>
                        <input type="text" value={editingItem.rapporteurContact || ''} onChange={e => setEditingItem({ ...editingItem, rapporteurContact: e.target.value })} className={inputClass} placeholder="9845256910" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-5 border-t border-slate-100 shrink-0">
              <button 
                type="button" 
                onClick={() => handleDownloadReport(editingItem)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl hover:bg-blue-100 text-xs font-semibold transition-colors"
              >
                <FileDown size={14} /> Download Word Report
              </button>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-[#667085] hover:text-[#CD0000]">Cancel</button>
                <button type="button" onClick={handleSave} disabled={isSaving} className="flex items-center gap-1.5 px-5 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000]">
                  {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />} Save Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4 text-red-500">
              <AlertTriangle size={28} />
            </div>
            <h3 className="font-bold text-[#CD0000] mb-2">Delete Event?</h3>
            <p className="text-slate-500 text-sm mb-6">This will delete the event schedule. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 text-sm font-semibold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
