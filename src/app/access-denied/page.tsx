"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AccessDeniedPage() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] relative overflow-hidden font-inter">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#CD0000]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#CD0000]/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-4 text-center">
        {/* Shield Icon */}
        <div className="inline-flex p-4 rounded-3xl bg-red-50 border border-red-100 text-[#CD0000] mb-6 shadow-sm shadow-red-100">
          <ShieldAlert size={40} />
        </div>

        {/* Header */}
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          ACCESS <span className="text-[#CD0000]">DENIED</span>
        </h1>
        <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
          Your account is registered but does not have dashboard access privileges. Portal access is restricted to Administrators only.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link 
            href="/"
            className="w-full py-3.5 bg-white border border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px] rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center justify-center gap-2 group shadow-sm"
          >
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Home Page
          </Link>

          <button 
            onClick={handleLogout}
            className="w-full py-3.5 bg-[#CD0000] text-white font-bold uppercase tracking-wider text-[10px] rounded-xl hover:bg-[#A30000] transition-all flex items-center justify-center gap-2 shadow-md shadow-red-100"
          >
            <LogOut size={13} />
            Sign Out & Switch Account
          </button>
        </div>
      </div>
    </div>
  );
}
