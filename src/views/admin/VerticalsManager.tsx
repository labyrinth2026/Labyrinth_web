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

  // Core Committees Hierarchy states
  const [verticalCommittees, setVerticalCommittees] = useState<any[]>([]);
  const [newCommInput, setNewCommInput] = useState('');
  const [editingCommId, setEditingCommId] = useState<string | null>(null);
  const [editingCommName, setEditingCommName] = useState('');

  // Dedicated Add/Manage Committee Modal State
  const [showCommitteeModal, setShowCommitteeModal] = useState(false);
  const [commModalVerticalId, setCommModalVerticalId] = useState<string>('');
  const [commNameInput, setCommNameInput] = useState('');
  const [commDescInput, setCommDescInput] = useState('');
  const [isCommSaving, setIsCommSaving] = useState(false);

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
    if (showModal || deleteConfirm || showCommitteeModal) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [showModal, deleteConfirm, showCommitteeModal]);

  const openCommitteeModal = (verticalId?: string) => {
    setCommModalVerticalId(verticalId || (verticals[0]?.id || ''));
    setCommNameInput('');
    setCommDescInput('');
    setShowCommitteeModal(true);
  };

  const handleSaveCommittee = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commNameInput.trim() || !commModalVerticalId) return;
    setIsCommSaving(true);
    try {
      await fetchFromSheet('addCoreCommittee', { 
        name: commNameInput.trim(), 
        description: commDescInput.trim() || 'Created via Committee Manager', 
        verticalId: commModalVerticalId 
      });
      setCommNameInput('');
      setCommDescInput('');
      const fresh: any = await fetchFromSheet('getVerticals');
      if (fresh) {
        setVerticals(fresh);
        if (editingItem && editingItem.id === commModalVerticalId) {
          const updatedItem = fresh.find((v: any) => v.id === commModalVerticalId);
          if (updatedItem) {
            setEditingItem(updatedItem);
            setVerticalCommittees(updatedItem.committees || []);
          }
        }
      }
    } catch (err) {
      alert('Failed to add core committee.');
    } finally {
      setIsCommSaving(false);
    }
  };

  const openAddModal = () => {
    setEditingItem({ name: '', description: '', category: 'tech', icon: 'Brain', color: '#3b82f6', image: '' });
    setSelectedHeads([]);
    setSelectedSubHeads([]);
    setSelectedCoreCommittee([]);
    setOriginalHeadIds(new Set());
    setOriginalSubHeadIds(new Set());
    setOriginalCoreCommitteeIds(new Set());
    setVerticalCommittees([]);
    setNewCommInput('');
    setEditingCommId(null);
    setEditingCommName('');
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
    setVerticalCommittees(item.committees || []);
    setNewCommInput('');
    setEditingCommId(null);
    setEditingCommName('');
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
    } catch (e: any) {
      console.error('[VerticalsManager] handleSave error:', e);
      alert(e.message || 'Failed to save vertical.');
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

  // Core Committees Inline CRUD handlers
  const handleInlineAddComm = async () => {
    if (!newCommInput.trim() || !editingItem?.id) return;
    try {
      await fetchFromSheet('addCoreCommittee', { 
        name: newCommInput.trim(), 
        description: 'Created in vertical manager', 
        verticalId: editingItem.id 
      });
      setNewCommInput('');
      const fresh: any = await fetchFromSheet('getVerticals');
      const updatedItem = (fresh || []).find((v: any) => v.id === editingItem.id);
      if (updatedItem) {
        setEditingItem(updatedItem);
        setVerticalCommittees(updatedItem.committees || []);
      }
      await loadData();
    } catch (err) {
      alert('Failed to add core committee.');
    }
  };

  const handleStartEditingComm = (id: string, name: string) => {
    setEditingCommId(id);
    setEditingCommName(name);
  };

  const handleSaveEditingComm = async (id: string) => {
    if (!editingCommName.trim() || !editingItem?.id) return;
    try {
      await fetchFromSheet('updateCoreCommittee', { 
        id, 
        name: editingCommName.trim(), 
        verticalId: editingItem.id 
      });
      setEditingCommId(null);
      const fresh: any = await fetchFromSheet('getVerticals');
      const updatedItem = (fresh || []).find((v: any) => v.id === editingItem.id);
      if (updatedItem) {
        setEditingItem(updatedItem);
        setVerticalCommittees(updatedItem.committees || []);
      }
      await loadData();
    } catch (err) {
      alert('Failed to update core committee.');
    }
  };

  const handleDeleteComm = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this core committee? This will unassign any member of this committee.')) return;
    try {
      await fetchFromSheet('deleteCoreCommittee', { id });
      const fresh: any = await fetchFromSheet('getVerticals');
      const updatedItem = (fresh || []).find((v: any) => v.id === editingItem.id);
      if (updatedItem) {
        setEditingItem(updatedItem);
        setVerticalCommittees(updatedItem.committees || []);
      }
      await loadData();
    } catch (err) {
      alert('Failed to delete core committee.');
    }
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
          <button onClick={loadData} className="p-2.5 text-slate-500 hover:text-[#CD0000] border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shrink-0" title="Refresh data">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => openCommitteeModal()} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl hover:bg-slate-900 transition-colors shadow-sm">
            <Users size={14} /> Add Core Committee
          </button>
          <button onClick={openAddModal} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-[#CD0000] text-white text-xs font-semibold rounded-xl hover:bg-[#A30000] transition-colors shadow-sm">
            <Plus size={14} /> Add Vertical
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
                      <button onClick={() => openEditModal(item)} className="p-1 text-slate-400 hover:text-[#CD0000] rounded hover:bg-slate-50" title="Edit Vertical"><Edit2 size={13} /></button>
                      <button onClick={() => setDeleteConfirm(item.id)} className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-slate-50" title="Delete Vertical"><Trash2 size={13} /></button>
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
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Core Committee</span>
                      <button onClick={() => openCommitteeModal(item.id)} className="text-[10px] font-bold text-[#CD0000] hover:underline flex items-center gap-0.5">
                        <Plus size={10} /> Add Committee
                      </button>
                    </div>
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

      {/* CREATE/EDIT MODAL (Horizontal Multi-Column Layout) */}
      {showModal && editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Header with Top Save Action */}
            <div className="flex justify-between items-center px-8 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-red-50 border border-red-100 text-[#CD0000] text-[10px] font-black uppercase tracking-widest mb-0.5">
                  Vertical Domain Configuration
                </span>
                <h3 className="font-extrabold text-xl text-slate-900 tracking-tight leading-none">
                  {editingItem.id ? 'Edit Vertical Domain' : 'Create Vertical Domain'}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200/60 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleSave} 
                  disabled={isSaving} 
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#CD0000] hover:bg-[#A30000] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />} Save Vertical Domain
                </button>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all ml-1"
                  title="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content Body Form */}
            <div className="p-8 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Left Column (Domain Metadata & Styling) */}
                <div className="md:col-span-5 space-y-5 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Domain Identity</p>

                  {/* Name */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Vertical Domain Name *</label>
                    <input 
                      type="text" 
                      value={editingItem.name || ''} 
                      onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} 
                      className={inputClass} 
                      placeholder="e.g. AI HUB / DevZen" 
                    />
                  </div>

                  {/* Category & Icon */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Category</label>
                      <select 
                        value={editingItem.category || 'tech'} 
                        onChange={e => setEditingItem({ ...editingItem, category: e.target.value })} 
                        className={inputClass}
                      >
                        <option value="tech">Technical</option>
                        <option value="non-tech">Non-Technical</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Icon</label>
                      <select 
                        value={editingItem.icon || 'Brain'} 
                        onChange={e => setEditingItem({ ...editingItem, icon: e.target.value })} 
                        className={inputClass}
                      >
                        {ICON_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Color Accent */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">Theme Color Accent</label>
                    <div className="flex gap-2 flex-wrap items-center bg-slate-50 border border-slate-100 rounded-2xl p-3">
                      {COLOR_PRESETS.map(c => (
                        <button 
                          key={c} 
                          type="button" 
                          onClick={() => setEditingItem({ ...editingItem, color: c })} 
                          className={`w-6 h-6 rounded-lg border transition-all ${editingItem.color === c ? 'border-slate-900 scale-110 shadow-xs ring-2 ring-slate-400/30' : 'border-transparent hover:scale-105'}`} 
                          style={{ backgroundColor: c }} 
                        />
                      ))}
                      <input 
                        type="color" 
                        value={editingItem.color || '#3b82f6'} 
                        onChange={e => setEditingItem({ ...editingItem, color: e.target.value })} 
                        className="w-6 h-6 border-0 p-0 cursor-pointer rounded-lg shrink-0 ml-1" 
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Domain Description</label>
                    <textarea 
                      rows={4} 
                      value={editingItem.description || ''} 
                      onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} 
                      className={inputClass} 
                      placeholder="Enter a brief summary describing this vertical's focus and objectives..." 
                    />
                  </div>
                </div>

                {/* Right Column (Leadership Assignments & Linked Committees) */}
                <div className="md:col-span-7 space-y-5">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Leadership & Structure</p>

                  <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-4">
                    <PeoplePicker 
                      label="Vertical Heads"
                      icon={<Crown size={13} className="text-amber-500" />}
                      accentClass="bg-amber-50 border-amber-200 text-amber-700"
                      selected={selectedHeads}
                      allUsers={allUsers}
                      onAdd={p => setSelectedHeads(prev => [...prev, p])}
                      onRemove={id => setSelectedHeads(prev => prev.filter(h => h.id !== id))}
                    />
                    <PeoplePicker 
                      label="Vertical Sub-Heads"
                      icon={<Star size={13} className="text-indigo-500" />}
                      accentClass="bg-indigo-50 border-indigo-200 text-indigo-700"
                      selected={selectedSubHeads}
                      allUsers={allUsers}
                      onAdd={p => setSelectedSubHeads(prev => [...prev, p])}
                      onRemove={id => setSelectedSubHeads(prev => prev.filter(s => s.id !== id))}
                    />
                    <PeoplePicker 
                      label="Core Committee Members"
                      icon={<Users size={13} className="text-slate-500" />}
                      accentClass="bg-slate-50 border-slate-200 text-slate-700"
                      selected={selectedCoreCommittee}
                      allUsers={allUsers}
                      onAdd={p => setSelectedCoreCommittee(prev => [...prev, p])}
                      onRemove={id => setSelectedCoreCommittee(prev => prev.filter(c => c.id !== id))}
                    />

                    {/* Core Committees Hierarchy CRUD */}
                    {editingItem.id && (
                      <div className="p-4 border border-slate-100 rounded-2xl bg-white space-y-3 mt-4 text-left shadow-xs">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                          <Users size={12} className="text-[#CD0000]" /> Core Committees List (CRUD)
                        </label>
                        
                        <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                          {verticalCommittees.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No core committees linked to this vertical.</p>
                          ) : (
                            verticalCommittees.map(c => (
                              <div key={c.id} className="flex items-center justify-between bg-slate-50/80 border border-slate-100 rounded-xl px-3 py-2">
                                {editingCommId === c.id ? (
                                  <div className="flex gap-2 items-center flex-1 mr-2">
                                    <input 
                                      type="text" 
                                      value={editingCommName} 
                                      onChange={e => setEditingCommName(e.target.value)} 
                                      className="flex-1 border border-slate-200 rounded-lg px-2 py-0.5 text-xs text-slate-800 focus:outline-none"
                                    />
                                    <button type="button" onClick={() => handleSaveEditingComm(c.id)} className="p-1 text-emerald-600 hover:bg-white rounded"><Check size={12} /></button>
                                    <button type="button" onClick={() => setEditingCommId(null)} className="p-1 text-slate-400 hover:bg-white rounded"><X size={12} /></button>
                                  </div>
                                ) : (
                                  <>
                                    <span className="text-xs font-semibold text-slate-700">{c.name}</span>
                                    <div className="flex gap-1">
                                      <button type="button" onClick={() => handleStartEditingComm(c.id, c.name)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-white rounded" title="Edit Name"><Edit2 size={12} /></button>
                                      <button type="button" onClick={() => handleDeleteComm(c.id)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-white rounded" title="Delete Committee"><Trash2 size={12} /></button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))
                          )}
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-slate-100">
                          <input 
                            type="text" 
                            value={newCommInput} 
                            onChange={e => setNewCommInput(e.target.value)} 
                            placeholder="New committee name..."
                            className="flex-1 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                          />
                          <button type="button" onClick={handleInlineAddComm} className="px-3.5 py-1.5 bg-[#CD0000] text-white text-xs font-semibold rounded-xl hover:bg-[#A30000] flex items-center justify-center shrink-0 shadow-xs">
                            Add Committee
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>


            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 overscroll-contain">
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

      {/* ADD / MANAGE CORE COMMITTEE MODAL */}
      {showCommitteeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto overscroll-contain">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md flex flex-col max-h-[85vh] my-auto overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#CD0000]/10 text-[#CD0000] flex items-center justify-center">
                  <Users size={16} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 text-sm leading-tight">Core Committees</h2>
                  <p className="text-[11px] text-slate-400">Add or manage sub-committees in domain verticals</p>
                </div>
              </div>
              <button onClick={() => setShowCommitteeModal(false)} className="text-[#8c97a8] hover:text-[#CD0000] p-1"><X size={18} /></button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1 min-h-0 overscroll-contain">
              {/* Form to add new committee */}
              <form onSubmit={handleSaveCommittee} className="space-y-3 bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Plus size={12} className="text-[#CD0000]" /> Add New Committee
                </h3>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Target Vertical Domain *</label>
                  <select 
                    value={commModalVerticalId} 
                    onChange={e => setCommModalVerticalId(e.target.value)}
                    className={inputClass}
                  >
                    {verticals.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.category})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Committee Name *</label>
                  <input 
                    type="text"
                    required
                    value={commNameInput}
                    onChange={e => setCommNameInput(e.target.value)}
                    placeholder="e.g. Technical Operations / Media Team"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Description (Optional)</label>
                  <input 
                    type="text"
                    value={commDescInput}
                    onChange={e => setCommDescInput(e.target.value)}
                    placeholder="Brief description..."
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCommSaving || !commNameInput.trim()}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-[#CD0000] text-white text-xs font-bold rounded-xl hover:bg-[#A30000] transition-colors disabled:opacity-50"
                >
                  {isCommSaving ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={13} />}
                  Add Committee
                </button>
              </form>

              {/* List of existing committees for selected vertical */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono mb-2 flex items-center justify-between">
                  <span>Existing Committees ({verticals.find(v => v.id === commModalVerticalId)?.name || 'Selected'})</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {(verticals.find(v => v.id === commModalVerticalId)?.committees || []).length} total
                  </span>
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(verticals.find(v => v.id === commModalVerticalId)?.committees || []).length === 0 ? (
                    <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                      No committees found for this vertical. Use the form above to add one.
                    </div>
                  ) : (
                    (verticals.find(v => v.id === commModalVerticalId)?.committees || []).map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs">
                        {editingCommId === c.id ? (
                          <div className="flex gap-2 items-center flex-1 mr-2">
                            <input 
                              type="text" 
                              value={editingCommName} 
                              onChange={e => setEditingCommName(e.target.value)} 
                              className="flex-1 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none"
                            />
                            <button type="button" onClick={() => handleSaveEditingComm(c.id)} className="p-1 text-green-600 hover:bg-slate-50 rounded"><Check size={13} /></button>
                            <button type="button" onClick={() => setEditingCommId(null)} className="p-1 text-slate-400 hover:bg-slate-50 rounded"><X size={13} /></button>
                          </div>
                        ) : (
                          <>
                            <div className="min-w-0 pr-2">
                              <p className="font-semibold text-slate-800 truncate">{c.name}</p>
                              {c.description && <p className="text-[10px] text-slate-400 truncate">{c.description}</p>}
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button type="button" onClick={() => handleStartEditingComm(c.id, c.name)} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded" title="Edit Committee"><Edit2 size={12} /></button>
                              <button type="button" onClick={() => handleDeleteComm(c.id)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded" title="Delete Committee"><Trash2 size={12} /></button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end p-4 border-t border-slate-100 shrink-0 bg-slate-50/50">
              <button 
                type="button" 
                onClick={() => setShowCommitteeModal(false)} 
                className="px-4 py-2 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
