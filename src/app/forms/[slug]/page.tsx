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
      if (f.required && !formData[f.id]) {
        alert(`"${f.label}" is required.`);
        return;
      }
    }
    const nameField = fields.find(f => f.label.toLowerCase().trim() === 'name') || fields.find(f => f.label.toLowerCase().includes('name')) || fields.find(f => f.fieldType === 'short_text');
    const emailField = fields.find(f => f.fieldType === 'email') || fields.find(f => f.label.toLowerCase().includes('email'));
    const applicantName = nameField ? formData[nameField.id] || 'Anonymous' : 'Anonymous';
    const applicantEmail = emailField ? formData[emailField.id] || 'anonymous@labyrinth.club' : 'anonymous@labyrinth.club';

    setIsSubmitting(true);
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
      if (data.success) setIsSubmitted(true);
      else alert(data.error || 'Submission failed.');
    } catch {
      alert('Connection error. Failed to submit.');
    } finally {
      setIsSubmitting(false);
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
    <div className="min-h-screen bg-[#F8F8FA] flex flex-col pt-20">
      {/* Cover image (optional) */}
      {form.coverImage && (
        <div className="w-full h-44 sm:h-56 overflow-hidden relative">
          <img src={form.coverImage} alt="Form cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      )}

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-6">
        {/* ── Form identity card ── */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="h-1 w-full bg-[#CD0000]" />
          <div className="p-7 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
              {form.title}
            </h1>
            
            {/* Show static description text ONLY for standard forms */}
            {!isJoinForm && form.description && (
              <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-line mt-3">{form.description}</p>
            )}

            {/* Deadline / dates */}
            {(form.startDate || form.endDate) && (
              <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-slate-100">
                {form.startDate && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                    <Calendar size={13} className="text-[#CD0000]" />
                    Opens: {new Date(form.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                )}
                {form.endDate && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                    <Clock size={13} className="text-[#CD0000]" />
                    Closes: {new Date(form.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
              <p className="text-slate-500 text-xs mt-1">
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
                <div key={f.id} className="pt-6 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-5 bg-[#CD0000] rounded-full shrink-0" />
                    <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest">{f.label}</h3>
                  </div>
                  {f.description && <p className="text-slate-500 text-xs mt-2 ml-4 leading-relaxed">{f.description}</p>}
                </div>
              );
            }

            return (
              <div key={f.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3 hover:border-slate-300 transition-colors">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-0.5">
                    {f.label}
                    {f.required && <span className="text-[#CD0000] ml-1">*</span>}
                  </label>
                  {f.description && (
                    <p className="text-slate-400 text-xs leading-relaxed mt-1">{f.description}</p>
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
                      {(f.options || []).map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                )}

                {/* radio */}
                {f.fieldType === 'radio_buttons' && (
                  <div className="space-y-2 pt-1">
                    {(f.options || []).map((opt: string) => (
                      <label key={opt} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 cursor-pointer hover:border-[#CD0000]/40 hover:bg-red-50/30 transition-all has-[:checked]:border-[#CD0000]/60 has-[:checked]:bg-red-50/50">
                        <input type="radio" name={f.id}
                          required={f.required && !formData[f.id]}
                          checked={formData[f.id] === opt}
                          onChange={() => handleInputChange(f.id, opt)}
                          className="w-4 h-4 accent-[#CD0000]" />
                        <span className="text-sm text-slate-700 font-medium">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* checkboxes */}
                {f.fieldType === 'checkboxes' && (
                  <div className="space-y-2 pt-1">
                    {(f.options || []).map((opt: string) => (
                      <label key={opt} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 cursor-pointer hover:border-[#CD0000]/40 hover:bg-red-50/30 transition-all has-[:checked]:border-[#CD0000]/60 has-[:checked]:bg-red-50/50">
                        <input type="checkbox"
                          checked={(formData[f.id] || []).includes(opt)}
                          onChange={e => handleCheckboxChange(f.id, opt, e.target.checked)}
                          className="w-4 h-4 accent-[#CD0000] rounded" />
                        <span className="text-sm text-slate-700 font-medium">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* file upload */}
                {f.fieldType === 'file_upload' && (
                  <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-8 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors text-center"
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
          <div className="bg-white border border-slate-200/80 rounded-2xl px-6 py-5 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
              <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
              Responses are securely recorded by Labyrinth
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="shrink-0 flex items-center gap-2 px-7 py-3 bg-[#CD0000] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#A30000] transition-all disabled:opacity-60 shadow-md shadow-red-100"
            >
              {isSubmitting ? (
                <><Loader2 size={13} className="animate-spin" /> Submitting…</>
              ) : (
                'Submit Form'
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-400 pb-4">
          Labyrinth · Christ University Department of Computer Science
        </p>
      </main>
    </div>
  );
}
