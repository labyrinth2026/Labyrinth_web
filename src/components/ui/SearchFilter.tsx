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
    <div className="w-full flex flex-col mb-8">
      
      {/* Filters (Rendered as Category Tabs) */}
      {filters.length > 0 && onFilterChange && (
        <div className="w-full">
          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => {
              const isActive = activeFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  onClick={() => onFilterChange(filter.value)}
                  className={`relative px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 border z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CD0000]/20 ${
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
                  <span className="relative z-10">{filter.label}</span>
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
