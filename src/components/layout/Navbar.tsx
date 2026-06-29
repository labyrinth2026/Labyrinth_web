import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS } from '../../utils/constants';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
            ? 'bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-sm py-3'
            : 'bg-white py-4 border-b border-blue-50'
        }`}
      >
        <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
          {/* Left: Labyrinth Logo */}
          <NavLink to="/" className="flex items-center group relative z-50">
            <img src="/labyrinth-logo.png" alt="Labyrinth Logo" className="h-12 object-contain" />
          </NavLink>

          {/* Center: Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-semibold transition-all px-4 py-2 rounded-full relative ${
                    isActive
                      ? 'text-[#005BAC] bg-[#EAF4FF]'
                      : 'text-[#4b6080] hover:text-[#005BAC] hover:bg-[#EAF4FF]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right: CTA Button & Christ Logo */}
          <div className="hidden md:flex items-center gap-4 relative z-50">
            <NavLink
              to="/contact"
              className="px-5 py-2 bg-[#005BAC] text-white text-sm font-semibold rounded-full hover:bg-[#004a8f] transition-colors shadow-sm"
            >
              Join Us
            </NavLink>
            <div className="h-8 w-px bg-blue-100 hidden sm:block"></div>
            <img src="/christ-logo.png" alt="Christ University Logo" className="h-12 object-contain" />
          </div>

          {/* Mobile Menu Toggle & Right Logo (Mobile) */}
          <div className="md:hidden flex items-center gap-3 relative z-50">
            <img src="/christ-logo.png" alt="Christ University Logo" className="h-10 object-contain" />
            <button
              className="text-[#005BAC] p-2 rounded-lg hover:bg-[#EAF4FF] transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
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
            className="fixed inset-0 z-[100] bg-[#1a2c4a]/50 backdrop-blur-sm md:hidden"
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
            className="fixed top-0 left-0 bottom-0 w-[280px] sm:w-[320px] bg-white z-[110] shadow-2xl md:hidden flex flex-col overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            {/* Drawer Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-blue-100 shrink-0">
              <div className="flex items-center gap-3">
                <img src="/christ-logo.png" alt="Christ University Logo" className="h-8 object-contain" />
                <div className="w-px h-6 bg-blue-100"></div>
                <img src="/labyrinth-logo.png" alt="Labyrinth Logo" className="h-8 object-contain" />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#4b6080] p-1.5 -mr-1.5 rounded-lg hover:bg-[#EAF4FF] hover:text-[#005BAC] transition-colors"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <nav className="flex flex-col gap-1 p-4 shrink-0">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `block text-[15px] font-bold px-4 py-3.5 rounded-xl transition-all ${
                        isActive
                          ? 'text-[#005BAC] bg-[#EAF4FF] border border-[#005BAC]/10'
                          : 'text-[#4b6080] hover:text-[#005BAC] hover:bg-[#EAF4FF] border border-transparent'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
            </nav>

            {/* Drawer Bottom CTA and Footer */}
            <div className="mt-auto p-6 shrink-0">
              <NavLink
                to="/contact"
                className="flex items-center justify-center w-full px-6 py-3.5 bg-[#005BAC] text-white font-bold rounded-xl hover:bg-[#004a8f] transition-colors shadow-md shadow-blue-900/10 mb-6"
              >
                Join Community
              </NavLink>
              
              <div className="text-center pt-5 border-t border-blue-50">
                <p className="text-[11px] font-semibold text-[#7a90aa] uppercase tracking-wider mb-1">
                  Labyrinth
                </p>
                <p className="text-[11px] text-[#7a90aa]">
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
