const router = require('express').Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.use(auth, requireRole('admin'));

router.get('/users', async (_req, res) => {
  const { rows } = await db.query(
    'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
  );
  res.json(rows);
});

router.get('/stats', async (_req, res) => {
  const [total, byStatus, byPriority] = await Promise.all([
    db.query('SELECT COUNT(*)::int AS count FROM tickets'),
    db.query('SELECT status, COUNT(*)::int AS count FROM tickets GROUP BY status ORDER BY status'),
    db.query('SELECT priority, COUNT(*)::int AS count FROM tickets GROUP BY priority ORDER BY priority'),
  ]);
  res.json({
    total: total.rows[0].count,
    byStatus: byStatus.rows,
    byPriority: byPriority.rows,
  });
});

module.exports = router;
