'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Receipt, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRechnungen } from '@/hooks/useRechnungen'
import { RechnungStatusBadge } from '@/components/rechnungen/RechnungStatusBadge'
import { KPICard } from '@/components/ui/KPICard'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

function isOverdue(invoice: { status: string; due_date: string }) {
  return invoice.status === 'open' && !!invoice.due_date && new Date(invoice.due_date) < new Date()
}

export default function RechnungenPage() {
  const { rechnungen, isLoading, error } = useRechnungen()
  const router = useRouter()
  const [search, setSearch] = useState('')

  const open = rechnungen.filter((r) => r.status === 'open')
  const openSum = open.reduce((sum, r) => sum + (r.total ?? 0), 0)
  const overdue = rechnungen.filter(isOverdue)
  const paid = rechnungen.filter((r) => r.status === 'paid')
  const paidSum = paid.reduce((sum, r) => sum + (r.total ?? 0), 0)
  const totalSum = rechnungen.filter((r) => r.status !== 'cancelled').reduce((sum, r) => sum + (r.total ?? 0), 0)

  const filtered = rechnungen.filter((r) => {
    const q = search.toLowerCase()
    const orgName = r.expand?.organization?.name ?? ''
    return (
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.number.toLowerCase().includes(q) ||
      orgName.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Receipt className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Rechnungen</h1>
        </div>
        <Link href="/rechnungen/neu">
          <Button className="bg-accent hover:bg-accent/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Neue Rechnung
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard
          label="Offen"
          value={open.length}
          sub={openSum > 0 ? `${openSum.toFixed(2)} €` : undefined}
          colorClass="text-blue-600"
          isLoading={isLoading}
        />
        <KPICard
          label="Überfällig"
          value={overdue.length}
          colorClass="text-destructive"
          isLoading={isLoading}
        />
        <KPICard
          label="Bezahlt"
          value={paid.length}
          sub={paidSum > 0 ? `${paidSum.toFixed(2)} €` : undefined}
          colorClass="text-green-600"
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
          <p className="text-destructive">Fehler beim Laden der Rechnungen.</p>
          <p className="text-muted-foreground">
            Die <code className="font-mono bg-muted px-1 rounded">invoices</code>-Collection fehlt wahrscheinlich in PocketBase. Bitte ausführen:
          </p>
          <pre className="font-mono bg-muted text-xs px-3 py-2 rounded">
            node scripts/pb-setup-invoices.mjs &lt;email&gt; &lt;password&gt;
          </pre>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Keine Rechnungen gefunden.</p>
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
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Fällig</th>
                <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">Gesamt</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => router.push(`/rechnungen/${r.id}`)}
                  className="border-t hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {r.number}
                  </td>
                  <td className="px-4 py-3 font-medium">{r.title}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {r.expand?.organization?.name ?? '–'}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <RechnungStatusBadge status={r.status} isOverdue={isOverdue(r)} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {r.date
                      ? format(new Date(r.date), 'dd.MM.yyyy', { locale: de })
                      : '–'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {r.due_date
                      ? format(new Date(r.due_date), 'dd.MM.yyyy', { locale: de })
                      : '–'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium hidden lg:table-cell">
                    {r.total > 0 ? `${r.total.toFixed(2)} €` : '–'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && (
        <p className="text-xs text-muted-foreground mt-2">
          {filtered.length} Rechnung{filtered.length !== 1 ? 'en' : ''}
        </p>
      )}
    </div>
  )
}
