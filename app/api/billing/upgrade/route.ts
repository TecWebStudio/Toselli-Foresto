import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import db from '@/lib/db';

// Ensure pro columns exist
async function ensureProColumns() {
  try {
    await db.execute(`ALTER TABLE auth_users ADD COLUMN is_pro INTEGER DEFAULT 0`);
  } catch { /* column already exists */ }
  try {
    await db.execute(`ALTER TABLE auth_users ADD COLUMN pro_since TEXT`);
  } catch { /* column already exists */ }
  try {
    await db.execute(`ALTER TABLE auth_users ADD COLUMN pro_expires TEXT`);
  } catch { /* column already exists */ }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { plan = 'monthly' } = body; // 'monthly' | 'yearly'

  await ensureProColumns();

  const now = new Date();
  const expires = new Date(now);
  if (plan === 'yearly') {
    expires.setFullYear(expires.getFullYear() + 1);
  } else {
    expires.setMonth(expires.getMonth() + 1);
  }

  await db.execute({
    sql: `UPDATE auth_users SET is_pro = 1, pro_since = ?, pro_expires = ? WHERE id = ?`,
    args: [now.toISOString(), expires.toISOString(), user.id],
  });

  return NextResponse.json({
    success: true,
    message: 'Abbonamento Pro attivato con successo!',
    pro_since: now.toISOString(),
    pro_expires: expires.toISOString(),
  });
}
