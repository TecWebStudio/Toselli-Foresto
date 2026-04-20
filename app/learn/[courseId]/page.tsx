'use client';

import { use, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import TopBar from '@/components/TopBar';
import { PageTransition, AnimatedProgressBar, ShimmerSkeleton } from '@/lib/animations';
import { getCourse, getUserProgress, updateModuleProgress } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import type { Course, CourseModule, UserProgress } from '@/lib/types';

function renderMarkdown(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('### ')) {
      return <h3 key={i} className="text-base font-bold text-zinc-900 dark:text-white mt-4 mb-2">{line.slice(4)}</h3>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={i} className="text-lg font-bold text-zinc-900 dark:text-white mt-4 mb-2">{line.slice(3)}</h2>;
    }
    if (line.startsWith('# ')) {
      return <h1 key={i} className="text-xl font-bold text-zinc-900 dark:text-white mt-4 mb-2">{line.slice(2)}</h1>;
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <div key={i} className="flex gap-2 items-start my-1 ml-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">{line.slice(2)}</span>
        </div>
      );
    }
    if (line.startsWith('```')) return null;
    if (line.trim() === '') return <div key={i} className="h-2" />;
    // Bold text
    const boldParsed = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-zinc-900 dark:text-white">$1</strong>');
    // Code inline
    const codeParsed = boldParsed.replace(/`(.*?)`/g, '<code class="bg-zinc-100 dark:bg-zinc-800 rounded px-1.5 py-0.5 text-xs font-mono text-indigo-600 dark:text-indigo-400">$1</code>');
    return <p key={i} className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed my-1" dangerouslySetInnerHTML={{ __html: codeParsed }} />;
  });
}

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const { user: authUser } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [completing, setCompleting] = useState<number | null>(null);

  useEffect(() => {
    const progressPromise = authUser
      ? getUserProgress(authUser.id).catch(() => [])
      : Promise.resolve([]);

    Promise.all([
      getCourse(Number(courseId)).catch(() => null),
      progressPromise,
    ]).then(([c, allProgress]) => {
      setCourse(c);
      if (Array.isArray(allProgress)) {
        const p = allProgress.find(p => p.course_id === Number(courseId));
        setProgress(p || null);
      }
      setLoading(false);
    });
  }, [courseId, authUser]);

  const completedModules = useMemo(() => {
    return new Set(progress?.completed_modules || []);
  }, [progress]);

  const totalModules = course?.modules?.length || 0;
  const completedCount = completedModules.size;
  const progressPercent = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;
  const allModulesCompleted = totalModules > 0 && completedCount >= totalModules;

  const handleToggleModule = (index: number) => {
    setExpandedModule(expandedModule === index ? null : index);
  };

  const handleCompleteModule = async (moduleIndex: number) => {
    if (!authUser) return;
    setCompleting(moduleIndex);
    try {
      await updateModuleProgress(authUser.id, Number(courseId), moduleIndex);
      setProgress(prev => {
        if (!prev) return prev;
        const existing = new Set(prev.completed_modules || []);
        existing.add(moduleIndex);
        return { ...prev, completed_modules: Array.from(existing) };
      });
    } catch { /* ignore */ }
    setCompleting(null);
  };

  const levelConfig: Record<string, { label: string; color: string }> = {
    beginner: { label: 'Base', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    intermediate: { label: 'Intermedio', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    advanced: { label: 'Avanzato', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    expert: { label: 'Esperto', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  };

  if (loading) {
    return (
      <>
        <TopBar />
        <div className="p-4 space-y-4">
          <ShimmerSkeleton className="h-48 w-full" rounded="rounded-2xl" />
          <ShimmerSkeleton className="h-12 w-full" rounded="rounded-2xl" />
          <ShimmerSkeleton className="h-32 w-full" rounded="rounded-2xl" />
          <ShimmerSkeleton className="h-32 w-full" rounded="rounded-2xl" />
        </div>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <TopBar />
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <span className="text-5xl mb-3">🔍</span>
          <h2 className="font-bold text-zinc-900 dark:text-white">Corso non trovato</h2>
          <Link href="/learn" className="mt-3 text-sm font-semibold text-indigo-600">
            ← Torna ai corsi
          </Link>
        </div>
      </>
    );
  }

  const levelInfo = levelConfig[course.level] || levelConfig.beginner;

  return (
    <>
      <TopBar />
      <PageTransition>
        {/* Course Header */}
        <div className="px-4 pt-4 pb-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mb-3"
          >
            <Link
              href="/learn"
              className="flex items-center gap-1 text-sm font-semibold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
              </svg>
              Corsi
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-white to-zinc-50 p-5 dark:border-zinc-700/80 dark:from-zinc-900 dark:to-zinc-800"
          >
            <div className="absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl" style={{ backgroundColor: course.badge_color + '15' }} />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${levelInfo.color}`}>
                  {levelInfo.label}
                </span>
                <span className="text-[10px] text-zinc-500">{course.duration}</span>
              </div>
              <h1 className="text-lg font-black text-zinc-900 dark:text-white">{course.title}</h1>
              <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{course.description}</p>

              {course.prerequisites && (
                <div className="mt-3 text-xs text-zinc-500 bg-zinc-100/80 dark:bg-zinc-800/80 rounded-lg px-3 py-2">
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">Prerequisiti:</span> {course.prerequisites}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="px-4 pb-3"
        >
          <div className="rounded-xl border border-zinc-200/80 p-4 dark:border-zinc-700/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                Progresso
              </span>
              <span className="text-xs font-bold text-zinc-500">{completedCount}/{totalModules} moduli</span>
            </div>
            <AnimatedProgressBar value={progressPercent} className="h-2" />
          </div>
        </motion.div>

        {/* Badge Preview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-4 pb-3"
        >
          <div className="rounded-xl border p-4 flex items-center gap-4" style={{ borderColor: course.badge_color + '30', backgroundColor: course.badge_color + '08' }}>
            <motion.div
              animate={allModulesCompleted ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
              transition={{ duration: 1, repeat: allModulesCompleted ? Infinity : 0, repeatDelay: 2 }}
              className="flex h-14 w-14 items-center justify-center rounded-xl text-xl font-black text-white shadow-lg shrink-0"
              style={{ backgroundColor: course.badge_color, boxShadow: `0 8px 25px ${course.badge_color}30` }}
            >
              ⭐
            </motion.div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{course.badge_name}</h4>
              {course.badge_description && (
                <p className="text-xs text-zinc-500 mt-0.5">{course.badge_description}</p>
              )}
              {allModulesCompleted ? (
                <Link
                  href={`/learn/${courseId}/quiz`}
                  className="inline-block mt-2 text-xs font-bold text-white px-4 py-1.5 rounded-full shadow-md animate-gradient-x"
                  style={{ backgroundImage: `linear-gradient(90deg, ${course.badge_color}, #8b5cf6, ${course.badge_color})`, backgroundSize: '200%' }}
                >
                  Fai il Quiz Finale →
                </Link>
              ) : (
                <p className="text-xs text-zinc-500 mt-1">Completa tutti i moduli per sbloccare il quiz</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Company Tips */}
        {course.company_tips && course.company_tips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="px-4 pb-3"
          >
            <div className="rounded-xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/60 p-4 dark:from-amber-900/10 dark:via-orange-900/10 dark:to-amber-900/10 dark:border-amber-800/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">💡</span>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Tips dalle aziende</h4>
              </div>
              <ul className="space-y-1.5">
                {course.company_tips.map((tip, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="flex gap-2 items-start"
                  >
                    <span className="inline-block w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">{tip}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {/* Modules Accordion */}
        <div className="px-4 pb-8">
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-3"
          >
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
            Moduli del corso ({totalModules})
          </motion.h3>

          <div className="space-y-2.5">
            {course.modules?.map((mod: CourseModule, i: number) => {
              const isCompleted = completedModules.has(i);
              const isExpanded = expandedModule === i;
              const isCompleting = completing === i;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  className={`rounded-xl border overflow-hidden transition-all ${
                    isCompleted
                      ? 'border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-800/40 dark:bg-emerald-900/10'
                      : 'border-zinc-200/80 dark:border-zinc-700/80'
                  }`}
                >
                  {/* Module header */}
                  <motion.button
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleToggleModule(i)}
                    className="w-full flex items-center gap-3 p-4 text-left"
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                        : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {isCompleted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-zinc-900 dark:text-white truncate">{mod.title}</div>
                      <div className="text-xs text-zinc-500 truncate">{mod.description}</div>
                    </div>
                    <motion.svg
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-zinc-400 shrink-0"
                    >
                      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </motion.svg>
                  </motion.button>

                  {/* Module content (expanded) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="px-4 pb-4 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                          <div className="module-content">
                            {renderMarkdown(mod.content)}
                          </div>

                          {!isCompleted && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleCompleteModule(i)}
                              disabled={isCompleting}
                              className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 disabled:opacity-50 w-full justify-center"
                            >
                              {isCompleting ? (
                                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                  ⏳
                                </motion.span>
                              ) : (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                                  </svg>
                                  Segna come completato
                                </>
                              )}
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </PageTransition>
    </>
  );
}
