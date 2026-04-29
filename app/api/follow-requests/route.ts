import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// GET /api/follow-requests — get pending follow requests FOR the current user (as target)
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const result = await db.execute({
      sql: `SELECT fr.*, au.username as requester_username, au.display_name as requester_display_name, au.avatar_color as requester_avatar_color
            FROM follow_requests fr
            JOIN auth_users au ON au.id = fr.requester_id
            WHERE fr.target_id = ? AND fr.status = 'pending'
            ORDER BY fr.created_at DESC`,
      args: [user.id],
    });

    return NextResponse.json({
      requests: result.rows.map((row) => ({
        id: row.id,
        requester_id: row.requester_id,
        target_id: row.target_id,
        status: row.status,
        created_at: row.created_at,
        requester_username: row.requester_username,
        requester_display_name: row.requester_display_name,
        requester_avatar_color: row.requester_avatar_color,
      })),
    });
  } catch (err) {
    console.error('GET follow-requests error:', err);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

// POST /api/follow-requests — send a follow request to a user
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const body = await request.json();
    const { target_id } = body;

    if (!target_id) {
      return NextResponse.json({ error: 'target_id obbligatorio' }, { status: 400 });
    }

    if (target_id === user.id) {
      return NextResponse.json({ error: 'Non puoi seguire te stesso' }, { status: 400 });
    }

    // Check target user exists and is private
    const targetResult = await db.execute({
      sql: 'SELECT id, is_private FROM auth_users WHERE id = ?',
      args: [target_id],
    });
    if (targetResult.rows.length === 0) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
    }

    const target = targetResult.rows[0];
    if (!target.is_private) {
      return NextResponse.json({ error: "L'account è pubblico, nessuna richiesta necessaria" }, { status: 400 });
    }

    // Insert (upsert — if rejected, allow re-request)
    try {
      await db.execute({
        sql: `INSERT INTO follow_requests (requester_id, target_id, status, updated_at)
              VALUES (?, ?, 'pending', datetime('now'))
              ON CONFLICT(requester_id, target_id) DO UPDATE SET status = 'pending', updated_at = datetime('now')`,
        args: [user.id, target_id],
      });
    } catch {
      return NextResponse.json({ error: 'Richiesta già inviata' }, { status: 409 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST follow-requests error:', err);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
