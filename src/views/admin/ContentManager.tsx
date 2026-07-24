import React, { useState, useEffect, useRef } from 'react';
import { fetchFromSheet } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import {
  Edit2, Trash2, Plus, RefreshCw, Calendar, BookOpen, X, Check, AlertTriangle,
  User, ChevronDown, Crown, Star, Search, Users
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

// ── Reusable People Picker ──────────────────────────────────────────────────
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
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
        {icon} {label}
      </label>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selected.map(p => (
            <span
              key={p.id}
              className={`inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-lg text-xs font-semibold border ${accentClass}`}
            >
              <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-[10px] font-bold">
                {p.name.charAt(0)}
              </span>
              <span>{p.name}</span>
              <button
                type="button"
                onClick={() => onRemove(p.id)}
                className="ml-0.5 p-0.5 rounded hover:bg-black/10 transition-colors"
                title={`Remove ${p.name}`}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
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
          {query && (
            <button type="button" onClick={() => { setQuery(''); inputRef.current?.focus(); }} className="text-slate-300 hover:text-slate-500">
              <X size={12} />
            </button>
          )}
        </div>

        {open && (
          <div className="absolute top-full left-0 right-0 z-40 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-400 text-center">
                {query ? 'No matching users found.' : 'All eligible users already added.'}
              </div>
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
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left transition-colors border-b border-slate-50 last:border-0"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0">
                    {(u.full_name || u.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{u.full_name || u.name}</p>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  </div>
                  {u.designation && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0 whitespace-nowrap">
                      {u.designation}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Component ──────────────────────────────────────────────────────────
const ContentManager: React.FC = () => {
  const { user, can } = useAuth();
  const [activeTab, setActiveTab] = useState<'events' | 'verticals'>('verticals');
  const [data, setData] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Multi-person leadership state
  const [selectedHeads, setSelectedHeads] = useState<PersonChip[]>([]);
  const [selectedSubHeads, setSelectedSubHeads] = useState<PersonChip[]>([]);
  // Track who was there originally so we can diff on save
  const [originalHeadIds, setOriginalHeadIds] = useState<Set<string>>(new Set());
  const [originalSubHeadIds, setOriginalSubHeadIds] = useState<Set<string>>(new Set());

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [result, usersResult]: any[] = await Promise.all([
        fetchFromSheet(activeTab === 'events' ? 'getEvents' : 'getVerticals'),
        activeTab === 'verticals' ? fetchFromSheet('getRoles') : Promise.resolve([])
      ]);
      setData(Array.isArray(result) ? result : []);
      setAllUsers(Array.isArray(usersResult) ? usersResult : []);
    } catch (error) {
      console.error('Failed to load data', error);
    }
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, [activeTab]);

  const tabs = [
    { id: 'verticals', label: 'Verticals', icon: BookOpen, show: can('manage_verticals') },
    { id: 'events', label: 'Events', icon: Calendar, show: can('manage_events') },
  ].filter(t => t.show);

  const openAddModal = () => {
    if (activeTab === 'events') {
      setEditingItem({ title: '', date: '', status: 'upcoming', description: '', banner: '', type: 'tech' });
    } else {
      setEditingItem({ name: '', description: '', category: 'tech', icon: 'Brain', color: '#3b82f6', image: '' });
      setSelectedHeads([]);
      setSelectedSubHeads([]);
      setOriginalHeadIds(new Set());
      setOriginalSubHeadIds(new Set());
    }
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem({ ...item, image: item.image || '', icon: item.icon || 'Brain', color: item.color || '#3b82f6' });
    const heads: PersonChip[] = (item.heads || []);
    const subHeads: PersonChip[] = (item.subHeads || []);
    setSelectedHeads(heads);
    setSelectedSubHeads(subHeads);
    setOriginalHeadIds(new Set(heads.map((h: PersonChip) => h.id)));
    setOriginalSubHeadIds(new Set(subHeads.map((s: PersonChip) => s.id)));
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingItem) return;
    setIsSaving(true);
    try {
      if (activeTab === 'verticals') {
        // 1. Save vertical data
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
          await fetchFromSheet('updateVertical', { userEmail: user?.email, id: vertId, data: verticalData });
        } else {
          await fetchFromSheet('addVertical', { userEmail: user?.email, data: verticalData });
          // Fetch fresh to get new ID
          const fresh: any = await fetchFromSheet('getVerticals');
          const newVert = (fresh || []).find((v: any) => v.name === editingItem.name);
          vertId = newVert?.id;
        }

        if (vertId) {
          // 2. Remove people who were removed from heads
          const newHeadIds = new Set(selectedHeads.map(h => h.id));
          for (const oldId of originalHeadIds) {
            if (!newHeadIds.has(oldId)) {
              await fetchFromSheet('removePersonFromVertical', { userId: oldId });
            }
          }

          // 3. Remove people who were removed from subheads
          const newSubHeadIds = new Set(selectedSubHeads.map(s => s.id));
          for (const oldId of originalSubHeadIds) {
            if (!newSubHeadIds.has(oldId)) {
              await fetchFromSheet('removePersonFromVertical', { userId: oldId });
            }
          }

          // 4. Assign newly added heads
          for (const head of selectedHeads) {
            if (!originalHeadIds.has(head.id)) {
              await fetchFromSheet('assignVerticalRole', {
                userId: head.id, verticalId: vertId, designation: 'Vertical Head'
              });
            }
          }

          // 5. Assign newly added sub-heads
          for (const sub of selectedSubHeads) {
            if (!originalSubHeadIds.has(sub.id)) {
              await fetchFromSheet('assignVerticalRole', {
                userId: sub.id, verticalId: vertId, designation: 'Vertical Sub-Head'
              });
            }
          }
        }
      } else {
        const action = editingItem.id ? 'updateEvent' : 'addEvent';
        await fetchFromSheet(action, { userEmail: user?.email, id: editingItem.id, data: editingItem });
      }

      setShowModal(false);
      await loadData();
    } catch (e) {
      console.error(e);
      alert('Failed to save: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const action = activeTab === 'events' ? 'deleteEvent' : 'deleteVertical';
      await fetchFromSheet(action, { userEmail: user?.email, id });
      await loadData();
    } catch (e) {
      alert('Failed to delete.');
    }
    setDeleteConfirm(null);
  };

  const inputClass = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#CD0000]/10 focus:border-slate-400 transition-all bg-white";
  const labelClass = "text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5";

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#CD0000]">Content Manager</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage verticals, leadership, and events.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] transition-colors shadow-sm"
        >
          <Plus size={15} /> Add {activeTab === 'events' ? 'Event' : 'Vertical'}
        </button>
      </div>

      {/* ── Tabs + Content ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-visible">
        <div className="flex border-b border-slate-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#CD0000] text-[#CD0000] bg-red-50/20'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
          <button onClick={loadData} className="ml-auto px-5 text-slate-400 hover:text-[#CD0000] transition-colors">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {isLoading ? (
          <div className="p-16 flex flex-col items-center gap-3 text-slate-400">
            <RefreshCw size={22} className="animate-spin text-[#CD0000]" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : activeTab === 'verticals' ? (
          /* ── Verticals Grid ── */
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {data.map((item: any) => (
              <div key={item.id} className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group">
                {/* Colour bar */}
                <div className="h-1.5" style={{ backgroundColor: item.color || '#CD0000' }} />
                <div className="p-4">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-extrabold shrink-0 shadow-sm"
                        style={{ backgroundColor: item.color || '#CD0000' }}
                      >
                        {(item.name || 'V').charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm leading-tight">{item.name}</h3>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                          item.category === 'tech' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>{item.category}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => openEditModal(item)} className="p-1.5 text-slate-400 hover:text-[#CD0000] hover:bg-red-50 rounded-lg transition-colors" title="Edit"><Edit2 size={13} /></button>
                      <button onClick={() => setDeleteConfirm(item.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={13} /></button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{item.description}</p>

                  {/* Leadership */}
                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    {/* Heads */}
                    <div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">
                        <Crown size={10} /> Heads
                      </div>
                      {(item.heads || []).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {(item.heads || []).map((h: PersonChip) => (
                            <span key={h.id} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-lg">
                              {h.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No heads assigned</span>
                      )}
                    </div>
                    {/* Sub-Heads */}
                    <div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1">
                        <Star size={10} /> Sub-Heads
                      </div>
                      {(item.subHeads || []).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {(item.subHeads || []).map((s: PersonChip) => (
                            <span key={s.id} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded-lg">
                              {s.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No sub-heads assigned</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {data.length === 0 && (
              <div className="col-span-3 p-12 text-center text-slate-400 text-sm">
                No verticals yet. Click "Add Vertical" to create one.
              </div>
            )}
          </div>
        ) : (
          /* ── Events Table ── */
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Title</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 text-sm">
                    <td className="p-4 font-semibold text-slate-800">{item.title}</td>
                    <td className="p-4 text-slate-500">{item.date ? new Date(item.date).toLocaleDateString('en-GB') : '—'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${
                        item.status === 'upcoming' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>{item.status || 'upcoming'}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => openEditModal(item)} className="p-1.5 text-slate-400 hover:text-[#CD0000] hover:bg-red-50 rounded-lg transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => setDeleteConfirm(item.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length === 0 && <div className="p-12 text-center text-slate-400 text-sm">No events found.</div>}
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {showModal && editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl flex flex-col" style={{ maxHeight: '94vh' }}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div>
                <p className="text-[10px] font-bold text-[#CD0000] uppercase tracking-widest">
                  {activeTab === 'events' ? 'Event' : 'Vertical'}
                </p>
                <h2 className="font-bold text-slate-800 text-lg leading-tight">
                  {editingItem.id ? `Edit — ${editingItem.name || editingItem.title}` : `New ${activeTab === 'events' ? 'Event' : 'Vertical'}`}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 min-h-0 px-6 py-5 space-y-5">
              {activeTab === 'events' ? (
                <>
                  <div><label className={labelClass}>Title *</label><input type="text" value={editingItem.title || ''} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} className={inputClass} placeholder="Event title…" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelClass}>Date</label><input type="date" value={editingItem.date ? new Date(editingItem.date).toISOString().split('T')[0] : ''} onChange={e => setEditingItem({ ...editingItem, date: new Date(e.target.value).toISOString() })} className={inputClass} /></div>
                    <div><label className={labelClass}>Status</label>
                      <select value={editingItem.status || 'upcoming'} onChange={e => setEditingItem({ ...editingItem, status: e.target.value })} className={inputClass}>
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  <div><label className={labelClass}>Banner URL</label><input type="url" value={editingItem.banner || ''} onChange={e => setEditingItem({ ...editingItem, banner: e.target.value })} className={inputClass} placeholder="https://…" /></div>
                  <div><label className={labelClass}>Description</label><textarea rows={3} value={editingItem.description || ''} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} className={inputClass} placeholder="Brief description…" /></div>
                </>
              ) : (
                <>
                  {/* Basic info */}
                  <div>
                    <label className={labelClass}>Vertical Name *</label>
                    <input type="text" value={editingItem.name || ''} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} className={inputClass} placeholder="e.g. AI Creator's Lab" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Category</label>
                      <select value={editingItem.category || 'tech'} onChange={e => setEditingItem({ ...editingItem, category: e.target.value })} className={inputClass}>
                        <option value="tech">Technical</option>
                        <option value="non-tech">Non-Technical</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Icon</label>
                      <select value={editingItem.icon || 'Brain'} onChange={e => setEditingItem({ ...editingItem, icon: e.target.value })} className={inputClass}>
                        {ICON_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Color picker */}
                  <div>
                    <label className={labelClass}>Accent Colour</label>
                    <div className="flex flex-wrap gap-2 items-center">
                      {COLOR_PRESETS.map(c => (
                        <button
                          key={c} type="button"
                          onClick={() => setEditingItem({ ...editingItem, color: c })}
                          className={`w-6 h-6 rounded-lg border-2 transition-all ${editingItem.color === c ? 'border-slate-800 scale-110 shadow' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                      <div className="flex items-center gap-1.5 ml-1">
                        <input type="color" value={editingItem.color || '#3b82f6'} onChange={e => setEditingItem({ ...editingItem, color: e.target.value })} className="w-7 h-7 rounded-lg border border-slate-200 cursor-pointer p-0.5" />
                        <span className="text-xs font-mono text-slate-400">{editingItem.color}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea rows={3} value={editingItem.description || ''} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} className={inputClass} placeholder="Brief description…" />
                  </div>

                  <div>
                    <label className={labelClass}>Banner / Cover Image URL</label>
                    <input type="url" value={editingItem.image || ''} onChange={e => setEditingItem({ ...editingItem, image: e.target.value })} className={inputClass} placeholder="https://images.unsplash.com/…" />
                  </div>

                  {/* ── Leadership section ── */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-4">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                      <Users size={14} className="text-slate-500" />
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Leadership Assignment</h4>
                    </div>

                    <PeoplePicker
                      label="Vertical Heads"
                      icon={<Crown size={11} className="text-amber-500" />}
                      accentClass="bg-amber-50 text-amber-700 border border-amber-200"
                      selected={selectedHeads}
                      allUsers={allUsers}
                      onAdd={p => setSelectedHeads(prev => [...prev, p])}
                      onRemove={id => setSelectedHeads(prev => prev.filter(h => h.id !== id))}
                    />

                    <PeoplePicker
                      label="Vertical Sub-Heads"
                      icon={<Star size={11} className="text-indigo-500" />}
                      accentClass="bg-indigo-50 text-indigo-600 border border-indigo-200"
                      selected={selectedSubHeads}
                      allUsers={allUsers}
                      onAdd={p => setSelectedSubHeads(prev => [...prev, p])}
                      onRemove={id => setSelectedSubHeads(prev => prev.filter(s => s.id !== id))}
                    />
                  </div>

                  {/* Live preview */}
                  {editingItem.name && (
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Preview</p>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow" style={{ backgroundColor: editingItem.color || '#3b82f6' }}>
                          {editingItem.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{editingItem.name}</p>
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md ${editingItem.category === 'tech' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{editingItem.category}</span>
                        </div>
                        <div className="ml-auto h-1 flex-1 max-w-20 rounded-full" style={{ backgroundColor: editingItem.color || '#3b82f6' }} />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0 rounded-b-2xl">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-[#CD0000] transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] disabled:opacity-50 transition-colors shadow-sm">
                {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                {isSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle size={26} className="text-red-500" />
            </div>
            <h3 className="font-bold text-slate-800 mb-1">Delete {activeTab === 'events' ? 'Event' : 'Vertical'}?</h3>
            <p className="text-slate-500 text-sm mb-6">This cannot be undone. All leadership assignments will be cleared.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManager;
