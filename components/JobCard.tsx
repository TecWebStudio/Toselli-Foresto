'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Bookmark } from 'lucide-react';
import type { Job } from '@/lib/types';

interface JobCardProps {
  job: Job;
  onSelect?: (job: Job) => void;
  index?: number;
}

const typeLabels: Record<string, string> = {
  remote: 'Remote',
  hybrid: 'Ibrido',
  onsite: 'In sede',
};

const typeColors: Record<string, { bg: string; text: string; glow: string }> = {
  remote: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', glow: 'shadow-emerald-500/10' },
  hybrid: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', glow: 'shadow-blue-500/10' },
  onsite: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', glow: 'shadow-amber-500/10' },
};

const levelLabels: Record<string, string> = {
  junior: 'Junior',
  mid: 'Mid-Level',
  senior: 'Senior',
  lead: 'Lead',
};

export default function JobCard({ job, onSelect, index = 0 }: JobCardProps) {
  const [saved, setSaved] = useState(false);

  const daysAgo = useMemo(() => {
    const now = typeof window !== 'undefined' ? Date.now() : new Date().getTime();
    return Math.floor(
      (now - new Date(job.posted_date).getTime()) / (1000 * 60 * 60 * 24)
    );
  }, [job.posted_date]);

  const typeStyle = typeColors[job.type] || typeColors.remote;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, boxShadow: '0 20px 50px -12px rgba(99, 102, 241, 0.12), 0 0 0 1px rgba(99, 102, 241, 0.08)' }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect?.(job)}
      className="w-full text-left rounded-2xl border border-glass-border-subtle bg-surface-0 dark:bg-surface-1 p-4 transition-all duration-300 shadow-xs hover:shadow-lg card-shine group"
    >
      <div className="flex items-start gap-3">
        {/* Company logo */}
        <motion.div
          whileHover={{ scale: 1.08, rotate: -3 }}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${job.logo_color}, ${job.logo_color}cc)`,
            boxShadow: `0 4px 14px ${job.logo_color}30`,
          }}
        >
          {job.company.charAt(0)}
        </motion.div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate group-hover:text-accent transition-colors">{job.title}</h3>
          <p className="text-sm text-muted">{job.company}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {daysAgo <= 1 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
              className="px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold shadow-lg shadow-indigo-500/25"
            >
              NEW
            </motion.span>
          )}
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.85 }}
            onClick={(e) => { e.stopPropagation(); setSaved(s => !s); }}
            className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors"
            aria-label={saved ? 'Rimuovi dai salvati' : 'Salva offerta'}
          >
            <motion.div
              animate={saved ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.35 }}
            >
              <Bookmark
                className={`w-4 h-4 transition-colors ${saved ? 'text-accent fill-accent' : 'text-muted-foreground'}`}
                strokeWidth={1.5}
                fill={saved ? 'currentColor' : 'none'}
              />
            </motion.div>
          </motion.button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeStyle.bg} ${typeStyle.text} shadow-sm ${typeStyle.glow}`}>
          {typeLabels[job.type]}
        </span>
        <span className="inline-flex items-center rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted">
          {levelLabels[job.level]}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-muted">
          <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
          {job.location}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-bold gradient-text">
          €{(job.salary_min / 1000).toFixed(0)}K - €{(job.salary_max / 1000).toFixed(0)}K
        </span>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${daysAgo <= 1 ? 'bg-emerald-400 animate-pulse' : 'bg-surface-3'}`} />
          {daysAgo === 0 ? 'Oggi' : daysAgo === 1 ? 'Ieri' : `${daysAgo}g fa`}
        </span>
      </div>
    </motion.button>
  );
}
