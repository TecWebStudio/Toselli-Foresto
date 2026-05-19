import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

// GET /api/users/[username] — fetch a public profile by username
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    const result = await db.execute({
      sql: `SELECT id, username, display_name, avatar_color, avatar_url, theme_color,
                   title, bio, city, region, country, role, company_name, company_website,
                   is_private, created_at, COALESCE(is_pro, 0) as is_pro
            FROM auth_users
            WHERE username = ?
            LIMIT 1`,
      args: [username],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
    }

    const profile = result.rows[0];

    // Follower / following counts
    const followerCount = await db.execute({
      sql: 'SELECT COUNT(*) as cnt FROM follows WHERE following_id = ?',
      args: [profile.id as number],
    });
    const followingCount = await db.execute({
      sql: 'SELECT COUNT(*) as cnt FROM follows WHERE follower_id = ?',
      args: [profile.id as number],
    });

    // Viewer's follow status (if authenticated)
    let followStatus: 'not_following' | 'pending' | 'following' = 'not_following';
    try {
      const viewer = await getSessionUser();
      if (viewer && viewer.id !== (profile.id as number)) {
        const followRow = await db.execute({
          sql: 'SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?',
          args: [viewer.id, profile.id as number],
        });
        if (followRow.rows.length > 0) {
          followStatus = 'following';
        } else {
          const reqRow = await db.execute({
            sql: "SELECT 1 FROM follow_requests WHERE requester_id = ? AND target_id = ? AND status = 'pending'",
            args: [viewer.id, profile.id as number],
          });
          if (reqRow.rows.length > 0) followStatus = 'pending';
        }
      }
    } catch { /* unauthenticated — keep not_following */ }

    return NextResponse.json({
      ...profile,
      followers_count: Number((followerCount.rows[0] as unknown as AnyRow).cnt),
      following_count: Number((followingCount.rows[0] as unknown as AnyRow).cnt),
      follow_status: followStatus,
    });
  } catch (err) {
    console.error('GET /api/users/[username] error:', err);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
