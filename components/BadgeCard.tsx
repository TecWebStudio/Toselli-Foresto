'use client';

import { motion } from 'framer-motion';
import type { UserBadge } from '@/lib/types';

interface BadgeCardProps {
  badge: UserBadge;
  index?: number;
}

export default function BadgeCard({ badge, index = 0 }: BadgeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, scale: 1.03 }}
      className="group flex flex-col items-center gap-3 rounded-2xl border border-glass-border-subtle bg-surface-0 dark:bg-surface-1 p-5 shadow-xs transition-shadow duration-300 hover:shadow-lg card-shine"
      style={{
        boxShadow: `0 4px 20px ${badge.badge_color}10`,
      }}
    >
      {/* Badge icon with animated glow */}
      <div className="relative">
        <motion.div
          animate={{
            boxShadow: [
              `0 0 20px ${badge.badge_color}20`,
              `0 0 40px ${badge.badge_color}40`,
              `0 0 20px ${badge.badge_color}20`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex h-18 w-18 items-center justify-center rounded-full"
          style={{ backgroundColor: `${badge.badge_color}10` }}
        >
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="flex h-14 w-14 items-center justify-center rounded-full font-bold text-white text-xl"
            style={{
              background: `linear-gradient(135deg, ${badge.badge_color}, ${badge.badge_color}bb)`,
            }}
          >
            ★
          </motion.div>
        </motion.div>
        {/* Sparkle effects */}
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          className="absolute -top-1 -right-1 text-xs"
        >
          ✨
        </motion.div>
      </div>
      <div className="text-center">
        <h4 className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">
          {badge.badge_name}
        </h4>
        <div className="mt-1 flex items-center justify-center gap-1">
          <span className="text-xs font-bold" style={{ color: badge.badge_color }}>
            {badge.score}%
          </span>
          <span className="text-xs text-muted-foreground">score</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          {new Date(badge.earned_date).toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      </div>
    </motion.div>
  );
}
