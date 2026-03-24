'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { registerUser, loginUser } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';

type Mode = 'login' | 'register';
type Role = 'worker' | 'company';

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address: { city?: string; town?: string; village?: string; state?: string; country?: string };
}

const ITALIAN_CITIES = [
  'Roma', 'Milano', 'Napoli', 'Torino', 'Palermo', 'Genova', 'Bologna', 'Firenze',
  'Bari', 'Catania', 'Venezia', 'Verona', 'Messina', 'Padova', 'Trieste', 'Brescia',
  'Taranto', 'Prato', 'Reggio Calabria', 'Modena', 'Reggio Emilia', 'Perugia',
  'Livorno', 'Ravenna', 'Cagliari', 'Foggia', 'Rimini', 'Salerno', 'Ferrara', 'Sassari',
];

export default function AuthPage() {
  const router = useRouter();
  const { refresh, user } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [role, setRole] = useState<Role>('worker');
  const [step, setStep] = useState(1); // register: step 1=credentials, 2=location
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    email: '',
    password: '',
    display_name: '',
    username: '',
    city: '',
    region: '',
    lat: 0,
    lng: 0,
    company_name: '',
    company_website: '',
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) router.replace('/');
  }, [user, router]);

  const searchLocation = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return; }
    setLoadingSuggestions(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ' Italia')}&format=json&addressdetails=1&limit=5&countrycodes=it`);
      const data: LocationSuggestion[] = await res.json();
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchLocation(locationQuery), 400);
    return () => clearTimeout(t);
  }, [locationQuery, searchLocation]);

  // Also filter local cities
  const localCities = locationQuery.length >= 1
    ? ITALIAN_CITIES.filter((c) => c.toLowerCase().startsWith(locationQuery.toLowerCase())).slice(0, 4)
    : [];

  const selectCity = (city: string, region: string, lat: number, lng: number) => {
    setForm((f) => ({ ...f, city, region, lat, lng }));
    setLocationQuery(city);
    setSuggestions([]);
  };

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setError('');
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) { setError('Compila tutti i campi'); return; }
    setLoading(true);
    setError('');
    try {
      await loginUser(form.email, form.password);
      await refresh();
      router.replace('/');
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message?.includes('401') ? 'Credenziali non valide' : "Errore durante l'accesso");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStep1 = () => {
    if (!form.email || !form.password || !form.display_name || !form.username) {
      setError('Compila tutti i campi');
      return;
    }
    if (form.password.length < 6) { setError('Password: minimo 6 caratteri'); return; }
    if (role === 'company' && !form.company_name) { setError('Inserisci il nome azienda'); return; }
    setError('');
    setStep(2);
  };

  const handleRegisterStep2 = async () => {
    if (!form.city) { setError('Seleziona una città'); return; }
    setLoading(true);
    setError('');
    try {
      await registerUser({
        email: form.email,
        password: form.password,
        role,
        display_name: form.display_name,
        username: form.username,
        city: form.city,
        region: form.region,
        lat: form.lat || undefined,
        lng: form.lng || undefined,
        company_name: role === 'company' ? form.company_name : undefined,
        company_website: role === 'company' ? form.company_website : undefined,
      });
      await refresh();
      router.replace('/');
    } catch (e: unknown) {
      const err = e as { message?: string };
      if (err?.message?.includes('409')) {
        setError('Email o username già in uso');
      } else {
        setError('Errore durante la registrazione');
      }
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full rounded-xl border border-zinc-200/70 bg-white/60 dark:border-zinc-700/70 dark:bg-zinc-900/60 backdrop-blur-sm px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated BG */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-zinc-950 to-purple-950" />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0], opacity: [0.08, 0.16, 0.08] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-pink-500 blur-[100px]"
        />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-8 group">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 8 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
              <path fillRule="evenodd" d="M14.447 3.027a.75.75 0 0 1 .527.92l-4.5 16.5a.75.75 0 0 1-1.448-.394l4.5-16.5a.75.75 0 0 1 .921-.526ZM16.72 6.22a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06L21.44 12l-4.72-4.72a.75.75 0 0 1 0-1.06Zm-9.44 0a.75.75 0 0 1 0 1.06L2.56 12l4.72 4.72a.75.75 0 0 1-1.06 1.06L.97 12.53a.75.75 0 0 1 0-1.06l5.25-5.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
            </svg>
          </motion.div>
          <span className="text-2xl font-black text-white">DevHub IT</span>
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 shadow-2xl shadow-black/40">
          {/* Mode tabs */}
          <div className="flex rounded-2xl bg-white/5 p-1 mb-6 gap-1">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setStep(1); setError(''); }}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-300 ${
                  mode === m
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {m === 'login' ? 'Accedi' : 'Registrati'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ---- LOGIN ---- */}
            {mode === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-medium text-white/60 mb-1.5 block">Email</label>
                  <input className={inputClass} type="email" placeholder="tu@email.com" value={form.email} onChange={update('email')} />
                </div>
                <div>
                  <label className="text-xs font-medium text-white/60 mb-1.5 block">Password</label>
                  <input className={inputClass} type="password" placeholder="••••••••" value={form.password} onChange={update('password')} />
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
                    {error}
                  </motion.div>
                )}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:opacity-90 transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31" strokeDashoffset="10" /></svg>
                      Accesso in corso…
                    </span>
                  ) : 'Accedi →'}
                </motion.button>
              </motion.div>
            )}

            {/* ---- REGISTER ---- */}
            {mode === 'register' && (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-5">
                  {[1, 2].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <motion.div
                        animate={{ scale: step === s ? 1.1 : 1 }}
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                          step > s
                            ? 'bg-indigo-500 text-white'
                            : step === s
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                            : 'bg-white/10 text-white/40'
                        }`}
                      >
                        {step > s ? '✓' : s}
                      </motion.div>
                      <span className={`text-xs ${step === s ? 'text-white' : 'text-white/40'}`}>
                        {s === 1 ? 'Account' : 'Zona'}
                      </span>
                      {s < 2 && <div className={`h-px w-8 ${step > 1 ? 'bg-indigo-500' : 'bg-white/10'}`} />}
                    </div>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {/* Step 1: Credentials + Role */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      {/* Role selection */}
                      <div>
                        <label className="text-xs font-medium text-white/60 mb-2 block">Sei un:</label>
                        <div className="grid grid-cols-2 gap-2">
                          {([
                            { value: 'worker', label: 'Lavoratore', emoji: '👨‍💻', desc: 'Cerco lavoro o offro servizi' },
                            { value: 'company', label: 'Azienda', emoji: '🏢', desc: 'Cerco talenti tech' },
                          ] as { value: Role; label: string; emoji: string; desc: string }[]).map((r) => (
                            <motion.button
                              key={r.value}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setRole(r.value)}
                              className={`rounded-2xl border p-3 text-left transition-all duration-300 ${
                                role === r.value
                                  ? 'border-indigo-500/60 bg-indigo-500/15 shadow-lg shadow-indigo-500/10'
                                  : 'border-white/10 bg-white/5 hover:bg-white/8'
                              }`}
                            >
                              <div className="text-2xl mb-1">{r.emoji}</div>
                              <div className="text-sm font-bold text-white">{r.label}</div>
                              <div className="text-[10px] text-white/50 mt-0.5">{r.desc}</div>
                              {role === r.value && (
                                <motion.div
                                  layoutId="roleIndicator"
                                  className="absolute inset-0 rounded-2xl border-2 border-indigo-500/60 pointer-events-none"
                                />
                              )}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="text-xs font-medium text-white/60 mb-1.5 block">
                            {role === 'company' ? 'Nome Responsabile' : 'Nome Completo'}
                          </label>
                          <input className={inputClass} placeholder="Marco Rossi" value={form.display_name} onChange={update('display_name')} />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs font-medium text-white/60 mb-1.5 block">Username</label>
                          <input className={inputClass} placeholder="marco.rossi" value={form.username} onChange={update('username')} />
                        </div>
                        {role === 'company' && (
                          <div className="col-span-2">
                            <label className="text-xs font-medium text-white/60 mb-1.5 block">Nome Azienda</label>
                            <input className={inputClass} placeholder="Acme S.r.l." value={form.company_name} onChange={update('company_name')} />
                          </div>
                        )}
                        <div className="col-span-2">
                          <label className="text-xs font-medium text-white/60 mb-1.5 block">Email</label>
                          <input className={inputClass} type="email" placeholder="tu@email.com" value={form.email} onChange={update('email')} />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs font-medium text-white/60 mb-1.5 block">Password</label>
                          <input className={inputClass} type="password" placeholder="min. 6 caratteri" value={form.password} onChange={update('password')} />
                        </div>
                      </div>

                      {error && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
                          {error}
                        </motion.div>
                      )}

                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleRegisterStep1}
                        className="w-full rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-all"
                      >
                        Continua →
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Step 2: Location */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                    >
                      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-sm text-white/70">
                        <p className="font-semibold text-white mb-1">📍 Zona di competenza</p>
                        <p className="text-xs leading-relaxed">
                          Indica la tua città principale. Sarà usata per mostrarti opportunità vicine e per far apparire il tuo profilo sulla mappa.
                        </p>
                      </div>

                      <div ref={locationRef} className="relative">
                        <label className="text-xs font-medium text-white/60 mb-1.5 block">Città</label>
                        <input
                          className={inputClass}
                          placeholder="Roma, Milano, Torino…"
                          value={locationQuery}
                          onChange={(e) => { setLocationQuery(e.target.value); setError(''); }}
                        />
                        {/* Quick Italian cities */}
                        {locationQuery.length < 2 && (
                          <div className="mt-2">
                            <p className="text-[10px] text-white/40 mb-1.5">Città principali</p>
                            <div className="flex flex-wrap gap-1.5">
                              {['Roma', 'Milano', 'Torino', 'Napoli', 'Bologna', 'Firenze'].map((c) => (
                                <button
                                  key={c}
                                  onClick={() => selectCity(c, '', 0, 0)}
                                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 hover:bg-white/10 transition-colors"
                                >
                                  {c}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Suggestions dropdown */}
                        <AnimatePresence>
                          {(suggestions.length > 0 || localCities.length > 0) && locationQuery.length >= 2 && (
                            <motion.div
                              key="suggestions-dropdown"
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              className="absolute top-full mt-1 left-0 right-0 z-50 rounded-2xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl overflow-hidden shadow-2xl"
                            >
                              {localCities.map((c, i) => (
                                <button
                                  key={`local-${i}-${c}`}
                                  onClick={() => selectCity(c, 'Italia', 0, 0)}
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors text-left"
                                >
                                  <span className="text-base">🇮🇹</span>
                                  <span className="text-white">{c}</span>
                                  <span className="text-white/40 text-xs">Italia</span>
                                </button>
                              ))}
                              {suggestions.map((s, i) => {
                                const city = s.address.city || s.address.town || s.address.village || s.display_name.split(',')[0];
                                const region = s.address.state || '';
                                return (
                                  <button
                                    key={`suggestion-${i}`}
                                    onClick={() => selectCity(city, region, parseFloat(s.lat), parseFloat(s.lon))}
                                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors text-left"
                                  >
                                    <span className="text-base">📍</span>
                                    <span className="text-white truncate">{city}</span>
                                    {region && <span className="text-white/40 text-xs shrink-0">{region}</span>}
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                          {loadingSuggestions && (
                            <div className="absolute top-full mt-1 left-0 right-0 rounded-2xl border border-white/10 bg-zinc-900/95 p-3 text-center text-xs text-white/40">
                              Ricerca in corso…
                            </div>
                          )}
                        </AnimatePresence>
                      </div>

                      {form.city && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-4 py-2.5"
                        >
                          <span className="text-lg">📍</span>
                          <div>
                            <p className="text-sm font-semibold text-white">{form.city}</p>
                            {form.region && <p className="text-xs text-white/50">{form.region}</p>}
                          </div>
                          {form.lat !== 0 && (
                            <span className="ml-auto text-[10px] text-indigo-400 bg-indigo-500/10 rounded-full px-2 py-0.5">📡 GPS</span>
                          )}
                        </motion.div>
                      )}

                      {error && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
                          {error}
                        </motion.div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() => { setStep(1); setError(''); }}
                          className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white/70 hover:bg-white/10 transition-colors"
                        >
                          ← Indietro
                        </button>
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={handleRegisterStep2}
                          disabled={loading || !form.city}
                          className="flex-[2] rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-all disabled:opacity-50"
                        >
                          {loading ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31" strokeDashoffset="10" /></svg>
                              Creazione…
                            </span>
                          ) : 'Crea account 🚀'}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-white/30 mt-4">
          DevHub IT · Piattaforma per professionisti IT italiani
        </p>
      </motion.div>
    </div>
  );
}
