"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, CheckCircle2, ShieldCheck, Loader2, Sparkles, 
  User, Mail, Hash, BookOpen, Send, AlertCircle, ChevronDown
} from 'lucide-react';
import Stack from '@/components/ui/Stack';

export default function JoinCommunityPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    regNumber: '',
    email: '',
    departmentClass: '',
    primaryVertical: '',
    secondaryVertical: '',
    statementOfPurpose: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submitJoinForm',
          payload: {
            applicantName: formData.fullName,
            applicantEmail: formData.email,
            regNumber: formData.regNumber,
            departmentClass: formData.departmentClass,
            primaryVertical: formData.primaryVertical,
            secondaryVertical: formData.secondaryVertical,
            statementOfPurpose: formData.statementOfPurpose,
            submittedAt: new Date().toISOString()
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsSubmitted(true);
      } else {
        const fallbackRes = await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'submitFormResponse',
            payload: {
              formId: 'join_community',
              applicantName: formData.fullName,
              applicantEmail: formData.email,
              answers: formData
            }
          })
        });
        const fallbackData = await fallbackRes.json();
        if (fallbackData.success) {
          setIsSubmitted(true);
        } else {
          setErrorMessage(fallbackData.error || data.error || 'Submission failed. Please try again.');
        }
      }
    } catch {
      setErrorMessage('Connection error. Please check your internet and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase =
    'w-full border border-slate-700/80 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-slate-400 bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-[#CD0000] focus:border-[#CD0000] transition-all';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col font-sans selection:bg-[#CD0000] selection:text-white">
      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Back to Labyrinth
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#CD0000] animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-slate-300 uppercase">
              Community Recruitment 2026-27
            </span>
          </div>
        </div>
      </header>

      {/* ── Hero Banner ── */}
      <section className="py-20 px-6 text-center border-b border-white/10 bg-[#0f0f17]">
        <div className="max-w-4xl mx-auto space-y-5">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#CD0000]/15 border border-[#CD0000]/40 text-[#CD0000] text-xs font-black uppercase tracking-widest">
            <Sparkles size={14} /> Official Membership Application
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase leading-none">
            JOIN THE <span className="text-[#CD0000]">LABYRINTH</span> COMMUNITY
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Explore our 10 Verticals across Technical, Non-Technical, and Research domains as you scroll down the page below, then complete your membership application.
          </p>
          
          <div className="pt-4 flex justify-center">
            <a
              href="#application-form"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#CD0000] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#A30000] transition-all shadow-lg shadow-red-950/50"
            >
              Skip to Form <ChevronDown size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* ── Page Section 1: ScrollStack Verticals Showcase ── */}
      <section className="py-8 w-full">
        <div className="text-center mb-6 px-4">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest font-bold">Domain Breakdown</span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white mt-1">
            Our 10 Verticals
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Scroll down to watch each vertical card slide up and overlay as you explore our domains
          </p>
        </div>

        {/* Verticals Sticky Overlay Stack */}
        <Stack />
      </section>

      {/* ── Page Section 2: Registration Form ── */}
      <section id="application-form" className="py-16 px-4 sm:px-6 bg-[#0f0f17] border-t border-white/10">
        <div className="max-w-3xl mx-auto">
          
          {isSubmitted ? (
            <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-10 text-center space-y-6 shadow-2xl">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 size={44} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white uppercase tracking-wide">
                  Application Submitted!
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed max-w-lg mx-auto">
                  Thank you <strong className="text-white">{formData.fullName}</strong>. Your membership response for Labyrinth 2026-27 has been successfully recorded.
                </p>
              </div>

              <div className="p-6 bg-slate-950 rounded-2xl border border-white/10 text-left text-xs space-y-2 text-slate-300 max-w-md mx-auto">
                <p><strong className="text-white uppercase font-bold">Selected Primary Vertical:</strong> {formData.primaryVertical || 'General'}</p>
                {formData.secondaryVertical && (
                  <p><strong className="text-white uppercase font-bold">Secondary Vertical:</strong> {formData.secondaryVertical}</p>
                )}
                <p><strong className="text-white uppercase font-bold">Email:</strong> {formData.email}</p>
                <p><strong className="text-white uppercase font-bold">Register No:</strong> {formData.regNumber}</p>
              </div>

              <button
                onClick={() => router.push('/')}
                className="px-8 py-3.5 bg-[#CD0000] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#A30000] transition-all shadow-lg"
              >
                Return to Home Page
              </button>
            </div>
          ) : (
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
              <div className="border-b border-white/10 pb-6 text-center">
                <span className="text-xs font-mono text-[#CD0000] uppercase tracking-widest font-black">Official Application</span>
                <h2 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight mt-1">
                  Membership Registration Form
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-2">
                  Complete your details below to register for Labyrinth 2026-27.
                </p>
              </div>

              {errorMessage && (
                <div className="p-4 bg-red-500/15 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-3">
                  <AlertCircle size={18} className="shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                      Full Name <span className="text-[#CD0000]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="fullName"
                        required
                        placeholder="e.g. Alex Thomas"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={inputBase}
                      />
                      <User size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Register Number */}
                  <div>
                    <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                      Register Number <span className="text-[#CD0000]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="regNumber"
                        required
                        placeholder="e.g. 24110000"
                        value={formData.regNumber}
                        onChange={handleChange}
                        className={inputBase}
                      />
                      <Hash size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Christ Email */}
                  <div>
                    <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                      Christ Email Address <span className="text-[#CD0000]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="student@cs.christuniversity.in"
                        value={formData.email}
                        onChange={handleChange}
                        className={inputBase}
                      />
                      <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Course / Class */}
                  <div>
                    <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                      Course / Class &amp; Year <span className="text-[#CD0000]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="departmentClass"
                        required
                        placeholder="e.g. 2 BCA, 1 MCA, 3 BTech CS"
                        value={formData.departmentClass}
                        onChange={handleChange}
                        className={inputBase}
                      />
                      <BookOpen size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Primary Vertical Choice */}
                <div>
                  <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                    Primary Vertical Choice <span className="text-[#CD0000]">*</span>
                  </label>
                  <select
                    name="primaryVertical"
                    required
                    value={formData.primaryVertical}
                    onChange={handleChange}
                    className={`${inputBase} bg-slate-800 text-white cursor-pointer`}
                  >
                    <option value="">Select your primary vertical preference...</option>
                    <optgroup label="Technical Domains">
                      <option value="AI HUB (Artificial Intelligence)">AI HUB (Artificial Intelligence)</option>
                      <option value="DevZen (Development)">DevZen (Development)</option>
                      <option value="AutoBot (Robotics & IoT)">AutoBot (Robotics & IoT)</option>
                      <option value="InsightX (Data Analytics)">InsightX (Data Analytics)</option>
                    </optgroup>
                    <optgroup label="Non-Technical Domains">
                      <option value="FieldOps (Sports)">FieldOps (Sports)</option>
                      <option value="Debate (Public Speaking & Critical Thinking)">Debate (Public Speaking & Critical Thinking)</option>
                      <option value="Startovate (Entrepreneurship)">Startovate (Entrepreneurship)</option>
                      <option value="InterVerse (Collaboration)">InterVerse (Collaboration)</option>
                      <option value="Peer-to-Peer (Peer Learning)">Peer-to-Peer (Peer Learning)</option>
                    </optgroup>
                    <optgroup label="Research Domain">
                      <option value="Research">Research</option>
                    </optgroup>
                  </select>
                </div>

                {/* Secondary Vertical Choice */}
                <div>
                  <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                    Secondary Vertical Choice <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <select
                    name="secondaryVertical"
                    value={formData.secondaryVertical}
                    onChange={handleChange}
                    className={`${inputBase} bg-slate-800 text-white cursor-pointer`}
                  >
                    <option value="">Select backup vertical choice (optional)...</option>
                    <optgroup label="Technical Domains">
                      <option value="AI HUB (Artificial Intelligence)">AI HUB (Artificial Intelligence)</option>
                      <option value="DevZen (Development)">DevZen (Development)</option>
                      <option value="AutoBot (Robotics & IoT)">AutoBot (Robotics & IoT)</option>
                      <option value="InsightX (Data Analytics)">InsightX (Data Analytics)</option>
                    </optgroup>
                    <optgroup label="Non-Technical Domains">
                      <option value="FieldOps (Sports)">FieldOps (Sports)</option>
                      <option value="Debate (Public Speaking & Critical Thinking)">Debate (Public Speaking & Critical Thinking)</option>
                      <option value="Startovate (Entrepreneurship)">Startovate (Entrepreneurship)</option>
                      <option value="InterVerse (Collaboration)">InterVerse (Collaboration)</option>
                      <option value="Peer-to-Peer (Peer Learning)">Peer-to-Peer (Peer Learning)</option>
                    </optgroup>
                    <optgroup label="Research Domain">
                      <option value="Research">Research</option>
                    </optgroup>
                  </select>
                </div>

                {/* Statement of Purpose */}
                <div>
                  <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                    Why do you want to join Labyrinth? <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    name="statementOfPurpose"
                    rows={4}
                    placeholder="Tell us about your technical or non-technical goals and what you hope to contribute..."
                    value={formData.statementOfPurpose}
                    onChange={handleChange}
                    className={`${inputBase} resize-none`}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-4 px-8 bg-[#CD0000] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#A30000] transition-all shadow-xl shadow-red-950/60 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <><Loader2 size={18} className="animate-spin" /> Submitting Application...</>
                  ) : (
                    <><Send size={16} /> Submit Membership Application</>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-400 font-medium">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  Verified official recruitment form for Labyrinth 2026-27
                </div>
              </form>
            </div>
          )}

        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 text-center border-t border-white/10 text-xs text-slate-500">
        Labyrinth · Department of Computer Science, CHRIST (Deemed to be University)
      </footer>
    </div>
  );
}
