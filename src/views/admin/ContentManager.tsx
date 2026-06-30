import React, { useState, useEffect } from 'react';
import { fetchFromSheet } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Edit2, Trash2, Plus, RefreshCw, Calendar, BookOpen, X, Check, AlertTriangle } from 'lucide-react';

const ContentManager: React.FC = () => {
  const { user, can } = useAuth();
  const [activeTab, setActiveTab] = useState<'events' | 'verticals'>('events');
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await fetchFromSheet(activeTab === 'events' ? 'getEvents' : 'getVerticals');
      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Failed to load data', error);
    }
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, [activeTab]);

  const tabs = [
    { id: 'events', label: 'Events', icon: Calendar, show: can('manage_events') },
    { id: 'verticals', label: 'Verticals', icon: BookOpen, show: can('manage_verticals') },
  ].filter(t => t.show);

  const openAddModal = () => {
    if (activeTab === 'events') {
      setEditingItem({ title: '', date: '', status: 'upcoming', description: '', banner: '', type: 'tech' });
    } else {
      setEditingItem({ name: '', description: '', category: 'tech', image: '' });
    }
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
      const actionPrefix = activeTab === 'events' ? 'Event' : 'Vertical';
      const action = editingItem.id ? `update${actionPrefix}` : `add${actionPrefix}`;
      await fetchFromSheet(action, { userEmail: user?.email, id: editingItem.id, data: editingItem });
      setShowModal(false);
      await loadData();
    } catch (e) {
      console.error(e);
      alert('Failed to save.');
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const action = activeTab === 'events' ? 'deleteEvent' : 'deleteVertical';
      await fetchFromSheet(action, { userEmail: user?.email, id });
      await loadData();
    } catch (e) {
      console.error(e);
      alert('Failed to delete.');
    }
    setDeleteConfirm(null);
  };

  const inputClass = "w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm text-[#CD0000] placeholder:text-[#8c97a8] focus:outline-none focus:ring-2 focus:ring-[#CD0000]/15 focus:border-[#CD0000] transition-all";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">Content Manager</h1>
          <p className="text-[#667085] text-sm mt-0.5">Manage website content via simulated backend.</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] transition-colors">
          <Plus size={15} /> Add New
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-[#E5E7EB]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#CD0000] text-[#CD0000] bg-[rgba(205, 0, 0, 0.03)]/50'
                  : 'border-transparent text-[#667085] hover:text-[#CD0000]'
              }`}
            >
              <tab.icon size={15} /> {tab.label}
            </button>
          ))}
          <button onClick={loadData} className="ml-auto px-4 py-4 text-[#8c97a8] hover:text-[#CD0000] transition-colors">
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 flex flex-col items-center gap-2 text-[#8c97a8]">
            <RefreshCw size={24} className="animate-spin text-[#CD0000]" />
            <span className="text-sm">Loading {activeTab}...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[rgba(205, 0, 0, 0.03)] border-b border-[rgba(205, 0, 0, 0.07)] text-xs font-bold text-[#8c97a8] uppercase tracking-wider">
                  <th className="p-4">Title / Name</th>
                  {activeTab === 'events' && <th className="p-4">Date</th>}
                  {activeTab === 'events' && <th className="p-4">Status</th>}
                  {activeTab === 'verticals' && <th className="p-4">Category</th>}
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {data.map((item: any) => (
                  <tr key={item.id} className="hover:bg-[rgba(205, 0, 0, 0.03)]/30 transition-colors text-sm">
                    <td className="p-4 text-[#CD0000] font-semibold">{item.title || item.name}</td>
                    {activeTab === 'events' && (
                      <td className="p-4 text-[#667085]">{item.date ? new Date(item.date).toLocaleDateString() : '—'}</td>
                    )}
                    {activeTab === 'events' && (
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${item.status === 'upcoming' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                          {item.status}
                        </span>
                      </td>
                    )}
                    {activeTab === 'verticals' && (
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${item.category === 'tech' ? 'bg-[rgba(205, 0, 0, 0.03)] text-[#CD0000] border border-[rgba(205, 0, 0, 0.07)]' : 'bg-green-50 text-green-600 border border-green-200'}`}>
                          {item.category}
                        </span>
                      </td>
                    )}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => openEditModal(item)} className="p-1.5 text-[#8c97a8] hover:text-[#CD0000] hover:bg-[rgba(205, 0, 0, 0.03)] rounded-lg transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => setDeleteConfirm(item.id)} className="p-1.5 text-[#8c97a8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length === 0 && <div className="p-10 text-center text-[#8c97a8] text-sm">No records found.</div>}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && editingItem && (
        <div className="fixed inset-0 z-50 bg-[#CD0000]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
              <h2 className="font-bold text-[#CD0000]">{editingItem.id ? 'Edit' : 'Add'} {activeTab === 'events' ? 'Event' : 'Vertical'}</h2>
              <button onClick={() => setShowModal(false)} className="text-[#8c97a8] hover:text-[#CD0000] transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {activeTab === 'events' ? (
                <>
                  <div><label className="text-xs font-semibold text-[#8c97a8] block mb-1">Title</label><input type="text" value={editingItem.title} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} className={inputClass} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-semibold text-[#8c97a8] block mb-1">Date</label><input type="date" value={editingItem.date ? new Date(editingItem.date).toISOString().split('T')[0] : ''} onChange={e => setEditingItem({ ...editingItem, date: new Date(e.target.value).toISOString() })} className={inputClass} /></div>
                    <div><label className="text-xs font-semibold text-[#8c97a8] block mb-1">Status</label><select value={editingItem.status} onChange={e => setEditingItem({ ...editingItem, status: e.target.value })} className={inputClass}><option value="upcoming">Upcoming</option><option value="completed">Completed</option></select></div>
                  </div>
                  <div><label className="text-xs font-semibold text-[#8c97a8] block mb-1">Banner URL</label><input type="url" value={editingItem.banner || ''} onChange={e => setEditingItem({ ...editingItem, banner: e.target.value })} className={inputClass} /></div>
                  <div><label className="text-xs font-semibold text-[#8c97a8] block mb-1">Description</label><textarea value={editingItem.description} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} className={inputClass} rows={3}></textarea></div>
                </>
              ) : (
                <>
                  <div><label className="text-xs font-semibold text-[#8c97a8] block mb-1">Name</label><input type="text" value={editingItem.name} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} className={inputClass} /></div>
                  <div><label className="text-xs font-semibold text-[#8c97a8] block mb-1">Category</label><select value={editingItem.category} onChange={e => setEditingItem({ ...editingItem, category: e.target.value })} className={inputClass}><option value="tech">Technical</option><option value="non-tech">Non-Technical</option></select></div>
                  <div><label className="text-xs font-semibold text-[#8c97a8] block mb-1">Banner Image URL</label><input type="url" value={editingItem.image || ''} onChange={e => setEditingItem({ ...editingItem, image: e.target.value })} className={inputClass} /></div>
                  <div><label className="text-xs font-semibold text-[#8c97a8] block mb-1">Description</label><textarea value={editingItem.description} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} className={inputClass} rows={3}></textarea></div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-[#E5E7EB]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-[#667085] hover:text-[#CD0000] transition-colors font-medium">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-5 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] transition-colors disabled:opacity-50">
                {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />} {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-[#CD0000]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4"><AlertTriangle size={28} className="text-red-500" /></div>
            <h3 className="font-bold text-[#CD0000] mb-2">Remove Item?</h3>
            <p className="text-[#667085] text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 text-sm font-semibold text-[#667085] border border-[#E5E7EB] rounded-xl hover:bg-[rgba(205, 0, 0, 0.03)] transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManager;
