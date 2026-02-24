'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import TopBar from '@/components/TopBar';
import { getCourse, getUserProgress, updateModuleProgress } from '@/lib/api';
import type { Course, UserProgress } from '@/lib/types';

function renderMarkdown(text: string): string {
  let html = text;
  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  // Numbered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = `<p>${html}</p>`;
  // Clean up
  html = html.replace(/<p>\s*<(h[23]|ul|pre|ol)/g, '<$1');
  html = html.replace(/<\/(h[23]|ul|pre|ol)>\s*<\/p>/g, '</$1>');
  html = html.replace(/<p>\s*<\/p>/g, '');
  // Table support
  html = html.replace(/\|(.+)\|/g, (match) => {
    const cells = match.split('|').filter(c => c.trim()).map(c => c.trim());
    if (cells.every(c => c.match(/^[-]+$/))) return '';
    return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
  });
  return html;
}

interface Props {
  params: Promise<{ courseId: string }>;
}

export default function CourseDetailPage({ params }: Props) {
  const { courseId } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<number | null>(null);

  useEffect(() => {
    const id = parseInt(courseId);
    Promise.all([
      getCourse(id).catch(() => null),
      getUserProgress(1).then(p => p.find(pr => pr.course_id === id) || null).catch(() => null),
    ]).then(([courseData, progressData]) => {
      setCourse(courseData);
      setProgress(progressData);
      setLoading(false);
    });
  }, [courseId]);

  const handleModuleComplete = async (moduleIndex: number) => {
    try {
      await updateModuleProgress(1, parseInt(courseId), moduleIndex);
      const updatedProgress = await getUserProgress(1);
      setProgress(updatedProgress.find(p => p.course_id === parseInt(courseId)) || null);
    } catch {
      // silently handle
    }
  };

  const isModuleCompleted = (index: number) => {
    return progress?.completed_modules?.includes(index) || false;
  };

  if (loading) {
    return (
      <>
        <TopBar />
        <div className="p-4 space-y-4">
          <div className="h-40 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-20 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
        </div>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <TopBar />
        <div className="flex flex-col items-center justify-center py-20">
          <span className="text-4xl mb-3">😕</span>
          <h3 className="font-semibold text-zinc-900 dark:text-white">Corso non trovato</h3>
          <Link href="/learn" className="mt-3 text-sm text-indigo-600 hover:underline">
            Torna ai corsi
          </Link>
        </div>
      </>
    );
  }

  const moduleCount = course.modules?.length || 0;
  const completedCount = progress?.completed_modules?.length || 0;
  const progressPercent = moduleCount > 0 ? Math.round((completedCount / moduleCount) * 100) : 0;

  return (
    <>
      <TopBar />
      <div className="animate-fade-in">
        {/* Course Header */}
        <div className="px-4 pt-4 pb-4">
          <Link href="/learn" className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Tutti i corsi
          </Link>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{course.title}</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{course.description}</p>

          {/* Meta info */}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {course.duration}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              📊 {course.level === 'beginner' ? 'Base' : course.level === 'intermediate' ? 'Intermedio' : course.level === 'advanced' ? 'Avanzato' : 'Esperto'}
            </span>
            {course.prerequisites && (
              <span className="text-xs text-zinc-400">
                Prerequisiti: {course.prerequisites}
              </span>
            )}
          </div>

          {/* Progress */}
          <div className="mt-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Progresso</span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div
                className="h-2 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-zinc-500">{completedCount}/{moduleCount} moduli completati</p>
          </div>

          {/* Badge preview */}
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${course.badge_color}, ${course.badge_color}cc)` }}
            >
              ★
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">{course.badge_name}</p>
              <p className="text-xs text-zinc-500">{course.badge_description || 'Completa il quiz con almeno il 70% per ottenere il badge'}</p>
            </div>
          </div>
        </div>

        {/* Company Tips */}
        {course.company_tips && course.company_tips.length > 0 && (
          <div className="mx-4 mb-4 rounded-2xl bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-4 dark:from-emerald-900/10 dark:to-teal-900/10 dark:border-emerald-800/30">
            <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white text-sm mb-3">
              <span>🏢</span> Cosa cercano le aziende
            </h3>
            <ul className="space-y-2">
              {course.company_tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <span className="mt-0.5 text-emerald-500 shrink-0">▸</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Modules */}
        <div className="px-4 pb-4">
          <h3 className="font-bold text-zinc-900 dark:text-white mb-3">Moduli del corso</h3>
          <div className="space-y-2">
            {course.modules?.map((module, index) => (
              <div key={index}>
                <button
                  onClick={() => setActiveModule(activeModule === index ? null : index)}
                  className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                    activeModule === index
                      ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20'
                      : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600'
                  }`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isModuleCompleted(index)
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}>
                    {isModuleCompleted(index) ? '✓' : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{module.title}</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{module.description}</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`w-4 h-4 text-zinc-400 transition-transform ${activeModule === index ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {/* Module content */}
                {activeModule === index && (
                  <div className="mt-2 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900 animate-fade-in">
                    <div
                      className="module-content"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(module.content) }}
                    />
                    {!isModuleCompleted(index) && (
                      <button
                        onClick={() => handleModuleComplete(index)}
                        className="mt-4 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-700 active:scale-[0.98]"
                      >
                        ✓ Segna come completato
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quiz Access */}
        <div className="px-4 pb-8">
          <Link
            href={`/learn/${courseId}/quiz`}
            className="flex items-center justify-between w-full rounded-2xl bg-linear-to-r from-indigo-600 to-purple-600 p-5 text-white shadow-xl shadow-indigo-500/25 transition-all hover:shadow-2xl hover:shadow-indigo-500/30 active:scale-[0.98]"
          >
            <div>
              <h4 className="font-bold">Quiz finale</h4>
              <p className="mt-0.5 text-sm text-indigo-200">
                {progress?.quiz_completed
                  ? `Completato con ${progress.quiz_score}%`
                  : '10 domande · Minimo 70% per il badge'}
              </p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>
      </div>
    </>
  );
}
