'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { getListings } from '@/lib/api';
import type { Listing } from '@/lib/types';
import Link from 'next/link';
import { Plus, ArrowRight } from 'lucide-react';
import { PageTransition, ShimmerSkeleton, StaggeredReveal, StaggeredRevealItem, SpringButton } from '@/lib/animations';

const CATEGORIES = [
  { id: '', label: 'Tutti', emoji: '✨' },
  { id: 'development', label: 'Dev', emoji: '💻' },
  { id: 'security', label: 'Security', emoji: '🔒' },
  { id: 'cloud', label: 'Cloud', emoji: '☁️' },
  { id: 'data', label: 'Data/AI', emoji: '📊' },
  { id: 'networking', label: 'Network', emoji: '🌐' },
  { id: 'design', label: 'UI/UX', emoji: '🎨' },
];

const workTypeLabels: Record<string, string> = { remote: 'Remoto', hybrid: 'Ibrido', onsite: 'In sede' };
const levelColors: Record<string, string> = {
  junior: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30',
  mid: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30',
  senior: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/30',
  lead: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/30',
};

function ListingCard({ listing, index }: { listing: Listing; index: number }) {
  const isOffer = listing.listing_type === 'job_offer';
  const tags: string[] = typeof listing.tags === 'string' ? JSON.parse(listing.tags as unknown as string) : (listing.tags || []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-glass-border-subtle bg-surface-0 dark:bg-surface-1 p-4 transition-all shadow-xs hover:shadow-lg group"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-black text-white shadow-sm"
          style={{ background: `linear-gradient(135deg, ${listing.author_avatar_color || '#6366f1'}, ${listing.author_avatar_color || '#8b5cf6'})` }}
        >
          {(listing.author_name || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-foreground text-sm leading-tight group-hover:text-accent transition-colors">
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
          <p className="text-xs text-muted mt-0.5">
            {listing.author_role === 'company'
              ? (listing.author_company_name || listing.author_name)
              : listing.author_name}
            {listing.city ? ` · 📍 ${listing.city}` : ''}
          </p>
        </div>
      </div>

      <p className="mt-2.5 text-xs text-muted line-clamp-2 leading-relaxed">
        {listing.description}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {listing.level && (
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${levelColors[listing.level] || 'text-muted bg-surface-2'}`}>
            {listing.level.charAt(0).toUpperCase() + listing.level.slice(1)}
          </span>
        )}
        <span className="rounded-full bg-surface-2 dark:bg-surface-2 px-2.5 py-0.5 text-[10px] font-medium text-muted">
          {workTypeLabels[listing.work_type] || listing.work_type}
        </span>
        {listing.salary_min && listing.salary_max && (
          <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            €{(listing.salary_min / 1000).toFixed(0)}k–€{(listing.salary_max / 1000).toFixed(0)}k
          </span>
        )}
        {tags.slice(0, 3).map((t) => (
          <span key={t} className="rounded-full bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 px-2.5 py-0.5 text-[10px] font-medium text-indigo-500 dark:text-indigo-400">
            {t}
          </span>
        ))}
        {tags.length > 3 && (
          <span className="text-[10px] text-muted-foreground">+{tags.length - 3}</span>
        )}
        <span className="ml-auto text-[10px] text-muted-foreground">
          {new Date(listing.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
        </span>
      </div>
    </motion.div>
  );
}

export default function ListingsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'job_offer' | 'service_proposal'>('all');
  const [category, setCategory] = useState('');

  useEffect(() => {
    setLoading(true);
    getListings({
      type: filter === 'all' ? undefined : filter,
      category: category || undefined,
    })
      .then(setListings)
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [filter, category]);

  return (
    <AuthGuard>
    <PageTransition>
      <div className="px-4 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-foreground">Bacheca</h1>
            <p className="text-sm text-muted mt-0.5">Offerte & proposte dalla community</p>
          </div>
          {user ? (
            <Link href="/publish">
              <SpringButton
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/25 hover:opacity-90 transition-all"
              >
                <Plus className="w-4 h-4" />
                Pubblica
              </SpringButton>
            </Link>
          ) : (
            <Link href="/auth">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="rounded-xl border border-indigo-300 dark:border-indigo-700 px-4 py-2.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
              >
                Accedi
              </motion.button>
            </Link>
          )}
        </div>

        {/* Filter tabs: Tutti / Offerte / Proposte */}
        <div className="flex rounded-2xl bg-surface-1 dark:bg-surface-1 p-1 gap-1">
          {([
            { id: 'all', label: 'Tutti' },
            { id: 'job_offer', label: '💼 Offerte' },
            { id: 'service_proposal', label: '🧑‍💻 Proposte' },
          ] as { id: typeof filter; label: string }[]).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all ${
                filter === f.id
                  ? 'bg-surface-0 dark:bg-surface-2 text-foreground shadow-xs'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Category scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                category === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'border border-glass-border-subtle text-muted hover:border-accent'
              }`}
            >
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* Map CTA */}
        <Link href="/map">
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4 cursor-pointer"
          >
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />
            <div className="relative flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur-sm">🗺️</div>
              <div className="flex-1">
                <p className="font-bold text-white">Esplora sulla Mappa</p>
                <p className="text-xs text-white/70">Scopri opportunità vicino a te</p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/70" />
            </div>
          </motion.div>
        </Link>

        {/* Results count */}
        {!loading && (
          <p className="text-xs text-muted-foreground">
            {listings.length === 0 ? 'Nessun risultato' : `${listings.length} annunci`}
          </p>
        )}

        {/* List */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <ShimmerSkeleton key={i} className="h-28 w-full" rounded="rounded-2xl" />
              ))}
            </motion.div>
          ) : listings.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-16 gap-3 text-center"
            >
              <div className="text-5xl">🔍</div>
              <p className="font-bold text-foreground/80">Nessun annuncio trovato</p>
              <p className="text-sm text-muted max-w-xs">
                {user ? 'Sii il primo a pubblicare un annuncio!' : 'Registrati e pubblica il tuo primo annuncio.'}
              </p>
              <Link href={user ? '/publish' : '/auth'}>
                <button className="mt-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition-colors">
                  {user ? 'Pubblica ora →' : 'Registrati →'}
                </button>
              </Link>
            </motion.div>
          ) : (
            <StaggeredReveal key="list" className="space-y-3">
              {listings.map((listing, i) => (
                <StaggeredRevealItem key={listing.id}>
                  <ListingCard listing={listing} index={i} />
                </StaggeredRevealItem>
              ))}
            </StaggeredReveal>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
    </AuthGuard>
  );
}
