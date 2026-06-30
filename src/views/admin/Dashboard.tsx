import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity, Users, Calendar, FileText, BookOpen, Shield, ArrowRight, Download } from 'lucide-react';
import Link from 'next/link';

const Dashboard: React.FC = () => {
  const { user, can } = useAuth();

  const firstName = user?.name.split(' ')[0] || 'Admin';

  const stats = [
    { label: 'Total Members', value: '142', icon: Users, color: '#CD0000', bg: 'rgba(205, 0, 0, 0.03)' },
    { label: 'Upcoming Events', value: '3', icon: Calendar, color: '#16a34a', bg: '#F0FDF4' },
    { label: 'New Registrations', value: '24', icon: Activity, color: '#7c3aed', bg: '#F5F3FF' },
  ];

  const quickActions = [
    { label: 'Manage Events', path: '/admin/content', icon: Calendar, show: can('manage_events') },
    { label: 'Team Members', path: '/admin/team', icon: Users, show: can('manage_team') },
    { label: 'View Registrations', path: '/admin/registrations', icon: FileText, show: can('view_registrations') },
    { label: 'Review Content', path: '/admin/content', icon: BookOpen, show: can('review_content') },
    { label: 'Download Reports', path: '/admin/reports', icon: Download, show: can('manage_content') },
  ].filter(a => a.show);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-grotesk text-[#CD0000] mb-1">
              Welcome back, {firstName}! 👋
            </h1>
            <p className="text-[#667085] text-sm">Here's what's happening with LABYRINTH today.</p>
          </div>
          <div className="shrink-0 w-12 h-12 rounded-xl bg-[rgba(205, 0, 0, 0.03)] flex items-center justify-center">
            <Shield size={22} className="text-[#CD0000]" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: stat.bg, color: stat.color }}
            >
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-xs text-[#8c97a8] font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-[#CD0000]">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6">
          <h2 className="text-sm font-bold text-[#8c97a8] uppercase tracking-wider mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map(action => (
              <Link
                key={action.path + action.label}
                href={action.path}
                className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-[rgba(205, 0, 0, 0.03)] hover:bg-[rgba(205, 0, 0, 0.07)] text-[#CD0000] transition-colors group"
              >
                <div className="flex items-center gap-3">
                   <action.icon size={17} />
                  <span className="text-sm font-semibold">{action.label}</span>
                </div>
                <ArrowRight size={15} className="opacity-40 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Config Note */}
      <div className="bg-[rgba(205, 0, 0, 0.03)] border border-[rgba(205, 0, 0, 0.07)] rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <BookOpen size={18} className="text-[#CD0000] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-[#CD0000] mb-1">Google Apps Script Configuration</h3>
            <p className="text-[#667085] text-xs leading-relaxed">
              To fully enable dynamic features, deploy <code className="bg-white px-1 py-0.5 rounded text-[#CD0000] font-mono">Code.gs</code> to Google Apps Script and paste the resulting Web App URL into{' '}
              <code className="bg-white px-1 py-0.5 rounded text-[#CD0000] font-mono">src/services/api.ts</code>.
              Once configured, you can manage Events, Team, and Registrations without touching the codebase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
