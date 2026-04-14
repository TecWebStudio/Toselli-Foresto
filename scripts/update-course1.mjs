/**
 * Migration script: Update Course 1 and Quiz 1 with new content
 * from "Corso Base di Reti – Versione Estesa" PDF
 *
 * Run: node scripts/update-course1.mjs
 */

import { createClient } from '@libsql/client';
import { config } from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env.local') });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// ============================================================
// NEW COURSE 1 DATA
// ============================================================

const newCourseTitle = 'Corso Base di Reti';
const newCourseDescription = "Corso approfondito sui fondamenti del networking, con attenzione ai concetti richiesti per CompTIA Network+ e Cisco CCNA, ma con un taglio pratico orientato alla realtà aziendale e domestica. L'obiettivo è comprendere come i dati si muovono nella rete, come sono strutturati indirizzi e protocolli, e come leggere diagrammi di rete reali.";
const newCourseLevel = 'beginner';
const newCourseDuration = '40 ore';

const newModules = [
  {
    title: 'Concetti base di rete',
    description: 'Che cos\'è una rete, LAN/WAN/MAN, componenti principali, pacchetti e PDU',
    content: `## Che cos'è una rete

Una rete di computer è un insieme di dispositivi (host) collegati tra loro tramite mezzi fisici o wireless che scambiano dati seguendo regole precise chiamate **protocolli**.

Gli host tipici includono PC, server, stampanti di rete, smartphone, tablet, telecamere IP, sistemi di controllo industriale, router, switch e access point Wi-Fi.

Lo scopo principale di una rete è permettere la **condivisione di risorse** (file, applicazioni, stampanti, connessione a Internet) e la **comunicazione** tra persone e sistemi in modo rapido, affidabile e controllabile.

Nell'ambito aziendale le reti sono fondamentali per applicazioni come posta elettronica, gestionali, VoIP, videoconferenze, accesso remoto e servizi cloud.

## LAN, WAN, MAN e Internet

Le reti sono spesso classificate in base all'estensione geografica:

- **LAN (Local Area Network)**: rete locale che copre un'area limitata come una casa, un ufficio, un laboratorio.
- **MAN (Metropolitan Area Network)**: rete che copre un'area urbana o metropolitana, spesso realizzata da operatori per collegare più sedi in una città.
- **WAN (Wide Area Network)**: rete che collega sedi geograficamente distanti, tipicamente supportata da linee dedicate, collegamenti MPLS, VPN su Internet o reti degli operatori.
- **Internet**: la rete di reti globale basata sulla suite di protocolli TCP/IP che interconnette milioni di reti private, pubbliche, universitarie e governative.

Una tipica azienda può avere più LAN interne collegate tra loro e con altre sedi tramite una WAN, e poi connessa a Internet attraverso uno o più router di frontiera.

La distinzione principale tra LAN e WAN riguarda la proprietà e il controllo dei mezzi trasmissivi: la LAN è di solito completamente gestita dall'azienda, mentre la WAN spesso usa collegamenti forniti da carrier esterni.

## Componenti principali di una rete

In una rete semplice si ritrovano tipicamente:

- **Host**: dispositivi finali che originano o consumano dati (PC, server, smartphone, stampanti di rete).
- **Dispositivi di rete intermedi**: switch, router, firewall, access point che instradano o filtrano il traffico.
- **Mezzi trasmissivi**: cavi in rame (Ethernet), fibra ottica, Wi-Fi, collegamenti cellulari.
- **Servizi di rete**: DNS, DHCP, directory, server applicativi, sistemi di autenticazione e logging.

Il comportamento complessivo di una rete dipende dalla combinazione di questi elementi e dalla configurazione dei loro protocolli.

## Concetto di pacchetto e PDU

Per trasmettere dati in rete, le informazioni vengono scomposte in unità logiche chiamate **PDU (Protocol Data Unit)**, che cambiano nome a seconda del livello OSI o TCP/IP a cui ci si riferisce.

Nel modello TCP/IP i dati dell'applicazione vengono incapsulati in segmenti TCP o datagrammi UDP, poi in pacchetti IP e infine in frame Ethernet o Wi-Fi.

Ogni PDU contiene un **header** (con informazioni di controllo come indirizzi, numeri di porta, campi di controllo errori) e un **payload** (i dati utili dell'applicazione).

Il processo di aggiunta progressiva di header lungo i livelli è chiamato **incapsulamento**, mentre la rimozione in ricezione è chiamata **disincapsulamento**.`
  },
  {
    title: 'Modello OSI',
    description: 'Il modello a 7 livelli, PDU per livello e uso nel troubleshooting',
    content: `## Obiettivo del modello OSI

Il modello OSI (Open Systems Interconnection) è un modello di riferimento a 7 livelli sviluppato dall'ISO per standardizzare la comunicazione tra sistemi di rete di vendor diversi.

Non è un protocollo in sé, ma un linguaggio concettuale per descrivere cosa succede in ogni fase della comunicazione e per separare responsabilità e funzioni nei sistemi di rete.

Il modello OSI aiuta a progettare reti modulari, a individuare i problemi (troubleshooting) e a ragionare sull'interazione tra protocolli a diversi livelli.

Molti esami e certificazioni usano l'OSI come base teorica, anche se le reti reali seguono più direttamente il modello TCP/IP.

## I 7 livelli OSI nel dettaglio

**1. Physical (Fisico) – livello 1**
Gestisce la trasmissione di bit sul mezzo fisico: caratteristiche elettriche, ottiche o radio, tipo di connettori, codifica del segnale, velocità e topologie fisiche.
Esempi: cavi in rame UTP, fibra ottica, connettori RJ-45, standard Ethernet a livello fisico (10BASE-T, 100BASE-TX, 1000BASE-T).

**2. Data Link (Collegamento dati) – livello 2**
Si occupa di incapsulare i pacchetti di livello 3 in frame e di gestire l'indirizzamento fisico tramite **MAC address**, controllo di errore locale e accesso al mezzo.
Include due sotto-livelli: MAC (Media Access Control) e LLC (Logical Link Control); Ethernet e Wi-Fi sono esempi di protocolli di livello 2.

**3. Network (Rete) – livello 3**
Fornisce instradamento tra reti diverse utilizzando indirizzi logici (tipicamente gli indirizzi IP).
I router operano a questo livello e decidono il percorso dei pacchetti attraverso la rete usando tabelle di routing e protocolli come OSPF o BGP.

**4. Transport (Trasporto) – livello 4**
Realizza la comunicazione end-to-end tra applicazioni, gestendo il controllo di errore, la ritrasmissione e l'ordinamento dei segmenti (nel caso di TCP) oppure fornendo un trasporto leggero e non affidabile (UDP).
Introduce il concetto di **porte logiche** (es. 80 per HTTP, 443 per HTTPS) che permettono di distinguere diverse applicazioni sullo stesso host.

**5. Session (Sessione) – livello 5**
Gestisce la creazione, il mantenimento e la chiusura delle sessioni di comunicazione tra applicazioni, inclusa la sincronizzazione e il controllo del dialogo.
Molte di queste funzioni sono oggi assorbite e realizzate da protocolli di livelli superiori o direttamente dal livello Transport.

**6. Presentation (Presentazione) – livello 6**
Si occupa del formato dei dati, della codifica, della cifratura e della compressione, fornendo una "vista" coerente alle applicazioni indipendentemente da come i dati sono rappresentati internamente.
Esempi: conversione tra set di caratteri, formati binari, uso di TLS/SSL per cifrare dati applicativi.

**7. Application (Applicazione) – livello 7**
È il livello più vicino all'utente e contiene i protocolli che forniscono servizi applicativi come HTTP, HTTPS, FTP, SMTP, DNS.
Qui non risiede l'applicazione in sé, ma i protocolli che la supportano nello scambio di dati attraverso la rete.

## PDU per livello OSI

Ogni livello tratta l'unità di dati con un nome specifico:

- Livello 1: **bit**
- Livello 2: **frame**
- Livello 3: **packet**
- Livello 4: **segment** (per TCP) o **datagram** (per UDP)
- Livelli 5–7: **dati** (data)

Questa nomenclatura aiuta a ragionare su dove avvengono gli errori e a quale livello intervenire per risolverli.

## Uso del modello OSI nel troubleshooting

Quando una comunicazione fallisce, è possibile adottare un approccio dal basso verso l'alto o dall'alto verso il basso usando i livelli OSI.

Ad esempio, se un sito web non si apre, si può verificare prima la connettività fisica (cavo, Wi-Fi), poi l'indirizzo IP e il gateway, quindi la risoluzione DNS, e infine il servizio HTTP sul server.

In questo modo si riduce il problema a un livello specifico, facilitando la diagnosi e la comunicazione tra tecnici.`
  },
  {
    title: 'Modello TCP/IP e incapsulamento',
    description: 'Struttura a 4 livelli, mappatura con OSI, incapsulamento e disincapsulamento',
    content: `## Struttura del modello TCP/IP

Il modello TCP/IP descrive la suite di protocolli usata su Internet e nelle reti moderne e si articola comunemente in 4 livelli.

Questi livelli sono: Application, Transport, Internet e Network Access (o Link), ciascuno corrispondente a un insieme di funzioni del modello OSI.

- **Application**: comprende protocolli come HTTP, HTTPS, FTP, SMTP, DNS, che offrono servizi applicativi agli utenti.
- **Transport**: include i protocolli TCP e UDP, che gestiscono il trasporto end-to-end dei dati tra applicazioni.
- **Internet**: comprende IP, ICMP, ARP e altri protocolli responsabili dell'instradamento logico dei pacchetti.
- **Network Access (Link)**: raggruppa i protocolli di livello 2 e 1 OSI, come Ethernet e Wi-Fi, che permettono la trasmissione fisica dei frame.

## Mappatura OSI–TCP/IP

Una mappatura approssimativa tra OSI e TCP/IP è la seguente:

- OSI livelli 7, 6, 5 ↔ **Application** TCP/IP
- OSI livello 4 ↔ **Transport** TCP/IP
- OSI livello 3 ↔ **Internet** TCP/IP
- OSI livelli 2 e 1 ↔ **Network Access** TCP/IP

Questa mappatura aiuta a tradurre ragionamenti teorici OSI in contesti pratici basati su protocollo IP e su Ethernet.

## Incapsulamento e disincapsulamento

Quando un'applicazione invia dati, ogni livello aggiunge il proprio header e talvolta un trailer, incapsulando la PDU del livello superiore nella propria PDU.

Per una richiesta HTTP tipica il flusso è il seguente:

1. L'applicazione genera i dati HTTP (Application).
2. TCP li incapsula in segmenti, aggiungendo numeri di porta e meccanismi di controllo (Transport).
3. IP incapsula i segmenti in pacchetti, inserendo indirizzi IP sorgente e destinazione (Internet).
4. Ethernet incapsula i pacchetti in frame con indirizzi MAC e informazioni di controllo (Network Access).
5. I frame sono convertiti in bit e trasmessi sul mezzo fisico.

Sul lato ricevente, il processo è invertito: il frame viene ricevuto, il taglio dei vari header avviene a mano a mano che i dati risalgono i livelli fino all'applicazione.

## Esempio completo: richiesta di una pagina web

Quando un utente apre un browser e digita un URL:

1. Il browser verifica se conosce già l'indirizzo IP del dominio (DNS cache) oppure interroga il server DNS configurato.
2. Una volta ottenuto l'IP, apre una connessione TCP verso la porta 80 (HTTP) o 443 (HTTPS) del server di destinazione.
3. Il livello Transport crea segmenti TCP, il livello Internet crea pacchetti IP e il livello Link li incapsula in frame per la trasmissione sulla LAN.
4. I router lungo il percorso instradano i pacchetti verso il server, che li riceve, li disincapsula e passa la richiesta al server web applicativo.
5. La risposta segue lo stesso flusso in direzione inversa fino al browser dell'utente.`
  },
  {
    title: 'Indirizzamento IPv4 e subnetting',
    description: 'Struttura IPv4, subnet mask, CIDR, indirizzi speciali, gateway e subnetting base',
    content: `## Struttura dell'indirizzo IPv4

IPv4 usa indirizzi a 32 bit rappresentati in forma decimale puntata (quattro numeri da 0 a 255 separati da punti).

Ogni indirizzo si può vedere come composto da una **parte di rete** e una **parte host**, determinate dalla subnet mask o dal prefisso CIDR (es. /24).

Un esempio comune nelle LAN è 192.168.1.10/24: "192.168.1" identifica la rete, mentre ".10" identifica l'host all'interno di quella rete.

L'uso di una notazione uniforme consente ai router di determinare velocemente a quale rete appartiene un pacchetto e come instradarlo.

## Subnet mask e prefisso CIDR

La **subnet mask** stabilisce quanti bit dell'indirizzo sono dedicati alla porzione di rete e quanti alla parte host.

Per esempio, la mask 255.255.255.0 equivale al prefisso /24, cioè 24 bit per la rete e 8 per gli host, mentre 255.255.255.128 equivale a /25.

Il prefisso CIDR si indica con una "/" seguita dal numero di bit di rete (es. 10.0.0.5/16); più alto è il numero, maggiore è il numero di bit di rete e minore il numero di host possibili.

Questo permette una gestione flessibile dello spazio di indirizzi, superando le limitazioni delle vecchie classi A/B/C.

## Indirizzo di rete, broadcast, host validi

In una subnet, gli indirizzi estremi rappresentano l'indirizzo di rete (tutti i bit host a 0) e l'indirizzo di broadcast (tutti i bit host a 1).

Gli indirizzi compresi tra questi due sono utilizzabili per gli host (PC, server, router, stampanti di rete, ecc.).

**Esempio: 192.168.1.0/24**
- Rete: 192.168.1.0
- Host validi: 192.168.1.1 – 192.168.1.254
- Broadcast: 192.168.1.255

Questa distinzione è cruciale per comprendere cosa accade quando un host invia un pacchetto broadcast e come i router trattano i pacchetti destinati a reti diverse.

## Indirizzi speciali (privati, loopback, APIPA)

Esistono insiemi di indirizzi con significato speciale:

- **Loopback**: 127.0.0.0/8, usato per il traffico interno al sistema (127.0.0.1 è l'host locale).
- **APIPA**: 169.254.0.0/16, assegnato automaticamente in alcune piattaforme quando manca il server DHCP; consente comunicazione locale ma non instradabile.
- **Indirizzi privati RFC 1918**: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, riservati per reti interne e non instradati direttamente su Internet.

Gli indirizzi privati vengono normalmente tradotti in indirizzi pubblici tramite NAT su un router prima di uscire su Internet.

## Gateway di default

Il **gateway di default** è l'indirizzo IP del router a cui un host invia il traffico destinato a reti diverse dalla propria.

Se il gateway non è configurato o è errato, l'host può comunicare solo con gli altri dispositivi della stessa subnet ma non con reti esterne, inclusa Internet.

Tipicamente, in una subnet 192.168.1.0/24 si usa qualcosa come 192.168.1.1 come gateway di default, configurato sull'interfaccia del router collegata a quella LAN.

## Subnetting base – esempio passo-passo

Il **subnetting** è il processo di suddividere una rete IP più grande in più subnet più piccole, per migliorare organizzazione, sicurezza e utilizzo dello spazio di indirizzi.

**Esempio: dividere 192.168.10.0/24 in 4 subnet di uguale dimensione:**

1. Un /24 ha 8 bit per gli host (32 totali − 24 di rete).
2. Per ottenere 4 subnet servono 2 bit (2^2 = 4), quindi si "prendono" 2 bit dalla parte host.
3. Il nuovo prefisso sarà /26 (24+2).
4. Ogni /26 ha 6 bit host rimanenti → 2^6 = 64 indirizzi per subnet (62 host validi).

Le subnet risultanti sono:

- **192.168.10.0/26** → Rete: .0 | Host: .1–.62 | Broadcast: .63
- **192.168.10.64/26** → Rete: .64 | Host: .65–.126 | Broadcast: .127
- **192.168.10.128/26** → Rete: .128 | Host: .129–.190 | Broadcast: .191
- **192.168.10.192/26** → Rete: .192 | Host: .193–.254 | Broadcast: .255`
  },
  {
    title: 'Dispositivi di rete: hub, switch, router',
    description: 'Hub, switch, router e domini di collisione e broadcast',
    content: `## Hub: dispositivi di livello fisico

Gli **hub** sono dispositivi di livello 1 OSI che ripetono i segnali ricevuti su una porta su tutte le altre porte, senza alcuna logica di filtraggio o instradamento.

Tutti gli host collegati a un hub condividono lo stesso dominio di collisione, il che porta rapidamente a inefficienze e a problemi di performance su reti con traffico intenso.

Per via di questi limiti, gli hub sono praticamente obsoleti nelle reti moderne e sono stati rimpiazzati dagli switch.

## Switch: livello 2 (e talvolta 3)

Gli **switch** operano principalmente a livello 2 OSI, utilizzando una **tabella MAC** per inoltrare i frame solo verso la porta in cui si trova il destinatario.

Quando uno switch riceve un frame, legge l'indirizzo MAC sorgente e lo associa alla porta da cui proviene; per il MAC di destinazione, se noto, inoltra il frame solo sulla porta corrispondente.

Se il MAC di destinazione non è in tabella, lo switch effettua un **flood** del frame su tutte le porte (eccetto quella d'ingresso); quando riceve la risposta, aggiorna la tabella MAC per le successive trasmissioni.

Gli switch moderni possono essere **non gestiti** (configurazione minima, tipici ambienti domestici) o **gestiti** (supporto per VLAN, trunk, QoS, STP, monitoraggio).

Alcuni switch di fascia più alta implementano funzioni di livello 3 (routing inter-VLAN), diventando veri e propri router/switch L3 ibridi.

## Router: dispositivi di livello 3

I **router** operano a livello 3 OSI e prendono decisioni di instradamento basate sugli indirizzi IP sorgente/destinazione contenuti nei pacchetti.

Mantengono una **tabella di routing** che indica quali reti sono raggiungibili tramite quali interfacce o next hop, tabella che può essere configurata manualmente (route statiche) o appresa tramite protocolli di routing dinamico.

I router separano i domini di broadcast: un broadcast in una LAN non viene inoltrato su un'altra LAN se non esplicitamente configurato (es. per DHCP relay).

In scenari domestici, il "router" del provider spesso include anche funzioni di switch, access point Wi-Fi e NAT per condividere un singolo indirizzo pubblico tra molti dispositivi privati.

## Domini di collisione e di broadcast

- Un **dominio di collisione** è un segmento di rete in cui i frame possono interferire tra loro se trasmessi simultaneamente, problema tipico di reti con hub o mezzi condivisi.
- Un **dominio di broadcast** è l'insieme di dispositivi che ricevono un broadcast di livello 2 (MAC FF:FF:FF:FF:FF:FF) o un broadcast IP di livello 3.

Gli switch di livello 2 separano i domini di collisione (ogni porta è un dominio distinto) ma per default non separano i domini di broadcast; i router invece delimitano i domini di broadcast.`
  },
  {
    title: 'Protocolli fondamentali: DNS, DHCP, HTTP, ICMP',
    description: 'DNS, DHCP, HTTP/HTTPS, ICMP e strumenti di troubleshooting',
    content: `## DNS – Domain Name System

Il DNS è il sistema che traduce nomi simbolici (domini) in indirizzi IP, consentendo agli utenti di usare nomi leggibili (www.esempio.com) invece di numeri.

È organizzato gerarchicamente in zone (root, TLD, domini di secondo livello) e funziona attraverso server autoritativi, server ricorsivi e cache locali.

Le query DNS standard usano normalmente **UDP porta 53**, mentre alcune operazioni (zone transfer, risposte molto grandi) possono usare TCP porta 53.

Una risoluzione tipica coinvolge il resolver del sistema operativo, un DNS ricorsivo (spesso del provider o locale) e vari server autoritativi.

## DHCP – Dynamic Host Configuration Protocol

Il DHCP automatizza l'assegnazione di indirizzi IP e parametri di rete ai client, riducendo errori e lavoro amministrativo.

Utilizza un flusso tipico noto con l'acronimo **DORA**:
1. **Discover**: il client invia un broadcast per cercare un server DHCP.
2. **Offer**: il server propone un indirizzo IP e i parametri di rete.
3. **Request**: il client accetta l'offerta e lo comunica.
4. **Acknowledge**: il server conferma l'assegnazione (lease).

DHCP opera su **UDP porte 67** (server) e **68** (client).

## HTTP e HTTPS

**HTTP (HyperText Transfer Protocol)** è il protocollo applicativo usato per il trasferimento di pagine web e risorse tra client (browser) e server. Opera su **TCP porta 80**.

**HTTPS** aggiunge uno strato di cifratura tramite TLS (Transport Layer Security) per proteggere la riservatezza e l'integrità dei dati in transito. Opera su **TCP porta 443**.

Il funzionamento base prevede che il client invii una richiesta (es. GET /index.html) e il server risponda con il contenuto richiesto e un codice di stato (200 OK, 404 Not Found, 500 Internal Server Error, ecc.).

## ICMP – Internet Control Message Protocol

ICMP è un protocollo di livello Internet (livello 3) usato per messaggi di controllo e diagnostica della rete.

- Il comando **ping** usa ICMP Echo Request/Reply per verificare la raggiungibilità di un host e misurare il tempo di risposta (RTT).
- Il comando **traceroute** (o **tracert** su Windows) usa ICMP (o UDP) per scoprire il percorso dei pacchetti verso una destinazione, mostrando ogni router intermedio (hop).

## Strumenti di troubleshooting di rete

- **ping**: verifica la raggiungibilità di un host tramite ICMP.
- **ipconfig** (Windows) / **ip addr** (Linux): mostra la configurazione IP dell'interfaccia di rete (indirizzo IP, mask, gateway, DNS).
- **traceroute / tracert**: mostra il percorso dei pacchetti verso una destinazione.
- **nslookup / dig**: interroga i server DNS per verificare la risoluzione dei nomi.

Questi strumenti sono fondamentali per diagnosticare problemi di rete seguendo l'approccio per livelli del modello OSI.`
  }
];

const newBadgeName = 'Network Specialist';
const newBadgeDescription = 'Certificazione di competenza nelle reti informatiche';
const newBadgeColor = '#3b82f6';
const newCompanyTips = [
  'Le aziende cercano candidati con conoscenza pratica di subnetting e indirizzamento IP',
  'La certificazione CCNA è tra le più richieste nel settore networking: aumenta il salario medio del 15%',
  'Competenze di troubleshooting di rete sono essenziali per ruoli NOC e system admin',
  'La conoscenza del modello OSI e TCP/IP è fondamentale per qualsiasi colloquio tecnico in ambito reti',
  'Saper usare strumenti come ping, traceroute e ipconfig è un requisito base per ogni tecnico di rete'
];
const newPrerequisites = 'Conoscenze base di informatica';

// ============================================================
// NEW QUIZ DATA (25 questions)
// ============================================================

const newQuizTitle = 'Quiz finale – Fondamenti di Reti';
const newQuizQuestions = [
  {
    question: 'Quale affermazione descrive meglio una LAN?',
    options: [
      'Una rete che copre l\'intero pianeta.',
      'Una rete limitata a un\'area come casa, ufficio o laboratorio.',
      'Una rete composta solo da dispositivi mobili.',
      'Una rete che usa esclusivamente fibra ottica.'
    ],
    correct: 1,
    explanation: 'Una LAN (Local Area Network) è una rete locale che copre un\'area limitata come una casa, un ufficio o un laboratorio.'
  },
  {
    question: 'A quale livello del modello OSI appartiene il MAC address?',
    options: ['Physical', 'Data Link', 'Network', 'Transport'],
    correct: 1,
    explanation: 'Il MAC address è gestito dal livello 2 (Data Link) del modello OSI, che si occupa dell\'indirizzamento fisico e dell\'incapsulamento in frame.'
  },
  {
    question: 'Quale livello OSI si occupa principalmente dell\'instradamento tra reti diverse usando indirizzi IP?',
    options: ['Data Link', 'Network', 'Transport', 'Application'],
    correct: 1,
    explanation: 'Il livello 3 (Network) fornisce instradamento tra reti diverse utilizzando indirizzi logici, tipicamente gli indirizzi IP.'
  },
  {
    question: 'In quale livello del modello TCP/IP troviamo i protocolli HTTP e DNS?',
    options: ['Transport', 'Internet', 'Application', 'Network Access'],
    correct: 2,
    explanation: 'HTTP e DNS sono protocolli del livello Application del modello TCP/IP, che corrisponde ai livelli 5-6-7 del modello OSI.'
  },
  {
    question: 'Quale delle seguenti combinazioni porta/protocollo è corretta per HTTPS?',
    options: ['TCP 21', 'TCP 80', 'TCP 443', 'UDP 443'],
    correct: 2,
    explanation: 'HTTPS opera su TCP porta 443, aggiungendo cifratura TLS al protocollo HTTP.'
  },
  {
    question: 'Qual è la funzione principale del DHCP in una rete?',
    options: [
      'Tradurre nomi di dominio in indirizzi IP.',
      'Assegnare dinamicamente indirizzi IP e parametri di rete ai client.',
      'Cifrare il traffico applicativo.',
      'Instradare pacchetti tra WAN diverse.'
    ],
    correct: 1,
    explanation: 'Il DHCP automatizza l\'assegnazione di indirizzi IP e parametri di rete ai client, riducendo errori e lavoro amministrativo.'
  },
  {
    question: 'Se una macchina riceve automaticamente un indirizzo 169.254.10.5, cosa suggerisce questo comportamento?',
    options: [
      'Il DNS non funziona.',
      'Il server DHCP non è raggiungibile.',
      'Il gateway è configurato in modo errato.',
      'Il server HTTP è down.'
    ],
    correct: 1,
    explanation: 'Un indirizzo 169.254.x.x (APIPA) viene assegnato automaticamente quando il client non riesce a contattare un server DHCP.'
  },
  {
    question: 'In un indirizzo 192.168.1.10/24, cosa rappresenta 192.168.1.255?',
    options: [
      'Indirizzo di rete.',
      'Indirizzo di loopback.',
      'Indirizzo di broadcast.',
      'Indirizzo del gateway.'
    ],
    correct: 2,
    explanation: 'In una subnet /24, l\'indirizzo con tutti i bit host a 1 (192.168.1.255) è l\'indirizzo di broadcast.'
  },
  {
    question: 'Quanti indirizzi IP totali contiene una subnet /26?',
    options: ['32', '64', '128', '256'],
    correct: 1,
    explanation: 'Una subnet /26 ha 6 bit per gli host: 2^6 = 64 indirizzi totali (di cui 62 utilizzabili per gli host).'
  },
  {
    question: 'Quale dispositivo separa i domini di broadcast a livello 3 OSI?',
    options: ['Hub', 'Switch non gestito', 'Router', 'Access point'],
    correct: 2,
    explanation: 'I router operano a livello 3 e separano i domini di broadcast: un broadcast in una LAN non viene inoltrato su un\'altra LAN.'
  },
  {
    question: 'Quale affermazione descrive meglio il comportamento di uno switch di livello 2?',
    options: [
      'Ripete i segnali su tutte le porte.',
      'Instrada pacchetti in base all\'indirizzo IP.',
      'Inoltra frame in base all\'indirizzo MAC.',
      'Esegue solo NAT tra indirizzi privati e pubblici.'
    ],
    correct: 2,
    explanation: 'Gli switch di livello 2 utilizzano una tabella MAC per inoltrare i frame solo verso la porta in cui si trova il destinatario.'
  },
  {
    question: 'Quale topologia fisica è oggi più comune nelle LAN?',
    options: ['Bus', 'Ring', 'Stella', 'Mesh completa'],
    correct: 2,
    explanation: 'La topologia a stella, con uno switch centrale a cui si collegano tutti i dispositivi, è la più comune nelle LAN moderne.'
  },
  {
    question: 'Qual è il vantaggio principale di una topologia mesh rispetto a una stella?',
    options: [
      'Richiede meno cavi.',
      'Maggiore ridondanza e tolleranza ai guasti.',
      'Non richiede dispositivi attivi.',
      'Non genera mai broadcast.'
    ],
    correct: 1,
    explanation: 'La topologia mesh offre maggiore ridondanza perché ogni nodo ha collegamenti multipli, garantendo tolleranza ai guasti.'
  },
  {
    question: 'A cosa serve principalmente una VLAN?',
    options: [
      'A collegare sedi geograficamente distanti.',
      'A suddividere logicamente una rete fisica in più domini di broadcast separati.',
      'A aumentare la velocità della connessione Internet.',
      'A cifrare il traffico tra host.'
    ],
    correct: 1,
    explanation: 'Le VLAN permettono la segmentazione logica della rete, creando domini di broadcast separati su un\'unica infrastruttura fisica.'
  },
  {
    question: 'Che cosa aggiunge lo standard 802.1Q a un frame Ethernet su un link trunk?',
    options: [
      'Un header IP aggiuntivo.',
      'L\'identificativo della VLAN (VLAN ID).',
      'Un nuovo MAC address.',
      'Un campo per la cifratura end-to-end.'
    ],
    correct: 1,
    explanation: 'Lo standard 802.1Q aggiunge un tag al frame Ethernet contenente il VLAN ID, permettendo di trasportare traffico di più VLAN su un singolo link trunk.'
  },
  {
    question: 'Quale protocollo è utilizzato dal comando ping per verificare la raggiungibilità di un host?',
    options: ['TCP', 'UDP', 'ICMP', 'ARP'],
    correct: 2,
    explanation: 'Il comando ping utilizza ICMP (Internet Control Message Protocol) con messaggi Echo Request/Reply.'
  },
  {
    question: 'Quale comando useresti su Windows per visualizzare indirizzo IP, mask, gateway e DNS configurati?',
    options: ['ping', 'ipconfig', 'nslookup', 'tracert'],
    correct: 1,
    explanation: 'ipconfig (su Windows) mostra la configurazione IP dell\'interfaccia di rete, inclusi indirizzo IP, subnet mask, gateway e DNS.'
  },
  {
    question: 'Se riesci a pingare l\'IP 8.8.8.8 ma non www.google.com, quale componente è più probabilmente in errore?',
    options: [
      'Configurazione DNS.',
      'Cavo di rete.',
      'Gateway di default.',
      'Router dell\'ISP completamente inattivo.'
    ],
    correct: 0,
    explanation: 'Se l\'IP è raggiungibile ma il nome di dominio no, il problema è nella risoluzione DNS: il servizio DNS non sta traducendo i nomi in indirizzi IP.'
  },
  {
    question: 'Cosa rappresenta, in genere, l\'indirizzo IP configurato su una sub-interfaccia di un router in uno scenario router-on-a-stick?',
    options: [
      'Un indirizzo loopback usato per test.',
      'Il gateway di default per la VLAN associata.',
      'L\'indirizzo del server DHCP.',
      'L\'indirizzo di broadcast della VLAN.'
    ],
    correct: 1,
    explanation: 'In uno scenario router-on-a-stick, ogni sub-interfaccia del router ha un indirizzo IP che funge da gateway di default per la VLAN corrispondente.'
  },
  {
    question: 'Quale livello OSI rappresenta meglio il ruolo di TLS che cifra il traffico HTTP?',
    options: [
      'Livello 3 – Network',
      'Livello 4 – Transport',
      'Livello 6 – Presentation',
      'Livello 7 – Application'
    ],
    correct: 2,
    explanation: 'TLS opera concettualmente al livello 6 (Presentation) del modello OSI, occupandosi della cifratura dei dati applicativi.'
  },
  {
    question: 'In quale situazione un indirizzo IP privato è più appropriato?',
    options: [
      'Per un server web pubblico accessibile da Internet.',
      'Per un server interno disponibile solo in LAN.',
      'Per l\'interfaccia pubblica di un router verso il provider.',
      'Per un record DNS pubblico.'
    ],
    correct: 1,
    explanation: 'Gli indirizzi privati RFC 1918 sono riservati per reti interne e non instradati direttamente su Internet, ideali per server interni in LAN.'
  },
  {
    question: 'Qual è l\'ordine corretto delle fasi DORA nel DHCP?',
    options: [
      'Discover, Offer, Request, Acknowledge',
      'Detect, Offer, Reply, Accept',
      'Discover, Obtain, Renew, Acknowledge',
      'Demand, Offer, Request, Approve'
    ],
    correct: 0,
    explanation: 'Il processo DHCP segue l\'acronimo DORA: Discover, Offer, Request, Acknowledge.'
  },
  {
    question: 'Un tecnico vuole capire quanti router vengono attraversati da un pacchetto per raggiungere una destinazione remota. Quale comando usa tipicamente?',
    options: ['ping', 'ipconfig', 'traceroute/tracert', 'nslookup'],
    correct: 2,
    explanation: 'traceroute (Linux/macOS) o tracert (Windows) mostra il percorso dei pacchetti verso una destinazione, indicando ogni router intermedio (hop).'
  },
  {
    question: 'Quale abbinamento dispositivo–livello OSI è più corretto?',
    options: [
      'Hub – Livello 2',
      'Switch – Livello 3',
      'Router – Livello 3',
      'DNS server – Livello 2'
    ],
    correct: 2,
    explanation: 'I router operano a livello 3 (Network) del modello OSI, prendendo decisioni di instradamento basate sugli indirizzi IP.'
  },
  {
    question: 'In una rete 192.168.50.0/24, si vogliono creare 2 subnet con lo stesso numero di host. Quale prefisso userai?',
    options: ['/23', '/25', '/26', '/27'],
    correct: 1,
    explanation: 'Per dividere una /24 in 2 subnet uguali serve 1 bit in più per la rete: /25 (24+1), ottenendo 2 subnet da 126 host ciascuna.'
  }
];
const newQuizPassingScore = 70;

// ============================================================
// UPDATE DATABASE
// ============================================================

async function updateDatabase() {
  console.log('🔄 Updating course 1 in database...');
  await db.execute({
    sql: `UPDATE courses SET title = ?, description = ?, level = ?, duration = ?, modules = ?, badge_name = ?, badge_description = ?, badge_color = ?, company_tips = ?, prerequisites = ? WHERE id = 1`,
    args: [
      newCourseTitle,
      newCourseDescription,
      newCourseLevel,
      newCourseDuration,
      JSON.stringify(newModules),
      newBadgeName,
      newBadgeDescription,
      newBadgeColor,
      JSON.stringify(newCompanyTips),
      newPrerequisites
    ]
  });
  console.log('✅ Course 1 updated');

  console.log('🔄 Updating quiz 1 in database...');
  await db.execute({
    sql: `UPDATE quizzes SET title = ?, questions = ?, passing_score = ? WHERE course_id = 1`,
    args: [
      newQuizTitle,
      JSON.stringify(newQuizQuestions),
      newQuizPassingScore
    ]
  });
  console.log('✅ Quiz 1 updated');

  // Reset progress for course 1 since module count changed (5 -> 6)
  console.log('🔄 Resetting user progress for course 1 (module count changed 5→6)...');
  await db.execute({
    sql: `UPDATE user_progress SET completed_modules = '[]', quiz_score = 0, quiz_completed = 0 WHERE course_id = 1`,
    args: []
  });
  console.log('✅ User progress reset for course 1');

  // Update TecWebadmin progress if exists
  try {
    const tecwebadmin = await db.execute({
      sql: "SELECT id FROM auth_users WHERE display_name = 'TecWebadmin' OR username = 'TecWebadmin' OR username = 'tecwebstudio'",
      args: [],
    });
    if (tecwebadmin.rows.length > 0) {
      const userId = Number(tecwebadmin.rows[0].id);
      const allModuleIndices = JSON.stringify(newModules.map((_, i) => i));
      await db.execute({
        sql: 'UPDATE user_progress SET completed_modules = ?, quiz_score = 100, quiz_completed = 1 WHERE user_id = ? AND course_id = 1',
        args: [allModuleIndices, userId],
      });
      await db.execute({
        sql: "UPDATE user_badges SET badge_name = ? WHERE user_id = ? AND course_id = 1",
        args: [newBadgeName, userId],
      });
      console.log(`✅ TecWebadmin progress updated for course 1`);
    }
  } catch (e) {
    console.log('⚠️  Could not update TecWebadmin:', e.message);
  }
}

// ============================================================
// UPDATE SEED FILE
// ============================================================

function updateSeedFile() {
  console.log('🔄 Updating seed.ts...');
  const seedPath = resolve(__dirname, 'seed.ts');
  let content = readFileSync(seedPath, 'utf-8');

  // --- Replace Course 1 ---
  const course1Start = content.indexOf('// Course 1: Networking');
  const course2Start = content.indexOf('// Course 2: Cybersecurity');

  if (course1Start === -1 || course2Start === -1) {
    console.error('❌ Could not find course markers in seed.ts');
    return;
  }

  // Build the new course 1 entry
  const modulesJson = JSON.stringify(newModules).replace(/'/g, "\\'");
  const tipsJson = JSON.stringify(newCompanyTips).replace(/'/g, "\\'");

  // We need to build it as valid JS. Use the same pattern as existing entries.
  const newCourse1 = `// Course 1: Networking
    ['${newCourseTitle.replace(/'/g, "\\'")}',
      '${newCourseDescription.replace(/'/g, "\\'")}',
      'networking', '${newCourseLevel}', '${newCourseDuration}',
      JSON.stringify(${JSON.stringify(newModules, null, 0)}),
      '${newBadgeName}', '${newBadgeDescription.replace(/'/g, "\\'")}',
      '${newBadgeColor}',
      JSON.stringify(${JSON.stringify(newCompanyTips)}),
      '${newPrerequisites}'],

    `;

  content = content.substring(0, course1Start) + newCourse1 + content.substring(course2Start);
  console.log('✅ Course 1 replaced in seed.ts');

  // --- Replace Quiz 1 ---
  const quiz1Start = content.indexOf("[1, 'Quiz Fondamenti di Networking'");
  if (quiz1Start === -1) {
    // Try alternate search
    const quiz1AltStart = content.indexOf("[1, 'Quiz ");
    if (quiz1AltStart === -1) {
      console.error('❌ Could not find quiz 1 marker in seed.ts');
      writeFileSync(seedPath, content, 'utf-8');
      return;
    }
  }

  const quiz1Marker = content.indexOf("[1, '", content.indexOf('const quizzes'));
  const quiz2Marker = content.indexOf("[2, '", quiz1Marker + 1);

  if (quiz1Marker === -1 || quiz2Marker === -1) {
    console.error('❌ Could not find quiz markers in seed.ts');
    writeFileSync(seedPath, content, 'utf-8');
    return;
  }

  const newQuiz1 = `[1, '${newQuizTitle.replace(/'/g, "\\'")}', JSON.stringify(${JSON.stringify(newQuizQuestions, null, 0)}), ${newQuizPassingScore}],

    `;

  content = content.substring(0, quiz1Marker) + newQuiz1 + content.substring(quiz2Marker);

  writeFileSync(seedPath, content, 'utf-8');
  console.log('✅ Quiz 1 replaced in seed.ts');
  console.log('✅ seed.ts updated successfully');
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  try {
    await updateDatabase();
    updateSeedFile();
    console.log('\n🎉 Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

main();
