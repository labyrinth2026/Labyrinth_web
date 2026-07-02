"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchFromSheet } from '@/services/api';
import { Shield, Code2, Calendar, Megaphone, FolderOpen, ClipboardList, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function VerticalDashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (user?.verticalId) {
        try {
          const projsData: any = await fetchFromSheet('getVerticalProjects', { verticalId: user.verticalId });
          setProjects(projsData || []);

          const resData: any = await fetchFromSheet('getVerticalResources', { verticalId: user.verticalId });
          setResources(resData || []);

          const evts: any = await fetchFromSheet('getEvents');
          setEvents((evts || []).filter((e: any) => e.verticalId === user.verticalId));

          const anns: any = await fetchFromSheet('getAnnouncements');
          setAnnouncements((anns || []).filter((a: any) => a.targetType === 'all' || (a.targetType === 'vertical' && a.targetId === user.verticalId)));
        } catch (e) {
          console.error('Failed to load dashboard data', e);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadDashboardData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-[#CD0000] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeProjects = projects.filter(p => p.status !== 'completed').length;

  const stats = [
    { label: 'Active Projects', value: activeProjects.toString(), icon: Code2, color: '#CD0000', bg: 'rgba(205, 0, 0, 0.03)' },
    { label: 'Upcoming Events', value: events.length.toString(), icon: Calendar, color: '#16a34a', bg: '#F0FDF4' },
    { label: 'Learning Assets', value: resources.length.toString(), icon: FolderOpen, color: '#7c3aed', bg: '#F5F3FF' },
  ];

  const quickActions = [
    { label: 'Track Projects', path: '/vertical/projects', icon: Code2 },
    { label: 'Manage Resources', path: '/vertical/resources', icon: FolderOpen },
    { label: 'Register Attendance', path: '/vertical/attendance', icon: ClipboardList },
    { label: 'Create Event Notice', path: '/vertical/events', icon: Calendar }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#CD0000] mb-1">
              Welcome, {user?.name.split(' ')[0]}.
            </h1>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Lead your domain, run projects, and provide resources for your student vertical.
            </p>
          </div>
          <div className="shrink-0 w-10 h-10 rounded-xl bg-[#CD0000]/5 border border-[#CD0000]/10 flex items-center justify-center">
            <Shield size={18} className="text-[#CD0000]" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5 flex items-center gap-4">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
              style={{ backgroundColor: stat.bg, color: stat.color, borderColor: stat.color + '15' }}
            >
              <stat.icon size={18} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{stat.label}</p>
              <h3 className="text-xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Operations */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 lg:col-span-2">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Operations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map(action => (
              <Link
                key={action.path}
                href={action.path}
                className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/85 text-slate-700 transition-colors group border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <action.icon size={15} className="text-[#CD0000]" />
                  <span className="text-xs font-bold uppercase tracking-wider">{action.label}</span>
                </div>
                <ArrowRight size={13} className="opacity-35 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>

        {/* Notices */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Recent Notices</h2>
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {announcements.length > 0 ? (
              announcements.map((ann, i) => (
                <div key={i} className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                  <span className="text-[8px] font-bold text-[#CD0000] uppercase tracking-wider bg-[#CD0000]/5 px-2 py-0.5 rounded-full inline-block mb-1">
                    {ann.targetType === 'all' ? 'All Club' : 'Vertical Internal'}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 leading-tight">{ann.title}</h4>
                  <p className="text-slate-500 text-[10px] mt-1 line-clamp-2 leading-relaxed">{ann.content}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-xs text-center py-6">No recent announcements.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
