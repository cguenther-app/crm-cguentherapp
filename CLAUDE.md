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

## Deployment

Server: Hetzner VPS at `46.225.2.55`, repo at `/opt/crm-cguentherapp`.

```bash
# On local machine – push changes
git push

# On server – pull and rebuild frontend
git pull
docker compose up -d --build crm-frontend
```

Frontend runs at https://crm.cguenther.app. PocketBase is internal-only (no public port).

**First-time PocketBase collection setup:**
```bash
node scripts/pb-setup.mjs
```

## Architecture

**Full stack:** Next.js 14 (App Router) frontend + PocketBase backend, both Docker containers on Hetzner VPS. PocketBase runs in the internal Docker network (`crm-internal`) — not publicly exposed. NGINX Proxy Manager routes `crm.cguenther.app → crm-frontend:3000`.

**PocketBase access:**
- Production: via internal Docker hostname `crm-pocketbase:8090` (`POCKETBASE_URL`)
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
- `/login` → outside dashboard layout (no sidebar)

**Component layers:**
- `src/components/layout/` — AppShell wraps Sidebar (desktop) + BottomNav (mobile ≤768px) + ThemeToggle
- `src/components/ui/` — auto-generated shadcn/ui primitives; never edit manually
- `src/components/organisationen/` — OrgForm, StatusBadge, KontaktListe
- `src/components/kontakte/` — KontaktForm
- `src/components/notizen/` — NotizEditor (TipTap), NotizKarte, NotizenTimeline
- `src/lib/pocketbase.ts` — singleton PocketBase JS SDK client
- `src/lib/auth.ts` — login, logout, session check
- `src/hooks/` — `useOrganisationen`, `useKontakte`, `useNotizen`, `useAuth`
- `src/types/index.ts` — all TypeScript entity types + `LEAD_STATUS` array + `LEAD_STATUS_LABELS` map

## PocketBase Data Model

Three collections: `organizations`, `contacts`, `notes`.

- `organizations.status` enum: `lead | contacted | responded | interested | offer_sent | customer | no_interest | paused`
- `contacts` always belong to an organization via `organization` relation field; `is_primary` bool marks the main contact
- `notes` can attach to an organization (`organization` FK), a contact (`contact` FK), or both; `type` enum: `internal | call | visit | email_in | email_out | other`; `content` is HTML (TipTap); `noted_at` is user-editable
- All collections use rule `@request.auth.id != ""` (login required for all operations)

**Collection setup:** `scripts/pb-setup.mjs` creates all collections via PocketBase REST API. PocketBase v0.23+ uses flat field options (no nested `options: {}` object).

## Key Conventions

- Path alias `@/` maps to `src/`
- `cn()` utility from `src/lib/utils.ts` (clsx + tailwind-merge) for conditional classnames
- Forms: React Hook Form + Zod. **Do not use `.default()` in Zod schemas** — it causes a type mismatch with `zodResolver`. Use `defaultValues` in `useForm` instead.
- Tables: native HTML `<table>` (not TanStack) — simpler, clickable rows via `router.push`
- Date formatting: date-fns with German locale (`de`)
- All UI text is in **German**
- `next.config.js` sets `output: 'standalone'` for Docker builds

## Design Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#3D5A80` | Navy blue — text, navigation, buttons |
| `accent` | `#F58220` | Orange — CTAs, badges |
| `cyan` | `#29B8D4` | Active states, icons |
| `navy` | `#2B4A7A` | Sidebar background (dark) |
| `terracotta` | `#C0532A` | Warnings |

Dark mode: `class` strategy via `next-themes`. `StatusBadge` (`src/components/organisationen/StatusBadge.tsx`) maps each lead status to a colored Badge. Days-since-contact color scale: green ≤7d → yellow ≤14d → orange ≤30d → red >30d.

## V2 Roadmap (next features to build)

Planned order per PRD:
1. **Produkte/Artikelkatalog** (`/produkte`) — article catalog as basis for quotes; waiting on final article list from user
2. **Angebote** (`/angebote`) — create/send/track quotes, PDF export via `@react-pdf/renderer`, §19 UStG notice; depends on Produkte
3. **Erinnerungen/Follow-ups** — reminder date per org/contact, shown in lead pipeline
4. **Dashboard** — KPIs: open leads, quotes, recent activity

New feature workflow: add to PRD → define PocketBase collection → extend `scripts/pb-setup.mjs` → build hook → components → pages → test via SSH tunnel → deploy.
