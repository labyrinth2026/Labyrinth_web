import React, { useState } from 'react';
import {
  Mail, MapPin, ExternalLink, GraduationCap, ArrowRight, Loader2
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import { SOCIAL_LINKS, FACULTY_CONTACT } from '../utils/constants';
import ScrollReveal from '../components/ui/ScrollReveal';
import { fetchFromSheet } from '../services/api';

const ContactPage: React.FC = () => {
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  const handleJoinClick = async () => {
    setIsLoadingForm(true);
    try {
      const data: any = await fetchFromSheet('getForms');
      const formsArray = Object.values(data) as any[];
      const joinForm = formsArray.find(f => f.id === 'join_community');
      
      if (joinForm && joinForm.active && joinForm.url) {
        window.open(joinForm.url, '_blank', 'noopener,noreferrer');
      } else {
        window.open('https://forms.gle/vzHppHwu2C977eNA7', '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Failed to fetch forms', error);
      window.open('https://forms.gle/vzHppHwu2C977eNA7', '_blank', 'noopener,noreferrer');
    } finally {
      setIsLoadingForm(false);
    }
  };

  return (
    <PageWrapper>
      {/* Header (Section 1: Off-White) */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <ScrollReveal animation="fade">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-6">
              Connect With Us
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-slate-900 tracking-tight leading-tight">
              REACH OUT TO <span className="text-[#CD0000]">LABYRINTH</span>
            </h1>
            <p className="text-slate-500 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed font-semibold">
              Have questions, want to collaborate, or looking to join the community? We're here.
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
                  <button
                    onClick={handleJoinClick}
                    disabled={isLoadingForm}
                    className="mx-auto flex items-center gap-2 px-6 py-3 bg-[#CD0000] text-white font-bold uppercase tracking-wider text-[10px] rounded-full hover:bg-[#9E0000] transition-all hover:scale-102 active:scale-98 disabled:opacity-75 shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CD0000] focus-visible:ring-offset-2"
                  >
                    {isLoadingForm ? (
                      <><Loader2 className="animate-spin" size={13} /> Please wait...</>
                    ) : (
                      <>Apply to Join <ArrowRight size={13} /></>
                    )}
                  </button>
                </div>
              </div>
            </ScrollReveal>

            {/* ── Right: Contact Info ── */}
            <ScrollReveal animation="slide-left">
              <div className="space-y-6 flex flex-col justify-between h-full">

                {/* Faculty Coordinator Card */}
                <div className="bg-slate-900 border border-slate-900 rounded-2xl p-8 text-white relative overflow-hidden group shadow-sm flex flex-col justify-center hover:scale-[1.015] hover:-translate-y-1 hover:shadow-md hover:shadow-white/[0.01] transition-all duration-300">
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <GraduationCap size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest mb-0.5">Faculty Coordinator</p>
                        <h3 className="font-bold text-white text-lg tracking-tight">Dr. Suresh Kumar</h3>
                      </div>
                    </div>
                    <p className="text-slate-200 text-xs mb-0.5 font-bold">Head Coordinator, Labyrinth</p>
                    <p className="text-slate-400 text-[10px] mb-5">Professor, Dept. of Computer Science</p>
                    <a href="mailto:suresh@christ.edu" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-full text-white text-[10px] font-bold uppercase tracking-wider transition-colors border border-white/5">
                      <Mail size={12} /> suresh@christ.edu
                    </a>
                  </div>
                </div>

                {/* Official Contact & Socials */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs flex-1 flex flex-col justify-center hover:scale-[1.015] hover:-translate-y-1 hover:shadow-md hover:shadow-[#CD0000]/[0.01] transition-all duration-300">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-3">Official Links &amp; Info</h4>
                  <div className="space-y-4">
                    <a href="mailto:labyrinth@christ.edu" className="flex items-center gap-3.5 text-slate-600 hover:text-[#CD0000] font-bold text-xs transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/40 flex items-center justify-center group-hover:bg-[#CD0000] group-hover:text-white transition-all">
                        <Mail size={14} />
                      </div>
                      labyrinth@christ.edu
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
    </PageWrapper>
  );
};

export default ContactPage;
