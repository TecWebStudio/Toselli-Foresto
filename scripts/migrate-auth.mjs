import { createClient } from '@libsql/client';

const client = createClient({
  url: 'libsql://toselli-foresto-maarcotoselli.aws-eu-west-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzMwNDM4MDYsImlkIjoiZWY1NTQ5MDQtM2ViNS00ZWY4LTliYWQtZWU1Njk3YjVhNmI3IiwicmlkIjoiYTQzZGRkZTktOTA5Yy00ODM5LTkwYjctZjhiOWZlYzQ5Mzg0In0.04i5V8JnaNFfWQdRi2xbDwkxO7d3gnZ3FAmI1ghQBN8dR2Cgj12q738iXOKyu48naWTfuto-2N8naVhUfdBtDQ'
});

// Extend users table cannot ALTER in SQLite easily, so we create a new profiles table
const migrations = [
  // Auth profiles with role and location
  `CREATE TABLE IF NOT EXISTS auth_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('worker','company')),
    display_name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    avatar_color TEXT DEFAULT '#6366f1',
    title TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    company_name TEXT,
    company_website TEXT,
    lat REAL,
    lng REAL,
    city TEXT DEFAULT '',
    region TEXT DEFAULT '',
    country TEXT DEFAULT 'Italia',
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  // User-published listings (both job offers by companies & service proposals by workers)
  `CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL,
    listing_type TEXT NOT NULL CHECK(listing_type IN ('job_offer','service_proposal')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    level TEXT DEFAULT 'mid',
    work_type TEXT DEFAULT 'remote',
    salary_min INTEGER,
    salary_max INTEGER,
    tags TEXT DEFAULT '[]',
    lat REAL,
    lng REAL,
    city TEXT DEFAULT '',
    region TEXT DEFAULT '',
    country TEXT DEFAULT 'Italia',
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (author_id) REFERENCES auth_users(id)
  )`,

  // Separate credentials table for email/password storage
  `CREATE TABLE IF NOT EXISTS user_credentials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES auth_users(id)
  )`,
  // Sessions for auth_users
  `CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES auth_users(id)
  )`,
];

for (const sql of migrations) {
  await client.execute(sql);
  const name = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
  console.log('OK:', name);
}

console.log('DONE - Auth tables created');
