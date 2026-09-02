"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export interface EventYearOption {
  year: string;
  href: string;
}

const DEFAULT_EVENT_YEARS: EventYearOption[] = [
  { year: '2026-27', href: '/events/2026-27' },
  { year: '2025-26', href: '/events/2025-26' },
  { year: '2024-25', href: '/events/2024-25' },
];

interface EventsDropdownProps {
  items?: EventYearOption[];
  className?: string;
  isMobile?: boolean;
  onSelect?: () => void;
}

export const EventsDropdown: React.FC<EventsDropdownProps> = ({
  items = DEFAULT_EVENT_YEARS,
  className = '',
  isMobile = false,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  // Close dropdown on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Escape key to close popover
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleMouseEnter = () => {
    if (isMobile) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleItemClick = () => {
    setIsOpen(false);
    if (onSelect) onSelect();
  };

  const isEventsActive = pathname?.startsWith('/events');

  // Mobile Drawer Navigation Item
  if (isMobile) {
    return (
      <div className={`w-full ${className}`}>
        <button
          type="button"
          onClick={toggleDropdown}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className="flex items-center justify-between w-full px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-[#CD0000] border border-transparent rounded-lg hover:bg-slate-50 transition-colors"
        >
          <span>Events</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#CD0000]' : 'text-slate-400'
            }`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              role="menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden pl-4 pr-1 py-1 space-y-1"
            >
              {items.map((item) => (
                <Link
                  key={item.year}
                  href={item.href}
                  role="menuitem"
                  onClick={handleItemClick}
                  className="block px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-[#CD0000] hover:bg-slate-50 rounded-lg transition-colors"
                >
                  {item.year}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Desktop Popover Card (Matching the user screenshot style)
  return (
    <div
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-block ${className}`}
    >
      {/* Main Navigation Link Button - Keeps the exact standard Navbar style */}
      <button
        type="button"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls="events-dropdown-menu"
        id="events-dropdown-button"
        className={`text-xs font-bold uppercase tracking-wider transition-all px-4 py-2 rounded-full border flex items-center gap-1.5 cursor-pointer ${
          isEventsActive || isOpen
            ? 'text-[#CD0000] bg-[#CD0000]/5 border-[#CD0000]/15'
            : 'text-slate-600 hover:text-[#CD0000] border-transparent hover:bg-slate-900/5'
        }`}
      >
        <span>Events</span>
        <ChevronDown
          size={13}
          className={`transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#CD0000]' : 'text-slate-400'
          }`}
        />
      </button>

      {/* Popover Dropdown Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="events-dropdown-menu"
            role="menu"
            aria-labelledby="events-dropdown-button"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 mt-2 w-48 bg-white rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-900/5 p-2 z-50 overflow-hidden"
          >
            <div className="flex flex-col gap-0.5">
              {items.map((item) => (
                <Link
                  key={item.year}
                  href={item.href}
                  role="menuitem"
                  onClick={handleItemClick}
                  className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/60 rounded-xl transition-colors"
                >
                  {item.year}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventsDropdown;
