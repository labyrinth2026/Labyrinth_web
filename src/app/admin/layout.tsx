"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, LogOut, BookOpen, Link as LinkIcon,
  Download, Users, Shield, CheckSquare, Image, Megaphone, Settings, Layers, Calendar, CalendarDays
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Bypass layout checks and layout wrapper for login screen
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#CD0000] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user is not logged in or is not an admin, don't render layout (middleware handles redirect)
  const allowedRoles = ['ADMIN'];
  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  const roleLabel: Record<string, string> = {
    ADMIN: 'Club Administrator',
    MEMBER: 'Club Member'
  };

  const roleBadge: Record<string, { bg: string; text: string }> = {
    ADMIN: { bg: 'bg-[#CD0000]/5 border-[#CD0000]/10', text: 'text-[#CD0000]' },
    MEMBER: { bg: 'bg-slate-50 border-slate-100', text: 'text-slate-600' }
  };

  const badge = roleBadge[user.role] || { bg: 'bg-slate-50 border-slate-100', text: 'text-slate-600' };

  // Define ALL navigation links (exactly the 9 CMS items)
  const allNavItems: Record<string, NavItem> = {
    dashboard: { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    members: { label: 'Members', path: '/admin/members', icon: Users },
    verticals: { label: 'Verticals', path: '/admin/verticals', icon: BookOpen },
    events: { label: 'Events', path: '/admin/events', icon: Calendar },
    calendar: { label: 'Calendar Scheduler', path: '/admin/calendar', icon: CalendarDays },
    gallery: { label: 'Gallery Manager', path: '/admin/gallery', icon: Image },
    forms: { label: 'Forms', path: '/admin/forms', icon: LinkIcon },
    announcements: { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
    tasks: { label: 'Tasks', path: '/admin/tasks', icon: CheckSquare },
    settings: { label: 'Settings', path: '/admin/settings', icon: Settings }
  };

  // Admin has access to all 9 panels
  const visibleItemKeys = [
    'dashboard', 'members', 'verticals', 'events', 'calendar',
    'gallery', 'forms', 'announcements', 'tasks', 'settings'
  ];
  const visibleItems = visibleItemKeys.map(key => allNavItems[key]).filter(Boolean);

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-20">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl py-8">
        <div className="flex flex-col md:flex-row gap-6">

          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5 sticky top-28">
              {/* User Profile */}
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-100">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=CD0000&color=fff`} 
                  alt={user.name} 
                  className="w-8 h-8 rounded-full border border-slate-200" 
                />
                <div className="overflow-hidden">
                  <h3 className="text-xs font-bold text-slate-800 truncate">{user.name}</h3>
                  <span
                    className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-1 border ${badge.bg} ${badge.text}`}
                  >
                    {roleLabel[user.role] || user.role}
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
                onClick={handleLogout}
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
