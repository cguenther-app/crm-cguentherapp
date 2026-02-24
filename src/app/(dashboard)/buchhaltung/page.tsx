'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { BookOpen, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KPICard } from '@/components/ui/KPICard'
import { Badge } from '@/components/ui/badge'
import { useBuchhaltung } from '@/hooks/useBuchhaltung'
import { ENTRY_TYPE_LABELS } from '@/types'
import { downloadCsv } from '@/lib/exportCsv'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const EuerPDFButton = dynamic(
  () => import('@/components/buchhaltung/EuerPDF').then((m) => m.EuerPDFButton),
  { ssr: false, loading: () => <Button variant="outline" size="sm" disabled>PDF...</Button> }
)

// ─── Preset helpers ───────────────────────────────────────────────────────────

const now = new Date()
const CY = now.getFullYear()

function lastDayOf(year: number, month: number) {
  return new Date(year, month + 1, 0).toISOString().slice(0, 10)
}

type Preset = {
  id: string
  label: string
  from: string
  to: string
}

function buildPresets(): Preset[] {
  return [
    {
      id: 'year',
      label: 'Dieses Jahr',
      from: `${CY}-01-01`,
      to: `${CY}-12-31`,
    },
    {
      id: 'lastyear',
      label: 'Letztes Jahr',
      from: `${CY - 1}-01-01`,
      to: `${CY - 1}-12-31`,
    },
    {
      id: 'q1',
      label: 'Q1',
      from: `${CY}-01-01`,
      to: lastDayOf(CY, 2),
    },
    {
      id: 'q2',
      label: 'Q2',
      from: `${CY}-04-01`,
      to: lastDayOf(CY, 5),
    },
    {
      id: 'q3',
      label: 'Q3',
      from: `${CY}-07-01`,
      to: lastDayOf(CY, 8),
    },
    {
      id: 'q4',
      label: 'Q4',
      from: `${CY}-10-01`,
      to: lastDayOf(CY, 11),
    },
    {
      id: 'month',
      label: 'Dieser Monat',
      from: new Date(CY, now.getMonth(), 1).toISOString().slice(0, 10),
      to: lastDayOf(CY, now.getMonth()),
    },
  ]
}

const PRESETS = buildPresets()

/** Derive a human-readable label from a date range for filenames / PDF titles */
function rangeLabel(from: string, to: string): string {
  // Whole year?
  if (from === `${CY}-01-01` && to === `${CY}-12-31`) return String(CY)
  if (from === `${CY - 1}-01-01` && to === `${CY - 1}-12-31`) return String(CY - 1)
  // Quarter?
  const preset = PRESETS.find((p) => p.from === from && p.to === to)
  if (preset && preset.id.startsWith('q')) return `${preset.label} ${CY}`
  // Whole month?
  if (from && to) {
    const f = new Date(from)
    const t = new Date(to)
    const firstOfMonth = new Date(f.getFullYear(), f.getMonth(), 1)
    const lastOfMonth = new Date(f.getFullYear(), f.getMonth() + 1, 0)
    if (
      f.getTime() === firstOfMonth.getTime() &&
      t.getTime() === lastOfMonth.getTime() &&
      f.getMonth() === t.getMonth()
    ) {
      return format(f, 'MMMM yyyy', { locale: de })
    }
  }
  // Custom range
  const fmt = (s: string) => (s ? format(new Date(s), 'dd.MM.yyyy', { locale: de }) : '?')
  return `${fmt(from)} – ${fmt(to)}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BuchhaltungPage() {
  const { entries, isLoading, error } = useBuchhaltung()
  const router = useRouter()

  const [from, setFrom] = useState(PRESETS[0].from)
  const [to, setTo] = useState(PRESETS[0].to)
  const [activePreset, setActivePreset] = useState<string>('year')

  function applyPreset(p: Preset) {
    setFrom(p.from)
    setTo(p.to)
    setActivePreset(p.id)
  }

  function handleFromChange(v: string) {
    setFrom(v)
    setActivePreset('custom')
  }

  function handleToChange(v: string) {
    setTo(v)
    setActivePreset('custom')
  }

  const filtered = useMemo(
    () => entries.filter((e) => e.date >= from && e.date <= to),
    [entries, from, to]
  )

  const income = filtered.filter((e) => e.type === 'income')
  const expenses = filtered.filter((e) => e.type === 'expense')
  const totalIncome = income.reduce((s, e) => s + (e.amount ?? 0), 0)
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount ?? 0), 0)
  const profit = totalIncome - totalExpenses

  const label = rangeLabel(from, to)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Buchhaltung</h1>
        </div>
        <Link href="/buchhaltung/neu">
          <Button className="bg-accent hover:bg-accent/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Neuer Eintrag
          </Button>
        </Link>
      </div>

      {/* ── Filter card ── */}
      <div className="rounded-lg border bg-muted/30 p-4 mb-6 space-y-3">
        {/* Preset chips */}
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium border transition-colors',
                activePreset === p.id
                  ? 'bg-primary text-white border-primary'
                  : 'bg-background border-border text-muted-foreground hover:border-primary hover:text-primary'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom range inputs */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Von</span>
          <Input
            type="date"
            value={from}
            onChange={(e) => handleFromChange(e.target.value)}
            className="w-38 h-8 text-sm"
          />
          <span className="text-xs text-muted-foreground">bis</span>
          <Input
            type="date"
            value={to}
            onChange={(e) => handleToChange(e.target.value)}
            className="w-38 h-8 text-sm"
          />
          <span className="ml-auto text-xs text-muted-foreground italic hidden sm:block">
            {label}
          </span>
        </div>

        {/* Export buttons */}
        <div className="flex gap-2 pt-1 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadCsv(filtered, label)}
            disabled={filtered.length === 0}
          >
            CSV
          </Button>
          <EuerPDFButton entries={filtered} label={label} />
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard
          label="Einnahmen"
          value={`${totalIncome.toFixed(2)} €`}
          colorClass="text-green-600"
          isLoading={isLoading}
        />
        <KPICard
          label="Ausgaben"
          value={`${totalExpenses.toFixed(2)} €`}
          colorClass="text-destructive"
          isLoading={isLoading}
        />
        <KPICard
          label="Gewinn"
          value={`${profit.toFixed(2)} €`}
          colorClass={profit >= 0 ? 'text-primary' : 'text-destructive'}
          isLoading={isLoading}
        />
        <KPICard
          label="Einträge"
          value={filtered.length}
          isLoading={isLoading}
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Laden...</p>
      ) : error ? (
        <div className="text-sm space-y-2">
          <p className="text-destructive">Fehler beim Laden der Buchhaltungseinträge.</p>
          <p className="text-muted-foreground">
            Die <code className="font-mono bg-muted px-1 rounded">accounting_entries</code>-Collection fehlt wahrscheinlich. Bitte ausführen:
          </p>
          <pre className="font-mono bg-muted text-xs px-3 py-2 rounded">
            node scripts/pb-setup-accounting.mjs &lt;email&gt; &lt;password&gt;
          </pre>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Keine Einträge für {label}.</p>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Datum</th>
                <th className="text-left px-4 py-3 font-medium">Typ</th>
                <th className="text-left px-4 py-3 font-medium">Beschreibung</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Kategorie</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Belegnr.</th>
                <th className="text-right px-4 py-3 font-medium">Betrag</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  onClick={() => router.push(`/buchhaltung/${e.id}`)}
                  className="border-t hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {e.date ? format(new Date(e.date), 'dd.MM.yyyy', { locale: de }) : '–'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={
                        e.type === 'income'
                          ? 'border-green-500 text-green-700 dark:text-green-400'
                          : 'border-destructive text-destructive'
                      }
                    >
                      {ENTRY_TYPE_LABELS[e.type]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{e.description || '–'}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {e.category || '–'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground hidden md:table-cell">
                    {e.reference_number || '–'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    <span className={e.type === 'income' ? 'text-green-700 dark:text-green-400' : ''}>
                      {e.amount?.toFixed(2) ?? '0.00'} €
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && !error && (
        <p className="text-xs text-muted-foreground mt-2">
          {filtered.length} Eintrag{filtered.length !== 1 ? 'träge' : ''} · {label}
        </p>
      )}
    </div>
  )
}
