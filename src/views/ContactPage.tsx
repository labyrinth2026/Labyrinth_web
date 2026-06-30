import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, MapPin, ExternalLink, GraduationCap, ArrowRight, Loader2
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import { SOCIAL_LINKS, FACULTY_CONTACT } from '../utils/constants';
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
        alert('Registrations are currently closed. Please check back later!');
      }
    } catch (error) {
      console.error('Failed to fetch forms', error);
      alert('Could not connect to the server. Please try again later.');
    } finally {
      setIsLoadingForm(false);
    }
  };

  return (
    <PageWrapper>
      {/* Header (Section 1: Warm White #EFEDE6) */}
      <section className="py-24 bg-[#EFEDE6] border-b border-[#B8B8B8]/20">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#CD0000]/5 border border-[#CD0000]/20 text-[#CD0000] text-xs font-bold uppercase tracking-widest mb-6">
              Connect With Us
            </span>
            <h1 className="font-grotesk text-5xl md:text-7xl font-black mb-6 text-[#121212] tracking-tighter leading-none">
              REACH OUT TO <span className="text-[#CD0000]">LABYRINTH</span>
            </h1>
            <p className="text-lg text-[#121212]/70 max-w-2xl mx-auto leading-relaxed">
              Have questions, want to collaborate, or looking to join the community? We're here.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section (Section 2: Charcoal Black #121212) */}
      <section className="py-24 bg-[#121212]">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

            {/* ── Left: Join Community Action ── */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="flex flex-col">
              <div className="bg-[#181818] border border-[#B8B8B8]/10 rounded-3xl p-8 md:p-10 flex-1 flex flex-col justify-center text-center">
                <div className="w-16 h-16 mx-auto bg-[#EFEDE6]/5 rounded-2xl flex items-center justify-center text-[#CD0000] mb-6">
                  <GraduationCap size={32} />
                </div>
                <h2 className="font-grotesk text-3xl font-black text-[#EFEDE6] mb-4 tracking-tight">Join Our Community</h2>
                <p className="text-[#B8B8B8] mb-8 max-w-sm mx-auto leading-relaxed">
                  Ready to be part of Christ University's premier Computer Science Club? Click below to fill out our official registration form.
                </p>
                <button
                  onClick={handleJoinClick}
                  disabled={isLoadingForm}
                  className="mx-auto flex items-center gap-2 px-8 py-4 bg-[#CD0000] text-[#EFEDE6] font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-[#A30000] transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100 shadow-md"
                >
                  {isLoadingForm ? (
                    <><Loader2 className="animate-spin" size={16} /> Please wait...</>
                  ) : (
                    <>Apply to Join <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
            </motion.div>

            {/* ── Right: Contact Info ── */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-6 flex flex-col justify-between">

              {/* Faculty Coordinator Card */}
              <div className="bg-[#CD0000] rounded-3xl p-8 text-[#EFEDE6] relative overflow-hidden group shadow-lg">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                      <GraduationCap size={24} className="text-[#EFEDE6]" />
                    </div>
                    <div>
                      <p className="text-[#EFEDE6]/70 text-[10px] font-black uppercase tracking-widest mb-1">Faculty Coordinator</p>
                      <h3 className="font-black text-white text-xl tracking-tight">Dr. Suresh Kumar</h3>
                    </div>
                  </div>
                  <p className="text-white/90 text-sm mb-1 font-semibold">Head Coordinator, Labyrinth</p>
                  <p className="text-white/70 text-xs mb-6">Professor, Dept. of Computer Science</p>
                  <a href="mailto:suresh@christ.edu" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[#EFEDE6] text-xs font-bold uppercase tracking-wider transition-colors border border-white/10">
                    <Mail size={14} /> suresh@christ.edu
                  </a>
                </div>
              </div>

              {/* Official Contact & Socials */}
              <div className="bg-[#181818] border border-[#B8B8B8]/10 rounded-3xl p-8 shadow-sm flex-1 flex flex-col justify-center">
                <h4 className="text-[10px] font-black text-[#B8B8B8] uppercase tracking-widest mb-6 border-b border-[#B8B8B8]/10 pb-3">Official Links & Info</h4>
                <div className="space-y-4">
                  <a href="mailto:labyrinth@christ.edu" className="flex items-center gap-4 text-[#B8B8B8] hover:text-[#CD0000] font-bold text-sm transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-[#EFEDE6]/5 flex items-center justify-center group-hover:bg-[#CD0000] group-hover:text-[#EFEDE6] transition-all">
                      <Mail size={18} />
                    </div>
                    labyrinth@christ.edu
                  </a>
                  
                  <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-4 text-[#B8B8B8] hover:text-[#CD0000] font-bold text-sm transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-[#EFEDE6]/5 flex items-center justify-center group-hover:bg-[#CD0000] group-hover:text-[#EFEDE6] transition-all">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                      </svg>
                    </div>
                    <span>@labyrinth_christuniversity</span>
                    <ExternalLink size={14} className="ml-auto opacity-40" />
                  </a>

                  <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-4 text-[#B8B8B8] hover:text-[#CD0000] font-bold text-sm transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-[#EFEDE6]/5 flex items-center justify-center group-hover:bg-[#CD0000] group-hover:text-[#EFEDE6] transition-all">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                        <rect x="2" y="9" width="4" height="12"/>
                        <circle cx="4" cy="4" r="2"/>
                      </svg>
                    </div>
                    <span>Labyrinth · Christ University</span>
                    <ExternalLink size={14} className="ml-auto opacity-40" />
                  </a>

                  <div className="flex items-start gap-4 pt-2">
                    <div className="w-10 h-10 rounded-xl bg-[#EFEDE6]/5 flex items-center justify-center shrink-0">
                      <MapPin size={18} className="text-[#CD0000]" />
                    </div>
                    <div className="text-xs text-[#B8B8B8] pt-1">
                      <p className="font-bold text-[#EFEDE6] mb-1">Department of Computer Science</p>
                      {FACULTY_CONTACT.location}
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default ContactPage;
