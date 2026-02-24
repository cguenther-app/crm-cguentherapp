# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Next.js dev server on port 3000
npm run build      # Production build – runs type-check; fix all TS errors before deploying
npm run lint       # ESLint via next lint
```

**Local development against production PocketBase (SSH tunnel required):**
```bash
# Terminal 1 – open SSH tunnel to PocketBase
ssh -L 8090:localhost:8090 root@46.225.2.55 -i C:\Users\Christian\.ssh\id_ed25519
# Keep this terminal open while developing

# Terminal 2 – start Next.js
npm run dev
```
`.env.local` already exists with `NEXT_PUBLIC_POCKETBASE_URL=http://localhost:8090`.

**PocketBase Admin UI (via SSH tunnel):** http://localhost:8090/_/

**Add shadcn/ui components:**
```bash
npx shadcn@latest add <component>
```

## Environments

| | **Production** | **Staging** |
|---|---|---|
| Webapp | https://crm.cguenther.app | http://46.225.2.55:3101 |
| PocketBase API | `https://crm.cguenther.app/pb` (via NGINX) | `http://46.225.2.55:8091` (public) |
| PocketBase Admin | http://localhost:8090/_/ (SSH tunnel) | http://46.225.2.55:8091/_/ (public) |
| Branch | `main` | `develop` |
| Server-Verzeichnis | `/opt/crm-cguentherapp` | `/opt/crm-cguentherapp-staging` |
| Docker Compose | `docker-compose.yml` | `docker-compose.staging.yml` |
| Host-Port Frontend | 3100 | 3101 |
| Host-Port PocketBase | 127.0.0.1:8090 (lokal) | 0.0.0.0:8091 (öffentlich) |
| pb_data | `./pocketbase/pb_data` | `./pocketbase/pb_data_staging` |

## Deployment

**Automatisch via GitHub Actions** (`.github/workflows/deploy.yml`):
- Push auf `main` → Production-Deploy
- Push auf `develop` → Staging-Deploy

Deploy-Befehl nutzt `--no-deps` damit PocketBase-Container **nie** durch Frontend-Deploys neu erstellt wird.

Server: Hetzner VPS at `46.225.2.55`.

**Manueller Deploy (falls nötig):**
```bash
# Production
ssh root@46.225.2.55
cd /opt/crm-cguentherapp && git pull origin main
docker compose up -d --build --no-deps crm-frontend

# Staging
cd /opt/crm-cguentherapp-staging && git pull origin develop
docker compose -f docker-compose.staging.yml up -d --build --no-deps crm-frontend-staging
```

**PocketBase Collection-Setup (einmalig pro Umgebung):**
```bash
# Production (SSH-Tunnel auf 8090 erforderlich)
node scripts/pb-setup.mjs <email> <pw>
node scripts/pb-setup-offers.mjs <email> <pw>
node scripts/pb-setup-invoices.mjs <email> <pw>
node scripts/pb-setup-accounting.mjs <email> <pw>

# Staging (direkt, kein Tunnel nötig)
$env:POCKETBASE_URL="http://46.225.2.55:8091"; node scripts/pb-setup.mjs <email> <pw>
$env:POCKETBASE_URL="http://46.225.2.55:8091"; node scripts/pb-setup-offers.mjs <email> <pw>
$env:POCKETBASE_URL="http://46.225.2.55:8091"; node scripts/pb-setup-invoices.mjs <email> <pw>
$env:POCKETBASE_URL="http://46.225.2.55:8091"; node scripts/pb-setup-accounting.mjs <email> <pw>
```

**PocketBase Superuser setzen:**
```bash
docker exec <container> /usr/local/bin/pocketbase superuser upsert <email> '<pw>' --dir /pb_data
```

**Git-Workflow:**
```
feature/xyz → PR auf develop → Staging-Deploy (automatisch) → testen
develop     → PR auf main    → Production-Deploy (automatisch)
```

## Architecture

**Full stack:** Next.js 14 (App Router) frontend + PocketBase backend, both Docker containers on Hetzner VPS. PocketBase volume mount: `--dir=/pb_data` (wichtig: nicht `/pb/pb_data`).

**Production:** PocketBase im internen Docker-Netzwerk (`crm-internal`), nicht öffentlich. NGINX Proxy Manager routet `crm.cguenther.app → crm-frontend:3000` und `crm.cguenther.app/pb → crm-pocketbase:8090`.

**Staging:** PocketBase öffentlich erreichbar auf Port 8091 (kein NGINX, kein SSL). Frontend öffentlich auf Port 3101.

**PocketBase access:**
- Production: via NGINX `/pb`-Proxy oder SSH tunnel `localhost:8090`
- Staging: direkt `http://46.225.2.55:8091`
- Local dev: via SSH tunnel on `localhost:8090` (`NEXT_PUBLIC_POCKETBASE_URL`)
- All API calls are client-side (hooks) — no Next.js server components/actions for data fetching

**App Router structure** (`src/app/(dashboard)/`):
- `/` → redirects to `/organisationen`
- `/organisationen` → list with search + status filter
- `/organisationen/neu` → create form
- `/organisationen/[id]` → detail: contacts list + notes timeline
- `/organisationen/[id]/bearbeiten` → edit form
- `/kontakte` → global contacts list
- `/kontakte/[id]` → contact detail + notes timeline
- `/kontakte/[id]/bearbeiten` → edit form
- `/leads` → pipeline table: all orgs with last-contact date and color-coded days column
- `/angebote` → list with KPIs, search
- `/angebote/neu` → create form with Katalog-Picker
- `/angebote/[id]` → detail with PDF export, status workflow
- `/rechnungen` → list with KPIs (offen/überfällig/bezahlt)
- `/rechnungen/neu` → create form, optional `?from=<angebotId>`
- `/rechnungen/[id]` → detail with PDF, "Als Einnahme buchen" bei Status bezahlt
- `/produkte` → article catalog list
- `/buchhaltung` → EÜR mit Preset-Chips + Custom-Datumsrange, KPIs, CSV/PDF-Export
- `/buchhaltung/neu` → create entry, optional `?invoice=<id>` für Vorausfüllung
- `/buchhaltung/[id]` → detail with Belegdownload
- `/login` → outside dashboard layout (no sidebar)

**Component layers:**
- `src/components/layout/` — AppShell wraps Sidebar (desktop) + BottomNav (mobile ≤768px) + ThemeToggle
- `src/components/ui/` — auto-generated shadcn/ui primitives; never edit manually
- `src/components/organisationen/` — OrgForm, StatusBadge, KontaktListe
- `src/components/kontakte/` — KontaktForm
- `src/components/notizen/` — NotizEditor (TipTap), NotizKarte, NotizenTimeline
- `src/components/angebote/` — AngebotPDF, logo-base64
- `src/components/rechnungen/` — RechnungForm, RechnungPDF, RechnungStatusBadge
- `src/components/buchhaltung/` — EntryForm, EuerPDF
- `src/lib/pocketbase.ts` — singleton PocketBase JS SDK client
- `src/lib/auth.ts` — login, logout, session check
- `src/lib/exportCsv.ts` — CSV-Export für Buchhaltung
- `src/hooks/` — `useOrganisationen`, `useKontakte`, `useNotizen`, `useAuth`, `useAngebote`, `useRechnungen`, `useBuchhaltung`
- `src/types/index.ts` — all TypeScript entity types + status/type arrays + label maps

## PocketBase Data Model

Collections: `organizations`, `contacts`, `notes`, `products`, `offers`, `invoices`, `accounting_entries`.

- `organizations.status` enum: `lead | contacted | responded | interested | offer_sent | customer | no_interest | paused`
- `contacts` always belong to an organization via `organization` relation field; `is_primary` bool marks the main contact
- `notes` can attach to an organization (`organization` FK), a contact (`contact` FK), or both; `type` enum: `internal | call | visit | email_in | email_out | other`; `content` is HTML (TipTap); `noted_at` is user-editable
- `products` — article catalog: `article_number`, `name`, `description`, `category`, `billing_type` (one_time/by_effort), `price`, `active`
- `offers` — quotes attached to an org: `organization` (relation), `contact` (relation), `title`, `number` (A-YYYY-XXX), `status` (draft/sent/accepted/rejected/expired), `date`, `valid_until`, `positions` (JSON as text), `total`, `notes`, `footer_note`
- `invoices` — `offer` (relation), `organization`, `contact`, `title`, `number` (R-YYYY-XXX), `status` (open/paid/cancelled), `date`, `due_date`, `positions` (JSON as text), `total`, `notes`, `footer_note`
- `accounting_entries` — `type` (income/expense), `date`, `amount`, `category`, `description`, `reference_number`, `invoice` (relation), `receipt` (file), `notes`
- All collections use rule `@request.auth.id != ""` (login required for all operations)

**Collection setup:** `scripts/pb-setup.mjs` creates base collections (organizations, contacts, notes, products + seed data). Separate scripts for offers, invoices, accounting_entries. All scripts are idempotent (delete-then-create). PocketBase v0.23+ uses flat field options (no nested `options: {}` object).

## Key Conventions

- Path alias `@/` maps to `src/`
- `cn()` utility from `src/lib/utils.ts` (clsx + tailwind-merge) for conditional classnames
- Forms: React Hook Form + Zod. **Do not use `.default()` in Zod schemas** — it causes a type mismatch with `zodResolver`. Use `defaultValues` in `useForm` instead.
- Tables: native HTML `<table>` (not TanStack) — simpler, clickable rows via `router.push`
- Date formatting: date-fns with German locale (`de`)
- All UI text is in **German**
- `next.config.js` sets `output: 'standalone'` for Docker builds
- PDF export: `dynamic import` with `ssr: false`; logo in `src/components/angebote/logo-base64.ts`
- Invoice numbers: R-YYYY-XXX (starts 001/year); Offer numbers: A-YYYY-XXX (starts 042)

## Design Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#3D5A80` | Navy blue — text, navigation, buttons |
| `accent` | `#F58220` | Orange — CTAs, badges |
| `cyan` | `#29B8D4` | Active states, icons |
| `navy` | `#2B4A7A` | Sidebar background (dark) |
| `terracotta` | `#C0532A` | Warnings |

Dark mode: `class` strategy via `next-themes`. `StatusBadge` (`src/components/organisationen/StatusBadge.tsx`) maps each lead status to a colored Badge. Days-since-contact color scale: green ≤7d → yellow ≤14d → orange ≤30d → red >30d.

## PocketBase Caveats

- **`sort=-created` is broken** on this PocketBase version (returns 400). Use other fields for sorting (e.g. `-date`, `name`).
- **`json` field type + auth rules** causes 400. Workaround: use `text` type and JSON.stringify/parse in app code. See `positions` field in `offers`.
- **Volume mount must be `/pb_data`** — the muchobien Docker image runs with `--dir=/pb_data`. Mount to `/pb/pb_data` causes data loss.
- **Never recreate PocketBase container during deploys** — use `docker compose up --no-deps` to only rebuild the frontend.
- **Superuser CLI needs `--dir /pb_data`** — e.g. `pocketbase superuser upsert ... --dir /pb_data`

## V2 Roadmap (next features to build)

**Done:**
1. ~~**Produkte/Artikelkatalog** (`/produkte`)~~ — article catalog, CRUD pages
2. ~~**Angebote** (`/angebote`)~~ — CRUD, PDF export, Katalog-Picker, Status-Workflow, Org-Status-Link
3. ~~**KPI-Kacheln auf Listenseiten**~~ — Kompakte Statistik-Kacheln auf allen Listenseiten
4. ~~**Rechnungen** (`/rechnungen`)~~ — CRUD, PDF-Export, Überfällig-Anzeige, "aus Angebot" Flow
5. ~~**EÜR / Buchhaltung** (`/buchhaltung`)~~ — Einnahmen/Ausgaben, Belegupload, CSV/PDF-Export, §19 UStG
6. ~~**App-Info / Release Notes**~~ — Info-Modal im Sidebar-Footer mit Versionshistorie

**Next up:**
7. **Erinnerungen/Follow-ups** — Erinnerungsdatum pro Org/Kontakt, in Lead-Pipeline anzeigen
8. **Dashboard** (`/`) — KPIs: offene Leads, Angebotssummen, Umsatz, letzte Aktivität

New feature workflow: add to PRD → define PocketBase collection → extend setup script → build hook → components → pages → test via SSH tunnel → deploy.
