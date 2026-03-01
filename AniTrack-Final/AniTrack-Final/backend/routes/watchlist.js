const router = require('express').Router();
const { getDb } = require('../database');
const { authMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

router.get('/', authMiddleware, (req, res) => {
  const { status } = req.query;
  let q = `SELECT w.*,s.title,s.cover_image,s.total_episodes,s.genre,s.rating as show_rating,s.streaming_platform,s.type,s.barcode FROM watchlist w JOIN shows s ON w.show_id=s.id WHERE w.user_id=?`;
  const p = [req.user.id];
  if (status && status !== 'all') { q += ' AND w.status=?'; p.push(status); }
  q += ' ORDER BY w.updated_at DESC';
  res.json(getDb().prepare(q).all(...p));
});

router.post('/', authMiddleware, (req, res) => {
  const { show_id, status = 'plan_to_watch' } = req.body;
  if (!show_id) return res.status(400).json({ error: 'show_id required' });
  const db = getDb();
  if (db.prepare('SELECT id FROM watchlist WHERE user_id=? AND show_id=?').get(req.user.id, show_id))
    return res.status(409).json({ error: 'Already in watchlist' });
  const id = uuidv4();
  db.prepare('INSERT INTO watchlist (id,user_id,show_id,status) VALUES (?,?,?,?)').run(id, req.user.id, show_id, status);
  res.json({ id, message: 'Added' });
});

router.put('/:showId', authMiddleware, (req, res) => {
  const { status, episodes_watched, score, notes } = req.body;
  getDb().prepare(`UPDATE watchlist SET status=COALESCE(?,status), episodes_watched=COALESCE(?,episodes_watched), score=COALESCE(?,score), notes=COALESCE(?,notes), updated_at=CURRENT_TIMESTAMP WHERE user_id=? AND show_id=?`).run(status, episodes_watched, score, notes, req.user.id, req.params.showId);
  res.json({ message: 'Updated' });
});

router.delete('/:showId', authMiddleware, (req, res) => {
  getDb().prepare('DELETE FROM watchlist WHERE user_id=? AND show_id=?').run(req.user.id, req.params.showId);
  res.json({ message: 'Removed' });
});

router.get('/stats', authMiddleware, (req, res) => {
  const db = getDb();
  const byStatus = db.prepare(`SELECT status, COUNT(*) as count FROM watchlist WHERE user_id=? GROUP BY status`).all(req.user.id);
  const total = db.prepare('SELECT SUM(episodes_watched) as t FROM watchlist WHERE user_id=?').get(req.user.id);
  res.json({ by_status: byStatus, total_episodes: total?.t || 0 });
});

module.exports = router;
