'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useNotifications } from '@/lib/NotificationContext';
import { ShimmerSkeleton } from '@/lib/animations';
import type { Notification } from '@/lib/types';

const typeIcons: Record<string, string> = {
  system: '🔔', badge: '🏅', job: '💼',
  follow: '👤', like: '❤️', comment: '💬', message: '✉️',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'ora';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}g`;
}

export default function NotificationSheet() {
  const {
    isSheetOpen, closeSheet,
    notifications, loading, unreadCount,
    markAllRead, markRead,
  } = useNotifications();

  // Lock body scroll while sheet is open
  useEffect(() => {
    if (isSheetOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isSheetOpen]);

  const handleNotificationClick = async (n: Notification) => {
    if (!n.is_read) await markRead(n.id);
    closeSheet();
  };

  const rowClass = (n: Notification) =>
    `flex items-start gap-3 rounded-xl px-3 py-3 transition-colors active:scale-[0.98] ${
      !n.is_read
        ? 'bg-indigo-50/70 dark:bg-indigo-950/25 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
    }`;

  const renderRow = (n: Notification, i: number) => (
    <motion.div
      key={n.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.035, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {n.link ? (
        <Link href={n.link} onClick={() => handleNotificationClick(n)} className={rowClass(n)}>
          <NotificationRowInner n={n} />
        </Link>
      ) : (
        <button
          onClick={() => handleNotificationClick(n)}
          className={`w-full text-left ${rowClass(n)}`}
        >
          <NotificationRowInner n={n} />
        </button>
      )}
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isSheetOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[3px] lg:hidden"
            onClick={closeSheet}
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '110%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 34, mass: 0.9 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.18 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 380) closeSheet();
            }}
            className="fixed inset-x-0 bottom-0 z-[70] lg:hidden flex flex-col rounded-t-[28px] bg-white dark:bg-zinc-900 border-t border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl shadow-black/20"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-0.5 touch-none cursor-grab active:cursor-grabbing">
              <motion.div
                className="h-[5px] w-10 rounded-full bg-zinc-200 dark:bg-zinc-700"
                whileHover={{ scaleX: 1.15, backgroundColor: 'rgb(129 140 248)' }}
                transition={{ duration: 0.15 }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <h2 className="text-[17px] font-bold tracking-tight text-zinc-900 dark:text-white">
                  Notifiche
                </h2>
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-[10px] font-black text-white shadow-sm shadow-red-500/30"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 active:scale-95 transition-all"
                  >
                    Segna tutte lette
                  </button>
                )}
                <button
                  onClick={closeSheet}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-90 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="overflow-y-auto overscroll-contain max-h-[64vh]">
              {loading ? (
                <div className="space-y-2 p-4">
                  {[1, 2, 3, 4].map(i => (
                    <ShimmerSkeleton key={i} className="h-[68px] w-full" rounded="rounded-xl" />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="text-5xl mb-3">🔔</div>
                  <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                    Nessuna notifica
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                    Sei aggiornato su tutto
                  </p>
                </div>
              ) : (
                <div className="p-3 space-y-0.5 pb-4">
                  {notifications.map((n, i) => renderRow(n, i))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function NotificationRowInner({ n }: { n: Notification }) {
  return (
    <>
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 text-lg">
        {typeIcons[n.type] || '🔔'}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold leading-snug ${
          !n.is_read ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'
        }`}>
          {n.title}
        </p>
        {n.body && (
          <p className="mt-0.5 text-xs text-zinc-500 leading-snug line-clamp-2">{n.body}</p>
        )}
        <p className="mt-1 text-[11px] text-zinc-400">{timeAgo(n.created_at)}</p>
      </div>
      {!n.is_read && (
        <div className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-sm shadow-indigo-500/40" />
      )}
    </>
  );
}
