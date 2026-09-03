"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ShieldCheck, AlertCircle, ArrowLeft, CheckCircle2,
  Upload, Calendar, Clock, ChevronDown, Loader2
} from 'lucide-react';
import Stack from '@/components/ui/Stack';


export default function PublicFormPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [form, setForm] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, { name: string; url: string; loading: boolean }>>({});

  useEffect(() => {
    if (slug) loadForm();
  }, [slug]);

  const loadForm = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getFormBySlug', payload: { slug } })
      });
      const data = await res.json();
      if (data.success) {
        const { form: formMeta, fields: formFields } = data.data;
        const today = new Date();
        if (formMeta.status === 'closed') {
          setError('This form is closed and no longer accepting responses.');
        } else if (formMeta.status === 'draft') {
          setError('This form is a draft and is not publicly available yet.');
        } else if (formMeta.startDate && new Date(formMeta.startDate) > today) {
          setError(`This form opens on ${new Date(formMeta.startDate).toLocaleString()}.`);
        } else if (formMeta.endDate && new Date(formMeta.endDate) < today) {
          setError('This form is no longer accepting responses — the deadline has passed.');
        }
        setForm(formMeta);
        setFields(formFields);
      } else {
        setError(data.error || 'Form not found.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId: string, value: any) =>
    setFormData(prev => ({ ...prev, [fieldId]: value }));

  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    const current = formData[fieldId] || [];
    handleInputChange(fieldId, checked ? [...current, option] : current.filter((o: string) => o !== option));
  };

  const handleFileUpload = async (fieldId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFiles(prev => ({ ...prev, [fieldId]: { name: file.name, url: '', loading: true } }));
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUploadingFiles(prev => ({ ...prev, [fieldId]: { name: file.name, url: base64String, loading: false } }));
        handleInputChange(fieldId, { name: file.name, dataUrl: base64String });
      };
      reader.readAsDataURL(file);
    } catch {
      alert('Failed to read file.');
      setUploadingFiles(prev => { const n = { ...prev }; delete n[fieldId]; return n; });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    for (const f of fields) {
      if (f.fieldType === 'section_divider') continue;
      const val = formData[f.id];
      if (f.required) {
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          alert(`"${f.label}" is required.`);
          return;
        }
        if (f.fieldType === 'checkboxes' && Array.isArray(f.options) && Array.isArray(val) && val.length < f.options.length) {
          alert(`Please confirm all requirements under "${f.label}".`);
          return;
        }
      }
    }
    const nameField = fields.find(f => f.label.toLowerCase().trim() === 'name') || fields.find(f => f.label.toLowerCase().includes('name')) || fields.find(f => f.fieldType === 'short_text');
    const emailField = fields.find(f => f.fieldType === 'email') || fields.find(f => f.label.toLowerCase().includes('email'));
    const applicantName = nameField ? formData[nameField.id] || 'Anonymous' : 'Anonymous';
    const applicantEmail = emailField ? formData[emailField.id] || 'anonymous@labyrinth.club' : 'anonymous@labyrinth.club';

    setIsSubmitting(true);
    setSubmitProgress(20);

    const progressTimer = setInterval(() => {
      setSubmitProgress((prev) => {
        if (prev < 50) return prev + 15;
        if (prev < 85) return prev + 5;
        return prev;
      });
    }, 100);

    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submitFormResponse',
          payload: { formId: form.id, applicantName, applicantEmail, answers: formData }
        })
      });
      const data = await res.json();
      if (data.success) {
        setSubmitProgress(100);
        clearInterval(progressTimer);
        setTimeout(() => setIsSubmitted(true), 300);
      } else {
        clearInterval(progressTimer);
        alert(data.error || 'Submission failed.');
      }
    } catch {
      clearInterval(progressTimer);
      alert('Connection error. Failed to submit.');
    } finally {
      setIsSubmitting(false);
      setSubmitProgress(0);
    }
  };

  // ── Shared input style ──────────────────────────────────────────────────────
  const inputBase =
    'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#CD0000]/15 focus:border-[#CD0000] transition-all';

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8FA] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-[3px] border-[#CD0000] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Loading form…</p>
        </div>
      </div>
    );
  }

  // ── Error / Closed ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F8FA] flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-10 border border-slate-200/80 text-center max-w-md w-full shadow-sm">
            <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertCircle size={26} className="text-[#CD0000]" />
            </div>
            <h1 className="text-lg font-extrabold text-slate-900 mb-2 tracking-tight">Form Unavailable</h1>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <ArrowLeft size={12} /> Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Success ─────────────────────────────────────────────────────────────────
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F8F8FA] flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-10 border border-slate-200/80 text-center max-w-md w-full shadow-sm">
            <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={26} className="text-emerald-600" />
            </div>
            <h1 className="text-lg font-extrabold text-slate-900 mb-2 tracking-tight">Response Submitted!</h1>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Thank you for filling out <strong className="text-slate-700">{form?.title}</strong>. Your response has been recorded.
            </p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 px-7 py-3 bg-[#CD0000] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#A30000] transition-all shadow-md shadow-red-100"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isJoinForm = slug === 'join_community' || slug === 'join-community' || slug === 'join' || form?.id === 'join_community';

  return (
    <div className="min-h-screen bg-[#F8F8FA] flex flex-col pt-16 sm:pt-20">
      {/* Cover image / Banner (optional) */}
      {form.coverImage && (
        <div className="max-w-3xl w-full mx-auto px-3 sm:px-4 pt-3 sm:pt-4">
          <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs bg-white">
            <img 
              src={form.coverImage} 
              alt={form.title || "Form banner"} 
              className="w-full h-auto block object-cover max-h-[420px]" 
            />
          </div>
        </div>
      )}

      <div className="flex-1 max-w-3xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* ── Form identity card ── */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="h-1 w-full bg-[#CD0000]" />
          <div className="p-5 sm:p-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
              {form.title}
            </h1>
            
            {/* Show static description text ONLY for standard forms */}
            {!isJoinForm && form.description && (
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed whitespace-pre-line mt-3">{form.description}</p>
            )}

            {/* Deadline / dates */}
            {(form.startDate || form.endDate) && (
              <div className="flex flex-wrap gap-2.5 sm:gap-3 mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-slate-100">
                {form.startDate && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100 text-[11px] sm:text-xs text-slate-600 font-semibold">
                    <Calendar size={13} className="text-[#CD0000] shrink-0" />
                    <span>Opens: {new Date(form.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                )}
                {form.endDate && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100 text-[11px] sm:text-xs text-slate-600 font-semibold">
                    <Clock size={13} className="text-[#CD0000] shrink-0" />
                    <span>Closes: {new Date(form.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Interactive Verticals Stack (Replaces static description inside the form) ── */}
        {isJoinForm && (
          <div className="py-2">
            <div className="text-center pb-4">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest font-bold">Interactive Verticals Explorer</span>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 mt-0.5">
                Explore Club Domains
              </h2>
              <p className="text-slate-500 text-xs mt-1 px-2">
                Scroll down to watch each vertical card slide up and overlay inside the form
              </p>
            </div>
            <Stack />
          </div>
        )}

        {/* ── Fields ── */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((f) => {
            // Section divider
            if (f.fieldType === 'section_divider') {
              return (
                <div key={f.id} className="pt-4 sm:pt-6 pb-1 sm:pb-2">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-1 h-4 sm:h-5 bg-[#CD0000] rounded-full shrink-0" />
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-widest">{f.label}</h3>
                  </div>
                  {f.description && <p className="text-slate-500 text-xs mt-1.5 ml-3.5 sm:ml-4 leading-relaxed">{f.description}</p>}
                </div>
              );
            }

            return (
              <div key={f.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-3 hover:border-slate-300 transition-colors">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-0.5">
                    {f.label}
                    {f.required && <span className="text-[#CD0000] ml-1">*</span>}
                  </label>
                  {f.description && (
                    <p className="text-slate-400 text-[11px] sm:text-xs leading-relaxed mt-1">{f.description}</p>
                  )}
                </div>

                {/* short text */}
                {f.fieldType === 'short_text' && (
                  <input type="text" required={f.required} placeholder={f.placeholder}
                    value={formData[f.id] || ''} onChange={e => handleInputChange(f.id, e.target.value)}
                    className={inputBase} />
                )}

                {/* long text */}
                {f.fieldType === 'long_text' && (
                  <textarea rows={4} required={f.required} placeholder={f.placeholder}
                    value={formData[f.id] || ''} onChange={e => handleInputChange(f.id, e.target.value)}
                    className={`${inputBase} resize-none`} />
                )}

                {/* email */}
                {f.fieldType === 'email' && (
                  <input type="email" required={f.required} placeholder={f.placeholder || 'name@cs.christuniversity.in'}
                    value={formData[f.id] || ''} onChange={e => handleInputChange(f.id, e.target.value)}
                    className={inputBase} />
                )}

                {/* phone */}
                {f.fieldType === 'phone_number' && (
                  <input type="tel" required={f.required} placeholder={f.placeholder || '+91 99999 99999'}
                    value={formData[f.id] || ''} onChange={e => handleInputChange(f.id, e.target.value)}
                    className={inputBase} />
                )}

                {/* number */}
                {f.fieldType === 'number' && (
                  <input type="number" required={f.required} placeholder={f.placeholder}
                    value={formData[f.id] || ''} onChange={e => handleInputChange(f.id, e.target.value)}
                    className={inputBase} />
                )}

                {/* date */}
                {f.fieldType === 'date' && (
                  <input type="date" required={f.required}
                    value={formData[f.id] || ''} onChange={e => handleInputChange(f.id, e.target.value)}
                    className={inputBase} />
                )}

                {/* url */}
                {f.fieldType === 'url' && (
                  <input type="url" required={f.required} placeholder={f.placeholder || 'https://'}
                    value={formData[f.id] || ''} onChange={e => handleInputChange(f.id, e.target.value)}
                    className={inputBase} />
                )}

                {/* dropdown */}
                {f.fieldType === 'dropdown' && (
                  <div className="relative">
                    <select required={f.required} value={formData[f.id] || ''}
                      onChange={e => handleInputChange(f.id, e.target.value)}
                      className={`${inputBase} appearance-none pr-10`}>
                      <option value="">{f.placeholder || 'Select an option…'}</option>
                      {(f.options || []).map((opt: string) => {
                        const cleanOpt = opt.replace(/^[\?\s\p{Emoji}\u200b-\u200d\uFE0F\uFFFD]+/gu, '').trim();
                        return <option key={opt} value={cleanOpt}>{cleanOpt}</option>;
                      })}
                    </select>
                    <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                )}

                {/* radio */}
                {f.fieldType === 'radio_buttons' && (
                  <div className="space-y-2 pt-1">
                    {(f.options || []).map((opt: string) => {
                      const cleanOpt = opt.replace(/^[\?\s\p{Emoji}\u200b-\u200d\uFE0F\uFFFD]+/gu, '').trim();
                      return (
                        <label key={opt} className="flex items-start sm:items-center gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-slate-200 cursor-pointer hover:border-[#CD0000]/40 hover:bg-red-50/30 transition-all has-[:checked]:border-[#CD0000]/60 has-[:checked]:bg-red-50/50">
                          <input type="radio" name={f.id}
                            required={f.required && !formData[f.id]}
                            checked={formData[f.id] === cleanOpt || formData[f.id] === opt}
                            onChange={() => handleInputChange(f.id, cleanOpt)}
                            className="w-4 h-4 mt-0.5 sm:mt-0 accent-[#CD0000] shrink-0" />
                          <span className="text-xs sm:text-sm text-slate-700 font-medium leading-normal min-w-0 flex-1 break-words">{cleanOpt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* checkboxes */}
                {f.fieldType === 'checkboxes' && (
                  <div className="space-y-2 pt-1">
                    {(f.options || []).map((opt: string) => {
                      const cleanOpt = opt.replace(/^[\?\s\p{Emoji}\u200b-\u200d\uFE0F\uFFFD]+/gu, '').trim();
                      return (
                        <label key={opt} className="flex items-start sm:items-center gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-slate-200 cursor-pointer hover:border-[#CD0000]/40 hover:bg-red-50/30 transition-all has-[:checked]:border-[#CD0000]/60 has-[:checked]:bg-red-50/50">
                          <input type="checkbox"
                            checked={(formData[f.id] || []).includes(cleanOpt) || (formData[f.id] || []).includes(opt)}
                            onChange={e => handleCheckboxChange(f.id, cleanOpt, e.target.checked)}
                            className="w-4 h-4 mt-0.5 sm:mt-0 accent-[#CD0000] rounded shrink-0" />
                          <span className="text-xs sm:text-sm text-slate-700 font-medium leading-normal min-w-0 flex-1 break-words">{cleanOpt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* file upload */}
                {f.fieldType === 'file_upload' && (
                  <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-5 sm:p-8 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors text-center"
                    style={{ borderColor: uploadingFiles[f.id] ? '#CD0000' : '#E2E8F0' }}>
                    <input type="file" className="hidden"
                      required={f.required && !formData[f.id]}
                      onChange={e => handleFileUpload(f.id, e)} />
                    {uploadingFiles[f.id]?.loading ? (
                      <Loader2 size={22} className="text-[#CD0000] animate-spin" />
                    ) : (
                      <Upload size={22} className="text-slate-400" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        {uploadingFiles[f.id] ? uploadingFiles[f.id].name : 'Click to choose a file'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {uploadingFiles[f.id]?.loading ? 'Reading…' : 'PDF, Word, Images — max 10 MB'}
                      </p>
                    </div>
                  </label>
                )}
              </div>
            );
          })}

          {/* ── Submit row ── */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden space-y-3">
            {isSubmitting && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-red-100 overflow-hidden">
                <div 
                  className="h-full bg-[#CD0000] transition-all duration-200 ease-out"
                  style={{ width: `${submitProgress}%` }}
                />
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-400 text-[11px] sm:text-xs font-semibold">
                <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                <span>Responses are securely recorded by Labyrinth</span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-7 py-3 bg-[#CD0000] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#A30000] transition-all disabled:opacity-80 shadow-md shadow-red-100 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <><Loader2 size={13} className="animate-spin" /> Saving response... {submitProgress}%</>
                ) : (
                  'Submit Form'
                )}
              </button>
            </div>
            {isSubmitting && (
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#CD0000] rounded-full transition-all duration-200 ease-out"
                  style={{ width: `${submitProgress}%` }}
                />
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-400 pb-4">
          Labyrinth · Christ University Department of Computer Science
        </p>
      </div>
    </div>
  );
}

