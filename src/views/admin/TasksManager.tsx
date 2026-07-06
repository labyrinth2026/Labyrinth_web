"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchFromSheet } from '@/services/api';
import { Plus, Trash2, CheckSquare, RefreshCw, Clock, Check, User } from 'lucide-react';

export default function TasksManager() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [committees, setCommittees] = useState<any[]>([]);
  const [verticals, setVerticals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selector
  const [scopeType, setScopeType] = useState<'committee' | 'vertical'>('vertical');
  const [scopeId, setScopeId] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cData, vData, uData]: any[] = await Promise.all([
        fetchFromSheet('getCoreCommittees'),
        fetchFromSheet('getVerticals'),
        fetchFromSheet('getRoles')
      ]);
      setCommittees(cData || []);
      setVerticals(vData || []);
      setUsers(uData || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const fetchTasks = async () => {
    if (!scopeId) {
      setTasks([]);
      return;
    }
    setLoading(true);
    try {
      const action = scopeType === 'committee' ? 'getCommitteeTasks' : 'getVerticalProjects';
      const payload = scopeType === 'committee' ? { committeeId: scopeId } : { verticalId: scopeId };
      const data: any = await fetchFromSheet(action, payload);
      setTasks(data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [scopeType, scopeId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !scopeId) return;
    setIsSaving(true);
    try {
      const action = scopeType === 'committee' ? 'addCommitteeTask' : 'addVerticalProject';
      const payload = scopeType === 'committee'
        ? { committeeId: scopeId, title, description, assignedTo, dueDate, status: 'pending' }
        : { verticalId: scopeId, title, description, assignedTo, dueDate, status: 'pending' };
      await fetchFromSheet(action, payload);
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setDueDate('');
      await fetchTasks();
    } catch (err: any) {
      alert(err.message || 'Failed to create task.');
    }
    setIsSaving(false);
  };

  const handleUpdateStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'pending' ? 'in-progress' : currentStatus === 'in-progress' ? 'completed' : 'pending';
    try {
      const action = scopeType === 'committee' ? 'updateCommitteeTask' : 'updateVerticalProject';
      await fetchFromSheet(action, { id: taskId, data: { status: nextStatus } });
      await fetchTasks();
    } catch (err: any) {
      alert('Failed to update task status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const action = scopeType === 'committee' ? 'deleteCommitteeTask' : 'deleteVerticalProject';
      await fetchFromSheet(action, { id });
      await fetchTasks();
    } catch (err: any) {
      alert(err.message || 'Failed to delete task.');
    }
  };

  const inputClass = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CD0000]/10 focus:border-slate-400 text-slate-800 placeholder:text-slate-400 bg-white";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">Task assignments</h1>
          <p className="text-slate-500 text-sm mt-0.5 font-medium">Assign work, configure due timelines, and check progress statuses.</p>
        </div>
        <button onClick={fetchTasks} className="p-2.5 text-slate-500 hover:text-[#CD0000] border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Scope Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex bg-slate-100 rounded-xl p-1 shrink-0 w-full sm:w-auto">
          <button 
            type="button" 
            onClick={() => { setScopeType('vertical'); setScopeId(''); }} 
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${scopeType === 'vertical' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Vertical Projects
          </button>
          <button 
            type="button" 
            onClick={() => { setScopeType('committee'); setScopeId(''); }} 
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${scopeType === 'committee' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Committee Tasks
          </button>
        </div>

        <select 
          value={scopeId} 
          onChange={e => setScopeId(e.target.value)} 
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD0000] bg-white font-semibold text-slate-700"
        >
          <option value="">Select project/task group...</option>
          {scopeType === 'committee'
            ? committees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
            : verticals.map(v => <option key={v.id} value={v.id}>{v.name}</option>)
          }
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Form */}
        <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-sm self-start space-y-4">
          <h3 className="text-sm font-bold text-[#CD0000] uppercase tracking-wider flex items-center gap-1.5"><CheckSquare size={16} /> Assign Task</h3>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Task Title *</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className={inputClass} placeholder="Task headline..." />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Assignee</label>
              <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className={inputClass}>
                <option value="">Choose member...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name || u.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Description</label>
              <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className={inputClass} placeholder="Deliverables details..." />
            </div>

            <button type="submit" disabled={isSaving || !scopeId} className="w-full py-2.5 bg-[#CD0000] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#A30000] transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50">
              {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />} Create Task
            </button>
          </form>
        </div>

        {/* Task Board List */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm lg:col-span-2">
          <div className="p-4 border-b border-[#E5E7EB] bg-slate-50/50">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Tasks</h4>
          </div>
          
          <div className="divide-y divide-[#E5E7EB]">
            {scopeId ? (
              tasks.map(task => {
                const assigneeName = users.find(u => u.id === task.assignedTo)?.name || 'Unassigned';
                const statusBadge = 
                  task.status === 'completed' ? 'bg-green-50 text-green-600 border-green-200' :
                  task.status === 'in-progress' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                  'bg-slate-100 text-slate-500 border-slate-200';

                return (
                  <div key={task.id} className="p-5 flex justify-between gap-4 hover:bg-slate-50/30 transition-colors">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button 
                          onClick={() => handleUpdateStatus(task.id, task.status)}
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border transition-colors ${statusBadge}`}
                          title="Click to cycle status"
                        >
                          {task.status}
                        </button>
                        {task.dueDate && (
                          <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                            <Clock size={10} /> Due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">{task.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{task.description || 'No description provided.'}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        <User size={10} /> Assignee: {assigneeName}
                      </div>
                    </div>
                    <button onClick={() => handleDelete(task.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 shrink-0 self-start transition-colors"><Trash2 size={14} /></button>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-slate-400">Select a project/task scope group above to view cards.</div>
            )}
            {scopeId && tasks.length === 0 && (
              <div className="p-12 text-center text-slate-400">No tasks in this group. Assign one on the left.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
