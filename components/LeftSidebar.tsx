'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Home, LayoutGrid, Map, GraduationCap, Plus, LogOut, User, Settings, Code2, Search, Crown, BarChart3 } from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';

export default function LeftSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const isPro = (user?.is_pro ?? 0) === 1;

  const navItems = [
    { href: '/',         labelKey: 'nav.home',     icon: Home },
    { href: '/listings', labelKey: 'nav.board',    icon: LayoutGrid },
    { href: '/map',      labelKey: 'nav.map',      icon: Map },
    { href: '/learn',    labelKey: 'nav.training', icon: GraduationCap },
    { href: '/search',   labelKey: 'nav.search',   icon: Search },
  ];

  const initials = user?.display_name
    ? user.display_name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.replace('/auth');
  };

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full z-40 border-r border-glass-border-subtle bg-glass backdrop-blur-2xl backdrop-saturate-[180%] transition-all duration-300"
      style={{ width: 'var(--sidebar-w)' }}
    >
      {/* Logo */}
      <div className="px-6 py-6">
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.06, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/20"
          >
            <Code2 className="w-5 h-5 text-white" strokeWidth={2.5} />
          </motion.div>
          <span className="text-xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-500 bg-clip-text text-transparent xl:block hidden">
            DevHub IT
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                className={`relative flex items-center gap-3.5 rounded-xl px-3 py-3 transition-all duration-200 group cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 text-blue-700 dark:text-blue-300'
                    : 'text-muted hover:bg-surface-2/70 hover:text-foreground'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="sidebarActive"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-gradient-to-b from-blue-500 to-indigo-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.25 : 1.75} />
                <span className={`font-semibold text-sm xl:block hidden ${active ? 'font-bold' : ''}`}>
                  {t(item.labelKey)}
                </span>
                {active && (
                  <motion.div
                    layoutId="sidebarGlow"
                    className="absolute inset-0 rounded-xl bg-blue-500/5 pointer-events-none"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}

        {/* Notifications (desktop) */}
        <NotificationPanel fullWidth />

        {/* Analytics — pro only */}
        {isPro && (
          <Link href="/analytics">
            <motion.div
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              className={`relative flex items-center gap-3.5 rounded-xl px-3 py-3 transition-all duration-200 cursor-pointer ${
                pathname === '/analytics'
                  ? 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 text-amber-700 dark:text-amber-400'
                  : 'text-muted hover:bg-surface-2/70 hover:text-foreground'
              }`}
            >
              <BarChart3 className="w-[22px] h-[22px]" strokeWidth={1.75} />
              <span className="font-semibold text-sm xl:block hidden">Analytics</span>
              <span className="ml-auto xl:block hidden pro-badge text-[9px] px-1.5 py-0.5">PRO</span>
            </motion.div>
          </Link>
        )}

        {/* Pricing / Upgrade CTA */}
        {!isPro && (
          <Link href="/pricing">
            <motion.div
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3.5 rounded-xl px-3 py-3 mt-1 border border-amber-300/40 dark:border-amber-700/30 bg-amber-50/60 dark:bg-amber-950/15 text-amber-700 dark:text-amber-400 hover:bg-amber-100/70 dark:hover:bg-amber-950/30 transition-all cursor-pointer"
            >
              <Crown className="w-[22px] h-[22px]" strokeWidth={1.75} />
              <span className="font-bold text-sm xl:block hidden">Upgrade a Pro</span>
            </motion.div>
          </Link>
        )}

        {/* Publish CTA — only when logged in */}
        {user && (
          <Link href="/publish">
            <motion.div
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3.5 rounded-xl px-3 py-3 mt-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 hover:from-blue-500/20 hover:to-indigo-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-6 h-6" strokeWidth={1.75} />
              <span className="font-bold text-sm xl:block hidden">
                {user.role === 'company' ? t('nav.publish_offer') : t('nav.propose_service')}
              </span>
            </motion.div>
          </Link>
        )}
      </nav>

      {/* Bottom user section */}
      <div className="px-3 py-4 border-t border-glass-border-subtle relative">
        {user ? (
          <>
            <motion.button
              whileHover={{ x: 3 }}
              onClick={() => setMenuOpen((v) => !v)}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-surface-2/70 transition-colors cursor-pointer text-left"
            >
              <div className="relative shrink-0">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black text-white shadow-sm ${isPro ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-background' : ''}`}
                  style={{ background: user.avatar_color ?? 'linear-gradient(135deg,#4f6ef7,#7c5cfc)' }}
                >
                  {initials}
                </div>
                {isPro && (
                  <div className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 shadow-sm">
                    <Crown className="w-2 h-2 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
              <div className="min-w-0 xl:block hidden flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                    {user.display_name}
                  </p>
                  {isPro && (
                    <span className="pro-badge shrink-0">PRO</span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 truncate">@{user.username}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-muted-foreground xl:block hidden ml-auto shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
              </svg>
            </motion.button>

            {/* User popup menu */}
            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-3 right-3 mb-2 z-50 rounded-2xl border border-glass-border bg-glass-strong backdrop-blur-2xl shadow-xl overflow-hidden"
                  >
                    <div className="p-3 border-b border-glass-border-subtle">
                      <p className="text-xs font-semibold text-muted truncate">
                        {user.email}
                      </p>
                      {user.city && (
                        <p className="text-xs text-muted-foreground mt-0.5">📍 {user.city}</p>
                      )}
                      {isPro && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="pro-badge">PRO</span>
                          <span className="text-xs text-muted-foreground">
                            scade {user.pro_expires ? new Date(user.pro_expires).toLocaleDateString('it-IT') : '—'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      <Link href="/profile" onClick={() => setMenuOpen(false)}>
                        <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-surface-2 transition-colors cursor-pointer text-sm text-muted hover:text-foreground">
                          <User className="w-4 h-4" strokeWidth={1.75} />
                          {t('nav.my_profile')}
                        </div>
                      </Link>
                      {isPro && (
                        <Link href="/analytics" onClick={() => setMenuOpen(false)}>
                          <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors cursor-pointer text-sm text-amber-600 dark:text-amber-400">
                            <BarChart3 className="w-4 h-4" strokeWidth={1.75} />
                            Analytics Pro
                          </div>
                        </Link>
                      )}
                      <Link href="/settings" onClick={() => setMenuOpen(false)}>
                        <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-surface-2 transition-colors cursor-pointer text-sm text-muted hover:text-foreground">
                          <Settings className="w-4 h-4" strokeWidth={1.75} />
                          {t('nav.settings')}
                        </div>
                      </Link>
                      <Link href="/publish" onClick={() => setMenuOpen(false)}>
                        <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-surface-2 transition-colors cursor-pointer text-sm text-muted hover:text-foreground">
                          <Plus className="w-4 h-4" strokeWidth={1.75} />
                          {user.role === 'company' ? t('nav.publish_offer') : t('nav.propose_service')}
                        </div>
                      </Link>
                      {!isPro && (
                        <Link href="/pricing" onClick={() => setMenuOpen(false)}>
                          <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors cursor-pointer text-sm text-amber-600 dark:text-amber-400 font-medium">
                            <Crown className="w-4 h-4" strokeWidth={1.75} />
                            Upgrade a Pro
                          </div>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer text-sm text-red-600 dark:text-red-400"
                      >
                        <LogOut className="w-4 h-4" strokeWidth={1.75} />
                        {t('nav.logout')}
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </>
        ) : (
          <Link href="/auth">
            <motion.div
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 border border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/5 transition-all cursor-pointer"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted">
                <LogOut className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 xl:block hidden">
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{t('nav.login')}</p>
                <p className="text-xs text-zinc-500">{t('nav.or_register')}</p>
              </div>
            </motion.div>
          </Link>
        )}
      </div>
    </aside>
  );
}
