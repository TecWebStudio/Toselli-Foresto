'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import CourseCard from '@/components/CourseCard';
import { getCourses, getUserProgress } from '@/lib/api';
import type { Course, UserProgress } from '@/lib/types';

const categories = [
  { value: '', label: 'Tutti', icon: '📚' },
  { value: 'networking', label: 'Networking', icon: '🌐' },
  { value: 'security', label: 'Security', icon: '🔒' },
  { value: 'cloud', label: 'Cloud/DevOps', icon: '☁️' },
  { value: 'development', label: 'Development', icon: '💻' },
  { value: 'data', label: 'Data/ML', icon: '📊' },
  { value: 'database', label: 'Database', icon: '🗄️' },
];

const levels = [
  { value: '', label: 'Tutti i livelli' },
  { value: 'beginner', label: 'Base' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzato' },
  { value: 'expert', label: 'Esperto' },
];

export default function LearnPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  useEffect(() => {
    const filters: Record<string, string> = {};
    if (selectedCategory) filters.category = selectedCategory;
    if (selectedLevel) filters.level = selectedLevel;

    Promise.all([
      getCourses(filters).catch(() => []),
      getUserProgress(1).catch(() => []),
    ]).then(([coursesData, progressData]) => {
      setCourses(coursesData);
      setProgress(progressData);
      setLoading(false);
    });
  }, [selectedCategory, selectedLevel]);

  const getProgressForCourse = (courseId: number) => {
    return progress.find((p) => p.course_id === courseId);
  };

  return (
    <>
      <TopBar />
      <div className="animate-fade-in">
        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Percorsi Formativi</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Corsi professionali IT con quiz e badge certificativi
          </p>
        </div>

        {/* Category horizontal scroll */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Level filter */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto">
            {levels.map((lvl) => (
              <button
                key={lvl.value}
                onClick={() => setSelectedLevel(lvl.value)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedLevel === lvl.value
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                    : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:text-zinc-400'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Learning Path Info */}
        <div className="mx-4 mb-4 rounded-2xl bg-linear-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-4 dark:from-indigo-900/10 dark:to-purple-900/10 dark:border-indigo-800/30">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-600 dark:text-indigo-400">
                <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15.19a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.22 49.22 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-white text-sm">Come funziona</h4>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Studia i moduli del corso, completa il quiz finale con almeno il 70% di risposte corrette
                e ottieni il badge certificativo. I contenuti includono tips sulle competenze più richieste dalle aziende.
              </p>
            </div>
          </div>
        </div>

        {/* Courses List */}
        <div className="px-4 pb-6 space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
            ))
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-4xl mb-3">📭</span>
              <h3 className="font-semibold text-zinc-900 dark:text-white">Nessun corso trovato</h3>
              <p className="mt-1 text-sm text-zinc-500">Prova a cambiare i filtri</p>
            </div>
          ) : (
            courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                progress={getProgressForCourse(course.id)}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
