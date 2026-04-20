'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';
import BadgeCard from '@/components/BadgeCard';
import { PageTransition, AnimatedCounter, AnimatedProgressBar, ShimmerSkeleton } from '@/lib/animations';
import { getUserBadges, getUserProgress, getStats } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import type { UserBadge, UserProgress, PlatformStats } from '@/lib/types';

export default function ProfilePage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'badges' | 'progress' | 'stats'>('badges');

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      router.replace('/auth');
      return;
    }
    Promise.all([
      getUserBadges(authUser.id).catch(() => []),
      getUserProgress(authUser.id).catch(() => []),
      getStats().catch(() => null),
    ]).then(([b, p, s]) => {
      setBadges(b);
      setProgress(p);
      setStats(s);
      setLoading(false);
    });
  }, [authUser, authLoading, router]);

  if (loading) {
    return (
      <>
        <TopBar />
        <div className="p-4 space-y-4">
          <ShimmerSkeleton className="h-52 w-full" rounded="rounded-2xl" />
          <ShimmerSkeleton className="h-12 w-full" rounded="rounded-2xl" />
          <ShimmerSkeleton className="h-32 w-full" rounded="rounded-2xl" />
        </div>
      </>
    );
  }

  const totalModulesCompleted = progress.reduce((acc, p) => acc + (p.completed_modules?.length || 0), 0);
  const quizzesCompleted = progress.filter(p => p.quiz_completed).length;
  const avgScore = quizzesCompleted > 0
    ? Math.round(progress.filter(p => p.quiz_completed).reduce((acc, p) => acc + (p.quiz_score || 0), 0) / quizzesCompleted)
    : 0;

  return (
    <>
      <TopBar />
      <PageTransition>
        {/* Profile Header */}
        <div className="px-4 pt-4 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 text-white text-center shadow-2xl shadow-indigo-500/25"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/20 rounded-full blur-2xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.2 }}
                className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-white/15 backdrop-blur-md border-2 border-white/25 text-3xl font-black"
                style={{ background: authUser?.avatar_color ? `${authUser.avatar_color}44` : undefined }}
              >
                {authUser?.display_name?.charAt(0).toUpperCase() || authUser?.username?.charAt(0).toUpperCase() || 'U'}
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-black"
              >
                {authUser?.display_name || authUser?.username || 'Utente'}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-sm text-indigo-200 mt-0.5"
              >
                @{authUser?.username} {authUser?.city ? `· 📍 ${authUser.city}` : ''}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.37 }}
                className="text-xs text-indigo-300 mt-0.5"
              >
                {authUser?.email}
              </motion.p>
              {authUser?.bio && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-2 text-sm text-indigo-100"
                >
                  {authUser.bio}
                </motion.p>
              )}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mt-5 flex items-center justify-center gap-6"
              >
                {[
                  { value: badges.length, label: 'Badge', icon: '🏅' },
                  { value: quizzesCompleted, label: 'Quiz', icon: '📝' },
                  { value: totalModulesCompleted, label: 'Moduli', icon: '📖' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-2xl font-black">
                      <AnimatedCounter value={stat.value} duration={1} />
                    </div>
                    <div className="text-[10px] text-indigo-200 font-medium">{stat.icon} {stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="px-4 mb-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-800 relative"
          >
            {([
              { key: 'badges' as const, label: 'Badge', icon: '🏅' },
              { key: 'progress' as const, label: 'Progressi', icon: '📊' },
              { key: 'stats' as const, label: 'Piattaforma', icon: '🌐' },
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex-1 rounded-xl py-2.5 text-xs font-bold transition-colors z-10 ${
                  activeTab === tab.key
                    ? 'text-zinc-900 dark:text-white'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="profileTab"
                    className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-xl shadow-sm"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.icon} {tab.label}</span>
              </button>
            ))}
          </motion.div>
        </div>

        {/* Tab Content */}
        <div className="px-4 pb-8">
          {activeTab === 'badges' && (
            <motion.div
              key="badges"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {badges.length === 0 ? (
                <div className="text-center py-12">
                  <motion.span
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-5xl inline-block"
                  >
                    🎯
                  </motion.span>
                  <h3 className="mt-3 font-bold text-zinc-900 dark:text-white">Nessun badge ancora</h3>
                  <p className="mt-1 text-sm text-zinc-500">Completa i quiz dei corsi per guadagnare badge!</p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/learn"
                      className="mt-4 inline-block rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25"
                    >
                      Esplora i corsi ✨
                    </Link>
                  </motion.div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {badges.map((badge, i) => (
                    <BadgeCard key={badge.id} badge={badge} index={i} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 p-4 dark:from-emerald-900/10 dark:to-teal-900/10 dark:border-emerald-800/30"
                >
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    <AnimatedCounter value={avgScore} />%
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5 font-medium">Media quiz</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                  className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 p-4 dark:from-blue-900/10 dark:to-indigo-900/10 dark:border-blue-800/30"
                >
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    <AnimatedCounter value={totalModulesCompleted} />
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5 font-medium">Moduli completati</div>
                </motion.div>
              </div>

              {progress.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-zinc-500">Nessun corso iniziato ancora</p>
                  <Link href="/learn" className="mt-2 inline-block text-sm font-semibold text-indigo-600 hover:underline">
                    Inizia un corso →
                  </Link>
                </div>
              ) : (
                progress.map((p, i) => (
                  <motion.div
                    key={p.course_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <Link
                      href={`/learn/${p.course_id}`}
                      className="block rounded-xl border border-zinc-200/80 p-4 transition-all hover:border-indigo-300/60 hover:shadow-lg hover:shadow-indigo-500/5 dark:border-zinc-700 dark:hover:border-indigo-700/50 card-shine"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">
                          {p.course_title || `Corso #${p.course_id}`}
                        </span>
                        {p.quiz_completed ? (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              (p.quiz_score || 0) >= 70
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                            }`}
                          >
                            Quiz: {p.quiz_score}%
                          </motion.span>
                        ) : null}
                      </div>
                      <AnimatedProgressBar
                        value={p.total_modules ? Math.round(((p.completed_modules?.length || 0) / p.total_modules) * 100) : 0}
                        className="h-1.5"
                      />
                      <p className="mt-1.5 text-xs text-zinc-500 font-medium">
                        {p.completed_modules?.length || 0}/{p.total_modules || '?'} moduli
                      </p>
                    </Link>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'stats' && stats && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <h3 className="font-bold text-zinc-900 dark:text-white text-sm flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                DevHub IT in numeri
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Posizioni attive', value: stats.total_jobs, icon: '💼', gradient: 'from-blue-50 to-cyan-50 border-blue-200/60 dark:from-blue-900/10 dark:to-cyan-900/10 dark:border-blue-800/30' },
                  { label: 'Corsi disponibili', value: stats.total_courses, icon: '📚', gradient: 'from-purple-50 to-indigo-50 border-purple-200/60 dark:from-purple-900/10 dark:to-indigo-900/10 dark:border-purple-800/30' },
                  { label: 'Quiz attivi', value: stats.total_quizzes, icon: '📝', gradient: 'from-orange-50 to-amber-50 border-orange-200/60 dark:from-orange-900/10 dark:to-amber-900/10 dark:border-orange-800/30' },
                  { label: 'Utenti iscritti', value: stats.total_users, icon: '👥', gradient: 'from-emerald-50 to-teal-50 border-emerald-200/60 dark:from-emerald-900/10 dark:to-teal-900/10 dark:border-emerald-800/30' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    whileHover={{ y: -3, scale: 1.02 }}
                    className={`rounded-xl bg-gradient-to-br ${stat.gradient} border p-4 hover-lift`}
                  >
                    <motion.div
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      className="text-2xl mb-1"
                    >
                      {stat.icon}
                    </motion.div>
                    <div className="text-2xl font-black text-zinc-900 dark:text-white">
                      <AnimatedCounter value={stat.value} duration={1.2} />
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5 font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </PageTransition>
    </>
  );
}
