'use client';

import { useMemo } from 'react';
import type { Job } from '@/lib/types';

interface JobCardProps {
  job: Job;
  onSelect?: (job: Job) => void;
}

const typeLabels: Record<string, string> = {
  remote: 'Remote',
  hybrid: 'Ibrido',
  onsite: 'In sede',
};

const typeColors: Record<string, string> = {
  remote: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  hybrid: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  onsite: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const levelLabels: Record<string, string> = {
  junior: 'Junior',
  mid: 'Mid-Level',
  senior: 'Senior',
  lead: 'Lead',
};

export default function JobCard({ job, onSelect }: JobCardProps) {
  const daysAgo = useMemo(() => {
    const now = typeof window !== 'undefined' ? Date.now() : new Date().getTime();
    return Math.floor(
      (now - new Date(job.posted_date).getTime()) / (1000 * 60 * 60 * 24)
    );
  }, [job.posted_date]);

  return (
    <button
      onClick={() => onSelect?.(job)}
      className="w-full text-left rounded-2xl border border-zinc-200 bg-white p-4 transition-all hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800"
    >
      <div className="flex items-start gap-3">
        {/* Company logo placeholder */}
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
          style={{ backgroundColor: job.logo_color }}
        >
          {job.company.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-zinc-900 dark:text-white truncate">{job.title}</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{job.company}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[job.type]}`}>
          {typeLabels[job.type]}
        </span>
        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          {levelLabels[job.level]}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          {job.location}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          €{(job.salary_min / 1000).toFixed(0)}K - €{(job.salary_max / 1000).toFixed(0)}K
        </span>
        <span className="text-xs text-zinc-400">
          {daysAgo === 0 ? 'Oggi' : daysAgo === 1 ? 'Ieri' : `${daysAgo}g fa`}
        </span>
      </div>
    </button>
  );
}
