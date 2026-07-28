import React from 'react';
import { Mail, Check, Bell } from 'lucide-react';
import { ApplicantRowData } from './ApplicantTable';

interface StatusNotifyModalProps {
  applicant: ApplicantRowData;
  newStatus: string;
  onConfirmNotify: () => void;
  onConfirmSilent: () => void;
  onCancel: () => void;
}

export const StatusNotifyModal: React.FC<StatusNotifyModalProps> = ({
  applicant,
  newStatus,
  onConfirmNotify,
  onConfirmSilent,
  onCancel,
}) => {
  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'shortlisted':
        return 'bg-blue-100 text-blue-800';
      case 'selected':
        return 'bg-emerald-100 text-emerald-800';
      case 'rejected':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 font-inter animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 p-6 space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#CD0000]/10 text-[#CD0000] flex items-center justify-center shrink-0">
            <Bell size={20} />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base font-grotesk">Notify Applicant?</h3>
            <p className="text-xs text-slate-500 font-medium">Status transition requested for candidate</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-600">Candidate:</span>
            <span className="font-extrabold text-slate-900">{applicant.applicantName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-600">New Status:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${getStatusBadge(newStatus)}`}>
              {newStatus.replace('_', ' ')}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          Would you like to compose and send an automated email notification to{' '}
          <strong className="text-slate-900">{applicant.applicantEmail}</strong> regarding this status update?
        </p>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={onConfirmSilent}
            className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors text-center"
          >
            No, Update Silently
          </button>

          <button
            onClick={onConfirmNotify}
            className="flex-1 px-4 py-2.5 bg-[#CD0000] hover:bg-[#A30000] text-white text-xs font-extrabold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Mail size={14} /> YES, Notify Email
          </button>
        </div>
      </div>
    </div>
  );
};
