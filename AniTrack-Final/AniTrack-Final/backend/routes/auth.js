const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

// REGISTER
router.post('/register', (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'All fields required' });

    const db = getDb();

    const existing = db.prepare('SELECT id FROM users WHERE email=? OR username=?').get(email, username);
    if (existing)
      return res.status(409).json({ error: 'Username or email already exists' });

    const id = uuidv4();
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)').run(id, username, email, hash);

    const token = jwt.sign({ id, username, email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id, username, email } });
  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// LOGIN
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email=?').get(email);

    if (!user)
      return res.status(401).json({ error: 'No account found with this email' });

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: 'Wrong password' });

    const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// GET PROFILE
router.get('/profile', authMiddleware, (req, res) => {
  try {
    const user = getDb().prepare('SELECT id, username, email, bio, created_at FROM users WHERE id=?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// UPDATE PROFILE
router.put('/profile', authMiddleware, (req, res) => {
  try {
    const { bio, username } = req.body;
    getDb().prepare('UPDATE users SET bio=COALESCE(?,bio), username=COALESCE(?,username) WHERE id=?').run(bio, username, req.user.id);
    return res.json({ message: 'Updated' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
