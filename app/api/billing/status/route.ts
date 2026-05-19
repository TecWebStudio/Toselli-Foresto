import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ is_pro: false }, { status: 200 });
  }

  const isPro = (user.is_pro ?? 0) === 1;
  const proExpires = user.pro_expires ?? null;

  // Check if pro has expired
  const isExpired = proExpires ? new Date(proExpires) < new Date() : false;

  return NextResponse.json({
    is_pro: isPro && !isExpired,
    pro_since: user.pro_since,
    pro_expires: proExpires,
    is_expired: isExpired,
  });
}
