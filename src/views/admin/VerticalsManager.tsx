"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchFromSheet } from '@/services/api';
import { 
  Plus, Edit2, Trash2, RefreshCw, BookOpen, X, Check, 
  AlertTriangle, Crown, Star, Search, Users 
} from 'lucide-react';

const ICON_OPTIONS = [
  'Brain', 'Code2', 'Gamepad2', 'Activity', 'Shuffle', 'MessageSquare',
  'Palette', 'Lightbulb', 'ShieldAlert', 'Terminal', 'Globe', 'Rocket',
  'Camera', 'Music', 'BookOpen', 'Cpu', 'Database', 'Wifi',
  'Megaphone', 'Trophy', 'Heart', 'Zap', 'Lock', 'Cloud'
];

const COLOR_PRESETS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
  '#06b6d4', '#14b8a6', '#64748b', '#eab308', '#f97316', '#22c55e',
  '#CD0000', '#6366f1', '#84cc16', '#0ea5e9'
];

interface PersonChip { id: string; name: string; email: string; }

const PeoplePicker: React.FC<{
  label: string;
  icon: React.ReactNode;
  accentClass: string;
  selected: PersonChip[];
  allUsers: any[];
  onAdd: (p: PersonChip) => void;
  onRemove: (id: string) => void;
}> = ({ label, icon, accentClass, selected, allUsers, onAdd, onRemove }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedIds = new Set(selected.map(p => p.id));

  const filtered = allUsers
    .filter(u => !selectedIds.has(u.id))
    .filter(u => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (u.full_name || u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q);
    })
    .slice(0, 7);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div>
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2 font-mono">
        {icon} {label}
      </label>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map(p => (
            <span key={p.id} className={`inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-lg text-xs font-semibold border ${accentClass}`}>
              <span>{p.name}</span>
              <button type="button" onClick={() => onRemove(p.id)} className="ml-1 p-0.5 rounded hover:bg-black/10 transition-colors">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div ref={dropdownRef} className="relative">
        <div className="flex items-center gap-2 border border-slate-200 rounded-xl bg-white px-3 py-2 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 transition-all">
          <Search size={13} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={`Search to add ${label.toLowerCase()}...`}
            className="flex-1 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none bg-transparent min-w-0"
          />
        </div>
        {open && (
          <div className="absolute top-full left-0 right-0 z-40 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-400 text-center">No matching users found.</div>
            ) : (
              filtered.map((u: any) => (
                <button
                  key={u.id}
                  type="button"
                  onMouseDown={e => {
                    e.preventDefault();
                    onAdd({ id: u.id, name: u.full_name || u.name, email: u.email });
                    setQuery('');
                    setOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 text-left transition-colors border-b border-slate-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{u.full_name || u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                  {u.role && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">{u.role}</span>}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function VerticalsManager() {
  const { user } = useAuth();
  const [verticals, setVerticals] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Leadership states
  const [selectedHeads, setSelectedHeads] = useState<PersonChip[]>([]);
  const [selectedSubHeads, setSelectedSubHeads] = useState<PersonChip[]>([]);
  const [selectedCoreCommittee, setSelectedCoreCommittee] = useState<PersonChip[]>([]);
  const [originalHeadIds, setOriginalHeadIds] = useState<Set<string>>(new Set());
  const [originalSubHeadIds, setOriginalSubHeadIds] = useState<Set<string>>(new Set());
  const [originalCoreCommitteeIds, setOriginalCoreCommitteeIds] = useState<Set<string>>(new Set());

  const loadData = async () => {
    setLoading(true);
    try {
      const [vData, uData]: any[] = await Promise.all([
        fetchFromSheet('getVerticals'),
        fetchFromSheet('getRoles')
      ]);
      setVerticals(vData || []);
      setAllUsers(uData || []);
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
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showModal]);

  const openAddModal = () => {
    setEditingItem({ name: '', description: '', category: 'tech', icon: 'Brain', color: '#3b82f6', image: '' });
    setSelectedHeads([]);
    setSelectedSubHeads([]);
    setSelectedCoreCommittee([]);
    setOriginalHeadIds(new Set());
    setOriginalSubHeadIds(new Set());
    setOriginalCoreCommitteeIds(new Set());
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem({ ...item, image: item.image || '', icon: item.icon || 'Brain', color: item.color || '#3b82f6' });
    const heads = item.heads || [];
    const subHeads = item.subHeads || [];
    const coreMembers = item.coreCommittee || [];
    setSelectedHeads(heads);
    setSelectedSubHeads(subHeads);
    setSelectedCoreCommittee(coreMembers);
    setOriginalHeadIds(new Set(heads.map((h: any) => h.id)));
    setOriginalSubHeadIds(new Set(subHeads.map((s: any) => s.id)));
    setOriginalCoreCommitteeIds(new Set(coreMembers.map((c: any) => c.id)));
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingItem) return;
    setIsSaving(true);
    try {
      const verticalData = {
        name: editingItem.name,
        description: editingItem.description,
        category: editingItem.category,
        icon: editingItem.icon,
        color: editingItem.color,
        image: editingItem.image,
      };

      let vertId = editingItem.id;
      if (vertId) {
        await fetchFromSheet('updateVertical', { id: vertId, data: verticalData });
      } else {
        await fetchFromSheet('addVertical', { data: verticalData });
        const fresh: any = await fetchFromSheet('getVerticals');
        const newVert = (fresh || []).find((v: any) => v.name === editingItem.name);
        vertId = newVert?.id;
      }

      if (vertId) {
        // leadership mapping
        const newHeadIds = new Set(selectedHeads.map(h => h.id));
        for (const oldId of originalHeadIds) {
          if (!newHeadIds.has(oldId)) {
            await fetchFromSheet('removePersonFromVertical', { userId: oldId });
          }
        }
        const newSubHeadIds = new Set(selectedSubHeads.map(s => s.id));
        for (const oldId of originalSubHeadIds) {
          if (!newSubHeadIds.has(oldId)) {
            await fetchFromSheet('removePersonFromVertical', { userId: oldId });
          }
        }
        const newCoreIds = new Set(selectedCoreCommittee.map(c => c.id));
        for (const oldId of originalCoreCommitteeIds) {
          if (!newCoreIds.has(oldId)) {
            await fetchFromSheet('removePersonFromVertical', { userId: oldId });
          }
        }
        for (const head of selectedHeads) {
          if (!originalHeadIds.has(head.id)) {
            await fetchFromSheet('assignVerticalRole', { userId: head.id, verticalId: vertId, designation: 'Vertical Head' });
          }
        }
        for (const sub of selectedSubHeads) {
          if (!originalSubHeadIds.has(sub.id)) {
            await fetchFromSheet('assignVerticalRole', { userId: sub.id, verticalId: vertId, designation: 'Vertical Sub-Head' });
          }
        }
        for (const coreMember of selectedCoreCommittee) {
          if (!originalCoreCommitteeIds.has(coreMember.id)) {
            await fetchFromSheet('assignVerticalRole', { userId: coreMember.id, verticalId: vertId, designation: 'Core Committee Member' });
          }
        }
      }
      setShowModal(false);
      await loadData();
    } catch (e) {
      alert('Failed to save vertical.');
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetchFromSheet('deleteVertical', { id });
      await loadData();
    } catch (e) {
      alert('Failed to delete vertical.');
    }
    setDeleteConfirm(null);
  };

  const inputClass = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#CD0000]/10 focus:border-slate-400 transition-all bg-white";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">Vertical Domains</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage domain verticals, category types, and leadership heads.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={loadData} className="p-2.5 text-slate-500 hover:text-[#CD0000] border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shrink-0">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={openAddModal} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] transition-colors shadow-sm">
            <Plus size={15} /> Add Vertical
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-16 text-center text-slate-400">
          <RefreshCw size={24} className="animate-spin text-[#CD0000] mx-auto mb-2" />
          Fetching verticals...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {verticals.map(item => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group flex flex-col">
              <div className="h-1.5" style={{ backgroundColor: item.color || '#CD0000' }} />
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm leading-tight">{item.name}</h3>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md mt-1 inline-block ${
                        item.category === 'tech' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>{item.category}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(item)} className="p-1 text-slate-400 hover:text-[#CD0000] rounded hover:bg-slate-50"><Edit2 size={13} /></button>
                      <button onClick={() => setDeleteConfirm(item.id)} className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-slate-50"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4">{item.description}</p>
                </div>

                <div className="border-t border-slate-100 pt-3 mt-3 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block mb-1">Heads</span>
                    <div className="flex flex-wrap gap-1">
                      {(item.heads || []).map((h: any) => (
                        <span key={h.id} className="text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/50 px-2 py-0.5 rounded-lg">{h.name}</span>
                      ))}
                      {(item.heads || []).length === 0 && <span className="text-xs text-slate-400 italic">None assigned</span>}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block mb-1">Sub-Heads</span>
                    <div className="flex flex-wrap gap-1">
                      {(item.subHeads || []).map((s: any) => (
                        <span key={s.id} className="text-[11px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200/50 px-2 py-0.5 rounded-lg">{s.name}</span>
                      ))}
                      {(item.subHeads || []).length === 0 && <span className="text-xs text-slate-400 italic">None assigned</span>}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Core Committee</span>
                    <div className="flex flex-wrap gap-1">
                      {(item.coreCommittee || []).map((c: any) => (
                        <span key={c.id} className="text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-200/50 px-2 py-0.5 rounded-lg">{c.name}</span>
                      ))}
                      {(item.coreCommittee || []).length === 0 && <span className="text-xs text-slate-400 italic">None assigned</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE/EDIT MODAL */}
      {showModal && editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">{editingItem.id ? 'Edit Vertical' : 'Create Vertical'}</h2>
              <button onClick={() => setShowModal(false)} className="text-[#8c97a8] hover:text-[#CD0000]"><X size={18} /></button>
            </div>
            
            <div className="px-5 pt-5 pb-36 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Name *</label>
                <input type="text" value={editingItem.name || ''} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} className={inputClass} placeholder="e.g. AI Creator's Lab" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Category</label>
                  <select value={editingItem.category || 'tech'} onChange={e => setEditingItem({ ...editingItem, category: e.target.value })} className={inputClass}>
                    <option value="tech">Technical</option>
                    <option value="non-tech">Non-Technical</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Icon</label>
                  <select value={editingItem.icon || 'Brain'} onChange={e => setEditingItem({ ...editingItem, icon: e.target.value })} className={inputClass}>
                    {ICON_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Color Accent</label>
                <div className="flex gap-1.5 flex-wrap items-center">
                  {COLOR_PRESETS.map(c => (
                    <button key={c} type="button" onClick={() => setEditingItem({ ...editingItem, color: c })} className={`w-6 h-6 rounded-md border ${editingItem.color === c ? 'border-slate-800 scale-105' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                  ))}
                  <input type="color" value={editingItem.color || '#3b82f6'} onChange={e => setEditingItem({ ...editingItem, color: e.target.value })} className="w-6 h-6 border-0 p-0 cursor-pointer rounded-md shrink-0" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Description</label>
                <textarea rows={3} value={editingItem.description || ''} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} className={inputClass} placeholder="Domain details..." />
              </div>

              {/* Leadership Assign */}
              <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-4">
                <PeoplePicker 
                  label="Vertical Heads"
                  icon={<Crown size={12} className="text-amber-500" />}
                  accentClass="bg-amber-50 border-amber-200 text-amber-700"
                  selected={selectedHeads}
                  allUsers={allUsers}
                  onAdd={p => setSelectedHeads(prev => [...prev, p])}
                  onRemove={id => setSelectedHeads(prev => prev.filter(h => h.id !== id))}
                />
                <PeoplePicker 
                  label="Vertical Sub-Heads"
                  icon={<Star size={12} className="text-indigo-500" />}
                  accentClass="bg-indigo-50 border-indigo-200 text-indigo-700"
                  selected={selectedSubHeads}
                  allUsers={allUsers}
                  onAdd={p => setSelectedSubHeads(prev => [...prev, p])}
                  onRemove={id => setSelectedSubHeads(prev => prev.filter(s => s.id !== id))}
                />
                <PeoplePicker 
                  label="Core Committee Members"
                  icon={<Users size={12} className="text-slate-500" />}
                  accentClass="bg-slate-50 border-slate-200 text-slate-700"
                  selected={selectedCoreCommittee}
                  allUsers={allUsers}
                  onAdd={p => setSelectedCoreCommittee(prev => [...prev, p])}
                  onRemove={id => setSelectedCoreCommittee(prev => prev.filter(c => c.id !== id))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-slate-100 shrink-0">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-[#667085] hover:text-[#CD0000]">Cancel</button>
              <button type="button" onClick={handleSave} disabled={isSaving} className="flex items-center gap-1.5 px-5 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000]">
                {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />} Save
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
            <h3 className="font-bold text-[#CD0000] mb-2">Delete Vertical Domain?</h3>
            <p className="text-slate-500 text-sm mb-6 font-semibold">This will delete the vertical and revoke any head assignments. This cannot be undone.</p>
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
