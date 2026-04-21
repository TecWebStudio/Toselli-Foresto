'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '@/components/TopBar';
import CourseCard from '@/components/CourseCard';
import {
  AnimatedCounter, FloatingParticles, PageTransition,
  ShimmerSkeleton, StaggeredReveal, StaggeredRevealItem, SpringButton,
} from '@/lib/animations';
import { getListings, getCourses, getStats, getPosts, createPost } from '@/lib/api';
import type { Listing, Course, PlatformStats, Post } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';
import {
  Briefcase, BookOpen, MapPin, Plus,
  ArrowRight, Flame, Lightbulb,
} from 'lucide-react';

// ─── Quick action tiles ────────────────────────────────────────
const quickActions = [
  {
    href: '/listings',
    icon: <Briefcase className="w-5 h-5" />,
    label: 'Trova lavoro',
    gradient: 'from-blue-500 to-cyan-500',
    glow: 'rgba(59,130,246,0.25)',
  },
  {
    href: '/learn',
    icon: <BookOpen className="w-5 h-5" />,
    label: 'Impara',
    gradient: 'from-indigo-500 to-purple-500',
    glow: 'rgba(99,102,241,0.25)',
  },
  {
    href: '/publish',
    icon: <Plus className="w-5 h-5" />,
    label: 'Pubblica',
    gradient: 'from-purple-500 to-pink-500',
    glow: 'rgba(168,85,247,0.25)',
  },
  {
    href: '/map',
    icon: <MapPin className="w-5 h-5" />,
    label: 'Mappa',
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'rgba(16,185,129,0.25)',
  },
];

// ─── Trending tech chips ──────────────────────────────────────
const trendingTech = [
  { name: 'React',      color: '#61dafb' },
  { name: 'TypeScript', color: '#3178c6' },
  { name: 'Next.js',    color: '#6366f1' },
  { name: 'AWS',        color: '#ff9900' },
  { name: 'Docker',     color: '#2496ed' },
  { name: 'Kubernetes', color: '#326ce5' },
  { name: 'Python',     color: '#3776ab' },
  { name: 'Go',         color: '#00add8' },
];

// ─── Section header helper ────────────────────────────────────
function SectionHeader({
  gradient, title, href, hrefLabel,
}: { gradient: string; title: string; href?: string; hrefLabel?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className={`w-1 h-5 rounded-full bg-gradient-to-b ${gradient}`} />
        <h3 className="text-lg font-black text-foreground">{title}</h3>
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-sm font-semibold text-accent hover:underline group">
          {hrefLabel ?? 'Vedi tutti'}
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  const [postContent, setPostContent] = useState('');
  const [postTags, setPostTags] = useState('');
  const [posting, setPosting] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Buongiorno' : h < 18 ? 'Buon pomeriggio' : 'Buonasera');
  }, []);

  useEffect(() => {
    Promise.all([
      getListings().catch(() => []),
      getCourses().catch(() => []),
      getStats().catch(() => null),
      getPosts().catch(() => []),
    ]).then(([l, c, s, p]) => {
      setListings(l.slice(0, 5));
      setCourses(c.slice(0, 4));
      setStats(s);
      setPosts(p);
      setLoading(false);
    });
  }, []);

  const handleCreatePost = useCallback(async () => {
    if (!postContent.trim() || posting) return;
    setPosting(true);
    try {
      const tags = postTags.split(',').map(t => t.trim()).filter(Boolean);
      await createPost({ content: postContent.trim(), tags, post_type: 'text' });
      setPostContent('');
      setPostTags('');
      setComposerOpen(false);
      setPosts(await getPosts().catch(() => []));
    } catch { /* silent */ } finally {
      setPosting(false);
    }
  }, [postContent, postTags, posting]);

  return (
    <>
      <TopBar />
      <PageTransition>

        {/* ── Hero ──────────────────────────────────────────────── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-5 py-10 text-white lg:rounded-2xl lg:mx-0 lg:mt-2">
          <FloatingParticles count={14} color="#ffffff" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-pink-500/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm font-semibold text-indigo-200"
            >
              {greeting} {user ? `${user.display_name || user.username} 👋` : '👋'}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.55 }}
              className="mt-1 text-[1.8rem] font-black leading-tight tracking-tight"
              style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
            >
              La tua carriera IT
              <br />
              <span className="bg-gradient-to-r from-white via-indigo-100 to-white bg-clip-text text-transparent">
                inizia qui.
              </span>{' '}
              <motion.span
                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
                className="inline-block"
              >
                🚀
              </motion.span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-2 text-sm text-indigo-200/80 max-w-xs"
            >
              Trova lavoro, impara nuove competenze e ottieni certificazioni nel mondo tech.
            </motion.p>

            {/* Stats */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-5 grid grid-cols-3 gap-2.5"
              >
                {[
                  { value: stats.jobs,           label: 'Posizioni', icon: '💼' },
                  { value: stats.courses,         label: 'Corsi',    icon: '📚' },
                  { value: stats.badges_awarded,  label: 'Badge',    icon: '🏅' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1, type: 'spring', stiffness: 280 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="rounded-2xl bg-white/10 backdrop-blur-md p-3 text-center border border-white/10 hover:bg-white/15 transition-colors cursor-default"
                  >
                    <div className="text-lg mb-0.5">{stat.icon}</div>
                    <p className="text-xl font-black">
                      <AnimatedCounter value={stat.value} duration={1.2} />
                    </p>
                    <p className="text-[10px] text-indigo-200 font-medium">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* ── Quick Actions ─────────────────────────────────────── */}
        <section className="px-4 py-5">
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action, i) => (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={action.href}
                  className="flex flex-col items-center gap-2 group"
                >
                  <motion.div
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.92 }}
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${action.gradient} text-white shadow-lg transition-shadow group-hover:shadow-xl`}
                    style={{ boxShadow: `0 4px 16px ${action.glow}` }}
                  >
                    {action.icon}
                  </motion.div>
                  <span className="text-[11px] font-semibold text-foreground/80 text-center leading-tight">
                    {action.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Post Composer ─────────────────────────────────────── */}
        <section className="px-4 pb-4">
          {user ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-glass-border-subtle bg-surface-0 dark:bg-surface-1 p-4 shadow-xs"
            >
              {!composerOpen ? (
                <button
                  onClick={() => setComposerOpen(true)}
                  className="flex w-full items-center gap-3"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
                    style={{ background: user.avatar_color || '#6366f1' }}
                  >
                    {(user.display_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 rounded-xl bg-surface-2 px-4 py-2.5 text-left text-sm text-muted">
                    Condividi qualcosa con la community IT...
                  </div>
                </button>
              ) : (
                <div>
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white mt-1"
                      style={{ background: user.avatar_color || '#6366f1' }}
                    >
                      {(user.display_name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={postContent}
                        onChange={e => setPostContent(e.target.value)}
                        placeholder="Condividi un'idea, un progetto, una risorsa..."
                        maxLength={2000}
                        rows={3}
                        autoFocus
                        className="w-full resize-none rounded-xl bg-surface-1 dark:bg-surface-2/50 border border-glass-border-subtle px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50"
                      />
                      <input
                        value={postTags}
                        onChange={e => setPostTags(e.target.value)}
                        placeholder="Tag separati da virgola (es: react, typescript)"
                        className="mt-2 w-full rounded-xl bg-surface-1 dark:bg-surface-2/50 border border-glass-border-subtle px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pl-12">
                    <span className="text-xs text-muted-foreground">{postContent.length}/2000</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setComposerOpen(false); setPostContent(''); setPostTags(''); }}
                        className="rounded-xl px-4 py-1.5 text-xs font-semibold text-muted hover:bg-surface-2 transition-colors"
                      >
                        Annulla
                      </button>
                      <button
                        onClick={handleCreatePost}
                        disabled={!postContent.trim() || posting}
                        className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-500/25 disabled:opacity-40 transition-opacity"
                      >
                        {posting ? 'Pubblicando…' : 'Pubblica'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-dashed border-glass-border p-4 text-center"
            >
              <p className="text-sm text-muted">
                <Link href="/auth" className="font-semibold text-accent hover:underline">Accedi</Link>
                {' '}per pubblicare un post nella community IT
              </p>
            </motion.div>
          )}
        </section>

        {/* ── Community Feed ────────────────────────────────────── */}
        {posts.length > 0 && (
          <section className="px-4 pb-5">
            <SectionHeader gradient="from-indigo-500 to-purple-500" title="Community" />
            <StaggeredReveal className="space-y-3">
              <AnimatePresence mode="popLayout">
                {posts.map((post, i) => (
                  <StaggeredRevealItem key={post.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                      layout
                      className="rounded-2xl border border-glass-border-subtle bg-surface-0 dark:bg-surface-1 p-4 shadow-xs hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="flex items-center gap-3 mb-2.5">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
                          style={{ background: post.avatar_color || '#6366f1' }}
                        >
                          {(post.display_name || post.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{post.display_name || post.username}</p>
                          <p className="text-[10px] text-muted-foreground">
                            @{post.username} · {new Date(post.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {post.tags.map(tag => (
                            <span key={tag} className="rounded-full bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-glass-border-subtle">
                        <span className="text-xs text-muted-foreground">❤️ {post.likes_count}</span>
                        <span className="text-xs text-muted-foreground">💬 {post.comments_count}</span>
                      </div>
                    </motion.div>
                  </StaggeredRevealItem>
                ))}
              </AnimatePresence>
            </StaggeredReveal>
          </section>
        )}

        {/* ── Latest Listings ── horizontal scroll ─────────────── */}
        <section className="pb-5">
          <div className="px-4">
            <SectionHeader gradient="from-blue-500 to-cyan-500" title="Ultimi annunci" href="/listings" />
          </div>
          {loading ? (
            <div className="flex gap-3 px-4 overflow-x-auto pb-2">
              {[1, 2, 3].map(i => <ShimmerSkeleton key={i} className="h-36 w-60 flex-shrink-0" rounded="rounded-2xl" />)}
            </div>
          ) : listings.length === 0 ? (
            <div className="px-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-dashed border-glass-border p-6 text-center"
              >
                <p className="text-2xl mb-2">📋</p>
                <p className="text-sm font-semibold text-muted">Nessun annuncio ancora</p>
                <Link href="/publish">
                  <SpringButton className="mt-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/25">
                    Pubblica
                  </SpringButton>
                </Link>
              </motion.div>
            </div>
          ) : (
            <div className="flex gap-3 px-4 overflow-x-auto pb-2 scrollbar-hide">
              {listings.map((listing, i) => {
                const isOffer = listing.listing_type === 'job_offer';
                return (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.07 }}
                    className="flex-shrink-0 w-64 rounded-2xl border border-glass-border-subtle bg-surface-0 dark:bg-surface-1 p-4 shadow-xs hover:shadow-lg transition-shadow card-shine"
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${listing.author_avatar_color || '#6366f1'}, ${listing.author_avatar_color || '#8b5cf6'})` }}
                      >
                        {(listing.author_name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">
                          {listing.title}
                        </h4>
                        <p className="text-[10px] text-muted mt-0.5">
                          {listing.author_name}{listing.city ? ` · 📍 ${listing.city}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className={`mt-2.5 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isOffer
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                        : 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400'
                    }`}>
                      {isOffer ? '💼 Offerta' : '🧑‍💻 Richiesta'}
                    </span>
                    <p className="mt-2 text-xs text-muted line-clamp-2">{listing.description}</p>
                    {listing.salary_min && listing.salary_max && (
                      <p className="mt-2 text-xs font-bold gradient-text">
                        €{(listing.salary_min / 1000).toFixed(0)}K–€{(listing.salary_max / 1000).toFixed(0)}K
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Featured Courses ─────────────────────────────────── */}
        <section className="px-4 pb-5">
          <SectionHeader gradient="from-purple-500 to-pink-500" title="Percorsi formativi" href="/learn" />
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2].map(i => <ShimmerSkeleton key={i} className="h-56 w-full" rounded="rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {courses.map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* ── Tip del giorno ───────────────────────────────────── */}
        <section className="px-4 pb-5">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            whileHover={{ y: -2 }}
            className="rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200/60 p-5 dark:from-amber-900/10 dark:via-orange-900/10 dark:to-yellow-900/10 dark:border-amber-800/30 hover-lift"
          >
            <div className="flex items-center gap-2 mb-2">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="text-lg"
              >
                <Lightbulb className="w-5 h-5 text-amber-600" />
              </motion.span>
              <h3 className="font-black text-foreground text-sm">Consiglio del giorno</h3>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Le aziende IT italiane nel 2026 cercano principalmente profili con competenze in{' '}
              <span className="font-bold text-amber-700 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/20 px-1 rounded">Cloud (AWS/Azure)</span>,{' '}
              <span className="font-bold text-amber-700 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/20 px-1 rounded">React + TypeScript</span> e{' '}
              <span className="font-bold text-amber-700 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/20 px-1 rounded">Cybersecurity</span>.
            </p>
          </motion.div>
        </section>

        {/* ── Trending Technologies ─────────────────────────────── */}
        <section className="px-4 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
              <Flame className="w-4 h-4 text-emerald-500" />
              <h3 className="text-base font-black text-foreground">Trending ora</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingTech.map((tech, i) => (
                <motion.span
                  key={tech.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.05 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="chip-glow inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border border-glass-border-subtle bg-surface-0 dark:bg-surface-1 text-foreground/80 shadow-xs hover:shadow-md transition-shadow cursor-default"
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tech.color }} />
                  {tech.name}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </section>

      </PageTransition>
    </>
  );
}
