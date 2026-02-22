'use client'

import { Building2 } from 'lucide-react'

export default function OrganisationenPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Building2 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Organisationen</h1>
      </div>
      <p className="text-muted-foreground">
        Die Organisationsübersicht wird im nächsten Schritt implementiert.
      </p>
    </div>
  )
}
