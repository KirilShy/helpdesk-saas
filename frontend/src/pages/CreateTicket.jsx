import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

const PRIORITIES = [
  { value: 'low',    label: 'Low',    color: 'border-gray-300 text-gray-500',   active: 'border-gray-500 bg-gray-50 text-gray-700' },
  { value: 'medium', label: 'Medium', color: 'border-amber-300 text-amber-600', active: 'border-amber-500 bg-amber-50 text-amber-700' },
  { value: 'high',   label: 'High',   color: 'border-orange-300 text-orange-600', active: 'border-orange-500 bg-orange-50 text-orange-700' },
  { value: 'urgent', label: 'Urgent', color: 'border-red-300 text-red-500',     active: 'border-red-500 bg-red-50 text-red-700' },
];

export default function CreateTicket() {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/tickets', form);
      navigate(`/tickets/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit ticket.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-7">
        <Link to="/dashboard" className="text-gray-300 hover:text-gray-500 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submit a Ticket</h1>
          <p className="text-gray-400 text-sm mt-0.5">Describe your issue and our team will respond shortly</p>
        </div>
      </div>

      <div className="card p-7">
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Title <span className="text-red-400">*</span></label>
            <input
              type="text"
              className="input"
              placeholder="Brief summary of your issue"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              maxLength={255}
            />
          </div>

          <div>
            <label className="label">Priority</label>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {PRIORITIES.map(({ value, label, color, active }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, priority: value })}
                  className={`py-2.5 px-3 rounded-xl border-2 text-sm font-semibold text-center transition-all ${
                    form.priority === value ? active : `border-gray-200 text-gray-400 hover:${color}`
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Description <span className="text-red-400">*</span></label>
            <textarea
              className="input resize-none"
              rows={7}
              placeholder="Please describe your issue in detail. Include error messages, steps to reproduce, or any other relevant context…"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button type="submit" className="btn-primary px-6" disabled={loading}>
              {loading ? 'Submitting…' : 'Submit Ticket'}
            </button>
            <Link to="/dashboard" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
