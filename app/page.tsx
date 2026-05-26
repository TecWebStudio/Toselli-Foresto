import db from '@/lib/db';
import type { Post, Listing } from '@/lib/types';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const [postsRes, listingsRes] = await Promise.all([
    db.execute({
      sql: `SELECT p.*, u.username, u.display_name, u.avatar_color
            FROM posts p
            LEFT JOIN auth_users u ON u.id = p.user_id
            ORDER BY p.created_at DESC
            LIMIT 30`,
      args: [],
    }).catch(() => ({ rows: [] })),
    db.execute({
      sql: `SELECT l.*, au.display_name as author_name, au.username as author_username,
                   au.avatar_color as author_avatar_color, au.role as author_role,
                   au.company_name as author_company_name
            FROM listings l
            JOIN auth_users au ON l.author_id = au.id
            WHERE l.is_active = 1
            ORDER BY l.created_at DESC
            LIMIT 5`,
      args: [],
    }).catch(() => ({ rows: [] })),
  ]);

  const posts = postsRes.rows.map((r) => ({
    ...r,
    tags: typeof r.tags === 'string' ? JSON.parse(r.tags as string) : (r.tags ?? []),
  })) as unknown as Post[];

  const listings = listingsRes.rows.map((r) => ({
    ...r,
    tags: typeof r.tags === 'string' ? JSON.parse(r.tags as string) : (r.tags ?? []),
  })) as unknown as Listing[];

  return <HomeClient initialPosts={posts} initialListings={listings} />;
}
