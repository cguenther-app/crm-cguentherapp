# PRD – cguenther.app Mini-CRM
**Version:** 0.1 (MVP)  
**Stand:** Februar 2026  
**Autor:** Christian Günther  
**Status:** Entwurf

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
| Frontend | Next.js 14+ (App Router) | Moderne React-Basis, gute DX, SSR/SSG-Optionen |
| UI-Komponenten | shadcn/ui + Tailwind CSS | Schnell, barrierefrei, einfach anpassbar |
| Backend / Datenbank | **PocketBase** (Docker, self-hosted) | Single-Binary, integrierte Auth, File Storage, Admin-UI, SQLite |
| Authentifizierung | PocketBase Auth | E-Mail + Passwort (MVP); OAuth2 (Google, GitHub etc.) nachrüstbar |
| Hosting | Hetzner VPS (bestehend) via Docker Compose | Volle Datenkontrolle, kein SaaS-Abhängigkeit |
| Reverse Proxy | NGINX (bestehend) | Nur Next.js-Frontend wird nach außen exposed |
| Sprache / Locale | Deutsch (DE) | Zielgruppe und Betreiber deutsch |

### Architektur

```
Hetzner VPS
├── NGINX (Reverse Proxy, bereits vorhanden)
│   └── crm.cguenther.app → crm-frontend:3000
├── cguenther.app Website (bereits vorhanden)
├── Analytics Tool (bereits vorhanden)
├── crm-frontend (Next.js Container, Port 3000 intern)
└── crm-pocketbase (PocketBase Container, Port 8090 intern)
```

- **PocketBase ist nicht öffentlich erreichbar** – nur im internen Docker-Netzwerk
- **Next.js** kommuniziert server-seitig mit PocketBase über das interne Netzwerk (`http://crm-pocketbase:8090`)
- **PocketBase Admin-UI** ist per SSH-Tunnel erreichbar: `ssh -L 8090:crm-pocketbase:8090 user@server` → dann `http://localhost:8090/_/` im Browser öffnen
- **Dateianhänge** liegen lokal im PocketBase-Datenverzeichnis (per Docker Volume gemountet)

---

## 4. Features – MVP (V1)

### 4.1 Authentifizierung
- Login via E-Mail + Passwort
- Geschützte Routen – kein Zugriff ohne Session
- Logout-Funktion
- Kein Self-Registration (manuell angelegt)

### 4.2 Organisationsverwaltung
- Liste aller Organisationen (tabellarisch, durchsuchbar, sortierbar)
- Felder einer Organisation:
  - Name *(Pflichtfeld)*
  - Branche / Kategorie (z. B. Maler, Elektriker, Zimmermann)
  - Adresse (Straße, PLZ, Ort)
  - Website
  - Telefon
  - Status (siehe Lead-Status unten)
  - Tags (Freitext, kommagetrennt)
  - Erstellt am / Zuletzt geändert am *(automatisch)*
- Detailansicht einer Organisation:
  - Alle Felder
  - Liste der zugeordneten Kontakte
  - Notizen-Timeline (chronologisch, neueste oben)
- Neue Organisation anlegen / bearbeiten / löschen

### 4.3 Lead-Tracking & Pipeline-Übersicht

**Lead-Status (Enum):**

| Status | Bedeutung |
|--------|-----------|
| `lead` | Identifiziert, noch nicht kontaktiert |
| `contacted` | Erste Mail/Anruf raus, keine Reaktion |
| `responded` | Hat geantwortet (positiv oder neutral) |
| `interested` | Möchte mehr wissen / Termin vereinbart |
| `offer_sent` | Konkretes Angebot läuft |
| `customer` | Aktiver Kunde |
| `no_interest` | Abgesagt oder nach Follow-up keine Reaktion |
| `paused` | Auf Eis gelegt |

**Lead-Übersichtsseite (`/leads`):**
- Tabellenansicht mit Spalten: Firma, Branche, Status, Letzter Kontakt (Datum der letzten Notiz), Tage seit letztem Kontakt, Nächste Aktion
- Spalte "Tage seit letztem Kontakt" farblich hinterlegt (grün → gelb → rot) – sofort sichtbar wer überfällig ist
- Filterbar nach Status
- Sortierbar nach Datum / Status
- Optional als Toggle: Kanban-View (Spalten = Status, Karten = Organisationen)

### 4.4 Kontaktverwaltung
- Kontakte sind immer einer Organisation zugeordnet (n Kontakte pro Organisation)
- Felder eines Kontakts:
  - Vorname, Nachname *(Pflichtfeld)*
  - Position / Rolle
  - E-Mail
  - Telefon / Mobil
  - Ist Hauptkontakt (Boolean)
  - Notizen-Timeline (chronologisch, neueste oben)
- Kontakt kann direkt aus der Organisationsansicht angelegt werden
- Eigene Detailansicht für Kontakte
- Bearbeiten / Löschen

### 4.5 Notizen mit Zeitstempel
- Notizen können an **Organisationen** und an **Kontakte** geheftet werden
- Felder:
  - Inhalt (Rich-Text via **TipTap** – fett, kursiv, Listen, Links)
  - Typ (intern, Telefonnotiz, Besuch, E-Mail-Eingang, E-Mail-Ausgang, Sonstige)
  - Zeitstempel *(automatisch gesetzt, manuell editierbar)*
  - Erstellt von (in MVP immer Christian, für spätere Mehrnutzer vorbereitet)
- Timeline-Ansicht auf Organisations- und Kontakt-Detailseite
- Notiz anlegen, bearbeiten, löschen
- Suche/Filter in der Timeline nach Typ

---

## 5. Features – Roadmap (V2+)

Diese Features werden im PRD skizziert, aber nicht im MVP implementiert. Das Datenbankschema soll sie jedoch **nicht ausschließen**.

| Feature | Beschreibung |
|---------|-------------|
| Angebote erstellen | PDF-Angebot auf Basis der cguenther.app-Vorlage direkt im System generieren |
| Rechnungen erstellen | Analog zu Angeboten, mit §19 UStG-Konformität |
| E-Mails aus dem System | SMTP-Integration; E-Mail wird als Aktivität in der Timeline gespeichert |
| Aktivitäten-Log | Automatisch protokollierte Statusänderungen, nicht nur manuelle Notizen |
| Mehrnutzer | Zweiter Admin oder eingeschränkte Rolle (Lesezugriff) |
| Dashboard | Übersicht: Anzahl Leads, offene Angebote, letzte Aktivitäten |
| Dateianhänge | Dokumente/Bilder an Organisationen oder Kontakte anhängen |
| Erinnerungen / Follow-ups | Datum-basierte Wiedervorlagen pro Kontakt/Organisation |

---

## 6. Datenmodell (vereinfacht)

```
organizations
  id (uuid, PK)
  name (text, not null)
  industry (text)
  address_street (text)
  address_zip (text)
  address_city (text)
  website (text)
  phone (text)
  status (enum: lead | contacted | responded | interested | offer_sent | customer | no_interest | paused)
  tags (text[])
  created_at (timestamptz)
  updated_at (timestamptz)

contacts
  id (uuid, PK)
  organization_id (uuid, FK → organizations)
  first_name (text, not null)
  last_name (text, not null)
  role (text)
  email (text)
  phone (text)
  mobile (text)
  is_primary (boolean, default false)
  created_at (timestamptz)
  updated_at (timestamptz)

notes
  id (uuid, PK)
  organization_id (uuid, FK → organizations, nullable)
  contact_id (uuid, FK → contacts, nullable)
  -- constraint: mindestens eines der beiden muss gesetzt sein
  type (enum: internal | call | visit | email_in | email_out | other)
  content (text, not null)
  noted_at (timestamptz, default now())
  created_at (timestamptz)
  updated_at (timestamptz)
  created_by (uuid, FK → users)
```

---

## 7. UX & Design

- **Responsive:** Mobile-first, funktioniert auf Smartphone, Tablet und Desktop
- **Farbschema:** Aus dem cguenther.app Logo extrahiert:
  - Primary Blue: `#3D5A80` (Schrift, Navigation)
  - Accent Orange: `#F58220` (CTAs, Highlights, Badges)
  - Cyan: `#29B8D4` (Icons, aktive Zustände)
  - Navy: `#2B4A7A` (Sidebar-Hintergrund Dark)
  - Terracotta: `#C0532A` (Warnungen, sekundäre Akzente)
- **Dark/Light-Mode:** Umschalter in der Sidebar, Präferenz wird im Browser gespeichert
- **Navigation:** Sidebar links (Desktop) / Bottom-Nav (Mobil, ≤ 768px)
- **Logo:** cguenther.app Logo in der Sidebar oben; Favicon (rechteckige Variante) als Browser-Icon
- **Hauptbereiche:**
  - `/` → Redirect zu `/leads`
  - `/leads` → Pipeline-Übersicht (Tabelle + optionaler Kanban-Toggle)
  - `/organisationen` → Listenansicht aller Organisationen
  - `/organisationen/[id]` → Detailansicht mit Kontakten & Timeline
  - `/kontakte/[id]` → Kontakt-Detailansicht mit Timeline
  - `/login` → Login-Seite (ohne Sidebar)

---

## 8. Nicht-funktionale Anforderungen

| Anforderung | Ziel |
|-------------|------|
| Performance | Seitenload < 2 Sekunden auf normaler DSL-Verbindung |
| Datenschutz | Kundendaten verbleiben auf eigenem Server (bei PocketBase-Option) |
| Sicherheit | Alle Routen hinter Auth; HTTPS zwingend |
| Wartbarkeit | Saubere Komponentenstruktur; einfach erweiterbar für V2-Features |
| Demotauglichkeit | Sauber genug, um Kunden als Referenz-Implementierung gezeigt zu werden |

---

## 9. Offene Punkte / Entscheidungen

| # | Thema | Optionen | Entscheidung |
|---|-------|----------|--------------|
| 1 | Backend-Wahl | Supabase vs. PocketBase | ✅ **PocketBase (Docker, Hetzner)** |
| 2 | Hosting-Infrastruktur | Vercel + Cloud vs. eigener VPS | ✅ **Hetzner VPS, Docker Compose, NGINX** |
| 3 | Editor für Notizen | Textarea vs. Rich-Text (TipTap) | ✅ **TipTap (leichter Rich-Text-Editor)** |
| 4 | Suche | Client-seitig vs. Server-seitig | V1: client-seitig |
| 5 | i18n | Nur Deutsch vs. mehrsprachig | V1: nur Deutsch |

---

## 10. Abnahmekriterien MVP

- [ ] Login funktioniert, unauthentifizierte Zugriffe werden auf `/login` umgeleitet
- [ ] Organisationen können angelegt, bearbeitet, gesucht und gelöscht werden
- [ ] Lead-Status kann pro Organisation gesetzt werden
- [ ] Lead-Übersicht zeigt Firma, Status, letzten Kontakt und Tage seit letztem Kontakt
- [ ] Lead-Übersicht ist nach Status filterbar und farblich kodiert
- [ ] Pro Organisation können beliebig viele Kontakte verwaltet werden
- [ ] Notizen können an Organisationen und Kontakte geheftet werden, inkl. Typ und Zeitstempel
- [ ] Notiz-Editor unterstützt Rich-Text (fett, kursiv, Listen, Links) via TipTap
- [ ] Die Timeline ist chronologisch sortiert und nach Typ filterbar
- [ ] Die App ist auf Mobilgeräten vollständig bedienbar
- [ ] Deployment läuft stabil auf Hetzner VPS via Docker Compose

---

*Dieses Dokument ist lebendig – Änderungen und Ergänzungen werden versioniert.*
