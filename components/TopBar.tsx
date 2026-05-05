'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Code2, Bell } from 'lucide-react';
import { useNotifications } from '@/lib/NotificationContext';
import { useLanguage } from '@/lib/LanguageContext';

interface TopBarProps {
  onFilterToggle?: () => void;
  showFilter?: boolean;
}

export default function TopBar({ onFilterToggle, showFilter }: TopBarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { unreadCount, openSheet } = useNotifications();

  const pageTitleKey: Record<string, string> = {
    '/':          'page.home',
    '/jobs':      'page.opportunities',
    '/listings':  'page.board',
    '/learn':     'page.training',
    '/profile':   'page.profile',
    '/settings':  'page.settings',
    '/map':       'page.map',
    '/publish':   'page.publish',
    '/search':    'page.search',
  };

  const getTitle = () => {
    if (pageTitleKey[pathname]) return t(pageTitleKey[pathname]);
    if (pathname.startsWith('/learn/')) return t('page.course');
    if (pathname.startsWith('/jobs/')) return t('page.detail');
    if (pathname.startsWith('/profile/')) return t('page.profile_user');
    return t('page.home');
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-glass-border-subtle bg-glass-strong backdrop-blur-2xl backdrop-saturate-[180%] lg:hidden"
    >
      {/* Subtle gradient line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/15 to-transparent" />
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/20"
          >
            <Code2 className="w-5 h-5 text-white" strokeWidth={2.5} />
          </motion.div>
          <motion.h1
            key={getTitle()}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="text-lg font-bold text-foreground"
          >
            {getTitle()}
          </motion.h1>
        </div>
        <div className="flex items-center gap-1">
          {showFilter && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={onFilterToggle}
              whileTap={{ scale: 0.88 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition-colors active:bg-zinc-100 dark:active:bg-zinc-800"
              aria-label="Filtri"
            >
              <SlidersHorizontal className="w-5 h-5" strokeWidth={1.5} />
            </motion.button>
          )}

          {/* Bell — opens mobile bottom sheet */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={openSheet}
            aria-label="Notifiche"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors active:bg-zinc-100 dark:active:bg-zinc-800"
          >
            <motion.div
              animate={unreadCount > 0 ? { rotate: [0, -12, 12, -8, 8, 0] } : {}}
              transition={{ duration: 0.55, repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 5 }}
            >
              <Bell className="w-[22px] h-[22px]" strokeWidth={1.75} />
            </motion.div>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1.5 right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-500 px-1 text-[9px] font-black text-white shadow-sm shadow-red-500/40"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
