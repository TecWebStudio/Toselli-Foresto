<?php
/**
 * DevHub IT - Database Initialization & Seed Data
 * Dati realistici per il social network IT
 */

function initDatabase($dbPath) {
    $db = new SQLite3($dbPath);
    $db->busyTimeout(5000);
    $db->exec('PRAGMA journal_mode=WAL');
    $db->exec('PRAGMA foreign_keys=ON');

    // ========== CREATE TABLES ==========
    $db->exec("
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            location TEXT NOT NULL,
            type TEXT NOT NULL,
            salary_min INTEGER,
            salary_max INTEGER,
            level TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            requirements TEXT,
            benefits TEXT,
            posted_date TEXT,
            logo_color TEXT
        );

        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT NOT NULL,
            level TEXT NOT NULL,
            duration TEXT,
            modules TEXT,
            badge_name TEXT,
            badge_description TEXT,
            badge_color TEXT,
            company_tips TEXT,
            prerequisites TEXT
        );

        CREATE TABLE IF NOT EXISTS quizzes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            questions TEXT NOT NULL,
            passing_score INTEGER DEFAULT 70,
            FOREIGN KEY (course_id) REFERENCES courses(id)
        );

        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            avatar_color TEXT,
            title TEXT,
            bio TEXT,
            joined_date TEXT
        );

        CREATE TABLE IF NOT EXISTS user_badges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            course_id INTEGER NOT NULL,
            badge_name TEXT NOT NULL,
            earned_date TEXT,
            score INTEGER,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (course_id) REFERENCES courses(id)
        );

        CREATE TABLE IF NOT EXISTS user_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            course_id INTEGER NOT NULL,
            completed_modules TEXT DEFAULT '[]',
            quiz_score INTEGER DEFAULT 0,
            quiz_completed INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (course_id) REFERENCES courses(id)
        );
    ");

    // ========== SEED USERS ==========
    $db->exec("INSERT INTO users (name, email, avatar_color, title, bio, joined_date) VALUES
        ('Marco Rossi', 'marco.rossi@devhub.it', '#6366f1', 'Full-Stack Developer', 'Appassionato di tecnologia e sviluppo software. Sempre alla ricerca di nuove sfide nel mondo IT.', '2025-01-15'),
        ('Laura Bianchi', 'laura.bianchi@devhub.it', '#ec4899', 'DevOps Engineer', 'Cloud architect con esperienza in AWS e Azure. Amo automatizzare tutto.', '2025-02-01'),
        ('Alessandro Verdi', 'alessandro.verdi@devhub.it', '#10b981', 'Data Scientist', 'Machine Learning enthusiast. Python lover. Kaggle competitor.', '2025-03-10')
    ");

    // ========== SEED JOBS ==========
    $jobs = [
        [
            'Senior Frontend Developer', 'TechVision S.r.l.', 'Milano', 'hybrid', 45000, 65000, 'senior', 'frontend',
            'Cerchiamo un Senior Frontend Developer per guidare lo sviluppo della nostra piattaforma SaaS enterprise. Lavorerai con React 18+, TypeScript e un design system proprietario. Il team è composto da 8 sviluppatori e utilizziamo metodologie Agile/Scrum.',
            '["React 18+ con Hooks avanzati e Context API","TypeScript 5+ con generics e utility types","Next.js 14 (App Router, Server Components)","Testing con Jest, React Testing Library, Cypress","CI/CD con GitHub Actions","Esperienza con design system (Storybook)","Almeno 5 anni di esperienza frontend"]',
            '["Smart working 3 giorni/settimana","Budget formazione 2000€/anno","MacBook Pro M3","Assicurazione sanitaria integrativa","Buoni pasto 8€/giorno"]',
            '2026-02-20', '#6366f1'
        ],
        [
            'Backend Developer Java', 'FinTech Solutions', 'Roma', 'hybrid', 40000, 58000, 'mid', 'backend',
            'Entra nel nostro team di sviluppo backend per costruire microservizi ad alta affidabilità nel settore fintech. Stack tecnologico: Java 21, Spring Boot 3, PostgreSQL, Kafka, Docker.',
            '["Java 17+ (preferibilmente 21)","Spring Boot 3.x, Spring Security, Spring Data","PostgreSQL e Redis","Apache Kafka per event-driven architecture","Docker e Kubernetes","RESTful API design e OpenAPI/Swagger","3-5 anni di esperienza backend"]',
            '["RAL competitiva + bonus annuale","Hybrid working (2 giorni in ufficio)","Conferenze tech pagate","Piano di crescita professionale","Stock options dopo 1 anno"]',
            '2026-02-18', '#f59e0b'
        ],
        [
            'DevOps Engineer', 'CloudNative S.p.A.', 'Torino', 'remote', 50000, 72000, 'senior', 'devops',
            'Stiamo cercando un DevOps Engineer esperto per gestire la nostra infrastruttura cloud multi-region su AWS. Gestirai pipeline CI/CD, monitoring, e Infrastructure as Code per oltre 50 microservizi.',
            '["AWS (EC2, ECS, Lambda, RDS, S3, CloudFront)","Terraform e/o Pulumi per IaC","Kubernetes (EKS) e Helm charts","GitHub Actions e ArgoCD","Prometheus, Grafana, ELK Stack","Linux administration avanzata","Scripting Bash/Python","5+ anni in ruoli DevOps/SRE"]',
            '["Full remote con meetup trimestrali","RAL fino a 72K","Budget hardware 3000€","30 giorni di ferie","Orario flessibile"]',
            '2026-02-22', '#10b981'
        ],
        [
            'Junior Full-Stack Developer', 'StartupHub', 'Milano', 'onsite', 25000, 32000, 'junior', 'fullstack',
            'Opportunità perfetta per chi vuole crescere rapidamente in una startup innovativa. Lavorerai su progetti greenfield con tecnologie moderne. Mentoring garantito da sviluppatori senior.',
            '["JavaScript/TypeScript fondamentali","React o Vue.js (base)","Node.js con Express o Fastify","SQL (PostgreSQL o MySQL)","Git e GitHub flow","Laurea in informatica o equivalente","0-2 anni di esperienza"]',
            '["Percorso di crescita accelerato","Mentoring 1:1 settimanale","Pranzo in ufficio gratuito","Team giovane e dinamico","Possibilità di equity"]',
            '2026-02-23', '#8b5cf6'
        ],
        [
            'Data Engineer', 'DataFlow Analytics', 'Bologna', 'hybrid', 42000, 60000, 'mid', 'data',
            'Cerchiamo un Data Engineer per progettare e mantenere pipeline dati scalabili. Lavorerai con big data, ETL processes e data warehouse moderni per clienti enterprise.',
            '["Python 3.10+ con focus su data engineering","Apache Spark e/o Apache Flink","SQL avanzato e data modeling","AWS (Redshift, Glue, S3) o GCP (BigQuery)","Airflow per orchestrazione","dbt per data transformation","3-4 anni di esperienza con dati"]',
            '["Hybrid 2/3 giorni remoto","Budget conferenze illimitato","Certificazioni cloud pagate","Welfare aziendale 1500€","Ambiente internazionale"]',
            '2026-02-19', '#f43f5e'
        ],
        [
            'Cybersecurity Analyst', 'SecureIT Group', 'Roma', 'hybrid', 38000, 55000, 'mid', 'security',
            'Unisciti al nostro SOC team come Security Analyst. Monitorerai le minacce, condurrai vulnerability assessment e gestirai incident response per clienti enterprise mission-critical.',
            '["SIEM (Splunk, QRadar o Sentinel)","Vulnerability scanning (Nessus, Qualys)","Network security e firewall management","Incident response e digital forensics","Conoscenza framework NIST/ISO 27001","CEH, CompTIA Security+ o equivalenti","2-4 anni in cybersecurity"]',
            '["Certificazioni pagate (OSCP, CISSP)","Laboratorio cyber dedicato","Smart working 60%","Assicurazione sanitaria premium","Reperibilità retribuita extra"]',
            '2026-02-21', '#ef4444'
        ],
        [
            'Mobile Developer (React Native)', 'AppFactory', 'Napoli', 'remote', 35000, 50000, 'mid', 'mobile',
            'Sviluppa app mobile cross-platform per clienti di primo livello. Il nostro team mobile gestisce 12 app in produzione con milioni di utenti attivi.',
            '["React Native 0.73+ con New Architecture","TypeScript strict mode","State management (Redux Toolkit, Zustand)","Testing con Detox e Jest","CI/CD mobile (Fastlane, App Center)","Pubblicazione App Store e Play Store","3+ anni React Native"]',
            '["Full remote Italia/EU","Dispositivi di test forniti","Budget formazione 1500€","Venerdì pomeriggio libero","Team retreat annuale"]',
            '2026-02-17', '#06b6d4'
        ],
        [
            'Cloud Architect', 'Enterprise Cloud', 'Milano', 'hybrid', 60000, 85000, 'lead', 'cloud',
            'Ruolo di Cloud Architect per guidare la migrazione cloud di grandi aziende italiane. Progetterai architetture multi-cloud, definirai best practices e menterai il team di 15 cloud engineers.',
            '["AWS Solutions Architect Professional o equivalente","Multi-cloud (AWS + Azure o GCP)","Architetture serverless e container-based","Security compliance (GDPR, SOC2)","Cost optimization e FinOps","Terraform/CloudFormation avanzato","Leadership tecnica e mentoring","8+ anni di esperienza, 3+ in cloud"]',
            '["RAL fino a 85K + MBO","Auto aziendale","Executive health check","Remote working flessibile","Budget team building"]',
            '2026-02-24', '#0ea5e9'
        ],
        [
            'ML Engineer', 'AI Factory', 'Torino', 'hybrid', 48000, 68000, 'senior', 'data',
            'Cerchiamo un ML Engineer per sviluppare e deployare modelli di machine learning in produzione. Lavorerai su NLP, computer vision e recommendation systems per il settore automotive.',
            '["Python con PyTorch e/o TensorFlow","MLOps (MLflow, Kubeflow, Weights & Biases)","NLP (Transformers, BERT, GPT fine-tuning)","Computer Vision (YOLO, ResNet)","Cloud ML services (SageMaker, Vertex AI)","Docker, Kubernetes per ML serving","PhD o 5+ anni ML in produzione"]',
            '["Accesso GPU cluster dedicato","Pubblicazioni scientifiche supportate","Hybrid working","Budget conferenze AI/ML","Collaborazione con università"]',
            '2026-02-16', '#a855f7'
        ],
        [
            'Junior Backend Developer (Python)', 'WebAgency Pro', 'Firenze', 'onsite', 24000, 30000, 'junior', 'backend',
            'Cerchiamo un giovane talento appassionato di Python per il nostro team backend. Svilupperai API REST, integrerai servizi terzi e lavorerai su progetti web innovativi.',
            '["Python 3.10+ fondamentali","Django o FastAPI base","SQL (PostgreSQL)","Git basics","API REST concepts","Voglia di imparare","Laurea triennale in informatica o autodidatta motivato"]',
            '["Mentoring da senior developer","Corsi Udemy/Pluralsight gratuiti","Ufficio in centro storico","Orario flessibile","Crescita rapida garantita"]',
            '2026-02-15', '#84cc16'
        ],
        [
            'Site Reliability Engineer', 'ScaleUp Infra', 'Milano', 'remote', 55000, 78000, 'senior', 'devops',
            'SRE role per garantire l\'affidabilità di sistemi che servono 10M+ requests/day. Definirai SLOs, gestirai incident management e automatizzerai le operazioni.',
            '["Kubernetes a scala (500+ pods)","Observability (OpenTelemetry, Datadog)","Programming Go o Python","Chaos Engineering (Litmus, Gremlin)","Database administration (PostgreSQL, MongoDB)","On-call management e incident response","SLA/SLO/SLI definition","5+ anni in SRE/DevOps"]',
            '["Full remote EU","On-call retribuita 500€/settimana","RSU (stock units)","Sabbatical dopo 3 anni","Top tier hardware"]',
            '2026-02-14', '#14b8a6'
        ],
        [
            'UX/UI Designer Developer', 'DesignTech', 'Bologna', 'hybrid', 35000, 48000, 'mid', 'frontend',
            'Cerchiamo un profilo ibrido design/development per creare esperienze utente straordinarie. Progetterai e implementerai interfacce accessibili e performanti.',
            '["Figma avanzato (Auto Layout, Variables, Components)","HTML/CSS/JavaScript eccellenti","React con Tailwind CSS","Design System creation","Accessibilità WCAG 2.1 AA","User Research e Design Thinking","Portfolio dimostrabile","3+ anni design + sviluppo"]',
            '["Licenze software pagate","Corsi design premium","Hybrid 3+2","Hardware Apple fornito","Team design internazionale"]',
            '2026-02-13', '#ec4899'
        ],
        [
            'Blockchain Developer', 'Web3 Italia', 'Remote', 'remote', 50000, 75000, 'senior', 'backend',
            'Sviluppa smart contract e DApps per il nostro ecosistema DeFi. Cerchiamo esperti Solidity con passione per la decentralizzazione e le nuove tecnologie Web3.',
            '["Solidity e Vyper","Hardhat/Foundry per testing","Ethers.js/Web3.js","EVM internals e gas optimization","DeFi protocols (Uniswap, Aave, Compound)","Audit di sicurezza smart contract","3+ anni blockchain development"]',
            '["Compensation parziale in token","Full remote globale","Hackathon trimestrali","Governance partecipata","Accesso conferenze Web3"]',
            '2026-02-12', '#f97316'
        ],
        [
            'QA Automation Engineer', 'QualityFirst', 'Padova', 'hybrid', 33000, 47000, 'mid', 'fullstack',
            'Costruisci framework di test automatizzati end-to-end per le nostre applicazioni enterprise. Collaborerai con team di sviluppo per garantire qualità e velocità di rilascio.',
            '["Cypress e/o Playwright","Selenium WebDriver","API testing (Postman, RestAssured)","Performance testing (JMeter, k6)","CI/CD integration","BDD con Cucumber","JavaScript/TypeScript o Java","3+ anni QA automation"]',
            '["Smartworking 3gg/settimana","Certificazione ISTQB pagata","Budget formazione","Buoni pasto elettronici","Assicurazione sanitaria"]',
            '2026-02-11', '#64748b'
        ],
        [
            'System Administrator Linux', 'InfraCore', 'Genova', 'onsite', 30000, 42000, 'mid', 'cloud',
            'Gestisci l\'infrastruttura on-premise e cloud ibrida dei nostri data center. Amministrerai server Linux, storage, networking e servizi di virtualizzazione.',
            '["Linux (RHEL, Ubuntu Server) avanzato","Ansible e/o Puppet per automation","VMware vSphere/KVM","Storage (SAN, NAS, Ceph)","Networking (TCP/IP, VPN, firewall)","Bash scripting avanzato","LPIC-2 o RHCSA/RHCE preferiti","3+ anni sysadmin"]',
            '["Reperibilità retribuita","Certificazioni Red Hat pagate","Ambiente stabile","Mensa aziendale","Orario 9-18 flessibile"]',
            '2026-02-10', '#78716c'
        ],
    ];

    $stmt = $db->prepare("INSERT INTO jobs (title, company, location, type, salary_min, salary_max, level, category, description, requirements, benefits, posted_date, logo_color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($jobs as $job) {
        for ($i = 0; $i < 13; $i++) {
            $stmt->bindValue($i + 1, $job[$i]);
        }
        $stmt->execute();
        $stmt->reset();
    }

    // ========== SEED COURSES ==========
    seedCourses($db);

    // ========== SEED QUIZZES ==========
    seedQuizzes($db);

    $db->close();
}

function seedCourses($db) {
    $courses = [
        // Course 1: Networking
        [
            'Fondamenti di Networking',
            'Corso completo sui fondamenti delle reti informatiche. Dal modello OSI al TCP/IP, dalla subnettazione al routing, fino ai protocolli applicativi. Preparazione ideale per certificazioni Cisco CCNA e CompTIA Network+.',
            'networking', 'intermediate', '40 ore',
            json_encode([
                [
                    'title' => 'Il Modello OSI e TCP/IP',
                    'description' => 'Comprensione approfondita dei layer di rete',
                    'content' => "## Il Modello OSI\n\nIl modello OSI (Open Systems Interconnection) è un framework concettuale a 7 livelli che standardizza le funzioni di un sistema di comunicazione.\n\n### I 7 Livelli\n\n**Layer 7 - Applicazione**: Interfaccia diretta con l'utente. Protocolli: HTTP/HTTPS, FTP, SMTP, DNS, DHCP.\n\n**Layer 6 - Presentazione**: Traduzione, crittografia e compressione dei dati. Formati: SSL/TLS, JPEG, ASCII, MPEG.\n\n**Layer 5 - Sessione**: Gestione delle sessioni di comunicazione. Protocolli: NetBIOS, RPC, PPTP.\n\n**Layer 4 - Trasporto**: Consegna affidabile end-to-end. TCP (connection-oriented, three-way handshake: SYN, SYN-ACK, ACK) e UDP (connectionless, bassa latenza).\n\n**Layer 3 - Rete**: Routing e indirizzamento logico. IP, ICMP, OSPF, BGP. Gestisce l'instradamento dei pacchetti.\n\n**Layer 2 - Data Link**: Framing e indirizzamento fisico (MAC). Ethernet, Wi-Fi (802.11), ARP, switch.\n\n**Layer 1 - Fisico**: Trasmissione bit sul mezzo fisico. Cavi, connettori, hub, segnali elettrici/ottici.\n\n### TCP/IP Model\nIl modello TCP/IP semplifica a 4 livelli:\n1. **Network Access** (L1+L2 OSI)\n2. **Internet** (L3 OSI) - IP, ICMP, ARP\n3. **Transport** (L4 OSI) - TCP, UDP\n4. **Application** (L5+L6+L7 OSI)\n\n### Encapsulation\nOgni layer aggiunge il proprio header:\n- Application → **Data**\n- Transport → **Segment** (TCP) / **Datagram** (UDP)\n- Network → **Packet**\n- Data Link → **Frame**\n- Physical → **Bits**"
                ],
                [
                    'title' => 'Indirizzamento IP e Subnetting',
                    'description' => 'IPv4, IPv6, CIDR e calcolo delle subnet',
                    'content' => "## Indirizzamento IPv4\n\nUn indirizzo IPv4 è composto da 32 bit, divisi in 4 ottetti (es. 192.168.1.1).\n\n### Classi di Indirizzi\n- **Classe A**: 1.0.0.0 - 126.255.255.255 (/8, 16M host)\n- **Classe B**: 128.0.0.0 - 191.255.255.255 (/16, 65K host)\n- **Classe C**: 192.0.0.0 - 223.255.255.255 (/24, 254 host)\n\n### Indirizzi Privati (RFC 1918)\n- 10.0.0.0/8\n- 172.16.0.0/12\n- 192.168.0.0/16\n\n### CIDR e Subnetting\nIl CIDR (Classless Inter-Domain Routing) permette subnet di dimensioni variabili.\n\n**Esempio di subnetting**: Data la rete 192.168.10.0/24, suddividerla in 4 subnet:\n- Servono 2 bit extra per 4 subnet → /26 (26 = 24 + 2)\n- Ogni subnet ha 2^6 - 2 = 62 host utilizzabili\n- Subnet 1: 192.168.10.0/26 (host: .1 - .62, broadcast: .63)\n- Subnet 2: 192.168.10.64/26 (host: .65 - .126, broadcast: .127)\n- Subnet 3: 192.168.10.128/26 (host: .129 - .190, broadcast: .191)\n- Subnet 4: 192.168.10.192/26 (host: .193 - .254, broadcast: .255)\n\n### IPv6\n128 bit, notazione esadecimale (es. 2001:0db8:85a3::8a2e:0370:7334)\n- Link-local: fe80::/10\n- Global Unicast: 2000::/3\n- Loopback: ::1"
                ],
                [
                    'title' => 'Routing e Switching',
                    'description' => 'Protocolli di routing, VLAN e switching avanzato',
                    'content' => "## Switching Layer 2\n\n### Come funziona uno Switch\nUno switch mantiene una **MAC Address Table** che associa indirizzi MAC alle porte fisiche.\n- **Learning**: Impara i MAC dagli indirizzi sorgente dei frame\n- **Forwarding**: Invia il frame solo alla porta corretta\n- **Flooding**: Se il MAC destinazione è sconosciuto, invia su tutte le porte\n\n### VLAN (Virtual LAN)\nPermettono la segmentazione logica della rete:\n- **Access Port**: appartiene a una sola VLAN\n- **Trunk Port**: trasporta traffico di più VLAN (802.1Q tagging)\n- **Native VLAN**: VLAN senza tag sul trunk\n\n## Routing Layer 3\n\n### Static Routing\nRoute configurate manualmente. Ideale per reti piccole.\n```\nip route 10.0.2.0 255.255.255.0 192.168.1.1\n```\n\n### Dynamic Routing Protocols\n\n**RIP (Routing Information Protocol)**\n- Distance vector, max 15 hop\n- Convergenza lenta, uso limitato\n\n**OSPF (Open Shortest Path First)**\n- Link-state, algoritmo Dijkstra\n- Aree gerarchiche, convergenza rapida\n- Standard enterprise\n\n**BGP (Border Gateway Protocol)**\n- Path vector, routing inter-AS\n- Backbone di Internet\n- Policy-based routing\n\n### Default Gateway\nRouter di ultima istanza per traffico verso reti esterne."
                ],
                [
                    'title' => 'DNS, DHCP e Servizi di Rete',
                    'description' => 'Protocolli applicativi fondamentali',
                    'content' => "## DNS (Domain Name System)\n\n### Gerarchia DNS\n1. **Root servers** (13 cluster globali, a.root-servers.net - m.root-servers.net)\n2. **TLD servers** (.com, .it, .org)\n3. **Authoritative servers** (gestiscono i record del dominio)\n4. **Recursive resolvers** (resolver locali/ISP)\n\n### Tipi di Record\n- **A**: Nome → IPv4 (es. example.com → 93.184.216.34)\n- **AAAA**: Nome → IPv6\n- **CNAME**: Alias (www.example.com → example.com)\n- **MX**: Mail server (priority + hostname)\n- **NS**: Nameserver autoritativi\n- **TXT**: Testo arbitrario (SPF, DKIM, verifica dominio)\n- **SOA**: Start of Authority (info zona)\n- **PTR**: Reverse DNS (IP → Nome)\n\n### Processo di Risoluzione\n1. Client chiede al resolver locale\n2. Resolver controlla cache\n3. Se assente, query ricorsiva: root → TLD → authoritative\n4. Risposta cached secondo il TTL\n\n## DHCP\n\n### Processo DORA\n1. **Discover**: Client broadcast (255.255.255.255)\n2. **Offer**: Server propone un IP\n3. **Request**: Client accetta l'offerta\n4. **Acknowledge**: Server conferma il lease\n\n### DHCP Lease\n- Durata configurabile\n- Rinnovo al 50% (T1) e 87.5% (T2) del lease\n- Assegna: IP, subnet mask, default gateway, DNS"
                ],
                [
                    'title' => 'Sicurezza di Rete Base',
                    'description' => 'Firewall, ACL e best practices',
                    'content' => "## Firewall\n\n### Tipi di Firewall\n- **Packet Filter**: Filtra per IP/porta (Layer 3-4)\n- **Stateful Inspection**: Traccia le connessioni attive\n- **Application Layer**: Ispezione profonda (Layer 7, WAF)\n- **Next-Generation (NGFW)**: IPS, application awareness, deep packet inspection\n\n### Access Control Lists (ACL)\nRegole ordinate che permettono o negano traffico:\n```\naccess-list 100 permit tcp 192.168.1.0 0.0.0.255 any eq 443\naccess-list 100 deny ip any any\n```\n\n### NAT (Network Address Translation)\n- **SNAT**: Traduce IP sorgente (outbound)\n- **DNAT/Port Forwarding**: Traduce IP destinazione (inbound)\n- **PAT**: Traduce usando porte diverse (NAT overload)\n\n### VPN\n- **IPSec**: Tunnel mode vs Transport mode, IKE negotiation\n- **SSL/TLS VPN**: OpenVPN, WireGuard\n- **Site-to-Site** vs **Remote Access**\n\n### Best Practices\n1. Principio del minimo privilegio\n2. Defense in depth (sicurezza a strati)\n3. Segmentazione di rete (DMZ)\n4. Monitoring e logging centralizzato\n5. Aggiornamenti regolari firmware/software\n6. Hardening dei dispositivi di rete"
                ]
            ], JSON_UNESCAPED_UNICODE),
            'Network Specialist', 'Certificazione di competenza nelle reti informatiche',
            '#3b82f6',
            json_encode([
                'Le aziende cercano candidati con conoscenza pratica di subnetting e VLAN configuration',
                'La certificazione CCNA è tra le più richieste: aumenta il salario medio del 15%',
                'Competenze di troubleshooting di rete sono essenziali per ruoli NOC e system admin',
                'IPv6 è sempre più richiesto: molte aziende stanno migrando le loro infrastrutture',
                'La conoscenza di Wireshark per analisi del traffico è un forte plus nei colloqui'
            ], JSON_UNESCAPED_UNICODE),
            'Conoscenze base di informatica'
        ],

        // Course 2: Cybersecurity
        [
            'Cybersecurity Essentials',
            'Corso avanzato sulla sicurezza informatica. Crittografia, threat analysis, penetration testing, incident response e compliance. Preparazione per CompTIA Security+, CEH e percorso verso OSCP.',
            'security', 'advanced', '60 ore',
            json_encode([
                [
                    'title' => 'Crittografia e PKI',
                    'description' => 'Algoritmi crittografici e infrastruttura a chiave pubblica',
                    'content' => "## Crittografia\n\n### Crittografia Simmetrica\nStessa chiave per cifrare e decifrare.\n- **AES (Advanced Encryption Standard)**: Standard attuale, chiavi 128/192/256 bit. Modalità: CBC, GCM (autenticato), CTR.\n- **ChaCha20**: Alternativa veloce ad AES, usato in TLS 1.3 e WireGuard.\n- **3DES**: Legacy, deprecato. Tre passate DES con 2-3 chiavi.\n\n### Crittografia Asimmetrica\nCoppia di chiavi: pubblica (cifra/verifica) e privata (decifra/firma).\n- **RSA**: Basato su fattorizzazione di numeri primi. Chiavi ≥2048 bit.\n- **ECC (Elliptic Curve)**: Sicurezza equivalente con chiavi più corte. Curve: P-256, P-384, Curve25519.\n- **Diffie-Hellman**: Scambio chiavi su canale insicuro. ECDHE per Perfect Forward Secrecy.\n\n### Hashing\nFunzione one-way, output fisso:\n- **SHA-256/SHA-3**: Standard sicuri per integrity check\n- **bcrypt/scrypt/Argon2**: Per password hashing (salt + work factor)\n- **MD5/SHA-1**: DEPRECATI, vulnerabili a collision\n\n### PKI\n- **Certificate Authority (CA)**: Emette certificati digitali X.509\n- **Certificate chain**: Root CA → Intermediate CA → End entity\n- **CRL/OCSP**: Revoca certificati compromessi\n- **Let's Encrypt**: CA gratuita, ACME protocol"
                ],
                [
                    'title' => 'Threat Landscape e Vulnerability Analysis',
                    'description' => 'Minacce, vulnerabilità e vettori di attacco',
                    'content' => "## Classificazione delle Minacce\n\n### OWASP Top 10 (2021)\n1. **Broken Access Control**: Mancata verifica autorizzazioni (IDOR, privilege escalation)\n2. **Cryptographic Failures**: Dati sensibili non cifrati, algoritmi deboli\n3. **Injection**: SQLi, XSS, Command Injection, LDAP Injection\n4. **Insecure Design**: Architettura senza security by design\n5. **Security Misconfiguration**: Default credentials, header mancanti, directory listing\n6. **Vulnerable Components**: Librerie con CVE note non aggiornate\n7. **Authentication Failures**: Brute force, session fixation, credential stuffing\n8. **Software/Data Integrity**: Supply chain attacks, insecure deserialization\n9. **Logging Failures**: Mancanza di audit trail e alerting\n10. **SSRF**: Server-Side Request Forgery\n\n### Tipi di Malware\n- **Ransomware**: Cifra dati, richiede riscatto (WannaCry, LockBit)\n- **Trojan**: Si maschera da software legittimo\n- **Rootkit**: Nasconde la presenza nel sistema\n- **Fileless malware**: Opera in memoria, senza file su disco\n- **APT**: Advanced Persistent Threat, attacchi mirati e prolungati\n\n### Vulnerability Assessment\n- **CVE**: Common Vulnerabilities and Exposures (identificatori standard)\n- **CVSS**: Score di severità (0-10)\n- **Tools**: Nessus, OpenVAS, Qualys\n- **Patch Management**: Processo critico di aggiornamento"
                ],
                [
                    'title' => 'Penetration Testing',
                    'description' => 'Metodologie e strumenti di ethical hacking',
                    'content' => "## Metodologia di Penetration Testing\n\n### Fasi\n1. **Reconnaissance**: Information gathering passivo e attivo\n   - Passivo: OSINT, Google dorking, Shodan, theHarvester\n   - Attivo: Nmap scanning, DNS enumeration\n\n2. **Scanning & Enumeration**\n   - Port scanning: `nmap -sS -sV -O -A target`\n   - Web scanning: Nikto, dirb/gobuster, Burp Suite\n   - Vulnerability scanning: Nessus, OpenVAS\n\n3. **Exploitation**\n   - Metasploit Framework\n   - Custom exploit development\n   - Social engineering (phishing, pretexting)\n\n4. **Post-Exploitation**\n   - Privilege escalation (Linux: SUID, cron, kernel; Windows: services, tokens)\n   - Lateral movement (Pass-the-Hash, PsExec)\n   - Data exfiltration\n   - Persistence (backdoor, scheduled tasks)\n\n5. **Reporting**\n   - Executive summary\n   - Technical findings con CVSS score\n   - Remediation recommendations\n   - Evidence e proof of concept\n\n### Tools Essenziali\n- **Burp Suite**: Web application testing\n- **Metasploit**: Exploitation framework\n- **John the Ripper / Hashcat**: Password cracking\n- **Wireshark**: Network analysis\n- **SQLmap**: Automated SQL injection\n- **Kali Linux**: Distribuzione dedicata"
                ],
                [
                    'title' => 'Incident Response e SOC',
                    'description' => 'Gestione incidenti e Security Operations Center',
                    'content' => "## Incident Response\n\n### Framework NIST SP 800-61\n\n**1. Preparation**\n- IR Plan documentato e testato\n- Team CSIRT definito con ruoli chiari\n- Strumenti forensi pronti (write blockers, forensic workstation)\n- Playbook per scenari comuni\n\n**2. Detection & Analysis**\n- Monitoraggio SIEM (correlazione eventi)\n- Alert triage e classificazione severità\n- Indicatori di Compromissione (IoC): IP, hash, domini\n- Timeline degli eventi\n\n**3. Containment**\n- Short-term: Isolamento immediato del sistema\n- Long-term: Patch, hardening, monitoraggio rafforzato\n- Evidence preservation (forensic image)\n\n**4. Eradication**\n- Rimozione malware/backdoor\n- Root cause analysis\n- Reset credenziali compromesse\n\n**5. Recovery**\n- Ripristino servizi da backup verificati\n- Monitoraggio intensivo post-recovery\n- Validazione integrità dati\n\n**6. Lessons Learned**\n- Post-mortem meeting\n- Aggiornamento playbook e procedure\n- Training mirato\n\n### SIEM e Log Management\n- **Splunk**: Enterprise SIEM leader di mercato\n- **Microsoft Sentinel**: Cloud-native SIEM\n- **ELK Stack**: Open source (Elasticsearch, Logstash, Kibana)\n- Retention log: minimo 12 mesi per compliance"
                ],
                [
                    'title' => 'Compliance e Framework di Sicurezza',
                    'description' => 'Standard, normative e governance della sicurezza',
                    'content' => "## Framework di Sicurezza\n\n### ISO/IEC 27001\nStandard internazionale per ISMS (Information Security Management System):\n- **Annex A**: 114 controlli in 14 categorie\n- Ciclo PDCA: Plan-Do-Check-Act\n- Certificazione mediante audit di terze parti\n- Risk assessment obbligatorio\n\n### NIST Cybersecurity Framework\n5 funzioni core:\n1. **Identify**: Asset management, risk assessment\n2. **Protect**: Access control, training, data security\n3. **Detect**: Monitoring, anomaly detection\n4. **Respond**: Incident response, communication\n5. **Recover**: Recovery planning, improvements\n\n### GDPR (Regolamento UE 2016/679)\n- **Data Protection Impact Assessment (DPIA)** per trattamenti ad alto rischio\n- **Data breach notification**: 72 ore all'autorità garante\n- **Privacy by Design e by Default**\n- **DPO** (Data Protection Officer) obbligatorio in certi casi\n- Sanzioni: fino al 4% del fatturato globale o 20M€\n\n### Zero Trust Architecture\nPrincipio: \"Never trust, always verify\"\n- Micro-segmentazione\n- Least privilege access\n- Continuous verification\n- Multi-Factor Authentication (MFA) ovunque\n- Identity-based perimeter (BeyondCorp model)"
                ]
            ], JSON_UNESCAPED_UNICODE),
            'Security Analyst', 'Certificazione di competenza in cybersecurity',
            '#ef4444',
            json_encode([
                'Le aziende fintech e sanitarie pagano premium per esperti di sicurezza con conoscenza GDPR',
                'La certificazione OSCP è la più rispettata nel settore: dimostra competenze pratiche reali',
                'Esperienza con SIEM (Splunk, Sentinel) è richiesta dal 78% degli annunci SOC analyst',
                'Bug bounty experience è molto apprezzata e dimostra iniziativa personale',
                'Le competenze di incident response sono critiche: il 60% delle aziende ha subito un breach'
            ], JSON_UNESCAPED_UNICODE),
            'Fondamenti di networking e sistemi operativi'
        ],

        // Course 3: Cloud & DevOps
        [
            'Cloud Computing & DevOps',
            'Padroneggia le tecnologie cloud e le pratiche DevOps moderne. AWS, Docker, Kubernetes, Terraform, CI/CD pipelines e monitoring. Percorso verso AWS Solutions Architect e CKA.',
            'cloud', 'advanced', '55 ore',
            json_encode([
                [
                    'title' => 'Fondamenti Cloud e AWS Core Services',
                    'description' => 'Concetti cloud e servizi AWS fondamentali',
                    'content' => "## Cloud Computing\n\n### Modelli di Servizio\n- **IaaS (Infrastructure as a Service)**: VM, storage, networking. Es: EC2, Azure VMs\n- **PaaS (Platform as a Service)**: Runtime gestito. Es: Elastic Beanstalk, App Engine, Heroku\n- **SaaS (Software as a Service)**: Applicazione completa. Es: Gmail, Salesforce, Microsoft 365\n- **FaaS/Serverless**: Funzioni event-driven. Es: Lambda, Cloud Functions\n\n### Modelli di Deployment\n- **Public Cloud**: Risorse condivise (AWS, Azure, GCP)\n- **Private Cloud**: Infrastruttura dedicata (OpenStack, VMware)\n- **Hybrid Cloud**: Combinazione public + private\n- **Multi-Cloud**: Più provider cloud\n\n### AWS Core Services\n\n**Compute**\n- **EC2**: Virtual machines con instance types (t3, m6i, c7g, r6i)\n- **Lambda**: Serverless functions (max 15 min, 10GB RAM)\n- **ECS/EKS**: Container orchestration\n- **Fargate**: Serverless containers\n\n**Storage**\n- **S3**: Object storage (Standard, IA, Glacier, Intelligent-Tiering)\n- **EBS**: Block storage per EC2 (gp3, io2, st1)\n- **EFS**: File system NFS managed\n\n**Database**\n- **RDS**: Managed relational (PostgreSQL, MySQL, Oracle)\n- **DynamoDB**: NoSQL key-value, <10ms latency\n- **ElastiCache**: In-memory (Redis, Memcached)\n\n**Networking**\n- **VPC**: Virtual Private Cloud con subnet, route tables, NAT\n- **ALB/NLB**: Load balancing Layer 7/4\n- **CloudFront**: CDN globale\n- **Route 53**: DNS managed"
                ],
                [
                    'title' => 'Docker e Containerizzazione',
                    'description' => 'Container, immagini, networking e best practices',
                    'content' => "## Docker\n\n### Concetti Fondamentali\n- **Image**: Template read-only con filesystem e configurazione\n- **Container**: Istanza runtime di un'immagine (processo isolato)\n- **Dockerfile**: Script dichiarativo per build immagini\n- **Registry**: Repository immagini (Docker Hub, ECR, GCR)\n\n### Dockerfile Best Practices\n```dockerfile\n# Multi-stage build per immagini ottimizzate\nFROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nRUN npm run build\n\nFROM node:20-alpine AS runtime\nWORKDIR /app\nCOPY --from=builder /app/dist ./dist\nCOPY --from=builder /app/node_modules ./node_modules\nUSER node\nEXPOSE 3000\nCMD [\"node\", \"dist/main.js\"]\n```\n\n### Best Practices\n1. **Immagini minimali**: Usa alpine o distroless\n2. **Multi-stage builds**: Separa build da runtime\n3. **Layer caching**: Ordina COPY per sfruttare la cache\n4. **Non root**: Usa USER per sicurezza\n5. **.dockerignore**: Escludi file non necessari\n6. **Health checks**: HEALTHCHECK nel Dockerfile\n\n### Docker Compose\n```yaml\nservices:\n  app:\n    build: .\n    ports: [\"3000:3000\"]\n    depends_on:\n      db:\n        condition: service_healthy\n  db:\n    image: postgres:16-alpine\n    volumes: [\"pgdata:/var/lib/postgresql/data\"]\n    healthcheck:\n      test: pg_isready -U postgres\nvolumes:\n  pgdata:\n```\n\n### Networking\n- **bridge**: Default, comunicazione tra container sullo stesso host\n- **host**: Condivide network namespace con l'host\n- **overlay**: Multi-host networking (Swarm/Kubernetes)"
                ],
                [
                    'title' => 'Kubernetes',
                    'description' => 'Orchestrazione container in produzione',
                    'content' => "## Kubernetes (K8s)\n\n### Architettura\n**Control Plane**:\n- **API Server**: Punto di ingresso per tutte le operazioni\n- **etcd**: Key-value store per lo stato del cluster\n- **Scheduler**: Assegna pod ai nodi\n- **Controller Manager**: Gestisce controller (ReplicaSet, Deployment, etc.)\n\n**Worker Nodes**:\n- **kubelet**: Agente che gestisce i pod\n- **kube-proxy**: Networking e service discovery\n- **Container Runtime**: containerd o CRI-O\n\n### Risorse Principali\n\n**Pod**: Unità minima di deployment, uno o più container\n```yaml\napiVersion: v1\nkind: Pod\nmetadata:\n  name: nginx\nspec:\n  containers:\n  - name: nginx\n    image: nginx:1.25\n    resources:\n      requests: { cpu: 100m, memory: 128Mi }\n      limits: { cpu: 500m, memory: 256Mi }\n```\n\n**Deployment**: Gestisce ReplicaSet, rolling updates, rollback\n\n**Service**: Espone pod con IP stabile\n- **ClusterIP**: Interno al cluster\n- **NodePort**: Porta su ogni nodo (30000-32767)\n- **LoadBalancer**: Cloud LB esterno\n\n**Ingress**: Routing HTTP/HTTPS con TLS termination\n\n**ConfigMap/Secret**: Configurazione e dati sensibili\n\n**PersistentVolume (PV/PVC)**: Storage persistente\n\n### Scaling\n- **HPA**: Horizontal Pod Autoscaler (CPU/memory/custom metrics)\n- **VPA**: Vertical Pod Autoscaler\n- **Cluster Autoscaler**: Scala i nodi"
                ],
                [
                    'title' => 'Infrastructure as Code e CI/CD',
                    'description' => 'Terraform, GitHub Actions e pipeline automatizzate',
                    'content' => "## Infrastructure as Code (IaC)\n\n### Terraform\nStrumento IaC dichiarativo multi-cloud.\n\n```hcl\n# Provider\nprovider \"aws\" {\n  region = \"eu-west-1\"\n}\n\n# VPC con modulo\nmodule \"vpc\" {\n  source  = \"terraform-aws-modules/vpc/aws\"\n  version = \"5.0\"\n  \n  name = \"production-vpc\"\n  cidr = \"10.0.0.0/16\"\n  \n  azs             = [\"eu-west-1a\", \"eu-west-1b\"]\n  private_subnets = [\"10.0.1.0/24\", \"10.0.2.0/24\"]\n  public_subnets  = [\"10.0.101.0/24\", \"10.0.102.0/24\"]\n  \n  enable_nat_gateway = true\n}\n```\n\n### Workflow Terraform\n1. `terraform init` - Inizializza provider e moduli\n2. `terraform plan` - Preview delle modifiche\n3. `terraform apply` - Applica le modifiche\n4. `terraform destroy` - Rimuove le risorse\n\n### State Management\n- Remote state su S3 + DynamoDB lock\n- State locking per evitare conflitti\n- `terraform import` per risorse esistenti\n\n## CI/CD con GitHub Actions\n\n```yaml\nname: Deploy\non:\n  push:\n    branches: [main]\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n    - uses: actions/checkout@v4\n    - uses: actions/setup-node@v4\n      with: { node-version: 20 }\n    - run: npm ci\n    - run: npm test\n    - run: npm run build\n    - name: Deploy to ECS\n      uses: aws-actions/amazon-ecs-deploy-task-definition@v1\n```\n\n### Best Practices CI/CD\n- Branch protection rules\n- Automated testing (unit, integration, e2e)\n- Staging environment pre-production\n- Blue/Green o Canary deployments\n- Rollback automatico su failure"
                ],
                [
                    'title' => 'Monitoring e Observability',
                    'description' => 'Prometheus, Grafana, logging e alerting',
                    'content' => "## Observability\n\nI tre pilastri dell'observability:\n\n### 1. Metrics (Prometheus + Grafana)\n**Prometheus**:\n- Time-series database\n- Pull-based model (scrape endpoints)\n- PromQL per query\n- Alert rules con Alertmanager\n\n```promql\n# Request rate per endpoint\nrate(http_requests_total{job=\"api\"}[5m])\n\n# 95th percentile latency\nhistogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))\n\n# Error rate\nrate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m])\n```\n\n**Grafana**: Dashboarding e visualizzazione\n- Datasource multiple (Prometheus, Loki, Elasticsearch)\n- Alert con notifiche multi-canale\n- Dashboard as Code (JSON/Terraform)\n\n### 2. Logs (ELK / Loki)\n- **Structured logging**: JSON format con correlation ID\n- **Log levels**: DEBUG, INFO, WARN, ERROR, FATAL\n- **Centralized logging**: ELK Stack o Grafana Loki\n- **Retention policy**: Bilanciare costi e compliance\n\n### 3. Traces (Jaeger / OpenTelemetry)\n- **Distributed tracing**: Segui una request attraverso i microservizi\n- **OpenTelemetry**: Standard unificato per metrics, logs, traces\n- **Span**: Unità di lavoro con timing e metadata\n\n### SLI/SLO/SLA\n- **SLI (Indicator)**: Metrica misurabile (es. latency p99 < 200ms)\n- **SLO (Objective)**: Target (es. 99.9% uptime)\n- **SLA (Agreement)**: Contratto con penali\n- **Error Budget**: 100% - SLO = budget per esperimenti"
                ]
            ], JSON_UNESCAPED_UNICODE),
            'Cloud Engineer', 'Certificazione di competenza in cloud e DevOps',
            '#10b981',
            json_encode([
                'AWS Solutions Architect è la certificazione cloud più richiesta in Italia con +20% sullo stipendio',
                'Kubernetes è requisito nel 65% degli annunci DevOps: la CKA è molto apprezzata',
                'Terraform è lo strumento IaC dominante: il 72% delle aziende lo usa in produzione',
                'Esperienza con GitOps (ArgoCD, Flux) è il trend emergente più richiesto nel 2026',
                'Le competenze FinOps (ottimizzazione costi cloud) sono sempre più valorizzate'
            ], JSON_UNESCAPED_UNICODE),
            'Fondamenti di networking e Linux base'
        ],

        // Course 4: Full-Stack Development
        [
            'Full-Stack Web Development',
            'Diventa un Full-Stack Developer completo. React avanzato, Node.js, API design, database, autenticazione e deployment. Dalle basi all\'architettura di applicazioni production-ready.',
            'development', 'intermediate', '50 ore',
            json_encode([
                [
                    'title' => 'React Avanzato e Patterns',
                    'description' => 'Hooks custom, performance, state management',
                    'content' => "## React Avanzato\n\n### Hooks Custom\nI custom hooks permettono di estrarre logica riutilizzabile:\n\n```typescript\nfunction useDebounce<T>(value: T, delay: number): T {\n  const [debouncedValue, setDebouncedValue] = useState(value);\n  \n  useEffect(() => {\n    const timer = setTimeout(() => setDebouncedValue(value), delay);\n    return () => clearTimeout(timer);\n  }, [value, delay]);\n  \n  return debouncedValue;\n}\n\nfunction useFetch<T>(url: string) {\n  const [data, setData] = useState<T | null>(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState<Error | null>(null);\n  \n  useEffect(() => {\n    const controller = new AbortController();\n    fetch(url, { signal: controller.signal })\n      .then(res => res.json())\n      .then(setData)\n      .catch(setError)\n      .finally(() => setLoading(false));\n    return () => controller.abort();\n  }, [url]);\n  \n  return { data, loading, error };\n}\n```\n\n### Performance Optimization\n- **React.memo**: Evita re-render di componenti con stesse props\n- **useMemo**: Memoizza calcoli costosi\n- **useCallback**: Stabilizza riferimenti a funzioni\n- **React.lazy + Suspense**: Code splitting\n- **useTransition**: Priorità agli aggiornamenti UI\n\n### State Management\n- **useState/useReducer**: State locale\n- **Context API**: State condiviso semplice (theme, auth)\n- **Zustand**: Lightweight, non boilerplate\n- **Redux Toolkit**: Enterprise, middleware, devtools\n- **TanStack Query**: Server state management"
                ],
                [
                    'title' => 'API Design e Backend Node.js',
                    'description' => 'REST, GraphQL e backend con Node.js/Express',
                    'content' => "## API Design\n\n### RESTful API Best Practices\n```\nGET    /api/users          → Lista utenti (paginata)\nGET    /api/users/:id       → Singolo utente\nPOST   /api/users           → Crea utente\nPUT    /api/users/:id       → Aggiorna utente (completo)\nPATCH  /api/users/:id       → Aggiorna parziale\nDELETE /api/users/:id       → Elimina utente\n```\n\n**Convenzioni**:\n- Nomi plurali per le risorse\n- Versioning: `/api/v1/users`\n- Pagination: `?page=1&limit=20`\n- Filtering: `?status=active&role=admin`\n- HTTP status codes corretti (200, 201, 400, 401, 403, 404, 500)\n\n### Express.js con TypeScript\n```typescript\nimport express from 'express';\nimport { z } from 'zod';\n\nconst userSchema = z.object({\n  name: z.string().min(2),\n  email: z.string().email(),\n  role: z.enum(['user', 'admin'])\n});\n\napp.post('/api/users', async (req, res) => {\n  const result = userSchema.safeParse(req.body);\n  if (!result.success) {\n    return res.status(400).json({ errors: result.error.issues });\n  }\n  const user = await db.user.create({ data: result.data });\n  res.status(201).json(user);\n});\n```\n\n### Authentication\n- **JWT**: Stateless, access + refresh tokens\n- **Session**: Server-side, cookie-based\n- **OAuth 2.0**: Login con provider (Google, GitHub)\n- **Bcrypt**: Hashing password con salt\n- **Rate limiting**: Protezione da brute force"
                ],
                [
                    'title' => 'Database e ORM',
                    'description' => 'PostgreSQL, MongoDB, Prisma e ottimizzazione query',
                    'content' => "## Database\n\n### PostgreSQL\nDatabase relazionale avanzato:\n\n```sql\n-- Schema design con relazioni\nCREATE TABLE users (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  email VARCHAR(255) UNIQUE NOT NULL,\n  name VARCHAR(100) NOT NULL,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);\n\nCREATE TABLE posts (\n  id SERIAL PRIMARY KEY,\n  user_id UUID REFERENCES users(id) ON DELETE CASCADE,\n  title VARCHAR(200) NOT NULL,\n  content TEXT,\n  tags TEXT[] DEFAULT '{}',\n  metadata JSONB DEFAULT '{}',\n  published_at TIMESTAMPTZ,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);\n\n-- Index per performance\nCREATE INDEX idx_posts_user ON posts(user_id);\nCREATE INDEX idx_posts_tags ON posts USING GIN(tags);\nCREATE INDEX idx_posts_metadata ON posts USING GIN(metadata);\n```\n\n### Prisma ORM\n```prisma\nmodel User {\n  id    String  @id @default(uuid())\n  email String  @unique\n  name  String\n  posts Post[]\n}\n\nmodel Post {\n  id     Int    @id @default(autoincrement())\n  title  String\n  author User   @relation(fields: [userId], references: [id])\n  userId String\n}\n```\n\n### Query Optimization\n- **EXPLAIN ANALYZE**: Analizza il query plan\n- **Indexing strategico**: B-tree, GIN, GiST\n- **Connection pooling**: PgBouncer\n- **N+1 problem**: Usa JOIN o include\n- **Pagination**: Cursor-based > offset-based per grandi dataset"
                ],
                [
                    'title' => 'Testing e Qualità del Codice',
                    'description' => 'Unit test, integration test, e2e, CI/CD',
                    'content' => "## Testing\n\n### Piramide dei Test\n1. **Unit Tests** (70%): Testano funzioni/componenti isolati\n2. **Integration Tests** (20%): Testano interazione tra moduli\n3. **E2E Tests** (10%): Testano flussi utente completi\n\n### Jest + React Testing Library\n```typescript\nimport { render, screen, fireEvent, waitFor } from '@testing-library/react';\nimport { UserProfile } from './UserProfile';\n\ndescribe('UserProfile', () => {\n  it('displays user name after loading', async () => {\n    render(<UserProfile userId=\"123\" />);\n    \n    expect(screen.getByTestId('loading')).toBeInTheDocument();\n    \n    await waitFor(() => {\n      expect(screen.getByText('Marco Rossi')).toBeInTheDocument();\n    });\n  });\n  \n  it('handles edit mode', () => {\n    render(<UserProfile userId=\"123\" />);\n    fireEvent.click(screen.getByRole('button', { name: /edit/i }));\n    expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();\n  });\n});\n```\n\n### Cypress / Playwright E2E\n```typescript\ntest('user can login and view dashboard', async ({ page }) => {\n  await page.goto('/login');\n  await page.fill('[name=email]', 'test@example.com');\n  await page.fill('[name=password]', 'securepass');\n  await page.click('button[type=submit]');\n  await expect(page).toHaveURL('/dashboard');\n  await expect(page.locator('h1')).toContainText('Welcome');\n});\n```\n\n### Code Quality\n- **ESLint**: Linting per errori e style\n- **Prettier**: Formattazione automatica\n- **TypeScript strict mode**: Catch errori a compile-time\n- **Husky + lint-staged**: Pre-commit hooks\n- **SonarQube**: Static code analysis"
                ],
                [
                    'title' => 'Deployment e Architettura',
                    'description' => 'Next.js deployment, microservizi, performance',
                    'content' => "## Deployment\n\n### Next.js Deployment\n- **Vercel**: Zero-config, optimal per Next.js\n- **Docker**: Container deployment su qualsiasi piattaforma\n- **AWS Amplify**: CI/CD automatico\n- **Self-hosted**: Node.js server su VPS/EC2\n\n### Architettura Microservizi\n```\n[API Gateway] → [Auth Service]\n              → [User Service] → [PostgreSQL]\n              → [Post Service] → [MongoDB]\n              → [Notification Service] → [Redis Queue]\n              → [Search Service] → [Elasticsearch]\n```\n\n**Comunicazione**:\n- **Sincrona**: REST, gRPC\n- **Asincrona**: Message queues (RabbitMQ, Kafka)\n- **Event-driven**: Event sourcing, CQRS\n\n### Performance\n- **CDN**: Assets statici su CloudFront/Cloudflare\n- **Caching**: Redis per hot data, HTTP cache headers\n- **Image optimization**: Next/Image, WebP/AVIF\n- **Bundle analysis**: webpack-bundle-analyzer\n- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1\n\n### Security Checklist\n- [ ] HTTPS everywhere (HSTS)\n- [ ] CSP headers\n- [ ] Input sanitization\n- [ ] SQL injection prevention (prepared statements)\n- [ ] XSS prevention (output encoding)\n- [ ] CSRF tokens\n- [ ] Rate limiting\n- [ ] Secrets management (env vars, vault)\n- [ ] Dependency audit (npm audit)"
                ]
            ], JSON_UNESCAPED_UNICODE),
            'Full-Stack Developer', 'Certificazione di competenza nello sviluppo full-stack',
            '#8b5cf6',
            json_encode([
                'React + TypeScript è la combinazione frontend più richiesta in Italia (presente nel 70% degli annunci)',
                'Conoscere sia SQL che NoSQL è fondamentale: il 80% dei colloqui include domande su entrambi',
                'Testing è un differenziatore chiave: i candidati che dimostrano esperienza con TDD hanno 40% più chance',
                'Esperienza con Next.js App Router e Server Components è sempre più richiesta dal 2025',
                'Le aziende valutano molto i progetti open source e i contributi su GitHub'
            ], JSON_UNESCAPED_UNICODE),
            'HTML, CSS, JavaScript base'
        ],

        // Course 5: Data Science & ML
        [
            'Data Science & Machine Learning',
            'Corso completo di Data Science e Machine Learning. Dalla preparazione dati ai modelli avanzati di deep learning, con focus su applicazioni reali e production-ready ML systems.',
            'data', 'advanced', '65 ore',
            json_encode([
                [
                    'title' => 'Python per Data Science',
                    'description' => 'NumPy, Pandas, visualizzazione dati',
                    'content' => "## Python Data Stack\n\n### NumPy\nLibreria fondamentale per calcolo numerico:\n```python\nimport numpy as np\n\n# Array creation e operazioni vettorizzate\narr = np.array([1, 2, 3, 4, 5])\nmatrix = np.random.randn(100, 50)  # 100x50 matrice di numeri casuali\n\n# Broadcasting: operazioni tra array di dimensioni diverse\nnormalized = (matrix - matrix.mean(axis=0)) / matrix.std(axis=0)\n\n# Linear algebra\neigenvalues, eigenvectors = np.linalg.eig(matrix.T @ matrix)\n```\n\n### Pandas\nManipilazione e analisi dati tabulari:\n```python\nimport pandas as pd\n\n# Caricamento e esplorazione\ndf = pd.read_csv('sales.csv', parse_dates=['date'])\ndf.info()  # tipi, null counts\ndf.describe()  # statistiche descrittive\n\n# Pulizia dati\ndf = df.dropna(subset=['revenue'])  # rimuovi null\ndf['category'] = df['category'].fillna('unknown')\ndf = df[df['revenue'] > 0]  # filtra outlier\n\n# Aggregazioni\nmonthly = (df.groupby(df['date'].dt.to_period('M'))\n            .agg({'revenue': ['sum', 'mean'], 'quantity': 'sum'})\n            .reset_index())\n\n# Merge e join\nresult = pd.merge(orders, customers, on='customer_id', how='left')\n```\n\n### Visualizzazione\n- **Matplotlib**: Grafici base, altamente personalizzabili\n- **Seaborn**: Grafici statistici eleganti\n- **Plotly**: Grafici interattivi\n```python\nimport seaborn as sns\nsns.heatmap(df.corr(), annot=True, cmap='coolwarm')\n```"
                ],
                [
                    'title' => 'Machine Learning Classico',
                    'description' => 'Supervised e unsupervised learning con Scikit-learn',
                    'content' => "## Machine Learning con Scikit-learn\n\n### Pipeline ML Standard\n1. **Data Collection**: Raccolta dati da varie fonti\n2. **EDA**: Exploratory Data Analysis\n3. **Feature Engineering**: Creazione e selezione feature\n4. **Model Selection**: Scelta algoritmo appropriato\n5. **Training**: Addestramento del modello\n6. **Evaluation**: Valutazione performance\n7. **Deployment**: Messa in produzione\n\n### Supervised Learning\n\n**Classificazione**:\n- **Logistic Regression**: Baseline, interpretabile\n- **Random Forest**: Ensemble, robusto, feature importance\n- **XGBoost/LightGBM**: Gradient boosting, top performer tabular data\n- **SVM**: Efficace in high-dimensional spaces\n\n**Regressione**:\n- **Linear Regression**: Baseline\n- **Ridge/Lasso**: Regularizzazione L2/L1\n- **Gradient Boosting Regressor**: Top performer\n\n```python\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.model_selection import cross_val_score\n\npipeline = Pipeline([\n    ('scaler', StandardScaler()),\n    ('clf', RandomForestClassifier(n_estimators=200, max_depth=10))\n])\n\nscores = cross_val_score(pipeline, X, y, cv=5, scoring='f1_weighted')\nprint(f'F1 Score: {scores.mean():.3f} ± {scores.std():.3f}')\n```\n\n### Unsupervised Learning\n- **K-Means**: Clustering per partizionamento\n- **DBSCAN**: Clustering density-based\n- **PCA**: Dimensionality reduction\n\n### Metriche\n- **Classification**: Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix\n- **Regression**: MAE, RMSE, R², MAPE"
                ],
                [
                    'title' => 'Deep Learning',
                    'description' => 'Neural networks, CNN, RNN, Transformers',
                    'content' => "## Deep Learning con PyTorch\n\n### Neural Network Fundamentals\n- **Neurone**: weighted sum + activation function\n- **Attivazioni**: ReLU, Sigmoid, Tanh, GELU, Swish\n- **Loss functions**: CrossEntropy (classification), MSE (regression)\n- **Optimizers**: Adam (default), AdamW (weight decay), SGD + momentum\n- **Regularization**: Dropout, BatchNorm, Weight Decay, Early Stopping\n\n### Convolutional Neural Networks (CNN)\nPer immagini e dati spaziali:\n```python\nimport torch.nn as nn\n\nclass CNN(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.features = nn.Sequential(\n            nn.Conv2d(3, 32, 3, padding=1),\n            nn.BatchNorm2d(32),\n            nn.ReLU(),\n            nn.MaxPool2d(2),\n            nn.Conv2d(32, 64, 3, padding=1),\n            nn.BatchNorm2d(64),\n            nn.ReLU(),\n            nn.AdaptiveAvgPool2d(1)\n        )\n        self.classifier = nn.Linear(64, 10)\n```\n\n### Transformers\nArchitettura dominante per NLP e oltre:\n- **Self-Attention**: Permette al modello di pesare l'importanza di ogni token\n- **Multi-Head Attention**: Cattura pattern diversi in parallelo\n- **Positional Encoding**: Aggiunge informazione posizionale\n\n**Modelli pre-trained**:\n- **BERT**: Bidirectional encoder (classificazione, NER, QA)\n- **GPT**: Autoregressive decoder (generazione testo)\n- **T5**: Encoder-decoder (traduzione, summarization)\n- **Vision Transformer (ViT)**: Transformers per immagini\n\n```python\nfrom transformers import AutoTokenizer, AutoModel\n\ntokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')\nmodel = AutoModel.from_pretrained('bert-base-uncased')\n\ninputs = tokenizer('Hello, world!', return_tensors='pt')\noutputs = model(**inputs)\n```"
                ],
                [
                    'title' => 'MLOps e Production ML',
                    'description' => 'Deploy modelli ML in produzione',
                    'content' => "## MLOps\n\n### ML Pipeline in Produzione\n```\n[Data Source] → [Feature Store] → [Training Pipeline] → [Model Registry]\n                                                            ↓\n[Monitoring] ← [A/B Testing] ← [Serving Infrastructure] ← [Deployment]\n```\n\n### Experiment Tracking\n```python\nimport mlflow\n\nmlflow.set_experiment('churn_prediction')\n\nwith mlflow.start_run():\n    model = train_model(params)\n    \n    # Log parametri e metriche\n    mlflow.log_params(params)\n    mlflow.log_metric('auc', 0.87)\n    mlflow.log_metric('f1', 0.82)\n    \n    # Log modello\n    mlflow.sklearn.log_model(model, 'model')\n```\n\n### Model Serving\n- **FastAPI**: API REST per inferenza\n- **TorchServe**: Serving PyTorch nativo\n- **Triton**: GPU inference server (NVIDIA)\n- **SageMaker Endpoints**: Managed AWS\n\n```python\nfrom fastapi import FastAPI\nimport joblib\n\napp = FastAPI()\nmodel = joblib.load('model.pkl')\n\n@app.post('/predict')\nasync def predict(features: dict):\n    prediction = model.predict([list(features.values())])\n    return {'prediction': prediction[0].tolist()}\n```\n\n### Monitoring in Produzione\n- **Data drift**: Distribuzione input cambia nel tempo\n- **Model drift**: Performance degrada\n- **Feature store**: Versioning e serving feature\n- **A/B testing**: Confronto modelli in produzione\n- **Tools**: Evidently AI, WhyLabs, Seldon"
                ]
            ], JSON_UNESCAPED_UNICODE),
            'Data Scientist', 'Certificazione di competenza in data science e ML',
            '#f59e0b',
            json_encode([
                'Python + SQL sono le competenze base richieste nel 95% degli annunci data science',
                'XGBoost/LightGBM dominano le competizioni Kaggle e i use case aziendali su dati tabulari',
                'Esperienza con MLOps (MLflow, Kubeflow) distingue un data scientist junior da un senior',
                'Le aziende cercano candidati che sappiano comunicare i risultati a stakeholder non tecnici',
                'Competenze in NLP e LLM fine-tuning sono le più ricercate nel 2026'
            ], JSON_UNESCAPED_UNICODE),
            'Python base, statistica fondamentale'
        ],

        // Course 6: Database Administration
        [
            'Database Administration',
            'Corso professionale di amministrazione database. PostgreSQL, MySQL, MongoDB, ottimizzazione query, replica, backup, sicurezza. Preparazione per certificazioni Oracle DBA e MongoDB DBA.',
            'database', 'intermediate', '45 ore',
            json_encode([
                [
                    'title' => 'Progettazione Database Relazionali',
                    'description' => 'Normalizzazione, ER modeling, schema design',
                    'content' => "## Progettazione Database\n\n### Entity-Relationship Model\nPassi per la progettazione:\n1. Identificare le **entità** (tabelle)\n2. Definire gli **attributi** (colonne)\n3. Stabilire le **relazioni** (foreign keys)\n4. Determinare la **cardinalità** (1:1, 1:N, N:M)\n\n### Normalizzazione\n\n**1NF (First Normal Form)**:\n- Ogni colonna contiene valori atomici\n- Nessun gruppo ripetuto\n- ❌ `telefoni: '123, 456, 789'`\n- ✅ Tabella separata `telefoni` con FK\n\n**2NF (Second Normal Form)**:\n- 1NF + nessuna dipendenza parziale dalla PK\n- Ogni attributo non-chiave dipende dall'intera PK\n\n**3NF (Third Normal Form)**:\n- 2NF + nessuna dipendenza transitiva\n- Attributi non-chiave dipendono solo dalla PK\n\n**BCNF (Boyce-Codd)**:\n- Ogni determinante è una chiave candidata\n\n### Denormalizzazione\nIn produzione, a volte si denormalizza per performance:\n- Materialized views per report\n- Colonne calcolate per query frequenti\n- JSON columns per dati semi-strutturati\n\n### PostgreSQL Data Types\n```sql\n-- Tipi avanzati PostgreSQL\nCREATE TABLE products (\n  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n  name TEXT NOT NULL,\n  price NUMERIC(10,2),\n  tags TEXT[],           -- Array\n  metadata JSONB,        -- JSON binario indicizzabile\n  location POINT,        -- Geospaziale\n  search_vector TSVECTOR -- Full-text search\n);\n```"
                ],
                [
                    'title' => 'Query Optimization e Indexing',
                    'description' => 'EXPLAIN ANALYZE, indici, query tuning',
                    'content' => "## Query Optimization\n\n### EXPLAIN ANALYZE\n```sql\nEXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)\nSELECT u.name, COUNT(o.id) as order_count\nFROM users u\nJOIN orders o ON o.user_id = u.id\nWHERE o.created_at > '2025-01-01'\nGROUP BY u.name\nORDER BY order_count DESC\nLIMIT 10;\n```\n\nCosa guardare:\n- **Seq Scan** vs **Index Scan**: Seq scan su tabelle grandi = problema\n- **Actual time**: Tempo reale di esecuzione\n- **Rows**: Stima vs righe reali (statistiche aggiornate?)\n- **Buffers**: Shared hit (cache) vs read (disco)\n\n### Tipi di Indice in PostgreSQL\n```sql\n-- B-Tree: default, equality e range queries\nCREATE INDEX idx_users_email ON users(email);\n\n-- Partial Index: solo per subset di dati\nCREATE INDEX idx_active_users ON users(email) WHERE active = true;\n\n-- Composite Index: multi-colonna (ordine conta!)\nCREATE INDEX idx_orders_user_date ON orders(user_id, created_at DESC);\n\n-- GIN: per array, JSONB, full-text\nCREATE INDEX idx_products_tags ON products USING GIN(tags);\n\n-- GiST: per dati geospaziali\nCREATE INDEX idx_location ON stores USING GiST(location);\n\n-- BRIN: per dati ordinati naturalmente (timestamp)\nCREATE INDEX idx_logs_time ON logs USING BRIN(created_at);\n```\n\n### Anti-Pattern da Evitare\n- SELECT * (fetch colonne non necessarie)\n- Funzioni su colonne indicizzate: `WHERE UPPER(email) = 'X'`\n- OR su colonne diverse (usa UNION)\n- NOT IN con subquery (usa NOT EXISTS)\n- Missing LIMIT in query diagnostiche"
                ],
                [
                    'title' => 'Replica, Backup e High Availability',
                    'description' => 'Strategie di replica, backup e disaster recovery',
                    'content' => "## High Availability\n\n### PostgreSQL Replication\n\n**Streaming Replication**:\n```\n[Primary] --WAL stream--> [Standby 1] (sync)\n          --WAL stream--> [Standby 2] (async)\n```\n- Synchronous: garantisce zero data loss\n- Asynchronous: migliore performance, possibile data loss\n\n**Logical Replication**:\n- Replica selettiva (tabelle specifiche)\n- Cross-version replication\n- Utile per migrazione con zero downtime\n\n### Backup Strategies\n\n**pg_dump / pg_dumpall**:\n```bash\n# Backup logico di un database\npg_dump -Fc -Z 9 mydb > backup.dump\n\n# Restore\npg_restore -d mydb backup.dump\n```\n\n**Continuous Archiving (PITR)**:\n- Base backup + WAL archiving\n- Recovery a qualsiasi punto nel tempo\n- Essenziale per database mission-critical\n```\narchive_mode = on\narchive_command = 'cp %p /archive/%f'\n```\n\n### Disaster Recovery\n- **RPO (Recovery Point Objective)**: Quanto dato puoi perdere?\n  - RPO = 0: Synchronous replication\n  - RPO < 1h: WAL archiving + streaming async\n- **RTO (Recovery Time Objective)**: Quanto tempo per il recovery?\n  - RTO < 1min: Automatic failover (Patroni)\n  - RTO < 15min: Manual failover da standby\n\n### Tools\n- **Patroni**: HA cluster PostgreSQL con leader election\n- **PgBouncer**: Connection pooling\n- **pgBackRest**: Enterprise backup solution\n- **Barman**: Backup e recovery manager"
                ],
                [
                    'title' => 'NoSQL e Database Moderni',
                    'description' => 'MongoDB, Redis, Elasticsearch, quando usare cosa',
                    'content' => "## Database NoSQL\n\n### MongoDB\nDocument database per dati semi-strutturati:\n```javascript\n// Schema flessibile\ndb.users.insertOne({\n  name: 'Marco',\n  email: 'marco@example.com',\n  addresses: [\n    { type: 'home', city: 'Milano', zip: '20100' },\n    { type: 'work', city: 'Torino', zip: '10100' }\n  ],\n  preferences: { theme: 'dark', lang: 'it' }\n});\n\n// Aggregation Pipeline\ndb.orders.aggregate([\n  { \$match: { status: 'completed' } },\n  { \$group: { _id: '\$customer_id', total: { \$sum: '\$amount' } } },\n  { \$sort: { total: -1 } },\n  { \$limit: 10 }\n]);\n```\n\n### Redis\nIn-memory key-value store:\n- **Caching**: Cache query DB (TTL-based)\n- **Session store**: Sessioni utente\n- **Rate limiting**: Token bucket algorithm\n- **Pub/Sub**: Real-time messaging\n- **Sorted Sets**: Leaderboard, timeline\n\n### Elasticsearch\nSearch engine distribuito:\n- Full-text search con relevance scoring\n- Aggregazioni real-time\n- Log analytics (ELK Stack)\n- Inverted index per ricerca veloce\n\n### Quando Usare Cosa\n| Use Case | Database |\n|----------|----------|\n| Transazioni ACID | PostgreSQL |\n| Dati relazionali complessi | PostgreSQL/MySQL |\n| Documenti flessibili | MongoDB |\n| Caching ad alta velocità | Redis |\n| Full-text search | Elasticsearch |\n| Time series | TimescaleDB/InfluxDB |\n| Grafi e relazioni | Neo4j |\n| Wide column (IoT) | Cassandra/ScyllaDB |"
                ],
                [
                    'title' => 'Sicurezza Database',
                    'description' => 'Hardening, encryption, audit e compliance',
                    'content' => "## Sicurezza Database\n\n### Access Control\n```sql\n-- Principio del minimo privilegio\nCREATE ROLE app_readonly;\nGRANT CONNECT ON DATABASE production TO app_readonly;\nGRANT USAGE ON SCHEMA public TO app_readonly;\nGRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;\n\nCREATE ROLE app_readwrite;\nGRANT app_readonly TO app_readwrite;\nGRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_readwrite;\n\n-- Row Level Security (RLS)\nALTER TABLE orders ENABLE ROW LEVEL SECURITY;\nCREATE POLICY orders_tenant_policy ON orders\n  USING (tenant_id = current_setting('app.current_tenant')::int);\n```\n\n### Encryption\n- **TDE**: Transparent Data Encryption (data at rest)\n- **SSL/TLS**: Encryption in transit\n- **Column-level**: pgcrypto per colonne sensibili\n```sql\n-- Encryption di colonne sensibili\nINSERT INTO users (email, ssn_encrypted)\nVALUES ('marco@test.com', pgp_sym_encrypt('RSSMRC90A01H501Z', 'secret_key'));\n```\n\n### SQL Injection Prevention\n```python\n# ❌ VULNERABILE\ncursor.execute(f\"SELECT * FROM users WHERE email = '{email}'\")\n\n# ✅ PREPARED STATEMENT\ncursor.execute(\"SELECT * FROM users WHERE email = %s\", (email,))\n```\n\n### Audit Logging\n- **pgAudit**: Extension per PostgreSQL\n- Log tutte le DDL e DML operations\n- Compliance: SOX, HIPAA, GDPR\n\n### Backup Security\n- Encryption dei backup (AES-256)\n- Offsite storage (3-2-1 rule)\n- Test regolari di restore\n- Access control su backup\n\n### Checklist Hardening\n1. Cambia porte default\n2. Disabilita accesso remoto non necessario\n3. Usa pg_hba.conf restrittivo\n4. Aggiorna regolarmente\n5. Monitora query lente e anomale"
                ]
            ], JSON_UNESCAPED_UNICODE),
            'Database Administrator', 'Certificazione di competenza in database administration',
            '#f97316',
            json_encode([
                'PostgreSQL è il database più richiesto dalle startup italiane: cresce del 30% anno su anno',
                'Le competenze di query optimization sono testate in quasi tutti i colloqui per ruoli backend e DBA',
                'Conoscere sia SQL che NoSQL è fondamentale: il mercato richiede profili versatili',
                'La certificazione MongoDB DBA Associate ha un ottimo ritorno in termini di opportunità',
                'Esperienza con database security e compliance GDPR è un forte differenziatore nel mercato italiano'
            ], JSON_UNESCAPED_UNICODE),
            'SQL base, concetti di sistemi operativi'
        ]
    ];

    $stmt = $db->prepare("INSERT INTO courses (title, description, category, level, duration, modules, badge_name, badge_description, badge_color, company_tips, prerequisites) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($courses as $course) {
        for ($i = 0; $i < 11; $i++) {
            $stmt->bindValue($i + 1, $course[$i]);
        }
        $stmt->execute();
        $stmt->reset();
    }
}

function seedQuizzes($db) {
    $quizzes = [
        // Quiz 1: Networking
        [1, 'Quiz Fondamenti di Networking', json_encode([
            ['question' => 'Quale livello del modello OSI è responsabile del routing dei pacchetti?', 'options' => ['Layer 2 - Data Link', 'Layer 3 - Rete', 'Layer 4 - Trasporto', 'Layer 5 - Sessione'], 'correct' => 1, 'explanation' => 'Il Layer 3 (Network/Rete) gestisce l\'indirizzamento logico (IP) e il routing dei pacchetti tra reti diverse, utilizzando protocolli come IP, OSPF e BGP.'],
            ['question' => 'Quanti host utilizzabili ha una subnet /26?', 'options' => ['30', '62', '64', '126'], 'correct' => 1, 'explanation' => 'Una subnet /26 ha 6 bit per gli host: 2^6 = 64 indirizzi totali, meno l\'indirizzo di rete e il broadcast = 62 host utilizzabili.'],
            ['question' => 'Quale protocollo utilizza il three-way handshake (SYN, SYN-ACK, ACK)?', 'options' => ['UDP', 'TCP', 'ICMP', 'ARP'], 'correct' => 1, 'explanation' => 'TCP (Transmission Control Protocol) è connection-oriented e stabilisce la connessione tramite un three-way handshake prima di trasferire dati.'],
            ['question' => 'Quale tipo di record DNS mappa un nome di dominio a un indirizzo IPv4?', 'options' => ['AAAA', 'CNAME', 'A', 'MX'], 'correct' => 2, 'explanation' => 'Il record A (Address) mappa un nome di dominio a un indirizzo IPv4. AAAA è per IPv6, CNAME è per alias, MX è per mail server.'],
            ['question' => 'Nel processo DHCP, qual è l\'ordine corretto delle fasi?', 'options' => ['Request, Discover, Offer, Acknowledge', 'Discover, Offer, Request, Acknowledge', 'Offer, Discover, Acknowledge, Request', 'Discover, Request, Offer, Acknowledge'], 'correct' => 1, 'explanation' => 'Il processo DHCP segue l\'acronimo DORA: Discover (client cerca server), Offer (server propone IP), Request (client accetta), Acknowledge (server conferma).'],
            ['question' => 'Quale protocollo di routing utilizza l\'algoritmo di Dijkstra per calcolare il percorso più breve?', 'options' => ['RIP', 'BGP', 'OSPF', 'EIGRP'], 'correct' => 2, 'explanation' => 'OSPF (Open Shortest Path First) è un protocollo link-state che utilizza l\'algoritmo SPF (Shortest Path First) di Dijkstra per calcolare il percorso ottimale.'],
            ['question' => 'Quale range di indirizzi IPv4 privati appartiene alla Classe A (RFC 1918)?', 'options' => ['172.16.0.0/12', '192.168.0.0/16', '10.0.0.0/8', '169.254.0.0/16'], 'correct' => 2, 'explanation' => 'La rete 10.0.0.0/8 è l\'indirizzo privato di Classe A (RFC 1918). 172.16.0.0/12 è Classe B, 192.168.0.0/16 è Classe C. 169.254.0.0/16 è APIPA (link-local).'],
            ['question' => 'Cosa fa una porta trunk su uno switch?', 'options' => ['Connette solo dispositivi di una VLAN', 'Trasporta traffico di multiple VLAN usando 802.1Q tagging', 'Blocca tutto il traffico VLAN', 'Gestisce solo traffico di management'], 'correct' => 1, 'explanation' => 'Una porta trunk trasporta frame di più VLAN contemporaneamente usando il protocollo 802.1Q che aggiunge un tag al frame Ethernet per identificare la VLAN di appartenenza.'],
            ['question' => 'Quale tipo di NAT permette a più indirizzi privati di condividere un singolo IP pubblico usando numeri di porta diversi?', 'options' => ['Static NAT', 'Dynamic NAT', 'PAT (Port Address Translation)', 'DNAT'], 'correct' => 2, 'explanation' => 'PAT (Port Address Translation), anche noto come NAT Overload, mappa più indirizzi interni a un singolo IP pubblico differenziando le connessioni tramite numeri di porta univoci.'],
            ['question' => 'In IPv6, quale prefisso indica un indirizzo link-local?', 'options' => ['2001::/3', 'fc00::/7', 'fe80::/10', 'ff00::/8'], 'correct' => 2, 'explanation' => 'Gli indirizzi link-local IPv6 usano il prefisso fe80::/10. Sono auto-configurati e validi solo nel segmento di rete locale, simili all\'APIPA in IPv4.']
        ], JSON_UNESCAPED_UNICODE), 70],

        // Quiz 2: Cybersecurity
        [2, 'Quiz Cybersecurity Essentials', json_encode([
            ['question' => 'Quale algoritmo di crittografia simmetrica è lo standard attuale con chiavi di 128/192/256 bit?', 'options' => ['RSA', 'AES', '3DES', 'Blowfish'], 'correct' => 1, 'explanation' => 'AES (Advanced Encryption Standard) è lo standard attuale di crittografia simmetrica, adottato dal NIST nel 2001. Supporta chiavi di 128, 192 e 256 bit.'],
            ['question' => 'Quale voce dell\'OWASP Top 10 (2021) è al primo posto?', 'options' => ['Injection', 'Broken Access Control', 'Cryptographic Failures', 'Security Misconfiguration'], 'correct' => 1, 'explanation' => 'Broken Access Control è al primo posto nell\'OWASP Top 10 2021, superando Injection che era primo nel 2017. Include IDOR, privilege escalation e bypass dei controlli di accesso.'],
            ['question' => 'Cosa garantisce la Perfect Forward Secrecy (PFS)?', 'options' => ['Che i messaggi non possono essere modificati', 'Che la compromissione della chiave privata non compromette sessioni passate', 'Che l\'autenticazione è sempre verificata', 'Che i log non possono essere alterati'], 'correct' => 1, 'explanation' => 'PFS utilizza chiavi di sessione effimere (ECDHE) per ogni connessione TLS. Se la chiave privata del server viene compromessa, le sessioni passate registrate rimangono protette.'],
            ['question' => 'In un Penetration Test, quale fase include l\'uso di Nmap per la scansione delle porte?', 'options' => ['Reconnaissance passiva', 'Scanning & Enumeration', 'Exploitation', 'Post-Exploitation'], 'correct' => 1, 'explanation' => 'La fase di Scanning & Enumeration include la scansione attiva delle porte (Nmap), la discovery dei servizi e delle versioni, e l\'identificazione delle vulnerabilità.'],
            ['question' => 'Quale framework definisce le 5 funzioni core: Identify, Protect, Detect, Respond, Recover?', 'options' => ['ISO 27001', 'NIST Cybersecurity Framework', 'OWASP', 'CIS Controls'], 'correct' => 1, 'explanation' => 'Il NIST Cybersecurity Framework definisce 5 funzioni core che forniscono una vista strategica del ciclo di vita della gestione del rischio cyber.'],
            ['question' => 'Quanto tempo ha un\'organizzazione per notificare un data breach all\'autorità garante secondo il GDPR?', 'options' => ['24 ore', '48 ore', '72 ore', '7 giorni'], 'correct' => 2, 'explanation' => 'L\'articolo 33 del GDPR richiede la notifica all\'autorità di controllo competente entro 72 ore dalla scoperta del breach, salvo che la violazione non presenti rischi per i diritti delle persone.'],
            ['question' => 'Quale algoritmo è raccomandato per l\'hashing delle password?', 'options' => ['MD5', 'SHA-256', 'Argon2', 'AES-256'], 'correct' => 2, 'explanation' => 'Argon2 (vincitore del Password Hashing Competition 2015) è l\'algoritmo raccomandato per password hashing. Include salt automatico e parametri di costo (memoria e CPU) configurabili. bcrypt e scrypt sono alternative accettabili.'],
            ['question' => 'Cosa sono gli Indicatori di Compromissione (IoC)?', 'options' => ['Metriche di performance del sistema', 'Artefatti che indicano una potenziale compromissione (IP, hash, domini)', 'KPI per il team di sicurezza', 'Vulnerabilità note nei sistemi'], 'correct' => 1, 'explanation' => 'Gli IoC sono artefatti forensi che indicano una compromissione: indirizzi IP malevoli, hash di malware, domini C2, pattern di traffico anomali. Sono usati per threat intelligence e detection.'],
            ['question' => 'Nel modello Zero Trust, quale principio fondamentale viene applicato?', 'options' => ['Trust but verify', 'Security through obscurity', 'Never trust, always verify', 'Implicit trust within the network'], 'correct' => 2, 'explanation' => 'Zero Trust si basa sul principio "Never trust, always verify": nessun utente, dispositivo o rete è considerato fidato per default. Richiede verifica continua, MFA e micro-segmentazione.'],
            ['question' => 'Quale tipo di malware cifra i dati della vittima e richiede un riscatto per la decifrazione?', 'options' => ['Trojan', 'Rootkit', 'Ransomware', 'Spyware'], 'correct' => 2, 'explanation' => 'Il Ransomware cifra i file della vittima con crittografia forte e richiede un pagamento (solitamente in criptovaluta) per fornire la chiave di decifrazione. Esempi: WannaCry, LockBit, REvil.']
        ], JSON_UNESCAPED_UNICODE), 70],

        // Quiz 3: Cloud & DevOps
        [3, 'Quiz Cloud Computing & DevOps', json_encode([
            ['question' => 'Quale modello di servizio cloud fornisce macchine virtuali, storage e networking?', 'options' => ['SaaS', 'PaaS', 'IaaS', 'FaaS'], 'correct' => 2, 'explanation' => 'IaaS (Infrastructure as a Service) fornisce risorse infrastrutturali virtualizzate: compute (VM), storage e networking. Esempi: AWS EC2, Azure VMs, GCP Compute Engine.'],
            ['question' => 'In Kubernetes, quale componente del Control Plane mantiene lo stato del cluster?', 'options' => ['API Server', 'etcd', 'Scheduler', 'kubelet'], 'correct' => 1, 'explanation' => 'etcd è un key-value store distribuito che mantiene tutto lo stato del cluster Kubernetes, incluse configurazioni, secrets e lo stato delle risorse.'],
            ['question' => 'Quale comando Terraform mostra le modifiche pianificate prima dell\'applicazione?', 'options' => ['terraform init', 'terraform plan', 'terraform apply', 'terraform validate'], 'correct' => 1, 'explanation' => 'terraform plan analizza la configurazione e mostra un\'anteprima delle risorse che verranno create, modificate o distrutte, senza effettuare alcuna modifica reale.'],
            ['question' => 'In un Dockerfile, quale istruzione permette di creare immagini più piccole separando build e runtime?', 'options' => ['FROM ... AS builder (multi-stage)', 'RUN --mount=type=cache', 'COPY --chown', 'HEALTHCHECK'], 'correct' => 0, 'explanation' => 'Il multi-stage build usa più istruzioni FROM con alias (AS builder) per separare l\'ambiente di compilazione da quello di runtime, riducendo significativamente la dimensione dell\'immagine finale.'],
            ['question' => 'Quale servizio AWS è un object storage con classi di storage multiple?', 'options' => ['EBS', 'EFS', 'S3', 'FSx'], 'correct' => 2, 'explanation' => 'Amazon S3 (Simple Storage Service) è un object storage scalabile con diverse classi: Standard, Intelligent-Tiering, Infrequent Access (IA), Glacier per archivio a lungo termine.'],
            ['question' => 'In Kubernetes, quale tipo di Service espone i pod con un IP stabile interno al cluster?', 'options' => ['NodePort', 'LoadBalancer', 'ClusterIP', 'ExternalName'], 'correct' => 2, 'explanation' => 'ClusterIP è il tipo di Service default in Kubernetes. Espone il servizio su un IP interno al cluster, accessibile solo dall\'interno. NodePort e LoadBalancer sono per accesso esterno.'],
            ['question' => 'Quale query PromQL calcola il rate di richieste HTTP negli ultimi 5 minuti?', 'options' => ['sum(http_requests_total)', 'rate(http_requests_total[5m])', 'increase(http_requests_total)', 'avg(http_requests_total[5m])'], 'correct' => 1, 'explanation' => 'rate() calcola il tasso di incremento per secondo di un counter su un intervallo di tempo. rate(http_requests_total[5m]) restituisce il numero medio di richieste al secondo negli ultimi 5 minuti.'],
            ['question' => 'Cosa sono gli SLO in ambito SRE?', 'options' => ['Service Level Outages', 'Service Level Objectives - target di affidabilità', 'System Load Optimization', 'Service Log Operations'], 'correct' => 1, 'explanation' => 'SLO (Service Level Objectives) sono target interni di affidabilità basati su SLI misurabili. Esempio: 99.9% delle richieste devono avere latenza < 200ms. Sono più stringenti degli SLA contrattuali.'],
            ['question' => 'Quale strategia di deployment aggiorna gradualmente le istanze sostituendo quelle vecchie?', 'options' => ['Blue/Green', 'Canary', 'Rolling Update', 'Recreate'], 'correct' => 2, 'explanation' => 'Rolling Update sostituisce gradualmente le istanze vecchie con quelle nuove, mantenendo il servizio disponibile durante l\'aggiornamento. È la strategia default dei Kubernetes Deployments.'],
            ['question' => 'Quale tool gestisce il provisioning automatico di certificati TLS gratuiti?', 'options' => ['HashiCorp Vault', 'Let\'s Encrypt con ACME protocol', 'AWS Certificate Manager', 'OpenSSL'], 'correct' => 1, 'explanation' => 'Let\'s Encrypt è una CA gratuita che usa il protocollo ACME per automatizzare l\'emissione e il rinnovo di certificati TLS/SSL. cert-manager in Kubernetes integra Let\'s Encrypt nativamente.']
        ], JSON_UNESCAPED_UNICODE), 70],

        // Quiz 4: Full-Stack Development
        [4, 'Quiz Full-Stack Web Development', json_encode([
            ['question' => 'Quale hook React evita re-render non necessari memoizzando il risultato di un calcolo costoso?', 'options' => ['useEffect', 'useMemo', 'useCallback', 'useRef'], 'correct' => 1, 'explanation' => 'useMemo memoizza il risultato di un calcolo, ricalcolandolo solo quando le dipendenze cambiano. useCallback è simile ma per funzioni, useRef per riferimenti persistenti, useEffect per side effects.'],
            ['question' => 'In un\'API REST, quale status code HTTP indica che una risorsa è stata creata con successo?', 'options' => ['200 OK', '201 Created', '204 No Content', '202 Accepted'], 'correct' => 1, 'explanation' => '201 Created indica che la richiesta è stata soddisfatta e ha portato alla creazione di una nuova risorsa. È la risposta corretta per POST che creano risorse.'],
            ['question' => 'Quale tecnica previene gli attacchi SQL Injection?', 'options' => ['Input validation con regex', 'Prepared statements / parametrized queries', 'Encoding dell\'output', 'CORS headers'], 'correct' => 1, 'explanation' => 'I prepared statements (query parametrizzate) separano il codice SQL dai dati, rendendo impossibile l\'injection. L\'input validation è una difesa aggiuntiva ma non sufficiente da sola.'],
            ['question' => 'In TypeScript, quale utility type rende tutti i campi di un tipo opzionali?', 'options' => ['Required<T>', 'Partial<T>', 'Pick<T, K>', 'Omit<T, K>'], 'correct' => 1, 'explanation' => 'Partial<T> costruisce un tipo con tutte le proprietà di T impostate come opzionali. È utile per update parziali. Required<T> fa l\'opposto, rendendo tutto obbligatorio.'],
            ['question' => 'Quale approccio di paginazione è più efficiente per dataset molto grandi?', 'options' => ['Offset-based (LIMIT/OFFSET)', 'Cursor-based (keyset pagination)', 'Page number-based', 'Nessuna differenza significativa'], 'correct' => 1, 'explanation' => 'Cursor-based pagination usa l\'ultimo elemento visto come punto di riferimento (WHERE id > last_id LIMIT 20), evitando il costo O(n) dell\'OFFSET che deve scorrere tutti i record precedenti.'],
            ['question' => 'Quale metrica Core Web Vital misura la stabilità visuale della pagina?', 'options' => ['LCP (Largest Contentful Paint)', 'FID (First Input Delay)', 'CLS (Cumulative Layout Shift)', 'TTFB (Time to First Byte)'], 'correct' => 2, 'explanation' => 'CLS (Cumulative Layout Shift) misura la stabilità visuale quantificando quanto gli elementi si spostano durante il caricamento. Un CLS < 0.1 è considerato buono.'],
            ['question' => 'Cosa fa React.lazy() insieme a Suspense?', 'options' => ['Lazy evaluation delle props', 'Code splitting: carica componenti on-demand', 'Rendering ritardato per performance', 'Memorizzazione lazy dei componenti'], 'correct' => 1, 'explanation' => 'React.lazy() permette il code splitting a livello di componente, caricando il bundle del componente solo quando viene renderizzato. Suspense mostra un fallback durante il caricamento.'],
            ['question' => 'In JWT, dove dovrebbe essere memorizzato il refresh token in un\'applicazione web?', 'options' => ['localStorage', 'sessionStorage', 'HttpOnly cookie', 'URL query parameter'], 'correct' => 2, 'explanation' => 'I refresh token dovrebbero essere memorizzati in HttpOnly cookies, inaccessibili a JavaScript e quindi protetti da attacchi XSS. localStorage e sessionStorage sono vulnerabili a XSS.'],
            ['question' => 'Quale pattern risolve il problema della comunicazione asincrona tra microservizi?', 'options' => ['REST API calls', 'Message Queue (RabbitMQ, Kafka)', 'GraphQL subscriptions', 'Polling periodico'], 'correct' => 1, 'explanation' => 'Le Message Queue permettono comunicazione asincrona affidabile tra microservizi: il producer invia messaggi alla queue, il consumer li processa al proprio ritmo, garantendo decoupling e resilienza.'],
            ['question' => 'Quale tool fornisce analisi statica del codice e metriche di qualità?', 'options' => ['Jest', 'Webpack', 'SonarQube', 'Storybook'], 'correct' => 2, 'explanation' => 'SonarQube esegue analisi statica del codice rilevando bug, vulnerabilità, code smells e misurando la copertura dei test. È integrato nelle pipeline CI/CD per quality gates.']
        ], JSON_UNESCAPED_UNICODE), 70],

        // Quiz 5: Data Science & ML
        [5, 'Quiz Data Science & Machine Learning', json_encode([
            ['question' => 'Quale metrica è più appropriata per un dataset di classificazione fortemente sbilanciato?', 'options' => ['Accuracy', 'F1-Score', 'Mean Squared Error', 'R-squared'], 'correct' => 1, 'explanation' => 'Con dataset sbilanciati, l\'accuracy è fuorviante (un classificatore che predice sempre la classe maggioritaria avrebbe alta accuracy). F1-Score bilancia Precision e Recall, fornendo una metrica più significativa.'],
            ['question' => 'Quale tecnica previene l\'overfitting in un modello di machine learning?', 'options' => ['Aumentare il numero di feature', 'Cross-validation e regularizzazione', 'Rimuovere il set di validazione', 'Aumentare la complessità del modello'], 'correct' => 1, 'explanation' => 'Cross-validation valuta la generalizzazione del modello su dati non visti. La regularizzazione (L1/L2) penalizza la complessità del modello. Altre tecniche: early stopping, dropout, data augmentation.'],
            ['question' => 'In una Convolutional Neural Network, cosa fa il layer di Max Pooling?', 'options' => ['Aumenta la dimensione spaziale', 'Riduce la dimensione spaziale mantenendo le feature più importanti', 'Normalizza i valori di attivazione', 'Connette tutti i neuroni tra loro'], 'correct' => 1, 'explanation' => 'Max Pooling riduce la dimensione spaziale delle feature maps selezionando il valore massimo in ogni finestra. Questo riduce i parametri, il costo computazionale e fornisce invarianza alla traslazione.'],
            ['question' => 'Quale algoritmo è generalmente il top performer per dati tabulari strutturati?', 'options' => ['Deep Neural Network', 'Gradient Boosting (XGBoost/LightGBM)', 'Support Vector Machine', 'K-Nearest Neighbors'], 'correct' => 1, 'explanation' => 'Gradient Boosting (XGBoost, LightGBM, CatBoost) è consistentemente il top performer per dati tabulari, sia in competizioni Kaggle che in produzione aziendale. Le deep neural networks eccellono più su dati non strutturati (immagini, testo).'],
            ['question' => 'Cosa misura il data drift nel monitoring di un modello ML in produzione?', 'options' => ['Degradazione della velocità di inferenza', 'Cambiamento nella distribuzione dei dati di input rispetto al training', 'Aumento del numero di richieste', 'Errori nel preprocessing'], 'correct' => 1, 'explanation' => 'Il data drift si verifica quando la distribuzione statistica dei dati di input in produzione diverge da quella dei dati di training, causando degradazione delle performance del modello nel tempo.'],
            ['question' => 'Quale architettura ha rivoluzionato il NLP grazie al meccanismo di self-attention?', 'options' => ['LSTM', 'Convolutional Neural Network', 'Transformer', 'Autoencoder'], 'correct' => 2, 'explanation' => 'L\'architettura Transformer (Vaswani et al., 2017 - "Attention is All You Need") ha rivoluzionato il NLP grazie al meccanismo di self-attention che permette di elaborare sequenze in parallelo, catturando dipendenze a lungo raggio.'],
            ['question' => 'A che serve la feature StandardScaler in scikit-learn?', 'options' => ['Normalizza le feature a media 0 e deviazione standard 1', 'Seleziona le feature più importanti', 'Codifica variabili categoriche', 'Riduce la dimensionalità dei dati'], 'correct' => 0, 'explanation' => 'StandardScaler standardizza le feature sottraendo la media e dividendo per la deviazione standard (z-score). È essenziale per algoritmi sensibili alla scala come SVM, KNN e reti neurali.'],
            ['question' => 'Quale tool viene utilizzato per tracking degli esperimenti ML con logging di parametri e metriche?', 'options' => ['Jupyter Notebook', 'MLflow', 'Docker', 'Git'], 'correct' => 1, 'explanation' => 'MLflow è la piattaforma standard per experiment tracking in ML. Permette di loggare parametri, metriche, artefatti e modelli, confrontare esperimenti e gestire il ciclo di vita dei modelli.'],
            ['question' => 'Quale tecnica di validazione è consigliata per dataset di dimensioni limitate?', 'options' => ['Holdout 80/20', 'K-Fold Cross Validation', 'Bootstrap sampling', 'Nessuna validazione necessaria'], 'correct' => 1, 'explanation' => 'K-Fold Cross Validation divide il dataset in K parti, usa K-1 per il training e 1 per la validazione, ripetendo K volte. Fornisce una stima più robusta della performance con dataset limitati rispetto al semplice holdout.'],
            ['question' => 'Cos\'è il problema N+1 in un contesto di data engineering?', 'options' => ['Un errore di indice negli array', 'Eseguire N query aggiuntive per recuperare dati correlati anziché usare JOIN', 'Avere N+1 tabelle nel database', 'Un limite di connessioni simultanee'], 'correct' => 1, 'explanation' => 'Il problema N+1 si verifica quando si esegue 1 query per ottenere una lista di N elementi, poi N query aggiuntive per recuperare i dati correlati di ciascuno. Si risolve con JOIN, eager loading o batch loading.']
        ], JSON_UNESCAPED_UNICODE), 70],

        // Quiz 6: Database Administration
        [6, 'Quiz Database Administration', json_encode([
            ['question' => 'La Terza Forma Normale (3NF) richiede l\'eliminazione di quali dipendenze?', 'options' => ['Dipendenze funzionali', 'Dipendenze parziali', 'Dipendenze transitive', 'Dipendenze multivalore'], 'correct' => 2, 'explanation' => 'La 3NF richiede che ogni attributo non-chiave dipenda direttamente e unicamente dalla chiave primaria, eliminando le dipendenze transitive (A→B→C dove C dipende da A solo attraverso B).'],
            ['question' => 'Quale tipo di indice PostgreSQL è ottimale per colonne JSONB e array?', 'options' => ['B-Tree', 'GIN (Generalized Inverted Index)', 'GiST', 'BRIN'], 'correct' => 1, 'explanation' => 'GIN (Generalized Inverted Index) è ottimizzato per valori compositi come array, JSONB e full-text search. Mantiene un indice invertito che mappa ogni valore alle righe che lo contengono.'],
            ['question' => 'In PostgreSQL, cosa fa EXPLAIN ANALYZE?', 'options' => ['Analizza la struttura delle tabelle', 'Esegue la query e mostra il piano di esecuzione reale con tempi', 'Ottimizza automaticamente la query', 'Verifica la sintassi SQL'], 'correct' => 1, 'explanation' => 'EXPLAIN ANALYZE esegue effettivamente la query e confronta le stime del planner con i risultati reali, mostrando tempo di esecuzione, righe processate e uso dei buffer per ogni nodo del piano.'],
            ['question' => 'Quale livello di isolamento delle transazioni previene phantom reads?', 'options' => ['READ UNCOMMITTED', 'READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE'], 'correct' => 3, 'explanation' => 'SERIALIZABLE è l\'unico livello che previene tutti i fenomeni: dirty reads, non-repeatable reads e phantom reads. In PostgreSQL, REPEATABLE READ previene anche i phantom reads grazie all\'implementazione MVCC.'],
            ['question' => 'Cosa garantisce la streaming replication sincrona in PostgreSQL?', 'options' => ['Migliore performance di scrittura', 'Zero data loss (RPO = 0) anche in caso di crash del primario', 'Distribuzione automatica del carico di lettura', 'Failover automatico senza tool esterni'], 'correct' => 1, 'explanation' => 'La streaming replication sincrona garantisce che ogni transazione committata sia stata replicata su almeno uno standby prima della conferma al client, assicurando RPO = 0 (zero data loss).'],
            ['question' => 'Quale anti-pattern SQL causa degradazione performance con dataset crescenti?', 'options' => ['Uso di indici compositi', 'SELECT * in query di produzione', 'Uso di prepared statements', 'Connection pooling'], 'correct' => 1, 'explanation' => 'SELECT * recupera tutte le colonne incluse quelle non necessarie, impedendo l\'uso di covering index, aumentando I/O e traffico di rete. In produzione, specificare sempre le colonne necessarie.'],
            ['question' => 'In MongoDB, quale operazione dell\'Aggregation Pipeline filtra i documenti?', 'options' => ['$group', '$project', '$match', '$sort'], 'correct' => 2, 'explanation' => '$match filtra i documenti in base a condizioni, simile a WHERE in SQL. Per performance ottimale, $match dovrebbe essere posizionato nella pipeline il più presto possibile per ridurre i documenti processati.'],
            ['question' => 'Quale strategia di backup consente il Point-In-Time Recovery (PITR)?', 'options' => ['pg_dump giornaliero', 'Base backup + continuous WAL archiving', 'Snapshot dello storage', 'Logical replication'], 'correct' => 1, 'explanation' => 'PITR richiede un base backup fisico combinato con l\'archiviazione continua dei WAL (Write-Ahead Log). Questo permette il recovery a qualsiasi punto nel tempo tra il backup e l\'ultimo WAL archiviato.'],
            ['question' => 'Quale database è più appropriato per implementare una cache ad alta velocità con TTL?', 'options' => ['PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch'], 'correct' => 2, 'explanation' => 'Redis è un in-memory data store ottimizzato per letture/scritture ad altissima velocità (sub-millisecondo). Supporta TTL nativo per auto-expire delle chiavi, rendendolo ideale per caching.'],
            ['question' => 'Quale tecnica di sicurezza PostgreSQL permette di limitare l\'accesso a livello di singola riga?', 'options' => ['GRANT/REVOKE', 'Row Level Security (RLS)', 'SSL/TLS', 'pg_hba.conf'], 'correct' => 1, 'explanation' => 'Row Level Security (RLS) permette di definire policy che filtrano le righe visibili a ciascun utente. Esempio: un tenant vede solo i propri dati in un database multi-tenant, senza query aggiuntive nell\'applicazione.']
        ], JSON_UNESCAPED_UNICODE), 70]
    ];

    $stmt = $db->prepare("INSERT INTO quizzes (course_id, title, questions, passing_score) VALUES (?, ?, ?, ?)");
    foreach ($quizzes as $quiz) {
        for ($i = 0; $i < 4; $i++) {
            $stmt->bindValue($i + 1, $quiz[$i]);
        }
        $stmt->execute();
        $stmt->reset();
    }
}
