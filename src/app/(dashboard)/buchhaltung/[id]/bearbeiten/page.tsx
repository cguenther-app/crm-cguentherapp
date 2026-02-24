'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen } from 'lucide-react'
import pb from '@/lib/pocketbase'
import { AccountingEntry } from '@/types'
import { EntryForm, EntryFormData } from '@/components/buchhaltung/EntryForm'
import { useToast } from '@/hooks/use-toast'

export default function EintragBearbeitenPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [entry, setEntry] = useState<AccountingEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    pb.collection('accounting_entries')
      .getOne<AccountingEntry>(params.id)
      .then((record) => {
        setEntry(record)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  async function handleSubmit(data: EntryFormData, receiptFile?: File) {
    setIsSubmitting(true)
    try {
      if (receiptFile) {
        const formData = new FormData()
        formData.append('type', data.type)
        formData.append('date', data.date)
        formData.append('amount', String(data.amount))
        formData.append('category', data.category ?? '')
        formData.append('description', data.description ?? '')
        formData.append('reference_number', data.reference_number ?? '')
        formData.append('notes', data.notes ?? '')
        formData.append('receipt', receiptFile)
        await pb.collection('accounting_entries').update(params.id, formData)
      } else {
        await pb.collection('accounting_entries').update(params.id, {
          type: data.type,
          date: data.date,
          amount: data.amount,
          category: data.category ?? '',
          description: data.description ?? '',
          reference_number: data.reference_number ?? '',
          notes: data.notes ?? '',
        })
      }
      toast({ title: 'Eintrag gespeichert' })
      router.push(`/buchhaltung/${params.id}`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Fehler beim Speichern'
      toast({ title: msg, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Laden...</p>
  if (!entry) return <p className="text-sm text-destructive">Eintrag nicht gefunden.</p>

  return (
    <div>
      <Link
        href={`/buchhaltung/${params.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zum Eintrag
      </Link>

      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Eintrag bearbeiten</h1>
      </div>

      <div className="max-w-2xl">
        <EntryForm
          initialData={entry}
          onSubmit={handleSubmit}
          submitLabel="Änderungen speichern"
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
}
