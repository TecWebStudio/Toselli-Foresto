'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, LayoutGrid, Bell, Search, User } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { useNotifications } from '@/lib/NotificationContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { unreadCount, openSheet } = useNotifications();

  const linkItems = [
    { href: '/',         labelKey: 'nav.home',    icon: Home },
    { href: '/listings', labelKey: 'nav.board',   icon: LayoutGrid },
    { href: '/search',   labelKey: 'nav.search',  icon: Search },
    { href: null as string | null, labelKey: 'nav.account', icon: User },
  ];

  const isActive = (href: string | null) => {
    if (!href) return pathname === '/profile' || pathname === '/auth';
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <motion.nav
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-glass-border-subtle bg-glass backdrop-blur-2xl backdrop-saturate-[180%] lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Subtle gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

      <div className="mx-auto flex max-w-lg items-center justify-around">
        {/* Link-based nav items */}
        {linkItems.slice(0, 2).map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.labelKey}
              href={item.href!}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-2 pt-2.5"
            >
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 h-[2px] w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.82 }}
                className={`relative flex items-center justify-center w-10 h-8 rounded-full transition-all duration-200 ${
                  active
                    ? 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2 : 1.5} />
              </motion.div>
              <span className={`text-[10px] font-medium transition-colors duration-200 ${
                active
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-muted-foreground'
              }`}>
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}

        {/* Bell — opens notification sheet */}
        <button
          onClick={openSheet}
          aria-label={t('nav.notifications')}
          className="relative flex flex-1 flex-col items-center gap-0.5 py-2 pt-2.5"
        >
          <motion.div
            whileTap={{ scale: 0.82 }}
            className="relative flex items-center justify-center w-10 h-8 rounded-full text-muted-foreground"
          >
            <motion.div
              animate={unreadCount > 0 ? { rotate: [0, -12, 12, -8, 8, 0] } : {}}
              transition={{ duration: 0.55, repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 6 }}
            >
              <Bell className="w-[22px] h-[22px]" strokeWidth={1.5} />
            </motion.div>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 right-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-500 px-1 text-[8px] font-black text-white shadow-sm shadow-red-500/40 border border-white dark:border-zinc-950"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </motion.div>
          <span className="text-[10px] font-medium text-muted-foreground">
            {t('nav.notifications')}
          </span>
        </button>

        {/* Remaining link items */}
        {linkItems.slice(2).map((item) => {
          const href = item.href ?? (user ? '/profile' : '/auth');
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.labelKey}
              href={href}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-2 pt-2.5"
            >
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 h-[2px] w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.82 }}
                className={`relative flex items-center justify-center w-10 h-8 rounded-full transition-all duration-200 ${
                  active
                    ? 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2 : 1.5} />
                {item.href === null && !user && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-indigo-500 border-2 border-white dark:border-zinc-950" />
                )}
              </motion.div>
              <span className={`text-[10px] font-medium transition-colors duration-200 ${
                active
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-muted-foreground'
              }`}>
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
