'use client';

import type { UserBadge } from '@/lib/types';

interface BadgeCardProps {
  badge: UserBadge;
}

export default function BadgeCard({ badge }: BadgeCardProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full text-2xl shadow-lg"
        style={{
          backgroundColor: `${badge.badge_color}15`,
          boxShadow: `0 4px 14px ${badge.badge_color}30`,
        }}
      >
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full font-bold text-white"
          style={{
            background: `linear-gradient(135deg, ${badge.badge_color}, ${badge.badge_color}cc)`,
          }}
        >
          ★
        </div>
      </div>
      <div className="text-center">
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">{badge.badge_name}</h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Score: {badge.score}%</p>
        <p className="text-[10px] text-zinc-400 mt-0.5">
          {new Date(badge.earned_date).toLocaleDateString('it-IT')}
        </p>
      </div>
    </div>
  );
}
