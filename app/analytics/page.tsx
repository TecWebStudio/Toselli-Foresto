'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';
import { useAuth } from '@/lib/AuthContext';
import {
  Crown, TrendingUp, Eye, Heart, MessageSquare, Share2,
  ArrowUpRight, ArrowDownRight, BarChart3, Users, Briefcase,
  Star, Calendar, Lock,
} from 'lucide-react';

// ─── Sparkline (mini SVG chart) ───────────────────────────────────────────────
function Sparkline({ data, color = '#4f6ef7', height = 40 }: { data: number[]; color?: string; height?: number }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - ((v - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  });
  const pathD = `M ${pts.join(' L ')}`;
  const areaD = `M 0,${height} L ${pts.join(' L ')} L ${w},${height} Z`;
  return (
    <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} className="shrink-0">
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sg-${color.replace('#', '')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last point dot */}
      <circle
        cx={w}
        cy={height - ((data[data.length - 1] - min) / range) * (height - 6) - 3}
        r="3"
        fill={color}
        stroke="white"
        strokeWidth="1.5"
      />
    </svg>
  );
}

// ─── Bar chart ────────────────────────────────────────────────────────────────
function BarChart({ data, labels, color = '#4f6ef7' }: { data: number[]; labels: string[]; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end justify-between gap-1 h-24 w-full">
      {data.map((v, i) => {
        const pct = (v / max) * 100;
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.5, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: `${pct}%`, backgroundColor: color, transformOrigin: 'bottom', opacity: 0.7 + 0.3 * (v / max) }}
              className="w-full rounded-t-sm min-h-[2px]"
            />
            <span className="text-[9px] text-muted-foreground">{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Metric card ──────────────────────────────────────────────────────────────
function MetricCard({
  icon: Icon, label, value, delta, deltaPositive, sparkData, color, delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
  sparkData: number[];
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-glass-border-subtle bg-surface-0 p-4 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: color + '18' }}
          >
            <Icon className="w-4 h-4" style={{ color }} strokeWidth={1.75} />
          </div>
          <span className="text-xs font-medium text-muted">{label}</span>
        </div>
        <div className={`flex items-center gap-0.5 text-xs font-semibold ${deltaPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
          {deltaPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {delta}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-extrabold text-foreground tracking-tight">{value}</span>
        <Sparkline data={sparkData} color={color} />
      </div>
    </motion.div>
  );
}

// ─── Pro Gate ─────────────────────────────────────────────────────────────────
function ProGate() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-5"
      >
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-yellow-400/10 border border-amber-300/30 dark:border-amber-700/30">
            <Lock className="w-9 h-9 text-amber-500/60" strokeWidth={1.5} />
          </div>
          <div className="absolute -top-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg shadow-amber-400/30">
            <Crown className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-foreground mb-1.5">Analytics è una funzione Pro</h2>
          <p className="text-sm text-muted max-w-xs leading-relaxed">
            Sblocca statistiche avanzate, performance dei post, visibilità dei listing e molto altro.
          </p>
        </div>
        <Link href="/pricing">
          <motion.div
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-xl px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 font-bold text-sm shadow-md shadow-amber-400/25 cursor-pointer"
          >
            <Crown className="w-4 h-4" strokeWidth={2.5} />
            Attiva Pro — €9.99/mese
          </motion.div>
        </Link>
        <p className="text-xs text-muted-foreground">Cancella in qualsiasi momento</p>
      </motion.div>
    </div>
  );
}

// ─── Mock data generation ─────────────────────────────────────────────────────
function makeSpark(base: number, len = 14) {
  return Array.from({ length: len }, (_, i) =>
    Math.max(0, Math.round(base + (Math.sin(i * 0.8) * base * 0.3) + (Math.random() - 0.4) * base * 0.4))
  );
}

const DAYS = ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'];

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (!loading && !user) router.replace('/auth');
  }, [user, loading, router]);

  if (loading || !user) return null;

  const isPro = (user.is_pro ?? 0) === 1;

  // Mock analytics data
  const postViews = [1240, 1380, 1190, 1520, 1680, 1450, 1720];
  const listingViews = [340, 280, 420, 510, 390, 460, 530];
  const profileVisits = [89, 102, 78, 134, 118, 145, 162];

  return (
    <>
      <TopBar />
      <div className="px-4 pt-4 pb-16">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-5"
        >
          <div>
            <h1 className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" strokeWidth={2} />
              Analytics
              {isPro && <span className="pro-badge">PRO</span>}
            </h1>
            <p className="text-xs text-muted mt-0.5">Performance della tua attività</p>
          </div>
          {isPro && (
            <div className="flex rounded-xl border border-glass-border-subtle bg-surface-1 p-0.5 gap-0.5">
              {(['7d', '30d', '90d'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    period === p
                      ? 'bg-surface-0 text-foreground shadow-sm'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {!isPro ? (
          <ProGate />
        ) : (
          <>
            {/* Summary metric cards */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <MetricCard
                icon={Eye}
                label="Visualizzazioni post"
                value="9.2k"
                delta="+14%"
                deltaPositive
                sparkData={makeSpark(220)}
                color="#4f6ef7"
                delay={0.05}
              />
              <MetricCard
                icon={Heart}
                label="Like totali"
                value="648"
                delta="+8%"
                deltaPositive
                sparkData={makeSpark(48)}
                color="#e63946"
                delay={0.1}
              />
              <MetricCard
                icon={Users}
                label="Visite profilo"
                value="1.1k"
                delta="+22%"
                deltaPositive
                sparkData={makeSpark(80)}
                color="#0ea57a"
                delay={0.15}
              />
              <MetricCard
                icon={Briefcase}
                label="Click annunci"
                value="284"
                delta="-3%"
                deltaPositive={false}
                sparkData={makeSpark(38)}
                color="#e8831a"
                delay={0.2}
              />
            </div>

            {/* Weekly bar chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="rounded-2xl border border-glass-border-subtle bg-surface-0 p-4 mb-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Attività settimanale</h3>
                  <p className="text-xs text-muted">Visualizzazioni per giorno</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs text-muted">Post</span>
                  <div className="w-2 h-2 rounded-full bg-amber-500 ml-2" />
                  <span className="text-xs text-muted">Listing</span>
                </div>
              </div>
              <div className="space-y-3">
                <BarChart data={postViews} labels={DAYS} color="#4f6ef7" />
                <BarChart data={listingViews} labels={DAYS} color="#e8831a" />
              </div>
            </motion.div>

            {/* Top performing posts */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="rounded-2xl border border-glass-border-subtle bg-surface-0 p-4 mb-4"
            >
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" strokeWidth={2} />
                Post con più engagement
              </h3>
              <div className="space-y-3">
                {[
                  { title: 'Come ho imparato Rust in 30 giorni', views: 1840, likes: 124, comments: 38 },
                  { title: 'TypeScript: 10 pattern avanzati', views: 1520, likes: 98, comments: 27 },
                  { title: 'Docker compose per il team dev', views: 1230, likes: 72, comments: 19 },
                ].map((post, i) => (
                  <motion.div
                    key={post.title}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.06 }}
                    className="flex items-center gap-3 py-2 border-b border-glass-border-subtle last:border-0"
                  >
                    <span className="text-xs font-bold text-muted w-4 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-xs text-muted">
                          <Eye className="w-3 h-3" /> {post.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted">
                          <Heart className="w-3 h-3" /> {post.likes}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted">
                          <MessageSquare className="w-3 h-3" /> {post.comments}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 shrink-0">
                      <ArrowUpRight className="w-3 h-3" />
                      {Math.round(((post.likes + post.comments) / post.views) * 100)}%
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Audience breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.4 }}
              className="rounded-2xl border border-glass-border-subtle bg-surface-0 p-4 mb-4"
            >
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" strokeWidth={2} />
                Profilo visitatori
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Developer', pct: 62, color: '#4f6ef7' },
                  { label: 'DevOps / SRE', pct: 18, color: '#7c5cfc' },
                  { label: 'Tech Manager', pct: 12, color: '#0ea57a' },
                  { label: 'Recruiter', pct: 8, color: '#e8831a' },
                ].map(({ label, pct, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs text-muted w-28 shrink-0">{label}</span>
                    <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                    <span className="text-xs font-bold text-foreground w-8 text-right shrink-0">{pct}%</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Profile visits week */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.44, duration: 0.4 }}
              className="rounded-2xl border border-glass-border-subtle bg-surface-0 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-500" strokeWidth={2} />
                  Visite profilo (ultimi 7 gg)
                </h3>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  +22%
                </span>
              </div>
              <BarChart data={profileVisits} labels={DAYS} color="#0ea57a" />
            </motion.div>

            {/* Share analytics */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 flex items-center justify-center"
            >
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-glass-border-subtle text-xs font-medium text-muted hover:text-foreground hover:bg-surface-1 transition-colors">
                <Share2 className="w-3.5 h-3.5" />
                Esporta report
              </button>
            </motion.div>
          </>
        )}
      </div>
    </>
  );
}
