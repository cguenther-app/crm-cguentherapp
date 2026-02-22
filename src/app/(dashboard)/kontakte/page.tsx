'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Star, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useKontakte } from '@/hooks/useKontakte'

export default function KontaktePage() {
  const { kontakte, isLoading } = useKontakte()
  const router = useRouter()
  const [search, setSearch] = useState('')

  const filtered = kontakte.filter((k) => {
    const q = search.toLowerCase()
    return (
      !q ||
      k.first_name.toLowerCase().includes(q) ||
      k.last_name.toLowerCase().includes(q) ||
      k.role?.toLowerCase().includes(q) ||
      k.email?.toLowerCase().includes(q) ||
      k.expand?.organization?.name.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Kontakte</h1>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Suche nach Name, Rolle, E-Mail, Organisation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Laden...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Keine Kontakte gefunden.</p>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Rolle</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Organisation</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">E-Mail</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((k) => (
                <tr
                  key={k.id}
                  onClick={() => router.push(`/kontakte/${k.id}`)}
                  className="border-t hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 font-medium">
                      {k.is_primary && (
                        <Star className="h-3.5 w-3.5 text-accent fill-accent shrink-0" />
                      )}
                      {k.first_name} {k.last_name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {k.role || '–'}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {k.expand?.organization ? (
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/organisationen/${k.organization}`)
                        }}
                        className="text-primary hover:underline cursor-pointer"
                      >
                        {k.expand.organization.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">–</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {k.email || '–'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && (
        <p className="text-xs text-muted-foreground mt-2">
          {filtered.length} Kontakt{filtered.length !== 1 ? 'e' : ''}
        </p>
      )}
    </div>
  )
}
