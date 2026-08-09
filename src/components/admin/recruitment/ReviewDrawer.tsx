import React, { useState, useEffect } from 'react';
import { X, Mail, Download, User, Check, RefreshCw, FileText, Layers, Calendar, GraduationCap, ShieldCheck } from 'lucide-react';
import { ApplicantRowData } from './ApplicantTable';

interface CustomFormField {
  id: string;
  fieldType: string;
  label: string;
  description?: string;
}

interface ReviewDrawerProps {
  applicant: ApplicantRowData | null;
  builderFields: CustomFormField[];
  onClose: () => void;
  onSaveNotes: (id: string, notes: string, status: string) => Promise<void>;
  onOpenEmailComposer: (applicant: ApplicantRowData) => void;
}

export const ReviewDrawer: React.FC<ReviewDrawerProps> = ({
  applicant,
  builderFields,
  onClose,
  onSaveNotes,
  onOpenEmailComposer,
}) => {
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<string>('pending');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (applicant) {
      setNotes(applicant.notes || '');
      setStatus(applicant.status);
      setSavedSuccess(false);
    }
  }, [applicant]);

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (applicant) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [applicant]);

  if (!applicant) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveNotes(applicant.id, notes, status);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to save notes and status.');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'shortlisted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'selected':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-end font-inter animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-white">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#CD0000] flex items-center gap-1.5 mb-0.5">
              <ShieldCheck size={13} /> Applicant Review Drawer
            </span>
            <h2 className="font-black text-slate-900 text-xl font-grotesk tracking-tight">
              {applicant.applicantName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {/* Candidate Profile Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#CD0000] text-white font-black text-lg flex items-center justify-center shrink-0 shadow-sm">
                  {applicant.applicantName ? applicant.applicantName[0].toUpperCase() : 'A'}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{applicant.applicantName}</h3>
                  <p className="text-xs text-slate-500 font-medium">{applicant.applicantEmail}</p>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${getStatusBadge(status)}`}>
                {status.replace('_', ' ')}
              </span>
            </div>

            {/* Grid Attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Reg Number</span>
                <span className="text-xs font-mono font-bold text-slate-800">{applicant.regNo || '—'}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Class / Course</span>
                <span className="text-xs font-bold text-slate-800">{applicant.className || '—'}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Preferred Vertical</span>
                <span className="text-xs font-bold text-[#CD0000]">{applicant.preferredVertical || '—'}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Q&A Responses List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <FileText size={15} className="text-[#CD0000]" />
              Submitted Application Answers
            </h3>

            <div className="space-y-4">
              {builderFields.map((field, index) => {
                if (field.fieldType === 'section_divider') {
                  return (
                    <div key={field.id} className="pt-3 pb-1 border-b border-slate-200">
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">{field.label}</h4>
                    </div>
                  );
                }

                const answerVal = applicant.answers[field.id];

                return (
                  <div key={field.id} className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-600 block">
                      Q{index + 1}: {field.label}
                    </span>

                    <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-3.5 text-xs text-slate-800">
                      {answerVal ? (
                        typeof answerVal === 'object' ? (
                          answerVal.dataUrl ? (
                            <a
                              href={answerVal.dataUrl}
                              download={answerVal.name}
                              className="text-[#CD0000] hover:underline font-bold flex items-center gap-1.5"
                            >
                              <Download size={13} /> {answerVal.name}
                            </a>
                          ) : Array.isArray(answerVal) ? (
                            <ul className="list-disc list-inside space-y-1 font-medium">
                              {answerVal.map((v: string) => (
                                <li key={v}>{v}</li>
                              ))}
                            </ul>
                          ) : (
                            <pre className="text-[11px] font-mono whitespace-pre-wrap">{JSON.stringify(answerVal, null, 2)}</pre>
                          )
                        ) : (
                          <span className="whitespace-pre-line leading-relaxed font-medium">{String(answerVal)}</span>
                        )
                      ) : (
                        <span className="text-slate-400 italic font-normal">No Answer Provided</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {builderFields.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs font-medium">
                  No explicit form questions associated with this submission.
                </div>
              )}
            </div>
          </div>

          {/* Internal Evaluation Notes */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                Internal Evaluation Notes
              </label>
              <span className="text-[11px] text-slate-400 font-mono">{notes.length} characters</span>
            </div>

            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add evaluation comments, interview feedback, panel scores, or follow-up notes..."
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#CD0000]/15 focus:border-[#CD0000] placeholder:text-slate-400 font-medium leading-relaxed resize-y"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-white space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Status:</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#CD0000]/15"
              >
                <option value="pending">Pending</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="selected">Selected</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => onOpenEmailComposer(applicant)}
                className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl border border-blue-200 transition-colors flex items-center gap-1.5"
              >
                <Mail size={14} /> Send Email
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2 bg-[#CD0000] hover:bg-[#A30000] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isSaving ? <RefreshCw size={14} className="animate-spin" /> : savedSuccess ? <Check size={14} /> : null}
                {savedSuccess ? 'Saved!' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
