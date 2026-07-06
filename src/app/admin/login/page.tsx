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
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] relative overflow-hidden font-inter">
      {/* Background design elements */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[#CD0000]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#CD0000]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-grotesk uppercase">
            Admin Login
          </h1>
        </div>

        {/* Card Container */}
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-100/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 animate-shake">
                <ShieldAlert size={15} className="shrink-0 mt-0.5" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={14} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@cs.christuniversity.in"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CD0000]/10 focus:border-[#CD0000] transition-all text-xs font-semibold placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
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
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CD0000]/10 focus:border-[#CD0000] transition-all text-xs font-semibold placeholder:text-slate-400"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoggingIn || isLoading}
              className="w-full mt-6 py-3 bg-[#CD0000] text-white font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-[#A30000] transition-all disabled:opacity-50 flex items-center justify-center gap-2 group shadow-sm"
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
      </div>
    </div>
  );
}   </div>
  );
}
