// @ts-check
/**
 * DevHub IT — Social Seed Script
 * Seeds mock users (auth_users), listings with lat/lng, and posts.
 * Run with: npx tsx scripts/seed-social.ts
 */

import { createClient } from '@libsql/client';
import { config } from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

config({ path: path.resolve(__dirname, '..', '.env.local') });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// ── Migrations (ensure columns exist) ────────────────────────────────────────
async function runMigrations() {
  console.log('🔄 Running migrations...');

  // Add avatar_url column to auth_users if missing
  try {
    await db.execute('ALTER TABLE auth_users ADD COLUMN avatar_url TEXT');
    console.log('  ✅ Added avatar_url to auth_users');
  } catch { console.log('  ⏭  avatar_url already exists'); }

  // Add theme_color column to auth_users if missing
  try {
    await db.execute("ALTER TABLE auth_users ADD COLUMN theme_color TEXT DEFAULT '#6366f1'");
    console.log('  ✅ Added theme_color to auth_users');
  } catch { console.log('  ⏭  theme_color already exists'); }

  // Add language column if missing
  try {
    await db.execute("ALTER TABLE auth_users ADD COLUMN language TEXT DEFAULT 'it'");
    console.log('  ✅ Added language to auth_users');
  } catch { console.log('  ⏭  language already exists'); }

  // Add is_private column if missing
  try {
    await db.execute('ALTER TABLE auth_users ADD COLUMN is_private INTEGER DEFAULT 0');
    console.log('  ✅ Added is_private to auth_users');
  } catch { console.log('  ⏭  is_private already exists'); }

  // Ensure follow_requests table exists
  await db.execute(`CREATE TABLE IF NOT EXISTS follow_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requester_id INTEGER NOT NULL,
    target_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(requester_id, target_id)
  )`);
  console.log('  ✅ follow_requests table ready');

  // Ensure post_likes table exists
  await db.execute(`CREATE TABLE IF NOT EXISTS post_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, post_id)
  )`);
  console.log('  ✅ post_likes table ready');

  // Ensure post_comments table exists
  await db.execute(`CREATE TABLE IF NOT EXISTS post_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  console.log('  ✅ post_comments table ready');

  // Ensure follows table exists
  await db.execute(`CREATE TABLE IF NOT EXISTS follows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(follower_id, following_id)
  )`);
  console.log('  ✅ follows table ready');

  console.log('✅ Migrations complete\n');
}

// ── Mock Users ───────────────────────────────────────────────────────────────
const MOCK_USERS = [
  // Workers (IT professionals across Italy)
  {
    email: 'sofia.ferrari@devhub.it', password: 'devhub123',
    role: 'worker', display_name: 'Sofia Ferrari', username: 'sofia_ferrari',
    avatar_color: '#ec4899', theme_color: '#ec4899',
    title: 'React Developer', bio: 'Sviluppatrice frontend appassionata di UI/UX e animazioni CSS. 4 anni di esperienza in React, TypeScript e Tailwind.',
    city: 'Milano', region: 'Lombardia', lat: 45.4654, lng: 9.1859,
  },
  {
    email: 'luca.conti@devhub.it', password: 'devhub123',
    role: 'worker', display_name: 'Luca Conti', username: 'luca_conti',
    avatar_color: '#3b82f6', theme_color: '#3b82f6',
    title: 'Backend Python Engineer', bio: 'Pythonista di professione, Django e FastAPI sono il mio pane quotidiano. AWS certified e amante dei microservizi.',
    city: 'Torino', region: 'Piemonte', lat: 45.0703, lng: 7.6869,
  },
  {
    email: 'giulia.moretti@devhub.it', password: 'devhub123',
    role: 'worker', display_name: 'Giulia Moretti', username: 'giulia_moretti',
    avatar_color: '#10b981', theme_color: '#10b981',
    title: 'DevOps / SRE', bio: 'Kubernetes, Terraform, Prometheus. Mi occupo di infrastrutture scalabili e CI/CD per team di 10+ sviluppatori.',
    city: 'Roma', region: 'Lazio', lat: 41.9028, lng: 12.4964,
  },
  {
    email: 'matteo.ricci@devhub.it', password: 'devhub123',
    role: 'worker', display_name: 'Matteo Ricci', username: 'matteo_ricci',
    avatar_color: '#f59e0b', theme_color: '#f59e0b',
    title: 'Data Scientist / ML Engineer', bio: 'Machine Learning, NLP e Computer Vision. Kaggle Master. Lavoro con PyTorch e Hugging Face.',
    city: 'Bologna', region: 'Emilia-Romagna', lat: 44.4949, lng: 11.3426,
  },
  {
    email: 'chiara.esposito@devhub.it', password: 'devhub123',
    role: 'worker', display_name: 'Chiara Esposito', username: 'chiara_esposito',
    avatar_color: '#8b5cf6', theme_color: '#8b5cf6',
    title: 'Full-Stack Developer', bio: 'Next.js + Node.js + PostgreSQL. Creo applicazioni web complete con attenzione alla performance e all\'accessibilità.',
    city: 'Napoli', region: 'Campania', lat: 40.8518, lng: 14.2681,
  },
  {
    email: 'andrea.russo@devhub.it', password: 'devhub123',
    role: 'worker', display_name: 'Andrea Russo', username: 'andrea_russo',
    avatar_color: '#ef4444', theme_color: '#ef4444',
    title: 'Cybersecurity Specialist', bio: 'Ethical hacker certificato OSCP. Penetration testing e vulnerability assessment per aziende enterprise.',
    city: 'Firenze', region: 'Toscana', lat: 43.7696, lng: 11.2558,
  },
  {
    email: 'valentina.gallo@devhub.it', password: 'devhub123',
    role: 'worker', display_name: 'Valentina Gallo', username: 'valentina_gallo',
    avatar_color: '#14b8a6', theme_color: '#14b8a6',
    title: 'Mobile Developer (iOS/Android)', bio: 'React Native e Flutter developer. Ho pubblicato 8 app su App Store e Play Store con 200k+ utenti attivi.',
    city: 'Palermo', region: 'Sicilia', lat: 38.1157, lng: 13.3615,
  },
  {
    email: 'roberto.mancini@devhub.it', password: 'devhub123',
    role: 'worker', display_name: 'Roberto Mancini', username: 'roberto_mancini',
    avatar_color: '#06b6d4', theme_color: '#06b6d4',
    title: 'Cloud Architect', bio: 'AWS Solutions Architect Professional. Migrazioni cloud, multi-cloud e FinOps. 10 anni nel settore.',
    city: 'Genova', region: 'Liguria', lat: 44.4056, lng: 8.9463,
  },
  {
    email: 'francesca.de_luca@devhub.it', password: 'devhub123',
    role: 'worker', display_name: 'Francesca De Luca', username: 'francesca_deluca',
    avatar_color: '#a855f7', theme_color: '#a855f7',
    title: 'UX/UI Designer & Developer', bio: 'Design thinking applicato al codice. Figma, React e Framer Motion per interfacce che emozionano.',
    city: 'Bari', region: 'Puglia', lat: 41.1171, lng: 16.8719,
  },
  {
    email: 'davide.lombardi@devhub.it', password: 'devhub123',
    role: 'worker', display_name: 'Davide Lombardi', username: 'davide_lombardi',
    avatar_color: '#84cc16', theme_color: '#84cc16',
    title: 'Blockchain Developer', bio: 'Solidity, Web3.js, DeFi protocols. Sviluppo smart contract e DApps dal 2020.',
    city: 'Venezia', region: 'Veneto', lat: 45.4408, lng: 12.3155,
  },
  {
    email: 'silvia.marchetti@devhub.it', password: 'devhub123',
    role: 'worker', display_name: 'Silvia Marchetti', username: 'silvia_marchetti',
    avatar_color: '#f97316', theme_color: '#f97316',
    title: 'QA Automation Engineer', bio: 'Cypress, Playwright, k6. Garantisco qualità e velocità di rilascio attraverso automazione e BDD.',
    city: 'Padova', region: 'Veneto', lat: 45.4064, lng: 11.8768,
  },
  {
    email: 'giacomo.pellegrini@devhub.it', password: 'devhub123',
    role: 'worker', display_name: 'Giacomo Pellegrini', username: 'giacomo_pellegrini',
    avatar_color: '#6366f1', theme_color: '#6366f1',
    title: 'Go / Rust Systems Developer', bio: 'Alta performance e bassa latenza. Sistemi distribuiti, networking e compilatori. Go e Rust sono i miei strumenti.',
    city: 'Trieste', region: 'Friuli Venezia Giulia', lat: 45.6495, lng: 13.7768,
  },
  // Companies
  {
    email: 'hr@techvision.it', password: 'devhub123',
    role: 'company', display_name: 'TechVision S.r.l.', username: 'techvision_srl',
    avatar_color: '#6366f1', theme_color: '#6366f1',
    title: 'Software House', bio: 'Sviluppiamo soluzioni SaaS enterprise per il mercato italiano ed europeo. 50+ sviluppatori, cultura agile.',
    company_name: 'TechVision S.r.l.', company_website: 'https://techvision.it',
    city: 'Milano', region: 'Lombardia', lat: 45.4810, lng: 9.2010,
  },
  {
    email: 'careers@cloudnative.it', password: 'devhub123',
    role: 'company', display_name: 'CloudNative S.p.A.', username: 'cloudnative_spa',
    avatar_color: '#10b981', theme_color: '#10b981',
    title: 'Cloud & DevOps Consulting', bio: 'Leader in consulenza cloud e DevOps per grandi aziende italiane. AWS Advanced Partner.',
    company_name: 'CloudNative S.p.A.', company_website: 'https://cloudnative.it',
    city: 'Torino', region: 'Piemonte', lat: 45.0755, lng: 7.6810,
  },
  {
    email: 'jobs@aifactory.it', password: 'devhub123',
    role: 'company', display_name: 'AI Factory', username: 'ai_factory',
    avatar_color: '#a855f7', theme_color: '#a855f7',
    title: 'AI & Machine Learning', bio: 'Ricerca e sviluppo in AI applicata. Collaboriamo con università e grandi industrie del manifatturiero.',
    company_name: 'AI Factory', company_website: 'https://aifactory.it',
    city: 'Torino', region: 'Piemonte', lat: 45.0635, lng: 7.6780,
  },
  {
    email: 'recruiting@fintech.it', password: 'devhub123',
    role: 'company', display_name: 'FinTech Solutions', username: 'fintech_solutions',
    avatar_color: '#f59e0b', theme_color: '#f59e0b',
    title: 'Financial Technology', bio: 'Pagamenti digitali e open banking. Costruiamo il futuro dei servizi finanziari italiani.',
    company_name: 'FinTech Solutions', company_website: 'https://fintechsolutions.it',
    city: 'Roma', region: 'Lazio', lat: 41.8960, lng: 12.4822,
  },
  {
    email: 'lavora@dataflow.it', password: 'devhub123',
    role: 'company', display_name: 'DataFlow Analytics', username: 'dataflow_analytics',
    avatar_color: '#ef4444', theme_color: '#ef4444',
    title: 'Data & Analytics', bio: 'Trasformiamo i dati delle aziende in vantaggio competitivo. Big data, BI e data warehouse.',
    company_name: 'DataFlow Analytics', company_website: 'https://dataflow.it',
    city: 'Bologna', region: 'Emilia-Romagna', lat: 44.5040, lng: 11.3520,
  },
];

// ── Mock Listings (job offers + service proposals with coordinates) ───────────
// Will be assigned to users by username after insertion
const MOCK_LISTINGS = [
  // ── JOB OFFERS (companies) ──
  {
    author_username: 'techvision_srl',
    listing_type: 'job_offer',
    title: 'Senior React Developer',
    description: 'Cerchiamo un React Developer senior per guidare il team frontend della nostra piattaforma SaaS. Stack: React 18, TypeScript 5, Next.js 14, Tailwind CSS. Team di 6 persone, metodologia Agile.',
    category: 'frontend', level: 'senior', work_type: 'hybrid',
    salary_min: 52000, salary_max: 72000,
    tags: ['React', 'TypeScript', 'Next.js', 'Tailwind'],
    lat: 45.4810, lng: 9.2010, city: 'Milano', region: 'Lombardia',
  },
  {
    author_username: 'techvision_srl',
    listing_type: 'job_offer',
    title: 'Junior Full-Stack Developer',
    description: 'Opportunità per junior con voglia di crescere. Mentoring garantito, progetti reali, stack moderno. Node.js + React, PostgreSQL, Docker.',
    category: 'fullstack', level: 'junior', work_type: 'onsite',
    salary_min: 26000, salary_max: 34000,
    tags: ['Node.js', 'React', 'PostgreSQL', 'Docker'],
    lat: 45.4750, lng: 9.1950, city: 'Milano', region: 'Lombardia',
  },
  {
    author_username: 'cloudnative_spa',
    listing_type: 'job_offer',
    title: 'DevOps Engineer Senior',
    description: 'Gestisci la nostra infrastruttura AWS multi-region per oltre 80 microservizi. Terraform, Kubernetes EKS, GitHub Actions, Datadog. Full remote con meetup trimestrali.',
    category: 'devops', level: 'senior', work_type: 'remote',
    salary_min: 58000, salary_max: 80000,
    tags: ['AWS', 'Kubernetes', 'Terraform', 'GitHub Actions'],
    lat: 45.0755, lng: 7.6810, city: 'Torino', region: 'Piemonte',
  },
  {
    author_username: 'cloudnative_spa',
    listing_type: 'job_offer',
    title: 'Cloud Architect',
    description: 'Progetta architetture multi-cloud per clienti enterprise italiani. AWS + Azure, serverless, security compliance GDPR. Leadership tecnica su team di 12.',
    category: 'cloud', level: 'lead', work_type: 'hybrid',
    salary_min: 70000, salary_max: 95000,
    tags: ['AWS', 'Azure', 'Terraform', 'Kubernetes', 'FinOps'],
    lat: 45.0680, lng: 7.6920, city: 'Torino', region: 'Piemonte',
  },
  {
    author_username: 'ai_factory',
    listing_type: 'job_offer',
    title: 'Machine Learning Engineer',
    description: 'Sviluppa e porta in produzione modelli NLP e Computer Vision per il settore automotive e manifatturiero. MLOps con MLflow e Kubeflow, accesso a GPU cluster dedicato.',
    category: 'data', level: 'senior', work_type: 'hybrid',
    salary_min: 55000, salary_max: 78000,
    tags: ['PyTorch', 'MLOps', 'NLP', 'Computer Vision', 'Kubernetes'],
    lat: 45.0635, lng: 7.6780, city: 'Torino', region: 'Piemonte',
  },
  {
    author_username: 'ai_factory',
    listing_type: 'job_offer',
    title: 'Data Scientist Mid-Level',
    description: 'Analisi dati, modelli predittivi e reportistica avanzata. Python, Pandas, Scikit-learn, SQL. Collaborazione diretta con team di ingegneri e business analyst.',
    category: 'data', level: 'mid', work_type: 'hybrid',
    salary_min: 40000, salary_max: 55000,
    tags: ['Python', 'Pandas', 'Scikit-learn', 'SQL'],
    lat: 45.0590, lng: 7.6840, city: 'Torino', region: 'Piemonte',
  },
  {
    author_username: 'fintech_solutions',
    listing_type: 'job_offer',
    title: 'Backend Java Engineer',
    description: 'Costruisci microservizi fintech ad alta affidabilità. Java 21, Spring Boot 3, Kafka, PostgreSQL, Redis. 2 giorni in ufficio a Roma, resto remote.',
    category: 'backend', level: 'mid', work_type: 'hybrid',
    salary_min: 42000, salary_max: 60000,
    tags: ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL'],
    lat: 41.8960, lng: 12.4822, city: 'Roma', region: 'Lazio',
  },
  {
    author_username: 'fintech_solutions',
    listing_type: 'job_offer',
    title: 'Cybersecurity Analyst',
    description: 'Monitora e proteggi i sistemi di pagamento digitale. SIEM, vulnerability assessment, incident response. Settore fintech mission-critical.',
    category: 'security', level: 'mid', work_type: 'hybrid',
    salary_min: 38000, salary_max: 54000,
    tags: ['SIEM', 'Splunk', 'ISO 27001', 'Incident Response'],
    lat: 41.9050, lng: 12.4780, city: 'Roma', region: 'Lazio',
  },
  {
    author_username: 'dataflow_analytics',
    listing_type: 'job_offer',
    title: 'Senior Data Engineer',
    description: 'Progetta pipeline dati scalabili per clienti enterprise. Apache Spark, dbt, Airflow, AWS Redshift. Team internazionale, certificazioni cloud pagate.',
    category: 'data', level: 'senior', work_type: 'hybrid',
    salary_min: 50000, salary_max: 68000,
    tags: ['Apache Spark', 'dbt', 'Airflow', 'AWS', 'Python'],
    lat: 44.5040, lng: 11.3520, city: 'Bologna', region: 'Emilia-Romagna',
  },
  {
    author_username: 'dataflow_analytics',
    listing_type: 'job_offer',
    title: 'BI Developer / Analyst',
    description: 'Crea dashboard e report per decision-maker. Power BI, Tableau, SQL avanzato, data modeling. Cliente finale: grande GDO italiana.',
    category: 'data', level: 'mid', work_type: 'hybrid',
    salary_min: 35000, salary_max: 48000,
    tags: ['Power BI', 'SQL', 'Tableau', 'Data Modeling'],
    lat: 44.5100, lng: 11.3460, city: 'Bologna', region: 'Emilia-Romagna',
  },
  // ── SERVICE PROPOSALS (workers) ──
  {
    author_username: 'sofia_ferrari',
    listing_type: 'service_proposal',
    title: 'Sviluppo Frontend React/Next.js',
    description: 'Offro sviluppo frontend professionale con React 18, Next.js 14 e TypeScript. Specializzata in design system, animazioni Framer Motion e performance optimization. Portfolio su richiesta.',
    category: 'frontend', level: 'senior', work_type: 'remote',
    salary_min: 450, salary_max: 600,
    tags: ['React', 'Next.js', 'TypeScript', 'Framer Motion', 'Tailwind'],
    lat: 45.4654, lng: 9.1859, city: 'Milano', region: 'Lombardia',
  },
  {
    author_username: 'luca_conti',
    listing_type: 'service_proposal',
    title: 'API Backend Python & Microservizi',
    description: 'Sviluppo API REST/GraphQL con Django e FastAPI. Microservizi Docker, PostgreSQL, Redis, AWS Lambda. 4+ anni di esperienza su progetti production.',
    category: 'backend', level: 'senior', work_type: 'remote',
    salary_min: 400, salary_max: 550,
    tags: ['Python', 'FastAPI', 'Django', 'AWS', 'Docker'],
    lat: 45.0703, lng: 7.6869, city: 'Torino', region: 'Piemonte',
  },
  {
    author_username: 'giulia_moretti',
    listing_type: 'service_proposal',
    title: 'Consulenza DevOps & Infrastructure as Code',
    description: 'Setup CI/CD, migrazione cloud, Kubernetes management e monitoring con Prometheus/Grafana. Disponibile per contratti da 3 mesi a tempo indeterminato.',
    category: 'devops', level: 'senior', work_type: 'remote',
    salary_min: 500, salary_max: 700,
    tags: ['Kubernetes', 'Terraform', 'AWS', 'Prometheus', 'CI/CD'],
    lat: 41.9028, lng: 12.4964, city: 'Roma', region: 'Lazio',
  },
  {
    author_username: 'matteo_ricci',
    listing_type: 'service_proposal',
    title: 'Machine Learning & Data Science Freelance',
    description: 'Costruisco modelli ML per NLP, recommendation systems e classificazione immagini. PyTorch, Scikit-learn, MLflow. Deliverable in tempo e con documentazione completa.',
    category: 'data', level: 'senior', work_type: 'remote',
    salary_min: 480, salary_max: 650,
    tags: ['PyTorch', 'NLP', 'MLflow', 'Python', 'Data Science'],
    lat: 44.4949, lng: 11.3426, city: 'Bologna', region: 'Emilia-Romagna',
  },
  {
    author_username: 'chiara_esposito',
    listing_type: 'service_proposal',
    title: 'Full-Stack Next.js + PostgreSQL',
    description: 'Realizzo applicazioni web complete: Next.js App Router, tRPC o REST, PostgreSQL con Prisma, deploy su Vercel o AWS. Disponibile per startup e PMI.',
    category: 'fullstack', level: 'mid', work_type: 'remote',
    salary_min: 350, salary_max: 500,
    tags: ['Next.js', 'PostgreSQL', 'Prisma', 'TypeScript', 'tRPC'],
    lat: 40.8518, lng: 14.2681, city: 'Napoli', region: 'Campania',
  },
  {
    author_username: 'andrea_russo',
    listing_type: 'service_proposal',
    title: 'Penetration Testing & Security Audit',
    description: 'Penetration test web, mobile e infrastruttura. Report dettagliato con CVSS scoring e remediation plan. Certificato OSCP e CEH. NDA disponibile.',
    category: 'security', level: 'senior', work_type: 'onsite',
    salary_min: 600, salary_max: 900,
    tags: ['Penetration Testing', 'OWASP', 'OSCP', 'Web Security'],
    lat: 43.7696, lng: 11.2558, city: 'Firenze', region: 'Toscana',
  },
  {
    author_username: 'valentina_gallo',
    listing_type: 'service_proposal',
    title: 'App Mobile Cross-Platform (React Native)',
    description: 'Sviluppo app iOS e Android con React Native 0.74 e Expo. Pubblicazione su store inclusa. Portfolio: 8 app con 200k+ download totali.',
    category: 'mobile', level: 'senior', work_type: 'remote',
    salary_min: 420, salary_max: 580,
    tags: ['React Native', 'Expo', 'iOS', 'Android', 'TypeScript'],
    lat: 38.1157, lng: 13.3615, city: 'Palermo', region: 'Sicilia',
  },
  {
    author_username: 'roberto_mancini',
    listing_type: 'service_proposal',
    title: 'Cloud Architecture & AWS Migration',
    description: 'Progetto e implemento architetture cloud AWS/Azure. Migrazioni lift-and-shift e cloud-native, FinOps, disaster recovery. AWS Solutions Architect Professional.',
    category: 'cloud', level: 'lead', work_type: 'remote',
    salary_min: 650, salary_max: 900,
    tags: ['AWS', 'Azure', 'Terraform', 'FinOps', 'Microservizi'],
    lat: 44.4056, lng: 8.9463, city: 'Genova', region: 'Liguria',
  },
  {
    author_username: 'francesca_deluca',
    listing_type: 'service_proposal',
    title: 'UX/UI Design & Front-End Development',
    description: 'Progettazione UX con Figma e sviluppo con React + Tailwind. Design system completo, animazioni Framer Motion, accessibilità WCAG 2.1. Portfolio disponibile.',
    category: 'frontend', level: 'mid', work_type: 'remote',
    salary_min: 380, salary_max: 520,
    tags: ['Figma', 'React', 'Tailwind', 'UX Design', 'Framer Motion'],
    lat: 41.1171, lng: 16.8719, city: 'Bari', region: 'Puglia',
  },
  {
    author_username: 'davide_lombardi',
    listing_type: 'service_proposal',
    title: 'Smart Contract & DApp Development',
    description: 'Sviluppo smart contract Solidity, audit di sicurezza, DApp con React + Ethers.js. Esperienza su protocolli DeFi (Uniswap, Aave). Hardhat e Foundry.',
    category: 'backend', level: 'senior', work_type: 'remote',
    salary_min: 550, salary_max: 800,
    tags: ['Solidity', 'Web3.js', 'DeFi', 'Hardhat', 'EVM'],
    lat: 45.4408, lng: 12.3155, city: 'Venezia', region: 'Veneto',
  },
  {
    author_username: 'silvia_marchetti',
    listing_type: 'service_proposal',
    title: 'QA Automation & Testing Strategy',
    description: 'Framework di test E2E con Cypress/Playwright, API testing, performance testing con k6. BDD con Cucumber. Integrazione CI/CD inclusa.',
    category: 'fullstack', level: 'mid', work_type: 'remote',
    salary_min: 320, salary_max: 460,
    tags: ['Cypress', 'Playwright', 'k6', 'BDD', 'CI/CD'],
    lat: 45.4064, lng: 11.8768, city: 'Padova', region: 'Veneto',
  },
  {
    author_username: 'giacomo_pellegrini',
    listing_type: 'service_proposal',
    title: 'Sistemi Distribuiti in Go & Rust',
    description: 'Sviluppo di sistemi ad alta performance in Go e Rust: gRPC, message queues, CLI tools, compilatori. Ottimizzazione low-latency per sistemi real-time.',
    category: 'backend', level: 'senior', work_type: 'remote',
    salary_min: 500, salary_max: 750,
    tags: ['Go', 'Rust', 'gRPC', 'Distributed Systems', 'Performance'],
    lat: 45.6495, lng: 13.7768, city: 'Trieste', region: 'Friuli Venezia Giulia',
  },
];

// ── Mock Posts ───────────────────────────────────────────────────────────────
const MOCK_POSTS = [
  {
    author_username: 'sofia_ferrari',
    content: '🚀 Ho appena pubblicato la mia ultima libreria React per animazioni fluide con Framer Motion! Supporta scroll-triggered animations, staggered reveals e gesture-based interactions. Open source su GitHub. #React #FramerMotion #OpenSource',
    post_type: 'update',
    tags: ['React', 'Framer Motion', 'Open Source'],
  },
  {
    author_username: 'luca_conti',
    content: 'Finalmente completata la migrazione da Django REST a FastAPI per un cliente con 2M+ richieste/giorno. Risultato: latenza ridotta del 60%, consumo RAM dimezzato. FastAPI è incredibile per API moderne. 🐍⚡ #Python #FastAPI #Performance',
    post_type: 'achievement',
    tags: ['Python', 'FastAPI', 'Performance'],
  },
  {
    author_username: 'giulia_moretti',
    content: 'Tip del giorno: usate `kubectl top pods --sort-by=memory` per identificare i pod che consumano più risorse nel vostro cluster. Poi impostate resource limits appropriati per evitare OOMKill. #Kubernetes #DevOps #Tip',
    post_type: 'tip',
    tags: ['Kubernetes', 'DevOps', 'Tip'],
  },
  {
    author_username: 'matteo_ricci',
    content: '📊 Nuovo record personale su Kaggle! Ho raggiunto il top 1% nella competizione NLP Text Classification con un ensemble di BERT fine-tuned e XGBoost. La chiave? Data augmentation con back-translation. #MachineLearning #NLP #Kaggle',
    post_type: 'achievement',
    tags: ['Machine Learning', 'NLP', 'Kaggle'],
  },
  {
    author_username: 'chiara_esposito',
    content: 'Progetto completato! Ho consegnato una piattaforma e-commerce B2B in Next.js 14 per una PMI napoletana. App Router, Prisma + PostgreSQL, Stripe per i pagamenti. Da idea a produzione in 6 settimane. 💪 #NextJS #Fullstack #Freelance',
    post_type: 'achievement',
    tags: ['Next.js', 'Full-Stack', 'Freelance'],
  },
  {
    author_username: 'andrea_russo',
    content: '⚠️ AVVISO DI SICUREZZA: Trovata una vulnerabilità SQL Injection critica in un popolare CMS italiano (già notificato responsabilmente). Se usate questo CMS, aggiornate alla versione 4.2.1 immediatamente! #CyberSecurity #SQLInjection #BugBounty',
    post_type: 'alert',
    tags: ['Cybersecurity', 'Bug Bounty', 'SQL Injection'],
  },
  {
    author_username: 'valentina_gallo',
    content: 'La mia app di meditazione ha superato 50.000 download su App Store! 🧘 Costruita con React Native + Expo, ha un rating di 4.8/5. Il segreto? UX pulita, animazioni fluide e notifiche intelligenti che non spammano. #ReactNative #iOS #AppStore',
    post_type: 'achievement',
    tags: ['React Native', 'iOS', 'Expo'],
  },
  {
    author_username: 'roberto_mancini',
    content: 'AWS re:Invent takeaway: il futuro è serverless + containers ibridi. AWS Bedrock sta diventando la piattaforma AI enterprise di riferimento. Attenzione ai costi con FinOps! 💡 #AWS #CloudComputing #FinOps',
    post_type: 'insight',
    tags: ['AWS', 'Cloud', 'FinOps'],
  },
  {
    author_username: 'francesca_deluca',
    content: 'Ho appena finito di leggere "The Design of Everyday Things" di Don Norman. Un must per ogni sviluppatore che vuole capire perché gli utenti si comportano in un certo modo con le interfacce. Consigliatissimo! 📚 #UXDesign #Books',
    post_type: 'recommendation',
    tags: ['UX Design', 'Books', 'Frontend'],
  },
  {
    author_username: 'davide_lombardi',
    content: 'Finalmente il mio primo audit di smart contract completato in modo indipendente! Ho trovato 2 vulnerabilità critiche di reentrancy e 1 integer overflow. La sicurezza in DeFi non è un optional. #Web3 #Solidity #SmartContract #Security',
    post_type: 'achievement',
    tags: ['Solidity', 'Web3', 'Security'],
  },
  {
    author_username: 'techvision_srl',
    content: '🎉 TechVision è stata selezionata tra le 50 migliori startup tech italiane del 2026! Siamo orgogliosi del nostro team di 55 persone e della nostra piattaforma SaaS che serve 300+ aziende. Stiamo crescendo: check our open positions! #Milano #Tech #Startup',
    post_type: 'announcement',
    tags: ['Startup', 'Milano', 'Tech'],
  },
  {
    author_username: 'cloudnative_spa',
    content: 'Case study pubblicato: come abbiamo ridotto i costi cloud del 40% per un cliente retail con 50M+ request/giorno usando spot instances, rightsizing e cached responses su CloudFront. #AWS #FinOps #CloudOptimization',
    post_type: 'case_study',
    tags: ['AWS', 'FinOps', 'Cloud'],
  },
  {
    author_username: 'silvia_marchetti',
    content: 'Test automatizzati non significano zero bug in produzione. Significano MENO bug e più FIDUCIA nel deploy. Oggi ho convinto il mio cliente ad adottare una strategia test-first: 80% unit, 15% integration, 5% e2e. Risultato: 0 critical bugs in 3 mesi. 🧪 #QA #Testing #Cypress',
    post_type: 'insight',
    tags: ['QA', 'Testing', 'Cypress'],
  },
  {
    author_username: 'giacomo_pellegrini',
    content: 'Go vs Rust per sistemi distribuiti: dopo 2 anni con entrambi, la mia opinione onesta. Go vince in produttività e simplicità. Rust vince in performance assoluta e sicurezza della memoria. Se non hai bisogno di 0 GC pauses, usa Go. #Go #Rust #SystemsProgramming',
    post_type: 'opinion',
    tags: ['Go', 'Rust', 'Systems Programming'],
  },
  {
    author_username: 'ai_factory',
    content: 'AI Factory apre le candidature per il nostro programma di ricerca 2026! Cerchiamo 5 ML Engineer con background in NLP o Computer Vision. Collaborerete direttamente con il Prof. Bianchi del Politecnico di Torino. Apply by March 15! 🤖 #AI #Research #Jobs',
    post_type: 'announcement',
    tags: ['AI', 'Research', 'Jobs'],
  },
];

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Starting social data seed...\n');

  await runMigrations();

  // ── Step 1: Insert mock users ──
  console.log('🔄 Seeding mock auth users...');
  const userIdMap: Record<string, number> = {};

  for (const u of MOCK_USERS) {
    // Skip if username already exists
    const existing = await db.execute({
      sql: 'SELECT id FROM auth_users WHERE username = ? OR email = ?',
      args: [u.username, u.email],
    });
    if (existing.rows.length > 0) {
      const existingId = Number(existing.rows[0].id);
      userIdMap[u.username] = existingId;
      console.log(`  ⏭  ${u.username} already exists (id=${existingId})`);
      continue;
    }

    const password_hash = await bcrypt.hash(u.password, 10);
    const result = await db.execute({
      sql: `INSERT INTO auth_users 
            (email, password_hash, role, display_name, username, avatar_color, theme_color, title, bio, 
             company_name, company_website, lat, lng, city, region, country, language, is_private)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Italia', 'it', 0)`,
      args: [
        u.email, password_hash, u.role, u.display_name, u.username,
        u.avatar_color, u.theme_color, u.title || '', u.bio || '',
        (u as typeof u & { company_name?: string }).company_name || null,
        (u as typeof u & { company_website?: string }).company_website || null,
        u.lat, u.lng, u.city, u.region,
      ],
    });
    const newId = Number(result.lastInsertRowid);
    userIdMap[u.username] = newId;
    console.log(`  ✅ Created ${u.username} (id=${newId})`);
  }
  console.log(`\n✅ ${Object.keys(userIdMap).length} users ready\n`);

  // ── Step 2: Insert mock listings ──
  console.log('🔄 Seeding mock listings (with lat/lng)...');
  let listingsCreated = 0;

  for (const listing of MOCK_LISTINGS) {
    const authorId = userIdMap[listing.author_username];
    if (!authorId) {
      console.warn(`  ⚠️  No user found for username: ${listing.author_username}`);
      continue;
    }

    // Check if listing already exists for this author with same title
    const existing = await db.execute({
      sql: 'SELECT id FROM listings WHERE author_id = ? AND title = ?',
      args: [authorId, listing.title],
    });
    if (existing.rows.length > 0) {
      console.log(`  ⏭  Listing "${listing.title}" already exists`);
      continue;
    }

    await db.execute({
      sql: `INSERT INTO listings (author_id, listing_type, title, description, category, level, work_type,
            salary_min, salary_max, tags, lat, lng, city, region, country, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Italia', 1)`,
      args: [
        authorId, listing.listing_type, listing.title, listing.description,
        listing.category, listing.level, listing.work_type,
        listing.salary_min, listing.salary_max,
        JSON.stringify(listing.tags),
        listing.lat, listing.lng, listing.city, listing.region,
      ],
    });
    listingsCreated++;
    console.log(`  ✅ Created listing: ${listing.title} (${listing.listing_type}) @ ${listing.city}`);
  }
  console.log(`\n✅ ${listingsCreated} listings created\n`);

  // ── Step 3: Insert mock posts ──
  console.log('🔄 Seeding mock posts...');
  // Disable FK checks since posts.user_id has an old FK to users(id) but we use auth_users
  await db.execute('PRAGMA foreign_keys = OFF');
  let postsCreated = 0;

  for (const post of MOCK_POSTS) {
    const userId = userIdMap[post.author_username];
    if (!userId) {
      console.warn(`  ⚠️  No user for username: ${post.author_username}`);
      continue;
    }

    // Check if post already exists (match by content prefix)
    const contentPreview = post.content.slice(0, 50);
    const existing = await db.execute({
      sql: "SELECT id FROM posts WHERE user_id = ? AND content LIKE ?",
      args: [userId, `${contentPreview}%`],
    });
    if (existing.rows.length > 0) {
      console.log(`  ⏭  Post by ${post.author_username} already exists`);
      continue;
    }

    // Random likes count for realism
    const likesCount = Math.floor(Math.random() * 80) + 5;
    const commentsCount = Math.floor(Math.random() * 20);

    await db.execute({
      sql: `INSERT INTO posts (user_id, content, post_type, tags, likes_count, comments_count, created_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-' || ? || ' hours'))`,
      args: [
        userId, post.content, post.post_type,
        JSON.stringify(post.tags),
        likesCount, commentsCount,
        Math.floor(Math.random() * 120) + 1, // random timestamp within last 5 days
      ],
    });
    postsCreated++;
    console.log(`  ✅ Post by ${post.author_username}: ${post.content.slice(0, 50)}...`);
  }
  console.log(`\n✅ ${postsCreated} posts created\n`);
  await db.execute('PRAGMA foreign_keys = ON');

  // ── Step 4: Seed some follow relationships ──
  console.log('🔄 Seeding follow relationships...');
  const followPairs = [
    ['sofia_ferrari', 'luca_conti'],
    ['sofia_ferrari', 'giulia_moretti'],
    ['luca_conti', 'matteo_ricci'],
    ['luca_conti', 'sofia_ferrari'],
    ['giulia_moretti', 'roberto_mancini'],
    ['matteo_ricci', 'ai_factory'],
    ['chiara_esposito', 'sofia_ferrari'],
    ['chiara_esposito', 'francesca_deluca'],
    ['andrea_russo', 'giacomo_pellegrini'],
    ['valentina_gallo', 'chiara_esposito'],
    ['roberto_mancini', 'cloudnative_spa'],
    ['francesca_deluca', 'sofia_ferrari'],
    ['davide_lombardi', 'giacomo_pellegrini'],
    ['silvia_marchetti', 'luca_conti'],
    ['giacomo_pellegrini', 'luca_conti'],
  ];

  let followsCreated = 0;
  for (const [followerUsername, followingUsername] of followPairs) {
    const followerId = userIdMap[followerUsername];
    const followingId = userIdMap[followingUsername];
    if (!followerId || !followingId) continue;

    try {
      await db.execute({
        sql: 'INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)',
        args: [followerId, followingId],
      });
      followsCreated++;
    } catch { /* ignore duplicates */ }
  }
  console.log(`✅ ${followsCreated} follow relationships created\n`);

  console.log('🎉 Social data seed complete!');
  console.log('\nTest accounts (all password: devhub123):');
  for (const u of MOCK_USERS.slice(0, 5)) {
    console.log(`  ${u.email} / devhub123 — ${u.role} — ${u.city}`);
  }
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
