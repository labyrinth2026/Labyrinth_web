import React, { useState, useEffect } from 'react';
import { fetchFromSheet } from '@/services/api';
import { CheckCircle2, Link as LinkIcon, Plus, Save, Trash2, Edit2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormItem {
  id: string;
  title: string;
  url: string;
  active: boolean;
}

const FormsManager: React.FC = () => {
  const [forms, setForms] = useState<FormItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    setIsLoading(true);
    try {
      // In a real app with backend, this would fetch from an API
      // Since we don't have one, we read from api wrapper which uses localStorage as fallback
      const data: any = await fetchFromSheet('getForms');
      if (data) {
        // Convert object mapping to array
        const formsArray = Object.values(data) as FormItem[];
        setForms(formsArray);
      }
    } catch (error) {
      console.error('Failed to load forms', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveForms = async (updatedForms: FormItem[]) => {
    setIsSaving(true);
    try {
      const formsObject = updatedForms.reduce((acc, form) => {
        acc[form.id] = form;
        return acc;
      }, {} as Record<string, FormItem>);
      
      await fetchFromSheet('updateForms', { forms: formsObject });
      setForms(updatedForms);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save forms', error);
      alert('Failed to save forms');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = (id: string, field: keyof FormItem, value: any) => {
    const updated = forms.map(f => f.id === id ? { ...f, [field]: value } : f);
    setForms(updated);
  };

  const toggleActive = (id: string) => {
    const updated = forms.map(f => f.id === id ? { ...f, active: !f.active } : f);
    setForms(updated);
    saveForms(updated); // auto-save on toggle
  };

  const handleSaveAll = () => {
    saveForms(forms);
  };

  const addNewForm = () => {
    const newForm: FormItem = {
      id: `custom_${Date.now()}`,
      title: 'New Custom Form',
      url: '',
      active: false
    };
    setForms([...forms, newForm]);
  };

  const removeForm = (id: string) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      const updated = forms.filter(f => f.id !== id);
      setForms(updated);
      saveForms(updated);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-[#667085]">Loading forms...</div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-grotesk text-[#CD0000] mb-2">Forms Management</h1>
          <p className="text-[#667085]">Manage active Google Form links across the website. Update URLs anytime without code changes.</p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="px-5 py-2.5 bg-[#CD0000] text-white font-semibold rounded-xl hover:bg-[#A30000] transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70"
        >
          {isSaving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
        </button>
      </div>

      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl flex items-center gap-3 font-medium shadow-sm"
          >
            <CheckCircle2 size={20} className="text-emerald-500" />
            Forms configuration updated successfully. The website will now use these links.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
        <div className="p-5 border-b border-[#E5E7EB] bg-[rgba(205, 0, 0, 0.03)]/30 flex justify-between items-center">
          <h2 className="font-semibold text-[#CD0000]">Active Registration Forms</h2>
          <button 
            onClick={addNewForm}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#CD0000] hover:text-[#A30000] bg-[rgba(205, 0, 0, 0.03)] px-3 py-1.5 rounded-lg border border-[rgba(205, 0, 0, 0.07)] transition-colors"
          >
            <Plus size={16} /> Add Custom Form
          </button>
        </div>

        <div className="divide-y divide-[#E5E7EB]">
          {forms.map(form => (
            <div key={form.id} className={`p-6 transition-colors ${form.active ? 'bg-white' : 'bg-gray-50/50'}`}>
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${form.active ? 'bg-[rgba(205, 0, 0, 0.03)] text-[#CD0000]' : 'bg-gray-100 text-gray-400'}`}>
                    <LinkIcon size={20} />
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <input 
                        type="text"
                        value={form.title}
                        onChange={(e) => handleUpdate(form.id, 'title', e.target.value)}
                        className={`text-lg font-bold font-grotesk bg-transparent border-b border-transparent hover:border-[#E5E7EB] focus:border-[#CD0000] focus:outline-none transition-colors px-1 -ml-1 ${form.active ? 'text-[#CD0000]' : 'text-gray-500'}`}
                      />
                      <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold px-1">Internal ID: {form.id}</div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* Toggle */}
                      <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input type="checkbox" className="sr-only" checked={form.active} onChange={() => toggleActive(form.id)} />
                          <div className={`block w-12 h-6 rounded-full transition-colors ${form.active ? 'bg-[#CD0000]' : 'bg-gray-300'}`}></div>
                          <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${form.active ? 'transform translate-x-6' : ''}`}></div>
                        </div>
                        <div className="ml-3 font-semibold text-sm text-[#667085]">
                          {form.active ? 'Active' : 'Inactive'}
                        </div>
                      </label>
                      
                      <button onClick={() => removeForm(form.id)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8c97a8] uppercase tracking-wider mb-1.5">Google Form URL</label>
                    <input 
                      type="url"
                      value={form.url}
                      onChange={(e) => handleUpdate(form.id, 'url', e.target.value)}
                      placeholder="https://forms.gle/..."
                      className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CD0000]/20 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {forms.length === 0 && (
            <div className="p-8 text-center text-[#8c97a8]">
              No forms configured. Click "Add Custom Form" to create one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormsManager;
