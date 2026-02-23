'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText } from 'lucide-react'
import pb from '@/lib/pocketbase'
import { Offer } from '@/types'
import { parsePositions } from '@/hooks/useAngebote'
import { AngebotForm, AngebotFormData } from '@/components/angebote/AngebotForm'
import { useToast } from '@/hooks/use-toast'

export default function AngebotBearbeitenPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [angebot, setAngebot] = useState<Offer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    pb.collection('offers')
      .getOne<Offer>(params.id)
      .then((r) => setAngebot({ ...r, positions: parsePositions(r.positions) }))
      .finally(() => setIsLoading(false))
  }, [params.id])

  async function handleSubmit(data: AngebotFormData) {
    const total = data.positions.reduce((sum, p) => sum + p.total, 0)
    await pb.collection('offers').update(params.id, {
      ...data,
      positions: JSON.stringify(data.positions),
      total: Math.round(total * 100) / 100,
      contact: data.contact === 'none' ? null : data.contact || null,
    })
    toast({ title: 'Angebot gespeichert' })
    router.push(`/angebote/${params.id}`)
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Laden...</p>
  if (!angebot) return <p className="text-sm text-destructive">Angebot nicht gefunden.</p>

  return (
    <div>
      <Link
        href={`/angebote/${params.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zum Angebot
      </Link>

      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Angebot bearbeiten</h1>
      </div>

      <div className="max-w-4xl">
        <AngebotForm
          initialData={angebot}
          onSubmit={handleSubmit}
          submitLabel="Änderungen speichern"
        />
      </div>
    </div>
  )
}
