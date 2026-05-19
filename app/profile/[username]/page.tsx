'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import TopBar from '@/components/TopBar';
import { PageTransition, ShimmerSkeleton, AnimatedCounter } from '@/lib/animations';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import {
  Settings,
  UserPlus, UserCheck, Clock, Lock,
  MapPin, Globe, Heart, MessageCircle,
  ChevronLeft, Building2, Code2, Crown,
} from 'lucide-react';
import type { Post } from '@/lib/types';

/* ─── Types ─────────────────────────────────────────────────── */
interface PublicProfile {
  id: number;
  username: string;
  display_name: string;
  avatar_color: string;
  avatar_url: string | null;
  theme_color: string;
  title: string;
  bio: string;
  city: string;
  region: string;
  country: string;
  role: 'worker' | 'company';
  company_name: string | null;
  company_website: string | null;
  is_private: number;
  created_at: string;
  followers_count: number;
  following_count: number;
  follow_status: 'not_following' | 'pending' | 'following';
  is_pro: number;
}

type FollowStatus = 'not_following' | 'pending' | 'following';

/* ─── Mini PostCard (read-only) ─────────────────────────────── */
function MiniPostCard({ post }: { post: Post }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/60 p-4 space-y-2"
    >
      <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
        {post.content}
      </p>
      {post.image_url && (
        <img
          src={post.image_url}
          alt="post"
          className="w-full rounded-xl object-cover max-h-64"
        />
      )}
      {Array.isArray(post.tags) && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag: string) => (
            <span
              key={tag}
              className="rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/40 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 pt-1 text-xs text-zinc-400">
        <span className="flex items-center gap-1">
          <Heart className="w-3.5 h-3.5" />
          {post.likes_count ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="w-3.5 h-3.5" />
          {post.comments_count ?? 0}
        </span>
        <span className="ml-auto">
          {new Date(post.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>
    </motion.div>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function PublicProfilePage() {
  const params = useParams();
  const username = params?.username as string;
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { t } = useLanguage();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsPrivate, setPostsPrivate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [followStatus, setFollowStatus] = useState<FollowStatus>('not_following');
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  /* ── Fetch profile ── */
  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${username}`);
      if (res.status === 404) { setNotFound(true); setLoading(false); return; }
      const data: PublicProfile = await res.json();
      setProfile(data);
      setFollowStatus(data.follow_status ?? 'not_following');
      setFollowersCount(data.followers_count ?? 0);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [username]);

  /* ── Fetch posts ── */
  const loadPosts = useCallback(async () => {
    try {
      const res = await fetch(`/api/users/${username}/posts?limit=20`);
      const data = await res.json();
      setPosts(data.posts ?? []);
      setPostsPrivate(!!data.private);
    } catch { /* silent */ }
  }, [username]);

  useEffect(() => {
    if (username) {
      loadProfile();
      loadPosts();
    }
  }, [username, loadProfile, loadPosts]);

  /* ── Follow / unfollow ── */
  const handleFollow = async () => {
    if (!authUser) { router.push('/auth'); return; }
    setFollowLoading(true);
    try {
      if (followStatus === 'following' || followStatus === 'pending') {
        await fetch(`/api/user/${profile!.id}/follow`, { method: 'DELETE' });
        setFollowStatus('not_following');
        setFollowersCount((c) => Math.max(0, c - 1));
      } else {
        const res = await fetch(`/api/user/${profile!.id}/follow`, { method: 'POST' });
        const data = await res.json();
        const newStatus: FollowStatus = data.status === 'pending' ? 'pending' : 'following';
        setFollowStatus(newStatus);
        if (newStatus === 'following') setFollowersCount((c) => c + 1);
        // If we just followed a private-then-public account, reload posts
        if (newStatus === 'following' && postsPrivate) loadPosts();
      }
    } catch { /* silent */ } finally {
      setFollowLoading(false);
    }
  };

  /* ── Own profile redirect ── */
  const isSelf = authUser?.username === username;

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <>
        <TopBar />
        <div className="p-4 space-y-4 pt-20">
          <ShimmerSkeleton className="h-52 w-full" rounded="rounded-3xl" />
          <ShimmerSkeleton className="h-10 w-full" rounded="rounded-2xl" />
          <ShimmerSkeleton className="h-32 w-full" rounded="rounded-2xl" />
          <ShimmerSkeleton className="h-32 w-full" rounded="rounded-2xl" />
        </div>
      </>
    );
  }

  /* ── 404 ── */
  if (notFound || !profile) {
    return (
      <>
        <TopBar />
        <PageTransition>
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl mb-4"
            >
              🔍
            </motion.div>
            <h2 className="text-xl font-black text-zinc-900 dark:text-white">
              {t('profile.not_found')}
            </h2>
            <p className="mt-2 text-sm text-zinc-500">@{username}</p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => router.back()}
              className="mt-5 flex items-center gap-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('common.back')}
            </motion.button>
          </div>
        </PageTransition>
      </>
    );
  }

  const initials = profile.display_name
    ? profile.display_name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : profile.username?.slice(0, 2).toUpperCase() || 'U';

  const isCompany = profile.role === 'company';
  const isPrivate = Number(profile.is_private) === 1;
  const canSeePosts = !isPrivate || followStatus === 'following' || isSelf;
  const accentColor = profile.theme_color || profile.avatar_color || '#6366f1';

  return (
    <>
      <TopBar />
      <PageTransition>
        <div className="px-4 pt-4 pb-28 max-w-2xl mx-auto space-y-4">

          {/* Back button (mobile) */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('common.back')}
          </motion.button>

          {/* ── Profile header card ── */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-3xl p-6 text-white text-center shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${accentColor}cc 0%, ${accentColor}88 50%, ${accentColor}55 100%)`,
              boxShadow: `0 20px 60px ${accentColor}30`,
            }}
          >
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            {/* Settings / Edit gear — only for own profile */}
            {isSelf && (
              <Link
                href="/settings"
                className="absolute top-4 right-4 z-20 flex items-center justify-center h-8 w-8 rounded-full bg-white/15 hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                <Settings className="w-4 h-4 text-white" strokeWidth={1.75} />
              </Link>
            )}

            <div className="relative z-10">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 14, delay: 0.15 }}
                className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/30 shadow-xl overflow-hidden"
                style={{ background: `${accentColor}55`, backdropFilter: 'blur(8px)' }}
              >
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-black">{initials}</span>
                )}
              </motion.div>

              {/* Name + role badge */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <motion.h2
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-xl font-black"
                >
                  {profile.display_name || profile.username}
                </motion.h2>
                {profile.is_pro === 1 && (
                  <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400/30 to-orange-400/20 border border-amber-300/40 px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm text-amber-200">
                    <Crown className="w-3 h-3" strokeWidth={2} />
                    PRO
                  </span>
                )}
                <span className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm">
                  {isCompany
                    ? <><Building2 className="w-3 h-3" /> {t('profile.company')}</>
                    : <><Code2 className="w-3 h-3" /> {t('profile.developer')}</>
                  }
                </span>
                {isPrivate && (
                  <span className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm">
                    <Lock className="w-3 h-3" /> Privato
                  </span>
                )}
              </div>

              {/* @username + city */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-0.5 text-sm text-white/70"
              >
                @{profile.username}
                {profile.city ? (
                  <span className="ml-2 inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {profile.city}
                    {profile.region ? `, ${profile.region}` : ''}
                  </span>
                ) : null}
              </motion.p>

              {/* Title */}
              {profile.title && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.33 }}
                  className="mt-1 text-xs text-white/80 font-medium"
                >
                  {profile.title}
                </motion.p>
              )}

              {/* Company info */}
              {isCompany && profile.company_name && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="mt-1 text-xs text-white/70"
                >
                  🏢 {profile.company_name}
                  {profile.company_website && (
                    <a
                      href={profile.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 inline-flex items-center gap-0.5 underline underline-offset-2"
                    >
                      <Globe className="w-2.5 h-2.5" />
                      sito
                    </a>
                  )}
                </motion.p>
              )}

              {/* Bio */}
              {profile.bio && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.38 }}
                  className="mt-2 text-sm text-white/90 max-w-xs mx-auto"
                >
                  {profile.bio}
                </motion.p>
              )}

              {/* Stats row: followers / following / posts */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42 }}
                className="mt-5 flex items-center justify-center gap-8"
              >
                {[
                  { value: followersCount,           label: t('profile.followers') },
                  { value: profile.following_count,  label: t('profile.following_count') },
                  { value: canSeePosts ? posts.length : 0, label: t('profile.posts') },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-xl font-black">
                      <AnimatedCounter value={stat.value} duration={0.8} />
                    </div>
                    <div className="text-[10px] text-white/60 font-medium mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </motion.div>

              {/* Follow / Edit button */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-5"
              >
                {isSelf ? (
                  <Link
                    href="/settings"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 px-5 py-2 text-sm font-bold text-white backdrop-blur-sm transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    {t('profile.edit_profile')}
                  </Link>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`inline-flex items-center gap-2 rounded-xl px-6 py-2 text-sm font-bold transition-all disabled:opacity-60 shadow-lg ${
                      followStatus === 'following'
                        ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                        : followStatus === 'pending'
                        ? 'bg-amber-400/30 hover:bg-amber-400/40 text-white backdrop-blur-sm'
                        : 'bg-white text-zinc-900 hover:bg-white/90'
                    }`}
                  >
                    {followStatus === 'following' ? (
                      <><UserCheck className="w-4 h-4" /> {t('profile.following')}</>
                    ) : followStatus === 'pending' ? (
                      <><Clock className="w-4 h-4" /> {t('profile.pending')}</>
                    ) : (
                      <><UserPlus className="w-4 h-4" /> {t('profile.follow')}</>
                    )}
                  </motion.button>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* ── Posts section ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="space-y-3"
          >
            <h3 className="font-bold text-zinc-900 dark:text-white text-sm flex items-center gap-2 px-1">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
              {t('profile.posts')}
            </h3>

            <AnimatePresence mode="wait">
              {/* Private — not following */}
              {!canSeePosts ? (
                <motion.div
                  key="private"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-14 text-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-700"
                >
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="text-4xl mb-3"
                  >
                    🔒
                  </motion.div>
                  <h4 className="font-bold text-zinc-800 dark:text-zinc-200">
                    {t('profile.private_profile')}
                  </h4>
                  <p className="mt-1 text-sm text-zinc-500 max-w-xs">
                    {t('profile.private_desc')}
                  </p>
                  {!isSelf && (
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleFollow}
                      disabled={followLoading || followStatus === 'pending'}
                      className={`mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-md disabled:opacity-60 ${
                        followStatus === 'pending'
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                          : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-indigo-500/25'
                      }`}
                    >
                      {followStatus === 'pending'
                        ? <><Clock className="w-4 h-4" /> {t('profile.pending')}</>
                        : <><UserPlus className="w-4 h-4" /> {t('profile.follow')}</>
                      }
                    </motion.button>
                  )}
                </motion.div>
              ) : posts.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-14 text-center"
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-4xl mb-3"
                  >
                    ✍️
                  </motion.div>
                  <p className="text-sm text-zinc-500">{t('profile.no_posts')}</p>
                </motion.div>
              ) : (
                <motion.div
                  key="posts"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  {posts.map((post, i) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <MiniPostCard post={post} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </div>
      </PageTransition>
    </>
  );
}
