import React, { useEffect, useState } from 'react';
import { Log, SalesStat, User } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, Users, TrendingUp, Lock } from 'lucide-react';
import { fetchLogs, fetchSalesStats, fetchUsers, toggleUserActive } from '../../services/adminService';

const SuperAdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [stats, setStats] = useState<SalesStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');
    Promise.all([fetchUsers(), fetchLogs(), fetchSalesStats()])
      .then(([usersData, logsData, statsData]) => {
        if (!isMounted) return;
        setUsers(usersData);
        setLogs(logsData);
        setStats(statsData);
      })
      .catch(err => {
        if (!isMounted) return;
        setError(err?.message || 'Failed to load admin data.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8">System Administration</h1>

      {loading && <div className="text-center text-[var(--text-muted)] py-10">Loading admin data...</div>}
      {error && <div className="text-center text-red-500 py-6">{error}</div>}

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
        </div>

        {/* User Management */}
        <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 shadow-xl">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="text-blue-500" /> User Accounts
              </h3>
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
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="text-xs uppercase bg-dark-800 border border-dark-600 text-gray-300 px-2 py-1 rounded">
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
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Security Logs */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
        <div className="p-6 border-b border-dark-700">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="text-red-500" /> Security & System Logs
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-dark-900 text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">User/Source</th>
                <th className="px-6 py-3">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-dark-700/50">
                  <td className="px-6 py-4 text-gray-500">{log.timestamp}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{log.action}</div>
                    <div className="text-xs text-gray-500">{log.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div>{log.user || '-'}</div>
                    {log.ipAddress && <div className="text-xs text-gray-500">{log.ipAddress}</div>}
                    {log.location && <div className="text-xs text-gray-500">{log.location}</div>}
                  </td>
                  <td className="px-6 py-4">
                     <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full w-fit ${
                       log.type === 'security' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                     }`}>
                       {log.type === 'security' && <Lock size={12} />} {log.type}
                     </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
