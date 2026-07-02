"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { fetchFromSheet } from '../../../services/api';
import { Plus, Edit2, Trash2, X, AlertTriangle, RefreshCw, Calendar } from 'lucide-react';

interface Event {
  id?: string;
  title: string;
  description: string;
  date: string;
  category: string;
  status: 'upcoming' | 'past';
  featured: boolean;
  committeeId: string;
}

const EMPTY_EVENT = (committeeId: string): Event => ({
  title: '', description: '', date: '', category: 'Workshop', status: 'upcoming', featured: false, committeeId
});

export default function CommitteeEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadEvents = async () => {
    if (user?.committeeId) {
      setLoading(true);
      try {
        const data: any = await fetchFromSheet('getEvents');
        const commEvents = (data || []).filter((e: any) => e.committeeId === user.committeeId);
        setEvents(commEvents);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadEvents();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !editingEvent.title) return;

    try {
      if (editingEvent.id) {
        await fetchFromSheet('updateEvent', { id: editingEvent.id, data: editingEvent });
      } else {
        await fetchFromSheet('addEvent', { data: editingEvent });
      }
      setShowModal(false);
      loadEvents();
    } catch (err) {
      console.error(err);
      alert('Failed to save event.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetchFromSheet('deleteEvent', { id });
      setDeleteConfirm(null);
      loadEvents();
    } catch (err) {
      console.error(err);
      alert('Failed to delete event.');
    }
  };

  const openAddModal = () => {
    if (user?.committeeId) {
      setEditingEvent(EMPTY_EVENT(user.committeeId));
      setShowModal(true);
    }
  };

  const openEditModal = (evt: any) => {
    setEditingEvent({
      id: evt.id,
      title: evt.title,
      description: evt.description,
      date: evt.date,
      category: evt.category,
      status: evt.status,
      featured: evt.featured || false,
      committeeId: evt.committeeId
    });
    setShowModal(true);
  };

  const inputClass = "w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CD0000]/15 focus:border-[#CD0000] text-slate-800 placeholder:text-slate-400";

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">Committee Events</h1>
          <p className="text-[#667085] text-sm mt-0.5">Manage and post events hosted by your committee.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] transition-colors"
        >
          <Plus size={15} /> Add Event
        </button>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#667085]">
            <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-[#CD0000]" />
            Loading events...
          </div>
        ) : events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#667085]">
              <thead className="bg-[rgba(205, 0, 0, 0.03)] border-b border-[rgba(205, 0, 0, 0.07)] text-xs font-bold text-[#8c97a8] uppercase tracking-wider">
                <tr>
                  <th className="p-4">Event</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {events.map(evt => (
                  <tr key={evt.id} className="hover:bg-[rgba(205, 0, 0, 0.03)]/30 transition-colors">
                    <td className="p-4">
                      <h4 className="font-semibold text-slate-800">{evt.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{evt.description}</p>
                    </td>
                    <td className="p-4 text-slate-700">{new Date(evt.date).toLocaleDateString()}</td>
                    <td className="p-4 text-slate-500">{evt.category}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        evt.status === 'upcoming' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {evt.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button 
                          onClick={() => openEditModal(evt)}
                          className="p-1.5 text-[#8c97a8] hover:text-[#CD0000] hover:bg-[rgba(205, 0, 0, 0.03)] rounded-lg transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm(evt.id)}
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
            <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-base font-bold text-slate-800 mb-1">No Events Found</h3>
            <p className="text-[#667085]">You haven't posted any events yet. Create one to get started.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && editingEvent && (
        <div className="fixed inset-0 z-50 bg-[#CD0000]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] w-full max-w-md">
            <form onSubmit={handleSave}>
              <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]">
                <h2 className="font-bold text-[#CD0000]">{editingEvent.id ? 'Edit Event' : 'Add New Event'}</h2>
                <button type="button" onClick={() => setShowModal(false)} className="text-[#8c97a8] hover:text-[#CD0000]">
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 space-y-4 text-left">
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Event Title *</label>
                  <input type="text" required value={editingEvent.title} onChange={e => setEditingEvent({ ...editingEvent, title: e.target.value })} className={inputClass} placeholder="e.g. Publicity Strategy Workshop" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Description</label>
                  <textarea rows={3} value={editingEvent.description} onChange={e => setEditingEvent({ ...editingEvent, description: e.target.value })} className={inputClass} placeholder="Details about registration, venue, speakers..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Date *</label>
                    <input type="date" required value={editingEvent.date} onChange={e => setEditingEvent({ ...editingEvent, date: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Category *</label>
                    <select value={editingEvent.category} onChange={e => setEditingEvent({ ...editingEvent, category: e.target.value })} className={inputClass}>
                      <option value="Workshop">Workshop</option>
                      <option value="Speaker Session">Speaker Session</option>
                      <option value="Hackathon">Hackathon</option>
                      <option value="Competition">Competition</option>
                      <option value="Social Event">Social Event</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Status</label>
                    <select value={editingEvent.status} onChange={e => setEditingEvent({ ...editingEvent, status: e.target.value as any })} className={inputClass}>
                      <option value="upcoming">Upcoming</option>
                      <option value="past">Past</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input 
                      type="checkbox" 
                      id="featured"
                      checked={editingEvent.featured} 
                      onChange={e => setEditingEvent({ ...editingEvent, featured: e.target.checked })} 
                      className="w-4 h-4 text-[#CD0000] border-slate-300 rounded focus:ring-[#CD0000]"
                    />
                    <label htmlFor="featured" className="text-xs font-semibold text-slate-700 cursor-pointer">Featured Event</label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-5 border-t border-[#E5E7EB]">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-[#667085] hover:text-[#CD0000]">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] transition-colors">
                  Save Event
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
            <h3 className="font-bold text-[#CD0000] mb-2">Delete this event?</h3>
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
