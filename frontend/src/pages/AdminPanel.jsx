import { useState, useEffect } from 'react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

function StatCard({ label, value, sub }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-4xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/admin/users')])
      .then(([s, u]) => {
        setStats(s.data);
        setUsers(u.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-400 text-sm mt-0.5">System overview and user management</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {['overview', 'users'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Total Tickets" value={stats.total} />
            <StatCard label="Total Users" value={users.length} />
            <StatCard label="Admin Users" value={users.filter((u) => u.role === 'admin').length} />
          </div>

          <div className="grid grid-cols-2 gap-5">
            {/* By Status */}
            <div className="card p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Tickets by Status</h3>
              <div className="space-y-3">
                {stats.byStatus.length === 0 && <p className="text-sm text-gray-400">No tickets yet.</p>}
                {stats.byStatus.map((row) => (
                  <div key={row.status} className="flex items-center justify-between">
                    <StatusBadge status={row.status} />
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-indigo-400 h-1.5 rounded-full"
                          style={{ width: `${Math.round((row.count / stats.total) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-6 text-right">{row.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* By Priority */}
            <div className="card p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Tickets by Priority</h3>
              <div className="space-y-3">
                {stats.byPriority.length === 0 && <p className="text-sm text-gray-400">No tickets yet.</p>}
                {stats.byPriority.map((row) => (
                  <div key={row.priority} className="flex items-center justify-between">
                    <PriorityBadge priority={row.priority} />
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-indigo-400 h-1.5 rounded-full"
                          style={{ width: `${Math.round((row.count / stats.total) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-6 text-right">{row.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['User', 'Email', 'Role', 'Member since'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${u.role === 'admin' ? 'bg-indigo-500' : 'bg-gray-400'}`}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500">{u.email}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-400">
                    {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
