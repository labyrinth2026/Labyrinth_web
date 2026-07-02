"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function VerticalHeadLoginPage() {
  const { user, login, isLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (user && user.role === 'VERTICAL_HEAD') {
      router.push('/vertical-head/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    const result = await login(email, password, 'vertical');
    if (result.success) {
      router.push('/vertical-head/dashboard');
    } else {
      setError(result.error || 'Invalid credentials or access denied.');
    }
    setIsLoggingIn(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden font-inter">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Title */}
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[#CD0000] text-[9px] font-black uppercase tracking-widest mb-4 shadow-sm">
            Vertical Head Portal
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-grotesk">
            VERTICAL <span className="text-[#CD0000]">LOGIN</span>
          </h1>
          <p className="text-slate-400 text-xs mt-2">
            Portal for Vertical Heads to manage their designated domain and learning resources.
          </p>
        </div>

        {/* Card */}
        <div 
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            background: 'rgba(15, 23, 42, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
          className="p-8 rounded-3xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 text-xs text-red-400 bg-red-950/35 rounded-xl border border-red-900/40 flex items-start gap-2.5">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail size={14} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@labyrinth.club"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CD0000]/25 focus:border-[#CD0000] transition-all text-xs font-semibold placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock size={14} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CD0000]/25 focus:border-[#CD0000] transition-all text-xs font-semibold placeholder:text-slate-600"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoggingIn || isLoading}
              className="w-full mt-4 py-3.5 bg-[#CD0000] text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-[#A30000] transition-all disabled:opacity-50 flex items-center justify-center gap-2 group shadow-md shadow-red-950/30"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  Verifying...
                </>
              ) : (
                <>
                  Enter Portal
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
