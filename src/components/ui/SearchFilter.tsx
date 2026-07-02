import React from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface FilterOption {
  label: string;
  value: string;
}

interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: FilterOption[];
  activeFilter?: string;
  onFilterChange?: (value: string) => void;
  placeholder?: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchValue,
  onSearchChange,
  filters = [],
  activeFilter = '',
  onFilterChange,
  placeholder = 'Search...'
}) => {
  return (
    <div className="w-full flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
      
      {/* Search Input */}
      <div className="relative w-full md:max-w-md group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#CD0000] transition-colors">
          <Search size={16} />
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border border-slate-200 text-slate-800 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#CD0000]/10 focus:border-[#CD0000] transition-all shadow-xs placeholder:text-slate-400 text-xs font-semibold uppercase tracking-wider"
        />
      </div>

      {/* Filters */}
      {filters.length > 0 && onFilterChange && (
        <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <div className="flex gap-1.5">
            {filters.map((filter) => {
              const isActive = activeFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  onClick={() => onFilterChange(filter.value)}
                  className={`relative px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 border ${
                    isActive
                      ? 'text-white border-slate-900'
                      : 'text-slate-600 bg-white border-slate-200 hover:border-slate-300 hover:text-slate-800'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeFilterBg"
                      className="absolute inset-0 bg-slate-900 rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
