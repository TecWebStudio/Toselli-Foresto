import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/posts — list posts (newest first)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit') || 30), 100);
    const offset = Number(searchParams.get('offset') || 0);

    const result = await db.execute({
      sql: `SELECT p.*, u.username, u.display_name, u.avatar_color
            FROM posts p
            LEFT JOIN auth_users u ON u.id = p.user_id
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?`,
      args: [limit, offset],
    });

    const posts = result.rows.map((r) => ({
      ...r,
      tags: typeof r.tags === 'string' ? JSON.parse(r.tags as string) : r.tags ?? [],
    }));

    return NextResponse.json(posts);
  } catch (err) {
    console.error('GET /api/posts error:', err);
    return NextResponse.json([], { status: 500 });
  }
}

// POST /api/posts — create a new post (requires auth cookie)
export async function POST(request: Request) {
  try {
    // Read session from cookie
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/session_token=([^;]+)/);
    if (!tokenMatch) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const session = await db.execute({
      sql: 'SELECT user_id FROM user_sessions WHERE token = ? AND expires_at > datetime(\'now\')',
      args: [tokenMatch[1]],
    });
    if (session.rows.length === 0) {
      return NextResponse.json({ error: 'Sessione scaduta' }, { status: 401 });
    }
    const userId = session.rows[0].user_id as number;

    const body = await request.json();
    const { content, image_url, post_type, tags } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Il contenuto è obbligatorio' }, { status: 400 });
    }
    if (content.length > 2000) {
      return NextResponse.json({ error: 'Massimo 2000 caratteri' }, { status: 400 });
    }

    const safeTags = Array.isArray(tags) ? tags.slice(0, 10).map((t: unknown) => String(t).slice(0, 50)) : [];

    const result = await db.execute({
      sql: `INSERT INTO posts (user_id, content, image_url, post_type, tags) VALUES (?, ?, ?, ?, ?)`,
      args: [userId, content.trim(), image_url || null, post_type || 'text', JSON.stringify(safeTags)],
    });

    return NextResponse.json({ id: Number(result.lastInsertRowid), success: true }, { status: 201 });
  } catch (err) {
    console.error('POST /api/posts error:', err);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
