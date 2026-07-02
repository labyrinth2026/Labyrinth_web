import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchFromSheet } from '@/services/api';
import { Download, Users, BarChart2, RefreshCw, PieChart, Check, X } from 'lucide-react';

const FacultyDashboard: React.FC = () => {
  const { user, can } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'table' | 'stats'>('table');

  useEffect(() => {
    const loadRegistrations = async () => {
      setIsLoading(true);
      try {
        const data = await fetchFromSheet('getJoinRegistrations', { userEmail: user?.email });
        setRegistrations(data as any[]);
      } catch (error) {
        console.error('Failed to load registrations', error);
      }
      setIsLoading(false);
    };

    if (can('view_registrations')) {
      loadRegistrations();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleApprove = async (id: string) => {
    try {
      await fetchFromSheet('approveRegistration', { id });
      setRegistrations(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error(e);
      alert('Failed to approve registration.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await fetchFromSheet('rejectRegistration', { id });
      setRegistrations(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error(e);
      alert('Failed to reject registration.');
    }
  };

  if (!can('view_registrations')) {
    return (
      <div className="bg-white border border-red-100 rounded-2xl p-8 text-center">
        <p className="text-red-500 font-semibold">Unauthorized: You don't have permission to view registrations.</p>
      </div>
    );
  }

  // Stats computations
  const statsByVertical: Record<string, number> = {};
  const statsByYear: Record<string, number> = {};
  registrations.forEach(r => {
    if (r.preferredVertical) statsByVertical[r.preferredVertical] = (statsByVertical[r.preferredVertical] || 0) + 1;
    if (r.year) statsByYear[`Year ${r.year}`] = (statsByYear[`Year ${r.year}`] || 0) + 1;
  });

  const handleExportCSV = () => {
    if (registrations.length === 0) return;
    const headers = ['Name', 'Email', 'Phone', 'Course', 'Year', 'Preferred Vertical', 'Reason', 'Date'];
    const rows = registrations.map(r => [
      r.name, r.email, r.phone, r.course, r.year, r.preferredVertical, r.reason, r.timestamp
    ].map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `labyrinth_registrations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    // Simple TSV which Excel opens natively
    if (registrations.length === 0) return;
    const headers = ['Name', 'Email', 'Phone', 'Course', 'Year', 'Preferred Vertical', 'Reason', 'Date'];
    const rows = registrations.map(r =>
      [r.name, r.email, r.phone, r.course, r.year, r.preferredVertical, r.reason, r.timestamp].join('\t')
    );
    const tsvContent = "data:text/tab-separated-values;charset=utf-8," + [headers.join('\t'), ...rows].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(tsvContent));
    link.setAttribute('download', `labyrinth_registrations_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">Registration Management</h1>
          <p className="text-[#667085] text-sm mt-0.5">View and manage community applications.</p>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          <button
            onClick={handleExportCSV}
            disabled={registrations.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[rgba(205, 0, 0, 0.03)] text-[#CD0000] text-sm font-semibold rounded-xl hover:bg-[rgba(205, 0, 0, 0.07)] transition-colors disabled:opacity-40"
          >
            <Download size={15} /> Export CSV
          </button>
          <button
            onClick={handleExportExcel}
            disabled={registrations.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] transition-colors disabled:opacity-40"
          >
            <Download size={15} /> Export Excel
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[rgba(205, 0, 0, 0.03)] flex items-center justify-center text-[#CD0000]">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs text-[#8c97a8]">Total Applications</p>
            <h3 className="text-2xl font-bold text-[#CD0000]">{registrations.length}</h3>
          </div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] flex items-center justify-center text-green-600">
            <BarChart2 size={20} />
          </div>
          <div>
            <p className="text-xs text-[#8c97a8]">Unique Verticals</p>
            <h3 className="text-2xl font-bold text-[#CD0000]">{Object.keys(statsByVertical).length}</h3>
          </div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-purple-600">
            <PieChart size={20} />
          </div>
          <div>
            <p className="text-xs text-[#8c97a8]">Year Groups</p>
            <h3 className="text-2xl font-bold text-[#CD0000]">{Object.keys(statsByYear).length}</h3>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-[#E5E7EB]">
          {[{ id: 'table', label: 'All Applications' }, { id: 'stats', label: 'Statistics' }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#CD0000] text-[#CD0000] bg-[rgba(205, 0, 0, 0.03)]/50'
                  : 'border-transparent text-[#667085] hover:text-[#CD0000]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table Tab */}
        {activeTab === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[rgba(205, 0, 0, 0.03)] border-b border-[rgba(205, 0, 0, 0.07)] text-xs font-bold text-[#8c97a8] uppercase tracking-wider">
                  <th className="p-4">Date</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Year</th>
                  <th className="p-4">Vertical</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {isLoading ? (
                  <tr><td colSpan={8} className="p-8 text-center text-[#8c97a8]">
                    <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-[#CD0000]" />
                    Loading registrations...
                  </td></tr>
                ) : registrations.length > 0 ? registrations.map((reg, i) => (
                  <tr key={i} className="hover:bg-[rgba(205, 0, 0, 0.03)]/30 transition-colors text-sm">
                    <td className="p-4 text-[#8c97a8] whitespace-nowrap">
                      {reg.timestamp ? new Date(reg.timestamp).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 text-[#CD0000] font-semibold">{reg.name}</td>
                    <td className="p-4 text-[#667085]">{reg.email}</td>
                    <td className="p-4 text-[#667085]">{reg.phone}</td>
                    <td className="p-4 text-[#667085]">{reg.course}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-[rgba(205, 0, 0, 0.03)] text-[#CD0000] text-xs font-semibold">
                        Year {reg.year}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-[#F5F3FF] text-purple-600 text-xs font-semibold whitespace-nowrap">
                        {reg.preferredVertical}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleApprove(reg.id)}
                          className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors border border-green-150"
                          title="Approve Member"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => handleReject(reg.id)}
                          className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors border border-red-150"
                          title="Reject Registration"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={8} className="p-10 text-center text-[#8c97a8]">
                    No registrations found.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold text-[#CD0000] mb-3">By Vertical</h3>
              <div className="space-y-2">
                {Object.entries(statsByVertical).sort((a, b) => b[1] - a[1]).map(([v, count]) => {
                  const pct = Math.round((count / registrations.length) * 100);
                  return (
                    <div key={v}>
                      <div className="flex justify-between text-xs text-[#667085] mb-1">
                        <span className="font-medium">{v}</span>
                        <span>{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-[rgba(205, 0, 0, 0.03)] rounded-full overflow-hidden">
                        <div className="h-full bg-[#CD0000] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {Object.keys(statsByVertical).length === 0 && <p className="text-[#8c97a8] text-sm">No data yet</p>}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#CD0000] mb-3">By Year</h3>
              <div className="space-y-2">
                {Object.entries(statsByYear).sort().map(([y, count]) => {
                  const pct = Math.round((count / registrations.length) * 100);
                  return (
                    <div key={y}>
                      <div className="flex justify-between text-xs text-[#667085] mb-1">
                        <span className="font-medium">{y}</span>
                        <span>{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-[rgba(205, 0, 0, 0.03)] rounded-full overflow-hidden">
                        <div className="h-full bg-[#7c3aed] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {Object.keys(statsByYear).length === 0 && <p className="text-[#8c97a8] text-sm">No data yet</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;
