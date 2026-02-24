'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, BookOpen } from 'lucide-react'
import pb from '@/lib/pocketbase'
import { EntryForm, EntryFormData } from '@/components/buchhaltung/EntryForm'
import { useToast } from '@/hooks/use-toast'
import { AccountingEntry, Invoice } from '@/types'
import { hydrateInvoice } from '@/hooks/useRechnungen'

export default function NeuerEintragPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [initialData, setInitialData] = useState<Partial<AccountingEntry>>({})
  const [invoiceId, setInvoiceId] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function init() {
      const fromInvoiceId = searchParams.get('invoice')

      if (fromInvoiceId) {
        setInvoiceId(fromInvoiceId)
        try {
          const inv = await pb.collection('invoices').getOne<Invoice>(fromInvoiceId)
          const hydrated = hydrateInvoice(inv)
          setInitialData({
            type: 'income',
            date: hydrated.date ?? new Date().toISOString().slice(0, 10),
            amount: hydrated.total ?? undefined,
            description: hydrated.title ?? '',
            reference_number: hydrated.number ?? '',
            invoice: fromInvoiceId,
          })
        } catch {
          toast({ title: 'Rechnung nicht gefunden', variant: 'destructive' })
          setInitialData({ type: 'income' })
        }
      } else {
        setInitialData({})
      }
      setIsReady(true)
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(data: EntryFormData, receiptFile?: File) {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('type', data.type)
      formData.append('date', data.date)
      formData.append('amount', String(data.amount))
      formData.append('category', data.category ?? '')
      formData.append('description', data.description ?? '')
      formData.append('reference_number', data.reference_number ?? '')
      formData.append('notes', data.notes ?? '')
      if (invoiceId) formData.append('invoice', invoiceId)
      if (receiptFile) formData.append('receipt', receiptFile)

      const record = await pb.collection('accounting_entries').create(formData)
      toast({ title: 'Eintrag angelegt' })
      router.push(`/buchhaltung/${record.id}`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Fehler beim Speichern'
      toast({ title: msg, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isReady) return <p className="text-sm text-muted-foreground">Laden...</p>

  return (
    <div>
      <Link
        href="/buchhaltung"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Buchhaltung
      </Link>

      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Neuer Eintrag</h1>
      </div>

      <div className="max-w-2xl">
        <EntryForm
          initialData={initialData}
          onSubmit={handleSubmit}
          submitLabel="Eintrag anlegen"
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
}
