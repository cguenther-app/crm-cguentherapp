# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Next.js dev server on port 3000
npm run build      # Production build (outputs standalone bundle)
npm run start      # Run production build locally
npm run lint       # ESLint via next lint
```

For local development with PocketBase:
```bash
docker compose up crm-pocketbase   # Start only the PocketBase backend
docker compose up -d --build       # Full stack (PocketBase + Next.js)
```

Environment setup:
```bash
cp .env.example .env.local
# For local dev, set: NEXT_PUBLIC_POCKETBASE_URL=http://localhost:8090
```

Add shadcn/ui components:
```bash
npx shadcn@latest add <component>
```

## Architecture

**Full stack:** Next.js 14 (App Router) frontend + PocketBase backend, both running as Docker containers on a Hetzner VPS. Next.js is the only public-facing service; PocketBase runs in the internal Docker network (`crm-internal`). PocketBase Admin UI is accessed exclusively via SSH tunnel: `ssh -L 8090:crm-pocketbase:8090 user@server`.

**Data flow:** All PocketBase calls are made from Next.js server components/actions using `POCKETBASE_URL` (internal Docker hostname). The browser uses `NEXT_PUBLIC_POCKETBASE_URL` for client-side hooks.

**App Router structure:**
- `/` → redirects to `/leads`
- `/leads` → pipeline table view with optional Kanban toggle
- `/organisationen` → organization list + create
- `/organisationen/[id]` → detail with contacts and notes timeline
- `/kontakte/[id]` → contact detail with notes timeline
- `/login` → login page (no sidebar/shell)

**Component layers:**
- `src/components/layout/` — AppShell wraps Sidebar (desktop) + BottomNav (mobile ≤768px) + ThemeToggle
- `src/components/ui/` — auto-generated shadcn/ui primitives; never edit manually
- `src/lib/pocketbase.ts` — singleton PocketBase client instance
- `src/lib/auth.ts` — login, logout, session check
- `src/hooks/` — data-fetching hooks (`useOrganisationen`, `useKontakte`, `useNotizen`, `useAuth`)
- `src/types/index.ts` — all TypeScript entity types

## PocketBase Data Model

Three collections: `organizations`, `contacts`, `notes`.

- `organizations.status` enum: `lead | contacted | responded | interested | offer_sent | customer | no_interest | paused`
- `contacts` always belong to an organization via `organization` relation field; `is_primary` bool marks the main contact
- `notes` can attach to an organization, a contact, or both — client-side validation ensures at least one is set; `type` enum: `internal | call | visit | email_in | email_out | other`
- `notes.content` is HTML (Rich-Text via TipTap); `noted_at` is user-editable, `created` is automatic

## Design Tokens

UI language is **German** throughout. Brand colors from logo:

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#3D5A80` | Navy blue — text, navigation |
| `accent` | `#F58220` | Orange — CTAs, badges |
| `cyan` | `#29B8D4` | Active states, icons |
| `navy` | `#2B4A7A` | Sidebar background (dark) |
| `terracotta` | `#C0532A` | Warnings, secondary accents |

Dark mode uses `class` strategy via `next-themes`. Tailwind `darkMode: 'class'` is set.

Lead status badge colors and the "days since last contact" column color scale (green 0–7d → yellow 8–14d → orange 15–30d → red >30d) are defined in `src/components/leads/StatusBadge.tsx` and `LeadTable.tsx`.

## Key Conventions

- Path alias `@/` maps to `src/`
- `cn()` utility from `src/lib/utils.ts` (clsx + tailwind-merge) for conditional classnames
- Forms use React Hook Form + Zod validation
- Tables use TanStack Table v8
- Date formatting via date-fns
- `next.config.js` sets `output: 'standalone'` for the Docker build
