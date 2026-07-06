"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchFromSheet } from '@/services/api';
import { Settings, Shield, RefreshCw, Check, Info } from 'lucide-react';

export default function SettingsManager() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [formConfig, setFormConfig] = useState<any>({ memberRegistrationOpen: true, verticalRegistrationOpen: true });
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data: any = await fetchFromSheet('getForms');
      if (data && typeof data === 'object') {
        setFormConfig(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = (key: string) => {
    setFormConfig((prev: any) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await fetchFromSheet('updateForms', { forms: formConfig });
      alert('Settings updated successfully.');
    } catch (err: any) {
      alert('Failed to save settings.');
    }
    setIsSaving(false);
  };

  const inputClass = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-slate-50 text-slate-700";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">System Settings</h1>
          <p className="text-slate-500 text-sm mt-0.5 font-medium">Configure global portals, recruitment status, and profile information.</p>
        </div>
        <button onClick={loadData} className="p-2.5 text-slate-500 hover:text-[#CD0000] border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-16 text-center text-slate-400">
          <RefreshCw size={24} className="animate-spin text-[#CD0000] mx-auto mb-2" />
          Fetching configurations...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Settings */}
          <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-sm space-y-4 lg:col-span-2">
            <h3 className="text-sm font-bold text-[#CD0000] uppercase tracking-wider flex items-center gap-1.5"><Settings size={16} /> Recruitment Portal Configurations</h3>
            
            <div className="space-y-4 divide-y divide-slate-100">
              <div className="flex items-center justify-between pt-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Recruit Membership applications</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Control whether the public "Join Community" forms are accepting applications.</p>
                </div>
                <button
                  onClick={() => handleToggle('memberRegistrationOpen')}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${formConfig.memberRegistrationOpen ? 'bg-[#CD0000]' : 'bg-slate-300'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${formConfig.memberRegistrationOpen ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Vertical Domain selections</h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Control whether candidates can pick and apply for specific technical verticals.</p>
                </div>
                <button
                  onClick={() => handleToggle('verticalRegistrationOpen')}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${formConfig.verticalRegistrationOpen ? 'bg-[#CD0000]' : 'bg-slate-300'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${formConfig.verticalRegistrationOpen ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button 
                onClick={handleSaveSettings} 
                disabled={isSaving} 
                className="flex items-center gap-1.5 px-5 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] shadow-sm transition-colors"
              >
                {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />} Save Configurations
              </button>
            </div>
          </div>

          {/* Admin Profile */}
          <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-sm space-y-4 self-start">
            <h3 className="text-sm font-bold text-[#CD0000] uppercase tracking-wider flex items-center gap-1.5"><Shield size={16} /> Admin profile info</h3>
            
            {user && (
              <div className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Full Name</label>
                  <input readOnly type="text" value={user.name} className={inputClass} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Email</label>
                  <input readOnly type="email" value={user.email} className={inputClass} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Role Type</label>
                  <span className="inline-block bg-[#CD0000]/5 text-[#CD0000] border border-[#CD0000]/15 px-2 py-0.5 rounded font-black mt-1">
                    {user.role}
                  </span>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-150 rounded-xl text-blue-700 flex gap-2 font-medium">
                  <Info size={14} className="shrink-0 mt-0.5 text-blue-500" />
                  <p className="leading-relaxed">You have all admin rights to manage content, settings, and team profiles.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
