'use client';

import Link from 'next/link';
import type { Course } from '@/lib/types';

interface CourseCardProps {
  course: Course;
  progress?: {
    completed_modules: number[];
    quiz_completed: number;
    quiz_score: number;
  };
}

const levelConfig: Record<string, { label: string; dots: number }> = {
  beginner: { label: 'Base', dots: 1 },
  intermediate: { label: 'Intermedio', dots: 2 },
  advanced: { label: 'Avanzato', dots: 3 },
  expert: { label: 'Esperto', dots: 4 },
};

const categoryIcons: Record<string, string> = {
  networking: '🌐',
  security: '🔒',
  cloud: '☁️',
  development: '💻',
  data: '📊',
  database: '🗄️',
};

export default function CourseCard({ course, progress }: CourseCardProps) {
  const levelInfo = levelConfig[course.level] || { label: course.level, dots: 1 };
  const icon = categoryIcons[course.category] || '📚';
  const moduleCount = course.modules?.length || 5;
  const completedCount = progress?.completed_modules?.length || 0;
  const progressPercent = moduleCount > 0 ? Math.round((completedCount / moduleCount) * 100) : 0;

  return (
    <Link
      href={`/learn/${course.id}`}
      className="block rounded-2xl border border-zinc-200 bg-white p-4 transition-all hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl"
          style={{ backgroundColor: `${course.badge_color}15` }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-zinc-900 dark:text-white text-sm leading-tight">{course.title}</h3>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${
                    i < levelInfo.dots ? 'bg-indigo-500' : 'bg-zinc-200 dark:bg-zinc-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{levelInfo.label}</span>
            <span className="text-xs text-zinc-400">·</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{course.duration}</span>
          </div>
        </div>
        {progress?.quiz_completed ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-emerald-600 dark:text-emerald-400">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
            </svg>
          </div>
        ) : null}
      </div>

      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{course.description}</p>

      {/* Progress bar */}
      {completedCount > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Progresso</span>
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-1.5 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Badge preview */}
      <div className="mt-3 flex items-center gap-2">
        <div
          className="flex h-5 w-5 items-center justify-center rounded-full text-[10px]"
          style={{ backgroundColor: `${course.badge_color}20`, color: course.badge_color }}
        >
          ★
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Badge: <span className="font-medium text-zinc-700 dark:text-zinc-300">{course.badge_name}</span>
        </span>
      </div>
    </Link>
  );
}
