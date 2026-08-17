import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Activity, Users, Calendar, CalendarDays, FileText, BookOpen, Shield, ArrowRight, Download } from 'lucide-react';
import Link from 'next/link';
import { fetchFromSheet } from '@/services/api';
import { usePrefetchOnIdle } from '@/hooks/usePrefetchOnIdle';

const Dashboard: React.FC = () => {
  const { user, can } = useAuth();
  const firstName = user?.name.split(' ')[0] || 'Admin';

  const [totalMembers, setTotalMembers] = useState<number | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<number | null>(null);
  const [newRegistrations, setNewRegistrations] = useState<number | null>(null);

  // Prefetch likely next routes in the background during idle time
  usePrefetchOnIdle([
    '/admin/members',
    '/admin/verticals',
    '/admin/events',
    '/admin/gallery',
    '/admin/forms',
    '/admin/announcements',
    '/admin/tasks'
  ]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await fetchFromSheet<{ totalMembers: number; upcomingEvents: number; newRegistrations: number }>('getDashboardStats');
        setTotalMembers(stats.totalMembers);
        setUpcomingEvents(stats.upcomingEvents);
        setNewRegistrations(stats.newRegistrations);
      } catch (err) {
        console.error('Dashboard stats load error:', err);
        setTotalMembers(0);
        setUpcomingEvents(0);
        setNewRegistrations(0);
      }
    };

    loadStats();
  }, []);

  const fmt = (val: number | null) => (val === null ? '…' : val.toString());

  const stats = [
    { label: 'Total Members', value: fmt(totalMembers), icon: Users, color: '#CD0000', bg: 'rgba(205, 0, 0, 0.03)' },
    { label: 'Upcoming Events', value: fmt(upcomingEvents), icon: Calendar, color: '#16a34a', bg: '#F0FDF4' },
    { label: 'New Registrations', value: fmt(newRegistrations), icon: Activity, color: '#7c3aed', bg: '#F5F3FF' },
  ];

  const quickActions = [
    { label: 'Manage Events', path: '/admin/events', icon: Calendar, show: can('manage_events') },
    { label: 'Calendar Scheduler', path: '/admin/calendar', icon: CalendarDays, show: can('manage_events') },
    { label: 'Team Members', path: '/admin/members', icon: Users, show: can('manage_team') },
    { label: 'View Registrations', path: '/admin/forms', icon: FileText, show: can('view_registrations') },
    { label: 'Review Content', path: '/admin/gallery', icon: BookOpen, show: can('review_content') },
    { label: 'Download Reports', path: '/admin/reports', icon: Download, show: can('manage_content') },
  ].filter(a => a.show);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#CD0000] mb-1">
              Welcome back, {firstName}.
            </h1>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Here's what's happening with LABYRINTH today.</p>
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
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
              style={{ backgroundColor: stat.bg, color: stat.color, borderColor: stat.color + '15' }}
            >
              <stat.icon size={18} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{stat.label}</p>
              <h3 className="text-xl font-bold text-[#CD0000]">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map(action => (
              <Link
                key={action.path + action.label}
                href={action.path}
                className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 text-slate-700 transition-colors group border border-slate-100"
              >
                <div className="flex items-center gap-3">
                   <action.icon size={15} className="text-[#CD0000]" />
                  <span className="text-xs font-bold uppercase tracking-wider">{action.label}</span>
                </div>
                <ArrowRight size={13} className="opacity-30 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Config Note */}
      <div className="bg-slate-100/50 border border-slate-200/60 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <BookOpen size={16} className="text-slate-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Google Apps Script Configuration</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              To fully enable dynamic features, deploy <code className="bg-white px-1.5 py-0.5 rounded text-slate-700 font-mono border border-slate-200/60">Code.gs</code> to Google Apps Script and paste the resulting Web App URL into{' '}
              <code className="bg-white px-1.5 py-0.5 rounded text-slate-700 font-mono border border-slate-200/60">src/services/api.ts</code>.
              Once configured, you can manage Events, Team, and Registrations without touching the codebase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
