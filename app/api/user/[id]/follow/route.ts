import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// POST /api/user/[id]/follow   — follow a user
// DELETE /api/user/[id]/follow — unfollow a user
// GET    /api/user/[id]/follow — check follow status

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

    const { id } = await params;
    const targetId = parseInt(id, 10);
    if (isNaN(targetId) || targetId === currentUser.id) {
      return NextResponse.json({ error: 'ID non valido' }, { status: 400 });
    }

    // Check if target user exists and is private
    const targetResult = await db.execute({
      sql: 'SELECT id, is_private FROM auth_users WHERE id = ?',
      args: [targetId],
    });
    if (targetResult.rows.length === 0) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
    }

    const isPrivate = targetResult.rows[0].is_private;

    if (isPrivate) {
      // Insert a pending follow request
      await db.execute({
        sql: 'INSERT OR IGNORE INTO follow_requests (requester_id, target_id, status) VALUES (?, ?, ?)',
        args: [currentUser.id, targetId, 'pending'],
      });
      return NextResponse.json({ success: true, status: 'pending' });
    } else {
      // Direct follow
      await db.execute({
        sql: 'INSERT OR IGNORE INTO follows (follower_id, followed_id) VALUES (?, ?)',
        args: [currentUser.id, targetId],
      });
      return NextResponse.json({ success: true, status: 'following' });
    }
  } catch (err) {
    console.error('Follow error:', err);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });

    const { id } = await params;
    const targetId = parseInt(id, 10);
    if (isNaN(targetId)) return NextResponse.json({ error: 'ID non valido' }, { status: 400 });

    // Remove from follows
    await db.execute({
      sql: 'DELETE FROM follows WHERE follower_id = ? AND followed_id = ?',
      args: [currentUser.id, targetId],
    });

    // Also cancel any pending follow request
    await db.execute({
      sql: "DELETE FROM follow_requests WHERE requester_id = ? AND target_id = ? AND status = 'pending'",
      args: [currentUser.id, targetId],
    });

    return NextResponse.json({ success: true, status: 'not_following' });
  } catch (err) {
    console.error('Unfollow error:', err);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) return NextResponse.json({ status: 'not_following', following: false });

    const { id } = await params;
    const targetId = parseInt(id, 10);

    const followResult = await db.execute({
      sql: 'SELECT 1 FROM follows WHERE follower_id = ? AND followed_id = ?',
      args: [currentUser.id, targetId],
    });

    if (followResult.rows.length > 0) {
      return NextResponse.json({ status: 'following', following: true });
    }

    const requestResult = await db.execute({
      sql: "SELECT status FROM follow_requests WHERE requester_id = ? AND target_id = ? AND status = 'pending'",
      args: [currentUser.id, targetId],
    });

    if (requestResult.rows.length > 0) {
      return NextResponse.json({ status: 'pending', following: false });
    }

    return NextResponse.json({ status: 'not_following', following: false });
  } catch {
    return NextResponse.json({ status: 'not_following', following: false });
  }
}
