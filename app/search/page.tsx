'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '@/components/TopBar';
import { PageTransition } from '@/lib/animations';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import Link from 'next/link';
import { Search, UserPlus, UserCheck, Clock, MapPin, Briefcase, Code2, Building2 } from 'lucide-react';
import type { SearchResult } from '@/lib/types';

type FollowStatus = 'not_following' | 'pending' | 'following';

function UserCard({
  user,
  currentUserId,
}: {
  user: SearchResult;
  currentUserId: number | null;
}) {
  const [followStatus, setFollowStatus] = useState<FollowStatus>('not_following');
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!currentUserId || user.id === currentUserId) return;
    fetch(`/api/user/${user.id}/follow`)
      .then((r) => r.json())
      .then((d) => setFollowStatus(d.status ?? 'not_following'))
      .catch(() => {});
  }, [user.id, currentUserId]);

  const handleFollow = async () => {
    if (!currentUserId) return;
    setFollowLoading(true);
    try {
      if (followStatus === 'following' || followStatus === 'pending') {
        await fetch(`/api/user/${user.id}/follow`, { method: 'DELETE' });
        setFollowStatus('not_following');
      } else {
        const res = await fetch(`/api/user/${user.id}/follow`, { method: 'POST' });
        const data = await res.json();
        setFollowStatus(data.status === 'pending' ? 'pending' : 'following');
      }
    } catch { /* silent */ } finally {
      setFollowLoading(false);
    }
  };

  const initials = user.display_name
    ? user.display_name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : user.username?.slice(0, 2).toUpperCase() || 'U';

  const isCompany = user.role === 'company';
  const isSelf = user.id === currentUserId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-2xl border border-glass-border-subtle bg-surface-0 dark:bg-surface-1 p-4 shadow-xs hover:shadow-md transition-shadow"
    >
      {/* Avatar */}
      <Link href={`/profile/${user.username}`} className="relative shrink-0">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.display_name}
            className="h-12 w-12 rounded-full object-cover border-2 border-white/20 shadow-sm"
          />
        ) : (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-black text-white shadow-sm"
            style={{ background: user.avatar_color || '#6366f1' }}
          >
            {initials}
          </div>
        )}
        <span
          className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-white dark:border-zinc-900 text-[8px] ${
            isCompany
              ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
              : 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400'
          }`}
        >
          {isCompany ? '🏢' : '👨‍💻'}
        </span>
      </Link>
      <Link href={`/profile/${user.username}`} className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-bold text-foreground truncate">{user.display_name || user.username}</p>
          {isCompany && user.company_name && (
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded-full">
              {user.company_name}
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">@{user.username}</p>
        {user.title && (
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">{user.title}</p>
        )}
        {user.city && (
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-2.5 h-2.5 text-zinc-400" />
            <span className="text-[10px] text-zinc-400">{user.city}{user.region ? `, ${user.region}` : ''}</span>
          </div>
        )}
      </Link>

      {/* Follow button */}
      {currentUserId && !isSelf && (
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFollow}
          disabled={followLoading}
          className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all disabled:opacity-50 ${
            followStatus === 'following'
              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60'
              : followStatus === 'pending'
              ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60'
              : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm shadow-indigo-500/25'
          }`}
        >
          {followStatus === 'following' ? (
            <><UserCheck className="w-3.5 h-3.5" /> Segui</>
          ) : followStatus === 'pending' ? (
            <><Clock className="w-3.5 h-3.5" /> In attesa</>
          ) : (
            <><UserPlus className="w-3.5 h-3.5" /> Segui</>
          )}
        </motion.button>
      )}
    </motion.div>
  );
}

export default function SearchPage() {
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();

  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'worker' | 'company'>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback(async (q: string, role: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (role !== 'all') params.set('role', role);
      params.set('limit', '30');
      const res = await fetch(`/api/users/search?${params}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch { setResults([]); } finally { setLoading(false); }
  }, []);

  // Auto-search on mount to show suggested users
  useEffect(() => {
    search('', roleFilter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    search(query, roleFilter);
  };

  const handleRoleChange = (newRole: typeof roleFilter) => {
    setRoleFilter(newRole);
    search(query, newRole);
  };

  return (
    <>
      <TopBar />
      <PageTransition>
        <div className="px-4 pt-4 pb-24 max-w-2xl mx-auto space-y-4">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-5 text-white shadow-xl shadow-indigo-500/20"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Search className="w-5 h-5 text-indigo-200" />
                <h1 className="text-lg font-black">Cerca persone</h1>
              </div>
              <p className="text-xs text-indigo-200">Trova sviluppatori, designer e aziende italiane</p>
            </div>
          </motion.div>

          {/* Search form */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="space-y-3"
          >
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nome, username o ruolo…"
                  autoComplete="off"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 pl-9 pr-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/25"
              >
                Cerca
              </motion.button>
            </form>

            {/* Role filters */}
            <div className="flex gap-2">
              {([
                { key: 'all' as const,      label: 'Tutti',       icon: <Search className="w-3.5 h-3.5" /> },
                { key: 'worker' as const,   label: 'Sviluppatori', icon: <Code2 className="w-3.5 h-3.5" /> },
                { key: 'company' as const,  label: 'Aziende',     icon: <Building2 className="w-3.5 h-3.5" /> },
              ]).map(({ key, label, icon }) => (
                <motion.button
                  key={key}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleRoleChange(key)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                    roleFilter === key
                      ? 'border-indigo-400/60 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300'
                  }`}
                >
                  {icon}
                  {label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Results */}
          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-12"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full"
                />
              </motion.div>
            ) : searched && results.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-14 text-center"
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl mb-3"
                >
                  🔍
                </motion.div>
                <h3 className="font-bold text-zinc-700 dark:text-zinc-300">Nessun risultato</h3>
                <p className="text-sm text-zinc-500 mt-1">Prova con un termine diverso</p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                {results.length > 0 && (
                  <p className="text-xs text-zinc-500 font-medium px-1">
                    {results.length} {results.length === 1 ? 'risultato' : 'risultati'}
                    {query ? ` per "${query}"` : ''}
                  </p>
                )}
                {results.map((u) => (
                  <UserCard key={u.id} user={u} currentUserId={currentUser?.id ?? null} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </PageTransition>
    </>
  );
}
