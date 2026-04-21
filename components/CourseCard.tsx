'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import type { Course } from '@/lib/types';

interface CourseCardProps {
  course: Course;
  progress?: {
    completed_modules: number[];
    quiz_completed: number;
    quiz_score: number;
  };
  index?: number;
  featured?: boolean;
}

const levelConfig: Record<string, { label: string; dots: number; color: string; bg: string }> = {
  beginner:     { label: 'Base',       dots: 1, color: '#22c55e', bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  intermediate: { label: 'Intermedio', dots: 2, color: '#3b82f6', bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  advanced:     { label: 'Avanzato',   dots: 3, color: '#f59e0b', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  expert:       { label: 'Esperto',    dots: 4, color: '#ef4444', bg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const categoryConfig: Record<string, { icon: string; gradient: string; glowColor: string }> = {
  networking:  { icon: '🌐', gradient: 'from-blue-500 via-cyan-500 to-sky-400',       glowColor: '#3b82f6' },
  security:    { icon: '🔒', gradient: 'from-red-500 via-orange-500 to-amber-400',    glowColor: '#ef4444' },
  cloud:       { icon: '☁️', gradient: 'from-sky-500 via-blue-500 to-indigo-500',     glowColor: '#0ea5e9' },
  development: { icon: '💻', gradient: 'from-indigo-500 via-violet-500 to-purple-500', glowColor: '#6366f1' },
  data:        { icon: '📊', gradient: 'from-purple-500 via-fuchsia-500 to-pink-500', glowColor: '#a855f7' },
  database:    { icon: '🗄️', gradient: 'from-emerald-500 via-teal-500 to-cyan-500',   glowColor: '#10b981' },
};

export default function CourseCard({ course, progress, index = 0, featured = false }: CourseCardProps) {
  const levelInfo = levelConfig[course.level] || { label: course.level, dots: 1, color: '#6366f1', bg: 'bg-indigo-100 text-indigo-700' };
  const catInfo = categoryConfig[course.category] || { icon: '📚', gradient: 'from-indigo-500 to-purple-500', glowColor: '#6366f1' };
  const moduleCount = course.modules?.length || 5;
  const completedCount = progress?.completed_modules?.length || 0;
  const progressPercent = moduleCount > 0 ? Math.round((completedCount / moduleCount) * 100) : 0;
  const [saved, setSaved] = useState(false);
  const isCompleted = !!progress?.quiz_completed;
  const isInProgress = completedCount > 0 && !isCompleted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className={`relative group ${featured ? 'rounded-3xl' : 'rounded-2xl'} overflow-hidden`}
    >
      {/* Bookmark */}
      <motion.button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSaved(!saved); }}
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.1 }}
        className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-white/10 transition-colors hover:bg-black/50"
        aria-label={saved ? 'Rimuovi dai salvati' : 'Salva corso'}
      >
        <Bookmark
          className={`w-3.5 h-3.5 transition-colors ${saved ? 'text-white fill-white' : 'text-white/70'}`}
          strokeWidth={2}
          fill={saved ? 'currentColor' : 'none'}
        />
      </motion.button>

      <Link href={`/learn/${course.id}`} className="block">
        {/* ── Cover image area ── */}
        <div className={`relative ${featured ? 'h-40' : 'h-28'} bg-gradient-to-br ${catInfo.gradient} overflow-hidden`}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
                                radial-gradient(circle at 80% 20%, white 1px, transparent 1px),
                                radial-gradient(circle at 50% 80%, white 1px, transparent 1px)`,
              backgroundSize: '40px 40px, 30px 30px, 50px 50px',
            }}
          />
          {/* Big faded icon as background art */}
          <div className="absolute inset-0 flex items-center justify-center text-[6rem] opacity-[0.12] select-none">
            {catInfo.icon}
          </div>
          {/* Glow at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />

          {/* Small icon + category label (bottom-left) */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className="text-2xl drop-shadow-md">{catInfo.icon}</span>
            <span className="rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-semibold text-white border border-white/20">
              {course.category.charAt(0).toUpperCase() + course.category.slice(1)}
            </span>
          </div>

          {/* Completed badge (top-left) */}
          {isCompleted && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-emerald-500/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-white">
              <CheckCircle2 className="w-3 h-3" />
              Completato
            </div>
          )}
          {/* In-progress badge */}
          {isInProgress && !isCompleted && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-indigo-500/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-white">
              <Clock className="w-3 h-3" />
              In corso
            </div>
          )}
        </div>

        {/* ── Card body ── */}
        <div className="bg-surface-0 dark:bg-surface-1 border border-t-0 border-glass-border-subtle rounded-b-2xl p-4 transition-all duration-300 group-hover:shadow-lg shadow-xs">
          {/* Title + arrow */}
          <div className="flex items-start gap-2">
            <h3 className={`flex-1 font-bold text-foreground leading-snug group-hover:text-accent transition-colors ${featured ? 'text-base' : 'text-sm'}`}>
              {course.title}
            </h3>
            <ChevronRight className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Meta row */}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${levelInfo.bg}`}>
              {levelInfo.label}
            </span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {course.duration}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {moduleCount} moduli
            </span>
          </div>

          {/* Description (only for featured or if no progress) */}
          {(featured || !isInProgress) && (
            <p className="mt-2 text-xs text-muted line-clamp-2 leading-relaxed">
              {course.description}
            </p>
          )}

          {/* Progress bar */}
          {isInProgress && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-muted">Progresso</span>
                <span className="text-[11px] font-bold text-accent">{progressPercent}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                  style={{ boxShadow: '0 0 8px rgba(99,102,241,0.5)' }}
                />
              </div>
            </div>
          )}

          {/* Badge preview */}
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-surface-1/80 dark:bg-surface-2/60 px-3 py-2">
            <div
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${course.badge_color}, ${course.badge_color}aa)`,
                boxShadow: `0 2px 8px ${course.badge_color}40`,
              }}
            >
              ★
            </div>
            <span className="text-xs text-muted">
              Badge: <span className="font-semibold text-foreground/80">{course.badge_name}</span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
