"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function UnifiedLoginPage() {
  const { user, login, isLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Auto redirection helper
  const handleRedirect = (role: string) => {
    if (role === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/access-denied');
    }
  };

  useEffect(() => {
    if (user && !isLoading) {
      if (user.firstLogin) {
        router.push('/auth/reset-password');
      } else {
        handleRedirect(user.role);
      }
    }
  }, [user, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      const result = await login(email, password);
      if (result.success && result.user) {
        if (result.mustReset) {
          router.push('/auth/reset-password');
        } else {
          handleRedirect(result.user.role);
        }
      } else {
        setError(result.error || 'Invalid credentials or access denied.');
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] relative overflow-hidden font-inter">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#CD0000]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#CD0000]/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-grotesk">
            SECURE <span className="text-[#CD0000]">LOGIN</span>
          </h1>
          <p className="text-slate-500 text-xs mt-2 font-medium">
            Enter your credentials to access your club workspace.
          </p>
        </div>

        {/* Card */}
        <div 
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            background: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid rgba(228, 228, 231, 0.8)',
            boxShadow: '0 20px 40px -15px rgba(9, 9, 11, 0.05)'
          }}
          className="p-8 rounded-3xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 text-xs text-red-600 bg-red-50 rounded-xl border border-red-200 flex items-start gap-2.5">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={14} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="student@cs.christuniversity.in"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CD0000]/10 focus:border-[#CD0000] transition-all text-xs font-semibold placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={14} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CD0000]/10 focus:border-[#CD0000] transition-all text-xs font-semibold placeholder:text-slate-400"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoggingIn || isLoading}
              className="w-full mt-4 py-3.5 bg-[#CD0000] text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-[#A30000] transition-all disabled:opacity-50 flex items-center justify-center gap-2 group shadow-md shadow-red-100/80"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  Verifying...
                </>
              ) : (
                <>
                  Enter Dashboard
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
