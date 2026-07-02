"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchFromSheet } from '@/services/api';
import { ClipboardList, Check, RefreshCw, ShieldAlert } from 'lucide-react';

export default function VerticalAttendancePage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'present' | 'absent'>>({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    if (user?.verticalId) {
      setLoading(true);
      try {
        // 1. Get members
        const res: any = await fetchFromSheet('getAssignments');
        const list = (res.vertical || []).filter((a: any) => a.verticalId === user.verticalId);
        setMembers(list);

        // 2. Get existing attendance for date
        const attData: any = await fetchFromSheet('getVerticalAttendance', { verticalId: user.verticalId });
        const dayRecords = (attData || []).filter((a: any) => a.date === date);
        
        const initialStatus: Record<string, 'present' | 'absent'> = {};
        list.forEach((m: any) => {
          const rec = dayRecords.find((r: any) => r.memberId === m.userId);
          initialStatus[m.userId] = rec ? rec.status : 'present';
        });
        setAttendanceRecords(initialStatus);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [user, date]);

  const handleStatusChange = (memberId: string, status: 'present' | 'absent') => {
    setAttendanceRecords(prev => ({
      ...prev,
      [memberId]: status
    }));
  };

  const handleSave = async () => {
    if (!user?.verticalId) return;
    setSaving(true);
    setSuccessMsg('');
    try {
      const records = members.map(m => ({
        memberId: m.userId,
        memberName: m.userName,
        status: attendanceRecords[m.userId] || 'present'
      }));

      await fetchFromSheet('saveVerticalAttendance', {
        verticalId: user.verticalId,
        date,
        records
      });

      setSuccessMsg('Attendance records saved successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      console.error(e);
      alert('Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">Vertical Attendance</h1>
          <p className="text-[#667085] text-sm mt-0.5">Track and verify meeting attendance of domain members.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date:</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            className="border border-[#E5E7EB] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#CD0000]/15 text-slate-700" 
          />
        </div>
      </div>

      {successMsg && (
        <div className="p-3 text-xs text-green-600 bg-green-50 rounded-xl border border-green-150 font-semibold">
          {successMsg}
        </div>
      )}

      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#667085]">
            <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-[#CD0000]" />
            Loading domain members...
          </div>
        ) : members.length > 0 ? (
          <div>
            <table className="w-full text-left text-sm text-[#667085]">
              <thead className="bg-[rgba(205, 0, 0, 0.03)] border-b border-[rgba(205, 0, 0, 0.07)] text-xs font-bold text-[#8c97a8] uppercase tracking-wider">
                <tr>
                  <th className="p-4">Member Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {members.map(m => (
                  <tr key={m.id} className="hover:bg-[rgba(205, 0, 0, 0.03)]/30 transition-colors">
                    <td className="p-4 text-slate-800 font-semibold">{m.userName}</td>
                    <td className="p-4 text-slate-600">{m.userEmail}</td>
                    <td className="p-4">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleStatusChange(m.userId, 'present')}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                            attendanceRecords[m.userId] === 'present'
                              ? 'bg-green-50 border-green-200 text-green-600'
                              : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => handleStatusChange(m.userId, 'absent')}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                            attendanceRecords[m.userId] === 'absent'
                              ? 'bg-red-50 border-red-200 text-red-600'
                              : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="flex justify-end p-5 border-t border-[#E5E7EB]">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] transition-colors disabled:opacity-50"
              >
                {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                {saving ? 'Saving...' : 'Save Records'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <ShieldAlert size={48} className="mx-auto text-[#B8B8B8] mb-4" />
            <h3 className="text-base font-bold text-slate-800 mb-1">No Members found</h3>
            <p className="text-[#667085]">There are no members assigned to this vertical.</p>
          </div>
        )}
      </div>
    </div>
  );
}
