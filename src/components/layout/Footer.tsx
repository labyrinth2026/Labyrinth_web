"use client";

import React from 'react';
import Link from 'next/link';
import { Mail, MapPin } from 'lucide-react';
import { NAV_LINKS, SOCIAL_LINKS, CLUB_INFO, FACULTY_CONTACT } from '../../utils/constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#121212] border-t border-[#B8B8B8]/15 pt-16 pb-8 mt-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4 md:mb-6">
              <img src="/labyrinth-logo.png" alt="Labyrinth & Christ University" className="h-10 object-contain" />
            </div>
            <p className="text-[#B8B8B8] text-sm leading-relaxed">
              {CLUB_INFO.description}
            </p>
            <div className="flex gap-3 pt-2">
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[#EFEDE6] hover:bg-[#CD0000] hover:text-white transition-all"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[#EFEDE6] hover:bg-[#CD0000] hover:text-white transition-all"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              <a
                href={SOCIAL_LINKS.github}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[#EFEDE6] hover:bg-[#CD0000] hover:text-white transition-all"
                aria-label="GitHub"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a
                href={SOCIAL_LINKS.email}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[#EFEDE6] hover:bg-[#CD0000] hover:text-white transition-all"
                aria-label="Email"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[#EFEDE6] font-bold mb-5 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="text-[#B8B8B8] hover:text-[#CD0000] text-sm transition-colors hover:translate-x-0.5 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Verticals */}
          <div>
            <h4 className="text-[#EFEDE6] font-bold mb-5 text-sm uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2.5">
              {['AI Creator\'s Lab', 'CodeCraft', 'CipherGuard', 'GameNova', 'BitOps', 'Startovate'].map(v => (
                <li key={v}>
                  <Link href="/verticals" className="text-[#B8B8B8] hover:text-[#CD0000] text-sm transition-colors inline-block">
                    {v}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-[#EFEDE6] font-bold mb-5 text-sm uppercase tracking-wider">Connect</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-[#B8B8B8] text-sm">
                <MapPin size={14} className="shrink-0 mt-0.5 text-[#B8B8B8]/70" />
                <span>{FACULTY_CONTACT.location}</span>
              </div>
              <a href={SOCIAL_LINKS.email} className="flex items-center gap-2 text-[#B8B8B8] hover:text-[#CD0000] text-sm transition-colors">
                <Mail size={14} className="shrink-0 text-[#B8B8B8]/70" />
                labyrinth@cs.christuniversity.in
              </a>
              <div className="flex items-center gap-2 text-[#B8B8B8] text-sm">
                <Mail size={14} className="shrink-0 text-[#B8B8B8]/70" />
                dept.cs@christuniversity.in
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#B8B8B8]/20 flex flex-col items-center gap-3">
          <p className="text-[#B8B8B8] text-sm text-center">
            © {new Date().getFullYear()} {CLUB_INFO.name} · {CLUB_INFO.university}. All rights reserved.
          </p>
          <p className="text-[#B8B8B8]/60 text-xs mt-1 text-center">
            Made with ❤️ by Krupa M | 5 BSc Computer Science
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
