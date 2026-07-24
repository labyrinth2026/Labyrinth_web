"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, Lock, Loader2, Check, ArrowRight } from 'lucide-react';

export default function ResetPasswordPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simplified validation: min 6 characters and matching passwords
  const hasMinLength = newPassword.length >= 6;
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isFormValid = hasMinLength && passwordsMatch && currentPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, email: user?.email })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          if (user) {
            if (user.role === 'ADMIN') {
              router.push('/admin');
            } else {
              router.push('/access-denied');
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

  const inputClass = "w-full pl-10 pr-4 py-3 bg-white border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CD0000]/15 focus:border-[#CD0000] transition-all text-xs font-semibold placeholder:text-slate-400";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8FA] relative overflow-hidden font-inter pt-20 pb-12">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#CD0000]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-900/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <span className="inline-block px-3.5 py-1 rounded-full bg-red-50 border border-red-100 text-[#CD0000] text-[9px] font-black uppercase tracking-widest mb-4 shadow-xs">
            Security Onboarding
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-grotesk">
            RESET <span className="text-[#CD0000]">PASSWORD</span>
          </h1>
          <p className="text-slate-500 text-xs mt-2 font-medium">
            This is your first login. Please create a new personal password.
          </p>
        </div>

        {/* Card */}
        <div 
          className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl shadow-slate-100"
        >
          {success ? (
            <div className="text-center space-y-4 py-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Check size={28} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Password Changed!</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Marking onboarding complete. Redirecting to your dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 text-xs text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-start gap-2.5">
                  <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Temporary Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={14} />
                  </div>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Labyrinth@123"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={14} />
                  </div>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={14} />
                  </div>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-[10px] font-bold text-red-500 mt-1">Passwords do not match.</p>
              )}
              {newPassword.length > 0 && !hasMinLength && (
                <p className="text-[10px] font-bold text-red-500 mt-1">Password must be at least 6 characters long.</p>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting || !isFormValid}
                className="w-full mt-4 py-3.5 bg-[#CD0000] text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-[#A30000] transition-all disabled:opacity-40 flex items-center justify-center gap-2 group shadow-md shadow-red-100 cursor-pointer"
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
