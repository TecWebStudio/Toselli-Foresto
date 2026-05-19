import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import db from '@/lib/db';

export async function POST() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  await db.execute({
    sql: `UPDATE auth_users SET is_pro = 0, pro_expires = NULL WHERE id = ?`,
    args: [user.id],
  });

  return NextResponse.json({
    success: true,
    message: 'Abbonamento Pro cancellato.',
  });
}
