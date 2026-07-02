"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchFromSheet } from '@/services/api';
import {
  LayoutDashboard, LogOut, Code2, Users,
  Calendar, Megaphone, FolderOpen, ClipboardList
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const VerticalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [verticalName, setVerticalName] = useState('Loading Vertical...');

  useEffect(() => {
    const loadVerticalInfo = async () => {
      if (user?.verticalId) {
        try {
          const list: any = await fetchFromSheet('getVerticals');
          const myVert = list.find((v: any) => v.id === user.verticalId);
          if (myVert) {
            setVerticalName(myVert.name);
          } else {
            setVerticalName('Unassigned Domain');
          }
        } catch (e) {
          console.error(e);
          setVerticalName('Vertical Domain');
        }
      }
    };
    if (user) {
      loadVerticalInfo();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#CD0000] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'VERTICAL_HEAD') {
    return null;
  }

  const navItems: NavItem[] = [
    { label: 'Dashboard', path: '/vertical/dashboard', icon: LayoutDashboard },
    { label: 'Members', path: '/vertical/members', icon: Users },
    { label: 'Projects', path: '/vertical/projects', icon: Code2 },
    { label: 'Events', path: '/vertical/events', icon: Calendar },
    { label: 'Resources', path: '/vertical/resources', icon: FolderOpen },
    { label: 'Attendance', path: '/vertical/attendance', icon: ClipboardList },
    { label: 'Announcements', path: '/vertical/announcements', icon: Megaphone }
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
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
                    className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-1 border bg-emerald-50 border-emerald-100 text-emerald-600 truncate max-w-full"
                    title={verticalName}
                  >
                    {verticalName}
                  </span>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {navItems.map((item) => {
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

export default VerticalLayout;
