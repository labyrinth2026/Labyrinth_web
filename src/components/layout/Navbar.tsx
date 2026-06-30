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
            ? 'bg-[#121212]/95 backdrop-blur-md border-b border-[#B8B8B8]/20 shadow-lg py-3'
            : 'bg-[#121212] py-4 border-b border-[#B8B8B8]/10'
        }`}
      >
        <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
          {/* Left: Labyrinth Logo */}
          <Link href="/" className="flex items-center group relative z-50">
            <img src="/labyrinth-logo.png" alt="Labyrinth Logo" className="h-12 object-contain" />
          </Link>

          {/* Center: Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`text-sm font-semibold transition-all px-4 py-2 rounded-full relative ${
                    isActive
                      ? 'text-[#EFEDE6] bg-[#CD0000]'
                      : 'text-[#B8B8B8] hover:text-[#EFEDE6] hover:bg-white/5'
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
              className="px-5 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-full hover:bg-[#A30000] transition-colors shadow-md"
            >
              Join Us
            </Link>
            <div className="h-8 w-px bg-[#B8B8B8]/20 hidden sm:block"></div>
            <img src="/christ-logo.png" alt="Christ University Logo" className="h-12 object-contain brightness-0 invert" />
          </div>

          {/* Mobile Menu Toggle & Right Logo (Mobile) */}
          <div className="md:hidden flex items-center gap-3 relative z-50">
            <img src="/christ-logo.png" alt="Christ University Logo" className="h-10 object-contain brightness-0 invert" />
            <button
              className="text-[#EFEDE6] p-2 rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} className="text-[#EFEDE6]" />
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
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm md:hidden"
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
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 left-0 bottom-0 w-[280px] sm:w-[320px] bg-[#121212] border-r border-[#B8B8B8]/10 z-[110] shadow-2xl md:hidden flex flex-col overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            {/* Drawer Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-[#B8B8B8]/10 shrink-0">
              <div className="flex items-center gap-3">
                <img src="/christ-logo.png" alt="Christ University Logo" className="h-8 object-contain brightness-0 invert" />
                <div className="w-px h-6 bg-[#B8B8B8]/20"></div>
                <img src="/labyrinth-logo.png" alt="Labyrinth Logo" className="h-8 object-contain" />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#B8B8B8] p-1.5 -mr-1.5 rounded-lg hover:bg-white/5 hover:text-[#EFEDE6] transition-colors"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <nav className="flex flex-col gap-1 p-4 shrink-0">
              {NAV_LINKS.map((link, i) => {
                const isActive = pathname === link.path;
                return (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.path}
                      className={`block text-[15px] font-bold px-4 py-3.5 rounded-xl transition-all ${
                        isActive
                          ? 'text-[#EFEDE6] bg-[#CD0000] border border-[#CD0000]/10'
                          : 'text-[#B8B8B8] hover:text-[#EFEDE6] hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Drawer Bottom CTA and Footer */}
            <div className="mt-auto p-6 shrink-0">
              <Link
                href="/contact"
                className="flex items-center justify-center w-full px-6 py-3.5 bg-[#CD0000] text-white font-bold rounded-xl hover:bg-[#A30000] transition-colors shadow-md mb-6"
              >
                Join Community
              </Link>
              
              <div className="text-center pt-5 border-t border-[#B8B8B8]/10">
                <p className="text-[11px] font-semibold text-[#EFEDE6] uppercase tracking-wider mb-1">
                  Labyrinth
                </p>
                <p className="text-[11px] text-[#B8B8B8]">
                  The Computer Science Club of
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
