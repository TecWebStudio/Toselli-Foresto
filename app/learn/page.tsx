'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '@/components/TopBar';
import CourseCard from '@/components/CourseCard';
import AuthGuard from '@/components/AuthGuard';
import { PageTransition, ShimmerSkeleton, StaggeredReveal, StaggeredRevealItem, AnimatedCounter } from '@/lib/animations';
import { getCourses, getUserProgress } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import type { Course, UserProgress } from '@/lib/types';
import { BookOpen, Award, ChevronRight, TrendingUp, Zap } from 'lucide-react';

const categories = [
  { value: '',            label: 'Tutti',       icon: '📚', gradient: 'from-zinc-500 to-zinc-600',         desc: 'Tutti i corsi disponibili' },
  { value: 'networking',  label: 'Networking',  icon: '🌐', gradient: 'from-blue-500 to-cyan-500',         desc: 'Reti, protocolli, infrastrutture' },
  { value: 'security',    label: 'Security',    icon: '🔒', gradient: 'from-red-500 to-orange-500',        desc: 'Cybersecurity e protezione dati' },
  { value: 'cloud',       label: 'Cloud/DevOps',icon: '☁️', gradient: 'from-sky-500 to-blue-600',          desc: 'AWS, Azure, GCP, Kubernetes' },
  { value: 'development', label: 'Development', icon: '💻', gradient: 'from-indigo-500 to-violet-600',     desc: 'Web, mobile, software engineering' },
  { value: 'data',        label: 'Data/ML',     icon: '📊', gradient: 'from-purple-500 to-pink-500',       desc: 'Machine learning e data science' },
  { value: 'database',    label: 'Database',    icon: '🗄️', gradient: 'from-emerald-500 to-teal-500',      desc: 'SQL, NoSQL, ottimizzazione' },
];

const levels = [
  { value: '',             label: 'Tutti i livelli', color: '' },
  { value: 'beginner',     label: 'Base',             color: 'text-emerald-600 dark:text-emerald-400' },
  { value: 'intermediate', label: 'Intermedio',       color: 'text-blue-600 dark:text-blue-400' },
  { value: 'advanced',     label: 'Avanzato',         color: 'text-amber-600 dark:text-amber-400' },
  { value: 'expert',       label: 'Esperto',          color: 'text-red-600 dark:text-red-400' },
];

export default function LearnPage() {
  const { user: authUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  useEffect(() => {
    const filters: Record<string, string> = {};
    if (selectedCategory) filters.category = selectedCategory;
    if (selectedLevel) filters.level = selectedLevel;

    const progressPromise = authUser
      ? getUserProgress(authUser.id).catch(() => [])
      : Promise.resolve([]);

    Promise.all([
      getCourses(filters).catch(() => []),
      progressPromise,
    ]).then(([coursesData, progressData]) => {
      setCourses(coursesData);
      setProgress(progressData);
      setLoading(false);
    });
  }, [selectedCategory, selectedLevel, authUser]);

  // Load all courses once for stats
  useEffect(() => {
    getCourses().catch(() => []).then(setAllCourses);
  }, []);

  const getProgressForCourse = (courseId: number) => {
    return progress.find((p) => p.course_id === courseId);
  };

  const inProgressCourses = useMemo(() =>
    allCourses.filter(c => {
      const p = progress.find(pr => pr.course_id === c.id);
      return p && p.completed_modules.length > 0 && !p.quiz_completed;
    }),
    [allCourses, progress]
  );

  const completedCount = useMemo(() =>
    progress.filter(p => p.quiz_completed).length,
    [progress]
  );

  const selectedCat = categories.find(c => c.value === selectedCategory) || categories[0];

  return (
    <AuthGuard>
      <TopBar />
      <PageTransition>

        {/* ── Hero banner ── */}
        <div className={`relative overflow-hidden bg-gradient-to-br ${selectedCat.gradient} px-5 pt-5 pb-6 lg:rounded-2xl lg:mx-0 lg:mt-2 transition-all duration-500`}>
          {/* Dot pattern */}
          <div className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent" />

          <div className="relative z-10">
            <motion.div
              key={selectedCat.value}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl">{selectedCat.icon}</span>
                <span className="rounded-full bg-white/20 backdrop-blur-sm px-3 py-0.5 text-xs font-semibold text-white border border-white/20">
                  Percorsi Formativi
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mt-2 leading-tight">
                {selectedCategory ? selectedCat.label : 'Tutti i corsi'}
              </h2>
              <p className="text-sm text-white/70 mt-0.5">
                {selectedCat.desc}
              </p>
            </motion.div>

            {/* Stats row */}
            <div className="mt-4 flex gap-3">
              {[
                { icon: <BookOpen className="w-3.5 h-3.5" />, value: allCourses.length, label: 'Corsi' },
                { icon: <Award className="w-3.5 h-3.5" />, value: completedCount, label: 'Completati' },
                { icon: <TrendingUp className="w-3.5 h-3.5" />, value: inProgressCourses.length, label: 'In corso' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="flex items-center gap-2 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/15 px-3 py-2"
                >
                  <span className="text-white/70">{stat.icon}</span>
                  <span className="text-sm font-black text-white">
                    <AnimatedCounter value={stat.value} duration={0.8} />
                  </span>
                  <span className="text-[11px] text-white/60">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Continue Learning ── */}
        <AnimatePresence>
          {inProgressCourses.length > 0 && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pt-5 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="text-base font-bold text-foreground">Continua a studiare</h3>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {inProgressCourses.map((course, i) => {
                  const p = getProgressForCourse(course.id);
                  const total = course.modules?.length || 5;
                  const done = p?.completed_modules?.length || 0;
                  const pct = Math.round((done / total) * 100);
                  return (
                    <motion.a
                      key={course.id}
                      href={`/learn/${course.id}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex-shrink-0 w-52 rounded-2xl border border-glass-border-subtle bg-surface-0 dark:bg-surface-1 p-3 hover:shadow-lg transition-shadow group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{
                          (['🌐','🔒','☁️','💻','📊','🗄️'] as const)[
                            ['networking','security','cloud','development','data','database'].indexOf(course.category)
                          ] || '📚'
                        }</span>
                        <span className="text-xs font-semibold text-foreground truncate">{course.title}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] text-muted-foreground">{done}/{total} moduli</span>
                        <span className="text-[10px] font-bold text-accent">{pct}%</span>
                      </div>
                    </motion.a>
                  );
                })}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── Category Cards ── */}
        <section className="px-4 pt-5 pb-2">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Esplora per categoria</h3>
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat, i) => (
              <motion.button
                key={cat.value}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.04 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex-shrink-0 flex flex-col items-center gap-1.5 rounded-2xl px-4 py-3 min-w-[76px] transition-all duration-200 ${
                  selectedCategory === cat.value
                    ? `bg-gradient-to-br ${cat.gradient} text-white shadow-lg`
                    : 'bg-surface-1 dark:bg-surface-1 border border-glass-border-subtle hover:border-indigo-300/40 dark:hover:border-indigo-700/40'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className={`text-[11px] font-semibold whitespace-nowrap ${selectedCategory === cat.value ? 'text-white' : 'text-foreground/80'}`}>
                  {cat.value === '' ? 'Tutti' : cat.label.split('/')[0]}
                </span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* ── Level filter ── */}
        <section className="px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {levels.map((lvl) => (
              <motion.button
                key={lvl.value}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedLevel(lvl.value)}
                className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedLevel === lvl.value
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md'
                    : `bg-surface-1 border border-glass-border-subtle ${lvl.color || 'text-muted'} hover:bg-surface-2`
                }`}
              >
                {lvl.label}
              </motion.button>
            ))}
          </div>
        </section>

        {/* ── How it works ── (collapsible inline banner) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-4 mb-5 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100/60 p-4 dark:from-indigo-900/10 dark:via-purple-900/10 dark:to-pink-900/10 dark:border-indigo-800/30"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md shadow-indigo-500/25">
              <Award className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { step: '1', text: 'Studia i moduli' },
                  { step: '→', text: null },
                  { step: '2', text: 'Completa il quiz (≥70%)' },
                  { step: '→', text: null },
                  { step: '3', text: 'Ottieni il badge' },
                ].map((item, i) =>
                  item.text ? (
                    <span key={i} className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                        {item.step}
                      </span>
                      {item.text}
                    </span>
                  ) : (
                    <ChevronRight key={i} className="w-3 h-3 text-zinc-400" />
                  )
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Course Grid ── */}
        <section className="px-4 pb-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <ShimmerSkeleton key={i} className="h-64 w-full" rounded="rounded-2xl" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <motion.span
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl mb-3"
              >
                📭
              </motion.span>
              <h3 className="font-bold text-zinc-900 dark:text-white">Nessun corso trovato</h3>
              <p className="mt-1 text-sm text-zinc-500">Prova a cambiare i filtri</p>
            </motion.div>
          ) : (
            <StaggeredReveal className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {courses.map((course, i) => (
                <StaggeredRevealItem key={course.id}>
                  <CourseCard
                    course={course}
                    progress={getProgressForCourse(course.id)}
                    index={i}
                    featured={i === 0 && !selectedCategory && !selectedLevel}
                  />
                </StaggeredRevealItem>
              ))}
            </StaggeredReveal>
          )}
        </section>

      </PageTransition>
    </AuthGuard>
  );
}
