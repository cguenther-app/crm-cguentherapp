'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package } from 'lucide-react'
import pb from '@/lib/pocketbase'
import { Product } from '@/types'
import { ProduktForm, ProduktFormData } from '@/components/produkte/ProduktForm'
import { useToast } from '@/hooks/use-toast'

export default function ProduktBearbeitenPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [produkt, setProdukt] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    pb.collection('products')
      .getOne<Product>(params.id)
      .then(setProdukt)
      .finally(() => setIsLoading(false))
  }, [params.id])

  async function handleSubmit(data: ProduktFormData) {
    await pb.collection('products').update(params.id, data)
    toast({ title: 'Produkt gespeichert' })
    router.push(`/produkte/${params.id}`)
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Laden...</p>
  if (!produkt) return <p className="text-sm text-destructive">Produkt nicht gefunden.</p>

  return (
    <div>
      <Link
        href={`/produkte/${params.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zum Produkt
      </Link>

      <div className="flex items-center gap-2 mb-6">
        <Package className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">{produkt.name} bearbeiten</h1>
      </div>

      <div className="max-w-2xl">
        <ProduktForm initialData={produkt} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
