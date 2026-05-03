import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// POST /api/posts/[id]/like   — like a post
// DELETE /api/posts/[id]/like — unlike a post
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

    const { id } = await params;
    const postId = parseInt(id, 10);
    if (isNaN(postId)) return NextResponse.json({ error: 'ID non valido' }, { status: 400 });

    // Upsert like (ignore duplicate)
    await db.execute({
      sql: 'INSERT OR IGNORE INTO post_likes (post_id, user_id) VALUES (?, ?)',
      args: [postId, user.id],
    });

    // Recalculate likes_count from actual likes table
    await db.execute({
      sql: 'UPDATE posts SET likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = ?) WHERE id = ?',
      args: [postId, postId],
    });

    const result = await db.execute({ sql: 'SELECT likes_count FROM posts WHERE id = ?', args: [postId] });
    const likes_count = result.rows[0]?.likes_count ?? 0;

    return NextResponse.json({ success: true, likes_count, liked: true });
  } catch (err) {
    console.error('Like error:', err);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

    const { id } = await params;
    const postId = parseInt(id, 10);
    if (isNaN(postId)) return NextResponse.json({ error: 'ID non valido' }, { status: 400 });

    await db.execute({
      sql: 'DELETE FROM post_likes WHERE post_id = ? AND user_id = ?',
      args: [postId, user.id],
    });

    await db.execute({
      sql: 'UPDATE posts SET likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = ?) WHERE id = ?',
      args: [postId, postId],
    });

    const result = await db.execute({ sql: 'SELECT likes_count FROM posts WHERE id = ?', args: [postId] });
    const likes_count = result.rows[0]?.likes_count ?? 0;

    return NextResponse.json({ success: true, likes_count, liked: false });
  } catch (err) {
    console.error('Unlike error:', err);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

// GET /api/posts/[id]/like — check if current user liked this post
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ liked: false });

    const { id } = await params;
    const postId = parseInt(id, 10);

    const result = await db.execute({
      sql: 'SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?',
      args: [postId, user.id],
    });

    return NextResponse.json({ liked: result.rows.length > 0 });
  } catch {
    return NextResponse.json({ liked: false });
  }
}
