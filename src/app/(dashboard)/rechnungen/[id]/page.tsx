'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ArrowLeft, Receipt, Pencil, Trash2, BookOpen } from 'lucide-react'
import pb from '@/lib/pocketbase'
import { Invoice, INVOICE_STATUS, INVOICE_STATUS_LABELS } from '@/types'
import { hydrateInvoice } from '@/hooks/useRechnungen'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RechnungStatusBadge } from '@/components/rechnungen/RechnungStatusBadge'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const RechnungPDFButton = dynamic(
  () => import('@/components/rechnungen/RechnungPDF').then((m) => m.RechnungPDFButton),
  { ssr: false, loading: () => <Button variant="outline" size="sm" disabled>PDF...</Button> }
)

function isOverdue(rechnung: Invoice) {
  return rechnung.status === 'open' && !!rechnung.due_date && new Date(rechnung.due_date) < new Date()
}

export default function RechnungDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [rechnung, setRechnung] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function load() {
    const record = await pb.collection('invoices').getOne<Invoice>(params.id, {
      expand: 'organization,contact,offer',
    })
    setRechnung(hydrateInvoice(record))
    setIsLoading(false)
  }

  useEffect(() => {
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  async function handleDelete() {
    if (!confirm('Rechnung wirklich löschen?')) return
    await pb.collection('invoices').delete(params.id)
    toast({ title: 'Rechnung gelöscht' })
    router.push('/rechnungen')
  }

  async function handleStatusChange(newStatus: string) {
    await pb.collection('invoices').update(params.id, { status: newStatus })
    setRechnung((prev) => prev ? { ...prev, status: newStatus as Invoice['status'] } : prev)
    toast({ title: `Status: ${INVOICE_STATUS_LABELS[newStatus as Invoice['status']]}` })
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Laden...</p>
  if (!rechnung) return <p className="text-sm text-destructive">Rechnung nicht gefunden.</p>

  const positions = rechnung.positions ?? []
  const overdue = isOverdue(rechnung)

  return (
    <div>
      <Link
        href="/rechnungen"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Alle Rechnungen
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-2">
          <Receipt className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{rechnung.title}</h1>
            <p className="text-sm text-muted-foreground font-mono">{rechnung.number}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <RechnungPDFButton rechnung={rechnung} />
          {rechnung.status === 'paid' && (
            <Link href={`/buchhaltung/neu?invoice=${params.id}`}>
              <Button variant="outline" size="sm" className="text-green-700 border-green-500 hover:bg-green-50 dark:hover:bg-green-950">
                <BookOpen className="h-4 w-4 mr-1" />
                Als Einnahme buchen
              </Button>
            </Link>
          )}
          <Link href={`/rechnungen/${params.id}/bearbeiten`}>
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

      <div className="max-w-4xl space-y-6">
        {/* Meta info */}
        <div className="rounded-md border p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Status</p>
              <div className="mt-1">
                <RechnungStatusBadge status={rechnung.status} isOverdue={overdue} />
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Organisation</p>
              <Link
                href={`/organisationen/${rechnung.organization}`}
                className="font-medium text-primary hover:underline"
              >
                {rechnung.expand?.organization?.name ?? '–'}
              </Link>
            </div>
            <div>
              <p className="text-muted-foreground">Datum</p>
              <p>{rechnung.date ? format(new Date(rechnung.date), 'dd.MM.yyyy', { locale: de }) : '–'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fälligkeitsdatum</p>
              <p className={overdue ? 'text-destructive font-medium' : ''}>
                {rechnung.due_date
                  ? format(new Date(rechnung.due_date), 'dd.MM.yyyy', { locale: de })
                  : '–'}
              </p>
            </div>
          </div>

          {rechnung.expand?.contact && (
            <>
              <Separator />
              <div className="text-sm">
                <p className="text-muted-foreground">Ansprechpartner</p>
                <p>
                  {rechnung.expand.contact.first_name} {rechnung.expand.contact.last_name}
                  {rechnung.expand.contact.role ? ` – ${rechnung.expand.contact.role}` : ''}
                </p>
              </div>
            </>
          )}

          {rechnung.expand?.offer && (
            <>
              <Separator />
              <div className="text-sm">
                <p className="text-muted-foreground">Quellangebot</p>
                <Link
                  href={`/angebote/${rechnung.offer}`}
                  className="font-medium text-primary hover:underline font-mono"
                >
                  {rechnung.expand.offer.number} – {rechnung.expand.offer.title}
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Status change */}
        <div className="rounded-md border p-4">
          <p className="text-sm font-medium mb-3">Status ändern</p>
          <Select value={rechnung.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INVOICE_STATUS.map((s) => (
                <SelectItem key={s} value={s}>
                  {INVOICE_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Positions */}
        <div className="rounded-md border p-4 space-y-4">
          <h3 className="font-medium">Positionen</h3>
          {positions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Keine Positionen hinterlegt.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left pb-2 font-medium">Bezeichnung</th>
                      <th className="text-right pb-2 font-medium">Menge</th>
                      <th className="text-left pb-2 font-medium px-3">Einheit</th>
                      <th className="text-right pb-2 font-medium">Einzelpreis</th>
                      <th className="text-right pb-2 font-medium">Gesamt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((pos, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2">{pos.title || '–'}</td>
                        <td className="py-2 text-right">{pos.qty}</td>
                        <td className="py-2 px-3 text-muted-foreground">{pos.unit}</td>
                        <td className="py-2 text-right">{pos.unit_price.toFixed(2)} €</td>
                        <td className="py-2 text-right font-medium">{pos.total.toFixed(2)} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end pt-2 border-t">
                <span className="text-sm text-muted-foreground mr-4">Gesamtbetrag (netto):</span>
                <span className="font-bold">{rechnung.total?.toFixed(2) ?? '0.00'} €</span>
              </div>
            </>
          )}
        </div>

        {/* Notes / Footer */}
        {(rechnung.notes || rechnung.footer_note) && (
          <div className="rounded-md border p-4 space-y-4 text-sm">
            {rechnung.notes && (
              <div>
                <p className="text-muted-foreground mb-1">Interne Notiz</p>
                <p>{rechnung.notes}</p>
              </div>
            )}
            {rechnung.footer_note && (
              <>
                {rechnung.notes && <Separator />}
                <div>
                  <p className="text-muted-foreground mb-1">Fußnotentext</p>
                  <p className="text-muted-foreground italic">{rechnung.footer_note}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
