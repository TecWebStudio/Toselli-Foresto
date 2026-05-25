import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type');         // job_offer | service_proposal
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const active = searchParams.get('active') !== '0';

    let sql = `SELECT l.*, au.display_name as author_name, au.username as author_username, 
               au.avatar_color as author_avatar_color, au.role as author_role, au.company_name as author_company_name
               FROM listings l JOIN auth_users au ON l.author_id = au.id WHERE 1=1`;
    const args: (string | number)[] = [];

    if (active) {
      sql += ' AND l.is_active = 1';
    }
    if (type) {
      sql += ' AND l.listing_type = ?';
      args.push(type);
    }
    if (category) {
      sql += ' AND l.category = ?';
      args.push(category);
    }
    if (city) {
      sql += ' AND l.city LIKE ?';
      args.push(`%${city}%`);
    }

    sql += ' ORDER BY l.created_at DESC';

    const result = await db.execute({ sql, args });
    const listings = result.rows.map((row) => ({
      ...row,
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags as string) : row.tags,
    }));

    return NextResponse.json(listings);
  } catch (err) {
    console.error('Listings GET error:', err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Devi essere autenticato' }, { status: 401 });
    }

    const body = await request.json();
    const { listing_type, title, description, category, level, work_type, salary_min, salary_max, tags, lat, lng, city, region } = body;

    if (!title || !description || !listing_type) {
      return NextResponse.json({ error: 'Campi obbligatori mancanti' }, { status: 400 });
    }

    // Validate: companies can only post job_offer, workers can only post service_proposal
    if (user.role === 'company' && listing_type !== 'job_offer') {
      return NextResponse.json({ error: 'Le aziende possono solo pubblicare offerte di lavoro' }, { status: 403 });
    }
    if (user.role === 'worker' && listing_type !== 'service_proposal') {
      return NextResponse.json({ error: 'I lavoratori possono solo pubblicare proposte di servizio' }, { status: 403 });
    }

    // Enforce 1 active listing limit for free users (Pro = unlimited)
    if ((user.is_pro ?? 0) !== 1) {
      const existingListings = await db.execute({
        sql: 'SELECT COUNT(*) as count FROM listings WHERE author_id = ? AND is_active = 1',
        args: [user.id],
      });
      if (Number(existingListings.rows[0].count) >= 1) {
        return NextResponse.json({
          error: 'Con il piano Free puoi avere al massimo 1 annuncio attivo. Passa a Pro per annunci illimitati.',
          upgrade_required: true,
        }, { status: 403 });
      }
    }

    const result = await db.execute({
      sql: `INSERT INTO listings (author_id, listing_type, title, description, category, level, work_type, salary_min, salary_max, tags, lat, lng, city, region)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        user.id,
        listing_type,
        title,
        description,
        category || 'general',
        level || 'mid',
        work_type || 'remote',
        salary_min || null,
        salary_max || null,
        JSON.stringify(tags || []),
        lat ?? user.lat ?? null,
        lng ?? user.lng ?? null,
        city || user.city || '',
        region || user.region || '',
      ],
    });

    return NextResponse.json({ id: Number(result.lastInsertRowid), success: true });
  } catch (err) {
    console.error('Listings POST error:', err);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
