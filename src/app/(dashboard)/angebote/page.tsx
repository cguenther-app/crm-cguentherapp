'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FileText, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAngebote } from '@/hooks/useAngebote'
import { AngebotStatusBadge } from '@/components/angebote/AngebotStatusBadge'
import { KPICard } from '@/components/ui/KPICard'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export default function AngebotePage() {
  const { angebote, isLoading, error } = useAngebote()
  const router = useRouter()
  const [search, setSearch] = useState('')

  const accepted = angebote.filter((a) => a.status === 'accepted')
  const acceptedSum = accepted.reduce((sum, a) => sum + (a.total ?? 0), 0)
  const pending = angebote.filter((a) => a.status === 'draft' || a.status === 'sent')
  const declined = angebote.filter((a) => a.status === 'rejected' || a.status === 'expired')
  const totalSum = angebote.reduce((sum, a) => sum + (a.total ?? 0), 0)

  const filtered = angebote.filter((a) => {
    const q = search.toLowerCase()
    const orgName = a.expand?.organization?.name ?? ''
    return (
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.number.toLowerCase().includes(q) ||
      orgName.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Angebote</h1>
        </div>
        <Link href="/angebote/neu">
          <Button className="bg-accent hover:bg-accent/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Neues Angebot
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard
          label="Angenommen"
          value={accepted.length}
          sub={acceptedSum > 0 ? `${acceptedSum.toFixed(2)} €` : undefined}
          colorClass="text-green-600"
          isLoading={isLoading}
        />
        <KPICard
          label="Ausstehend"
          value={pending.length}
          colorClass="text-yellow-600"
          isLoading={isLoading}
        />
        <KPICard
          label="Abgelehnt / Abgelaufen"
          value={declined.length}
          colorClass="text-destructive"
          isLoading={isLoading}
        />
        <KPICard
          label="Gesamtvolumen"
          value={totalSum > 0 ? `${totalSum.toFixed(2)} €` : '–'}
          isLoading={isLoading}
        />
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Suche nach Titel, Nummer, Organisation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Laden...</p>
      ) : error ? (
        <div className="text-sm space-y-2">
          <p className="text-destructive">Fehler beim Laden der Angebote.</p>
          <p className="text-muted-foreground">
            Die <code className="font-mono bg-muted px-1 rounded">offers</code>-Collection fehlt wahrscheinlich in PocketBase. Bitte ausführen:
          </p>
          <pre className="font-mono bg-muted text-xs px-3 py-2 rounded">
            node scripts/pb-setup-offers.mjs &lt;email&gt; &lt;password&gt;
          </pre>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Keine Angebote gefunden.</p>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Nr.</th>
                <th className="text-left px-4 py-3 font-medium">Titel</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Organisation</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Status</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Datum</th>
                <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">Gesamt</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => router.push(`/angebote/${a.id}`)}
                  className="border-t hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {a.number}
                  </td>
                  <td className="px-4 py-3 font-medium">{a.title}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {a.expand?.organization?.name ?? '–'}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <AngebotStatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {a.date
                      ? format(new Date(a.date), 'dd.MM.yyyy', { locale: de })
                      : '–'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium hidden lg:table-cell">
                    {a.total > 0 ? `${a.total.toFixed(2)} €` : '–'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && (
        <p className="text-xs text-muted-foreground mt-2">
          {filtered.length} Angebot{filtered.length !== 1 ? 'e' : ''}
        </p>
      )}
    </div>
  )
}
