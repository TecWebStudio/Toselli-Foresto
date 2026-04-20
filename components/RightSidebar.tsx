'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getStats, getListings, getCourses } from '@/lib/api';
import type { PlatformStats, Listing, Course } from '@/lib/types';
import { AnimatedCounter } from '@/lib/animations';

const trendingTechs = [
  { name: 'React', color: '#61dafb', jobs: 47 },
  { name: 'TypeScript', color: '#3178c6', jobs: 38 },
  { name: 'Next.js', color: '#000000', jobs: 29 },
  { name: 'AWS', color: '#ff9900', jobs: 62 },
  { name: 'Docker', color: '#2496ed', jobs: 34 },
];

export default function RightSidebar() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    Promise.all([
      getStats().catch(() => null),
      getListings().catch(() => []),
      getCourses().catch(() => []),
    ]).then(([s, l, c]) => {
      setStats(s);
      setListings(l.slice(0, 3));
      setCourses(c.slice(0, 2));
    });
  }, []);

  return (
    <aside className="hidden xl:flex flex-col gap-4 fixed top-0 right-0 h-full overflow-y-auto py-6 px-4 scrollbar-hide border-l border-glass-border-subtle bg-glass backdrop-blur-2xl backdrop-saturate-[180%]"
      style={{ width: 'var(--right-sidebar-w)' }}
    >
      {/* Platform Stats */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-glass-border-subtle bg-surface-0/80 dark:bg-surface-1/80 backdrop-blur-sm p-4 shadow-xs"
        >
          <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Piattaforma</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Posizioni', value: stats.jobs, icon: '💼', color: 'from-blue-500/10 to-indigo-500/10' },
              { label: 'Corsi', value: stats.courses, icon: '📚', color: 'from-purple-500/10 to-pink-500/10' },
              { label: 'Utenti', value: stats.users, icon: '👥', color: 'from-emerald-500/10 to-teal-500/10' },
              { label: 'Badge', value: stats.badges_awarded, icon: '🏅', color: 'from-amber-500/10 to-orange-500/10' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className={`rounded-xl bg-gradient-to-br ${item.color} p-3 border border-glass-border-subtle`}
              >
                <div className="text-lg">{item.icon}</div>
                <div className="text-lg font-black text-foreground mt-1">
                  <AnimatedCounter value={Number(item.value)} duration={1} />
                </div>
                <div className="text-[10px] text-muted font-medium">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Listings */}
      {listings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-glass-border-subtle bg-surface-0/80 dark:bg-surface-1/80 backdrop-blur-sm p-4 shadow-xs"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Annunci recenti</h3>
            <Link href="/listings" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">vedi tutti</Link>
          </div>
          <div className="space-y-3">
            {listings.map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                whileHover={{ x: 3 }}
                className="flex items-center gap-3 group cursor-pointer"
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${listing.author_avatar_color || '#6366f1'}, ${listing.author_avatar_color || '#8b5cf6'}aa)` }}
                >
                  {(listing.author_name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{listing.title}</p>
                  <p className="text-[10px] text-muted truncate">{listing.author_name}{listing.city ? ` · ${listing.city}` : ''}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Trending Technologies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-glass-border-subtle bg-surface-0/80 dark:bg-surface-1/80 backdrop-blur-sm p-4 shadow-xs"
      >
        <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Tech Trending</h3>
        <div className="space-y-2">
          {trendingTechs.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.06 }}
              whileHover={{ x: 3 }}
              className="flex items-center justify-between group cursor-default"
            >
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tech.color }} />
                <span className="text-xs font-semibold text-foreground/80 group-hover:text-foreground transition-colors">{tech.name}</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">{tech.jobs} job</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Featured Courses */}
      {courses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-glass-border-subtle bg-surface-0/80 dark:bg-surface-1/80 backdrop-blur-sm p-4 shadow-xs"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Corsi consigliati</h3>
            <Link href="/learn" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">vedi tutti</Link>
          </div>
          <div className="space-y-3">
            {courses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.08 }}
              >
                <Link href={`/learn/${course.id}`} className="flex items-center gap-3 group">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${course.badge_color || '#6366f1'}33, ${course.badge_color || '#8b5cf6'}55)`, border: `1px solid ${course.badge_color || '#6366f1'}44` }}
                  >
                    📚
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{course.title}</p>
                    <p className="text-[10px] text-muted truncate">{course.level} · {course.duration}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <div className="text-[10px] text-muted-foreground px-1 pb-4">
        <p>© 2026 DevHub IT · Tutti i diritti riservati</p>
        <p className="mt-1">Piattaforma per professionisti IT italiani</p>
      </div>
    </aside>
  );
}
