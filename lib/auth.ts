import { cookies } from 'next/headers';
import db from '@/lib/db';
import type { AuthUser } from '@/lib/types';

const SESSION_COOKIE = 'devhub_session';
const SESSION_DAYS = 30;

export async function createSession(userId: number): Promise<string> {
  const token = generateToken();
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_DAYS);

  await db.execute({
    sql: 'INSERT INTO user_sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
    args: [userId, token, expires.toISOString()],
  });

  return token;
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const result = await db.execute({
    sql: `SELECT au.* FROM auth_users au
          JOIN user_sessions us ON us.user_id = au.id
          WHERE us.token = ? AND us.expires_at > datetime('now')`,
    args: [token],
  });

  if (result.rows.length === 0) return null;
  const row = result.rows[0];

  const avatarColor = (row.avatar_color as string) || '#6366f1';
  const rawIsPro = (row.is_pro as number) ?? 0;
  const proExpires = (row.pro_expires as string | null) ?? null;
  // Auto-expire: treat pro as inactive if the subscription period has passed
  const effectiveIsPro = rawIsPro === 1 && proExpires !== null && new Date(proExpires) > new Date() ? 1 : 0;

  return {
    id: row.id as number,
    email: row.email as string,
    role: row.role as 'worker' | 'company',
    display_name: row.display_name as string,
    username: row.username as string,
    avatar_color: avatarColor,
    avatar_url: (row.avatar_url as string | null) ?? null,
    theme_color: (row.theme_color as string) || avatarColor,
    title: (row.title as string) || '',
    bio: (row.bio as string) || '',
    company_name: row.company_name as string | null,
    company_website: row.company_website as string | null,
    lat: row.lat as number | null,
    lng: row.lng as number | null,
    city: (row.city as string) || '',
    region: (row.region as string) || '',
    country: (row.country as string) || 'Italia',
    created_at: row.created_at as string,
    language: (row.language as string) || 'it',
    is_private: (row.is_private as number) ?? 0,
    is_pro: effectiveIsPro,
    pro_since: (row.pro_since as string | null) ?? null,
    pro_expires: proExpires,
  };
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.execute({ sql: 'DELETE FROM user_sessions WHERE token = ?', args: [token] });
  }
  jar.delete(SESSION_COOKIE);
}

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
