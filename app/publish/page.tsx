'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { SpringButton } from '@/lib/animations';
import { createListing } from '@/lib/api';
import Link from 'next/link';

const CATEGORIES = [
  { id: 'development', label: 'Sviluppo', emoji: '💻' },
  { id: 'security', label: 'Sicurezza', emoji: '🔒' },
  { id: 'networking', label: 'Networking', emoji: '🌐' },
  { id: 'cloud', label: 'Cloud/DevOps', emoji: '☁️' },
  { id: 'data', label: 'Data/AI', emoji: '📊' },
  { id: 'database', label: 'Database', emoji: '🗄️' },
  { id: 'design', label: 'UI/UX', emoji: '🎨' },
  { id: 'management', label: 'Management', emoji: '📋' },
  { id: 'general', label: 'Altro', emoji: '🔧' },
];

const LEVELS = ['junior', 'mid', 'senior', 'lead'];
const WORK_TYPES = [
  { id: 'remote', label: 'Remoto', emoji: '🏠' },
  { id: 'hybrid', label: 'Ibrido', emoji: '🔄' },
  { id: 'onsite', label: 'In sede', emoji: '🏢' },
];

const POPULAR_TAGS = ['React', 'TypeScript', 'Python', 'AWS', 'Node.js', 'Docker', 'Kubernetes', 'SQL', 'Go', 'Rust', 'Vue', 'Next.js'];

export default function PublishPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'development',
    level: 'mid',
    work_type: 'remote',
    salary_min: '',
    salary_max: '',
    tags: [] as string[],
  });

  // Redirect to auth if not logged in
  if (!loading && !user) {
    router.replace('/auth');
    return null;
  }

  const listing_type = user?.role === 'company' ? 'job_offer' : 'service_proposal';

  const toggleTag = (tag: string) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag].slice(0, 8),
    }));
  };

  const addCustomTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t) && form.tags.length < 8) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }));
      setTagInput('');
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError('Titolo e descrizione sono obbligatori');
      return;
    }
    if (form.description.trim().length < 30) {
      setError('La descrizione deve essere di almeno 30 caratteri');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await createListing({
        listing_type,
        title: form.title,
        description: form.description,
        category: form.category,
        level: form.level,
        work_type: form.work_type,
        salary_min: form.salary_min ? parseInt(form.salary_min) : undefined,
        salary_max: form.salary_max ? parseInt(form.salary_max) : undefined,
        tags: form.tags,
      });
      router.push('/listings');
    } catch {
      setError('Errore durante la pubblicazione. Riprova.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full rounded-xl border border-zinc-200/70 bg-white dark:bg-zinc-900 dark:border-zinc-700 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all';

  const isCompany = user?.role === 'company';

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">← Indietro</Link>
        <div className="mt-3 flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${isCompany ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-purple-50 dark:bg-purple-900/20'}`}>
            {isCompany ? '🏢' : '👨‍💻'}
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
              {isCompany ? 'Pubblica offerta' : 'Proponi servizio'}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {isCompany ? 'Trova i talenti tech che cerchi' : 'Mostrare le tue competenze al mondo'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 block">
            {isCompany ? 'Titolo posizione *' : 'Titolo proposta *'}
          </label>
          <input
            className={inputClass}
            placeholder={isCompany ? 'es. Senior React Developer' : 'es. Full-Stack Developer freelance'}
            value={form.title}
            onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value })); setError(''); }}
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 block">Descrizione *</label>
          <textarea
            className={`${inputClass} resize-none h-32`}
            placeholder={isCompany
              ? 'Descrivi la posizione, le responsabilità, il contesto del team…'
              : 'Descrivi le tue competenze, la tua esperienza e cosa puoi offrire…'}
            value={form.description}
            onChange={(e) => { setForm((f) => ({ ...f, description: e.target.value })); setError(''); }}
          />
          <p className="text-xs text-zinc-400 mt-1">{form.description.length}/min. 30 caratteri</p>
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 block">Categoria</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setForm((f) => ({ ...f, category: cat.id }))}
                className={`rounded-xl border p-2.5 text-center transition-all duration-200 ${
                  form.category === cat.id
                    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 dark:border-indigo-600'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
              >
                <div className="text-xl mb-0.5">{cat.emoji}</div>
                <div className={`text-xs font-medium ${form.category === cat.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
                  {cat.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Level + Work type row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 block">Livello</label>
            <div className="flex flex-col gap-1.5">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setForm((f) => ({ ...f, level: l }))}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    form.level === l
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm'
                      : 'border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-indigo-400'
                  }`}
                >
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 block">Modalità</label>
            <div className="flex flex-col gap-1.5">
              {WORK_TYPES.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setForm((f) => ({ ...f, work_type: w.id }))}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    form.work_type === w.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm'
                      : 'border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-indigo-400'
                  }`}
                >
                  <span>{w.emoji}</span> {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Salary (optional) */}
        <div>
          <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 block">
            {isCompany ? 'Retribuzione annua (€) — opzionale' : 'Tariffa/anno desiderata (€) — opzionale'}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input className={inputClass} type="number" placeholder="Min. es. 30000" value={form.salary_min} onChange={(e) => setForm((f) => ({ ...f, salary_min: e.target.value }))} />
            <input className={inputClass} type="number" placeholder="Max. es. 60000" value={form.salary_max} onChange={(e) => setForm((f) => ({ ...f, salary_max: e.target.value }))} />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 block">
            Tecnologie & competenze <span className="text-zinc-400 font-normal">({form.tags.length}/8)</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  form.tags.includes(tag)
                    ? 'bg-indigo-500 text-white'
                    : 'border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-indigo-400'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className={inputClass}
              placeholder="Tag personalizzato…"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomTag()}
            />
            <button onClick={addCustomTag} className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:border-indigo-400 transition-colors">
              +
            </button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  {t}
                  <button onClick={() => toggleTag(t)} className="hover:text-red-500 transition-colors">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Location note */}
        {user?.city && (
          <div className="flex items-center gap-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800 px-4 py-3">
            <span className="text-base">📍</span>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Posizione: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{user.city}{user.region ? `, ${user.region}` : ''}</span>
              {' '}— dalla tua registrazione
            </p>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </motion.div>
        )}

        <SpringButton
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:opacity-90 transition-all disabled:opacity-50"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Pubblicazione…
            </span>
          ) : (
            isCompany ? '🚀 Pubblica offerta di lavoro' : '🚀 Pubblica proposta di servizio'
          )}
        </SpringButton>
      </div>
    </div>
  );
}
