'use client';

import type { Job } from '@/lib/types';

interface JobDetailProps {
  job: Job;
  onClose: () => void;
}

const typeLabels: Record<string, string> = {
  remote: 'Full Remote',
  hybrid: 'Ibrido',
  onsite: 'In sede',
};

const levelLabels: Record<string, string> = {
  junior: 'Junior (0-2 anni)',
  mid: 'Mid-Level (2-5 anni)',
  senior: 'Senior (5+ anni)',
  lead: 'Lead / Architect (8+ anni)',
};

export default function JobDetail({ job, onClose }: JobDetailProps) {
  return (
    <div className="fixed inset-0 z-80 flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900 sm:rounded-3xl sm:m-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 pr-8">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white"
            style={{ backgroundColor: job.logo_color }}
          >
            {job.company.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{job.title}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{job.company}</p>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            {job.location}
          </span>
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            {typeLabels[job.type]}
          </span>
          <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
            {levelLabels[job.level]}
          </span>
        </div>

        {/* Salary */}
        <div className="mt-4 rounded-xl bg-linear-to-r from-indigo-50 to-purple-50 p-4 dark:from-indigo-900/20 dark:to-purple-900/20">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">RAL Annua</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            €{job.salary_min.toLocaleString()} - €{job.salary_max.toLocaleString()}
          </p>
        </div>

        {/* Description */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Descrizione</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{job.description}</p>
        </div>

        {/* Requirements */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Requisiti</h3>
          <ul className="mt-2 space-y-2">
            {job.requirements?.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                </svg>
                {req}
              </li>
            ))}
          </ul>
        </div>

        {/* Benefits */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Benefits</h3>
          <ul className="mt-2 space-y-2">
            {job.benefits?.map((ben, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <span className="mt-0.5 text-emerald-500">✦</span>
                {ben}
              </li>
            ))}
          </ul>
        </div>

        {/* Apply button */}
        <button className="mt-6 w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-700 active:scale-[0.98]">
          Candidati ora
        </button>
      </div>
    </div>
  );
}
