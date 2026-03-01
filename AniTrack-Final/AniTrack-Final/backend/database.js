const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db;

function getDb() {
  if (!db) {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    db = new Database(path.join(dataDir, 'anitrack.db'));
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
      avatar TEXT, bio TEXT DEFAULT '', created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS shows (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, original_title TEXT,
      type TEXT DEFAULT 'anime', genre TEXT, release_year INTEGER,
      total_episodes INTEGER DEFAULT 0, total_seasons INTEGER DEFAULT 1,
      status TEXT DEFAULT 'ongoing', synopsis TEXT, cover_image TEXT,
      rating REAL DEFAULT 0, rating_count INTEGER DEFAULT 0,
      streaming_platform TEXT, streaming_url TEXT, tags TEXT,
      barcode TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS watchlist (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, show_id TEXT NOT NULL,
      status TEXT DEFAULT 'plan_to_watch', episodes_watched INTEGER DEFAULT 0,
      score INTEGER DEFAULT 0, notes TEXT DEFAULT '',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (show_id) REFERENCES shows(id),
      UNIQUE(user_id, show_id)
    );
    CREATE TABLE IF NOT EXISTS clubs (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT,
      owner_id TEXT NOT NULL, member_count INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS club_members (
      club_id TEXT, user_id TEXT, role TEXT DEFAULT 'member',
      PRIMARY KEY(club_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS discussions (
      id TEXT PRIMARY KEY, club_id TEXT, author_id TEXT,
      title TEXT, content TEXT, has_spoiler INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY, discussion_id TEXT, author_id TEXT,
      content TEXT, has_spoiler INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY, user_id TEXT, show_id TEXT,
      rating INTEGER, title TEXT, content TEXT,
      has_spoiler INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, show_id)
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY, user_id TEXT, type TEXT,
      title TEXT, message TEXT, is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

module.exports = { getDb };
