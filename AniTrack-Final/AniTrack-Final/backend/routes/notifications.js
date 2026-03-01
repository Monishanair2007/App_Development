const router = require('express').Router();
const { getDb } = require('../database');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, (req, res) => {
  res.json(getDb().prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 30').all(req.user.id));
});
router.put('/read-all', authMiddleware, (req, res) => {
  getDb().prepare('UPDATE notifications SET is_read=1 WHERE user_id=?').run(req.user.id);
  res.json({ message: 'Done' });
});

module.exports = router;
