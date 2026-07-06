"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Mail, Lock, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const { user, login, logout, isLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // If user is already logged in as ADMIN, redirect to dashboard.
  // If logged in but not ADMIN, force logout.
  useEffect(() => {
    if (user && !isLoading) {
      if (user.role === 'ADMIN') {
        if (user.firstLogin) {
          router.push('/auth/reset-password');
        } else {
          router.push('/admin/dashboard');
        }
      } else {
        // Force log out any non-admin who somehow bypasses
        logout();
        setError('Unauthorized Access');
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
        if (result.user.role === 'ADMIN') {
          if (result.mustReset) {
            router.push('/auth/reset-password');
          } else {
            router.push('/admin/dashboard');
          }
        } else {
          // Double check role client-side
          await logout();
          setError('Unauthorized Access');
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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden font-inter">
      {/* Dynamic background lights */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#CD0000]/10 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#CD0000]/5 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo and title */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-[#CD0000]/10 border border-[#CD0000]/30 flex items-center justify-center mb-4 text-[#CD0000] shadow-lg shadow-red-950/20">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-grotesk">
            LABYRINTH <span className="text-[#CD0000]">CMS</span>
          </h1>
          <p className="text-slate-400 text-xs mt-2 font-medium">
            Enter administrator credentials to manage portal.
          </p>
        </div>

        {/* Card */}
        <div 
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            background: 'rgba(15, 23, 42, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
          className="p-8 rounded-3xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 text-xs text-red-400 bg-red-950/40 rounded-xl border border-red-900/50 flex items-start gap-2.5 animate-shake">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail size={14} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@cs.christuniversity.in"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CD0000]/20 focus:border-[#CD0000] transition-all text-xs font-semibold placeholder:text-slate-500"
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
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CD0000]/20 focus:border-[#CD0000] transition-all text-xs font-semibold placeholder:text-slate-500"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoggingIn || isLoading}
              className="w-full mt-6 py-3.5 bg-[#CD0000] text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-[#A30000] transition-all disabled:opacity-50 flex items-center justify-center gap-2 group shadow-lg shadow-red-950/50"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  Verifying...
                </>
              ) : (
                <>
                  Access Admin Workspace
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to public site */}
        <div className="text-center mt-6">
          <a href="/" className="text-xs text-slate-500 hover:text-slate-300 font-semibold transition-colors">
            ← Back to Public Website
          </a>
        </div>
      </div>
    </div>
  );
}
