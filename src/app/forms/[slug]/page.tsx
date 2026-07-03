"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShieldCheck, Calendar, MapPin, Upload, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

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

  // File upload state for displaying progress / name
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, { name: string; url: string; loading: boolean }>>({});

  useEffect(() => {
    if (slug) {
      loadForm();
    }
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
        
        // Date check
        const today = new Date();
        if (formMeta.status === 'closed') {
          setError('This form is closed and no longer accepting responses.');
        } else if (formMeta.status === 'draft') {
          setError('This form is currently a draft and cannot be viewed publicly.');
        } else if (formMeta.startDate && new Date(formMeta.startDate) > today) {
          setError(`This form is scheduled to open on ${new Date(formMeta.startDate).toLocaleString()}.`);
        } else if (formMeta.endDate && new Date(formMeta.endDate) < today) {
          setError('This form is no longer accepting responses (deadline passed).');
        }

        setForm(formMeta);
        setFields(formFields);
      } else {
        setError(data.error || 'Form not found.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Failed to load form.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    const current = formData[fieldId] || [];
    let next = [];
    if (checked) {
      next = [...current, option];
    } else {
      next = current.filter((o: string) => o !== option);
    }
    handleInputChange(fieldId, next);
  };

  // Convert files to base64 for local database compatibility and easy transport
  const handleFileUpload = async (fieldId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFiles(prev => ({
      ...prev,
      [fieldId]: { name: file.name, url: '', loading: true }
    }));

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        
        setUploadingFiles(prev => ({
          ...prev,
          [fieldId]: { name: file.name, url: base64String, loading: false }
        }));
        
        handleInputChange(fieldId, { name: file.name, dataUrl: base64String });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      alert('Failed to upload file.');
      setUploadingFiles(prev => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Basic required validation
    for (const f of fields) {
      if (f.fieldType === 'section_divider') continue;
      if (f.required && !formData[f.id]) {
        alert(`"${f.label}" is required.`);
        return;
      }
    }

    // Extract applicant identity if fields represent name/email
    const nameField = fields.find(f => f.label.toLowerCase().includes('name') || f.fieldType === 'short_text');
    const emailField = fields.find(f => f.fieldType === 'email' || f.label.toLowerCase().includes('email'));

    const applicantName = nameField ? (typeof formData[nameField.id] === 'object' ? formData[nameField.id]?.name : formData[nameField.id]) || 'Anonymous' : 'Anonymous';
    const applicantEmail = emailField ? formData[emailField.id] || 'anonymous@labyrinth.club' : 'anonymous@labyrinth.club';

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submitFormResponse',
          payload: {
            formId: form.id,
            applicantName,
            applicantEmail,
            answers: formData
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsSubmitted(true);
      } else {
        alert(data.error || 'Submission failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Connection error. Failed to submit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center font-inter">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#CD0000] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Loading Form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center font-inter px-4">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center max-w-md w-full shadow-sm">
          <div className="w-16 h-16 bg-red-50 text-[#CD0000] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-100 shadow-sm shadow-red-50">
            <AlertCircle size={28} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Form Closed or Unavailable</h1>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">{error}</p>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px] rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft size={12} />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center font-inter px-4">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center max-w-md w-full shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-sm shadow-emerald-50">
            <CheckCircle2 size={28} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Response Submitted</h1>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Thank you for filling out <strong>{form?.title}</strong>. Your response has been recorded.
          </p>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-[#CD0000] text-white font-bold uppercase tracking-wider text-[10px] rounded-xl hover:bg-[#A30000] transition-all flex items-center justify-center gap-2 mx-auto shadow-md shadow-red-100"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#CD0000]/15 focus:border-[#CD0000] text-slate-800 placeholder:text-slate-400 bg-white transition-all";

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-inter pb-16">
      {/* Cover Image or Accent Header */}
      {form.coverImage ? (
        <div className="w-full h-48 sm:h-64 overflow-hidden relative border-b border-slate-200">
          <img src={form.coverImage} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      ) : (
        <div className="w-full h-4 bg-[#CD0000]" />
      )}

      <div className="max-w-2xl mx-auto px-4 mt-6">
        {/* Form Meta Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 sm:p-8 mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
            {form.title}
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
            {form.description}
          </p>
        </div>

        {/* Form Submission Fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.map((f) => {
            if (f.fieldType === 'section_divider') {
              return (
                <div key={f.id} className="pt-4 pb-2 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{f.label}</h3>
                  {f.description && <p className="text-slate-500 text-xs mt-1 leading-relaxed">{f.description}</p>}
                </div>
              );
            }

            return (
              <div key={f.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
                <label className="block text-sm font-bold text-slate-800">
                  {f.label} {f.required && <span className="text-[#CD0000]">*</span>}
                </label>
                
                {f.description && (
                  <p className="text-slate-500 text-xs leading-relaxed">{f.description}</p>
                )}

                {/* Input Builders based on fieldType */}
                {f.fieldType === 'short_text' && (
                  <input
                    type="text"
                    required={f.required}
                    placeholder={f.placeholder}
                    value={formData[f.id] || ''}
                    onChange={(e) => handleInputChange(f.id, e.target.value)}
                    className={inputClass}
                  />
                )}

                {f.fieldType === 'long_text' && (
                  <textarea
                    rows={4}
                    required={f.required}
                    placeholder={f.placeholder}
                    value={formData[f.id] || ''}
                    onChange={(e) => handleInputChange(f.id, e.target.value)}
                    className={inputClass}
                  />
                )}

                {f.fieldType === 'email' && (
                  <input
                    type="email"
                    required={f.required}
                    placeholder={f.placeholder || 'name@example.com'}
                    value={formData[f.id] || ''}
                    onChange={(e) => handleInputChange(f.id, e.target.value)}
                    className={inputClass}
                  />
                )}

                {f.fieldType === 'phone_number' && (
                  <input
                    type="tel"
                    required={f.required}
                    placeholder={f.placeholder || '+91 99999 99999'}
                    value={formData[f.id] || ''}
                    onChange={(e) => handleInputChange(f.id, e.target.value)}
                    className={inputClass}
                  />
                )}

                {f.fieldType === 'number' && (
                  <input
                    type="number"
                    required={f.required}
                    placeholder={f.placeholder}
                    value={formData[f.id] || ''}
                    onChange={(e) => handleInputChange(f.id, e.target.value)}
                    className={inputClass}
                  />
                )}

                {f.fieldType === 'date' && (
                  <input
                    type="date"
                    required={f.required}
                    value={formData[f.id] || ''}
                    onChange={(e) => handleInputChange(f.id, e.target.value)}
                    className={inputClass}
                  />
                )}

                {f.fieldType === 'url' && (
                  <input
                    type="url"
                    required={f.required}
                    placeholder={f.placeholder || 'https://example.com'}
                    value={formData[f.id] || ''}
                    onChange={(e) => handleInputChange(f.id, e.target.value)}
                    className={inputClass}
                  />
                )}

                {f.fieldType === 'dropdown' && (
                  <select
                    required={f.required}
                    value={formData[f.id] || ''}
                    onChange={(e) => handleInputChange(f.id, e.target.value)}
                    className={inputClass}
                  >
                    <option value="">{f.placeholder || 'Select choice'}</option>
                    {(f.options || []).map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}

                {f.fieldType === 'radio_buttons' && (
                  <div className="space-y-2.5 pt-1">
                    {(f.options || []).map((opt: string) => (
                      <label key={opt} className="flex items-center gap-3 text-slate-700 text-sm cursor-pointer select-none">
                        <input
                          type="radio"
                          name={f.id}
                          required={f.required && !formData[f.id]}
                          checked={formData[f.id] === opt}
                          onChange={() => handleInputChange(f.id, opt)}
                          className="w-4 h-4 text-[#CD0000] border-slate-300 focus:ring-[#CD0000]/15"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}

                {f.fieldType === 'checkboxes' && (
                  <div className="space-y-2.5 pt-1">
                    {(f.options || []).map((opt: string) => (
                      <label key={opt} className="flex items-center gap-3 text-slate-700 text-sm cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={(formData[f.id] || []).includes(opt)}
                          onChange={(e) => handleCheckboxChange(f.id, opt, e.target.checked)}
                          className="w-4 h-4 text-[#CD0000] border-slate-300 rounded focus:ring-[#CD0000]/15"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}

                {f.fieldType === 'file_upload' && (
                  <div className="pt-1">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer text-center">
                      <input
                        type="file"
                        className="hidden"
                        required={f.required && !formData[f.id]}
                        onChange={(e) => handleFileUpload(f.id, e)}
                      />
                      <Upload size={24} className="text-slate-400 mb-2" />
                      <span className="text-xs font-bold text-slate-700">
                        {uploadingFiles[f.id] ? uploadingFiles[f.id].name : 'Choose file to upload'}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">
                        {uploadingFiles[f.id]?.loading ? 'Reading file...' : 'PDF, Word, Images, max 10MB'}
                      </span>
                    </label>
                  </div>
                )}
              </div>
            );
          })}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <ShieldCheck size={14} className="text-emerald-500" />
              Secure Club Verification
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-[#CD0000] text-white font-bold uppercase tracking-wider text-[10px] rounded-xl hover:bg-[#A30000] transition-all disabled:opacity-50 shadow-md shadow-red-100 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Form'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
