'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Receipt } from 'lucide-react'
import pb from '@/lib/pocketbase'
import { generateInvoiceNumber } from '@/lib/invoiceNumber'
import { RechnungForm, RechnungFormData } from '@/components/rechnungen/RechnungForm'
import { useToast } from '@/hooks/use-toast'
import { Offer, Invoice } from '@/types'
import { hydrateOffer } from '@/hooks/useAngebote'

export default function NeueRechnungPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [nextNumber, setNextNumber] = useState('')
  const [initialData, setInitialData] = useState<Partial<Invoice>>({})
  const [sourceOfferId, setSourceOfferId] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    async function init() {
      const fromOfferId = searchParams.get('from')
      const number = await generateInvoiceNumber()
      setNextNumber(number)

      if (fromOfferId) {
        setSourceOfferId(fromOfferId)
        try {
          const offer = await pb.collection('offers').getOne<Offer>(fromOfferId, {
            expand: 'organization,contact',
          })
          const hydrated = hydrateOffer(offer)
          const dueDate = new Date()
          dueDate.setDate(dueDate.getDate() + 14)
          setInitialData({
            organization: hydrated.organization,
            contact: hydrated.contact,
            title: hydrated.title,
            number,
            positions: hydrated.positions,
            total: hydrated.total,
            notes: hydrated.notes,
            footer_note: hydrated.footer_note,
            date: new Date().toISOString().slice(0, 10),
            due_date: dueDate.toISOString().slice(0, 10),
          })
        } catch {
          toast({ title: 'Angebot nicht gefunden', variant: 'destructive' })
          setInitialData({ number })
        }
      } else {
        setInitialData({ number })
      }
      setIsReady(true)
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(data: RechnungFormData) {
    const total = data.positions.reduce((sum, p) => sum + p.total, 0)
    const record = await pb.collection('invoices').create({
      ...data,
      positions: JSON.stringify(data.positions),
      total: Math.round(total * 100) / 100,
      contact: data.contact === 'none' ? null : data.contact || null,
      offer: sourceOfferId || null,
    })
    toast({ title: 'Rechnung angelegt' })
    router.push(`/rechnungen/${record.id}`)
  }

  if (!isReady) return <p className="text-sm text-muted-foreground">Laden...</p>

  return (
    <div>
      <Link
        href="/rechnungen"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Alle Rechnungen
      </Link>

      <div className="flex items-center gap-2 mb-6">
        <Receipt className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Neue Rechnung</h1>
      </div>

      <div className="max-w-4xl">
        <RechnungForm
          initialData={initialData}
          onSubmit={handleSubmit}
          submitLabel="Rechnung anlegen"
        />
      </div>
    </div>
  )
}
