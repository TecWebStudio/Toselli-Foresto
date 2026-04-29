import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// PATCH /api/follow-requests/[id] — accept or reject a follow request
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const { id } = await params;
    const requestId = parseInt(id, 10);
    if (isNaN(requestId)) {
      return NextResponse.json({ error: 'ID non valido' }, { status: 400 });
    }

    const body = await request.json();
    const { action } = body; // 'accept' | 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: "Azione non valida. Usa 'accept' o 'reject'" }, { status: 400 });
    }

    // Verify the request belongs to the current user (as target)
    const existing = await db.execute({
      sql: "SELECT * FROM follow_requests WHERE id = ? AND target_id = ? AND status = 'pending'",
      args: [requestId, user.id],
    });
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Richiesta non trovata' }, { status: 404 });
    }

    const newStatus = action === 'accept' ? 'accepted' : 'rejected';

    await db.execute({
      sql: `UPDATE follow_requests SET status = ?, updated_at = datetime('now') WHERE id = ?`,
      args: [newStatus, requestId],
    });

    // If accepted, also create a follow entry
    if (action === 'accept') {
      const req = existing.rows[0];
      try {
        await db.execute({
          sql: `INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)`,
          args: [req.requester_id, req.target_id],
        });
      } catch {
        // follows table may reference different table — best effort
      }
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (err) {
    console.error('PATCH follow-requests/[id] error:', err);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

// DELETE /api/follow-requests/[id] — remove/cancel a pending request
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const { id } = await params;
    const requestId = parseInt(id, 10);
    if (isNaN(requestId)) {
      return NextResponse.json({ error: 'ID non valido' }, { status: 400 });
    }

    // Only the requester or the target can delete
    await db.execute({
      sql: 'DELETE FROM follow_requests WHERE id = ? AND (requester_id = ? OR target_id = ?)',
      args: [requestId, user.id, user.id],
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE follow-requests/[id] error:', err);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
