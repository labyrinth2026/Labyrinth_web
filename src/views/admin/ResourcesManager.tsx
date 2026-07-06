"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchFromSheet } from '@/services/api';
import { Plus, Trash2, BookOpen, RefreshCw, Layers, Link as LinkIcon, Download } from 'lucide-react';

export default function ResourcesManager() {
  const { user } = useAuth();
  const [resources, setResources] = useState<any[]>([]);
  const [committees, setCommittees] = useState<any[]>([]);
  const [verticals, setVerticals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selector
  const [scopeType, setScopeType] = useState<'committee' | 'vertical'>('vertical');
  const [scopeId, setScopeId] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cData, vData]: any[] = await Promise.all([
        fetchFromSheet('getCoreCommittees'),
        fetchFromSheet('getVerticals')
      ]);
      setCommittees(cData || []);
      setVerticals(vData || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch items based on scope selection
  const fetchResources = async () => {
    if (!scopeId) {
      setResources([]);
      return;
    }
    setLoading(true);
    try {
      const action = scopeType === 'committee' ? 'getCommitteeResources' : 'getVerticalResources';
      const payload = scopeType === 'committee' ? { committeeId: scopeId } : { verticalId: scopeId };
      const data: any = await fetchFromSheet(action, payload);
      setResources(data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResources();
  }, [scopeType, scopeId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url || !scopeId) return;
    setIsSaving(true);
    try {
      const action = scopeType === 'committee' ? 'addCommitteeResource' : 'addVerticalResource';
      const payload = scopeType === 'committee' 
        ? { committeeId: scopeId, title, description, url }
        : { verticalId: scopeId, title, description, url };
      await fetchFromSheet(action, payload);
      setTitle('');
      setDescription('');
      setUrl('');
      await fetchResources();
    } catch (err: any) {
      alert(err.message || 'Failed to upload resource.');
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
      const action = scopeType === 'committee' ? 'deleteCommitteeResource' : 'deleteVerticalResource';
      await fetchFromSheet(action, { id });
      await fetchResources();
    } catch (err: any) {
      alert(err.message || 'Failed to delete resource.');
    }
  };

  const inputClass = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CD0000]/10 focus:border-slate-400 text-slate-800 placeholder:text-slate-400 bg-white";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">Resources Repository</h1>
          <p className="text-slate-500 text-sm mt-0.5 font-medium font-sans">Manage books, learning materials, and toollinks.</p>
        </div>
        <button onClick={fetchResources} className="p-2.5 text-slate-500 hover:text-[#CD0000] border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Scope Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex bg-slate-100 rounded-xl p-1 shrink-0 w-full sm:w-auto">
          <button 
            type="button" 
            onClick={() => { setScopeType('vertical'); setScopeId(''); }} 
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${scopeType === 'vertical' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Vertical Domains
          </button>
          <button 
            type="button" 
            onClick={() => { setScopeType('committee'); setScopeId(''); }} 
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${scopeType === 'committee' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Core Committees
          </button>
        </div>

        <select 
          value={scopeId} 
          onChange={e => setScopeId(e.target.value)} 
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD0000] bg-white font-semibold text-slate-700"
        >
          <option value="">Select scope group...</option>
          {scopeType === 'committee'
            ? committees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
            : verticals.map(v => <option key={v.id} value={v.id}>{v.name}</option>)
          }
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-sm self-start space-y-4">
          <h3 className="text-sm font-bold text-[#CD0000] uppercase tracking-wider flex items-center gap-1.5"><LinkIcon size={16} /> Upload Asset</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Asset Title *</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className={inputClass} placeholder="Title..." />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Resource URL *</label>
              <input type="url" required value={url} onChange={e => setUrl(e.target.value)} className={inputClass} placeholder="https://..." />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Description</label>
              <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className={inputClass} placeholder="Details about this resource..." />
            </div>

            <button type="submit" disabled={isSaving || !scopeId} className="w-full py-2.5 bg-[#CD0000] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#A30000] transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50">
              {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />} Add Resource
            </button>
          </form>
        </div>

        {/* Resources list */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm lg:col-span-2">
          <div className="p-4 border-b border-[#E5E7EB] bg-slate-50/50">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Repository Files</h4>
          </div>
          
          <div className="divide-y divide-[#E5E7EB]">
            {scopeId ? (
              resources.map(res => (
                <div key={res.id} className="p-5 flex justify-between gap-4 hover:bg-slate-50/30 transition-colors">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <BookOpen size={14} className="text-[#CD0000]" />
                      {res.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{res.description || 'No description provided.'}</p>
                    <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline truncate max-w-sm block">
                      {res.url}
                    </a>
                  </div>
                  <button onClick={() => handleDelete(res.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 shrink-0 self-start transition-colors"><Trash2 size={14} /></button>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400">Select a committee or vertical scope above to view files.</div>
            )}
            {scopeId && resources.length === 0 && (
              <div className="p-12 text-center text-slate-400">No resources found in this section. Upload one on the left.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
