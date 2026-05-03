import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// GET /api/users/[username]/posts — fetch posts authored by a given username
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit') || 20), 50);
    const offset = Number(searchParams.get('offset') || 0);

    // Resolve user id from username
    const userRow = await db.execute({
      sql: 'SELECT id, is_private FROM auth_users WHERE username = ? LIMIT 1',
      args: [username],
    });
    if (userRow.rows.length === 0) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
    }
    const targetId = userRow.rows[0].id as number;
    const isPrivate = Number(userRow.rows[0].is_private) === 1;

    // If private, only return posts if viewer is following (or is the owner)
    if (isPrivate) {
      try {
        const viewer = await getSessionUser();
        if (!viewer) {
          return NextResponse.json({ posts: [], private: true });
        }
        if (viewer.id !== targetId) {
          const followRow = await db.execute({
            sql: 'SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?',
            args: [viewer.id, targetId],
          });
          if (followRow.rows.length === 0) {
            return NextResponse.json({ posts: [], private: true });
          }
        }
      } catch {
        return NextResponse.json({ posts: [], private: true });
      }
    }

    const result = await db.execute({
      sql: `SELECT p.*, u.username, u.display_name, u.avatar_color, u.avatar_url
            FROM posts p
            LEFT JOIN auth_users u ON u.id = p.user_id
            WHERE p.user_id = ?
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?`,
      args: [targetId, limit, offset],
    });

    const posts = result.rows.map((r) => ({
      ...r,
      tags: typeof r.tags === 'string' ? JSON.parse(r.tags as string) : r.tags ?? [],
    }));

    return NextResponse.json({ posts, private: false });
  } catch (err) {
    console.error('GET /api/users/[username]/posts error:', err);
    return NextResponse.json({ posts: [], private: false }, { status: 500 });
  }
}
