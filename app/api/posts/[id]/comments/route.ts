import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// GET /api/posts/[id]/comments — list comments with author info
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);
    if (isNaN(postId)) return NextResponse.json({ error: 'ID non valido' }, { status: 400 });

    const result = await db.execute({
      sql: `
        SELECT pc.id, pc.user_id, pc.post_id, pc.content, pc.created_at,
               au.username, au.display_name, au.avatar_color, au.avatar_url
        FROM post_comments pc
        LEFT JOIN auth_users au ON au.id = pc.user_id
        WHERE pc.post_id = ?
        ORDER BY pc.created_at ASC
        LIMIT 50
      `,
      args: [postId],
    });

    return NextResponse.json({ comments: result.rows });
  } catch (err) {
    console.error('Get comments error:', err);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

// POST /api/posts/[id]/comments — create a comment
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

    const { id } = await params;
    const postId = parseInt(id, 10);
    if (isNaN(postId)) return NextResponse.json({ error: 'ID non valido' }, { status: 400 });

    const { content } = await request.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Il commento non può essere vuoto' }, { status: 400 });
    }
    if (content.trim().length > 500) {
      return NextResponse.json({ error: 'Commento troppo lungo (max 500 caratteri)' }, { status: 400 });
    }

    await db.execute({
      sql: 'INSERT INTO post_comments (post_id, user_id, content) VALUES (?, ?, ?)',
      args: [postId, user.id, content.trim()],
    });

    // Update comments_count
    await db.execute({
      sql: 'UPDATE posts SET comments_count = (SELECT COUNT(*) FROM post_comments WHERE post_id = ?) WHERE id = ?',
      args: [postId, postId],
    });

    const countResult = await db.execute({
      sql: 'SELECT comments_count FROM posts WHERE id = ?',
      args: [postId],
    });

    return NextResponse.json({
      success: true,
      comments_count: countResult.rows[0]?.comments_count ?? 0,
    });
  } catch (err) {
    console.error('Post comment error:', err);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
