'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';
import { PageTransition } from '@/lib/animations';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import type { LangCode } from '@/lib/i18n';
import type { FollowRequest } from '@/lib/types';
import {
  User, Lock, Globe, Bell, Palette, Shield,
  ChevronRight, Check, X, Eye, EyeOff,
  AlertCircle, CheckCircle2, UserCheck, UserX, Clock, Camera, Upload, Crown,
} from 'lucide-react';

// ─── Colour Palette ────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  { hex: '#6366f1', label: 'Indigo' },
  { hex: '#8b5cf6', label: 'Viola' },
  { hex: '#ec4899', label: 'Rosa' },
  { hex: '#f59e0b', label: 'Ambra' },
  { hex: '#10b981', label: 'Smeraldo' },
  { hex: '#3b82f6', label: 'Blu' },
  { hex: '#ef4444', label: 'Rosso' },
  { hex: '#14b8a6', label: 'Teal' },
  { hex: '#f97316', label: 'Arancione' },
  { hex: '#a855f7', label: 'Porpora' },
  { hex: '#06b6d4', label: 'Ciano' },
  { hex: '#84cc16', label: 'Verde lime' },
];

const LANGUAGES = [
  { code: 'it' as LangCode, label: 'Italiano',   flag: '🇮🇹' },
  { code: 'en' as LangCode, label: 'English',     flag: '🇬🇧' },
  { code: 'es' as LangCode, label: 'Español',     flag: '🇪🇸' },
  { code: 'fr' as LangCode, label: 'Français',    flag: '🇫🇷' },
  { code: 'de' as LangCode, label: 'Deutsch',     flag: '🇩🇪' },
  { code: 'pt' as LangCode, label: 'Português',   flag: '🇵🇹' },
];

// ─── Feedback banner ────────────────────────────────────────────────────────
function Feedback({ type, message }: { type: 'success' | 'error'; message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
        type === 'success'
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30'
          : 'bg-red-50 text-red-700 border border-red-200/60 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle2 className="w-4 h-4 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 shrink-0" />
      )}
      {message}
    </motion.div>
  );
}

// ─── Section card wrapper ────────────────────────────────────────────────────
function SectionCard({
  icon: Icon, title, subtitle, children, index = 0,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: index * 0.07 }}
      className="rounded-2xl border border-glass-border-subtle bg-glass backdrop-blur-md overflow-hidden"
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-glass-border-subtle">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15 border border-indigo-500/20">
          <Icon className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">{title}</h2>
          <p className="text-xs text-zinc-500">{subtitle}</p>
        </div>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </motion.div>
  );
}

// ─── Input field ─────────────────────────────────────────────────────────────
function Field({
  label, value, onChange, placeholder, type = 'text', hint, maxLength, multiline,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; hint?: string; maxLength?: number; multiline?: boolean;
}) {
  const cls =
    'w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all';
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
        {label}
      </label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} maxLength={maxLength} rows={3}
          className={cls + ' resize-none'} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} maxLength={maxLength} className={cls} />
      )}
      {hint && <p className="text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}

// ─── Password field with show/hide ───────────────────────────────────────────
function PasswordField({
  label, value, onChange, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'} value={value}
          onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-3.5 py-2.5 pr-10 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
        />
        <button type="button" onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const router = useRouter();

  // — Profile state
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // — Appearance state
  const [avatarColor, setAvatarColor] = useState('#6366f1');
  const [themeColor, setThemeColor] = useState('#6366f1');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [appearanceLoading, setAppearanceLoading] = useState(false);
  const [appearanceFeedback, setAppearanceFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // — Language state (local copy of lang from context)
  const [language, setLanguage] = useState<LangCode>(lang);
  const [langLoading, setLangLoading] = useState(false);
  const [langFeedback, setLangFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // — Privacy state
  const [isPrivate, setIsPrivate] = useState(false);
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [privacyFeedback, setPrivacyFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [followRequests, setFollowRequests] = useState<FollowRequest[]>([]);
  const [frLoading, setFrLoading] = useState(false);

  // — Password state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwFeedback, setPwFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // — Preferences state
  const [notifBadge, setNotifBadge] = useState(true);
  const [notifJob, setNotifJob] = useState(true);
  const [notifFollow, setNotifFollow] = useState(true);
  const [prefLoading, setPrefLoading] = useState(false);
  const [prefFeedback, setPrefFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // — Subscription state
  const [subLoading, setSubLoading] = useState(false);
  const [subFeedback, setSubFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Initialise from user
  useEffect(() => {
    if (!user) return;
    setDisplayName(user.display_name || '');
    setUsername(user.username || '');
    setBio(user.bio || '');
    setTitle(user.title || '');
    setCompanyName(user.company_name || '');
    setCompanyWebsite(user.company_website || '');
    setAvatarColor(user.avatar_color || '#6366f1');
    setThemeColor(user.theme_color || user.avatar_color || '#6366f1');
    setAvatarUrl(user.avatar_url ?? null);
    setAvatarPreview(user.avatar_url ?? null);
    const userLang = (user.language || 'it') as LangCode;
    setLanguage(userLang);
    setIsPrivate(!!user.is_private);
  }, [user]);

  // Keep local language picker in sync with context (in case of external change)
  useEffect(() => { setLanguage(lang); }, [lang]);

  // Auth guard
  useEffect(() => {
    if (!user && typeof window !== 'undefined') router.replace('/auth');
  }, [user, router]);

  // Load follow requests
  const loadFollowRequests = useCallback(async () => {
    try {
      setFrLoading(true);
      const res = await fetch('/api/follow-requests');
      const data = await res.json();
      setFollowRequests(data.requests || []);
    } catch { /* silent */ } finally { setFrLoading(false); }
  }, []);

  useEffect(() => {
    if (user && isPrivate) loadFollowRequests();
  }, [user, isPrivate, loadFollowRequests]);

  // ── helpers ─────────────────────────────────────────────────────────────
  const patchSettings = async (payload: Record<string, unknown>) => {
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  };

  const clearFeedback = (setter: (v: null) => void, ms = 3500) =>
    setTimeout(() => setter(null), ms);

  // ── save handlers ────────────────────────────────────────────────────────
  const saveProfile = async () => {
    setProfileLoading(true);
    setProfileFeedback(null);
    const data = await patchSettings({
      display_name: displayName, username, bio, title,
      ...(user?.role === 'company' && { company_name: companyName, company_website: companyWebsite }),
    });
    setProfileLoading(false);
    if (data.success) {
      setProfileFeedback({ type: 'success', msg: t('settings.save') + ' ✓' });
      await refresh();
    } else {
      setProfileFeedback({ type: 'error', msg: data.error || t('common.error') });
    }
    clearFeedback(setProfileFeedback);
  };

  const saveAppearance = async () => {
    setAppearanceLoading(true);
    setAppearanceFeedback(null);
    const data = await patchSettings({ avatar_color: avatarColor, theme_color: themeColor });
    setAppearanceLoading(false);
    if (data.success) {
      setAppearanceFeedback({ type: 'success', msg: t('settings.save') + ' ✓' });
      await refresh();
    } else {
      setAppearanceFeedback({ type: 'error', msg: data.error || t('common.error') });
    }
    clearFeedback(setAppearanceFeedback);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      setUploadFeedback({ type: 'error', msg: 'Immagine troppo grande (max 500 KB)' });
      clearFeedback(setUploadFeedback);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatarPreview(dataUrl);
      setAvatarUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const saveAvatarUpload = async () => {
    if (!avatarUrl) return;
    setUploadLoading(true);
    setUploadFeedback(null);
    const data = await patchSettings({ avatar_url: avatarUrl });
    setUploadLoading(false);
    if (data.success) {
      setUploadFeedback({ type: 'success', msg: 'Foto profilo aggiornata ✓' });
      await refresh();
    } else {
      setUploadFeedback({ type: 'error', msg: data.error || t('common.error') });
    }
    clearFeedback(setUploadFeedback);
  };

  // Language save: update context immediately → save to DB → reload page
  const saveLanguage = async () => {
    setLangLoading(true);
    setLangFeedback(null);

    // 1. Apply language in context immediately so feedback is already translated
    setLang(language);

    const data = await patchSettings({ language });
    setLangLoading(false);

    if (data.success) {
      // 2. Show translated success message
      setLangFeedback({ type: 'success', msg: t('settings.language_saved') });
      await refresh();
      // 3. Reload page after short delay so all server-resolved strings refresh too
      setTimeout(() => window.location.reload(), 1200);
    } else {
      // Revert on error
      setLang(lang);
      setLanguage(lang);
      setLangFeedback({ type: 'error', msg: data.error || t('common.error') });
      clearFeedback(setLangFeedback);
    }
  };

  const savePrivacy = async (newValue?: boolean) => {
    const value = newValue !== undefined ? newValue : isPrivate;
    setPrivacyLoading(true);
    setPrivacyFeedback(null);
    const data = await patchSettings({ is_private: value });
    setPrivacyLoading(false);
    if (data.success) {
      setPrivacyFeedback({
        type: 'success',
        msg: value ? t('settings.private_account') + ' ✓' : t('settings.public_account') + ' ✓',
      });
      await refresh();
      if (value) loadFollowRequests();
    } else {
      setPrivacyFeedback({ type: 'error', msg: data.error || t('common.error') });
      setIsPrivate(!value);
    }
    clearFeedback(setPrivacyFeedback);
  };

  const handlePrivacyToggle = () => {
    const next = !isPrivate;
    setIsPrivate(next);
    savePrivacy(next);
  };

  const handleFollowRequest = async (id: number, action: 'accept' | 'reject') => {
    await fetch(`/api/follow-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    setFollowRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const savePassword = async () => {
    if (newPw !== confirmPw) {
      setPwFeedback({ type: 'error', msg: t('settings.confirm_password') + '!' });
      clearFeedback(setPwFeedback);
      return;
    }
    setPwLoading(true);
    setPwFeedback(null);
    const res = await fetch('/api/settings/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password: currentPw, new_password: newPw, confirm_password: confirmPw }),
    });
    const data = await res.json();
    setPwLoading(false);
    if (data.success) {
      setPwFeedback({ type: 'success', msg: t('settings.save') + ' ✓' });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } else {
      setPwFeedback({ type: 'error', msg: data.error || t('common.error') });
    }
    clearFeedback(setPwFeedback);
  };

  const savePreferences = async () => {
    setPrefLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setPrefLoading(false);
    setPrefFeedback({ type: 'success', msg: t('settings.save') + ' ✓' });
    clearFeedback(setPrefFeedback);
    void notifBadge; void notifJob; void notifFollow;
  };

  const cancelPro = async () => {
    setSubLoading(true);
    setSubFeedback(null);
    try {
      const res = await fetch('/api/billing/cancel', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSubFeedback({ type: 'success', msg: 'Piano annullato. Torni a trovarci presto! ✓' });
        setShowCancelConfirm(false);
        await refresh();
      } else {
        setSubFeedback({ type: 'error', msg: data.error || 'Errore durante la cancellazione.' });
      }
    } catch {
      setSubFeedback({ type: 'error', msg: 'Errore di rete. Riprova.' });
    }
    setSubLoading(false);
    clearFeedback(setSubFeedback);
  };

  // ── Save button (inline so it can use t()) ────────────────────────────────
  const SaveButton = ({
    onClick, loading, disabled,
  }: { onClick: () => void; loading: boolean; disabled?: boolean }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={loading || disabled}
      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
        />
      ) : (
        <Check className="w-4 h-4" strokeWidth={2.5} />
      )}
      {loading ? t('settings.saving') : t('settings.save')}
    </motion.button>
  );

  if (!user) return null;

  const initials = user.display_name
    ? user.display_name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : user.username?.slice(0, 2).toUpperCase() || 'U';

  return (
    <>
      <TopBar />
      <PageTransition>
        <div className="px-4 pt-4 pb-24 max-w-2xl mx-auto space-y-4">

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 text-white shadow-2xl shadow-indigo-500/25"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/20 rounded-full blur-2xl" />
              <div className="relative z-10 flex items-center gap-4">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-white/25 shadow-xl overflow-hidden"
                style={{ background: `${avatarColor}55` }}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-white">{initials}</span>
                )}
              </div>
              <div>
                <h1 className="text-xl font-black">{user.display_name}</h1>
                <p className="text-sm text-indigo-200">@{user.username}</p>
                <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                  <span className="text-xs bg-white/15 px-2 py-0.5 rounded-full font-medium">
                    {user.role === 'company' ? t('settings.company_badge') : t('settings.developer_role')}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isPrivate ? 'bg-amber-400/25 text-amber-200' : 'bg-emerald-400/25 text-emerald-200'
                  }`}>
                    {isPrivate ? t('settings.private_badge') : t('settings.public_badge')}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── 1. Profilo ── */}
          <SectionCard
            icon={User}
            title={t('settings.profile_section')}
            subtitle={t('settings.profile_subtitle')}
            index={0}
          >
            <Field label={t('settings.display_name')} value={displayName} onChange={setDisplayName} placeholder="Mario Rossi" maxLength={60} />
            <Field
              label={t('settings.username')}
              value={username}
              onChange={setUsername}
              placeholder="mario_rossi"
              hint={t('settings.username_hint')}
              maxLength={30}
            />
            <Field label={t('settings.professional_title')} value={title} onChange={setTitle} placeholder="Full-Stack Developer" maxLength={80} />
            <Field
              label={t('settings.bio')}
              value={bio}
              onChange={setBio}
              placeholder={t('settings.bio_placeholder')}
              maxLength={200}
              multiline
              hint={`${bio.length}/200`}
            />
            {user.role === 'company' && (
              <>
                <Field label={t('settings.company_name')} value={companyName} onChange={setCompanyName} placeholder="Acme S.r.l." maxLength={100} />
                <Field label={t('settings.website')} value={companyWebsite} onChange={setCompanyWebsite} placeholder="https://acme.it" maxLength={200} />
              </>
            )}
            <AnimatePresence>{profileFeedback && <Feedback type={profileFeedback.type} message={profileFeedback.msg} />}</AnimatePresence>
            <SaveButton onClick={saveProfile} loading={profileLoading} />
          </SectionCard>

          {/* ── 2. Aspetto ── */}
          <SectionCard
            icon={Palette}
            title={t('settings.appearance_section')}
            subtitle="Colore tema e avatar dell'interfaccia"
            index={1}
          >
            <div className="space-y-5">
              {/* Theme colour (controls global UI accent) */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                  Colore tema (interfaccia)
                </label>
                {/* Live preview strip */}
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-20 rounded-xl shadow-lg transition-all duration-300 border border-white/20"
                    style={{ background: `linear-gradient(135deg, ${themeColor}, ${avatarColor})` }}
                  />
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                      {AVATAR_COLORS.find((c) => c.hex === themeColor)?.label ?? 'Personalizzato'}
                    </p>
                    <p className="text-xs text-zinc-400 font-mono">{themeColor}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Applicato a bottoni, link e accenti UI</p>
                  </div>
                </div>
                {/* Swatches — selecting one updates BOTH themeColor and avatarColor */}
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_COLORS.map((c) => (
                    <motion.button
                      key={c.hex}
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => { setThemeColor(c.hex); setAvatarColor(c.hex); }}
                      title={c.label}
                      className={`relative h-10 w-full rounded-xl transition-all duration-200 ${
                        themeColor === c.hex ? 'ring-2 ring-offset-2 ring-zinc-900/30 dark:ring-white/40 scale-110' : ''
                      }`}
                      style={{ background: c.hex }}
                    >
                      {themeColor === c.hex && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow" strokeWidth={3} />
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>
                {/* Custom hex */}
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => { setThemeColor(e.target.value); setAvatarColor(e.target.value); }}
                    className="h-10 w-10 cursor-pointer rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent p-1"
                  />
                  <span className="text-xs text-zinc-500">{t('settings.custom_color')}</span>
                </div>
              </div>
            </div>
            <AnimatePresence>{appearanceFeedback && <Feedback type={appearanceFeedback.type} message={appearanceFeedback.msg} />}</AnimatePresence>
            <SaveButton onClick={saveAppearance} loading={appearanceLoading} />
          </SectionCard>

          {/* ── 2b. Foto Profilo ── */}
          <SectionCard
            icon={Camera}
            title="Foto Profilo"
            subtitle="Carica un'immagine (max 500 KB)"
            index={2}
          >
            <div className="flex items-center gap-4">
              {/* Avatar preview */}
              <div className="relative shrink-0">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="h-20 w-20 rounded-2xl object-cover border-2 border-zinc-200 dark:border-zinc-700 shadow-md"
                  />
                ) : (
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-black text-white border-2 border-white/20 shadow-md"
                    style={{ background: avatarColor }}
                  >
                    {initials}
                  </div>
                )}
                {avatarPreview && (
                  <button
                    onClick={() => { setAvatarPreview(null); setAvatarUrl(null); }}
                    className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" strokeWidth={2.5} />
                  </button>
                )}
              </div>
              {/* Upload area */}
              <div className="flex-1 space-y-2">
                <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 px-4 py-3 hover:border-indigo-400 transition-colors">
                  <Upload className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm text-zinc-500">Scegli immagine…</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleAvatarFileChange}
                  />
                </label>
                <p className="text-xs text-zinc-400">PNG, JPG, WEBP — max 500 KB</p>
              </div>
            </div>
            <AnimatePresence>{uploadFeedback && <Feedback type={uploadFeedback.type} message={uploadFeedback.msg} />}</AnimatePresence>
            <SaveButton onClick={saveAvatarUpload} loading={uploadLoading} disabled={!avatarUrl || avatarUrl === user?.avatar_url} />
          </SectionCard>

          {/* ── 3. Lingua ── */}
          <SectionCard
            icon={Globe}
            title={t('settings.language_section')}
            subtitle={t('settings.language_subtitle')}
            index={3}
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {LANGUAGES.map((langItem) => (
                <motion.button
                  key={langItem.code}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setLanguage(langItem.code)}
                  className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                    language === langItem.code
                      ? 'border-indigo-400/60 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 dark:from-indigo-950/40 dark:to-purple-950/40 dark:text-indigo-300 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'
                  }`}
                >
                  <span className="text-xl">{langItem.flag}</span>
                  <span className="text-sm font-semibold">{langItem.label}</span>
                  {language === langItem.code && (
                    <Check className="w-3.5 h-3.5 ml-auto text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
                  )}
                </motion.button>
              ))}
            </div>
            <AnimatePresence>{langFeedback && <Feedback type={langFeedback.type} message={langFeedback.msg} />}</AnimatePresence>
            <SaveButton onClick={saveLanguage} loading={langLoading} />
          </SectionCard>

          {/* ── 4. Privacy ── */}
          <SectionCard
            icon={Shield}
            title={t('settings.privacy_section')}
            subtitle={t('settings.privacy_subtitle')}
            index={4}
          >
            {/* Toggle */}
            <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                  isPrivate
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                }`}>
                  {isPrivate ? <Lock className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">
                    {isPrivate ? t('settings.private_account') : t('settings.public_account')}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {isPrivate ? t('settings.private_desc') : t('settings.public_desc')}
                  </p>
                </div>
              </div>
              <button
                onClick={handlePrivacyToggle}
                disabled={privacyLoading}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                  isPrivate ? 'bg-amber-500' : 'bg-zinc-300 dark:bg-zinc-600'
                }`}
              >
                <motion.span
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow-lg ${isPrivate ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>

            {/* Info box */}
            <AnimatePresence>
              {isPrivate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-800/30 p-3.5 flex gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                      {t('settings.privacy_info')}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>{privacyFeedback && <Feedback type={privacyFeedback.type} message={privacyFeedback.msg} />}</AnimatePresence>

            {/* Follow requests list */}
            <AnimatePresence>
              {isPrivate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                        {t('settings.pending_requests')}
                        {followRequests.length > 0 && (
                          <span className="ml-2 inline-flex items-center justify-center h-4 min-w-4 rounded-full bg-indigo-600 text-white text-[10px] font-black px-1">
                            {followRequests.length}
                          </span>
                        )}
                      </h3>
                      <button onClick={loadFollowRequests} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                        {t('settings.refresh')}
                      </button>
                    </div>

                    {frLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full"
                        />
                      </div>
                    ) : followRequests.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-3xl mb-2">
                          ✅
                        </motion.div>
                        <p className="text-sm font-medium text-zinc-500">{t('settings.no_requests')}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {followRequests.map((req) => {
                          const reqInitials = req.requester_display_name
                            ? req.requester_display_name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
                            : req.requester_username?.slice(0, 2).toUpperCase() || '??';
                          return (
                            <motion.div
                              key={req.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-700 p-3"
                            >
                              <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
                                style={{ background: req.requester_avatar_color || '#6366f1' }}
                              >
                                {reqInitials}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                                  {req.requester_display_name || req.requester_username}
                                </p>
                                <p className="text-xs text-zinc-500">@{req.requester_username}</p>
                                <div className="flex items-center gap-1 mt-0.5 text-[10px] text-zinc-400">
                                  <Clock className="w-3 h-3" />
                                  {new Date(req.created_at).toLocaleDateString(lang === 'en' ? 'en-GB' : lang + '-' + lang.toUpperCase())}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <motion.button
                                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                                  onClick={() => handleFollowRequest(req.id, 'accept')}
                                  className="flex items-center gap-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 text-xs font-bold hover:bg-emerald-200 dark:hover:bg-emerald-800/40 transition-colors"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  {t('settings.accept')}
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                                  onClick={() => handleFollowRequest(req.id, 'reject')}
                                  className="flex items-center gap-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1.5 text-xs font-bold hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                  {t('settings.reject')}
                                </motion.button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </SectionCard>

          {/* ── 5. Sicurezza ── */}
          <SectionCard
            icon={Lock}
            title={t('settings.security_section')}
            subtitle={t('settings.security_subtitle')}
            index={5}
          >
            <PasswordField label={t('settings.current_password')} value={currentPw} onChange={setCurrentPw} placeholder="••••••••" />
            <PasswordField label={t('settings.new_password')} value={newPw} onChange={setNewPw} placeholder="Min 6 chars" />
            <PasswordField label={t('settings.confirm_password')} value={confirmPw} onChange={setConfirmPw} placeholder="Repeat password" />
            {/* Strength indicator */}
            {newPw.length > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => {
                    const strength = Math.min(
                      Math.floor((newPw.length / 6) * 2) +
                        ((/[A-Z]/.test(newPw) ? 1 : 0) + (/[0-9]/.test(newPw) ? 1 : 0) + (/[^A-Za-z0-9]/.test(newPw) ? 1 : 0)),
                      4
                    );
                    return (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        i < strength
                          ? strength <= 1 ? 'bg-red-500' : strength === 2 ? 'bg-amber-500' : strength === 3 ? 'bg-yellow-500' : 'bg-emerald-500'
                          : 'bg-zinc-200 dark:bg-zinc-700'
                      }`} />
                    );
                  })}
                </div>
              </div>
            )}
            <AnimatePresence>{pwFeedback && <Feedback type={pwFeedback.type} message={pwFeedback.msg} />}</AnimatePresence>
            <SaveButton onClick={savePassword} loading={pwLoading} disabled={!currentPw || !newPw || !confirmPw} />
          </SectionCard>

          {/* ── 6. Preferenze ── */}
          <SectionCard
            icon={Bell}
            title={t('settings.preferences_section')}
            subtitle={t('settings.preferences_subtitle')}
            index={6}
          >
            <div className="space-y-3">
              {[
                { label: t('settings.badge_notif'), desc: t('settings.badge_notif_desc'), value: notifBadge, setter: setNotifBadge },
                { label: t('settings.job_notif'),   desc: t('settings.job_notif_desc'),   value: notifJob,   setter: setNotifJob   },
                { label: t('settings.follow_notif'), desc: t('settings.follow_notif_desc'), value: notifFollow, setter: setNotifFollow },
              ].map(({ label, desc, value, setter }) => (
                <div key={label} className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">{label}</p>
                    <p className="text-xs text-zinc-500">{desc}</p>
                  </div>
                  <button
                    onClick={() => setter((v) => !v)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      value ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-600'
                    }`}
                  >
                    <motion.span
                      layout
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={`inline-block h-5 w-5 rounded-full bg-white shadow-lg ${value ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                  </button>
                </div>
              ))}
            </div>
            <AnimatePresence>{prefFeedback && <Feedback type={prefFeedback.type} message={prefFeedback.msg} />}</AnimatePresence>
            <SaveButton onClick={savePreferences} loading={prefLoading} />
          </SectionCard>

          {/* ── 7. Abbonamento ── */}
          <SectionCard
            icon={Crown}
            title="Abbonamento"
            subtitle="Gestisci il tuo piano DevHub"
            index={7}
          >
            {(user?.is_pro ?? 0) === 1 ? (
              <div className="space-y-4">
                {/* Pro status banner */}
                <div className="relative overflow-hidden rounded-xl border border-amber-300/40 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 dark:border-amber-700/30 p-4">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-amber-400/10 rounded-full blur-xl" />
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 shadow-lg shadow-amber-500/25">
                        <Crown className="w-5 h-5 text-white" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Piano Pro attivo</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          {user.pro_expires
                            ? `Rinnovo il ${new Date(user.pro_expires).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}`
                            : 'Abbonamento attivo'}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-bold bg-amber-400/20 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full border border-amber-300/50">
                      PRO
                    </span>
                  </div>
                </div>

                {/* Features list */}
                <div className="space-y-2">
                  {[
                    'Analytics avanzate del profilo',
                    'Portfolio progetti con link GitHub/live',
                    'Badge Pro sul profilo pubblico',
                    'Accesso prioritario alle nuove funzionalità',
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                      <Check className="w-4 h-4 shrink-0 text-amber-500" strokeWidth={2.5} />
                      {feat}
                    </div>
                  ))}
                </div>

                {/* Cancel flow */}
                <AnimatePresence mode="wait">
                  {!showCancelConfirm ? (
                    <motion.button
                      key="cancel-btn"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowCancelConfirm(true)}
                      className="text-xs text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors underline underline-offset-2"
                    >
                      Annulla abbonamento
                    </motion.button>
                  ) : (
                    <motion.div
                      key="cancel-confirm"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/10 p-4 space-y-3"
                    >
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400">Sei sicuro di voler annullare?</p>
                      <p className="text-xs text-red-600/80 dark:text-red-400/70">
                        Perderai accesso alle funzionalità Pro al termine del periodo corrente.
                      </p>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={cancelPro}
                          disabled={subLoading}
                          className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {subLoading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                              className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                            />
                          ) : <X className="w-3.5 h-3.5" />}
                          Conferma annullamento
                        </motion.button>
                        <button
                          onClick={() => setShowCancelConfirm(false)}
                          className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          Mantieni Pro
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Free user — upgrade CTA */
              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white">Piano Free</p>
                      <p className="text-xs text-zinc-500 mt-0.5">Accesso alle funzionalità base di DevHub</p>
                    </div>
                    <span className="text-xs font-bold bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-2.5 py-1 rounded-full">
                      FREE
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-300/40 bg-gradient-to-br from-amber-50/60 to-orange-50/40 dark:from-amber-900/10 dark:to-orange-900/5 dark:border-amber-700/20 p-4 space-y-3">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Con Pro ottieni</p>
                  <div className="space-y-2">
                    {[
                      'Analytics avanzate del profilo',
                      'Portfolio progetti con link GitHub/live',
                      'Badge Pro sul profilo pubblico',
                      'Accesso prioritario alle nuove funzionalità',
                    ].map((feat) => (
                      <div key={feat} className="flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
                        <Crown className="w-3.5 h-3.5 shrink-0 text-amber-500" strokeWidth={2} />
                        {feat}
                      </div>
                    ))}
                  </div>
                  <a
                    href="/pricing"
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-shadow"
                  >
                    <Crown className="w-4 h-4" strokeWidth={2} />
                    Passa a Pro — da €7,99/mese
                  </a>
                </div>
              </div>
            )}

            <AnimatePresence>{subFeedback && <Feedback type={subFeedback.type} message={subFeedback.msg} />}</AnimatePresence>
          </SectionCard>

          {/* ── Account info footer ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-4 space-y-2"
          >
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">{t('settings.account_info')}</h3>
            <div className="space-y-1.5">
              {[
                { label: t('settings.email'),        value: user.email },
                { label: t('settings.role'),          value: user.role === 'company' ? t('settings.company_role') : t('settings.worker_role') },
                { label: t('settings.city'),          value: user.city || '—' },
                { label: t('settings.member_since'),  value: new Date(user.created_at).toLocaleDateString(lang === 'en' ? 'en-GB' : lang + '-' + lang.toUpperCase(), { day: 'numeric', month: 'long', year: 'numeric' }) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">{label}</span>
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{value}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
              <button className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                <span className="flex items-center gap-2">
                  <X className="w-4 h-4" />
                  {t('settings.delete_account')}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

        </div>
      </PageTransition>
    </>
  );
}
