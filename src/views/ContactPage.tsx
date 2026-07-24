import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Mail, MapPin, ExternalLink, GraduationCap, ArrowRight
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import { SOCIAL_LINKS, FACULTY_CONTACT } from '../utils/constants';
import ScrollReveal from '../components/ui/ScrollReveal';

const ContactPage: React.FC = () => {
  return (
    <PageWrapper>
      {/* Header with background image */}
      <section className="relative py-32 bg-white border-b border-slate-100 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/gallery/inauguration_all_10.webp"
            alt="Labyrinth community gathering"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-white/80" />
        </div>
        <div className="container mx-auto px-6 max-w-5xl text-center relative z-10">
          <ScrollReveal animation="fade">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-6">
              Connect With Us
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-slate-900 tracking-tight leading-tight">
              REACH OUT TO <span className="text-[#CD0000]">LABYRINTH</span>
            </h1>
            <p className="text-slate-600 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed font-semibold">
              Have questions, want to collaborate, or looking to join the community? We&apos;re here.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Content Section (Section 2: Off-White) */}
      <section className="py-24 bg-slate-50/50">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

            {/* ── Left: Join Community Action ── */}
            <ScrollReveal animation="slide-right">
              <div className="flex flex-col h-full">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-8 md:p-10 flex-1 flex flex-col justify-center text-center shadow-xs">
                  <div className="w-12 h-12 mx-auto bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-center text-[#CD0000] mb-6">
                    <GraduationCap size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Join Our Community</h2>
                  <p className="text-slate-500 text-xs mb-8 max-w-sm mx-auto leading-relaxed">
                    Ready to be part of Christ University's premier Computer Science Club? Click below to fill out our official registration form.
                  </p>
                  <Link
                    href="/forms/join-community"
                    className="mx-auto flex items-center gap-2 px-6 py-3 bg-[#CD0000] text-white font-bold uppercase tracking-wider text-[10px] rounded-full hover:bg-[#9E0000] transition-all hover:scale-102 active:scale-98 shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CD0000] focus-visible:ring-offset-2"
                  >
                    Apply to Join <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </ScrollReveal>

            {/* ── Right: Contact Info ── */}
            <ScrollReveal animation="slide-left">
              <div className="space-y-6 flex flex-col justify-between h-full">

                {/* Faculty Coordinators Card */}
                <div
                  className="rounded-2xl p-8 flex flex-col justify-center hover:scale-[1.015] hover:-translate-y-1 transition-all duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.65)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06), 0 1px 3px 0 rgba(0,0,0,0.04)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0">
                      <GraduationCap size={20} className="text-[#CD0000]" />
                    </div>
                    <div>
                      <p className="text-[#6B7280] text-[8px] font-black uppercase tracking-widest mb-0.5">Faculty Coordinators</p>
                      <p className="text-[#6B7280] text-[10px]">Department of Computer Science</p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { name: 'Dr. Amrutha K', url: 'https://christuniversity.in/computer-science/faculty-details/NzE0Mg==/NjI=' },
                      { name: 'Dr. Binayak Dutta', url: 'https://christuniversity.in/computer-science/faculty-details/ODc2OQ==/NjI=' },
                    ].map(({ name, url }) => (
                      <a
                        key={name}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group/item"
                        style={{
                          background: '#F5F5F7',
                          border: '1px solid #E5E7EB',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.background = '#ECECEC';
                          (e.currentTarget as HTMLElement).style.borderColor = '#CD0000';
                          (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                          (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.07)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = '#F5F5F7';
                          (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB';
                          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                        }}
                      >
                        <span className="text-[#1F2937] text-xs font-semibold">{name}</span>
                        <ExternalLink size={12} className="text-[#CD0000] shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Official Contact & Socials */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs flex-1 flex flex-col justify-center hover:scale-[1.015] hover:-translate-y-1 hover:shadow-md hover:shadow-[#CD0000]/[0.01] transition-all duration-300">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-3">Official Links &amp; Info</h4>
                  <div className="space-y-4">
                    <a href={SOCIAL_LINKS.email} className="flex items-center gap-3.5 text-slate-600 hover:text-[#CD0000] font-bold text-xs transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/40 flex items-center justify-center group-hover:bg-[#CD0000] group-hover:text-white transition-all">
                        <Mail size={14} />
                      </div>
                      labyrinth.christ@christuniversity.in
                    </a>
                    
                    <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-3.5 text-slate-600 hover:text-[#CD0000] font-bold text-xs transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/40 flex items-center justify-center group-hover:bg-[#CD0000] group-hover:text-white transition-all">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                        </svg>
                      </div>
                      <span>@labyrinth_christuniversity</span>
                      <ExternalLink size={12} className="ml-auto opacity-30 group-hover:opacity-100 transition-opacity" />
                    </a>

                    <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3.5 text-slate-600 hover:text-[#CD0000] font-bold text-xs transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/40 flex items-center justify-center group-hover:bg-[#CD0000] group-hover:text-white transition-all">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                          <rect x="2" y="9" width="4" height="12"/>
                          <circle cx="4" cy="4" r="2"/>
                        </svg>
                      </div>
                      <span>Labyrinth · Christ University</span>
                      <ExternalLink size={12} className="ml-auto opacity-30 group-hover:opacity-100 transition-opacity" />
                    </a>

                    <div className="flex items-start gap-3.5 pt-2 border-t border-slate-100">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/40 flex items-center justify-center shrink-0">
                        <MapPin size={14} className="text-[#CD0000]" />
                      </div>
                      <div className="text-[11px] text-slate-500 pt-0.5">
                        <p className="font-bold text-slate-800 mb-0.5">Department of Computer Science</p>
                        {FACULTY_CONTACT.location}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Community photo strip */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-7xl">
          <ScrollReveal animation="fade">
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-8">Life at Labyrinth</p>
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {[
                { src: '/gallery/20260212_181054.webp', alt: 'Sports event at Labyrinth' },
                { src: '/gallery/inauguration_all_3.webp', alt: 'Labyrinth inauguration event' },
                { src: '/gallery/peer_edu_all_3.webp', alt: 'Peer education session at Labyrinth' },
              ].map(img => (
                <div key={img.src} className="relative rounded-2xl overflow-hidden shadow-sm bg-slate-100" style={{aspectRatio: '4/3'}}>
                  <Image src={img.src} alt={img.alt} fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 33vw, 25vw" />
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </PageWrapper>
  );
};

export default ContactPage;
