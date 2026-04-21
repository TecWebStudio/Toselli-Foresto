'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import Link from 'next/link';
import { getNotifications, markNotificationsRead } from '@/lib/api';
import { ShimmerSkeleton } from '@/lib/animations';
import { useAuth } from '@/lib/AuthContext';
import type { Notification } from '@/lib/types';

const typeIcons: Record<string, string> = {
  system: '🔔',
  badge: '🏅',
  job: '💼',
  follow: '👤',
  like: '❤️',
  comment: '💬',
  message: '✉️',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'ora';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}g`;
}

export default function NotificationPanel() {
  const { user } = useAuth();
  const userId = user?.id ?? 1;
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Poll unread count every 30s
    const fetchCount = async () => {
      try {
        const data = await getNotifications(userId);
        setUnreadCount(data.unread_count);
      } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleOpen = async () => {
    if (open) { setOpen(false); return; }
    setOpen(true);
    setLoading(true);
    try {
      const data = await getNotifications(userId);
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markNotificationsRead(userId);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch {}
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.is_read) {
      try {
        await markNotificationsRead(userId, n.id);
        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: 1 } : x));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch {}
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleOpen}
        aria-label="Notifiche"
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${open ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400' : 'text-muted-foreground hover:bg-surface-2 dark:hover:bg-surface-2'}`}
      >
        <motion.div
          animate={unreadCount > 0 ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.5, repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 5 }}
        >
          <Bell className="w-5 h-5" strokeWidth={1.5} />
        </motion.div>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-[9px] font-black text-white shadow-sm shadow-red-500/30"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-glass-border-subtle bg-glass-strong shadow-xl backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-glass-border-subtle px-4 py-3">
              <h3 className="font-bold text-foreground">Notifiche</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    Segna tutte lette
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-2 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="space-y-2 p-3">
                  {[1, 2, 3].map(i => (
                    <ShimmerSkeleton key={i} className="h-14 w-full" rounded="rounded-xl" />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="text-3xl mb-2">🔔</div>
                  <p className="text-sm text-zinc-500">Nessuna notifica</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {notifications.map((n, i) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      {n.link ? (
                        <Link
                          href={n.link}
                          onClick={() => handleNotificationClick(n)}
                          className={`flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60 ${!n.is_read ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''}`}
                        >
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 text-base dark:from-zinc-800 dark:to-zinc-700">
                            {typeIcons[n.type] || '🔔'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-semibold leading-tight ${!n.is_read ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>
                              {n.title}
                            </p>
                            {n.body && <p className="mt-0.5 text-[11px] text-zinc-500 leading-tight line-clamp-2">{n.body}</p>}
                            <p className="mt-1 text-[10px] text-zinc-400">{timeAgo(n.created_at)}</p>
                          </div>
                          {!n.is_read && (
                            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                          )}
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleNotificationClick(n)}
                          className={`w-full flex items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60 ${!n.is_read ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''}`}
                        >
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 text-base dark:from-zinc-800 dark:to-zinc-700">
                            {typeIcons[n.type] || '🔔'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-semibold leading-tight ${!n.is_read ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>
                              {n.title}
                            </p>
                            {n.body && <p className="mt-0.5 text-[11px] text-zinc-500 leading-tight line-clamp-2">{n.body}</p>}
                            <p className="mt-1 text-[10px] text-zinc-400">{timeAgo(n.created_at)}</p>
                          </div>
                          {!n.is_read && (
                            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                          )}
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
