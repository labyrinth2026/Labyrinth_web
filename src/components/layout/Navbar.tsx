"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS } from '../../utils/constants';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle body scroll locking and Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };

    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'backdrop-blur-md border-b border-slate-900/5 shadow-sm py-2.5 bg-white/70'
            : 'bg-transparent py-4 border-b border-transparent'
        }`}
      >
        <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
          {/* Left: Labyrinth Logo */}
          <Link href="/" className="flex items-center group relative z-50">
            <img src="/labyrinth-logo.png" alt="Labyrinth Logo" className="h-10 object-contain" />
          </Link>

          {/* Center: Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`text-xs font-bold uppercase tracking-wider transition-all px-4 py-2 rounded-full border ${
                    isActive
                      ? 'text-[#CD0000] bg-[#CD0000]/5 border-[#CD0000]/15'
                      : 'text-slate-600 hover:text-[#CD0000] border-transparent hover:bg-slate-900/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: CTA Button & Christ Logo */}
          <div className="hidden md:flex items-center gap-4 relative z-50">
            <Link
              href="/contact"
              className="px-5 py-2 bg-[#CD0000] text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-[#9E0000] transition-colors shadow-sm"
            >
              Join Us
            </Link>
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
            <img src="/christ-logo.png" alt="Christ University Logo" className="h-10 object-contain opacity-80" />
          </div>

          {/* Mobile Menu Toggle & Right Logo (Mobile) */}
          <div className="md:hidden flex items-center gap-3 relative z-50">
            <img src="/christ-logo.png" alt="Christ University Logo" className="h-8 object-contain opacity-80" />
            <button
              className="text-slate-700 p-2 rounded-lg hover:bg-slate-900/5 transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} className="text-slate-700" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-slate-900/20 backdrop-blur-xs md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeInOut' }}
            className="fixed top-0 left-0 bottom-0 w-[280px] bg-white border-r border-slate-200 z-[110] shadow-xl md:hidden flex flex-col overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            {/* Drawer Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <img src="/christ-logo.png" alt="Christ University Logo" className="h-7 object-contain" />
                <div className="w-px h-5 bg-slate-200"></div>
                <img src="/labyrinth-logo.png" alt="Labyrinth Logo" className="h-7 object-contain" />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-500 p-1.5 -mr-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <nav className="flex flex-col gap-1 p-4 shrink-0">
              {NAV_LINKS.map((link, i) => {
                const isActive = pathname === link.path;
                return (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={link.path}
                      className={`block text-xs font-bold uppercase tracking-wider px-4 py-3 rounded-lg border transition-all ${
                        isActive
                          ? 'text-[#CD0000] bg-[#CD0000]/5 border-[#CD0000]/10'
                          : 'text-slate-600 hover:text-[#CD0000] border-transparent hover:bg-slate-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Drawer Bottom CTA and Footer */}
            <div className="mt-auto p-6 shrink-0 border-t border-slate-100 bg-slate-50/50">
              <Link
                href="/contact"
                className="flex items-center justify-center w-full px-6 py-3 bg-[#CD0000] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#9E0000] transition-colors shadow-sm mb-4"
              >
                Join Community
              </Link>
              
              <div className="text-center pt-3">
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-0.5">
                  Labyrinth
                </p>
                <p className="text-[10px] text-slate-500">
                  Computer Science Club of
                  <br />Christ University
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
