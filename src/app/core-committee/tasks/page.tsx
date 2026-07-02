"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { fetchFromSheet } from '../../../services/api';
import { Plus, Check, Edit2, Trash2, X, AlertTriangle, RefreshCw } from 'lucide-react';

interface Task {
  id?: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string;
  dueDate: string;
}

const EMPTY_TASK: Task = { title: '', description: '', status: 'pending', assignedTo: '', dueDate: '' };

export default function CommitteeTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadTasks = async () => {
    if (user?.committeeId) {
      setLoading(true);
      try {
        const data: any = await fetchFromSheet('getCommitteeTasks', { committeeId: user.committeeId });
        setTasks(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadTasks();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title) return;

    try {
      if (editingTask.id) {
        await fetchFromSheet('updateCommitteeTask', { id: editingTask.id, data: editingTask });
      } else {
        await fetchFromSheet('addCommitteeTask', { committeeId: user?.committeeId, ...editingTask });
      }
      setShowModal(false);
      loadTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to save task.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetchFromSheet('deleteCommitteeTask', { id });
      setDeleteConfirm(null);
      loadTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to delete task.');
    }
  };

  const handleStatusChange = async (task: any, newStatus: string) => {
    try {
      await fetchFromSheet('updateCommitteeTask', { id: task.id, data: { status: newStatus } });
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setEditingTask(EMPTY_TASK);
    setShowModal(true);
  };

  const openEditModal = (task: any) => {
    setEditingTask({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate
    });
    setShowModal(true);
  };

  const inputClass = "w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CD0000]/15 focus:border-[#CD0000] text-slate-800 placeholder:text-slate-400";

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-[#CD0000]">Committee Tasks</h1>
          <p className="text-[#667085] text-sm mt-0.5">Organize assignments and track progress.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] transition-colors"
        >
          <Plus size={15} /> Add Task
        </button>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#667085]">
            <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-[#CD0000]" />
            Loading tasks...
          </div>
        ) : tasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#667085]">
              <thead className="bg-[rgba(205, 0, 0, 0.03)] border-b border-[rgba(205, 0, 0, 0.07)] text-xs font-bold text-[#8c97a8] uppercase tracking-wider">
                <tr>
                  <th className="p-4">Task</th>
                  <th className="p-4">Assigned To</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {tasks.map(task => (
                  <tr key={task.id} className="hover:bg-[rgba(205, 0, 0, 0.03)]/30 transition-colors">
                    <td className="p-4">
                      <h4 className="font-semibold text-slate-800">{task.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                    </td>
                    <td className="p-4 text-slate-700">{task.assignedTo || 'Unassigned'}</td>
                    <td className="p-4 text-slate-500">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="p-4">
                      <select 
                        value={task.status} 
                        onChange={(e) => handleStatusChange(task, e.target.value)}
                        className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border focus:outline-none ${
                          task.status === 'completed' 
                            ? 'bg-green-50 border-green-200 text-green-600'
                            : task.status === 'in-progress'
                            ? 'bg-blue-50 border-blue-200 text-blue-600'
                            : 'bg-yellow-50 border-yellow-200 text-yellow-600'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button 
                          onClick={() => openEditModal(task)}
                          className="p-1.5 text-[#8c97a8] hover:text-[#CD0000] hover:bg-[rgba(205, 0, 0, 0.03)] rounded-lg transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm(task.id)}
                          className="p-1.5 text-[#8c97a8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Check size={48} className="mx-auto text-green-500 mb-4" />
            <h3 className="text-base font-bold text-slate-800 mb-1">All Caught Up!</h3>
            <p className="text-[#667085]">There are no active tasks for this committee. Create one to get started.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && editingTask && (
        <div className="fixed inset-0 z-50 bg-[#CD0000]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] w-full max-w-md">
            <form onSubmit={handleSave}>
              <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]">
                <h2 className="font-bold text-[#CD0000]">{editingTask.id ? 'Edit Task' : 'Add New Task'}</h2>
                <button type="button" onClick={() => setShowModal(false)} className="text-[#8c97a8] hover:text-[#CD0000]">
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 space-y-4 text-left">
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Task Title *</label>
                  <input type="text" required value={editingTask.title} onChange={e => setEditingTask({ ...editingTask, title: e.target.value })} className={inputClass} placeholder="e.g. Draft sponsor pitch email" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Description</label>
                  <textarea rows={3} value={editingTask.description} onChange={e => setEditingTask({ ...editingTask, description: e.target.value })} className={inputClass} placeholder="More details about this assignment..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Assigned To</label>
                    <input type="text" value={editingTask.assignedTo} onChange={e => setEditingTask({ ...editingTask, assignedTo: e.target.value })} className={inputClass} placeholder="Name or email" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Due Date</label>
                    <input type="date" value={editingTask.dueDate} onChange={e => setEditingTask({ ...editingTask, dueDate: e.target.value })} className={inputClass} />
                  </div>
                </div>
                {editingTask.id && (
                  <div>
                    <label className="text-xs font-semibold text-[#8c97a8] block mb-1">Status</label>
                    <select value={editingTask.status} onChange={e => setEditingTask({ ...editingTask, status: e.target.value as any })} className={inputClass}>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 p-5 border-t border-[#E5E7EB]">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-[#667085] hover:text-[#CD0000]">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#CD0000] text-white text-sm font-semibold rounded-xl hover:bg-[#A30000] transition-colors">
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-[#CD0000]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h3 className="font-bold text-[#CD0000] mb-2">Delete this task?</h3>
            <p className="text-[#667085] text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 text-sm font-semibold text-[#667085] border border-[#E5E7EB] rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
