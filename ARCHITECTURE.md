# ARCHITECTURE – cguenther.app Mini-CRM
**Version:** 0.1  
**Stand:** Februar 2026  
**Referenz:** PRD-cguenther-crm.md

---

## 1. Übersicht

```
Browser (Nutzer)
      │
      ▼
   NGINX (Reverse Proxy, Hetzner VPS)
      │
      ├──► crm-frontend:3000  (Next.js, öffentlich via crm.cguenther.app)
      │         │
      │         └──► crm-pocketbase:8090  (intern, Docker-Netzwerk)
      │
      └──► [andere Container: Website, Analytics, ...]

Admin-Zugang PocketBase:
  SSH-Tunnel → localhost:8090/_/
```

---

## 2. Tech-Stack (konkret)

| Bereich | Library / Tool | Version |
|---------|---------------|---------|
| Framework | Next.js (App Router) | 14+ |
| Sprache | TypeScript | 5+ |
| UI-Komponenten | shadcn/ui | latest |
| Styling | Tailwind CSS | 3+ |
| Rich-Text-Editor | TipTap | 2+ |
| Icons | Lucide React | latest |
| Dark Mode | next-themes | latest |
| PocketBase Client | pocketbase (JS SDK) | latest |
| Formulare | React Hook Form + Zod | latest |
| Tabellen | TanStack Table | v8 |
| Datum/Zeit | date-fns | latest |
| Backend | PocketBase | latest stable |
| Datenbank | SQLite (via PocketBase) | – |
| Containerisierung | Docker + Docker Compose | – |
| Reverse Proxy | NGINX | bestehend |

---

## 3. Projektstruktur (Next.js)

```
crm-cguentherapp/
├── PRD-cguenther-crm.md
├── ARCHITECTURE.md
├── logo.png                        # cguenther.app Logo
├── favicon.png                     # Rechteckiges Favicon
│
├── docker-compose.yml              # Beide Container (frontend + pocketbase)
├── Dockerfile                      # Next.js Produktions-Build
├── .env.local                      # Lokale Umgebungsvariablen (nicht in Git)
├── .env.example                    # Vorlage für Umgebungsvariablen
├── .gitignore
│
├── pocketbase/
│   └── pb_data/                    # PocketBase Daten (Docker Volume, nicht in Git)
│
└── src/
    ├── app/                        # Next.js App Router
    │   ├── layout.tsx              # Root Layout (ThemeProvider, Sidebar)
    │   ├── page.tsx                # Redirect → /leads
    │   ├── login/
    │   │   └── page.tsx
    │   ├── leads/
    │   │   └── page.tsx            # Lead-Pipeline-Übersicht
    │   ├── organisationen/
    │   │   ├── page.tsx            # Organisations-Liste
    │   │   ├── neu/
    │   │   │   └── page.tsx        # Neue Organisation anlegen
    │   │   └── [id]/
    │   │       ├── page.tsx        # Organisations-Detail
    │   │       └── bearbeiten/
    │   │           └── page.tsx
    │   └── kontakte/
    │       └── [id]/
    │           ├── page.tsx        # Kontakt-Detail
    │           └── bearbeiten/
    │               └── page.tsx
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.tsx         # Linke Navigation (Desktop)
    │   │   ├── BottomNav.tsx       # Navigation (Mobil)
    │   │   ├── ThemeToggle.tsx     # Dark/Light-Mode Schalter
    │   │   └── AppShell.tsx        # Wrapper: Sidebar + Content
    │   ├── leads/
    │   │   ├── LeadTable.tsx       # Tabelle mit Status, Datum, Tage-Indikator
    │   │   ├── LeadKanban.tsx      # Kanban-View (optional toggle)
    │   │   └── StatusBadge.tsx     # Farbige Status-Pills
    │   ├── organisationen/
    │   │   ├── OrgForm.tsx         # Anlegen / Bearbeiten Formular
    │   │   ├── OrgCard.tsx         # Karte in Listen-/Kanban-Ansicht
    │   │   └── KontaktListe.tsx    # Kontakte innerhalb einer Org
    │   ├── kontakte/
    │   │   └── KontaktForm.tsx     # Anlegen / Bearbeiten Formular
    │   ├── notizen/
    │   │   ├── NotizenTimeline.tsx # Chronologische Timeline
    │   │   ├── NotizEditor.tsx     # TipTap Rich-Text-Editor
    │   │   └── NotizKarte.tsx      # Einzelne Notiz in der Timeline
    │   └── ui/                     # shadcn/ui Komponenten (auto-generiert)
    │
    ├── lib/
    │   ├── pocketbase.ts           # PocketBase Client-Instanz (Singleton)
    │   ├── auth.ts                 # Login / Logout / Session-Check
    │   └── utils.ts                # Hilfsfunktionen (cn, Datumsformatierung, ...)
    │
    ├── hooks/
    │   ├── useAuth.ts              # Auth-State Hook
    │   ├── useOrganisationen.ts    # Daten-Hook Organisationen
    │   ├── useKontakte.ts          # Daten-Hook Kontakte
    │   └── useNotizen.ts          # Daten-Hook Notizen
    │
    ├── types/
    │   └── index.ts                # TypeScript-Typen für alle Entities
    │
    └── styles/
        └── globals.css             # Tailwind-Basis + CSS-Variablen für Theme
```

---

## 4. Branding & Design-Token

### Farben (aus cguenther.app Logo)

```css
/* globals.css – CSS Custom Properties */
:root {
  --color-primary:     #3D5A80;   /* Navy-Blau – Schrift, Navigation */
  --color-accent:      #F58220;   /* Orange – CTAs, Badges, Akzente */
  --color-cyan:        #29B8D4;   /* Cyan – Icons, aktive Zustände */
  --color-navy:        #2B4A7A;   /* Navy – Sidebar-Hintergrund (Dark) */
  --color-terracotta:  #C0532A;   /* Terracotta – Warnungen, Sekundär */
}
```

### Tailwind-Konfiguration (tailwind.config.ts)

```ts
extend: {
  colors: {
    primary:    '#3D5A80',
    accent:     '#F58220',
    cyan:       '#29B8D4',
    navy:       '#2B4A7A',
    terracotta: '#C0532A',
  }
}
```

### Dark / Light Mode

- Implementiert via `next-themes` mit `class`-Strategie
- Tailwind `darkMode: 'class'`
- Toggle-Button in der Sidebar (Sonne / Mond Icon via Lucide)
- Präferenz wird in `localStorage` gespeichert

### Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| < 768px (Mobil) | Bottom-Navigation, kein Sidebar |
| ≥ 768px (Tablet/Desktop) | Sidebar links (240px), Content rechts |

---

## 5. PocketBase Collections (Datenbankschema)

### `users` (PocketBase Auth-Collection, built-in)
Keine Anpassung nötig. E-Mail + Passwort Login.

### `organizations`

| Feld | Typ | Pflicht | Optionen |
|------|-----|---------|----------|
| `name` | text | ✅ | min: 1 |
| `industry` | text | – | |
| `address_street` | text | – | |
| `address_zip` | text | – | |
| `address_city` | text | – | |
| `website` | url | – | |
| `phone` | text | – | |
| `status` | select | ✅ | lead, contacted, responded, interested, offer_sent, customer, no_interest, paused |
| `tags` | text | – | |

### `contacts`

| Feld | Typ | Pflicht | Optionen |
|------|-----|---------|----------|
| `organization` | relation | ✅ | → organizations |
| `first_name` | text | ✅ | |
| `last_name` | text | ✅ | |
| `role` | text | – | |
| `email` | email | – | |
| `phone` | text | – | |
| `mobile` | text | – | |
| `is_primary` | bool | – | default: false |

### `notes`

| Feld | Typ | Pflicht | Optionen |
|------|-----|---------|----------|
| `organization` | relation | – | → organizations (nullable) |
| `contact` | relation | – | → contacts (nullable) |
| `type` | select | ✅ | internal, call, visit, email_in, email_out, other |
| `content` | editor | ✅ | Rich-Text (HTML) |
| `noted_at` | date | ✅ | default: now |
| `created_by` | relation | ✅ | → users |

> **Constraint:** Mindestens `organization` oder `contact` muss gesetzt sein (clientseitig validieren).

---

## 6. Umgebungsvariablen

```bash
# .env.example

# PocketBase URL (intern im Docker-Netzwerk für Server-Side)
POCKETBASE_URL=http://crm-pocketbase:8090

# PocketBase URL (für den Browser – leer lassen wenn nur server-side)
NEXT_PUBLIC_POCKETBASE_URL=http://crm-pocketbase:8090
```

---

## 7. Docker Setup

### docker-compose.yml

```yaml
version: '3.8'

services:
  crm-pocketbase:
    image: ghcr.io/muchobien/pocketbase:latest
    container_name: crm-pocketbase
    restart: unless-stopped
    volumes:
      - ./pocketbase/pb_data:/pb/pb_data
    networks:
      - crm-internal
    # Kein ports-Mapping → nicht von außen erreichbar
    # SSH-Tunnel für Admin: ssh -L 8090:crm-pocketbase:8090 user@server

  crm-frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: crm-frontend
    restart: unless-stopped
    environment:
      - POCKETBASE_URL=http://crm-pocketbase:8090
      - NEXT_PUBLIC_POCKETBASE_URL=http://crm-pocketbase:8090
    ports:
      - "XXXX:3000"       # ⚠️ TODO: XXXX durch freien Host-Port ersetzen!
                          # Prüfen mit: docker ps --format "table {{.Names}}\t{{.Ports}}"
    depends_on:
      - crm-pocketbase
    networks:
      - crm-internal

networks:
  crm-internal:
    driver: bridge
```

### Dockerfile (Next.js)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 8. NGINX-Konfiguration (Ergänzung bestehende Config)

```nginx
server {
    listen 80;
    server_name crm.cguenther.app;  # ✅ A-Record angelegt
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name crm.cguenther.app;  # ✅ A-Record angelegt

    # SSL (z. B. via Certbot / Let's Encrypt – bereits vorhanden?)
    ssl_certificate     /etc/letsencrypt/live/cguenther.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cguenther.app/privkey.pem;

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 9. Lead-Status Farbkodierung

| Status | Label (DE) | Farbe (Badge) |
|--------|-----------|---------------|
| `lead` | Lead | Grau `#94A3B8` |
| `contacted` | Kontaktiert | Blau `#3D5A80` |
| `responded` | Reagiert | Cyan `#29B8D4` |
| `interested` | Interesse | Grün `#22C55E` |
| `offer_sent` | Angebot gesendet | Orange `#F58220` |
| `customer` | Kunde | Dunkelgrün `#16A34A` |
| `no_interest` | Kein Interesse | Rot `#EF4444` |
| `paused` | Pausiert | Gelb `#EAB308` |

### Tage seit letztem Kontakt (Spalte in Lead-Tabelle)

| Tage | Farbe |
|------|-------|
| 0–7 | Grün |
| 8–14 | Gelb |
| 15–30 | Orange |
| > 30 | Rot |

---

## 10. Git & Deployment Workflow

```bash
# Lokale Entwicklung
git clone git@github.com:cguenther-app/crm-cguentherapp.git
cd cguenther-crm
cp .env.example .env.local
npm install
npm run dev          # Next.js lokal auf Port 3000
# PocketBase lokal: docker compose up crm-pocketbase

# Deployment auf Hetzner
ssh user@hetzner-server
cd /opt/crm-cguentherapp
git pull
docker compose up -d --build
```

### Empfohlene GitHub-Struktur
- **Branch `main`** → Produktionsstand
- **Branch `dev`** → Aktive Entwicklung
- Kein CI/CD im MVP – manuelles `git pull` + `docker compose up` auf dem Server

---

## 11. Dateien im Projekt-Root (für Claude Code)

Wenn du Claude Code startest, sollte der Ordner folgendes enthalten:

```
crm-cguentherapp/
├── PRD-cguenther-crm.md     ← Produktanforderungen
├── ARCHITECTURE.md          ← Dieses Dokument
├── logo.png                 ← cguenther.app Logo (Sidebar)
└── favicon.png              ← Favicon (rechteckig)
```

Claude Code liest beide MD-Dateien und baut die App entsprechend auf.
```bash
cd cguenther-crm
claude
# Prompt: "Lies PRD-cguenther-crm.md und ARCHITECTURE.md und baue die App Schritt für Schritt auf."
```
