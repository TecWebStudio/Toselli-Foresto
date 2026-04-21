'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

const SPLASH_KEY = 'devhub_splash_v1';

type Phase = 'checking' | 'loading' | 'welcome' | 'done';

export default function SplashScreen() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [phase, setPhase] = useState<Phase>('checking');
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  // ── Step 1: decide whether to show at all ──────────────────
  useEffect(() => {
    const shown = localStorage.getItem(SPLASH_KEY);
    if (shown) {
      setPhase('done');
      return;
    }
    setPhase('loading');
    const t = setTimeout(() => setMinTimeElapsed(true), 2200);
    return () => clearTimeout(t);
  }, []);

  // ── Step 2: transition once both timer + auth are ready ────
  useEffect(() => {
    if (phase !== 'loading') return;
    if (!minTimeElapsed) return;
    if (authLoading) return;

    if (user) {
      setPhase('welcome');
    } else {
      localStorage.setItem(SPLASH_KEY, 'true');
      setPhase('done');
      if (pathname !== '/auth') router.push('/auth');
    }
  }, [phase, minTimeElapsed, authLoading, user, pathname, router]);

  // ── Step 3: typing animation for welcome phase ─────────────
  useEffect(() => {
    if (phase !== 'welcome' || !user) return;

    const name = user.display_name || user.username || 'sviluppatore';
    const line1 = 'Ciao,';
    const line2 = `${name}.`;
    const full = `${line1}\n${line2}`;

    let i = 0;
    setDisplayText('');
    setShowCursor(true);

    const id = setInterval(() => {
      i++;
      setDisplayText(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(id);
        // pause → then dismiss
        setTimeout(() => {
          setShowCursor(false);
          setTimeout(() => {
            localStorage.setItem(SPLASH_KEY, 'true');
            setPhase('done');
          }, 900);
        }, 1600);
      }
    }, 65);

    return () => clearInterval(id);
  }, [phase, user]);

  if (phase === 'done') return null;
  if (phase === 'checking') return null;

  const lines = displayText.split('\n');

  const isVisible = phase === 'loading' || phase === 'welcome';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ background: '#09090b' }}
        >
          {/* Ambient gradient blobs */}
          <div className="pointer-events-none absolute inset-0">
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.25, 0.45, 0.25] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-1/4 top-1/4 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/25 blur-[120px]"
            />
            <motion.div
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.35, 0.15] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute right-1/4 bottom-1/4 h-[360px] w-[360px] translate-x-1/2 translate-y-1/2 rounded-full bg-purple-600/20 blur-[100px]"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.25, 0.1] }}
              transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-2/3 top-1/3 h-[280px] w-[280px] rounded-full bg-pink-600/15 blur-[80px]"
            />
          </div>

          {/* ── LOADING PHASE ── */}
          <AnimatePresence mode="wait">
            {phase === 'loading' && (
              <motion.div
                key="loading-inner"
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex flex-col items-center gap-8"
              >
                {/* Logo with pulse glow */}
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 0px 0px rgba(99,102,241,0)',
                      '0 0 70px 24px rgba(99,102,241,0.45)',
                      '0 0 0px 0px rgba(99,102,241,0)',
                    ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
                >
                  <Code2 className="h-12 w-12 text-white" strokeWidth={1.75} />
                </motion.div>

                {/* Brand name */}
                <div className="flex flex-col items-center gap-1.5">
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-[1.6rem] font-bold tracking-tight text-white"
                    style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
                  >
                    DevHub IT
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-sm text-indigo-300/60"
                  >
                    Social Network per Professionisti IT
                  </motion.span>
                </div>

                {/* Loading dots */}
                <div className="flex gap-2.5">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="block h-2 w-2 rounded-full bg-indigo-400"
                      animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1.3, 0.8] }}
                      transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.22, ease: 'easeInOut' }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── WELCOME PHASE ── */}
            {phase === 'welcome' && (
              <motion.div
                key="welcome-inner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="relative flex flex-col items-center px-8 text-center"
              >
                {/* "Ciao, [nome]." typed text */}
                <div className="select-none">
                  {lines.map((line, li) => (
                    <div key={li} className={li > 0 ? 'mt-2' : ''}>
                      <span
                        className={`block leading-none font-black tracking-tighter ${
                          li === 0
                            ? 'text-[3.8rem] text-white sm:text-[5.5rem]'
                            : 'text-[3.2rem] sm:text-[4.8rem]'
                        }`}
                        style={{
                          fontFamily: 'var(--font-space-grotesk, sans-serif)',
                          background:
                            li > 0
                              ? 'linear-gradient(135deg, #6366f1, #a78bfa, #ec4899)'
                              : undefined,
                          WebkitBackgroundClip: li > 0 ? 'text' : undefined,
                          WebkitTextFillColor: li > 0 ? 'transparent' : undefined,
                          backgroundClip: li > 0 ? 'text' : undefined,
                        }}
                      >
                        {line}
                        {/* cursor on last char of last line */}
                        {li === lines.length - 1 && showCursor && (
                          <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.55, repeat: Infinity }}
                            className="ml-1 inline-block w-[3px] rounded-sm bg-white align-middle"
                            style={{ height: '0.85em' }}
                          />
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtitle fades in after name appears */}
                <AnimatePresence>
                  {displayText.length > 7 && (
                    <motion.p
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      className="mt-8 text-lg text-zinc-400"
                    >
                      Bentornato su DevHub IT
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
