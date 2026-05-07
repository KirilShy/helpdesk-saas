const router = require('express').Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

router.get('/:id/comments', auth, async (req, res) => {
  const { rows } = await db.query(
    `SELECT c.*, u.name AS author_name, u.role AS author_role
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.ticket_id = $1
     ORDER BY c.created_at ASC`,
    [req.params.id]
  );
  res.json(rows);
});

router.post('/:id/comments', auth, async (req, res) => {
  if (!req.body.body?.trim()) {
    return res.status(400).json({ error: 'Comment body is required' });
  }

  const ticket = await db.query('SELECT created_by FROM tickets WHERE id = $1', [req.params.id]);
  if (!ticket.rows[0]) return res.status(404).json({ error: 'Ticket not found' });
  if (req.user.role !== 'admin' && ticket.rows[0].created_by !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { rows } = await db.query(
    `WITH ins AS (
       INSERT INTO comments (ticket_id, user_id, body) VALUES ($1, $2, $3) RETURNING *
     )
     SELECT ins.*, u.name AS author_name, u.role AS author_role
     FROM ins JOIN users u ON ins.user_id = u.id`,
    [req.params.id, req.user.id, req.body.body.trim()]
  );
  res.status(201).json(rows[0]);
});

module.exports = router;
