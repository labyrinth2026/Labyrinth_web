import React, { useState, useEffect } from 'react';
import { X, Send, Eye, Edit3, Sparkles, Check, Copy } from 'lucide-react';
import { ApplicantRowData } from './ApplicantTable';

interface EmailComposerModalProps {
  recipients: ApplicantRowData[];
  initialTemplate?: 'interview' | 'selection' | 'shortlisted' | 'rejection' | 'custom';
  onClose: () => void;
  onSend: (subject: string, body: string, recipients: ApplicantRowData[]) => Promise<void>;
}

export const EmailComposerModal: React.FC<EmailComposerModalProps> = ({
  recipients,
  initialTemplate = 'custom',
  onClose,
  onSend,
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [template, setTemplate] = useState<string>(initialTemplate);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const primaryCandidate = recipients[0];

  // Templates dictionary
  const templates: Record<string, { subject: string; body: string }> = {
    interview: {
      subject: 'Interview Invitation - Labyrinth Club Recruitment {{vertical}}',
      body: `Dear {{name}},

Thank you for applying for the {{vertical}} domain at Labyrinth Club! We were impressed by your application (Register No: {{register}}, Class: {{class}}).

We would like to invite you for an in-person interview. Please find the interview details below:

Date: Coming Up Soon
Venue: Computer Science Lab / Labyrinth Clubroom

Please be prepared to discuss your interest and past projects in {{vertical}}.

Best regards,
Labyrinth Recruitment Team
Christ University`,
    },
    selection: {
      subject: 'Congratulations! Welcome to Labyrinth Club - {{vertical}}',
      body: `Dear {{name}},

Congratulations! We are thrilled to inform you that you have been SELECTED to join the {{vertical}} domain at Labyrinth Club for the upcoming academic session!

Your Register Number: {{register}}
Class: {{class}}
Domain: {{vertical}}

We were extremely impressed with your skills and enthusiasm during the recruitment process. Information regarding the orientation meeting and onboarding will be shared shortly.

Welcome aboard!

Warm regards,
Labyrinth Executive Board`,
    },
    shortlisted: {
      subject: 'Application Status Update: Shortlisted - Labyrinth Club',
      body: `Dear {{name}},

Great news! Your application for the {{vertical}} domain has been SHORTLISTED for the next round of Labyrinth Club Recruitment.

Candidate Details:
Name: {{name}}
Register No: {{register}}
Class: {{class}}

Our domain lead will reach out to you shortly with the schedule for the next evaluation stage. Keep an eye on your university inbox ({{email}}).

Best regards,
Labyrinth Club Panel`,
    },
    rejection: {
      subject: 'Labyrinth Club Recruitment Status Update',
      body: `Dear {{name}},

Thank you for taking the time to apply for the {{vertical}} domain at Labyrinth Club and participating in our recruitment process.

After careful review of all submissions, we regret to inform you that we are unable to move forward with your application for this session. We received an overwhelming number of applications and had to make difficult decisions.

We sincerely appreciate your interest in Labyrinth and encourage you to apply again in future recruitment cycles and attend our open workshops and fests.

Wishing you all the best in your academic journey.

Warm regards,
Labyrinth Team`,
    },
    custom: {
      subject: 'Notice from Labyrinth Club',
      body: `Dear {{name}},

Write your message here...

Best regards,
Labyrinth Team`,
    },
  };

  useEffect(() => {
    if (templates[template]) {
      setSubject(templates[template].subject);
      setBody(templates[template].body);
    }
  }, [template]);

  const replaceVariables = (str: string, candidate?: ApplicantRowData) => {
    if (!candidate) return str;
    return str
      .replace(/{{name}}/g, candidate.applicantName || 'Applicant')
      .replace(/{{email}}/g, candidate.applicantEmail || '')
      .replace(/{{register}}/g, candidate.regNo || 'N/A')
      .replace(/{{class}}/g, candidate.className || 'N/A')
      .replace(/{{vertical}}/g, candidate.preferredVertical || 'Club Domain');
  };

  const handleSendEmail = async () => {
    if (!subject.trim() || !body.trim()) {
      alert('Subject and email body are required.');
      return;
    }

    setIsSending(true);
    try {
      await onSend(subject, body, recipients);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to dispatch email.');
    } finally {
      setIsSending(false);
    }
  };

  const isBulk = recipients.length > 1;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 font-inter animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#CD0000] flex items-center gap-1.5 mb-0.5">
              <Sparkles size={13} /> Email System
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 font-grotesk">
              {isBulk ? `Compose Bulk Email (${recipients.length} Recipients)` : `Send Email to ${primaryCandidate?.applicantName}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Top Controls: Template Selector & Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Template Selection */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Template:</span>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#CD0000]/15"
            >
              <option value="custom">Custom Email</option>
              <option value="interview">Interview Invitation</option>
              <option value="shortlisted">Shortlisted Notification</option>
              <option value="selection">Selection Letter</option>
              <option value="rejection">Rejection Notice</option>
            </select>
          </div>

          {/* Edit / Preview Tabs */}
          <div className="flex bg-slate-200/70 p-1 rounded-xl shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'edit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 size={13} /> Edit Template
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'preview' ? 'bg-white text-[#CD0000] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye size={13} /> Live Preview
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
          {/* Recipients info */}
          <div className="text-xs bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
            <span className="font-bold text-slate-500">To:</span>
            <span className="font-semibold text-slate-800 truncate ml-2">
              {isBulk
                ? `${recipients.length} applicants selected (${recipients.slice(0, 3).map((r) => r.applicantEmail).join(', ')}${
                    recipients.length > 3 ? '...' : ''
                  })`
                : `${primaryCandidate?.applicantName} <${primaryCandidate?.applicantEmail}>`}
            </span>
          </div>

          {activeTab === 'edit' ? (
            <div className="space-y-4">
              {/* Subject */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject line..."
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#CD0000]/15 focus:border-[#CD0000]"
                />
              </div>

              {/* Dynamic Variables helper tags */}
              <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-3 text-[11px] text-amber-900 space-y-1">
                <span className="font-bold block text-amber-950">Dynamic Variable Placeholders:</span>
                <p className="text-amber-800">
                  You can use placeholders like <code className="bg-amber-100 font-mono px-1 py-0.5 rounded text-amber-900">{`{{name}}`}</code>,{' '}
                  <code className="bg-amber-100 font-mono px-1 py-0.5 rounded text-amber-900">{`{{email}}`}</code>,{' '}
                  <code className="bg-amber-100 font-mono px-1 py-0.5 rounded text-amber-900">{`{{register}}`}</code>,{' '}
                  <code className="bg-amber-100 font-mono px-1 py-0.5 rounded text-amber-900">{`{{class}}`}</code>,{' '}
                  <code className="bg-amber-100 font-mono px-1 py-0.5 rounded text-amber-900">{`{{vertical}}`}</code>.
                </p>
              </div>

              {/* Body */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  Email Body Template
                </label>
                <textarea
                  rows={9}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your email body..."
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#CD0000]/15 focus:border-[#CD0000] leading-relaxed resize-y"
                />
              </div>
            </div>
          ) : (
            /* Live Preview Mode */
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Subject</span>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {replaceVariables(subject, primaryCandidate)}
                  </h3>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    Body (Previewing for {primaryCandidate?.applicantName || 'Candidate'})
                  </span>
                  <div className="bg-white border border-slate-200/80 rounded-xl p-4 text-xs text-slate-800 font-medium whitespace-pre-line leading-relaxed shadow-xs">
                    {replaceVariables(body, primaryCandidate)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSendEmail}
            disabled={isSending}
            className="px-6 py-2.5 bg-[#CD0000] hover:bg-[#A30000] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Send size={14} />
            {isSending ? 'Dispatching Email...' : `Send Email (${recipients.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};
