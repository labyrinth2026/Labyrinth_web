"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchFromSheet } from '@/services/api';
import { Mail, ShieldAlert } from 'lucide-react';

export default function VerticalMembersPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMembers = async () => {
      if (user?.verticalId) {
        try {
          const res: any = await fetchFromSheet('getAssignments');
          const verticalAssignments = res.vertical || [];
          
          // Filter assignments for my vertical
          const myAssignments = verticalAssignments.filter((a: any) => a.verticalId === user.verticalId);
          setMembers(myAssignments);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadMembers();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-[#CD0000] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6">
        <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">Vertical Members</h1>
        <p className="text-[#667085] text-sm mt-0.5">List of students assigned to this domain.</p>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
        {members.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#667085]">
              <thead className="bg-[rgba(205, 0, 0, 0.03)] border-b border-[rgba(205, 0, 0, 0.07)] text-xs font-bold text-[#8c97a8] uppercase tracking-wider">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Assigned On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {members.map((m, idx) => (
                  <tr key={idx} className="hover:bg-[rgba(205, 0, 0, 0.03)]/30 transition-colors">
                    <td className="p-4 text-[#CD0000] font-semibold">{m.userName}</td>
                    <td className="p-4 flex items-center gap-2">
                      <Mail size={13} className="text-slate-400" />
                      <span>{m.userEmail}</span>
                    </td>
                    <td className="p-4 text-slate-500">{new Date(m.assignedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <ShieldAlert size={48} className="mx-auto text-[#B8B8B8] mb-4" />
            <h3 className="text-base font-bold text-[#CD0000] mb-1">No Members Assigned</h3>
            <p className="text-[#667085]">Ask the administrators to assign students to your vertical.</p>
          </div>
        )}
      </div>
    </div>
  );
}
