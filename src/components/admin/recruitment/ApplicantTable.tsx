import React, { useMemo } from 'react';
import { Eye, Mail, ChevronLeft, ChevronRight, User } from 'lucide-react';

export interface ApplicantRowData {
  id: string;
  formId: string;
  applicantName: string;
  applicantEmail: string;
  regNo: string;
  className: string;
  preferredVertical: string;
  status: 'pending' | 'shortlisted' | 'selected' | 'rejected' | 'interview_scheduled' | 'completed' | string;
  notes?: string;
  submittedAt: string;
  answers: Record<string, any>;
}

interface ApplicantTableProps {
  applicants: ApplicantRowData[];
  selectedIds: string[];
  onToggleSelectRow: (id: string) => void;
  onToggleSelectAll: () => void;
  onOpenDrawer: (applicant: ApplicantRowData) => void;
  onOpenEmailComposer: (applicant: ApplicantRowData) => void;
  onChangeStatusQuick: (applicant: ApplicantRowData, newStatus: string) => void;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const ApplicantTable: React.FC<ApplicantTableProps> = ({
  applicants,
  selectedIds,
  onToggleSelectRow,
  onToggleSelectAll,
  onOpenDrawer,
  onOpenEmailComposer,
  onChangeStatusQuick,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const totalItems = applicants.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return applicants.slice(start, start + pageSize);
  }, [applicants, currentPage, pageSize]);

  const isAllPageSelected =
    paginatedItems.length > 0 && paginatedItems.every((item) => selectedIds.includes(item.id));

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'shortlisted':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      case 'selected':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'interview_scheduled':
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'A';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-xs overflow-hidden flex flex-col">
      {/* Table Body */}
      <div className="overflow-x-auto min-h-[380px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#EFEDE6]/50 border-b border-[#E5E7EB] sticky top-0 z-10 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
            <tr>
              <th className="py-3.5 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllPageSelected}
                  onChange={onToggleSelectAll}
                  className="w-4 h-4 text-[#CD0000] border-slate-300 rounded focus:ring-[#CD0000]/20 cursor-pointer"
                />
              </th>
              <th className="py-3.5 px-4">Applicant</th>
              <th className="py-3.5 px-4">Reg No</th>
              <th className="py-3.5 px-4">Class</th>
              <th className="py-3.5 px-4">Preferred Vertical</th>
              <th className="py-3.5 px-4">Submitted</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
            {paginatedItems.map((row) => {
              const isSelected = selectedIds.includes(row.id);

              return (
                <tr
                  key={row.id}
                  className={`transition-colors duration-150 group ${
                    isSelected ? 'bg-amber-50/20' : 'hover:bg-slate-50/70'
                  }`}
                >
                  {/* Checkbox */}
                  <td className="py-3.5 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectRow(row.id)}
                      className="w-4 h-4 text-[#CD0000] border-slate-300 rounded focus:ring-[#CD0000]/20 cursor-pointer"
                    />
                  </td>

                  {/* Applicant Name & Email */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#CD0000]/10 text-[#CD0000] font-black text-xs flex items-center justify-center shrink-0 border border-[#CD0000]/20">
                        {getInitials(row.applicantName)}
                      </div>
                      <div className="min-w-0">
                        <button
                          onClick={() => onOpenDrawer(row)}
                          className="font-bold text-slate-900 hover:text-[#CD0000] transition-colors truncate block text-left text-xs"
                        >
                          {row.applicantName}
                        </button>
                        <p className="text-[11px] text-slate-400 truncate">{row.applicantEmail}</p>
                      </div>
                    </div>
                  </td>

                  {/* Register Number */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] font-semibold text-slate-600">
                    {row.regNo || '—'}
                  </td>

                  {/* Class */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">
                    {row.className || '—'}
                  </td>

                  {/* Preferred Vertical */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {row.preferredVertical ? (
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200/80">
                        {row.preferredVertical}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">—</span>
                    )}
                  </td>

                  {/* Submitted Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-slate-500">
                    {new Date(row.submittedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>

                  {/* Quick Status Dropdown */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <select
                      value={row.status}
                      onChange={(e) => onChangeStatusQuick(row, e.target.value)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#CD0000]/20 transition-all ${getStatusBadgeStyle(
                        row.status
                      )}`}
                    >
                      <option value="pending" className="bg-white text-slate-800 font-medium">Pending</option>
                      <option value="shortlisted" className="bg-white text-slate-800 font-medium">Shortlisted</option>
                      <option value="selected" className="bg-white text-slate-800 font-medium">Selected</option>
                      <option value="rejected" className="bg-white text-slate-800 font-medium">Rejected</option>
                    </select>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenDrawer(row)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
                        title="Review candidate profile & answers"
                      >
                        <Eye size={12} className="text-[#CD0000]" /> Review
                      </button>
                      <button
                        onClick={() => onOpenEmailComposer(row)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Send email to applicant"
                      >
                        <Mail size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {paginatedItems.length === 0 && (
              <tr>
                <td colSpan={8} className="py-16 text-center text-slate-400 font-medium">
                  <div className="max-w-xs mx-auto space-y-2">
                    <User size={32} className="mx-auto text-slate-300" />
                    <p className="text-sm font-bold text-slate-600">No applicants found</p>
                    <p className="text-xs text-slate-400">Try adjusting your filters or search query.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-[#EFEDE6]/30 border-t border-[#E5E7EB] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-medium select-none">
        <div className="flex items-center gap-3">
          <span>
            Showing <strong className="text-slate-900">{totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
            <strong className="text-slate-900">{Math.min(currentPage * pageSize, totalItems)}</strong> of{' '}
            <strong className="text-slate-900">{totalItems}</strong> applicants
          </span>

          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-slate-400 text-[11px]">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Page Nav */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-3 font-bold text-slate-800">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
