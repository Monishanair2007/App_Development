const router = require('express').Router();
const { getDb } = require('../database');
const { authMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

router.get('/', (req, res) => {
  res.json(getDb().prepare(`SELECT c.*,u.username as owner_name FROM clubs c JOIN users u ON c.owner_id=u.id ORDER BY c.member_count DESC`).all());
});
router.get('/:id', (req, res) => {
  const db = getDb();
  const club = db.prepare(`SELECT c.*,u.username as owner_name FROM clubs c JOIN users u ON c.owner_id=u.id WHERE c.id=?`).get(req.params.id);
  if (!club) return res.status(404).json({ error: 'Not found' });
  const members = db.prepare(`SELECT u.id,u.username,cm.role FROM club_members cm JOIN users u ON cm.user_id=u.id WHERE cm.club_id=?`).all(req.params.id);
  const discussions = db.prepare(`SELECT d.*,u.username as author_name FROM discussions d JOIN users u ON d.author_id=u.id WHERE d.club_id=? ORDER BY d.created_at DESC`).all(req.params.id);
  res.json({ ...club, members, discussions });
});
router.post('/', authMiddleware, (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const db = getDb(); const id = uuidv4();
  db.prepare('INSERT INTO clubs (id,name,description,owner_id) VALUES (?,?,?,?)').run(id, name, description, req.user.id);
  db.prepare('INSERT INTO club_members (club_id,user_id,role) VALUES (?,?,?)').run(id, req.user.id, 'owner');
  res.json({ id, message: 'Created' });
});
router.post('/:id/join', authMiddleware, (req, res) => {
  const db = getDb();
  if (db.prepare('SELECT * FROM club_members WHERE club_id=? AND user_id=?').get(req.params.id, req.user.id))
    return res.status(409).json({ error: 'Already a member' });
  db.prepare('INSERT INTO club_members (club_id,user_id) VALUES (?,?)').run(req.params.id, req.user.id);
  db.prepare('UPDATE clubs SET member_count=member_count+1 WHERE id=?').run(req.params.id);
  res.json({ message: 'Joined' });
});
router.post('/:id/discussions', authMiddleware, (req, res) => {
  const { title, content, has_spoiler = 0 } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Required' });
  const id = uuidv4();
  getDb().prepare('INSERT INTO discussions (id,club_id,author_id,title,content,has_spoiler) VALUES (?,?,?,?,?,?)').run(id, req.params.id, req.user.id, title, content, has_spoiler);
  res.json({ id });
});

module.exports = router;
