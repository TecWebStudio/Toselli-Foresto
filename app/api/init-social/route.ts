import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST() {
  try {
    // Social tables
    await db.batch([
      // User credentials / auth extended
      {
        sql: `CREATE TABLE IF NOT EXISTS user_credentials (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (user_id) REFERENCES users(id)
        )`,
        args: [],
      },
      // User sessions
      {
        sql: `CREATE TABLE IF NOT EXISTS user_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          token TEXT NOT NULL UNIQUE,
          expires_at TEXT NOT NULL,
          created_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (user_id) REFERENCES auth_users(id)
        )`,
        args: [],
      },
      // Follows
      {
        sql: `CREATE TABLE IF NOT EXISTS follows (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          follower_id INTEGER NOT NULL,
          following_id INTEGER NOT NULL,
          created_at TEXT DEFAULT (datetime('now')),
          UNIQUE(follower_id, following_id),
          FOREIGN KEY (follower_id) REFERENCES users(id),
          FOREIGN KEY (following_id) REFERENCES users(id)
        )`,
        args: [],
      },
      // Posts (feed items)
      {
        sql: `CREATE TABLE IF NOT EXISTS posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          image_url TEXT,
          post_type TEXT DEFAULT 'text',
          tags TEXT DEFAULT '[]',
          likes_count INTEGER DEFAULT 0,
          comments_count INTEGER DEFAULT 0,
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (user_id) REFERENCES users(id)
        )`,
        args: [],
      },
      // Post likes
      {
        sql: `CREATE TABLE IF NOT EXISTS post_likes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          post_id INTEGER NOT NULL,
          created_at TEXT DEFAULT (datetime('now')),
          UNIQUE(user_id, post_id),
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (post_id) REFERENCES posts(id)
        )`,
        args: [],
      },
      // Post comments
      {
        sql: `CREATE TABLE IF NOT EXISTS post_comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          post_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          created_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (post_id) REFERENCES posts(id)
        )`,
        args: [],
      },
      // Notifications
      {
        sql: `CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          actor_id INTEGER,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          body TEXT,
          link TEXT,
          is_read INTEGER DEFAULT 0,
          created_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (actor_id) REFERENCES users(id)
        )`,
        args: [],
      },
      // Saved jobs
      {
        sql: `CREATE TABLE IF NOT EXISTS saved_jobs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          job_id INTEGER NOT NULL,
          created_at TEXT DEFAULT (datetime('now')),
          UNIQUE(user_id, job_id),
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (job_id) REFERENCES jobs(id)
        )`,
        args: [],
      },
      // Saved courses
      {
        sql: `CREATE TABLE IF NOT EXISTS saved_courses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          course_id INTEGER NOT NULL,
          created_at TEXT DEFAULT (datetime('now')),
          UNIQUE(user_id, course_id),
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (course_id) REFERENCES courses(id)
        )`,
        args: [],
      },
      // Messages
      {
        sql: `CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sender_id INTEGER NOT NULL,
          receiver_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          is_read INTEGER DEFAULT 0,
          created_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (sender_id) REFERENCES users(id),
          FOREIGN KEY (receiver_id) REFERENCES users(id)
        )`,
        args: [],
      },
    ]);

    // Seed sample notifications for user 1
    const existing = await db.execute({
      sql: 'SELECT COUNT(*) as cnt FROM notifications WHERE user_id = 1',
      args: [],
    });
    const cnt = Number((existing.rows[0] as unknown as { cnt: number }).cnt);
    if (cnt === 0) {
      await db.batch([
        {
          sql: `INSERT INTO notifications (user_id, actor_id, type, title, body, link, is_read) VALUES (1, NULL, 'system', 'Benvenuto su DevHub IT! 🎉', 'Inizia esplorando i corsi e le opportunità di lavoro.', '/learn', 0)`,
          args: [],
        },
        {
          sql: `INSERT INTO notifications (user_id, actor_id, type, title, body, link, is_read) VALUES (1, NULL, 'badge', 'Completa il tuo primo quiz! 🏅', 'Supera un quiz per ottenere il tuo primo badge.', '/learn', 0)`,
          args: [],
        },
        {
          sql: `INSERT INTO notifications (user_id, actor_id, type, title, body, link, is_read) VALUES (1, NULL, 'job', 'Nuove posizioni disponibili 💼', 'Controlla le ultime opportunità di lavoro nel settore IT.', '/jobs', 0)`,
          args: [],
        },
      ]);
    }

    return NextResponse.json({ success: true, message: 'Social tables initialized' });
  } catch (error) {
    console.error('Error initializing social tables:', error);
    return NextResponse.json({ error: 'Initialization failed', details: String(error) }, { status: 500 });
  }
}
