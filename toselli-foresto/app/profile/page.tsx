'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TopBar from '@/components/TopBar';
import BadgeCard from '@/components/BadgeCard';
import { getUser, getUserBadges, getUserProgress, getStats } from '@/lib/api';
import type { User, UserBadge, UserProgress, PlatformStats } from '@/lib/types';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'badges' | 'progress' | 'stats'>('badges');

  useEffect(() => {
    Promise.all([
      getUser(1).catch(() => null),
      getUserBadges(1).catch(() => []),
      getUserProgress(1).catch(() => []),
      getStats().catch(() => null),
    ]).then(([u, b, p, s]) => {
      setUser(u);
      setBadges(b);
      setProgress(p);
      setStats(s);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <>
        <TopBar />
        <div className="p-4 space-y-4">
          <div className="h-48 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-32 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
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
      <div className="animate-fade-in">
        {/* Profile Header */}
        <div className="px-4 pt-4 pb-6">
          <div className="rounded-2xl bg-linear-to-br from-indigo-600 via-purple-600 to-indigo-800 p-6 text-white text-center shadow-xl shadow-indigo-500/25">
            <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 text-3xl font-bold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2 className="text-xl font-bold">{user?.display_name || user?.username || 'Utente'}</h2>
            <p className="text-sm text-indigo-200 mt-0.5">{user?.email}</p>
            {user?.bio && (
              <p className="mt-2 text-sm text-indigo-100">{user.bio}</p>
            )}
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{badges.length}</div>
                <div className="text-xs text-indigo-200">Badge</div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center">
                <div className="text-2xl font-bold">{quizzesCompleted}</div>
                <div className="text-xs text-indigo-200">Quiz</div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center">
                <div className="text-2xl font-bold">{totalModulesCompleted}</div>
                <div className="text-xs text-indigo-200">Moduli</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 mb-4">
          <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
            {([
              { key: 'badges' as const, label: 'Badge', icon: '🏅' },
              { key: 'progress' as const, label: 'Progressi', icon: '📊' },
              { key: 'stats' as const, label: 'Piattaforma', icon: '🌐' },
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-4 pb-8">
          {activeTab === 'badges' && (
            <div className="animate-fade-in">
              {badges.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-4xl">🎯</span>
                  <h3 className="mt-3 font-semibold text-zinc-900 dark:text-white">Nessun badge ancora</h3>
                  <p className="mt-1 text-sm text-zinc-500">Completa i quiz dei corsi per guadagnare badge!</p>
                  <Link
                    href="/learn"
                    className="mt-4 inline-block rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25"
                  >
                    Esplora i corsi
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {badges.map(badge => (
                    <BadgeCard key={badge.id} badge={badge} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="animate-fade-in space-y-3">
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-4 dark:from-emerald-900/10 dark:to-teal-900/10 dark:border-emerald-800/30">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{avgScore}%</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Media quiz</div>
                </div>
                <div className="rounded-xl bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200 p-4 dark:from-blue-900/10 dark:to-indigo-900/10 dark:border-blue-800/30">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalModulesCompleted}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Moduli completati</div>
                </div>
              </div>

              {progress.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-zinc-500">Nessun corso iniziato ancora</p>
                  <Link href="/learn" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
                    Inizia un corso
                  </Link>
                </div>
              ) : (
                progress.map(p => (
                  <Link
                    key={p.course_id}
                    href={`/learn/${p.course_id}`}
                    className="block rounded-xl border border-zinc-200 p-4 transition-all hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                        Corso #{p.course_id}
                      </span>
                      {p.quiz_completed && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          (p.quiz_score || 0) >= 70
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                          Quiz: {p.quiz_score}%
                        </span>
                      )}
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
                      <div
                        className="h-1.5 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all"
                        style={{ width: `${p.total_modules ? Math.round(((p.completed_modules?.length || 0) / p.total_modules) * 100) : 0}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      {p.completed_modules?.length || 0}/{p.total_modules || '?'} moduli
                    </p>
                  </Link>
                ))
              )}
            </div>
          )}

          {activeTab === 'stats' && stats && (
            <div className="animate-fade-in space-y-3">
              <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">DevHub IT in numeri</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Posizioni attive', value: stats.total_jobs, icon: '💼', color: 'from-blue-50 to-cyan-50 border-blue-200 dark:from-blue-900/10 dark:to-cyan-900/10 dark:border-blue-800/30' },
                  { label: 'Corsi disponibili', value: stats.total_courses, icon: '📚', color: 'from-purple-50 to-indigo-50 border-purple-200 dark:from-purple-900/10 dark:to-indigo-900/10 dark:border-purple-800/30' },
                  { label: 'Quiz attivi', value: stats.total_quizzes, icon: '📝', color: 'from-orange-50 to-amber-50 border-orange-200 dark:from-orange-900/10 dark:to-amber-900/10 dark:border-orange-800/30' },
                  { label: 'Utenti iscritti', value: stats.total_users, icon: '👥', color: 'from-emerald-50 to-teal-50 border-emerald-200 dark:from-emerald-900/10 dark:to-teal-900/10 dark:border-emerald-800/30' },
                ].map(stat => (
                  <div key={stat.label} className={`rounded-xl bg-linear-to-br ${stat.color} border p-4`}>
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
