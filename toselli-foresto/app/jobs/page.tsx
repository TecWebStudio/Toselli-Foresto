'use client';

import { useState, useEffect, useCallback } from 'react';
import TopBar from '@/components/TopBar';
import HamburgerFilters from '@/components/HamburgerFilters';
import JobCard from '@/components/JobCard';
import JobDetail from '@/components/JobDetail';
import { getJobs } from '@/lib/api';
import type { Job, JobFilters } from '@/lib/types';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<JobFilters>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const fetchJobs = useCallback(async (f: JobFilters) => {
    setLoading(true);
    try {
      const data = await getJobs(f);
      setJobs(data);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(filters);
  }, [filters, fetchJobs]);

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '' && v !== null).length;

  return (
    <>
      <TopBar showFilter onFilterToggle={() => setFiltersOpen(true)} />

      <div className="animate-fade-in">
        {/* Active filters bar */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 border-b border-zinc-100 bg-indigo-50 px-4 py-2.5 dark:border-zinc-800 dark:bg-indigo-900/10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-indigo-600 dark:text-indigo-400">
              <path fillRule="evenodd" d="M3.792 2.938A49.069 49.069 0 0 1 12 2.25c2.797 0 5.54.236 8.209.688a1.857 1.857 0 0 1 1.541 1.836v1.044a3 3 0 0 1-.879 2.121l-6.182 6.182a1.5 1.5 0 0 0-.439 1.061v2.927a3 3 0 0 1-1.658 2.684l-1.757.878A.75.75 0 0 1 9.75 21v-5.818a1.5 1.5 0 0 0-.44-1.06L3.13 7.938a3 3 0 0 1-.879-2.121V4.774c0-.897.64-1.683 1.542-1.836Z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
              {activeFilterCount} {activeFilterCount === 1 ? 'filtro attivo' : 'filtri attivi'}
            </span>
            <button
              onClick={() => setFilters({})}
              className="ml-auto text-xs font-medium text-indigo-600 underline dark:text-indigo-400"
            >
              Rimuovi tutti
            </button>
          </div>
        )}

        {/* Job count */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {loading ? 'Caricamento...' : `${jobs.length} posizioni trovate`}
          </p>
        </div>

        {/* Job list */}
        <div className="px-4 pb-4 space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
            ))
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-zinc-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-white">Nessuna posizione trovata</h3>
              <p className="mt-1 text-sm text-zinc-500">Prova a modificare i filtri di ricerca</p>
            </div>
          ) : (
            jobs.map((job) => (
              <JobCard key={job.id} job={job} onSelect={setSelectedJob} />
            ))
          )}
        </div>
      </div>

      {/* Hamburger Filter Panel */}
      <HamburgerFilters
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onApply={setFilters}
      />

      {/* Job Detail Modal */}
      {selectedJob && <JobDetail job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </>
  );
}
