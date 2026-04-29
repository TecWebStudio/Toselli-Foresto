import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// PATCH /api/settings — update profile settings
export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const body = await request.json();
    const {
      display_name,
      username,
      bio,
      title,
      avatar_color,
      language,
      is_private,
      company_name,
      company_website,
    } = body;

    // Validate required fields
    if (display_name !== undefined && !display_name.trim()) {
      return NextResponse.json({ error: 'Il nome non può essere vuoto' }, { status: 400 });
    }
    if (username !== undefined) {
      if (!username.trim()) {
        return NextResponse.json({ error: "L'username non può essere vuoto" }, { status: 400 });
      }
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
        return NextResponse.json(
          { error: "L'username può contenere solo lettere, numeri e underscore (3-30 caratteri)" },
          { status: 400 }
        );
      }
      // Check uniqueness excluding current user
      const existing = await db.execute({
        sql: 'SELECT id FROM auth_users WHERE username = ? AND id != ?',
        args: [username, user.id],
      });
      if (existing.rows.length > 0) {
        return NextResponse.json({ error: 'Username già in uso' }, { status: 409 });
      }
    }

    // Build update query dynamically
    const updates: string[] = [];
    const args: (string | number | null)[] = [];

    if (display_name !== undefined) { updates.push('display_name = ?'); args.push(display_name.trim()); }
    if (username !== undefined) { updates.push('username = ?'); args.push(username.trim()); }
    if (bio !== undefined) { updates.push('bio = ?'); args.push(bio); }
    if (title !== undefined) { updates.push('title = ?'); args.push(title); }
    if (avatar_color !== undefined) { updates.push('avatar_color = ?'); args.push(avatar_color); }
    if (language !== undefined) { updates.push('language = ?'); args.push(language); }
    if (is_private !== undefined) { updates.push('is_private = ?'); args.push(is_private ? 1 : 0); }
    if (company_name !== undefined) { updates.push('company_name = ?'); args.push(company_name || null); }
    if (company_website !== undefined) { updates.push('company_website = ?'); args.push(company_website || null); }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'Nessun campo da aggiornare' }, { status: 400 });
    }

    args.push(user.id);
    await db.execute({
      sql: `UPDATE auth_users SET ${updates.join(', ')} WHERE id = ?`,
      args,
    });

    // Return updated user
    const result = await db.execute({
      sql: 'SELECT * FROM auth_users WHERE id = ?',
      args: [user.id],
    });
    const row = result.rows[0];

    return NextResponse.json({
      success: true,
      user: {
        id: row.id,
        email: row.email,
        role: row.role,
        display_name: row.display_name,
        username: row.username,
        avatar_color: row.avatar_color,
        title: row.title,
        bio: row.bio,
        company_name: row.company_name,
        company_website: row.company_website,
        city: row.city,
        region: row.region,
        country: row.country,
        language: row.language || 'it',
        is_private: row.is_private ?? 0,
        created_at: row.created_at,
      },
    });
  } catch (err) {
    console.error('Settings PATCH error:', err);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
