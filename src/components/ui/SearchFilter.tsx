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
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8c97a8] group-focus-within:text-[#0B1F63] transition-colors">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border border-[#E5E7EB] text-[#0B1F63] rounded-full py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[#0B1F63]/20 focus:border-[#0B1F63] transition-all shadow-sm placeholder:text-[#8c97a8]"
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
                      : 'text-[#667085] bg-white border border-[#E5E7EB] hover:border-[#0B1F63] hover:text-[#0B1F63]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeFilterBg"
                      className="absolute inset-0 bg-[#0B1F63] rounded-full -z-10"
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
