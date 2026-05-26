import { NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * POST /api/migrate-progress
 * Migrates user_progress and user_badges to reference auth_users instead of
 * the legacy users table. Safe to run multiple times (idempotent).
 */
export async function POST() {
  try {
    // ── user_progress ──────────────────────────────────────────
    await db.execute({
      sql: `CREATE TABLE IF NOT EXISTS user_progress_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        completed_modules TEXT DEFAULT '[]',
        quiz_score INTEGER DEFAULT 0,
        quiz_completed INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES auth_users(id),
        FOREIGN KEY (course_id) REFERENCES courses(id)
      )`,
      args: [],
    });

    // Copy only rows whose user_id exists in auth_users
    await db.execute({
      sql: `INSERT OR IGNORE INTO user_progress_new
              SELECT up.*
              FROM user_progress up
              WHERE up.user_id IN (SELECT id FROM auth_users)`,
      args: [],
    });

    await db.execute({ sql: `DROP TABLE IF EXISTS user_progress`, args: [] });
    await db.execute({ sql: `ALTER TABLE user_progress_new RENAME TO user_progress`, args: [] });

    // ── user_badges ────────────────────────────────────────────
    await db.execute({
      sql: `CREATE TABLE IF NOT EXISTS user_badges_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        badge_name TEXT NOT NULL,
        earned_date TEXT,
        score INTEGER,
        FOREIGN KEY (user_id) REFERENCES auth_users(id),
        FOREIGN KEY (course_id) REFERENCES courses(id)
      )`,
      args: [],
    });

    await db.execute({
      sql: `INSERT OR IGNORE INTO user_badges_new
              SELECT ub.*
              FROM user_badges ub
              WHERE ub.user_id IN (SELECT id FROM auth_users)`,
      args: [],
    });

    await db.execute({ sql: `DROP TABLE IF EXISTS user_badges`, args: [] });
    await db.execute({ sql: `ALTER TABLE user_badges_new RENAME TO user_badges`, args: [] });

    return NextResponse.json({ success: true, message: 'Migrazione completata' });
  } catch (error) {
    console.error('migrate-progress error:', error);
    return NextResponse.json({ error: 'Migrazione fallita', details: String(error) }, { status: 500 });
  }
}
