import React, { useState, useEffect, useRef } from 'react';
import { fetchFromSheet } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import {
  Edit2, Trash2, Plus, RefreshCw, X, Check,
  AlertTriangle, Image as ImageIcon, Upload, Link as LinkIcon,
  Search, RotateCw, RotateCcw
} from 'lucide-react';

const GalleryManager: React.FC = () => {
  const { user, can } = useAuth();
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [orientationFilter, setOrientationFilter] = useState('all');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Image source
  const [imageSourceMode, setImageSourceMode] = useState<'upload' | 'url'>('upload');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  // ── Load ────────────────────────────────────────────────────────────────────
  const loadGallery = async () => {
    setIsLoading(true);
    try {
      const data: any = await fetchFromSheet('getGallery');
      if (Array.isArray(data)) setGalleryItems(data);
    } catch (error) {
      console.error('Failed to load gallery:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadGallery(); }, []);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (showModal || deleteConfirmId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showModal, deleteConfirmId]);

  const getSwappedOrientation = (orientation: string) => {
    if (orientation === 'landscape') return 'portrait';
    if (orientation === 'portrait') return 'landscape';
    if (orientation === 'wide') return 'portrait';
    return orientation;
  };

  // ── Quick rotate (save immediately) ─────────────────────────────────────────
  const handleQuickRotate = async (item: any, dir: 'cw' | 'ccw') => {
    const current = item.rotation ?? 0;
    const next = dir === 'cw'
      ? (current + 90) % 360
      : (current - 90 + 360) % 360;
    const updatedOrientation = getSwappedOrientation(item.orientation || 'landscape');
    const updated = { ...item, rotation: next, orientation: updatedOrientation };
    // Optimistic update
    setGalleryItems(prev => prev.map(g => g.id === item.id ? updated : g));
    try {
      await fetchFromSheet('updateGalleryImage', { id: item.id, data: updated });
    } catch {
      // Revert on failure
      setGalleryItems(prev => prev.map(g => g.id === item.id ? item : g));
    }
  };

  // ── Modal ────────────────────────────────────────────────────────────────────
  const openAddModal = () => {
    setEditingItem({ title: '', category: 'sports', description: '', image: '', date: new Date().toISOString().split('T')[0], orientation: 'landscape', rotation: 0 });
    setImageSourceMode('upload');
    setUploadPreview(null);
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem({ ...item, rotation: item.rotation ?? 0 });
    if (item.image?.startsWith('data:image')) {
      setImageSourceMode('upload');
      setUploadPreview(item.image);
    } else {
      setImageSourceMode('url');
      setUploadPreview(item.image);
    }
    setShowModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      setUploadPreview(b64);
      setEditingItem((prev: any) => ({ ...prev, image: b64 }));
    };
    reader.readAsDataURL(file);
  };

  const rotateEditing = (dir: 'cw' | 'ccw') => {
    setEditingItem((prev: any) => {
      const current = prev.rotation ?? 0;
      const next = dir === 'cw' ? (current + 90) % 360 : (current - 90 + 360) % 360;
      const updatedOrientation = getSwappedOrientation(prev.orientation || 'landscape');
      return { ...prev, rotation: next, orientation: updatedOrientation };
    });
  };

  const handleSave = async () => {
    if (!editingItem) return;
    if (!editingItem.title?.trim()) { alert('Please provide an image title.'); return; }
    if (!editingItem.image) { alert('Please upload an image or provide an image URL.'); return; }
    setIsSaving(true);
    try {
      if (editingItem.id) {
        await fetchFromSheet('updateGalleryImage', { id: editingItem.id, data: editingItem });
      } else {
        await fetchFromSheet('addGalleryImage', { data: editingItem });
      }
      setShowModal(false);
      await loadGallery();
    } catch (e) {
      alert('Failed to save gallery item.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetchFromSheet('deleteGalleryImage', { id });
      await loadGallery();
    } catch {
      alert('Failed to delete gallery item.');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // ── Filter ───────────────────────────────────────────────────────────────────
  const filteredItems = galleryItems.filter(item => {
    const matchSearch = item.title?.toLowerCase().includes(search.toLowerCase()) || item.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
    const matchOri = orientationFilter === 'all' || item.orientation === orientationFilter;
    return !!item.image && matchSearch && matchCat && matchOri;
  });

  const inputClass = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#CD0000]/10 focus:border-slate-400 transition-all bg-white";
  const labelClass = "text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5";

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#CD0000]">Gallery Manager</h1>
          <p className="text-slate-500 text-sm mt-0.5">Upload, rotate and manage photos in the public gallery grid.</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] transition-colors shadow-sm">
          <Plus size={15} /> Add Image
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search images…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-sm rounded-xl text-slate-700 focus:outline-none focus:border-slate-400 transition-all" />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="w-full md:w-44 px-3 py-2 bg-slate-50 border border-slate-200 text-sm rounded-xl text-slate-700 focus:outline-none focus:border-slate-400 transition-all">
          <option value="all">All Categories</option>
          <option value="inauguration">Inauguration</option>
          <option value="peer_education">Peer Education</option>
          <option value="sports">Sports</option>
          <option value="workshops">Workshops</option>
          <option value="hackathons">Hackathons</option>
          <option value="cultural">Cultural</option>
        </select>
        <select value={orientationFilter} onChange={e => setOrientationFilter(e.target.value)}
          className="w-full md:w-44 px-3 py-2 bg-slate-50 border border-slate-200 text-sm rounded-xl text-slate-700 focus:outline-none focus:border-slate-400 transition-all">
          <option value="all">All Orientations</option>
          <option value="landscape">Landscape</option>
          <option value="portrait">Portrait</option>
          <option value="square">Square</option>
          <option value="wide">Wide</option>
        </select>
        <button onClick={loadGallery} className="p-2 text-slate-400 hover:text-[#CD0000] border border-slate-200 rounded-xl transition-all" title="Reload">
          <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ── Grid ── */}
      {isLoading ? (
        <div className="p-20 flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw size={24} className="animate-spin text-[#CD0000]" />
          <span className="text-sm font-semibold uppercase tracking-wider">Loading…</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredItems.map(item => {
              const rot = item.rotation ?? 0;
              const needsSwap = rot === 90 || rot === 270;
              return (
                <div key={item.id} className="relative group rounded-xl overflow-hidden bg-slate-900 aspect-square shadow-sm hover:shadow-lg transition-all">
                  {item.image ? (
                    item.image.endsWith('.mp4') ? (
                      <div className="w-full h-full bg-slate-900 overflow-hidden relative">
                        <video
                          src={item.image}
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover transition-transform duration-300"
                          style={{
                            transform: `rotate(${rot}deg)${needsSwap ? ' scale(1.5)' : ''}`
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-slate-950/60 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm tracking-wider z-10">Video</div>
                      </div>
                    ) : (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300"
                        style={{
                          transform: `rotate(${rot}deg)${needsSwap ? ' scale(1.5)' : ''}`
                        }}
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                      <ImageIcon size={28} />
                      <span className="text-[9px] font-bold uppercase mt-1">No Image</span>
                    </div>
                  )}

                  {/* Category badge — always visible */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-slate-900/70 backdrop-blur-sm text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-white/10">
                      {item.category}
                    </span>
                  </div>

                  {/* Hover overlay with actions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col justify-end p-2.5">
                    {/* Title on hover */}
                    <p className="text-white text-[11px] font-bold leading-tight line-clamp-1 mb-2">{item.title}</p>
                    {/* Action row */}
                    <div className="flex items-center gap-1">
                      {/* Rotate CCW */}
                      <button
                        onClick={() => handleQuickRotate(item, 'ccw')}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white/15 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white text-[10px] font-bold transition-all"
                        title="Rotate left"
                      >
                        <RotateCcw size={12} />
                      </button>
                      {/* Rotate CW */}
                      <button
                        onClick={() => handleQuickRotate(item, 'cw')}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white/15 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white text-[10px] font-bold transition-all"
                        title="Rotate right"
                      >
                        <RotateCw size={12} />
                      </button>
                      {/* Edit */}
                      <button
                        onClick={() => openEditModal(item)}
                        className="flex-1 flex items-center justify-center py-1.5 bg-white/15 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white transition-all"
                        title="Edit"
                      >
                        <Edit2 size={12} />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="flex-1 flex items-center justify-center py-1.5 bg-red-500/60 hover:bg-red-500/80 backdrop-blur-sm rounded-lg text-white transition-all"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="p-16 text-center border border-dashed border-slate-200 bg-white rounded-2xl">
              <ImageIcon size={32} className="text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No images match the current filters.</p>
            </div>
          )}
        </>
      )}

      {/* ── Add / Edit Modal ── */}
      {showModal && editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg flex flex-col" style={{ maxHeight: '92vh' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div>
                <p className="text-[10px] font-bold text-[#CD0000] uppercase tracking-widest">Gallery</p>
                <h2 className="font-bold text-slate-800 text-lg">{editingItem.id ? 'Edit Image' : 'Add New Image'}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 min-h-0 px-6 py-5 space-y-4">
              {/* Title */}
              <div>
                <label className={labelClass}>Image Title *</label>
                <input type="text" value={editingItem.title} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} className={inputClass} placeholder="e.g. Inauguration Day Celebrations" />
              </div>

              {/* Category + Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Category</label>
                  <select value={editingItem.category} onChange={e => setEditingItem({ ...editingItem, category: e.target.value })} className={inputClass}>
                    <option value="inauguration">Inauguration</option>
                    <option value="peer_education">Peer Education</option>
                    <option value="sports">Sports</option>
                    <option value="workshops">Workshops</option>
                    <option value="hackathons">Hackathons</option>
                    <option value="cultural">Cultural</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Event Date</label>
                  <input type="date" value={editingItem.date ? new Date(editingItem.date).toISOString().split('T')[0] : ''} onChange={e => setEditingItem({ ...editingItem, date: e.target.value })} className={inputClass} />
                </div>
              </div>

              {/* Orientation */}
              <div>
                <label className={labelClass}>Grid Orientation</label>
                <select value={editingItem.orientation} onChange={e => setEditingItem({ ...editingItem, orientation: e.target.value })} className={inputClass}>
                  <option value="landscape">Landscape (Standard)</option>
                  <option value="portrait">Portrait (Tall)</option>
                  <option value="square">Square</option>
                  <option value="wide">Wide (Cinematic)</option>
                </select>
              </div>

              {/* Image source */}
              <div>
                <label className={labelClass}>Image Source</label>
                <div className="flex gap-2 p-1.5 bg-slate-50 border border-slate-100 rounded-xl mb-3">
                  <button type="button" onClick={() => setImageSourceMode('upload')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all ${imageSourceMode === 'upload' ? 'bg-white text-[#CD0000] shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Upload size={12} /> Upload File
                  </button>
                  <button type="button" onClick={() => setImageSourceMode('url')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all ${imageSourceMode === 'url' ? 'bg-white text-[#CD0000] shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
                    <LinkIcon size={12} /> Image URL
                  </button>
                </div>

                {imageSourceMode === 'upload' ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-[#CD0000]/40 transition-all bg-slate-50/50 relative group/upload cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                    <Upload size={22} className="text-slate-400 mx-auto mb-2 group-hover/upload:text-[#CD0000] transition-colors" />
                    <span className="text-xs font-bold text-slate-600 block">Choose local photo…</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">PNG, JPG, WEBP</span>
                  </div>
                ) : (
                  <input type="url" value={editingItem.image || ''} onChange={e => { setEditingItem({ ...editingItem, image: e.target.value }); setUploadPreview(e.target.value); }} className={inputClass} placeholder="https://example.com/photo.jpg" />
                )}
              </div>

              {/* Preview + Rotate */}
              {uploadPreview && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={labelClass + ' mb-0'}>Preview</label>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-mono mr-1">{editingItem.rotation ?? 0}°</span>
                      <button type="button" onClick={() => rotateEditing('ccw')}
                        className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold rounded-lg transition-colors">
                        <RotateCcw size={12} /> CCW
                      </button>
                      <button type="button" onClick={() => rotateEditing('cw')}
                        className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold rounded-lg transition-colors">
                        <RotateCw size={12} /> CW
                      </button>
                    </div>
                  </div>
                  <div className="relative rounded-xl border border-slate-200 bg-slate-950 overflow-hidden flex items-center justify-center" style={{ height: '200px' }}>
                    {uploadPreview.endsWith('.mp4') ? (
                      <video
                        src={uploadPreview}
                        controls
                        className="max-w-full max-h-full object-contain transition-transform duration-300"
                        style={{ transform: `rotate(${editingItem.rotation ?? 0}deg)` }}
                      />
                    ) : (
                      <img
                        src={uploadPreview}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain transition-transform duration-300"
                        style={{ transform: `rotate(${editingItem.rotation ?? 0}deg)` }}
                      />
                    )}
                    <button type="button" onClick={() => { setUploadPreview(null); setEditingItem({ ...editingItem, image: '' }); }}
                      className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black/80 transition-all z-10">
                      <X size={13} />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Rotation is saved with the image and applied in the public gallery.</p>
                </div>
              )}

              {/* Caption */}
              <div>
                <label className={labelClass}>Caption / Description</label>
                <textarea value={editingItem.description} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} className={inputClass} rows={2} placeholder="Describe what's shown in the photo…" />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0 rounded-b-2xl">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-[#CD0000] transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] disabled:opacity-50 transition-colors shadow-sm">
                {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                {isSaving ? 'Saving…' : 'Save Image'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-red-50 w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle size={26} className="text-red-500" />
            </div>
            <h3 className="font-bold text-slate-800 mb-1">Remove Photo?</h3>
            <p className="text-slate-500 text-sm mb-6">This will permanently remove the image from the gallery.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManager;
