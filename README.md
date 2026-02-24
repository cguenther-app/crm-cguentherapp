# CRM cguenther.app

Kleingewerbe-CRM: Organisationen, Kontakte, Angebote, Rechnungen, EÜR-Buchhaltung.

**Tech Stack:** Next.js 14 (App Router) + PocketBase + Docker + Hetzner VPS

---

## URLs & Zugänge

### Production

| Was | URL | Zugang |
|-----|-----|--------|
| **CRM-App** | https://crm.cguenther.app | App-User (PocketBase `users`-Collection) |
| **PocketBase Admin** | http://localhost:8090/_/ | SSH-Tunnel nötig! Superuser-Login |

### Staging

| Was | URL | Zugang |
|-----|-----|--------|
| **CRM-App** | http://46.225.2.55:3101 | App-User (PocketBase `users`-Collection) |
| **PocketBase Admin** | http://46.225.2.55:8091/_/ | Kein Tunnel nötig — direkt erreichbar |

### Wann brauche ich einen SSH-Tunnel?

| Aktion | Tunnel nötig? | Befehl |
|--------|---------------|--------|
| Production PocketBase Admin öffnen | **Ja** | `ssh -L 8090:localhost:8090 root@46.225.2.55` |
| Production Setup-Scripts ausführen | **Ja** | Tunnel auf 8090, dann `node scripts/pb-setup.mjs ...` |
| Staging PocketBase Admin öffnen | **Nein** | Direkt http://46.225.2.55:8091/_/ |
| Staging Setup-Scripts ausführen | **Nein** | `$env:POCKETBASE_URL="http://46.225.2.55:8091"` voranstellen |
| Lokal entwickeln (npm run dev) | **Ja** | Tunnel auf 8090 |
| Deployen (git push) | **Nein** | GitHub Actions übernimmt das |

---

## Lokale Entwicklung

```bash
# Terminal 1 — SSH-Tunnel zur Production-PocketBase
ssh -L 8090:localhost:8090 root@46.225.2.55 -i C:\Users\Christian\.ssh\id_ed25519

# Terminal 2 — Next.js starten
npm run dev
# → http://localhost:3000
```

---

## Deployment

**Automatisch via GitHub Actions:**

| Branch | Ziel | URL |
|--------|------|-----|
| `main` | Production | https://crm.cguenther.app |
| `develop` | Staging | http://46.225.2.55:3101 |

Einfach pushen — der Rest passiert automatisch.

**Git-Workflow:**
```
feature/xyz → merge in develop → Staging testen → merge in main → Production
```

---

## PocketBase Setup (einmalig pro Umgebung)

### 1. Superuser anlegen

```bash
# Auf dem Server via SSH
docker exec crm-pocketbase /usr/local/bin/pocketbase superuser upsert <email> '<pw>' --dir /pb_data
docker exec crm-pocketbase-staging /usr/local/bin/pocketbase superuser upsert <email> '<pw>' --dir /pb_data
```

### 2. Collections anlegen

**Production** (SSH-Tunnel auf 8090 muss offen sein):
```bash
node scripts/pb-setup.mjs <email> <pw>
node scripts/pb-setup-offers.mjs <email> <pw>
node scripts/pb-setup-invoices.mjs <email> <pw>
node scripts/pb-setup-accounting.mjs <email> <pw>
```

**Staging** (kein Tunnel nötig):
```powershell
$env:POCKETBASE_URL="http://46.225.2.55:8091"; node scripts/pb-setup.mjs <email> <pw>
$env:POCKETBASE_URL="http://46.225.2.55:8091"; node scripts/pb-setup-offers.mjs <email> <pw>
$env:POCKETBASE_URL="http://46.225.2.55:8091"; node scripts/pb-setup-invoices.mjs <email> <pw>
$env:POCKETBASE_URL="http://46.225.2.55:8091"; node scripts/pb-setup-accounting.mjs <email> <pw>
```

### 3. App-User anlegen

In der PocketBase Admin-UI → `users` → New record → E-Mail + Passwort.

---

## Server-Architektur

```
Hetzner VPS (46.225.2.55)
├── /opt/crm-cguentherapp (main branch)
│   ├── docker-compose.yml
│   ├── crm-pocketbase     → 127.0.0.1:8090 (intern)
│   └── crm-frontend       → 3100 → NGINX → crm.cguenther.app
│
├── /opt/crm-cguentherapp-staging (develop branch)
│   ├── docker-compose.staging.yml
│   ├── crm-pocketbase-staging → 0.0.0.0:8091 (öffentlich)
│   └── crm-frontend-staging   → 0.0.0.0:3101 (öffentlich)
│
└── NGINX Proxy Manager
    ├── crm.cguenther.app     → crm-frontend:3000
    └── crm.cguenther.app/pb  → crm-pocketbase:8090
```

---

## Wichtige Hinweise

- **PocketBase Volume-Mount:** immer `/pb_data` (nicht `/pb/pb_data`)
- **Deploys:** `--no-deps` Flag verhindert PocketBase-Neustart bei Frontend-Deploys
- **Superuser CLI:** `--dir /pb_data` Parameter nicht vergessen
- **Setup-Scripts:** sind idempotent (können mehrfach ausgeführt werden)
- **Staging hat kein SSL** — nur HTTP
