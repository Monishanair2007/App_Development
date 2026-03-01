const router = require('express').Router();
const { getDb } = require('../database');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, (req, res) => {
  const db = getDb();
  const uid = req.user.id;
  const byStatus = db.prepare(`SELECT status,COUNT(*) as count FROM watchlist WHERE user_id=? GROUP BY status`).all(uid);
  const totalEps = db.prepare(`SELECT SUM(episodes_watched) as total FROM watchlist WHERE user_id=?`).get(uid);
  const avgScore = db.prepare(`SELECT AVG(score) as avg FROM watchlist WHERE user_id=? AND score>0`).get(uid);
  const topGenres = db.prepare(`SELECT s.genre,COUNT(*) as count FROM watchlist w JOIN shows s ON w.show_id=s.id WHERE w.user_id=? GROUP BY s.genre ORDER BY count DESC LIMIT 5`).all(uid);
  res.json({
    by_status: byStatus,
    total_episodes: totalEps?.total || 0,
    hours_watched: Math.round((totalEps?.total || 0) * 23 / 60),
    avg_score: Math.round((avgScore?.avg || 0) * 10) / 10,
    top_genres: topGenres,
  });
});

module.exports = router;
