"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FileText, LogOut, ShieldAlert,
  BookOpen, Link as LinkIcon, Download
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  permission?: string;
}

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, login, logout, isLoading, can } = useAuth();
  const pathname = usePathname();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);
    const result = await login(email, password, rememberDevice);
    if (!result.success) {
      setError(result.error || 'Invalid email or password');
    }
    setIsLoggingIn(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#CD0000] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4 pt-20">
        <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 mx-auto bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center mb-6">
            <ShieldAlert size={24} className="text-[#CD0000]" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1.5">Admin Portal</h2>
          <p className="text-slate-500 text-xs mb-6 leading-relaxed font-medium">
            Sign in with your assigned credentials to access the Labyrinth admin dashboard.
          </p>
          
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            {error && (
              <div className="p-3 text-xs text-red-500 bg-red-50 rounded-xl border border-red-100">
                {error}
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-white border border-slate-200 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CD0000]/10 focus:border-[#CD0000] transition-all text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-white border border-slate-200 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CD0000]/10 focus:border-[#CD0000] transition-all text-xs font-semibold"
              />
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer mt-3">
              <input 
                type="checkbox" 
                checked={rememberDevice}
                onChange={e => setRememberDevice(e.target.checked)}
                className="w-4 h-4 text-[#CD0000] rounded bg-white border-slate-200 focus:ring-[#CD0000]"
              />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Remember Device</span>
            </label>
 
            <button 
              type="submit" 
              disabled={isLoggingIn}
              className="w-full mt-6 py-3 bg-[#CD0000] text-white font-bold uppercase tracking-widest text-[10px] rounded-full hover:bg-[#9E0000] transition-all disabled:opacity-75 shadow-xs"
            >
              {isLoggingIn ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Role badge colors
  const roleBadge: Record<string, { label: string; bg: string; text: string }> = {
    coordinator: { label: 'Coordinator', bg: 'bg-[#CD0000]/5 border-[#CD0000]/10', text: 'text-[#CD0000]' },
    mentor: { label: 'Mentor', bg: 'bg-slate-100 border-slate-200/60', text: 'text-slate-600' },
    core_committee: { label: 'Core Committee', bg: 'bg-[#CD0000]/5 border-[#CD0000]/10', text: 'text-[#CD0000]' },
    developer: { label: 'System Admin', bg: 'bg-slate-100 border-slate-200/60', text: 'text-slate-600' },
  };
  const badge = roleBadge[user.role] || { label: user.role, bg: 'bg-[#CD0000]/5 border-[#CD0000]/10', text: 'text-[#CD0000]' };

  const navItems: NavItem[] = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Content Management', path: '/admin/content', icon: BookOpen, permission: 'manage_content' },
    { label: 'Forms Management', path: '/admin/forms', icon: LinkIcon, permission: 'manage_content' },
    { label: 'Reports & Exports', path: '/admin/reports', icon: Download, permission: 'manage_content' },
  ];

  // Determine which nav items are visible based on role
  const visibleItems = navItems.filter(item => {
    if (!item.permission) return true;
    return can(item.permission as any);
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-20">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl py-8">
        <div className="flex flex-col md:flex-row gap-6">

          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5 sticky top-28">
              {/* User Profile */}
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-100">
                <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-slate-200" />
                <div className="overflow-hidden">
                  <h3 className="text-xs font-bold text-slate-800 truncate">{user.name}</h3>
                  <span
                    className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-1 border ${badge.bg} ${badge.text}`}
                  >
                    {badge.label}
                  </span>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wider border ${
                        isActive
                          ? 'bg-[#CD0000]/5 text-[#CD0000] border-[#CD0000]/10'
                          : 'text-slate-600 hover:bg-slate-50 border-transparent hover:text-slate-800'
                      }`}
                    >
                      <item.icon size={15} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Sign Out */}
              <button
                onClick={logout}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all text-xs font-bold uppercase tracking-wider mt-6 w-full border border-transparent hover:border-red-100"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {children}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
