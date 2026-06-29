import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchFromSheet } from '../../services/api';

const RoleManager: React.FC = () => {
  const { user, can } = useAuth();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('faculty_coordinator');

  const loadRoles = async () => {
    try {
      const data: any = await fetchFromSheet('getRoles', { userEmail: user?.email });
      setRoles(data || []);
    } catch (err) {
      console.error('Failed to load roles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (can('manage_roles')) {
      loadRoles();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) return;
    
    const newRoleData = {
      id: `r${Date.now()}`,
      email: newEmail,
      name: newName,
      role: newRole,
      timestamp: new Date().toISOString()
    };

    try {
      await fetchFromSheet('addRole', { userEmail: user?.email, data: newRoleData });
      setRoles([...roles, newRoleData]);
      setNewEmail('');
      setNewName('');
    } catch (err) {
      console.error('Failed to add role', err);
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this role?')) return;
    try {
      await fetchFromSheet('deleteRole', { userEmail: user?.email, id });
      setRoles(roles.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete role', err);
    }
  };

  if (!can('manage_roles')) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-8 text-center">
        <h2 className="text-xl font-bold text-red-500 mb-2">Access Denied</h2>
        <p className="text-gray-500">You do not have permission to manage roles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F63] mb-2 font-grotesk">Role Management</h1>
          <p className="text-[#667085] text-sm">Assign administrative roles to users.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
        <h3 className="font-bold text-[#0B1F63] mb-4">Add New Role</h3>
        <form onSubmit={handleAddRole} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="email"
            placeholder="User Email"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#0B1F63]/20"
            required
          />
          <input
            type="text"
            placeholder="Name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#0B1F63]/20"
            required
          />
          <select
            value={newRole}
            onChange={e => setNewRole(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#0B1F63]/20"
          >
            <option value="faculty_coordinator">Faculty Coordinator</option>
            <option value="tech_admin">Tech Admin</option>
            <option value="core_admin">Core Admin</option>
            <option value="mentor">Mentor</option>
          </select>
          <button
            type="submit"
            className="w-full bg-[#0B1F63] text-white font-semibold rounded-xl px-4 py-2 hover:bg-[#071545] transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Add Role
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#667085]">Loading roles...</div>
        ) : roles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#667085]">
              <thead className="bg-[rgba(11,31,99,0.03)] text-[#0B1F63] uppercase font-bold text-xs">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map(role => (
                  <tr key={role.id} className="border-b border-[#E5E7EB] hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#0B1F63]">{role.name}</td>
                    <td className="px-6 py-4">{role.email}</td>
                    <td className="px-6 py-4">
                      <span className="bg-[#F5F3FF] text-[#7c3aed] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {role.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Revoke Role"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <ShieldAlert size={48} className="mx-auto text-[#F4B400] mb-4" />
            <h3 className="text-lg font-bold text-[#0B1F63] mb-1">No Roles Assigned</h3>
            <p className="text-[#667085]">There are currently no administrative roles assigned.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleManager;
