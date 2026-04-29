import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST() {
  try {
    // Add language column to auth_users (no-op if already exists)
    try {
      await db.execute({
        sql: `ALTER TABLE auth_users ADD COLUMN language TEXT DEFAULT 'it'`,
        args: [],
      });
    } catch {
      // Column already exists — ignore
    }

    // Add is_private column to auth_users (no-op if already exists)
    try {
      await db.execute({
        sql: `ALTER TABLE auth_users ADD COLUMN is_private INTEGER DEFAULT 0`,
        args: [],
      });
    } catch {
      // Column already exists — ignore
    }

    // Create follow_requests table
    await db.execute({
      sql: `CREATE TABLE IF NOT EXISTS follow_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requester_id INTEGER NOT NULL,
        target_id INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        UNIQUE(requester_id, target_id),
        FOREIGN KEY (requester_id) REFERENCES auth_users(id),
        FOREIGN KEY (target_id) REFERENCES auth_users(id)
      )`,
      args: [],
    });

    return NextResponse.json({ success: true, message: 'Settings schema migrated' });
  } catch (error) {
    console.error('Error migrating settings schema:', error);
    return NextResponse.json({ error: 'Migration failed', details: String(error) }, { status: 500 });
  }
}
