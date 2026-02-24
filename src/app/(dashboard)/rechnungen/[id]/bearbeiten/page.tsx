'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Receipt } from 'lucide-react'
import pb from '@/lib/pocketbase'
import { Invoice } from '@/types'
import { parsePositions } from '@/hooks/useRechnungen'
import { RechnungForm, RechnungFormData } from '@/components/rechnungen/RechnungForm'
import { useToast } from '@/hooks/use-toast'

export default function RechnungBearbeitenPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [rechnung, setRechnung] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    pb.collection('invoices')
      .getOne<Invoice>(params.id)
      .then((r) => setRechnung({ ...r, positions: parsePositions(r.positions) }))
      .finally(() => setIsLoading(false))
  }, [params.id])

  async function handleSubmit(data: RechnungFormData) {
    const total = data.positions.reduce((sum, p) => sum + p.total, 0)
    await pb.collection('invoices').update(params.id, {
      ...data,
      positions: JSON.stringify(data.positions),
      total: Math.round(total * 100) / 100,
      contact: data.contact === 'none' ? null : data.contact || null,
    })
    toast({ title: 'Rechnung gespeichert' })
    router.push(`/rechnungen/${params.id}`)
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Laden...</p>
  if (!rechnung) return <p className="text-sm text-destructive">Rechnung nicht gefunden.</p>

  return (
    <div>
      <Link
        href={`/rechnungen/${params.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Rechnung
      </Link>

      <div className="flex items-center gap-2 mb-6">
        <Receipt className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Rechnung bearbeiten</h1>
      </div>

      <div className="max-w-4xl">
        <RechnungForm
          initialData={rechnung}
          onSubmit={handleSubmit}
          submitLabel="Änderungen speichern"
        />
      </div>
    </div>
  )
}
