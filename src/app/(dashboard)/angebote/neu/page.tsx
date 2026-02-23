'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText } from 'lucide-react'
import pb from '@/lib/pocketbase'
import { generateOfferNumber } from '@/lib/offerNumber'
import { AngebotForm, AngebotFormData } from '@/components/angebote/AngebotForm'
import { useToast } from '@/hooks/use-toast'

export default function NeuesAngebotPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [nextNumber, setNextNumber] = useState('')

  useEffect(() => {
    generateOfferNumber().then(setNextNumber)
  }, [])

  async function handleSubmit(data: AngebotFormData) {
    const total = data.positions.reduce((sum, p) => sum + p.total, 0)
    const record = await pb.collection('offers').create({
      ...data,
      positions: JSON.stringify(data.positions),
      total: Math.round(total * 100) / 100,
      contact: data.contact === 'none' ? null : data.contact || null,
    })
    toast({ title: 'Angebot angelegt' })
    router.push(`/angebote/${record.id}`)
  }

  if (!nextNumber) return <p className="text-sm text-muted-foreground">Laden...</p>

  return (
    <div>
      <Link
        href="/angebote"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Alle Angebote
      </Link>

      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Neues Angebot</h1>
      </div>

      <div className="max-w-4xl">
        <AngebotForm
          initialData={{ number: nextNumber }}
          onSubmit={handleSubmit}
          submitLabel="Angebot anlegen"
        />
      </div>
    </div>
  )
}
