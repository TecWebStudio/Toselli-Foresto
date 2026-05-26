import db from '@/lib/db';
import type { Listing } from '@/lib/types';
import ListingsClient from './ListingsClient';

export default async function ListingsPage() {
  const result = await db.execute({
    sql: `SELECT l.*, au.display_name as author_name, au.username as author_username,
                 au.avatar_color as author_avatar_color, au.role as author_role,
                 au.company_name as author_company_name
          FROM listings l
          JOIN auth_users au ON l.author_id = au.id
          WHERE l.is_active = 1
          ORDER BY l.created_at DESC`,
    args: [],
  }).catch(() => ({ rows: [] }));

  const listings = result.rows.map((r) => ({
    ...r,
    tags: typeof r.tags === 'string' ? JSON.parse(r.tags as string) : (r.tags ?? []),
  })) as unknown as Listing[];

  return <ListingsClient initialListings={listings} />;
}
