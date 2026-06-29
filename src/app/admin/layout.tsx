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
      <div className="min-h-screen bg-[rgba(11,31,99,0.03)] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#0B1F63] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[rgba(11,31,99,0.03)] flex items-center justify-center px-4 pt-20">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto bg-[rgba(11,31,99,0.03)] rounded-full flex items-center justify-center mb-5">
            <ShieldAlert size={30} className="text-[#0B1F63]" />
          </div>
          <h2 className="text-2xl font-bold font-grotesk text-[#0B1F63] mb-2">Admin Portal</h2>
          <p className="text-[#667085] text-sm mb-8">
            Sign in with your assigned credentials to access the Labyrinth admin dashboard.
          </p>
          
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-[#0B1F63] mb-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F63]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0B1F63] mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F63]/20"
              />
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input 
                type="checkbox" 
                checked={rememberDevice}
                onChange={e => setRememberDevice(e.target.checked)}
                className="w-4 h-4 text-[#0B1F63] rounded focus:ring-[#0B1F63]"
              />
              <span className="text-sm font-medium text-[#667085]">Remember Device (30 Days)</span>
            </label>

            <button 
              type="submit" 
              disabled={isLoggingIn}
              className="w-full mt-4 py-2.5 bg-[#0B1F63] text-white font-semibold rounded-xl hover:bg-[#071545] transition-colors disabled:opacity-70"
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
    coordinator: { label: 'Coordinator', bg: 'rgba(11,31,99,0.03)', text: '#0B1F63' },
    mentor: { label: 'Mentor', bg: '#F0FDF4', text: '#16a34a' },
    core_committee: { label: 'Core Committee', bg: '#FEF3C7', text: '#d97706' },
    developer: { label: 'System Admin', bg: '#F5F3FF', text: '#7c3aed' },
  };
  const badge = roleBadge[user.role] || { label: user.role, bg: 'rgba(11,31,99,0.03)', text: '#0B1F63' };

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
    <div className="min-h-screen bg-[rgba(11,31,99,0.03)] pt-20">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl py-8">
        <div className="flex flex-col md:flex-row gap-6">

          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-5 sticky top-28">
              {/* User Profile */}
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-[#E5E7EB]">
                <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full border-2 border-[rgba(11,31,99,0.03)]" />
                <div className="overflow-hidden">
                  <h3 className="text-sm font-bold text-[#0B1F63] truncate">{user.name}</h3>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-1"
                    style={{ backgroundColor: badge.bg, color: badge.text }}
                  >
                    {badge.label}
                  </span>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1.5">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold ${
                        isActive
                          ? 'bg-[rgba(11,31,99,0.03)] text-[#0B1F63] border border-[rgba(11,31,99,0.07)]'
                          : 'text-[#667085] hover:bg-[rgba(11,31,99,0.03)] hover:text-[#0B1F63]'
                      }`}
                    >
                      <item.icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Sign Out */}
              <button
                onClick={logout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all text-sm font-semibold mt-6 w-full border border-transparent hover:border-red-100"
              >
                <LogOut size={18} />
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
