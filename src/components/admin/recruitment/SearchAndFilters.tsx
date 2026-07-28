import React, { useState, useEffect } from 'react';
import { Search, Filter, RotateCcw, SortAsc, Calendar, Layers, GraduationCap, X } from 'lucide-react';

interface FiltersState {
  search: string;
  status: string;
  vertical: string;
  class: string;
  dateRange: string;
  sortBy: 'newest' | 'oldest' | 'alphabetical' | 'recently_updated';
}

interface SearchAndFiltersProps {
  filters: FiltersState;
  onFilterChange: (updates: Partial<FiltersState>) => void;
  onClearFilters: () => void;
  verticalsList: string[];
  classList: string[];
  totalResults: number;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  verticalsList,
  classList,
  totalResults,
}) => {
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ search: searchInput });
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchInput, filters.search, onFilterChange]);

  // Keep local search input in sync if cleared externally
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  const hasActiveFilters =
    filters.search ||
    filters.status !== 'all' ||
    filters.vertical !== 'all' ||
    filters.class !== 'all' ||
    filters.dateRange !== 'all' ||
    filters.sortBy !== 'newest';

  const selectClass =
    'border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#CD0000]/15 focus:border-[#CD0000] cursor-pointer font-medium transition-colors';

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs space-y-3.5">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by candidate name, email, register number, class, domain..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#CD0000]/15 focus:border-[#CD0000] focus:bg-white transition-all font-medium"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                onFilterChange({ search: '' });
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Total Badge & Quick Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-500 font-semibold px-3 py-2 bg-slate-100 rounded-xl border border-slate-200/60 whitespace-nowrap">
            {totalResults.toLocaleString()} candidate{totalResults === 1 ? '' : 's'}
          </span>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <RotateCcw size={13} /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Filter Dropdowns Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100">
        {/* Status */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 flex items-center gap-1">
            <Filter size={11} className="text-[#CD0000]" /> Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className={selectClass}
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

        {/* Vertical */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 flex items-center gap-1">
            <Layers size={11} className="text-[#CD0000]" /> Vertical Domain
          </label>
          <select
            value={filters.vertical}
            onChange={(e) => onFilterChange({ vertical: e.target.value })}
            className={selectClass}
          >
            <option value="all">All Verticals</option>
            {verticalsList.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* Class */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 flex items-center gap-1">
            <GraduationCap size={11} className="text-[#CD0000]" /> Class / Course
          </label>
          <select
            value={filters.class}
            onChange={(e) => onFilterChange({ class: e.target.value })}
            className={selectClass}
          >
            <option value="all">All Classes</option>
            {classList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Submission Date */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 flex items-center gap-1">
            <Calendar size={11} className="text-[#CD0000]" /> Date Submitted
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => onFilterChange({ dateRange: e.target.value })}
            className={selectClass}
          >
            <option value="all">Any Time</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 flex items-center gap-1">
            <SortAsc size={11} className="text-[#CD0000]" /> Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            className={selectClass}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">Applicant Name (A-Z)</option>
            <option value="recently_updated">Recently Updated</option>
          </select>
        </div>
      </div>
    </div>
  );
};
