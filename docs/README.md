# Documentazione del Progetto — Toselli Foresto

> Piattaforma di social networking per professionisti IT italiani. Combina annunci di lavoro, corsi tecnici con quiz e funzionalità di rete professionale.

---

## Indice

1. [Stack tecnologico](#stack-tecnologico)
2. [Struttura del progetto](#struttura-del-progetto)
3. [Database](#database)
4. [Autenticazione](#autenticazione)
5. [API — Riferimento completo](#api--riferimento-completo)
6. [Pagine frontend](#pagine-frontend)
7. [Componenti principali](#componenti-principali)
8. [Variabili d'ambiente](#variabili-dambiente)
9. [Avviare il progetto](#avviare-il-progetto)

---

## Stack tecnologico

| Tecnologia | Versione | Perché è stata scelta |
|---|---|---|
| **Next.js** (App Router) | 16.1.6 | Gestisce sia il frontend che il backend (API Routes) in un unico progetto, eliminando la necessità di un server separato |
| **React** | 19.2.3 | Libreria UI standard; usata insieme al sistema di routing di Next.js |
| **Tailwind CSS** | 4 | Permette di stilizzare i componenti direttamente nell'HTML, velocizzando lo sviluppo |
| **Framer Motion** | 12.34.3 | Animazioni fluide con poca configurazione (transizioni, liste scalate, particelle) |
| **Turso (LibSQL)** | @libsql/client 0.17.0 | Database SQLite distribuito, ideale per progetti piccoli/medi: gratuito, veloce, nessun server da gestire |
| **bcryptjs** | 3.0.3 | Hashing sicuro delle password |
| **Radix UI** | varie | Componenti accessibili e non stilizzati (dialog, tooltip, menu, tab, ecc.) |
| **Leaflet / react-leaflet** | 1.9.4 / 5.0.0 | Mappa interattiva per visualizzare annunci e professionisti per area geografica |
| **Lucide React** | 1.8.0 | Set di icone SVG coerente e leggero |

---

## Struttura del progetto

```
/
├── app/                  # Tutto il codice Next.js (App Router)
│   ├── page.tsx          # Homepage
│   ├── layout.tsx        # Layout radice (font, provider globali)
│   ├── globals.css       # CSS globale, variabili colore, utility Tailwind
│   ├── api/              # Endpoint API (eseguono lato server)
│   ├── auth/             # Pagina di login/registrazione
│   ├── jobs/             # Lista offerte di lavoro
│   ├── learn/            # Corsi e quiz
│   ├── listings/         # Bacheca annunci (offerte e richieste)
│   ├── map/              # Mappa interattiva
│   ├── pricing/          # Piani e abbonamenti
│   ├── profile/          # Profilo utente
│   ├── publish/          # Pubblicazione annunci
│   ├── search/           # Ricerca globale
│   ├── settings/         # Impostazioni account
│   └── analytics/        # Dashboard statistiche
├── components/           # Componenti React riutilizzabili
├── lib/                  # Logica condivisa (DB, auth, tipi, API client)
├── scripts/              # Script di seed e migrazione DB
├── php-backend/          # Backend PHP legacy (non più attivo)
├── public/               # Asset statici
└── docs/                 # Questa documentazione
```

**Decisione chiave:** Tutta la comunicazione con il database avviene nelle API Routes (`/app/api/`), mai direttamente nel frontend. Questo protegge le credenziali del database e separa chiaramente le responsabilità.

---

## Database

Viene usato **Turso** (SQLite cloud). La connessione è in `lib/db.ts` e usa due variabili d'ambiente.

### Tabelle principali

| Tabella | Scopo |
|---|---|
| `auth_users` | Utenti registrati (lavoratori e aziende) |
| `user_sessions` | Sessioni attive con token e scadenza |
| `posts` | Post nel feed sociale |
| `post_likes` / `post_comments` | Interazioni sui post |
| `follows` | Relazioni di follow tra utenti |
| `notifications` | Notifiche in-app |
| `jobs` | Offerte di lavoro |
| `listings` | Bacheca annunci (job_offer / service_proposal) |
| `courses` | Corsi disponibili |
| `quizzes` | Quiz associati ai corsi |
| `user_progress` | Avanzamento nei corsi |
| `user_badges` | Badge guadagnati completando i corsi |
| `saved_jobs` / `saved_courses` | Salvataggi utente |
| `messages` | Messaggi diretti |

---

## Autenticazione

Il sistema usa **sessioni basate su cookie**.

**Flusso di login:**
1. L'utente invia email e password a `POST /api/auth/login`
2. Il server verifica la password con `bcrypt.compare`
3. Viene generato un token casuale e salvato in `user_sessions` con scadenza a 30 giorni
4. Il token viene impostato come cookie `httpOnly` (`devhub_session`): il browser lo invia automaticamente ad ogni richiesta, senza che il JavaScript client possa leggerlo

**Lettura della sessione (lato server):**
- La funzione `getSessionUser()` in `lib/auth.ts` legge il cookie, fa una JOIN tra `user_sessions` e `auth_users`, e restituisce l'utente se il token è valido e non scaduto

**Perché cookie `httpOnly`?** Impedisce agli script JS di leggere il token di sessione.

---

## API — Riferimento completo

Tutte le route sono in `app/api/`. Rispondono in JSON.

### Autenticazione

| Metodo | Endpoint | Descrizione |
|---|---|---|
| `POST` | `/api/auth/register` | Registra un nuovo utente (`worker` o `company`) |
| `POST` | `/api/auth/login` | Effettua il login, imposta il cookie di sessione |
| `GET` | `/api/auth/me` | Restituisce l'utente attualmente autenticato |

### Profili utente

| Metodo | Endpoint | Descrizione |
|---|---|---|
| `GET` | `/api/user/[id]` | Profilo di un utente |
| `GET` | `/api/user/[id]/badges` | Badge guadagnati |
| `GET/POST` | `/api/user/[id]/progress` | Avanzamento nei corsi |
| `GET/POST/DELETE` | `/api/user/[id]/follow` | Segui / smetti di seguire |
| `GET` | `/api/users/[username]` | Profilo tramite username |
| `GET` | `/api/users/[username]/posts` | Post di un utente |
| `GET` | `/api/users/search` | Ricerca utenti per nome/username |

### Post e feed sociale

| Metodo | Endpoint | Descrizione |
|---|---|---|
| `GET/POST` | `/api/posts` | Lista post / crea nuovo post |
| `GET/DELETE` | `/api/posts/[id]` | Dettaglio / elimina post |
| `POST/DELETE` | `/api/posts/[id]/like` | Metti / togli like |
| `GET/POST` | `/api/posts/[id]/comments` | Lista commenti / aggiungi commento |

### Lavoro e annunci

| Metodo | Endpoint | Descrizione |
|---|---|---|
| `GET` | `/api/jobs` | Lista offerte di lavoro (filtrabili) |
| `GET` | `/api/jobs/[id]` | Dettaglio offerta |
| `GET/POST` | `/api/listings` | Lista/crea annunci nella bacheca |
| `GET` | `/api/listings/map` | Annunci con coordinate per la mappa |

### Corsi e apprendimento

| Metodo | Endpoint | Descrizione |
|---|---|---|
| `GET` | `/api/courses` | Lista corsi |
| `GET` | `/api/courses/[id]` | Dettaglio corso |
| `GET` | `/api/quizzes/[courseId]` | Quiz del corso |
| `POST` | `/api/quizzes/[courseId]/submit` | Invia risposte e ottieni il punteggio |

### Notifiche e social

| Metodo | Endpoint | Descrizione |
|---|---|---|
| `GET/PATCH` | `/api/notifications` | Lista notifiche / segna come lette |
| `GET/POST` | `/api/follow-requests` | Richieste di follow pendenti |
| `PATCH/DELETE` | `/api/follow-requests/[id]` | Accetta / rifiuta richiesta |

### Impostazioni e profilo

| Metodo | Endpoint | Descrizione |
|---|---|---|
| `GET/PATCH` | `/api/settings` | Leggi / aggiorna impostazioni profilo |
| `POST` | `/api/settings/password` | Cambia password |
| `POST` | `/api/upload` | Carica immagine profilo |

### Abbonamenti

| Metodo | Endpoint | Descrizione |
|---|---|---|
| `GET` | `/api/billing/status` | Stato abbonamento corrente |
| `POST` | `/api/billing/upgrade` | Attiva piano Pro |
| `POST` | `/api/billing/cancel` | Annulla abbonamento |

### Statistiche

| Metodo | Endpoint | Descrizione |
|---|---|---|
| `GET` | `/api/stats` | Statistiche globali della piattaforma |

---

## Pagine frontend

| Percorso | Descrizione |
|---|---|
| `/` | Homepage con hero, lavori in evidenza e statistiche |
| `/auth` | Login e registrazione (worker / company) |
| `/jobs` | Lista offerte di lavoro con filtri |
| `/listings` | Bacheca annunci (offerte e proposte di servizio) |
| `/map` | Mappa interattiva con annunci geolocalizzati |
| `/learn` | Catalogo corsi |
| `/learn/[courseId]` | Dettaglio corso con moduli |
| `/learn/[courseId]/quiz` | Quiz del corso |
| `/profile` | Dashboard utente (badge, progressi, post) |
| `/profile/[username]` | Profilo pubblico di un utente |
| `/publish` | Pubblica un nuovo annuncio |
| `/search` | Ricerca globale (utenti, lavori, corsi) |
| `/settings` | Impostazioni account |
| `/pricing` | Piani e prezzi |
| `/analytics` | Statistiche e analytics |

---

## Componenti principali

| File | Cosa fa |
|---|---|
| `LeftSidebar.tsx` | Navigazione desktop (si riduce a sole icone su schermi medi) |
| `BottomNav.tsx` | Navigazione mobile fissa in basso |
| `TopBar.tsx` | Header mobile con logo e accesso ai filtri |
| `RightSidebar.tsx` | Pannello destro su desktop (statistiche, tecnologie, corsi) |
| `NotificationPanel.tsx` / `NotificationSheet.tsx` | Dropdown e sheet delle notifiche |
| `JobCard.tsx` | Card singola offerta di lavoro |
| `JobDetail.tsx` | Modal con dettaglio completo offerta |
| `CourseCard.tsx` | Card singola corso |
| `BadgeCard.tsx` | Visualizza un badge guadagnato |
| `HamburgerFilters.tsx` | Pannello filtri su mobile |
| `AuthGuard.tsx` | Wrapper che reindirizza alla login se l'utente non è autenticato |
| `ThemeApplier.tsx` | Applica il tema colore dell'utente all'app |
| `SplashScreen.tsx` | Schermata di caricamento iniziale |

---

## Variabili d'ambiente

Creare un file `.env.local` nella root del progetto:

```env
TURSO_DATABASE_URL=libsql://[nome-database].turso.io
TURSO_AUTH_TOKEN=[token-di-autenticazione]
```

---

## Avviare il progetto

```bash
# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev

# Popola il database con dati di esempio
npm run seed
```

L'app sarà disponibile su `http://localhost:3000` oppure al sito https://devhub-depi.vercel.app
