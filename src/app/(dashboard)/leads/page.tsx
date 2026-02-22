'use client'

import { BarChart3 } from 'lucide-react'

export default function LeadsPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Lead-Pipeline</h1>
      </div>
      <p className="text-muted-foreground">
        Die Lead-Übersicht wird im nächsten Schritt implementiert.
      </p>
    </div>
  )
}
