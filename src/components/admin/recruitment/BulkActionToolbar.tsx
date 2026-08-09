import React, { useState } from 'react';
import { Mail, Download, Trash2, X, ChevronDown, RefreshCw, CheckCircle } from 'lucide-react';

interface BulkActionToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onChangeStatusBulk: (newStatus: string) => void;
  onSendEmailBulk: () => void;
  onExportSelected: () => void;
  onDeleteSelected: () => void;
}

export const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onChangeStatusBulk,
  onSendEmailBulk,
  onExportSelected,
  onDeleteSelected,
}) => {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  if (selectedCount === 0) return null;

  const isAllSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3 sm:px-5 sm:py-3 shadow-2xl border border-slate-700/80 flex items-center gap-3 sm:gap-4 flex-wrap max-w-[94vw] sm:max-w-max animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Count & Check Toggle */}
      <div className="flex items-center gap-2.5 pr-3.5 border-r border-slate-700/80">
        <span className="flex items-center justify-center min-w-[24px] h-6 px-1.5 bg-[#CD0000] text-white text-xs font-extrabold rounded-lg shadow-xs">
          {selectedCount}
        </span>
        <span className="text-xs font-extrabold text-slate-100 whitespace-nowrap">Selected</span>

        <button
          onClick={isAllSelected ? onClearSelection : onSelectAll}
          className="ml-1 text-[11px] text-slate-300 hover:text-white font-semibold underline underline-offset-2 transition-colors whitespace-nowrap"
        >
          {isAllSelected ? 'Deselect All' : `Select All (${totalCount})`}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Status Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold rounded-xl border border-slate-600/80 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw size={13} className="text-amber-400" />
            <span>Change Status</span>
            <ChevronDown size={13} className="text-slate-400" />
          </button>

          {showStatusDropdown && (
            <div className="absolute bottom-full mb-2 left-0 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 text-xs font-medium space-y-1 animate-in fade-in duration-150">
              {[
                { label: 'Mark as Pending', value: 'pending', color: 'hover:bg-amber-950/60 text-amber-300' },
                { label: 'Mark as Shortlisted', value: 'shortlisted', color: 'hover:bg-blue-950/60 text-blue-300' },
                { label: 'Mark as Selected', value: 'selected', color: 'hover:bg-emerald-950/60 text-emerald-300' },
                { label: 'Mark as Rejected', value: 'rejected', color: 'hover:bg-rose-950/60 text-rose-300' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChangeStatusBulk(opt.value);
                    setShowStatusDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-bold ${opt.color}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bulk Email */}
        <button
          onClick={onSendEmailBulk}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl border border-blue-500 transition-all flex items-center gap-1.5 shadow-xs"
        >
          <Mail size={13} />
          <span>Send Email</span>
        </button>

        {/* Export Selected */}
        <button
          onClick={onExportSelected}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl border border-emerald-500 transition-all flex items-center gap-1.5 shadow-xs"
        >
          <Download size={13} />
          <span>Export CSV</span>
        </button>

        {/* Bulk Delete */}
        <button
          onClick={onDeleteSelected}
          className="px-3.5 py-2 bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold rounded-xl border border-rose-500 transition-all flex items-center gap-1.5 shadow-xs"
        >
          <Trash2 size={13} />
          <span>Delete</span>
        </button>
      </div>

      {/* Clear Selection Button */}
      <button
        onClick={onClearSelection}
        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-auto"
        title="Clear Selection"
      >
        <X size={16} />
      </button>
    </div>
  );
};
