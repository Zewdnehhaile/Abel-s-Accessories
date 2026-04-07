import React, { useEffect, useMemo, useState } from 'react';
import { Log, Order, Product, RepairRequest, SalesStat, User } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, Users, TrendingUp, Lock, Plus, Pencil, Trash2, UserCircle, X } from 'lucide-react';
import { fetchLogs, fetchSalesStats, fetchUsers, toggleUserActive, createUser, updateUser, deleteUser, fetchUsageStats } from '../../services/adminService';
import { fetchProfile, updateProfile } from '../../services/userService';
import { fetchOrders } from '../../services/orderService';
import { fetchProducts } from '../../services/productService';
import { fetchRepairs } from '../../services/repairService';
import DashboardNotifications from '../../components/DashboardNotifications';
import { buildDashboardNotifications } from '../../utils/dashboardNotifications';

const SuperAdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [stats, setStats] = useState<SalesStat[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [usage, setUsage] = useState<{ totalUsers: number; activeUsers: number; totalLogins: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [userFormError, setUserFormError] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff'
  });
  const [selectedLogUser, setSelectedLogUser] = useState<string>('all');
  const [logsLoading, setLogsLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState('');
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    const isMountedRef = { current: true };
    setLoading(true);
    setError('');
    const loadAdminData = async () => {
      try {
        const [
          usersData,
          logsData,
          statsData,
          usageData,
          profileData,
          repairsData,
          ordersData,
          productsData
        ] = await Promise.all([
          fetchUsers(),
          fetchLogs(),
          fetchSalesStats(),
          fetchUsageStats(),
          fetchProfile(),
          fetchRepairs(),
          fetchOrders(),
          fetchProducts()
        ]);
        if (!isMountedRef.current) return;
        setUsers(usersData);
        setLogs(logsData);
        setStats(statsData);
        setUsage(usageData);
        setRepairs(repairsData);
        setOrders(ordersData);
        setProducts(productsData);
        setProfileForm({
          name: profileData.name || '',
          email: profileData.email || '',
          password: '',
          confirmPassword: ''
        });
        setError('');
      } catch (err: any) {
        if (!isMountedRef.current) return;
        setError(err?.message || 'Failed to load admin data.');
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };

    loadAdminData();
    const poll = window.setInterval(loadAdminData, 20000);
    const handleInventoryUpdate = () => loadAdminData();
    window.addEventListener('inventory-updated', handleInventoryUpdate);
    return () => {
      isMountedRef.current = false;
      window.clearInterval(poll);
      window.removeEventListener('inventory-updated', handleInventoryUpdate);
    };
  }, []);

  const handleToggleActive = async (userId: string) => {
    try {
      await toggleUserActive(userId);
      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);
    } catch (err: any) {
      setError(err?.message || 'Failed to update user status.');
    }
  };

  const openCreateUser = () => {
    setEditingUser(null);
    setUserForm({ name: '', email: '', password: '', role: 'staff' });
    setUserFormError('');
    setIsUserModalOpen(true);
  };

  const openEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({ name: user.name, email: user.email, password: '', role: user.role });
    setUserFormError('');
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingUser(true);
    setUserFormError('');
    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          name: userForm.name,
          email: userForm.email,
          password: userForm.password || undefined,
          role: userForm.role as User['role']
        });
      } else {
        if (!userForm.name || !userForm.email || !userForm.password) {
          setUserFormError('Name, email, and password are required.');
          setIsSavingUser(false);
          return;
        }
        await createUser({
          name: userForm.name,
          email: userForm.email,
          password: userForm.password,
          role: userForm.role as User['role']
        });
      }
      setIsUserModalOpen(false);
      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);
    } catch (err: any) {
      setUserFormError(err?.message || 'Failed to save user.');
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Delete ${user.name}?`)) return;
    try {
      await deleteUser(user.id);
      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete user.');
    }
  };

  const loadLogs = async (userId?: string) => {
    setLogsLoading(true);
    try {
      const logsData = await fetchLogs(userId);
      setLogs(logsData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load logs.');
    } finally {
      setLogsLoading(false);
    }
  };

  const handleLogFilterChange = (value: string) => {
    setSelectedLogUser(value);
    if (value === 'all') {
      loadLogs();
    } else {
      loadLogs(value);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError('');
    setProfileStatus('');
    if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
      setProfileError('Passwords do not match.');
      setProfileSaving(false);
      return;
    }
    try {
      const updated = await updateProfile({
        name: profileForm.name,
        email: profileForm.email,
        password: profileForm.password || undefined
      });
      localStorage.setItem('abel_user', JSON.stringify(updated));
      setProfileStatus('Profile updated successfully.');
      setProfileForm(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
    } catch (err: any) {
      setProfileError(err?.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const weeklyTotal = stats.reduce((sum, item) => sum + item.amount, 0);
  const dashboardNotifications = useMemo(
    () => buildDashboardNotifications({ repairs, orders, products }),
    [repairs, orders, products]
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">System Administration</h1>
          <p className="mt-1 text-sm text-gray-400">Monitor repairs, sales, and stock from one place.</p>
        </div>
        <DashboardNotifications
          items={dashboardNotifications}
          variant="dark"
          buttonLabel="System notifications"
          className="shrink-0"
        />
      </div>

      {loading && <div className="text-center text-[var(--text-muted)] py-10">Loading admin data...</div>}
      {error && <div className="text-center text-red-500 py-6">{error}</div>}

      {usage && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-dark-800 p-5 rounded-xl border border-dark-700 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400">
              <UserCircle size={22} />
            </div>
            <div>
              <p className="text-sm uppercase text-gray-400 tracking-widest font-bold">Total Users</p>
              <p className="text-2xl font-black text-white">{usage.totalUsers}</p>
            </div>
          </div>
          <div className="bg-dark-800 p-5 rounded-xl border border-dark-700 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users size={22} />
            </div>
            <div>
              <p className="text-sm uppercase text-gray-400 tracking-widest font-bold">Active Users</p>
              <p className="text-2xl font-black text-white">{usage.activeUsers}</p>
            </div>
          </div>
          <div className="bg-dark-800 p-5 rounded-xl border border-dark-700 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Lock size={22} />
            </div>
            <div>
              <p className="text-sm uppercase text-gray-400 tracking-widest font-bold">Total Logins</p>
              <p className="text-2xl font-black text-white">{usage.totalLogins}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Analytics Chart */}
        <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="text-brand-500" /> Weekly Revenue
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats} width={500} height={300}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  itemStyle={{ color: '#fbbf24' }}
                />
                <Bar dataKey="amount" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 border-t border-dark-700 pt-4">
            <div className="text-sm uppercase text-gray-400 tracking-widest font-bold mb-3">Weekly Breakdown</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-gray-400 text-[11px] uppercase">
                  <tr>
                    <th className="py-2">Day</th>
                    <th className="py-2 text-right">Revenue (ETB)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {stats.map(row => (
                    <tr key={row.date}>
                      <td className="py-2 text-gray-300">{row.date}</td>
                      <td className="py-2 text-right text-white font-semibold">{row.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-2 text-gray-400 font-bold">Total</td>
                    <td className="py-2 text-right text-white font-black">{weeklyTotal.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 shadow-xl">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="text-blue-500" /> User Accounts
              </h3>
              <button onClick={openCreateUser} className="btn btn-primary btn-sm flex items-center gap-2">
                <Plus size={14} /> Add User
              </button>
           </div>
           <div className="space-y-4">
              {users.map(u => (
                <div key={u.id} className="flex items-center justify-between p-4 bg-dark-900 rounded-lg border border-dark-700">
                   <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${u.role === 'super_admin' ? 'bg-red-600' : 'bg-brand-600'}`}>
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{u.name}</p>
                        <p className="text-sm text-gray-500">{u.email}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="text-sm uppercase bg-dark-800 border border-dark-600 text-gray-300 px-2 py-1 rounded">
                        {u.role.replace('_', ' ')}
                     </span>
                     <span className={`text-xs uppercase px-2 py-1 rounded border ${
                        u.isActive ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' : 'border-red-500/40 text-red-300 bg-red-500/10'
                     }`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                     </span>
                     <button
                       onClick={() => handleToggleActive(u.id)}
                       className={`text-xs px-2.5 py-1 rounded border ${
                         u.role === 'super_admin' ? 'opacity-40 cursor-not-allowed' : 'border-dark-600 hover:bg-dark-700'
                       }`}
                       disabled={u.role === 'super_admin'}
                     >
                       {u.role === 'super_admin' ? 'Protected' : u.isActive ? 'Deactivate' : 'Activate'}
                     </button>
                     <button
                       onClick={() => openEditUser(u)}
                       className={`p-2 rounded-lg border ${
                         u.role === 'super_admin' ? 'opacity-40 cursor-not-allowed border-dark-700' : 'border-dark-600 hover:bg-dark-700'
                       }`}
                       disabled={u.role === 'super_admin'}
                       title="Edit user"
                     >
                       <Pencil size={14} className="text-blue-300" />
                     </button>
                     <button
                       onClick={() => handleDeleteUser(u)}
                       className={`p-2 rounded-lg border ${
                         u.role === 'super_admin' ? 'opacity-40 cursor-not-allowed border-dark-700' : 'border-dark-600 hover:bg-dark-700'
                       }`}
                       disabled={u.role === 'super_admin'}
                       title="Delete user"
                     >
                       <Trash2 size={14} className="text-red-300" />
                     </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Profile Settings */}
      <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 shadow-xl mb-8">
        <h3 className="text-lg font-bold text-white mb-6">Profile Settings</h3>
        {profileStatus && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-base rounded-lg p-3 mb-4">
            {profileStatus}
          </div>
        )}
        {profileError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-base rounded-lg p-3 mb-4">
            {profileError}
          </div>
        )}
        <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="super-profile-name" className="block text-xs uppercase text-gray-400 font-bold mb-2">Full Name</label>
            <input
              id="super-profile-name"
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white"
            />
          </div>
          <div>
            <label htmlFor="super-profile-email" className="block text-xs uppercase text-gray-400 font-bold mb-2">Email</label>
            <input
              id="super-profile-email"
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white"
            />
          </div>
          <div>
            <label htmlFor="super-profile-password" className="block text-xs uppercase text-gray-400 font-bold mb-2">New Password</label>
            <input
              id="super-profile-password"
              type="password"
              value={profileForm.password}
              onChange={(e) => setProfileForm(prev => ({ ...prev, password: e.target.value }))}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white"
              placeholder="Leave blank to keep current"
            />
          </div>
          <div>
            <label htmlFor="super-profile-confirm" className="block text-xs uppercase text-gray-400 font-bold mb-2">Confirm Password</label>
            <input
              id="super-profile-confirm"
              type="password"
              value={profileForm.confirmPassword}
              onChange={(e) => setProfileForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white"
              placeholder="Confirm new password"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={profileSaving}
              className="btn btn-primary px-6"
            >
              {profileSaving ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Security Logs */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
        <div className="p-6 border-b border-dark-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="text-red-500" /> Security & System Logs
          </h3>
          <div className="flex items-center gap-3">
            <label className="text-sm uppercase text-gray-400 font-bold tracking-widest">Filter</label>
            <select
              value={selectedLogUser}
              onChange={(e) => handleLogFilterChange(e.target.value)}
              className="bg-dark-900 border border-dark-700 text-gray-200 text-xs rounded-lg px-3 py-2"
            >
              <option value="all">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-base text-gray-300">
            <thead className="bg-dark-900 text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">User/Source</th>
                <th className="px-6 py-3">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {logsLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-center text-gray-400">
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-center text-gray-500">
                    No logs found.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-dark-700/50">
                    <td className="px-6 py-4 text-gray-500">{log.timestamp}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{log.action}</div>
                      <div className="text-sm text-gray-500">{log.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{log.user || '-'}</div>
                      {log.ipAddress && <div className="text-sm text-gray-500">{log.ipAddress}</div>}
                      {log.location && <div className="text-sm text-gray-500">{log.location}</div>}
                    </td>
                    <td className="px-6 py-4">
                       <span className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full w-fit ${
                         log.type === 'security' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                       }`}>
                         {log.type === 'security' && <Lock size={12} />} {log.type}
                       </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {userFormError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-base rounded-lg p-3 mb-4">
                {userFormError}
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label htmlFor="user-name" className="block text-sm uppercase text-gray-400 font-bold mb-2">Full Name</label>
                <input
                  id="user-name"
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="user-email" className="block text-sm uppercase text-gray-400 font-bold mb-2">Email</label>
                <input
                  id="user-email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="user-role" className="block text-sm uppercase text-gray-400 font-bold mb-2">Role</label>
                <select
                  id="user-role"
                  value={userForm.role}
                  onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white"
                >
                  <option value="staff">Staff</option>
                  <option value="shop_admin">Shop Admin</option>
                </select>
              </div>
              <div>
                <label htmlFor="user-password" className="block text-sm uppercase text-gray-400 font-bold mb-2">
                  {editingUser ? 'New Password (optional)' : 'Password'}
                </label>
                <input
                  id="user-password"
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white"
                  required={!editingUser}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsUserModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={isSavingUser} className="btn btn-primary">
                  {isSavingUser ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
