"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchFromSheet } from '@/services/api';
import { Plus, Edit2, Trash2, RefreshCw, Calendar, X, Check, AlertTriangle } from 'lucide-react';

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

  const openAddModal = () => {
    setEditingItem({ title: '', date: '', status: 'upcoming', description: '', banner: '', location: '' });
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem({ ...item });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingItem) return;
    setIsSaving(true);
    try {
      const action = editingItem.id ? 'updateEvent' : 'addEvent';
      await fetchFromSheet(action, { id: editingItem.id, data: editingItem });
      setShowModal(false);
      await loadData();
    } catch (e) {
      alert('Failed to save event.');
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetchFromSheet('deleteEvent', { id });
      await loadData();
    } catch (e) {
      alert('Failed to delete event.');
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
          <p className="text-slate-500 text-sm mt-0.5">Publish and manage community schedules, fests, and hackathons.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={loadData} className="p-2.5 text-slate-500 hover:text-[#CD0000] border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shrink-0">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={openAddModal} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] transition-colors shadow-sm">
            <Plus size={15} /> Add Event
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-16 text-center text-slate-400">
          <RefreshCw size={24} className="animate-spin text-[#CD0000] mx-auto mb-2" />
          Fetching events...
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Event Title</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-750">
                {events.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{item.title}</td>
                    <td className="p-4 text-slate-500">{item.location || '—'}</td>
                    <td className="p-4 text-slate-500">{item.date ? new Date(item.date).toLocaleDateString('en-GB') : '—'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        item.status === 'upcoming' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-500'
                      }`}>{item.status || 'upcoming'}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => openEditModal(item)} className="p-1.5 text-slate-400 hover:text-[#CD0000] hover:bg-red-50 rounded-lg transition-colors"><Edit2 size={13} /></button>
                        <button onClick={() => setDeleteConfirm(item.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr><td colSpan={5} className="p-10 text-center text-slate-400">No events published yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE/EDIT MODAL */}
      {showModal && editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">{editingItem.id ? 'Edit Event' : 'Publish Event'}</h2>
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
                  <input type="date" value={editingItem.date ? new Date(editingItem.date).toISOString().split('T')[0] : ''} onChange={e => setEditingItem({ ...editingItem, date: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Status</label>
                  <select value={editingItem.status || 'upcoming'} onChange={e => setEditingItem({ ...editingItem, status: e.target.value })} className={inputClass}>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Location</label>
                <input type="text" value={editingItem.location || ''} onChange={e => setEditingItem({ ...editingItem, location: e.target.value })} className={inputClass} placeholder="e.g. Auditorium / Block IV" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Banner Image URL</label>
                <input type="url" value={editingItem.banner || ''} onChange={e => setEditingItem({ ...editingItem, banner: e.target.value })} className={inputClass} placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Description</label>
                <textarea rows={3} value={editingItem.description || ''} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} className={inputClass} placeholder="Short event details..." />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-slate-100 shrink-0">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-[#667085] hover:text-[#CD0000]">Cancel</button>
              <button type="button" onClick={handleSave} disabled={isSaving} className="flex items-center gap-1.5 px-5 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000]">
                {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />} Publish
              </button>
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
