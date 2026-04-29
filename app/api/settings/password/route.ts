import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// PATCH /api/settings/password — change password
export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const body = await request.json();
    const { current_password, new_password, confirm_password } = body;

    if (!current_password || !new_password || !confirm_password) {
      return NextResponse.json({ error: 'Tutti i campi sono obbligatori' }, { status: 400 });
    }

    if (new_password.length < 6) {
      return NextResponse.json(
        { error: 'La nuova password deve avere almeno 6 caratteri' },
        { status: 400 }
      );
    }

    if (new_password !== confirm_password) {
      return NextResponse.json({ error: 'Le password non coincidono' }, { status: 400 });
    }

    // Retrieve current hash
    const result = await db.execute({
      sql: 'SELECT password_hash FROM auth_users WHERE id = ?',
      args: [user.id],
    });
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
    }

    const currentHash = result.rows[0].password_hash as string;
    const match = await bcrypt.compare(current_password, currentHash);
    if (!match) {
      return NextResponse.json({ error: 'Password attuale non corretta' }, { status: 400 });
    }

    const newHash = await bcrypt.hash(new_password, 12);
    await db.execute({
      sql: 'UPDATE auth_users SET password_hash = ? WHERE id = ?',
      args: [newHash, user.id],
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Password change error:', err);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
