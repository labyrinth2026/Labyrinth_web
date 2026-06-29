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
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7a90aa] group-focus-within:text-[#005BAC] transition-colors">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border border-blue-100 text-[#1a2c4a] rounded-full py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[#005BAC]/20 focus:border-[#005BAC] transition-all shadow-sm placeholder:text-[#7a90aa]"
        />
      </div>

      {/* Filters */}
      {filters.length > 0 && onFilterChange && (
        <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <div className="flex gap-2">
            {filters.map((filter) => {
              const isActive = activeFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  onClick={() => onFilterChange(filter.value)}
                  className={`relative px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'text-white'
                      : 'text-[#4b6080] bg-white border border-blue-100 hover:border-[#005BAC] hover:text-[#005BAC]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeFilterBg"
                      className="absolute inset-0 bg-[#005BAC] rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
