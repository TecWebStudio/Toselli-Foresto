'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, CheckCircle2 } from 'lucide-react';
import type { Course } from '@/lib/types';

interface CourseCardProps {
  course: Course;
  progress?: {
    completed_modules: number[];
    quiz_completed: number;
    quiz_score: number;
  };
  index?: number;
}

const levelConfig: Record<string, { label: string; dots: number; color: string }> = {
  beginner: { label: 'Base', dots: 1, color: '#22c55e' },
  intermediate: { label: 'Intermedio', dots: 2, color: '#3b82f6' },
  advanced: { label: 'Avanzato', dots: 3, color: '#f59e0b' },
  expert: { label: 'Esperto', dots: 4, color: '#ef4444' },
};

const categoryIcons: Record<string, string> = {
  networking: '🌐',
  security: '🔒',
  cloud: '☁️',
  development: '💻',
  data: '📊',
  database: '🗄️',
};

export default function CourseCard({ course, progress, index = 0 }: CourseCardProps) {
  const levelInfo = levelConfig[course.level] || { label: course.level, dots: 1, color: '#6366f1' };
  const icon = categoryIcons[course.category] || '📚';
  const moduleCount = course.modules?.length || 5;
  const completedCount = progress?.completed_modules?.length || 0;
  const progressPercent = moduleCount > 0 ? Math.round((completedCount / moduleCount) * 100) : 0;
  const [saved, setSaved] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* Save button */}
      <motion.button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSaved(!saved); }}
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.1 }}
        className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-glass backdrop-blur-sm shadow-xs border border-glass-border-subtle transition-colors"
        aria-label={saved ? 'Rimuovi dai salvati' : 'Salva corso'}
      >
        <motion.div
          animate={{ scale: saved ? [1, 1.3, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          <Bookmark
            className={`w-4 h-4 transition-colors ${saved ? 'text-accent fill-accent' : 'text-muted-foreground'}`}
            strokeWidth={1.75}
            fill={saved ? 'currentColor' : 'none'}
          />
        </motion.div>
      </motion.button>

      <Link
        href={`/learn/${course.id}`}
        className="group block rounded-2xl border border-glass-border-subtle bg-surface-0 dark:bg-surface-1 p-4 transition-all duration-300 hover:shadow-lg shadow-xs card-shine"
      >
        <div className="flex items-start gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl"
            style={{ backgroundColor: `${course.badge_color}12`, boxShadow: `0 4px 12px ${course.badge_color}15` }}
          >
            {icon}
          </motion.div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm leading-tight group-hover:text-accent transition-colors">
              {course.title}
            </h3>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className={`h-1.5 w-1.5 rounded-full transition-all ${i >= levelInfo.dots ? 'bg-surface-3' : ''}`}
                    style={i < levelInfo.dots ? { backgroundColor: levelInfo.color } : undefined}
                  />
                ))}
              </div>
              <span className="text-xs text-muted">{levelInfo.label}</span>
              <span className="text-xs text-surface-3">·</span>
              <span className="text-xs text-muted">{course.duration}</span>
            </div>
          </div>
          {progress?.quiz_completed ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 glow-emerald"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </motion.div>
          ) : null}
        </div>

        <p className="mt-2.5 text-xs text-muted line-clamp-2 leading-relaxed">{course.description}</p>

        {/* Progress bar */}
        {completedCount > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted">Progresso</span>
              <span className="text-xs font-bold text-accent">{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                className="h-1.5 rounded-full progress-bar-glow bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
              />
            </div>
          </div>
        )}

        {/* Badge preview */}
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-surface-1/80 px-3 py-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${course.badge_color}, ${course.badge_color}aa)`,
              boxShadow: `0 2px 8px ${course.badge_color}30`,
            }}
          >
            ★
          </div>
          <span className="text-xs text-muted">
            Badge: <span className="font-semibold text-foreground/80">{course.badge_name}</span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
