'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useOrganisationen } from '@/hooks/useOrganisationen'
import { StatusBadge } from '@/components/organisationen/StatusBadge'
import { KPICard } from '@/components/ui/KPICard'
import { LEAD_STATUS, LEAD_STATUS_LABELS } from '@/types'

export default function OrganisationenPage() {
  const { orgs, isLoading } = useOrganisationen()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const countLeads = orgs.filter((o) => o.status === 'lead').length
  const countInterested = orgs.filter((o) => o.status === 'interested' || o.status === 'responded').length
  const countOfferSent = orgs.filter((o) => o.status === 'offer_sent').length
  const countCustomers = orgs.filter((o) => o.status === 'customer').length

  const filtered = orgs.filter((org) => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      org.name.toLowerCase().includes(q) ||
      org.industry?.toLowerCase().includes(q) ||
      org.address_city?.toLowerCase().includes(q)
    const matchesStatus = statusFilter === 'all' || org.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Organisationen</h1>
        </div>
        <Link href="/organisationen/neu">
          <Button className="bg-accent hover:bg-accent/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Neue Organisation
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard label="Leads" value={countLeads} isLoading={isLoading} />
        <KPICard label="Interessiert" value={countInterested} colorClass="text-yellow-600" isLoading={isLoading} />
        <KPICard label="Angebote offen" value={countOfferSent} colorClass="text-blue-600" isLoading={isLoading} />
        <KPICard label="Kunden" value={countCustomers} colorClass="text-green-600" isLoading={isLoading} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suche nach Name, Branche, Ort..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status filtern" />
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
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Laden...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Keine Organisationen gefunden.</p>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Branche</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Ort</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Telefon</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((org) => (
                <tr
                  key={org.id}
                  onClick={() => router.push(`/organisationen/${org.id}`)}
                  className="border-t hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{org.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {org.industry || '–'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={org.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {org.address_city || '–'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {org.phone || '–'}
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
