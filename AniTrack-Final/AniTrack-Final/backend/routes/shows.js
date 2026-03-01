const router = require('express').Router();
const { getDb } = require('../database');
const { v4: uuidv4 } = require('uuid');

router.get('/', (req, res) => {
  const { genre, type, search, sort = 'rating', limit = 20, offset = 0 } = req.query;
  const db = getDb();
  let q = 'SELECT * FROM shows WHERE 1=1';
  const p = [];
  if (search) { q += ' AND (title LIKE ? OR original_title LIKE ?)'; p.push(`%${search}%`, `%${search}%`); }
  if (genre) { q += ' AND genre LIKE ?'; p.push(`%${genre}%`); }
  if (type) { q += ' AND type=?'; p.push(type); }
  const sortMap = { rating: 'rating DESC', newest: 'release_year DESC', title: 'title ASC' };
  q += ` ORDER BY ${sortMap[sort] || 'rating DESC'} LIMIT ? OFFSET ?`;
  p.push(parseInt(limit), parseInt(offset));
  const shows = db.prepare(q).all(...p);
  const total = db.prepare('SELECT COUNT(*) as c FROM shows').get().c;
  res.json({ shows, total });
});

router.get('/:id', (req, res) => {
  const show = getDb().prepare('SELECT * FROM shows WHERE id=?').get(req.params.id);
  if (!show) return res.status(404).json({ error: 'Not found' });
  res.json(show);
});

router.get('/barcode/:code', (req, res) => {
  const show = getDb().prepare('SELECT * FROM shows WHERE barcode=?').get(req.params.code);
  if (!show) return res.status(404).json({ error: 'Show not found for this barcode' });
  res.json(show);
});

router.get('/:id/recommendations', (req, res) => {
  const db = getDb();
  const show = db.prepare('SELECT * FROM shows WHERE id=?').get(req.params.id);
  if (!show) return res.status(404).json({ error: 'Not found' });
  const genres = show.genre ? show.genre.split(',') : [];
  if (!genres.length) return res.json([]);
  const recs = db.prepare(`SELECT * FROM shows WHERE id!=? AND (${genres.map(() => 'genre LIKE ?').join(' OR ')}) ORDER BY rating DESC LIMIT 6`).all(req.params.id, ...genres.map(g => `%${g.trim()}%`));
  res.json(recs);
});

module.exports = router;
