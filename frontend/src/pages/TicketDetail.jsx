import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

const STATUSES = ['open', 'in-progress', 'resolved', 'closed'];

function Avatar({ name, isAdmin, size = 'md' }) {
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
  return (
    <div className={`${sz} rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-white ${isAdmin ? 'bg-indigo-500' : 'bg-gray-400'}`}>
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    const reqs = [api.get(`/tickets/${id}`), api.get(`/tickets/${id}/comments`)];
    if (user.role === 'admin') reqs.push(api.get('/admin/users'));

    Promise.all(reqs)
      .then((results) => {
        setTicket(results[0].data);
        setComments(results[1].data);
        if (results[2]) setAdmins(results[2].data.filter((u) => u.role === 'admin'));
      })
      .finally(() => setLoading(false));
  }, [id, user.role]);

  const updateStatus = async (status) => {
    const { data } = await api.patch(`/tickets/${id}/status`, { status });
    setTicket((t) => ({ ...t, ...data }));
  };

  const updateAssign = async (assignee_id) => {
    await api.patch(`/tickets/${id}/assign`, { assignee_id: assignee_id || null });
    const found = admins.find((a) => String(a.id) === assignee_id);
    setTicket((t) => ({ ...t, assigned_to: found?.id ?? null, assignee_name: found?.name ?? null }));
  };

  const postComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const { data } = await api.post(`/tickets/${id}/comments`, { body: newComment });
      setComments((c) => [...c, data]);
      setNewComment('');
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    } finally {
      setPosting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading…</div>;
  if (!ticket) return <div className="text-center py-16 text-gray-500">Ticket not found.</div>;

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link to="/dashboard" className="mt-1.5 text-gray-300 hover:text-gray-500 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">#{ticket.id}</span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 leading-snug">{ticket.title}</h1>
          <p className="text-sm text-gray-400 mt-1">
            Opened by <span className="text-gray-600 font-medium">{ticket.creator_name}</span>
            {' · '}
            {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: description + comments */}
        <div className="col-span-2 space-y-5">
          {/* Description */}
          <div className="card p-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Description</h2>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Comments */}
          <div className="card p-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">
              Comments ({comments.length})
            </h2>

            {comments.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No comments yet — be the first to respond.</p>
            ) : (
              <div className="space-y-5 mb-6">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar name={c.author_name} isAdmin={c.author_role === 'admin'} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-800">{c.author_name}</span>
                        {c.author_role === 'admin' && (
                          <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-md font-medium">Staff</span>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(c.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap">
                        {c.body}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
            )}

            {/* Comment form */}
            <form onSubmit={postComment} className="flex gap-3">
              <Avatar name={user.name} isAdmin={user.role === 'admin'} />
              <div className="flex-1 space-y-2">
                <textarea
                  className="input resize-none"
                  rows={3}
                  placeholder="Add a comment…"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="flex justify-end">
                  <button type="submit" className="btn-primary" disabled={posting || !newComment.trim()}>
                    {posting ? 'Posting…' : 'Post comment'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right: metadata */}
        <div className="space-y-4">
          <div className="card p-5 space-y-5">
            {/* Status */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Status</p>
              {user.role === 'admin' ? (
                <select className="input text-sm" value={ticket.status} onChange={(e) => updateStatus(e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <StatusBadge status={ticket.status} />
              )}
            </div>

            {/* Priority */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Priority</p>
              <PriorityBadge priority={ticket.priority} />
            </div>

            {/* Assignee */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Assignee</p>
              {user.role === 'admin' ? (
                <select className="input text-sm" value={ticket.assigned_to ?? ''} onChange={(e) => updateAssign(e.target.value)}>
                  <option value="">Unassigned</option>
                  {admins.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              ) : (
                <p className="text-sm text-gray-600">{ticket.assignee_name ?? <span className="text-gray-400 italic">Unassigned</span>}</p>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* Creator */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Submitted by</p>
              <p className="text-sm font-medium text-gray-700">{ticket.creator_name}</p>
              <p className="text-xs text-gray-400">{ticket.creator_email}</p>
            </div>

            {/* Dates */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Created</p>
              <p className="text-sm text-gray-600">{new Date(ticket.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Updated</p>
              <p className="text-sm text-gray-600">{new Date(ticket.updated_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
