'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Package, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useProdukte } from '@/hooks/useProdukte'
import { KPICard } from '@/components/ui/KPICard'
import { BILLING_TYPE_LABELS } from '@/types'

export default function ProduktePage() {
  const { produkte, isLoading } = useProdukte()
  const router = useRouter()
  const [search, setSearch] = useState('')

  const filtered = produkte.filter((p) => {
    const q = search.toLowerCase()
    return (
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.article_number.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Produkte</h1>
        </div>
        <Link href="/produkte/neu">
          <Button className="bg-accent hover:bg-accent/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Neues Produkt
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <KPICard label="Gesamt" value={produkte.length} isLoading={isLoading} />
        <KPICard label="Aktiv" value={produkte.filter((p) => p.active).length} colorClass="text-green-600" isLoading={isLoading} />
        <KPICard label="Inaktiv" value={produkte.filter((p) => !p.active).length} colorClass="text-muted-foreground" isLoading={isLoading} />
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Suche nach Bezeichnung, Art.-Nr., Kategorie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Laden...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Keine Produkte gefunden.</p>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Art.-Nr.</th>
                <th className="text-left px-4 py-3 font-medium">Bezeichnung</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Kategorie</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Abrechnung</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Preis</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => router.push(`/produkte/${p.id}`)}
                  className="border-t hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.article_number}</td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {p.category || '–'}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {BILLING_TYPE_LABELS[p.billing_type]}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {p.price > 0 ? `${p.price.toFixed(2)} €` : '–'}
                  </td>
                  <td className="px-4 py-3">
                    {p.active ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">Aktiv</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Inaktiv</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && (
        <p className="text-xs text-muted-foreground mt-2">
          {filtered.length} Produkt{filtered.length !== 1 ? 'e' : ''}
        </p>
      )}
    </div>
  )
}
