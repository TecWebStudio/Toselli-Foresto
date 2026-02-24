'use client';

import { useState, useEffect } from 'react';
import type { JobFilters } from '@/lib/types';

interface HamburgerFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: JobFilters;
  onApply: (filters: JobFilters) => void;
}

const categories = [
  { value: '', label: 'Tutte' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Full-Stack' },
  { value: 'devops', label: 'DevOps' },
  { value: 'data', label: 'Data / ML' },
  { value: 'security', label: 'Cybersecurity' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'cloud', label: 'Cloud / Infra' },
];

const levels = [
  { value: '', label: 'Tutti' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead / Architect' },
];

const types = [
  { value: '', label: 'Tutti' },
  { value: 'remote', label: 'Full Remote' },
  { value: 'hybrid', label: 'Ibrido' },
  { value: 'onsite', label: 'In sede' },
];

export default function HamburgerFilters({ isOpen, onClose, filters, onApply }: HamburgerFiltersProps) {
  const [localFilters, setLocalFilters] = useState<JobFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    const empty: JobFilters = {};
    setLocalFilters(empty);
    onApply(empty);
    onClose();
  };

  const activeCount = Object.values(localFilters).filter(v => v !== undefined && v !== '' && v !== null).length;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-60 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 z-70 h-full w-[85%] max-w-sm transform overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-zinc-900 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/90 px-5 py-4 backdrop-blur-lg dark:border-zinc-700 dark:bg-zinc-900/90">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-indigo-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
            </svg>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Filtri</h2>
            {activeCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {activeCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-6 space-y-8">
          {/* Search */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Ricerca</label>
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                placeholder="Ruolo, azienda, tecnologia..."
                value={localFilters.search || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Categoria</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setLocalFilters({ ...localFilters, category: cat.value || undefined })}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    (localFilters.category || '') === cat.value
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Level */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Livello</label>
            <div className="flex flex-wrap gap-2">
              {levels.map((lvl) => (
                <button
                  key={lvl.value}
                  onClick={() => setLocalFilters({ ...localFilters, level: lvl.value || undefined })}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    (localFilters.level || '') === lvl.value
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Work Type */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Modalità</label>
            <div className="flex flex-wrap gap-2">
              {types.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setLocalFilters({ ...localFilters, type: t.value || undefined })}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    (localFilters.type || '') === t.value
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Salary Range */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Range RAL (€)</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="Min"
                value={localFilters.salary_min || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, salary_min: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              <span className="text-zinc-400">—</span>
              <input
                type="number"
                placeholder="Max"
                value={localFilters.salary_max || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, salary_max: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 flex gap-3 border-t border-zinc-200 bg-white px-5 py-4 dark:border-zinc-700 dark:bg-zinc-900">
          <button
            onClick={handleReset}
            className="flex-1 rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-700 active:scale-95"
          >
            Applica filtri
          </button>
        </div>
      </div>
    </>
  );
}
