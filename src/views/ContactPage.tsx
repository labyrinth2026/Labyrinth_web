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
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-[rgba(11,31,99,0.03)] to-white">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block px-4 py-1 rounded-full bg-[rgba(11,31,99,0.03)] border border-[rgba(11,31,99,0.07)] text-[#0B1F63] text-xs font-bold uppercase tracking-widest mb-4">
              Connect With Us
            </span>
            <h1 className="font-grotesk text-5xl md:text-6xl font-bold mb-4 text-[#0B1F63]">
              Reach Out to <span className="text-[#0B1F63]">Labyrinth</span>
            </h1>
            <p className="text-lg text-[#667085] max-w-2xl mx-auto">
              Have questions, want to collaborate, or looking to join the community? We're here.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* ── Left: Join Community Action ── */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-col">
              <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-8 md:p-10 flex-1 flex flex-col justify-center text-center">
                <div className="w-16 h-16 mx-auto bg-[rgba(11,31,99,0.03)] rounded-2xl flex items-center justify-center text-[#0B1F63] mb-6">
                  <GraduationCap size={32} />
                </div>
                <h2 className="font-grotesk text-3xl font-bold text-[#0B1F63] mb-4">Join Our Community</h2>
                <p className="text-[#667085] mb-8 max-w-sm mx-auto">
                  Ready to be part of Christ University's premier Computer Science Club? Click below to fill out our official registration form.
                </p>
                <button
                  onClick={handleJoinClick}
                  disabled={isLoadingForm}
                  className="mx-auto flex items-center gap-2 px-8 py-4 bg-[#0B1F63] text-white font-bold rounded-xl hover:bg-[#071545] transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
                >
                  {isLoadingForm ? (
                    <><Loader2 className="animate-spin" size={20} /> Please wait...</>
                  ) : (
                    <>Apply to Join <ArrowRight size={20} /></>
                  )}
                </button>
              </div>
            </motion.div>

            {/* ── Right: Contact Info ── */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-6">

              {/* Faculty Coordinator Card */}
              <div className="bg-[#0B1F63] rounded-2xl p-8 text-white relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <p className="text-[#F4B400] text-xs font-bold uppercase tracking-wider mb-1">Faculty Coordinator</p>
                      <h3 className="font-bold text-white text-xl">Dr. Suresh Kumar</h3>
                    </div>
                  </div>
                  <p className="text-slate-200 text-sm mb-1">Head Coordinator, Labyrinth</p>
                  <p className="text-[#F4B400] text-xs mb-5">Professor, Dept. of Computer Science</p>
                  <a href="mailto:suresh@christ.edu" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-medium transition-colors">
                    <Mail size={16} /> suresh@christ.edu
                  </a>
                </div>
              </div>

              {/* Official Contact & Socials */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm">
                <h4 className="text-xs font-bold text-[#8c97a8] uppercase tracking-wider mb-5 border-b border-[#E5E7EB] pb-3">Official Links & Info</h4>
                <div className="space-y-4">
                  <a href="mailto:labyrinth@christ.edu" className="flex items-center gap-4 text-[#0B1F63] hover:text-[#071545] font-medium transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(11,31,99,0.03)] flex items-center justify-center group-hover:bg-[#0B1F63] group-hover:text-white transition-all">
                      <Mail size={18} />
                    </div>
                    labyrinth@christ.edu
                  </a>
                  
                  <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-4 text-[#667085] hover:text-[#0B1F63] transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(11,31,99,0.03)] flex items-center justify-center group-hover:bg-[#0B1F63] group-hover:text-white transition-all">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                      </svg>
                    </div>
                    <span className="font-medium">@labyrinth_christuniversity</span>
                    <ExternalLink size={14} className="ml-auto opacity-40" />
                  </a>

                  <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-4 text-[#667085] hover:text-[#0B1F63] transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(11,31,99,0.03)] flex items-center justify-center group-hover:bg-[#0B1F63] group-hover:text-white transition-all">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                        <rect x="2" y="9" width="4" height="12"/>
                        <circle cx="4" cy="4" r="2"/>
                      </svg>
                    </div>
                    <span className="font-medium">Labyrinth · Christ University</span>
                    <ExternalLink size={14} className="ml-auto opacity-40" />
                  </a>

                  <div className="flex items-start gap-4 pt-2">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(11,31,99,0.03)] flex items-center justify-center shrink-0">
                      <MapPin size={18} className="text-[#0B1F63]" />
                    </div>
                    <div className="text-sm text-[#667085] pt-1">
                      <p className="font-medium text-[#0B1F63] mb-1">Department of Computer Science</p>
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
