const router = require('express').Router();
const { getDb } = require('../database');
const { authMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

router.get('/show/:showId', (req, res) => {
  res.json(getDb().prepare(`SELECT r.*,u.username FROM reviews r JOIN users u ON r.user_id=u.id WHERE r.show_id=? ORDER BY r.created_at DESC`).all(req.params.showId));
});

router.post('/show/:showId', authMiddleware, (req, res) => {
  const { rating, title, content, has_spoiler = 0 } = req.body;
  if (!rating) return res.status(400).json({ error: 'Rating required' });
  const db = getDb();
  db.prepare('INSERT OR REPLACE INTO reviews (id,user_id,show_id,rating,title,content,has_spoiler) VALUES (?,?,?,?,?,?,?)').run(uuidv4(), req.user.id, req.params.showId, rating, title, content, has_spoiler);
  const avg = db.prepare('SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE show_id=?').get(req.params.showId);
  db.prepare('UPDATE shows SET rating=?,rating_count=? WHERE id=?').run(Math.round(avg.avg * 10) / 10, avg.cnt, req.params.showId);
  res.json({ message: 'Submitted' });
});

module.exports = router;
