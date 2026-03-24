'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '@/components/TopBar';
import CourseCard from '@/components/CourseCard';
import { AnimatedCounter, FloatingParticles, PageTransition } from '@/lib/animations';
import { getListings, getCourses, getStats, getPosts, createPost } from '@/lib/api';
import type { Listing, Course, PlatformStats, Post } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  // Post creation state
  const [postContent, setPostContent] = useState('');
  const [postTags, setPostTags] = useState('');
  const [posting, setPosting] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buongiorno');
    else if (hour < 18) setGreeting('Buon pomeriggio');
    else setGreeting('Buonasera');
  }, []);

  useEffect(() => {
    Promise.all([
      getListings().catch(() => []),
      getCourses().catch(() => []),
      getStats().catch(() => null),
      getPosts().catch(() => []),
    ]).then(([listingsData, coursesData, statsData, postsData]) => {
      setListings(listingsData.slice(0, 5));
      setCourses(coursesData.slice(0, 4));
      setStats(statsData);
      setPosts(postsData);
      setLoading(false);
    });
  }, []);

  const handleCreatePost = useCallback(async () => {
    if (!postContent.trim() || posting) return;
    setPosting(true);
    try {
      const tags = postTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await createPost({ content: postContent.trim(), tags, post_type: 'text' });
      setPostContent('');
      setPostTags('');
      setComposerOpen(false);
      // Reload posts
      const fresh = await getPosts().catch(() => []);
      setPosts(fresh);
    } catch {
      // silent fail
    } finally {
      setPosting(false);
    }
  }, [postContent, postTags, posting]);

  return (
    <>
      <TopBar />
      <PageTransition>
        {/* Hero Section with particles */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-5 py-10 text-white lg:rounded-2xl lg:mx-0 lg:mt-2">
          <FloatingParticles count={15} color="#ffffff" />
          
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm text-indigo-200 font-medium"
            >
              {greeting} 👋
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-2xl font-black leading-tight mt-1"
            >
              La tua carriera IT
              <br />
              <span className="bg-gradient-to-r from-white via-indigo-100 to-white bg-clip-text">
                inizia qui.
              </span>{' '}
              <motion.span
                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                className="inline-block"
              >
                🚀
              </motion.span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-2 text-sm text-indigo-200 max-w-[280px]"
            >
              Trova lavoro, impara nuove competenze e ottieni certificazioni nel mondo tech.
            </motion.p>

            {/* Stats */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-6 grid grid-cols-3 gap-3"
              >
                {[
                  { value: stats.jobs, label: 'Posizioni', icon: '💼' },
                  { value: stats.courses, label: 'Corsi', icon: '📚' },
                  { value: stats.badges_awarded, label: 'Badge', icon: '🏅' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1, type: 'spring', stiffness: 300 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="rounded-2xl bg-white/10 backdrop-blur-md p-3 text-center border border-white/10 hover:bg-white/15 transition-colors"
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

        {/* Post Composer */}
        <section className="px-4 py-4">
          {user ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-2xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-900/80"
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
                  <div className="flex-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 px-4 py-2.5 text-left text-sm text-zinc-400">
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
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="Condividi un&apos;idea, un progetto, una risorsa..."
                        maxLength={2000}
                        rows={3}
                        autoFocus
                        className="w-full resize-none rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-700/50 px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500/50"
                      />
                      <input
                        value={postTags}
                        onChange={(e) => setPostTags(e.target.value)}
                        placeholder="Tag separati da virgola (es: react, typescript, cloud)"
                        className="mt-2 w-full rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-700/50 px-3 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pl-12">
                    <span className="text-xs text-zinc-400">{postContent.length}/2000</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setComposerOpen(false); setPostContent(''); setPostTags(''); }}
                        className="rounded-xl px-4 py-1.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        Annulla
                      </button>
                      <button
                        onClick={handleCreatePost}
                        disabled={!postContent.trim() || posting}
                        className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                      >
                        {posting ? 'Pubblicando...' : 'Pubblica'}
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
              transition={{ delay: 0.25 }}
              className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-4 text-center"
            >
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                <Link href="/auth" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Accedi</Link>
                {' '}per pubblicare un post nella community IT
              </p>
            </motion.div>
          )}
        </section>

        {/* Post Feed */}
        {posts.length > 0 && (
          <section className="px-4 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
              <h3 className="text-lg font-black text-zinc-900 dark:text-white">Community</h3>
            </div>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {posts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="rounded-2xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-900/80"
                  >
                    <div className="flex items-center gap-3 mb-2.5">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
                        style={{ background: post.avatar_color || '#6366f1' }}
                      >
                        {(post.display_name || post.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">
                          {post.display_name || post.username}
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          @{post.username} · {new Date(post.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                      {post.content}
                    </p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {post.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800">
                      <span className="text-xs text-zinc-400 flex items-center gap-1">❤️ {post.likes_count}</span>
                      <span className="text-xs text-zinc-400 flex items-center gap-1">💬 {post.comments_count}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* Latest Listings */}
        <section className="px-4 py-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
              <h3 className="text-lg font-black text-zinc-900 dark:text-white">Ultimi annunci</h3>
            </div>
            <Link href="/listings" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 group">
              Vedi tutti
              <motion.span
                className="inline-block"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`skeleton rounded-2xl h-28 stagger-${i}`} />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-center"
            >
              <p className="text-2xl mb-2">📋</p>
              <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Nessun annuncio ancora</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Pubblica il primo annuncio dalla community!</p>
              <Link href="/publish">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="mt-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/25"
                >
                  Pubblica
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {listings.map((listing, i) => {
                const isOffer = listing.listing_type === 'job_offer';
                return (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-2xl border border-zinc-200/80 bg-white p-4 transition-all hover:border-indigo-300/60 dark:border-zinc-800/80 dark:bg-zinc-900/80 card-shine group"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-black text-white shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${listing.author_avatar_color || '#6366f1'}, ${listing.author_avatar_color || '#8b5cf6'})` }}
                      >
                        {(listing.author_name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-zinc-900 dark:text-white text-sm leading-tight truncate">
                            {listing.title}
                          </h3>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            isOffer
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                              : 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400'
                          }`}>
                            {isOffer ? '💼 Offerta' : '🧑‍💻 Richiesta'}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {listing.author_name}{listing.city ? ` · 📍 ${listing.city}` : ''}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{listing.description}</p>
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      {listing.level && (
                        <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                          {listing.level.charAt(0).toUpperCase() + listing.level.slice(1)}
                        </span>
                      )}
                      {listing.salary_min && listing.salary_max && (
                        <span className="text-xs font-bold gradient-text">
                          €{(listing.salary_min / 1000).toFixed(0)}K–€{(listing.salary_max / 1000).toFixed(0)}K
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Featured Courses */}
        <section className="px-4 pb-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
              <h3 className="text-lg font-black text-zinc-900 dark:text-white">Percorsi formativi</h3>
            </div>
            <Link href="/learn" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              Vedi tutti
              <motion.span
                className="inline-block"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className={`skeleton rounded-2xl h-32 stagger-${i + 3}`} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Quick tips section */}
        <section className="px-4 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ y: -2 }}
            className="rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200/60 p-5 dark:from-amber-900/10 dark:via-orange-900/10 dark:to-yellow-900/10 dark:border-amber-800/30 hover-lift"
          >
            <div className="flex items-center gap-2 mb-3">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="text-lg"
              >
                💡
              </motion.span>
              <h3 className="font-black text-zinc-900 dark:text-white">Consiglio del giorno</h3>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Le aziende IT italiane nel 2026 cercano principalmente profili con competenze in{' '}
              <span className="font-bold text-amber-700 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/20 px-1 rounded">Cloud (AWS/Azure)</span>,{' '}
              <span className="font-bold text-amber-700 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/20 px-1 rounded">React + TypeScript</span> e{' '}
              <span className="font-bold text-amber-700 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/20 px-1 rounded">Cybersecurity</span>.
              Investi nella formazione su queste tecnologie per aumentare le tue opportunità.
            </p>
          </motion.div>
        </section>

        {/* Trending technologies */}
        <section className="px-4 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
              <h3 className="text-lg font-black text-zinc-900 dark:text-white">Tecnologie trending</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'React', color: '#61dafb' },
                { name: 'TypeScript', color: '#3178c6' },
                { name: 'Next.js', color: '#000000' },
                { name: 'AWS', color: '#ff9900' },
                { name: 'Docker', color: '#2496ed' },
                { name: 'Kubernetes', color: '#326ce5' },
                { name: 'Python', color: '#3776ab' },
                { name: 'Go', color: '#00add8' },
              ].map((tech, i) => (
                <motion.span
                  key={tech.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.05 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="chip-glow inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 shadow-sm hover:shadow-md transition-shadow cursor-default"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tech.color }} />
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
