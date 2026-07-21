"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchFromSheet } from '@/services/api';
import { 
  Plus, Search, Shield, Ban, Check, Edit2, Trash2, 
  Users, RefreshCw, X, AlertTriangle, UserCheck, Inbox, Download, Upload,
  ChevronLeft, ChevronRight, CheckCircle2, Loader2
} from 'lucide-react';

/**
 * Compress + upload a profile photo by sending to server-side API.
 * Returns the public CDN URL — avoids direct browser upload RLS errors.
 */
const uploadProfilePhoto = async (file: File, userId: string): Promise<string> => {
  const compressed = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 300, maxH = 300;
        let w = img.width, h = img.height;
        if (w > h) { if (w > maxW) { h = Math.round((h * maxW) / w); w = maxW; } }
        else { if (h > maxH) { w = Math.round((w * maxH) / h); h = maxH; } }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) { ctx.drawImage(img, 0, 0, w, h); resolve(canvas.toDataURL('image/jpeg', 0.82)); }
        else resolve(e.target?.result as string);
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });

  const response: any = await fetchFromSheet('uploadAvatar', {
    base64: compressed,
    userId
  });

  if (!response || !response.url) {
    throw new Error(response?.error || 'Failed to upload photo to storage.');
  }

  return response.url;
};

const uploadBase64Photo = async (base64: string, userId: string): Promise<string> => {
  const response: any = await fetchFromSheet('uploadAvatar', {
    base64,
    userId
  });
  if (!response || !response.url) {
    throw new Error(response?.error || 'Failed to upload photo to storage.');
  }
  return response.url;
};

interface ImageCropperModalProps {
  imageSrc: string;
  onClose: () => void;
  onCrop: (croppedBase64: string) => void;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ imageSrc, onClose, onCrop }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgDims, setImgDims] = useState({ width: 0, height: 0 });
  const imgRef = React.useRef<HTMLImageElement>(null);

  const onImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const imgEl = e.currentTarget;
    const w = imgEl.naturalWidth;
    const h = imgEl.naturalHeight;
    const ratio = w / h;
    
    let drawW = 200;
    let drawH = 200;
    if (ratio > 1) {
      drawW = 200 * ratio;
    } else {
      drawH = 200 / ratio;
    }
    setImgDims({ width: drawW, height: drawH });
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const rotate90 = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleSave = () => {
    const img = imgRef.current;
    if (!img) return;

    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, 300, 300);
      ctx.save();
      ctx.translate(150, 150);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);
      ctx.translate(position.x * 1.5, position.y * 1.5);

      const ratio = img.naturalWidth / img.naturalHeight;
      let drawW = 300;
      let drawH = 300;
      if (ratio > 1) {
        drawW = 300 * ratio;
      } else {
        drawH = 300 / ratio;
      }

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      const base64 = canvas.toDataURL('image/jpeg', 0.9);
      onCrop(base64);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Crop & Resize Photo</h3>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-6">
          <div 
            className="relative w-64 h-64 overflow-hidden bg-slate-900 border border-slate-700 rounded-2xl cursor-move select-none shadow-inner"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop Source"
              onLoad={onImgLoad}
              draggable={false}
              style={{
                width: imgDims.width,
                height: imgDims.height,
                position: 'absolute',
                left: '50%',
                top: '50%',
                marginLeft: -imgDims.width / 2,
                marginTop: -imgDims.height / 2,
                transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 0.15s ease-out'
              }}
            />

            <div className="absolute inset-0 pointer-events-none border-[28px] border-slate-950/70" />
            <div className="absolute top-7 left-7 w-[200px] h-[200px] pointer-events-none border border-dashed border-white/50 rounded-full shadow-[0_0_0_9999px_rgba(15,23,42,0.15)]" />
          </div>

          <div className="w-full space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Zoom</span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={e => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#CD0000]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={rotate90}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw size={12} className="text-slate-600" /> Rotate 90°
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 px-4 py-2.5 bg-[#CD0000] hover:bg-[#A30000] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                Crop & Upload
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MembersManager() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'directory' | 'recruitment'>('directory');
  const [loading, setLoading] = useState(true);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState<string | null>(null);
  
  // Lists
  const [users, setUsers] = useState<any[]>([]);

  const [registrations, setRegistrations] = useState<any[]>([]);
  const [committees, setCommittees] = useState<any[]>([]);
  const [verticals, setVerticals] = useState<any[]>([]);

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Modals / forms
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('MEMBER');
  const [newUserCommittee, setNewUserCommittee] = useState('');
  const [newUserVertical, setNewUserVertical] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState('');
  const [editingUserName, setEditingUserName] = useState('');
  const [editingUserRole, setEditingUserRole] = useState('MEMBER');
  const [editingUserCommittee, setEditingUserCommittee] = useState('');
  const [editingUserVertical, setEditingUserVertical] = useState('');
  const [editingUserDesignation, setEditingUserDesignation] = useState('');
  const [editingUserPhoto, setEditingUserPhoto] = useState('');
  const [editingUserRegNo, setEditingUserRegNo] = useState('');
  const [editingUserClass, setEditingUserClass] = useState('');
  const [editingUserGithub, setEditingUserGithub] = useState('');
  const [editingUserLinkedin, setEditingUserLinkedin] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // New Core Committee creation states
  const [showNewCommitteeModal, setShowNewCommitteeModal] = useState(false);
  const [newCommitteeName, setNewCommitteeName] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch first page of users (10), registrations, committees, verticals in parallel (renders instantly!)
      const [uDataPage1, rData, cData, vData]: any[] = await Promise.all([
        fetchFromSheet('getRoles', { page: 1, limit: 10 }),
        fetchFromSheet('getJoinRegistrations'),
        fetchFromSheet('getCoreCommittees'),
        fetchFromSheet('getVerticals')
      ]);

      setUsers(uDataPage1 || []);
      setRegistrations(rData || []);
      setCommittees(cData || []);
      setVerticals(vData || []);
      setLoading(false); // Stop loading skeleton immediately!

      // 2. Fetch the remaining pages/users in the background (lazy load)
      fetchFromSheet('getRoles').then((allUsers: any) => {
        if (Array.isArray(allUsers)) {
          setUsers(allUsers);
        }
      }).catch(err => {
        console.warn('Failed to background load all users:', err);
      });
    } catch (e) {
      console.error('Failed to load members data', e);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  // Lock background scroll when any modal is open
  useEffect(() => {
    if (showCreateModal || showEditModal || deleteConfirm || showNewCommitteeModal) {
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
  }, [showCreateModal, showEditModal, deleteConfirm, showNewCommitteeModal]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    try {
      await fetchFromSheet('createUser', {
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        committeeId: newUserCommittee || undefined,
        verticalId: newUserVertical || undefined
      });
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('MEMBER');
      setNewUserCommittee('');
      setNewUserVertical('');
      setShowCreateModal(false);
      await loadData();
      showToast('New member added successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create user.', 'error');
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchFromSheet('updateUserDetails', {
        userId: editingUserId,
        name: editingUserName,
        role: editingUserRole,
        committeeId: editingUserCommittee || undefined,
        verticalId: editingUserVertical || undefined,
        designation: editingUserDesignation || undefined,
        profilePhoto: editingUserPhoto || undefined,
        github: editingUserGithub || undefined,
        linkedin: editingUserLinkedin || undefined,
        regNo: editingUserRegNo || undefined,
        class: editingUserClass || undefined
      });
      setShowEditModal(false);
      await loadData();
      showToast('Member details updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update user.', 'error');
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await fetchFromSheet('updateUserStatus', { userId, status: nextStatus });
      await loadData();
      showToast(`Member status updated to ${nextStatus}.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update status.', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await fetchFromSheet('deleteUser', { id: userId });
      await loadData();
      showToast('Member removed from directory.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to remove user.', 'error');
    }
    setDeleteConfirm(null);
  };

  const handleApproveRegistration = async (id: string) => {
    try {
      await fetchFromSheet('approveRegistration', { id });
      await loadData();
      showToast('Registration application approved!', 'success');
    } catch (e) {
      showToast('Failed to approve registration.', 'error');
    }
  };

  const handleRejectRegistration = async (id: string) => {
    try {
      await fetchFromSheet('rejectRegistration', { id });
      await loadData();
      showToast('Registration application rejected.', 'error');
    } catch (e) {
      showToast('Failed to reject registration.', 'error');
    }
  };

  const openEditUser = (u: any) => {
    setEditingUserId(u.id);
    setEditingUserName(u.name || u.full_name || '');
    setEditingUserRole(u.role || 'MEMBER');
    setEditingUserCommittee(u.committeeId || u.committee_id || '');
    setEditingUserVertical(u.verticalId || u.vertical_id || '');
    setEditingUserDesignation(u.designation || '');
    setEditingUserPhoto(u.profilePhoto || u.profile_photo || '');
    setEditingUserRegNo(u.regNo || u.reg_no || '');
    setEditingUserClass(u.class || u.class_name || '');
    setEditingUserGithub(u.github || '');
    setEditingUserLinkedin(u.linkedin || '');
    setShowEditModal(true);
  };

  const handleAddCommitteePrompt = () => {
    setNewCommitteeName('');
    setShowNewCommitteeModal(true);
  };

  const handleCreateNewCommittee = async () => {
    if (!newCommitteeName.trim()) return;
    try {
      const activeVerticalId = showEditModal ? editingUserVertical : newUserVertical;
      await fetchFromSheet('addCoreCommittee', { 
        name: newCommitteeName, 
        description: 'Created dynamically',
        verticalId: activeVerticalId || undefined 
      });
      const updated: any = await fetchFromSheet('getCoreCommittees');
      setCommittees(updated || []);
      const newlyCreated = updated.find((c: any) => c.name.toLowerCase() === newCommitteeName.toLowerCase());
      if (newlyCreated) {
        if (showEditModal) {
          setEditingUserCommittee(newlyCreated.id);
        } else {
          setNewUserCommittee(newlyCreated.id);
        }
      }
      setShowNewCommitteeModal(false);
      setNewCommitteeName('');
      showToast('Core Committee created successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create committee.', 'error');
    }
  };

  const handleExportCSV = () => {
    if (registrations.length === 0) return;

    const headers = ["ID", "Name", "Email", "Phone", "Course", "Year", "Preferred Domain", "Submission Date"];
    const rows = registrations.map(r => [
      r.id,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.email.replace(/"/g, '""')}"`,
      `"${r.phone}"`,
      `"${r.course}"`,
      `"${r.year}"`,
      `"${r.preferredVertical}"`,
      `"${new Date(r.timestamp).toLocaleDateString()}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `labyrinth_recruits_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filters
  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    const nameStr = (u.name || u.full_name || '').toLowerCase();
    const emailStr = (u.email || '').toLowerCase();
    const roleStr = (u.role || '').toLowerCase();
    const regStr = (u.regNo || u.reg_no || '').toLowerCase();
    const classStr = (u.class || u.class_name || '').toLowerCase();
    return nameStr.includes(q) || emailStr.includes(q) || roleStr.includes(q) || regStr.includes(q) || classStr.includes(q);
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const inputClass = "w-full border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-sm text-[#1D2939] bg-white focus:outline-none focus:ring-2 focus:ring-[#CD0000]/15";

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-900 tracking-tight">{toast.type === 'success' ? 'Success' : 'Notice'}</p>
            <p className="text-xs text-slate-500 font-medium">{toast.message}</p>
          </div>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-slate-600 p-1">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-xs p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">Members Workspace</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage directory access, roles, and review new registration recruits.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={loadData} className="p-2.5 text-slate-500 hover:text-[#CD0000] border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shrink-0">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setShowCreateModal(true)} 
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-[#CD0000] hover:bg-[#A30000] text-white text-sm font-semibold rounded-xl transition-colors shadow-xs"
          >
            <Plus size={15} /> Add Member
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'directory'
              ? 'border-[#CD0000] text-[#CD0000] bg-red-50/20'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users size={14} /> Active Directory ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('recruitment')}
          className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'recruitment'
              ? 'border-[#CD0000] text-[#CD0000] bg-red-50/20'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Inbox size={14} /> Recruitment Queue ({registrations.length})
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-16 text-center text-slate-400">
          <RefreshCw size={24} className="animate-spin text-[#CD0000] mx-auto mb-2" />
          Loading workspace...
        </div>
      ) : activeTab === 'directory' ? (
        /* Active Directory */
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="max-w-xs relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={14} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search name, email, reg no, or class..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#CD0000]/10"
              />
            </div>
            {filteredUsers.length > 0 && (
              <p className="text-xs text-slate-400 font-semibold">
                Showing <strong className="text-slate-700">{startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredUsers.length)}</strong> of <strong className="text-slate-700">{filteredUsers.length}</strong> members
              </p>
            )}
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-sm text-[#667085]">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-[#8c97a8] uppercase tracking-wider">
                <tr>
                  <th className="p-4">Name & Profile</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Assignments</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {paginatedUsers.map(u => {
                  const commName = committees.find(c => c.id === u.committeeId || c.id === u.committee_id)?.name;
                  const vertName = verticals.find(v => v.id === u.verticalId || v.id === u.vertical_id)?.name;
                  const photoSrc = u.profilePhoto || u.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || u.full_name || 'U')}&background=CD0000&color=fff`;
                  const regNum = u.regNo || u.reg_no;
                  const className = u.class || u.class_name;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors text-slate-700">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={photoSrc}
                            alt={u.name || u.full_name}
                            loading="lazy"
                            decoding="async"
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                            onError={e => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || u.full_name || 'U')}&background=CD0000&color=fff`;
                            }}
                          />
                          <div>
                            <p className="text-slate-900 font-bold leading-tight">{u.name || u.full_name}</p>
                            {(regNum || className) && (
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                {regNum ? `Reg: ${regNum}` : ''}
                                {regNum && className ? ' · ' : ''}
                                {className ? `Class: ${className}` : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-500 font-semibold">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          u.role === 'ADMIN' ? 'bg-[#CD0000]/5 border-[#CD0000]/15 text-[#CD0000]' : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          u.status === 'active' ? 'bg-green-50 border-green-150 text-green-600' : 'bg-red-50 border-red-150 text-red-500'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-bold text-slate-800">
                        {commName && <div className="text-[#CD0000]">{commName} (Comm)</div>}
                        {vertName && <div className="text-purple-600">{vertName} (Domain)</div>}
                        {!commName && !vertName && <span className="text-slate-400 italic font-normal">—</span>}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button onClick={() => openEditUser(u)} className="p-1.5 text-slate-400 hover:text-[#CD0000] hover:bg-red-50 rounded-lg transition-colors" title="Edit"><Edit2 size={13} /></button>
                          <button onClick={() => handleToggleStatus(u.id, u.status)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title={u.status === 'active' ? 'Deactivate' : 'Activate'}>
                            {u.status === 'active' ? <Ban size={13} /> : <Check size={13} />}
                          </button>
                          <button onClick={() => setDeleteConfirm(u.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Remove"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr><td colSpan={6} className="p-10 text-center text-slate-400">No members found matching your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 font-semibold">
                Page <strong className="text-slate-800">{currentPage}</strong> of <strong className="text-slate-800">{totalPages}</strong>
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                >
                  <ChevronLeft size={14} /> Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  const isNeighbor = Math.abs(page - currentPage) <= 1;
                  const isEdge = page === 1 || page === totalPages;
                  if (isEdge || isNeighbor) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold border transition-all ${
                          currentPage === page
                            ? 'bg-[#CD0000] border-[#CD0000] text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    (page === 2 && currentPage > 3) ||
                    (page === totalPages - 1 && currentPage < totalPages - 2)
                  ) {
                    return <span key={page} className="text-slate-300 text-xs font-bold px-0.5">...</span>;
                  }
                  return null;
                })}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Recruitment applications */
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Candidate Queue</h3>
            <button
              onClick={handleExportCSV}
              disabled={registrations.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-[rgba(205, 0, 0, 0.03)] text-[#CD0000] text-sm font-semibold rounded-xl hover:bg-[rgba(205, 0, 0, 0.07)] transition-colors disabled:opacity-40"
            >
              <Download size={15} /> Export recruits list
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-sm text-[#667085]">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-[#8c97a8] uppercase tracking-wider">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Course / Year</th>
                  <th className="p-4">Domain Selection</th>
                  <th className="p-4">Reasoning</th>
                  <th className="p-4 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {registrations.map((reg, i) => (
                  <tr key={reg.id || i} className="hover:bg-slate-50/50 transition-colors text-slate-700">
                    <td className="p-4 font-bold text-slate-900">{reg.name}</td>
                    <td className="p-4 text-slate-500 font-semibold">{reg.email}</td>
                    <td className="p-4">{reg.phone || 'N/A'}</td>
                    <td className="p-4 text-xs font-semibold">{reg.course} · Yr {reg.year}</td>
                    <td className="p-4 text-xs font-bold text-[#CD0000]">{reg.preferredVertical}</td>
                    <td className="p-4 text-xs text-slate-500 max-w-xs truncate">{reg.reasoning || 'General candidate application.'}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleApproveRegistration(reg.id)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 text-emerald-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <UserCheck size={13} /> Approve
                        </button>
                        <button
                          onClick={() => handleRejectRegistration(reg.id)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-150 text-red-600 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Ban size={13} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {registrations.length === 0 && (
                  <tr><td colSpan={7} className="p-10 text-center text-slate-400">No new recruitment applications.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE MEMBER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#E5E7EB]">
              <h3 className="font-bold font-grotesk text-[#CD0000]">Add Directory Member</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Full Name *</label>
                <input type="text" required value={newUserName} onChange={e => setNewUserName(e.target.value)} className={inputClass} placeholder="e.g. Suryachalam V M" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Christ Email ID *</label>
                <input type="email" required value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className={inputClass} placeholder="name@cs.christuniversity.in" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8c97a8] block mb-1">System Access Role</label>
                <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className={inputClass}>
                  <option value="MEMBER">Member (Standard Access)</option>
                  <option value="ADMIN">Admin (Full Access)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Assign Vertical Domain</label>
                <select 
                  value={newUserVertical} 
                  onChange={e => {
                    setNewUserVertical(e.target.value);
                    setNewUserCommittee('');
                  }} 
                  className={inputClass}
                >
                  <option value="">None / Floating Member</option>
                  {verticals.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Assign Core Committee</label>
                <div className="flex gap-2">
                  <select 
                    value={newUserCommittee} 
                    onChange={e => setNewUserCommittee(e.target.value)} 
                    className={inputClass}
                  >
                    <option value="">None</option>
                    {committees
                      .filter(c => !newUserVertical || c.verticalId === newUserVertical || c.vertical_id === newUserVertical)
                      .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button type="button" onClick={handleAddCommitteePrompt} className="px-3 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-[#CD0000] transition-colors flex items-center justify-center shrink-0" title="Create New Core Committee">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-[#667085] hover:text-[#CD0000]">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] transition-colors">
                  Create Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MEMBER MODAL (Horizontal Multi-Column Layout) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Header with Top Save Action */}
            <div className="flex justify-between items-center px-8 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-red-50 border border-red-100 text-[#CD0000] text-[10px] font-black uppercase tracking-widest mb-0.5">
                  Directory Profile
                </span>
                <h3 className="font-extrabold text-xl text-slate-900 tracking-tight leading-none">Edit Member Details</h3>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)} 
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200/60 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleEditUser} 
                   disabled={isUploadingPhoto}
                   className={`px-5 py-2 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg ${
                     isUploadingPhoto
                       ? 'bg-slate-300 cursor-not-allowed'
                       : 'bg-[#CD0000] hover:bg-[#A30000]'
                   }`}
                >
                  {isUploadingPhoto ? 'Uploading Photo...' : 'Save Member Changes'}
                </button>
                <button 
                  onClick={() => setShowEditModal(false)} 
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all ml-1"
                  title="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content Body Form */}
            <form onSubmit={handleEditUser} className="p-8 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Left Column (Personal Info & Photo Avatar) */}
                <div className="md:col-span-5 space-y-5 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Personal & Academic</p>

                  {/* Photo Avatar Card */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                    <div className="relative w-24 h-24 mx-auto rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white mb-3 group">
                      <img
                        src={editingUserPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(editingUserName || 'U')}&background=CD0000&color=fff`}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                        onError={e => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(editingUserName || 'U')}&background=CD0000&color=fff`;
                        }}
                      />
                    </div>
                    <div className="flex gap-2 justify-center">
                      <label className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all">
                        {isUploadingPhoto
                          ? <><Loader2 size={12} className="animate-spin text-[#CD0000]" /> Uploading...</>
                          : <><Upload size={12} className="text-[#CD0000]" /> Upload Image</>}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result) {
                                setCropperImageSrc(ev.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                          className="hidden"
                        />
                      </label>
                      {editingUserPhoto && (
                        <button
                          type="button"
                          onClick={() => setEditingUserPhoto('')}
                          className="px-2.5 py-1.5 bg-white hover:bg-red-50 border border-slate-200 text-red-500 text-xs font-bold rounded-xl transition-all"
                          title="Reset photo"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={editingUserPhoto}
                      onChange={e => setEditingUserPhoto(e.target.value)}
                      className="w-full mt-3 px-3 py-1.5 text-[11px] border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#CD0000]/20"
                      placeholder="Or paste photo URL directly..."
                    />
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Full Official Name *</label>
                    <input type="text" required value={editingUserName} onChange={e => setEditingUserName(e.target.value)} className={inputClass} placeholder="Full Name" />
                  </div>

                  {/* Reg No + Class */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Register Number</label>
                      <input type="text" value={editingUserRegNo} onChange={e => setEditingUserRegNo(e.target.value)} className={inputClass} placeholder="e.g. 2540146" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Class / Section</label>
                      <input type="text" value={editingUserClass} onChange={e => setEditingUserClass(e.target.value)} className={inputClass} placeholder="e.g. 3BScCM" />
                    </div>
                  </div>
                </div>

                {/* Right Column (Access, Domain Assignments & Socials) */}
                <div className="md:col-span-7 space-y-5">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Assignments & Role</p>

                  {/* Designation / Title */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Designation / Title</label>
                    <select
                      value={editingUserDesignation}
                      onChange={e => setEditingUserDesignation(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">None / Regular Member</option>
                      <option value="Core Committee Member">Core Committee Member</option>
                      <option value="Vertical Head">Vertical Head</option>
                      <option value="Vertical Sub-Head">Vertical Sub-Head</option>
                      <option value="Mentor">Mentor</option>
                      <option value="Faculty Coordinator">Faculty Coordinator</option>
                    </select>
                  </div>

                  {/* System Access Role */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">System Access Permission</label>
                    <select value={editingUserRole} onChange={e => setEditingUserRole(e.target.value)} className={inputClass}>
                      <option value="MEMBER">Member (Standard Access)</option>
                      <option value="ADMIN">Admin (Full Dashboard Management)</option>
                    </select>
                  </div>

                  {/* Vertical Domain & Core Committee */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Vertical Domain</label>
                      <select 
                        value={editingUserVertical} 
                        onChange={e => {
                          setEditingUserVertical(e.target.value);
                          setEditingUserCommittee('');
                        }} 
                        className={inputClass}
                      >
                        <option value="">None / Floating Member</option>
                        {verticals.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Core Committee</label>
                      <div className="flex gap-2">
                        <select 
                          value={editingUserCommittee} 
                          onChange={e => setEditingUserCommittee(e.target.value)} 
                          className={inputClass}
                        >
                          <option value="">None</option>
                          {committees
                            .filter(c => !editingUserVertical || c.verticalId === editingUserVertical || c.vertical_id === editingUserVertical)
                            .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button type="button" onClick={handleAddCommitteePrompt} className="px-3 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-[#CD0000] transition-colors flex items-center justify-center shrink-0" title="Create New Core Committee">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Social Profiles */}
                  <div className="pt-2">
                    <p className="text-xs font-bold text-slate-700 mb-2">Social & External Profiles</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <input 
                          type="url" 
                          value={editingUserGithub}
                          onChange={e => setEditingUserGithub(e.target.value)}
                          className={inputClass} 
                          placeholder="GitHub: https://github.com/username" 
                        />
                      </div>
                      <div>
                        <input 
                          type="url" 
                          value={editingUserLinkedin}
                          onChange={e => setEditingUserLinkedin(e.target.value)}
                          className={inputClass} 
                          placeholder="LinkedIn: https://linkedin.com/in/username" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>


            </form>
          </div>
        </div>
      )}

      {/* DELETE USER CONFIRM MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4 text-red-500">
              <AlertTriangle size={28} />
            </div>
            <h3 className="font-bold text-[#CD0000] mb-2">Delete Member Profile?</h3>
            <p className="text-slate-500 text-sm mb-6">This action will clear their profile details and revoke all role assignments. It cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 text-sm font-semibold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={() => handleDeleteUser(deleteConfirm)} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* NEW CORE COMMITTEE MODAL */}
      {showNewCommitteeModal && (
        <div className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 text-left">
            <h3 className="font-bold text-[#CD0000] mb-2 text-sm uppercase tracking-wider">New Core Committee</h3>
            <p className="text-slate-500 text-xs mb-4">Enter a name for the new core committee. This will be added to the database and automatically selected.</p>
            <input
              type="text"
              required
              value={newCommitteeName}
              onChange={e => setNewCommitteeName(e.target.value)}
              className={inputClass}
              placeholder="e.g. Publicity, Editorial, Tech Support…"
            />
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() => { setShowNewCommitteeModal(false); setNewCommitteeName(''); }}
                className="flex-1 px-4 py-2 text-xs font-semibold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateNewCommittee}
                disabled={!newCommitteeName.trim()}
                className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-[#CD0000] hover:bg-[#A30000] rounded-xl transition-colors disabled:opacity-40"
              >
                Create Committee
              </button>
            </div>
          </div>
        </div>
      )}
      {cropperImageSrc && (
        <ImageCropperModal
          imageSrc={cropperImageSrc}
          onClose={() => setCropperImageSrc(null)}
          onCrop={async (croppedBase64) => {
            setCropperImageSrc(null);
            setIsUploadingPhoto(true);
            try {
              const url = await uploadBase64Photo(croppedBase64, editingUserId || 'member');
              setEditingUserPhoto(url);
              showToast('Photo cropped and uploaded!', 'success');
            } catch (err: any) {
              showToast('Upload failed: ' + (err.message || 'Unknown error'), 'error');
            } finally {
              setIsUploadingPhoto(false);
            }
          }}
        />
      )}
    </div>
  );
}
