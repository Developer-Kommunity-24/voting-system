-- 1. Create Users Table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  completed INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- 2. Create Items Table
CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  logo TEXT,
  qr_slug TEXT UNIQUE NOT NULL,
  total_voters INTEGER DEFAULT 0,
  qualified_voters INTEGER DEFAULT 0,
  qualified_rating_sum INTEGER DEFAULT 0,
  non_qualified_rating_sum INTEGER DEFAULT 0,
  qualified_avg_rating REAL DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- 3. Create Ratings Table
CREATE TABLE ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  item_id INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- 4. One rating per user per item
CREATE UNIQUE INDEX unique_vote ON ratings(user_id, item_id);

-- 5. Index for email lookups
CREATE UNIQUE INDEX idx_users_email ON users(email);
