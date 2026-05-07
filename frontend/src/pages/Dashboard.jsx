import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

const FILTERS = ['all', 'open', 'in-progress', 'resolved', 'closed'];

export default function Dashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tickets')
      .then(({ data }) => setTickets(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? tickets : tickets.filter((t) => t.status === filter);

  const count = (s) => tickets.filter((t) => t.status === s).length;

  const statCards = [
    { label: 'Open',        value: count('open'),        color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100' },
    { label: 'In Progress', value: count('in-progress'), color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100' },
    { label: 'Resolved',    value: count('resolved'),    color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'admin' ? 'All Tickets' : 'My Tickets'}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {user?.role === 'admin' ? 'Manage and resolve support requests' : 'Track your support requests'}
          </p>
        </div>
        <Link to="/tickets/new" className="btn-primary shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Ticket
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map(({ label, value, color, bg, border }) => (
          <div key={label} className={`card p-5 ${bg} border ${border}`}>
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-4xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
              filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="card flex items-center justify-center h-48 text-gray-400 text-sm">Loading tickets…</div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <svg className="w-12 h-12 text-gray-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500 font-medium">No tickets found</p>
          <p className="text-gray-400 text-sm mt-1">
            {filter !== 'all' ? `No ${filter} tickets right now.` : 'Submit your first ticket to get started.'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Ticket', 'Status', 'Priority', ...(user?.role === 'admin' ? ['Submitted by'] : []), 'Assignee', 'Date'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 py-3.5">
                    <Link to={`/tickets/${ticket.id}`} className="group">
                      <p className="text-sm font-medium text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {ticket.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">#{ticket.id}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5"><StatusBadge status={ticket.status} /></td>
                  <td className="px-4 py-3.5"><PriorityBadge priority={ticket.priority} /></td>
                  {user?.role === 'admin' && (
                    <td className="px-4 py-3.5 text-sm text-gray-500">{ticket.creator_name}</td>
                  )}
                  <td className="px-4 py-3.5 text-sm text-gray-500">
                    {ticket.assignee_name ?? <span className="text-gray-300 italic">Unassigned</span>}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-400">
                    {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
