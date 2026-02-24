'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const RELEASES = [
  {
    version: '1.3.0',
    date: '2026-02-24',
    changes: [
      'KPI-Kacheln auf allen Listenseiten (Angebote, Organisationen, Kontakte, Produkte)',
    ],
  },
  {
    version: '1.2.0',
    date: '2025-12-01',
    changes: [
      'Angebote-Modul: CRUD, PDF-Export, Katalog-Picker, Status-Workflow',
      'Org-Status wird bei angenommenem Angebot automatisch auf "Kunde" gesetzt',
    ],
  },
  {
    version: '1.1.0',
    date: '2025-11-01',
    changes: [
      'Produkte / Artikelkatalog: CRUD-Pages, Kategorien, Abrechnungstypen',
    ],
  },
  {
    version: '1.0.0',
    date: '2025-10-01',
    changes: [
      'Organisationen: Liste, Suche, Statusfilter, Detail, CRUD',
      'Kontakte: Liste, Detail, CRUD, Hauptkontakt-Markierung',
      'Notizen: TipTap-Editor, Timeline, Typen (Anruf, Besuch, E-Mail …)',
      'Lead-Pipeline: Tabellenansicht mit Tage-seit-Kontakt-Farbskala',
      'Dark Mode, responsive Layout (Sidebar Desktop / BottomNav Mobile)',
      'Login / Auth via PocketBase',
    ],
  },
]

export function AppInfoModal() {
  const [open, setOpen] = useState(false)
  const current = RELEASES[0]

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={() => setOpen(true)}
        title="App-Info"
      >
        <Info className="h-4 w-4" />
        <span className="sr-only">App-Info</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              cguenther.app CRM
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground -mt-2">
            Aktuelle Version: <span className="font-medium text-foreground">v{current.version}</span>
          </p>

          <div className="space-y-5 mt-2">
            {RELEASES.map((r) => (
              <div key={r.version}>
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="font-semibold text-sm">v{r.version}</span>
                  <span className="text-xs text-muted-foreground">{r.date}</span>
                </div>
                <ul className="space-y-1">
                  {r.changes.map((c, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
