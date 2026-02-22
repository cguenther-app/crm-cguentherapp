# PRD – cguenther.app Mini-CRM
**Version:** 1.1
**Stand:** Februar 2026
**Autor:** Christian Günther
**Status:** MVP abgeschlossen – V2 in Planung

---

## 1. Ausgangslage & Ziel

cguenther.app ist ein Einzelgewerbe im IT-Dienstleistungsbereich mit Fokus auf kleine Unternehmen und Handwerksbetriebe im Raum Wipperfürth (ca. 10–15 km Radius). Die Kundenbasis ist überschaubar, aber der Überblick über Kontakte, Gesprächsverläufe und nächste Schritte fehlt heute.

**Ziel des MVPs** ist ein schlankes, selbst gehostetes CRM, das:
- Organisationen und ihre Kontakte strukturiert erfasst,
- Notizen mit Zeitstempeln pro Organisation/Kontakt ermöglicht,
- als Demo-Referenz für potenzielle Kunden dient,
- und die Basis für spätere Funktionen (Angebote, E-Mails, Rechnungen) legt.

---

## 2. Nutzer & Rollen (MVP)

| Rolle | Beschreibung |
|-------|-------------|
| Admin (= Christian) | Einziger Nutzer. Vollzugriff auf alle Daten. |

Authentifizierung ist erforderlich – die App ist nicht öffentlich zugänglich. Für den MVP genügt ein einzelner Login-Account (E-Mail + Passwort).

---

## 3. Tech-Stack

| Bereich | Technologie | Begründung |
|---------|-------------|------------|
| Framework | Next.js 14+ (App Router) | Moderne React-Basis, gute DX |
| Sprache | TypeScript 5+ | Typsicherheit |
| UI-Komponenten | shadcn/ui + Tailwind CSS | Schnell, barrierefrei, einfach anpassbar |
| Rich-Text | TipTap 2+ | Leichtgewichtiger Editor |
| Formulare | React Hook Form + Zod | Validierung, gute DX |
| Backend / Datenbank | PocketBase (Docker, self-hosted) | Single-Binary, Auth, SQLite |
| Hosting | Hetzner VPS via Docker Compose | Volle Datenkontrolle |
| Reverse Proxy | NGINX Proxy Manager | Subdomain + SSL |

### Deployment
```
Hetzner VPS
├── NGINX Proxy Manager → crm.cguenther.app → crm-frontend:3100
├── crm-frontend (Next.js, Port 3100 extern / 3000 intern)
└── crm-pocketbase (PocketBase, Port 8090 nur intern)
```

- PocketBase Admin-UI: SSH-Tunnel `ssh -L 8090:localhost:8090 root@server` → `http://localhost:8090/_/`
- Lokale Entwicklung: `npm run dev` + SSH-Tunnel für PocketBase

---

## 4. Features – MVP V1 ✅ Abgeschlossen

### 4.1 Authentifizierung ✅
- Login via E-Mail + Passwort
- Geschützte Routen (AuthGuard)
- Logout

### 4.2 Organisationsverwaltung ✅
- Liste mit Suche (Name, Branche, Ort) und Status-Filter
- Felder: Name, Branche, Adresse, Website, Telefon, Status, Tags
- Detailansicht mit Kontakten und Notizen-Timeline
- Anlegen / Bearbeiten / Löschen (mit Bestätigung)

### 4.3 Lead-Pipeline ✅
- Tabellenansicht: Firma, Branche, Status, Letzter Kontakt, Tage seit letztem Kontakt
- „Tage"-Spalte farblich (grün ≤7d → gelb ≤14d → orange ≤30d → rot >30d)
- Filter nach Status, Sortierung nach Tagen / Name / Status
- Letzter Kontakt = neueste Notiz der Organisation

**Lead-Status:**

| Status | Bedeutung |
|--------|-----------|
| `lead` | Identifiziert, noch nicht kontaktiert |
| `contacted` | Erste Mail/Anruf raus |
| `responded` | Hat geantwortet |
| `interested` | Möchte mehr wissen / Termin |
| `offer_sent` | Konkretes Angebot läuft |
| `customer` | Aktiver Kunde |
| `no_interest` | Kein Interesse |
| `paused` | Auf Eis gelegt |

### 4.4 Kontaktverwaltung ✅
- Kontakte immer einer Organisation zugeordnet
- Felder: Vorname, Nachname, Rolle, E-Mail, Telefon, Mobil, Hauptkontakt
- Anlegen per Dialog direkt in der Org-Detailansicht
- Globale Kontaktliste (`/kontakte`) mit Suche
- Eigene Detailansicht, Bearbeiten / Löschen

### 4.5 Notizen ✅
- Heftbar an Organisationen und Kontakte
- Rich-Text via TipTap (fett, kursiv, Listen)
- Typen: Intern, Telefonnotiz, Besuch, E-Mail-Ein/-Ausgang, Sonstige
- Datum manuell anpassbar
- Timeline (neueste oben), Bearbeiten / Löschen (mit Bestätigung)

---

## 5. Abnahmekriterien MVP

- [x] Login funktioniert, unauthentifizierte Zugriffe → `/login`
- [x] Organisationen anlegen, bearbeiten, suchen, löschen
- [x] Lead-Status pro Organisation setzbar
- [x] Lead-Übersicht mit Tage-Indikator und Farbkodierung
- [x] Lead-Übersicht nach Status filterbar
- [x] Kontakte pro Organisation verwalten
- [x] Notizen an Organisationen und Kontakte hängen
- [x] Rich-Text-Editor (TipTap)
- [x] Deployment auf Hetzner via Docker Compose

---

## 6. Roadmap V2

### Priorisierung

| Priorität | Feature | Aufwand | Beschreibung |
|-----------|---------|---------|--------------|
| 🔴 Hoch | **Angebote** | Groß | Angebote erstellen, versenden, Status tracken |
| 🔴 Hoch | **Erinnerungen / Follow-ups** | Mittel | Wiedervorlage-Datum pro Org/Kontakt, Hinweis in Lead-Pipeline |
| 🟡 Mittel | **Dashboard** | Mittel | KPIs: offene Leads, Angebote, letzte Aktivitäten |
| 🟡 Mittel | **Aktivitäten-Log** | Mittel | Automatisch protokollierte Statusänderungen |
| 🟡 Mittel | **Dateianhänge** | Mittel | Dokumente/Bilder an Org/Kontakt anhängen (PocketBase File Storage) |
| 🟢 Niedrig | **Kanban-View Leads** | Klein | Pipeline als Kanban-Board (Toggle zur Tabellenansicht) |
| 🟢 Niedrig | **Rechnungen** | Groß | Nach Angeboten, §19 UStG-Konformität |
| 🟢 Niedrig | **E-Mail-Integration** | Groß | SMTP-Versand, E-Mail als Timeline-Aktivität |
| 🟢 Niedrig | **Mehrnutzer** | Mittel | Zweiter Admin oder Lesezugriff |

---

## 7. Feature-Spezifikation: Angebote (V2, Prio 🔴)

### Konzept
Angebote werden direkt im CRM erstellt, an eine Organisation (und optional einen Kontakt) geheftet und als PDF exportiert. Der Status eines Angebots beeinflusst den Lead-Status der Organisation.

### Datenmodell
```
offers
  id            (uuid, PK)
  organization  (FK → organizations, required)
  contact       (FK → contacts, nullable)
  title         (text) – z.B. "Website-Relaunch Mai 2026"
  number        (text) – Angebotsnummer, z.B. "A-2026-001"
  status        (enum: draft | sent | accepted | rejected | expired)
  date          (date) – Angebotsdatum
  valid_until   (date) – Gültig bis
  positions     (json) – Array: [{title, qty, unit, price}]
  total         (number) – Gesamtbetrag (berechnet)
  notes         (text) – Interne Notiz zum Angebot
  created       (auto)
  updated       (auto)
```

### Status-Verknüpfung
Wenn ein Angebot angelegt wird → Org-Status automatisch auf `offer_sent` setzen (optional, mit Bestätigung).

### PDF-Export
- Client-seitig via `jsPDF` oder `@react-pdf/renderer`
- Vorlage basiert auf cguenther.app Corporate Design
- Pflichtangaben: §19 UStG-Hinweis (Kleinunternehmerregelung)

### UI
- `/angebote` – Liste aller Angebote mit Status und Betrag
- Angebot anlegen direkt aus Org-Detailansicht
- `/angebote/[id]` – Detailansicht mit Positionen und PDF-Export-Button
- Angebote erscheinen auch in der Org-Timeline

---

## 8. Vorgehen für neue Features

### Prozess
1. **Idee im PRD ergänzen** – grob beschreiben was es können soll
2. **Datenmodell klären** – welche neue PocketBase Collection? Welche Felder?
3. **Collection per Script anlegen** – `scripts/pb-setup.mjs` erweitern oder separates Script
4. **UI bauen** – Hook → Komponenten → Seiten
5. **Lokal testen** – SSH-Tunnel + `npm run dev`
6. **Deployen** – `git push` → `git pull` + `docker compose up -d --build crm-frontend`

### Faustregel Aufwand
| Aufwand | Beispiel | Dauer |
|---------|---------|-------|
| Klein | Kanban-Toggle, neue Spalte | 1–2h |
| Mittel | Erinnerungen, Dashboard | halber Tag |
| Groß | Angebote mit PDF | 1–2 Tage |

---

## 9. Datenmodell (aktuell implementiert)

```
organizations       → name, industry, address_*, website, phone, status, tags
contacts            → organization (FK), first_name, last_name, role, email, phone, mobile, is_primary
notes               → organization (FK, nullable), contact (FK, nullable), type, content, noted_at, created_by
users               → PocketBase Auth-Collection (E-Mail + Passwort)
```

---

## 10. Design-Token

| Token | Hex | Verwendung |
|-------|-----|-----------|
| Primary | `#3D5A80` | Navigation, Schrift |
| Accent | `#F58220` | CTAs, Badges |
| Cyan | `#29B8D4` | Icons, aktive Zustände |
| Navy | `#2B4A7A` | Sidebar Dark |
| Terracotta | `#C0532A` | Warnungen |

Dark Mode via `next-themes`, Tailwind `darkMode: 'class'`.

---

*Dieses Dokument ist lebendig – bei jedem neuen Feature hier zuerst dokumentieren.*
