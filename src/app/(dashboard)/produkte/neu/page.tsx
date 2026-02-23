'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package } from 'lucide-react'
import pb from '@/lib/pocketbase'
import { ProduktForm, ProduktFormData } from '@/components/produkte/ProduktForm'
import { useToast } from '@/hooks/use-toast'

export default function NeuesProduktPage() {
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(data: ProduktFormData) {
    const record = await pb.collection('products').create(data)
    toast({ title: 'Produkt angelegt' })
    router.push(`/produkte/${record.id}`)
  }

  return (
    <div>
      <Link
        href="/produkte"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Alle Produkte
      </Link>

      <div className="flex items-center gap-2 mb-6">
        <Package className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Neues Produkt</h1>
      </div>

      <div className="max-w-2xl">
        <ProduktForm onSubmit={handleSubmit} submitLabel="Produkt anlegen" />
      </div>
    </div>
  )
}
