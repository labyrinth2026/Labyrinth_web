import React, { useState, useEffect } from 'react';
import { fetchFromSheet } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { 
  Edit2, Trash2, Plus, RefreshCw, X, Check, 
  AlertTriangle, Image as ImageIcon, Upload, Link as LinkIcon, Search, Calendar
} from 'lucide-react';

const GalleryManager: React.FC = () => {
  const { user, can } = useAuth();
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [orientationFilter, setOrientationFilter] = useState('all');

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Image Source Mode: 'upload' or 'url'
  const [imageSourceMode, setImageSourceMode] = useState<'upload' | 'url'>('upload');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const loadGallery = async () => {
    setIsLoading(true);
    try {
      const data: any = await fetchFromSheet('getGallery');
      if (Array.isArray(data)) {
        setGalleryItems(data);
      }
    } catch (error) {
      console.error('Failed to load gallery data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const openAddModal = () => {
    setEditingItem({
      title: '',
      category: 'sports',
      description: '',
      image: '',
      date: new Date().toISOString().split('T')[0],
      orientation: 'landscape'
    });
    setImageSourceMode('upload');
    setUploadPreview(null);
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem({ ...item });
    if (item.image && item.image.startsWith('data:image')) {
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
      const base64String = reader.result as string;
      setUploadPreview(base64String);
      setEditingItem((prev: any) => ({ ...prev, image: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!editingItem) return;
    if (!editingItem.title.trim()) {
      alert('Please provide an image title.');
      return;
    }
    if (!editingItem.image) {
      alert('Please upload an image or provide an image URL.');
      return;
    }

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
      console.error(e);
      alert('Failed to save gallery item.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetchFromSheet('deleteGalleryImage', { id });
      await loadGallery();
    } catch (e) {
      console.error(e);
      alert('Failed to delete gallery item.');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const filteredItems = galleryItems.filter(item => {
    const matchesSearch = 
      item.title?.toLowerCase().includes(search.toLowerCase()) || 
      item.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesOrientation = orientationFilter === 'all' || item.orientation === orientationFilter;
    return matchesSearch && matchesCategory && matchesOrientation;
  });

  const inputClass = "w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#CD0000]/15 focus:border-[#CD0000] transition-all bg-white";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">Gallery Manager</h1>
          <p className="text-slate-500 text-sm mt-0.5">Upload images, update descriptions, and manage item orientations in the photo grid.</p>
        </div>
        <button 
          onClick={openAddModal} 
          className="flex items-center gap-2 px-4 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] transition-colors"
        >
          <Plus size={15} /> Add Image
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-5 flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search images by title or description..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-sm rounded-xl text-slate-700 focus:outline-none focus:border-[#CD0000] transition-all"
          />
        </div>
        {/* Category Filter */}
        <div className="w-full md:w-48">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-sm rounded-xl text-slate-700 focus:outline-none focus:border-[#CD0000] transition-all"
          >
            <option value="all">All Categories</option>
            <option value="inauguration">Inauguration</option>
            <option value="peer_education">Peer Education</option>
            <option value="sports">Sports</option>
            <option value="workshops">Workshops</option>
            <option value="hackathons">Hackathons</option>
            <option value="cultural">Cultural</option>
          </select>
        </div>
        {/* Orientation Filter */}
        <div className="w-full md:w-48">
          <select
            value={orientationFilter}
            onChange={(e) => setOrientationFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-sm rounded-xl text-slate-700 focus:outline-none focus:border-[#CD0000] transition-all"
          >
            <option value="all">All Orientations</option>
            <option value="landscape">Landscape (Standard)</option>
            <option value="portrait">Portrait (Tall)</option>
            <option value="square">Square</option>
            <option value="wide">Wide (Short)</option>
          </select>
        </div>
        <button 
          onClick={loadGallery}
          className="p-2 text-slate-500 hover:text-[#CD0000] border border-slate-200 hover:border-[#CD0000]/30 rounded-xl transition-all"
          title="Reload gallery data"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Grid of gallery items */}
      {isLoading ? (
        <div className="p-20 flex flex-col items-center justify-center gap-2 text-slate-400">
          <RefreshCw size={24} className="animate-spin text-[#CD0000]" />
          <span className="text-sm font-semibold uppercase tracking-wider">Loading items...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map(item => {
              const orientationLabel: Record<string, string> = {
                landscape: 'Landscape',
                portrait: 'Portrait',
                square: 'Square',
                wide: 'Wide'
              };
              
              const orientationBadgeColors: Record<string, string> = {
                landscape: 'bg-blue-50 text-blue-600 border-blue-100',
                portrait: 'bg-purple-50 text-purple-600 border-purple-100',
                square: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                wide: 'bg-amber-50 text-amber-600 border-amber-100'
              };

              return (
                <div key={item.id} className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-all flex flex-col group">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-slate-900 overflow-hidden flex items-center justify-center">
                    {item.image ? (
                      item.image.endsWith('.mp4') ? (
                        <video src={item.image} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      )
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon size={28} />
                        <span className="text-[9px] font-bold uppercase mt-1">No Image</span>
                      </div>
                    )}
                    {/* Hover Overlay */}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 z-10">
                      <span className="bg-slate-900/70 backdrop-blur-xs text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-white/10">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-[#CD0000] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-400 text-[11px] font-semibold mt-1 flex items-center gap-1.5">
                      <Calendar size={11} /> {item.date ? new Date(item.date).toLocaleDateString() : '—'}
                    </p>
                    <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed flex-1">
                      {item.description || 'No description provided.'}
                    </p>
                    
                    {/* Orientation Badge & Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className={`text-[9px] font-bold uppercase border px-2 py-0.5 rounded-md ${orientationBadgeColors[item.orientation || 'landscape']}`}>
                        {orientationLabel[item.orientation || 'landscape']}
                      </span>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-400 hover:text-[#CD0000] hover:bg-[#CD0000]/5 rounded-lg transition-colors"
                          title="Edit gallery item"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete gallery item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="p-16 text-center border border-dashed border-[#E5E7EB] bg-white rounded-2xl">
              <ImageIcon size={32} className="text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-xs font-semibold">No gallery items match the current filters.</p>
            </div>
          )}
        </>
      )}

      {/* Add / Edit Modal */}
      {showModal && editingItem && (
        <div className="fixed inset-0 z-50 bg-[#CD0000]/25 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-bold text-[#CD0000] flex items-center gap-2">
                <ImageIcon size={18} />
                {editingItem.id ? 'Edit Gallery Image' : 'Add New Gallery Image'}
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-slate-400 hover:text-[#CD0000] p-1.5 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Image Title</label>
                <input 
                  type="text" 
                  value={editingItem.title} 
                  onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} 
                  className={inputClass}
                  placeholder="e.g. Inauguration Day Celebrations"
                />
              </div>

              {/* Category & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Category</label>
                  <select 
                    value={editingItem.category} 
                    onChange={e => setEditingItem({ ...editingItem, category: e.target.value })} 
                    className={inputClass}
                  >
                    <option value="inauguration">Inauguration</option>
                    <option value="peer_education">Peer Education</option>
                    <option value="sports">Sports</option>
                    <option value="workshops">Workshops</option>
                    <option value="hackathons">Hackathons</option>
                    <option value="cultural">Cultural</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Event Date</label>
                  <input 
                    type="date" 
                    value={editingItem.date ? new Date(editingItem.date).toISOString().split('T')[0] : ''} 
                    onChange={e => setEditingItem({ ...editingItem, date: e.target.value })} 
                    className={inputClass} 
                  />
                </div>
              </div>

              {/* Orientation Option */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Grid Image Orientation / Aspect Ratio
                </label>
                <select 
                  value={editingItem.orientation} 
                  onChange={e => setEditingItem({ ...editingItem, orientation: e.target.value })} 
                  className={inputClass}
                >
                  <option value="landscape">Landscape (Standard, Wide width)</option>
                  <option value="portrait">Portrait (Tall height)</option>
                  <option value="square">Square</option>
                  <option value="wide">Wide (Cinematic, Slim height)</option>
                </select>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">
                  Determines the dimension of the image in the dynamic public masonry layout grid.
                </p>
              </div>

              {/* Image Input Selection */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Image Resource Source
                </label>
                <div className="flex gap-2 p-1.5 bg-slate-50 border border-slate-100 rounded-xl mb-3">
                  <button
                    type="button"
                    onClick={() => setImageSourceMode('upload')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold uppercase rounded-lg transition-all ${
                      imageSourceMode === 'upload' 
                        ? 'bg-white text-[#CD0000] shadow-xs border border-slate-200' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Upload size={13} />
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageSourceMode('url')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold uppercase rounded-lg transition-all ${
                      imageSourceMode === 'url' 
                        ? 'bg-white text-[#CD0000] shadow-xs border border-slate-200' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <LinkIcon size={13} />
                    Image URL
                  </button>
                </div>

                {imageSourceMode === 'upload' ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-[#CD0000]/30 transition-all bg-slate-50/50 relative group/upload">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload size={22} className="text-slate-400 mx-auto mb-2 group-hover/upload:text-[#CD0000] transition-colors" />
                    <span className="text-xs font-bold text-slate-600 block">Choose local photo...</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Supports PNG, JPG, WEBP formats</span>
                  </div>
                ) : (
                  <div>
                    <input 
                      type="url" 
                      value={editingItem.image || ''} 
                      onChange={e => {
                        setEditingItem({ ...editingItem, image: e.target.value });
                        setUploadPreview(e.target.value);
                      }} 
                      className={inputClass}
                      placeholder="https://example.com/images/inauguration.jpg"
                    />
                  </div>
                )}
              </div>

              {/* Image Preview */}
              {uploadPreview && (
                <div className="mt-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Image Preview</label>
                  <div className="relative aspect-video rounded-xl border border-slate-200 overflow-hidden bg-slate-950 flex items-center justify-center">
                    <img src={uploadPreview} alt="Preview" className="w-full h-full object-contain" />
                    <button 
                      type="button"
                      onClick={() => {
                        setUploadPreview(null);
                        setEditingItem({ ...editingItem, image: '' });
                      }}
                      className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black/80 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Image Caption / Description</label>
                <textarea 
                  value={editingItem.description} 
                  onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} 
                  className={inputClass} 
                  rows={3}
                  placeholder="Summarize the action shown in the photo..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-100">
              <button 
                onClick={() => setShowModal(false)} 
                className="px-4 py-2 text-sm text-slate-500 hover:text-[#CD0000] font-semibold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={isSaving} 
                className="flex items-center gap-2 px-5 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] transition-colors disabled:opacity-50"
              >
                {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />} 
                {isSaving ? 'Saving...' : 'Save Image'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-[#CD0000]/25 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-red-50 w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h3 className="font-bold text-[#CD0000] mb-2">Remove Photo?</h3>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-6">
              Are you sure you want to remove this image from the gallery? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)} 
                className="flex-1 px-4 py-2 text-sm font-semibold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(deleteConfirmId)} 
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManager;
