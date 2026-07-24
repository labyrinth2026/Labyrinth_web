import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchFromSheet } from '@/services/api';
import { 
  Plus, Edit2, Trash2, Copy, ExternalLink, Link as LinkIcon, RefreshCw, X, Check, 
  Download, Eye, Save, Calendar, Settings, ArrowLeft, MoreVertical, FileText, 
  MessageSquare, User, Mail, Search, ChevronRight, Play, Ban, ShieldAlert,
  ChevronUp, ChevronDown
} from 'lucide-react';

interface CustomForm {
  id: string;
  title: string;
  description: string;
  slug: string;
  status: 'draft' | 'published' | 'closed' | 'archived';
  coverImage?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomFormField {
  id: string;
  fieldType: string;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // converted from JSON or array
  defaultValue?: string;
  validation?: string;
}

interface CustomResponse {
  id: string;
  formId: string;
  applicantName: string;
  applicantEmail: string;
  status: 'pending' | 'shortlisted' | 'selected' | 'rejected' | 'interview_scheduled' | 'completed';
  notes?: string;
  submittedAt: string;
  answers: Record<string, any>;
}

export default function FormsManager() {
  const { user } = useAuth();
  
  // Views: 'list' | 'build' | 'responses'
  const [view, setView] = useState<'list' | 'build' | 'responses'>('list');
  const [loading, setLoading] = useState(true);

  const [origin, setOrigin] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);
  
  // Lists
  const [forms, setForms] = useState<CustomForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<CustomForm | null>(null);
  
  // Builder state
  const [builderFields, setBuilderFields] = useState<CustomFormField[]>([]);
  const [formMeta, setFormMeta] = useState<Partial<CustomForm>>({});
  
  // Responses view state
  const [responses, setResponses] = useState<CustomResponse[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<CustomResponse | null>(null);
  const [responseNotes, setResponseNotes] = useState('');
  const [responseStatus, setResponseStatus] = useState<any>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadAllForms();
  }, []);

  // Lock background scroll when response details modal is open
  useEffect(() => {
    if (selectedResponse) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedResponse]);

  const loadAllForms = async () => {
    setLoading(true);
    try {
      const res: any = await fetchFromSheet('getCustomForms');
      setForms(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---
  
  const handleOpenBuilder = async (formItem: CustomForm | null) => {
    if (formItem) {
      setSelectedForm(formItem);
      setFormMeta({ ...formItem });
      // Fetch fields
      try {
        const res: any = await fetchFromSheet('getFormBySlug', { slug: formItem.slug });
        if (res && res.fields) {
          setBuilderFields(res.fields.map((f: any) => ({
            ...f,
            options: Array.isArray(f.options) ? f.options : f.options ? JSON.parse(f.options) : []
          })));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setSelectedForm(null);
      setFormMeta({
        title: 'New Custom Form',
        description: 'Please describe the purpose of this form.',
        slug: `form-${Date.now()}`,
        status: 'draft',
        coverImage: '',
        startDate: '',
        endDate: ''
      });
      setBuilderFields([
        {
          id: `field_${Date.now()}_1`,
          fieldType: 'short_text',
          label: 'Applicant Full Name',
          placeholder: 'Enter your name',
          required: true
        },
        {
          id: `field_${Date.now()}_2`,
          fieldType: 'email',
          label: 'University Email Address',
          placeholder: 'name@cs.christuniversity.in',
          required: true
        }
      ]);
    }
    setView('build');
  };

  const handleOpenResponses = async (formItem: CustomForm) => {
    setSelectedForm(formItem);
    setLoading(true);
    try {
      // Load both fields and responses in parallel
      const [fieldsRes, responsesRes]: [any, any] = await Promise.all([
        fetchFromSheet('getFormBySlug', { slug: formItem.slug }),
        fetchFromSheet('getFormResponses', { formId: formItem.id })
      ]);
      
      if (fieldsRes && fieldsRes.fields) {
        setBuilderFields(fieldsRes.fields.map((f: any) => ({
          ...f,
          options: Array.isArray(f.options) ? f.options : f.options ? JSON.parse(f.options) : []
        })));
      }
      setResponses(responsesRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
    setView('responses');
  };

  const handleAddField = (type: string) => {
    const newField: CustomFormField = {
      id: `field_${Date.now()}`,
      fieldType: type,
      label: type === 'section_divider' ? 'Section Header' : 'New Question',
      required: false,
      options: ['Option 1', 'Option 2', 'Option 3']
    };
    setBuilderFields([...builderFields, newField]);
  };

  const handleUpdateField = (id: string, updates: Partial<CustomFormField>) => {
    setBuilderFields(builderFields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleRemoveField = (id: string) => {
    setBuilderFields(builderFields.filter(f => f.id !== id));
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const nextIdx = direction === 'up' ? index - 1 : index + 1;
    if (nextIdx < 0 || nextIdx >= builderFields.length) return;
    const nextFields = [...builderFields];
    const temp = nextFields[index];
    nextFields[index] = nextFields[nextIdx];
    nextFields[nextIdx] = temp;
    setBuilderFields(nextFields);
  };

  const handleSaveForm = async () => {
    if (!formMeta.title || !formMeta.slug) {
      alert('Title and Slug are required.');
      return;
    }
    // Simple slug format check
    const slugRegex = /^[a-z0-9-_]+$/;
    if (!slugRegex.test(formMeta.slug)) {
      alert('Slug must contain only lowercase letters, numbers, hyphens, and underscores.');
      return;
    }

    setLoading(true);
    try {
      const payloadFields = builderFields.map((f, i) => ({
        ...f,
        order: i,
        options: f.options ? f.options : null
      }));

      if (selectedForm) {
        // Update
        await fetchFromSheet('updateForm', {
          id: selectedForm.id,
          form: formMeta,
          fields: payloadFields
        });
      } else {
        // Create
        await fetchFromSheet('addForm', {
          form: {
            ...formMeta,
            createdBy: user?.id
          },
          fields: payloadFields
        });
      }
      setView('list');
      loadAllForms();
    } catch (err: any) {
      alert(err.message || 'Failed to save form.');
      setLoading(false);
    }
  };

  const handleDeleteForm = async (id: string) => {
    if (!confirm('Are you sure you want to delete this form and all its responses?')) return;
    setLoading(true);
    try {
      await fetchFromSheet('deleteForm', { id });
      loadAllForms();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleDuplicateForm = async (id: string) => {
    setLoading(true);
    try {
      await fetchFromSheet('duplicateForm', { id });
      loadAllForms();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin || ''}/forms/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 1500);
  };

  const handleOpenResponseDetails = (resp: CustomResponse) => {
    setSelectedResponse(resp);
    setResponseNotes(resp.notes || '');
    setResponseStatus(resp.status);
  };

  const handleSaveResponseDetails = async () => {
    if (!selectedResponse) return;
    try {
      await fetchFromSheet('updateResponseStatus', {
        id: selectedResponse.id,
        status: responseStatus,
        notes: responseNotes
      });
      // Refresh responses list
      if (selectedForm) {
        const res: any = await fetchFromSheet('getFormResponses', { formId: selectedForm.id });
        setResponses(res || []);
      }
      setSelectedResponse(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update response details.');
    }
  };

  // CSV Export utility
  const handleExportCSV = () => {
    if (!selectedForm || responses.length === 0) return;
    
    // Headers
    const headers = ['Submission Date', 'Applicant Name', 'Applicant Email', 'Status', 'Internal Notes'];
    // Add dynamic questions
    builderFields.forEach(f => {
      if (f.fieldType !== 'section_divider') {
        headers.push(f.label);
      }
    });

    const csvRows = [headers.join(',')];

    responses.forEach(r => {
      const row = [
        `"${new Date(r.submittedAt).toLocaleString()}"`,
        `"${r.applicantName}"`,
        `"${r.applicantEmail}"`,
        `"${r.status}"`,
        `"${(r.notes || '').replace(/"/g, '""')}"`
      ];

      builderFields.forEach(f => {
        if (f.fieldType !== 'section_divider') {
          const ans = r.answers[f.id];
          const ansString = ans 
            ? typeof ans === 'object' 
              ? ans.dataUrl 
                ? ans.name 
                : Array.isArray(ans) 
                  ? ans.join('; ') 
                  : JSON.stringify(ans)
              : ans
            : '';
          row.push(`"${String(ansString).replace(/"/g, '""')}"`);
        }
      });

      csvRows.push(row.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedForm.slug}_responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-slate-100 text-slate-700 border-slate-200',
      published: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      closed: 'bg-red-50 text-red-500 border-red-100',
      archived: 'bg-slate-100 text-slate-400 border-slate-200'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getResponseStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-yellow-50 text-yellow-600 border-yellow-100',
      shortlisted: 'bg-blue-50 text-blue-600 border-blue-100',
      selected: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      rejected: 'bg-red-50 text-red-500 border-red-100',
      interview_scheduled: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      completed: 'bg-slate-100 text-slate-600 border-slate-200'
    };
    return badges[status] || 'bg-slate-100 text-slate-600';
  };

  // Filter & Search logic for responses
  const filteredResponses = responses.filter(r => {
    const matchSearch = 
      r.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.status.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const inputClass = "w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#CD0000]/15 focus:border-[#CD0000] text-slate-800 placeholder:text-slate-400 bg-white disabled:opacity-50";

  return (
    <div className="space-y-6">
      {/* 1. LIST VIEW */}
      {view === 'list' && (
        <>
          {/* Header */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex justify-between items-center shadow-xs">
            <div>
              <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">Forms Management</h1>
              <p className="text-[#667085] text-sm mt-0.5">Build custom club forms, manage responses, and export applicant data.</p>
            </div>
            <button 
              onClick={() => handleOpenBuilder(null)}
              className="px-4 py-2 bg-[#CD0000] hover:bg-[#A30000] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5"
            >
              <Plus size={15} /> Create Form
            </button>
          </div>

          {loading ? (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center text-slate-500">
              <RefreshCw size={24} className="animate-spin text-[#CD0000] mx-auto mb-2" />
              Fetching forms directory...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {forms.map(form => (
                <div key={form.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-sm transition-shadow">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-extrabold text-slate-800 text-base">{form.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(form.status)}`}>
                        {form.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">{form.description}</p>
                    <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-400 font-medium w-full">
                      <LinkIcon size={12} className="shrink-0" />
                      <a 
                        href={`/forms/${form.slug}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="truncate hover:underline text-[#CD0000] font-bold max-w-[80%]"
                      >
                        {origin ? `${origin}/forms/${form.slug}` : `/forms/${form.slug}`}
                      </a>
                      <button 
                        onClick={(e) => { e.preventDefault(); handleCopyLink(form.slug); }} 
                        className="p-1 hover:text-[#CD0000] transition-colors rounded-md flex items-center justify-center shrink-0"
                        title="Copy Link"
                      >
                        {copiedSlug === form.slug ? (
                          <Check size={11} className="text-emerald-600" />
                        ) : (
                          <Copy size={11} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 gap-2">
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => handleOpenBuilder(form)}
                        className="p-2 text-slate-500 hover:text-[#CD0000] hover:bg-slate-50 rounded-xl transition-all"
                        title="Edit Form fields"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDuplicateForm(form.id)}
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all"
                        title="Duplicate Form"
                      >
                        <Copy size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteForm(form.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Form"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <button 
                      onClick={() => handleOpenResponses(form)}
                      className="px-3.5 py-2 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <FileText size={12} className="text-[#CD0000]" />
                      Responses
                    </button>
                  </div>
                </div>
              ))}
              {forms.length === 0 && (
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-10 text-center text-slate-400 col-span-2">
                  No custom forms created yet. Click "Create Form" to start.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* 2. BUILDER VIEW */}
      {view === 'build' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex justify-between items-center shadow-xs">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setView('list')}
                className="p-2 text-slate-500 hover:text-[#CD0000] hover:bg-slate-50 rounded-xl transition-all"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">{selectedForm ? 'Edit Custom Form' : 'Create Custom Form'}</h1>
                <p className="text-[#667085] text-sm mt-0.5">Configure form settings and design input fields.</p>
              </div>
            </div>
            <button 
              onClick={handleSaveForm}
              className="px-5 py-2 bg-[#CD0000] hover:bg-[#A30000] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Save size={15} /> Save Form
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Form Settings */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-4 self-start">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                <Settings size={14} className="text-[#CD0000]" />
                Form Settings
              </h3>
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Form Title *</label>
                <input type="text" required value={formMeta.title || ''} onChange={e => setFormMeta({ ...formMeta, title: e.target.value })} className={inputClass} placeholder="e.g. Club Recruitment 2026" />
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Description</label>
                <textarea rows={3} value={formMeta.description || ''} onChange={e => setFormMeta({ ...formMeta, description: e.target.value })} className={inputClass} placeholder="Provide instructions for applicants..." />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Public Slug *</label>
                  <input type="text" required value={formMeta.slug || ''} onChange={e => setFormMeta({ ...formMeta, slug: e.target.value })} className={inputClass} placeholder="recruitment-2026" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Status</label>
                  <select value={formMeta.status || 'draft'} onChange={e => setFormMeta({ ...formMeta, status: e.target.value as any })} className={inputClass}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="closed">Closed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Cover Image URL (Optional)</label>
                <input type="url" value={formMeta.coverImage || ''} onChange={e => setFormMeta({ ...formMeta, coverImage: e.target.value })} className={inputClass} placeholder="https://images.unsplash.com/..." />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Start Date</label>
                  <input type="datetime-local" value={formMeta.startDate ? formMeta.startDate.substring(0, 16) : ''} onChange={e => setFormMeta({ ...formMeta, startDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">End Date</label>
                  <input type="datetime-local" value={formMeta.endDate ? formMeta.endDate.substring(0, 16) : ''} onChange={e => setFormMeta({ ...formMeta, endDate: e.target.value })} className={inputClass} />
                </div>
              </div>
            </div>

            {/* Right Col: Fields Designer */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs flex justify-between items-center gap-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Form Questions &amp; Fields</h3>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Short Text', type: 'short_text' },
                    { label: 'Paragraph', type: 'long_text' },
                    { label: 'Dropdown', type: 'dropdown' },
                    { label: 'Radio Buttons', type: 'radio_buttons' },
                    { label: 'Checkboxes', type: 'checkboxes' },
                    { label: 'File Upload', type: 'file_upload' },
                    { label: 'Section Divider', type: 'section_divider' }
                  ].map(btn => (
                    <button 
                      key={btn.type}
                      type="button"
                      onClick={() => handleAddField(btn.type)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-[10px] font-bold uppercase rounded-lg transition-all"
                    >
                      + {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {builderFields.map((field, index) => (
                <div key={field.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs relative group space-y-4">
                  {/* Reordering / Actions Header */}
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#CD0000]">
                      Question #{index + 1} &mdash; {field.fieldType.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={() => handleMoveField(index, 'up')} className="p-1 hover:text-[#CD0000] rounded"><ChevronUp size={14} /></button>
                      <button type="button" onClick={() => handleMoveField(index, 'down')} className="p-1 hover:text-[#CD0000] rounded"><ChevronDown size={14} /></button>
                      <button type="button" onClick={() => handleRemoveField(field.id)} className="p-1 text-red-400 hover:text-red-600 rounded ml-2"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  {/* Core Field Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Field Label / Question Title *</label>
                      <input type="text" required value={field.label} onChange={e => handleUpdateField(field.id, { label: e.target.value })} className={inputClass} placeholder="e.g. What is your preferred Vertical Domain?" />
                    </div>
                    
                    {field.fieldType !== 'section_divider' && (
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Placeholder Text</label>
                        <input type="text" value={field.placeholder || ''} onChange={e => handleUpdateField(field.id, { placeholder: e.target.value })} className={inputClass} placeholder="Short helper placeholder..." />
                      </div>
                    )}
                  </div>

                  {field.fieldType !== 'section_divider' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Question Description</label>
                        <input type="text" value={field.description || ''} onChange={e => handleUpdateField(field.id, { description: e.target.value })} className={inputClass} placeholder="Context instructions below question..." />
                      </div>
                      
                      <div className="flex items-center gap-6 pt-5">
                        <label className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={field.required} 
                            onChange={e => handleUpdateField(field.id, { required: e.target.checked })} 
                            className="w-4 h-4 text-[#CD0000] border-slate-300 rounded focus:ring-[#CD0000]/15" 
                          />
                          Response Required
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Choices Options list for Select/Checkboxes/Radios */}
                  {['dropdown', 'radio_buttons', 'checkboxes'].includes(field.fieldType) && (
                    <div className="pt-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Choices Options List (One per line) *</label>
                      <textarea
                        rows={3}
                        required
                        value={field.options?.join('\n') || ''}
                        onChange={e => handleUpdateField(field.id, { options: e.target.value.split('\n') })}
                        className={inputClass}
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                      />
                    </div>
                  )}
                </div>
              ))}
              {builderFields.length === 0 && (
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center text-slate-400">
                  Form has no questions yet. Click any field type button above to add.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. RESPONSES DASHBOARD VIEW */}
      {view === 'responses' && selectedForm && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setView('list')}
                className="p-2 text-slate-500 hover:text-[#CD0000] hover:bg-slate-50 rounded-xl transition-all"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">{selectedForm.title} &mdash; Responses</h1>
                <p className="text-[#667085] text-sm mt-0.5">Manage and review incoming applicant submissions.</p>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={handleExportCSV}
                disabled={responses.length === 0}
                className="flex-1 sm:flex-none px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Download size={14} /> Export CSV
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Total Responses', value: responses.length, color: 'text-slate-800 bg-white' },
              { label: 'Pending', value: responses.filter(r => r.status === 'pending').length, color: 'text-yellow-600 bg-yellow-50/50' },
              { label: 'Shortlisted', value: responses.filter(r => r.status === 'shortlisted').length, color: 'text-blue-600 bg-blue-50/50' },
              { label: 'Selected', value: responses.filter(r => r.status === 'selected').length, color: 'text-emerald-600 bg-emerald-50/50' },
              { label: 'Rejected', value: responses.filter(r => r.status === 'rejected').length, color: 'text-red-500 bg-red-50/50' }
            ].map((stat, i) => (
              <div key={i} className={`border border-slate-200 rounded-2xl p-4 shadow-xs text-center ${stat.color}`}>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{stat.label}</p>
                <h4 className="text-xl font-extrabold">{stat.value}</h4>
              </div>
            ))}
          </div>

          {/* Filtering and Table */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={14} />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search applicant name or email..."
                  className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#CD0000]/15"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Filter Status:</span>
                <select 
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="border border-[#E5E7EB] rounded-xl px-3 py-1.5 text-xs text-slate-700 bg-white focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="selected">Selected</option>
                  <option value="rejected">Rejected</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-[rgba(205, 0, 0, 0.03)] border-b border-[rgba(205, 0, 0, 0.07)] text-xs font-bold text-[#8c97a8] uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Submission Date</th>
                    <th className="p-4">Applicant Name</th>
                    <th className="p-4">Applicant Email</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResponses.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-xs text-slate-500 font-medium">
                        {new Date(r.submittedAt).toLocaleString()}
                      </td>
                      <td className="p-4 text-slate-800 font-extrabold">{r.applicantName}</td>
                      <td className="p-4 text-slate-600">{r.applicantEmail}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getResponseStatusBadge(r.status)}`}>
                          {r.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleOpenResponseDetails(r)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold uppercase rounded-lg border border-slate-200 transition-all flex items-center gap-1.5 ml-auto"
                        >
                          <Eye size={12} className="text-[#CD0000]" /> Review
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredResponses.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-slate-400">
                        No responses matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RESPONSE DETAILS MODAL */}
      {selectedResponse && selectedForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-end font-inter">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between border-l border-slate-200">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#CD0000]">Applicant Submission Details</span>
                <h2 className="font-extrabold text-slate-800 text-lg mt-0.5">{selectedResponse.applicantName}</h2>
              </div>
              <button 
                onClick={() => setSelectedResponse(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content answers scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
              {/* Profile Card Header */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-700 text-sm font-semibold">
                    <User size={14} className="text-slate-400" />
                    <span>{selectedResponse.applicantName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                    <Mail size={14} className="text-slate-400" />
                    <span>{selectedResponse.applicantEmail}</span>
                  </div>
                </div>

                <div className="self-start sm:self-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getResponseStatusBadge(selectedResponse.status)}`}>
                    {selectedResponse.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Dynamic Q&A Responses List */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100">Answers Sheet</h3>
                
                {builderFields.map((f, i) => {
                  if (f.fieldType === 'section_divider') {
                    return (
                      <div key={f.id} className="pt-4 pb-1 border-b border-slate-100">
                        <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">{f.label}</span>
                      </div>
                    );
                  }

                  const answerVal = selectedResponse.answers[f.id];

                  return (
                    <div key={f.id} className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-500 block">
                        Q{i+1}: {f.label}
                      </span>
                      
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-800">
                        {answerVal ? (
                          typeof answerVal === 'object' ? (
                            answerVal.dataUrl ? (
                              <a 
                                href={answerVal.dataUrl} 
                                download={answerVal.name}
                                className="text-[#CD0000] hover:underline font-bold flex items-center gap-1.5"
                              >
                                <Download size={12} /> {answerVal.name}
                              </a>
                            ) : Array.isArray(answerVal) ? (
                              <ul className="list-disc list-inside space-y-1">
                                {answerVal.map((v: string) => <li key={v}>{v}</li>)}
                              </ul>
                            ) : (
                              JSON.stringify(answerVal)
                            )
                          ) : (
                            <span className="whitespace-pre-line leading-relaxed">{answerVal}</span>
                          )
                        ) : (
                          <span className="text-slate-400 italic">No Answer Provided</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes and Status Control Footer */}
            <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Internal Evaluation Notes</label>
                <textarea
                  rows={2}
                  value={responseNotes}
                  onChange={e => setResponseNotes(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#CD0000] text-slate-800 bg-white placeholder:text-slate-400"
                  placeholder="Add details about interview ratings, skills matching, or follow-ups..."
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Transition Status:</span>
                  <select 
                    value={responseStatus} 
                    onChange={e => setResponseStatus(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#CD0000]"
                  >
                    <option value="pending">Pending</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="selected">Selected</option>
                    <option value="rejected">Rejected</option>
                    <option value="interview_scheduled">Interview Scheduled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedResponse(null)}
                    className="px-4 py-2 text-xs text-slate-500 hover:text-[#CD0000] font-semibold"
                  >
                    Cancel
                  </button>
                  
                  <button 
                    onClick={handleSaveResponseDetails}
                    className="px-5 py-2 bg-[#CD0000] hover:bg-[#A30000] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Check size={14} /> Save Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
