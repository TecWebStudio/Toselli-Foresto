'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Code2 } from 'lucide-react';
import NotificationPanel from './NotificationPanel';

const pageTitles: Record<string, string> = {
  '/': 'DevHub IT',
  '/jobs': 'Opportunità',
  '/learn': 'Formazione',
  '/profile': 'Profilo',
};

interface TopBarProps {
  onFilterToggle?: () => void;
  showFilter?: boolean;
}

export default function TopBar({ onFilterToggle, showFilter }: TopBarProps) {
  const pathname = usePathname();

  const getTitle = () => {
    if (pageTitles[pathname]) return pageTitles[pathname];
    if (pathname.startsWith('/learn/')) return 'Corso';
    if (pathname.startsWith('/jobs/')) return 'Dettaglio';
    return 'DevHub IT';
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
        <div className="flex items-center gap-1.5">
          {showFilter && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={onFilterToggle}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
              whileTap={{ scale: 0.9 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition-colors"
              aria-label="Filtri"
            >
              <SlidersHorizontal className="w-5 h-5" strokeWidth={1.5} />
            </motion.button>
          )}
          <NotificationPanel />
        </div>
      </div>
    </motion.header>
  );
}
