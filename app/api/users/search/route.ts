import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/users/search?q=<query>&role=worker|company&city=<city>&limit=20
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    const role = searchParams.get('role');
    const city = searchParams.get('city');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

    const conditions: string[] = [];
    const args: (string | number)[] = [];

    if (q) {
      conditions.push('(username LIKE ? OR display_name LIKE ? OR title LIKE ?)');
      args.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    if (role === 'worker' || role === 'company') {
      conditions.push('role = ?');
      args.push(role);
    }

    if (city) {
      conditions.push('city LIKE ?');
      args.push(`%${city}%`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT id, username, display_name, avatar_color, avatar_url, theme_color,
             title, bio, city, region, role, company_name
      FROM auth_users
      ${where}
      ORDER BY display_name ASC
      LIMIT ?
    `;
    args.push(limit);

    const result = await db.execute({ sql, args });

    return NextResponse.json({ results: result.rows });
  } catch (err) {
    console.error('Search error:', err);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
