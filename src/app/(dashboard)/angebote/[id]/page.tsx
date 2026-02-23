'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ArrowLeft, FileText, Pencil, Trash2 } from 'lucide-react'
import pb from '@/lib/pocketbase'
import { Offer, OFFER_STATUS, OFFER_STATUS_LABELS } from '@/types'
import { hydrateOffer } from '@/hooks/useAngebote'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AngebotStatusBadge } from '@/components/angebote/AngebotStatusBadge'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const AngebotPDFButton = dynamic(
  () => import('@/components/angebote/AngebotPDF').then((m) => m.AngebotPDFButton),
  { ssr: false, loading: () => <Button variant="outline" size="sm" disabled>PDF...</Button> }
)

export default function AngebotDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [angebot, setAngebot] = useState<Offer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function load() {
    const record = await pb.collection('offers').getOne<Offer>(params.id, {
      expand: 'organization,contact',
    })
    setAngebot(hydrateOffer(record))
    setIsLoading(false)
  }

  useEffect(() => {
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  async function handleDelete() {
    if (!confirm('Angebot wirklich löschen?')) return
    await pb.collection('offers').delete(params.id)
    toast({ title: 'Angebot gelöscht' })
    router.push('/angebote')
  }

  async function handleStatusChange(newStatus: string) {
    await pb.collection('offers').update(params.id, { status: newStatus })
    setAngebot((prev) => prev ? { ...prev, status: newStatus as Offer['status'] } : prev)
    toast({ title: `Status: ${OFFER_STATUS_LABELS[newStatus as Offer['status']]}` })

    // Prompt org status link when offer is sent
    if (newStatus === 'sent' && angebot?.organization) {
      const orgId = angebot.organization
      toast({
        title: 'Org-Status aktualisieren?',
        description: 'Organisation auf "Angebot gesendet" setzen?',
        action: (
          <ToastAction
            altText="Org-Status setzen"
            onClick={async () => {
              await pb.collection('organizations').update(orgId, {
                status: 'offer_sent',
              })
              toast({ title: 'Org-Status aktualisiert' })
            }}
          >
            Ja, setzen
          </ToastAction>
        ),
      })
    }
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Laden...</p>
  if (!angebot) return <p className="text-sm text-destructive">Angebot nicht gefunden.</p>

  const positions = angebot.positions ?? []

  return (
    <div>
      <Link
        href="/angebote"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Alle Angebote
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{angebot.title}</h1>
            <p className="text-sm text-muted-foreground font-mono">{angebot.number}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <AngebotPDFButton angebot={angebot} />
          <Link href={`/angebote/${params.id}/bearbeiten`}>
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
                <AngebotStatusBadge status={angebot.status} />
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Organisation</p>
              <Link
                href={`/organisationen/${angebot.organization}`}
                className="font-medium text-primary hover:underline"
              >
                {angebot.expand?.organization?.name ?? '–'}
              </Link>
            </div>
            <div>
              <p className="text-muted-foreground">Datum</p>
              <p>{angebot.date ? format(new Date(angebot.date), 'dd.MM.yyyy', { locale: de }) : '–'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Gültig bis</p>
              <p>
                {angebot.valid_until
                  ? format(new Date(angebot.valid_until), 'dd.MM.yyyy', { locale: de })
                  : '–'}
              </p>
            </div>
          </div>

          {angebot.expand?.contact && (
            <>
              <Separator />
              <div className="text-sm">
                <p className="text-muted-foreground">Ansprechpartner</p>
                <p>
                  {angebot.expand.contact.first_name} {angebot.expand.contact.last_name}
                  {angebot.expand.contact.role ? ` – ${angebot.expand.contact.role}` : ''}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Status change */}
        <div className="rounded-md border p-4">
          <p className="text-sm font-medium mb-3">Status ändern</p>
          <Select value={angebot.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OFFER_STATUS.map((s) => (
                <SelectItem key={s} value={s}>
                  {OFFER_STATUS_LABELS[s]}
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
                <span className="font-bold">{angebot.total?.toFixed(2) ?? '0.00'} €</span>
              </div>
            </>
          )}
        </div>

        {/* Notes / Footer */}
        {(angebot.notes || angebot.footer_note) && (
          <div className="rounded-md border p-4 space-y-4 text-sm">
            {angebot.notes && (
              <div>
                <p className="text-muted-foreground mb-1">Interne Notiz</p>
                <p>{angebot.notes}</p>
              </div>
            )}
            {angebot.footer_note && (
              <>
                {angebot.notes && <Separator />}
                <div>
                  <p className="text-muted-foreground mb-1">Fußnotentext</p>
                  <p className="text-muted-foreground italic">{angebot.footer_note}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
