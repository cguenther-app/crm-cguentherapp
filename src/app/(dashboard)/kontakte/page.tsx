'use client'

import { Users } from 'lucide-react'

export default function KontaktePage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Kontakte</h1>
      </div>
      <p className="text-muted-foreground">
        Die Kontaktübersicht wird im nächsten Schritt implementiert.
      </p>
    </div>
  )
}
