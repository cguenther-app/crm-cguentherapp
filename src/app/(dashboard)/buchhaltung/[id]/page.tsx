'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, Pencil, Trash2, FileText, ExternalLink } from 'lucide-react'
import pb from '@/lib/pocketbase'
import { AccountingEntry, ENTRY_TYPE_LABELS } from '@/types'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export default function BuchhaltungDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [entry, setEntry] = useState<AccountingEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    pb.collection('accounting_entries')
      .getOne<AccountingEntry>(params.id, { expand: 'invoice' })
      .then((record) => {
        setEntry(record)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  async function handleDelete() {
    if (!confirm('Eintrag wirklich löschen?')) return
    await pb.collection('accounting_entries').delete(params.id)
    toast({ title: 'Eintrag gelöscht' })
    router.push('/buchhaltung')
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Laden...</p>
  if (!entry) return <p className="text-sm text-destructive">Eintrag nicht gefunden.</p>

  const receiptUrl = entry.receipt
    ? pb.files.getUrl(entry as Parameters<typeof pb.files.getUrl>[0], entry.receipt)
    : null

  return (
    <div>
      <Link
        href="/buchhaltung"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Buchhaltung
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{entry.description || 'Buchungseintrag'}</h1>
            <p className="text-sm text-muted-foreground">
              {entry.date ? format(new Date(entry.date), 'dd.MM.yyyy', { locale: de }) : '–'}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <Link href={`/buchhaltung/${params.id}/bearbeiten`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-1" />
              Bearbeiten
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Löschen
          </Button>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="rounded-md border p-4 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground">Typ</p>
              <Badge
                variant="outline"
                className={
                  entry.type === 'income'
                    ? 'border-green-500 text-green-700 dark:text-green-400'
                    : 'border-destructive text-destructive'
                }
              >
                {ENTRY_TYPE_LABELS[entry.type]}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Betrag</p>
              <p className={`font-bold text-lg ${entry.type === 'income' ? 'text-green-700 dark:text-green-400' : ''}`}>
                {entry.amount?.toFixed(2) ?? '0.00'} €
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Datum</p>
              <p>{entry.date ? format(new Date(entry.date), 'dd.MM.yyyy', { locale: de }) : '–'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Kategorie</p>
              <p>{entry.category || '–'}</p>
            </div>
          </div>

          {entry.reference_number && (
            <>
              <Separator />
              <div>
                <p className="text-muted-foreground">Belegnummer</p>
                <p className="font-mono">{entry.reference_number}</p>
              </div>
            </>
          )}

          {entry.description && (
            <>
              <Separator />
              <div>
                <p className="text-muted-foreground">Beschreibung</p>
                <p>{entry.description}</p>
              </div>
            </>
          )}

          {entry.notes && (
            <>
              <Separator />
              <div>
                <p className="text-muted-foreground">Notiz</p>
                <p className="text-muted-foreground italic">{entry.notes}</p>
              </div>
            </>
          )}
        </div>

        {/* Receipt download */}
        {receiptUrl && (
          <div className="rounded-md border p-4">
            <p className="text-sm font-medium mb-3 flex items-center gap-1">
              <FileText className="h-4 w-4 text-primary" />
              Beleg
            </p>
            <a
              href={receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Beleg anzeigen / herunterladen
            </a>
          </div>
        )}

        {/* Linked invoice */}
        {entry.expand?.invoice && (
          <div className="rounded-md border p-4 text-sm">
            <p className="text-muted-foreground mb-1">Verknüpfte Rechnung</p>
            <Link
              href={`/rechnungen/${entry.invoice}`}
              className="font-medium text-primary hover:underline font-mono"
            >
              {entry.expand.invoice.number} – {entry.expand.invoice.title}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
