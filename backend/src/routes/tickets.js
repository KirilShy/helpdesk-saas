const router = require('express').Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const TICKET_SELECT = `
  SELECT t.*,
         u.name  AS creator_name,
         u.email AS creator_email,
         a.name  AS assignee_name,
         a.email AS assignee_email
  FROM tickets t
  JOIN users u ON t.created_by = u.id
  LEFT JOIN users a ON t.assigned_to = a.id
`;

router.get('/', auth, async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const query = isAdmin
    ? `${TICKET_SELECT} ORDER BY t.created_at DESC`
    : `${TICKET_SELECT} WHERE t.created_by = $1 ORDER BY t.created_at DESC`;

  const { rows } = await db.query(query, isAdmin ? [] : [req.user.id]);
  res.json(rows);
});

router.get('/:id', auth, async (req, res) => {
  const { rows } = await db.query(`${TICKET_SELECT} WHERE t.id = $1`, [req.params.id]);
  const ticket = rows[0];
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  if (req.user.role !== 'admin' && ticket.created_by !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json(ticket);
});

router.post('/', auth, async (req, res) => {
  const { title, description, priority } = req.body;
  if (!title?.trim() || !description?.trim()) {
    return res.status(400).json({ error: 'title and description are required' });
  }

  const valid = ['low', 'medium', 'high', 'urgent'];
  const { rows } = await db.query(
    'INSERT INTO tickets (title, description, priority, created_by) VALUES ($1,$2,$3,$4) RETURNING *',
    [title.trim(), description.trim(), valid.includes(priority) ? priority : 'medium', req.user.id]
  );
  res.status(201).json(rows[0]);
});

router.patch('/:id/status', auth, requireRole('admin'), async (req, res) => {
  const valid = ['open', 'in-progress', 'resolved', 'closed'];
  if (!valid.includes(req.body.status)) {
    return res.status(400).json({ error: `status must be one of: ${valid.join(', ')}` });
  }

  const { rows } = await db.query(
    'UPDATE tickets SET status = $1 WHERE id = $2 RETURNING *',
    [req.body.status, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Ticket not found' });
  res.json(rows[0]);
});

router.patch('/:id/assign', auth, requireRole('admin'), async (req, res) => {
  const assigneeId = req.body.assignee_id || null;

  const { rows } = await db.query(
    'UPDATE tickets SET assigned_to = $1 WHERE id = $2 RETURNING *',
    [assigneeId, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Ticket not found' });
  res.json(rows[0]);
});

module.exports = router;
