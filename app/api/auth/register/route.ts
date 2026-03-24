import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { createSession, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role, display_name, username, city, region, lat, lng, company_name, company_website } = body;

    if (!email || !password || !role || !display_name || !username || !city) {
      return NextResponse.json({ error: 'Campi obbligatori mancanti' }, { status: 400 });
    }

    if (!['worker', 'company'].includes(role)) {
      return NextResponse.json({ error: 'Ruolo non valido' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La password deve avere almeno 6 caratteri' }, { status: 400 });
    }

    // Check if email/username already taken
    const existing = await db.execute({
      sql: 'SELECT id FROM auth_users WHERE email = ? OR username = ?',
      args: [email, username],
    });
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Email o username già in uso' }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];
    const avatar_color = colors[Math.floor(Math.random() * colors.length)];

    const batchResult = await db.batch([
      {
        sql: `INSERT INTO auth_users (email, password_hash, role, display_name, username, avatar_color, city, region, lat, lng, company_name, company_website)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [email, password_hash, role, display_name, username, avatar_color, city || '', region || '', lat || null, lng || null, company_name || null, company_website || null],
      },
    ], 'write');

    const userId = Number(batchResult[0].lastInsertRowid);

    const token = await createSession(userId);
    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: userId,
        email,
        role,
        display_name,
        username,
        avatar_color,
        city: city || '',
        region: region || '',
        lat: lat || null,
        lng: lng || null,
      },
      token,
    });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
