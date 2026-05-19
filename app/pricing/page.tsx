'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopBar from '@/components/TopBar';
import { useAuth } from '@/lib/AuthContext';
import {
  Crown, Check, Zap, Shield, BarChart3, Star, ArrowRight,
  X, CreditCard, Lock, Sparkles, Users, BookOpen,
  TrendingUp, MessageSquare, FileText, Globe, ChevronDown,
} from 'lucide-react';

// ─── Feature comparison data ─────────────────────────────────────────────────
const FREE_FEATURES = [
  { icon: Users, text: 'Profilo pubblico e community feed' },
  { icon: BookOpen, text: 'Accesso a tutti i corsi gratuiti' },
  { icon: FileText, text: '1 annuncio attivo alla volta' },
  { icon: Globe, text: 'Mappa interattiva delle opportunità' },
  { icon: Star, text: 'Badge e certificazioni base' },
];

const PRO_FEATURES = [
  { icon: Crown, text: 'Badge PRO verificato sul profilo', highlight: true },
  { icon: TrendingUp, text: 'Dashboard analytics avanzata', highlight: true },
  { icon: FileText, text: 'Annunci illimitati + posizionamento priority', highlight: true },
  { icon: Star, text: 'Sezione Portfolio e Progetti', highlight: true },
  { icon: BarChart3, text: 'Statistiche di performance dei post', highlight: false },
  { icon: Users, text: 'Priorità nei risultati di ricerca', highlight: false },
  { icon: MessageSquare, text: 'Supporto prioritario via chat', highlight: false },
  { icon: Shield, text: 'Certificazioni avanzate sbloccate', highlight: false },
  { icon: Zap, text: 'Accesso anticipato a nuove funzioni', highlight: false },
];

// ─── FAQ data ─────────────────────────────────────────────────────────────────
const FAQ = [
  {
    q: 'Posso cancellare in qualsiasi momento?',
    a: 'Sì, puoi cancellare il tuo abbonamento Pro in qualsiasi momento dalle Impostazioni. Il piano resterà attivo fino alla scadenza del periodo pagato.',
  },
  {
    q: 'Cosa succede ai miei annunci se cancello?',
    a: 'I tuoi annunci rimangono visibili fino a scadenza. Dopo la cancellazione, potrai mantenere solo 1 annuncio attivo come nel piano Free.',
  },
  {
    q: 'Il piano annuale offre uno sconto?',
    a: 'Sì! Con il piano annuale risparmi il 20% rispetto al mensile — paghi €95.88 invece di €119.88.',
  },
  {
    q: 'Il pagamento è sicuro?',
    a: 'Assolutamente. Utilizziamo crittografia SSL e non conserviamo i tuoi dati di pagamento. Tutti i pagamenti sono gestiti in modo sicuro.',
  },
];

// ─── Checkout Modal ──────────────────────────────────────────────────────────
function CheckoutModal({
  plan,
  onClose,
  onSuccess,
}: {
  plan: 'monthly' | 'yearly';
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<'form' | 'processing' | 'done'>('form');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const price = plan === 'yearly' ? '€95.88/anno' : '€9.99/mese';
  const savings = plan === 'yearly' ? '— risparmi €24' : '';

  const formatCard = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (v: string) =>
    v.replace(/\D/g, '').slice(0, 4).replace(/(.{2})/, '$1/');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!cardName.trim()) e.cardName = 'Nome richiesto';
    if (cardNumber.replace(/\s/g, '').length < 16) e.cardNumber = 'Numero carta non valido';
    if (expiry.length < 5) e.expiry = 'Scadenza non valida';
    if (cvv.length < 3) e.cvv = 'CVV non valido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStep('processing');
    await new Promise((r) => setTimeout(r, 2200));

    const res = await fetch('/api/billing/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });

    if (res.ok) {
      setStep('done');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } else {
      setStep('form');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={step === 'form' ? onClose : undefined}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-3xl bg-surface-0 border border-glass-border-subtle shadow-2xl overflow-hidden"
      >
        {/* Header gradient */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-amber-400/10 via-yellow-300/10 to-amber-500/10 border-b border-amber-200/30 dark:border-amber-700/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 shadow-sm">
                <Crown className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Attiva DevHub Pro</h2>
                <p className="text-xs text-muted">{price} {savings}</p>
              </div>
            </div>
            {step === 'form' && (
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-2 transition-colors text-muted">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Card name */}
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">
                    Nome sulla carta
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Mario Rossi"
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm bg-surface-1 text-foreground placeholder-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/40 ${errors.cardName ? 'border-red-400' : 'border-surface-3 focus:border-amber-400/60'}`}
                  />
                  {errors.cardName && <p className="text-xs text-red-500 mt-1">{errors.cardName}</p>}
                </div>

                {/* Card number */}
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">
                    Numero carta
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCard(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      className={`w-full rounded-xl border px-4 py-2.5 pr-10 text-sm bg-surface-1 text-foreground placeholder-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/40 ${errors.cardNumber ? 'border-red-400' : 'border-surface-3 focus:border-amber-400/60'}`}
                    />
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                  {errors.cardNumber && <p className="text-xs text-red-500 mt-1">{errors.cardNumber}</p>}
                </div>

                {/* Expiry + CVV */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">
                      Scadenza
                    </label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/AA"
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm bg-surface-1 text-foreground placeholder-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/40 ${errors.expiry ? 'border-red-400' : 'border-surface-3 focus:border-amber-400/60'}`}
                    />
                    {errors.expiry && <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      placeholder="123"
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm bg-surface-1 text-foreground placeholder-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/40 ${errors.cvv ? 'border-red-400' : 'border-surface-3 focus:border-amber-400/60'}`}
                    />
                    {errors.cvv && <p className="text-xs text-red-500 mt-1">{errors.cvv}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-sm bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 hover:from-amber-500 hover:to-yellow-600 transition-all shadow-md shadow-amber-400/25 hover:shadow-amber-400/40 hover:-translate-y-0.5"
                >
                  <Crown className="w-4 h-4" />
                  Attiva Pro — {price}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3" />
                  Pagamento sicuro — nessun dato salvato
                </div>
              </motion.form>
            )}

            {step === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 flex flex-col items-center gap-4"
              >
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-200/40 dark:border-amber-700/30" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-amber-400 animate-spin" />
                  <Crown className="w-6 h-6 text-amber-500" />
                </div>
                <p className="text-sm font-semibold text-foreground">Elaborazione pagamento…</p>
                <p className="text-xs text-muted">Attivazione Pro in corso</p>
              </motion.div>
            )}

            {step === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="py-10 flex flex-col items-center gap-4 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 shadow-xl shadow-amber-400/30"
                >
                  <Crown className="w-8 h-8 text-white" strokeWidth={2.5} />
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Benvenuto in Pro!</h3>
                  <p className="text-sm text-muted mt-1">Il tuo account è stato aggiornato con successo.</p>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {['Badge PRO', 'Analytics', 'Portfolio', 'Priority listing'].map((f) => (
                    <span key={f} className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200/50 dark:border-amber-700/30">
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-glass-border-subtle rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-1 transition-colors"
      >
        <span className="text-sm font-semibold text-foreground pr-4">{q}</span>
        <ChevronDown className={`w-4 h-4 text-muted shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm text-muted leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Pricing Page ────────────────────────────────────────────────────────
export default function PricingPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [checkoutPlan, setCheckoutPlan] = useState<'monthly' | 'yearly' | null>(null);

  const isPro = (user?.is_pro ?? 0) === 1;

  const handleSelectPro = (plan: 'monthly' | 'yearly') => {
    if (!user) {
      router.push('/auth');
      return;
    }
    if (isPro) return;
    setCheckoutPlan(plan);
  };

  const handleSuccess = async () => {
    setCheckoutPlan(null);
    await refreshUser();
    router.push('/profile');
  };

  return (
    <>
      <TopBar />
      <div className="px-4 pt-4 pb-16 max-w-2xl mx-auto">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center pt-2 pb-8"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/40 text-amber-700 dark:text-amber-400 text-xs font-bold tracking-wide uppercase mb-4">
            <Sparkles className="w-3 h-3" />
            DevHub Pro
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-3">
            Porta la tua carriera IT
            <br />
            <span className="gradient-text-pro">al livello successivo</span>
          </h1>
          <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
            Ottieni visibilità, analisi avanzate e strumenti esclusivi per distinguerti nel mercato IT italiano.
          </p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <span className={`text-sm font-medium ${billing === 'monthly' ? 'text-foreground' : 'text-muted'}`}>Mensile</span>
          <button
            onClick={() => setBilling((b) => (b === 'monthly' ? 'yearly' : 'monthly'))}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${billing === 'yearly' ? 'bg-amber-400' : 'bg-surface-3'}`}
          >
            <motion.div
              animate={{ x: billing === 'yearly' ? 24 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
            />
          </button>
          <span className={`text-sm font-medium flex items-center gap-1.5 ${billing === 'yearly' ? 'text-foreground' : 'text-muted'}`}>
            Annuale
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-700/40">
              -20%
            </span>
          </span>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">

          {/* Free card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="pricing-card rounded-2xl border border-glass-border-subtle bg-surface-0 p-6 flex flex-col"
          >
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted mb-2">Free</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-foreground">€0</span>
                <span className="text-sm text-muted">/mese</span>
              </div>
              <p className="text-xs text-muted mt-1.5">Per iniziare il tuo percorso</p>
            </div>

            <div className="space-y-2.5 flex-1 mb-6">
              {FREE_FEATURES.map((f) => (
                <div key={f.text} className="flex items-center gap-2.5 text-sm text-muted">
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-surface-2">
                    <Check className="w-2.5 h-2.5 text-muted" strokeWidth={3} />
                  </div>
                  {f.text}
                </div>
              ))}
            </div>

            {user ? (
              isPro ? (
                <div className="text-center text-xs text-muted py-2">Piano attuale: Free</div>
              ) : (
                <div className="rounded-xl border border-glass-border-subtle bg-surface-1 px-4 py-2.5 text-center text-sm font-medium text-muted">
                  Piano attuale
                </div>
              )
            ) : (
              <Link href="/auth">
                <div className="w-full rounded-xl border border-glass-border-subtle bg-surface-1 px-4 py-2.5 text-center text-sm font-medium text-muted hover:bg-surface-2 transition-colors cursor-pointer">
                  Inizia gratis
                </div>
              </Link>
            )}
          </motion.div>

          {/* Pro card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="pricing-card gradient-border-pro rounded-2xl bg-gradient-to-br from-amber-50/80 via-surface-0 to-yellow-50/50 dark:from-amber-950/20 dark:via-surface-0 dark:to-yellow-950/10 p-6 flex flex-col relative overflow-hidden"
          >
            {/* Popular badge */}
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 shadow-sm">
                <Crown className="w-2.5 h-2.5" strokeWidth={3} />
                POPOLARE
              </span>
            </div>

            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">Pro</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-foreground">
                  {billing === 'yearly' ? '€7.99' : '€9.99'}
                </span>
                <span className="text-sm text-muted">/mese</span>
              </div>
              {billing === 'yearly' && (
                <p className="text-xs text-muted mt-1">€95.88 fatturati annualmente</p>
              )}
              {billing === 'monthly' && (
                <p className="text-xs text-muted mt-1.5">Cancella in qualsiasi momento</p>
              )}
            </div>

            <div className="space-y-2.5 flex-1 mb-6">
              {PRO_FEATURES.map((f) => (
                <div key={f.text} className="flex items-center gap-2.5 text-sm">
                  <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${f.highlight ? 'bg-gradient-to-br from-amber-400 to-yellow-500' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                    <Check className={`w-2.5 h-2.5 ${f.highlight ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`} strokeWidth={3} />
                  </div>
                  <span className={f.highlight ? 'font-medium text-foreground' : 'text-muted'}>
                    {f.text}
                  </span>
                </div>
              ))}
            </div>

            {isPro ? (
              <div className="flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 bg-gradient-to-r from-amber-400/20 to-yellow-400/20 border border-amber-300/40 dark:border-amber-700/40 text-amber-700 dark:text-amber-400 text-sm font-semibold">
                <Crown className="w-3.5 h-3.5" strokeWidth={2.5} />
                Piano attuale
              </div>
            ) : (
              <button
                onClick={() => handleSelectPro(billing)}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-sm bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 hover:from-amber-500 hover:to-yellow-600 transition-all shadow-lg shadow-amber-400/25 hover:shadow-amber-400/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                <Crown className="w-4 h-4" strokeWidth={2.5} />
                {user ? 'Attiva Pro ora' : 'Registrati e attiva Pro'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        </div>

        {/* All features included note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex items-center justify-center gap-2 text-xs text-muted mb-8"
        >
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          Pro include tutto il piano Free, più funzioni esclusive illimitate
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-glass-border-subtle bg-surface-0 p-5 mb-6"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-muted text-center mb-4">
            Chi usa DevHub Pro
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { n: '2.400+', l: 'Utenti Pro attivi' },
              { n: '98%', l: 'Soddisfazione' },
              { n: '3×', l: 'Più visibilità' },
            ].map(({ n, l }) => (
              <div key={l}>
                <div className="text-xl font-extrabold gradient-text-pro">{n}</div>
                <div className="text-xs text-muted mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-muted text-center mb-4">
            Domande Frequenti
          </p>
          <div className="space-y-2">
            {FAQ.map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </motion.div>

      </div>

      {/* Checkout modal */}
      <AnimatePresence>
        {checkoutPlan && (
          <CheckoutModal
            plan={checkoutPlan}
            onClose={() => setCheckoutPlan(null)}
            onSuccess={handleSuccess}
          />
        )}
      </AnimatePresence>
    </>
  );
}
