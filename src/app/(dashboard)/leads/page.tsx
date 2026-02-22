'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, Search } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusBadge } from '@/components/organisationen/StatusBadge'
import { Organization, Note, LEAD_STATUS, LEAD_STATUS_LABELS } from '@/types'
import { cn } from '@/lib/utils'
import pb from '@/lib/pocketbase'

interface LeadRow extends Organization {
  lastContactDate: string | null
  daysSince: number | null
}

function getDaysSince(dateStr: string | null): number | null {
  if (!dateStr) return null
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
}

function daysClass(days: number | null) {
  if (days === null) return 'text-muted-foreground'
  if (days <= 7)  return 'text-green-600 dark:text-green-400 font-medium'
  if (days <= 14) return 'text-yellow-600 dark:text-yellow-400 font-medium'
  if (days <= 30) return 'text-orange-500 dark:text-orange-400 font-medium'
  return 'text-red-500 dark:text-red-400 font-medium'
}

type SortKey = 'days' | 'name' | 'status'

export default function LeadsPage() {
  const router = useRouter()
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState<SortKey>('days')

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const [orgs, notes] = await Promise.all([
          pb.collection('organizations').getFullList<Organization>({ sort: 'name' }),
          pb.collection('notes').getFullList<Pick<Note, 'id' | 'organization' | 'noted_at'>>({
            sort: '-noted_at',
            fields: 'id,organization,noted_at',
          }),
        ])

        // Für jede Org: neueste Notiz merken (notes sind DESC sortiert → erste treffer gewinnt)
        const latestNote = new Map<string, string>()
        for (const note of notes) {
          if (note.organization && !latestNote.has(note.organization)) {
            latestNote.set(note.organization, note.noted_at)
          }
        }

        setLeads(
          orgs.map((org) => {
            const lastContactDate = latestNote.get(org.id) ?? null
            return { ...org, lastContactDate, daysSince: getDaysSince(lastContactDate) }
          })
        )
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const filtered = leads
    .filter((l) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        l.name.toLowerCase().includes(q) ||
        l.industry?.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || l.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'days') {
        // Nie kontaktiert → ganz oben (höchste Priorität)
        if (a.daysSince === null && b.daysSince === null) return 0
        if (a.daysSince === null) return -1
        if (b.daysSince === null) return 1
        return b.daysSince - a.daysSince
      }
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'de')
      if (sortBy === 'status') return a.status.localeCompare(b.status)
      return 0
    })

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Lead-Pipeline</h1>
      </div>

      {/* Filter + Sortierung */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suche nach Firma oder Branche..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            {LEAD_STATUS.map((s) => (
              <SelectItem key={s} value={s}>
                {LEAD_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="days">Sortierung: Tage ↓</SelectItem>
            <SelectItem value="name">Sortierung: Name</SelectItem>
            <SelectItem value="status">Sortierung: Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabelle */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Laden...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Keine Einträge gefunden.</p>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Firma</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Branche</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">
                  Letzter Kontakt
                </th>
                <th className="text-left px-4 py-3 font-medium">Tage</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => router.push(`/organisationen/${lead.id}`)}
                  className="border-t hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{lead.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {lead.industry || '–'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {lead.lastContactDate
                      ? format(new Date(lead.lastContactDate), 'dd.MM.yyyy', { locale: de })
                      : '–'}
                  </td>
                  <td className={cn('px-4 py-3', daysClass(lead.daysSince))}>
                    {lead.daysSince === null ? 'Nie' : `${lead.daysSince}d`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && (
        <p className="text-xs text-muted-foreground mt-2">
          {filtered.length} Organisation{filtered.length !== 1 ? 'en' : ''}
        </p>
      )}
    </div>
  )
}
