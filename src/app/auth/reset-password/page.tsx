"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/utils/supabase';
import { ShieldAlert, Lock, Loader2, Check, X, ArrowRight } from 'lucide-react';

export default function ResetPasswordPage() {
  const { user, login } = useAuth();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation states
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecialChar = /[@$!%*?&]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const isFormValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar && passwordsMatch && currentPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError('');
    setIsSubmitting(true);

    try {
      // 1. POST to API to perform reset password
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, email: user?.email })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        // Refresh session using context
        setTimeout(() => {
          if (user) {
            if (['HOD', 'COORDINATOR', 'ASSOCIATE'].includes(user.role)) {
              router.push('/admin');
            } else if (user.role === 'CORE_HEAD') {
              router.push('/committee');
            } else if (user.role === 'VERTICAL_HEAD') {
              router.push('/vertical');
            }
          }
        }, 1500);
      } else {
        setError(data.error || 'Failed to update password. Make sure current password is correct.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validationItem = (label: string, valid: boolean) => (
    <div className="flex items-center gap-2 text-xs font-semibold">
      {valid ? (
        <span className="w-4 h-4 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
          <Check size={10} />
        </span>
      ) : (
        <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
          <X size={10} />
        </span>
      )}
      <span className={valid ? "text-green-400" : "text-slate-400"}>{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden font-inter">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#CD0000]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[#CD0000] text-[9px] font-black uppercase tracking-widest mb-4 shadow-sm">
            Security Onboarding
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-grotesk">
            RESET <span className="text-[#CD0000]">PASSWORD</span>
          </h1>
          <p className="text-slate-400 text-xs mt-2">
            This is your first login. Please create a new personal password.
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
          {success ? (
            <div className="text-center space-y-4 py-6">
              <div className="w-14 h-14 mx-auto rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400">
                <Check size={28} />
              </div>
              <h3 className="font-extrabold text-white text-lg">Password Changed!</h3>
              <p className="text-slate-400 text-xs">Marking onboarding complete. Redirecting you to your dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 text-xs text-red-400 bg-red-950/35 rounded-xl border border-red-900/40 flex items-start gap-2.5">
                  <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Temporary Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock size={14} />
                  </div>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Labyrinth@123"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CD0000]/25 focus:border-[#CD0000] transition-all text-xs font-semibold placeholder:text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock size={14} />
                  </div>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CD0000]/25 focus:border-[#CD0000] transition-all text-xs font-semibold placeholder:text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock size={14} />
                  </div>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CD0000]/25 focus:border-[#CD0000] transition-all text-xs font-semibold placeholder:text-slate-700"
                  />
                </div>
              </div>

              {/* Password strength checks */}
              <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-2xl space-y-2 text-left">
                <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Password Rules</span>
                {validationItem("Minimum 8 characters", hasMinLength)}
                {validationItem("One uppercase letter (A-Z)", hasUppercase)}
                {validationItem("One lowercase letter (a-z)", hasLowercase)}
                {validationItem("One numeric digit (0-9)", hasNumber)}
                {validationItem("One special character (@$!%*?&)", hasSpecialChar)}
                {validationItem("Passwords match", passwordsMatch)}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || !isFormValid}
                className="w-full mt-4 py-3.5 bg-[#CD0000] text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-[#A30000] transition-all disabled:opacity-30 flex items-center justify-center gap-2 group shadow-md shadow-red-950/30 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    Resetting...
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
