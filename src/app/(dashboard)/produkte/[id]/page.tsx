'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, Pencil, Trash2 } from 'lucide-react'
import pb from '@/lib/pocketbase'
import { Product, BILLING_TYPE_LABELS } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

export default function ProduktDetailPage({ params }: { params: { id: string } }) {
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

  async function handleDelete() {
    if (!confirm('Produkt wirklich löschen?')) return
    await pb.collection('products').delete(params.id)
    toast({ title: 'Produkt gelöscht' })
    router.push('/produkte')
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Laden...</p>
  if (!produkt) return <p className="text-sm text-destructive">Produkt nicht gefunden.</p>

  return (
    <div>
      <Link
        href="/produkte"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Alle Produkte
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{produkt.name}</h1>
            <p className="text-sm text-muted-foreground font-mono">{produkt.article_number}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/produkte/${params.id}/bearbeiten`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-1" />
              Bearbeiten
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-1" />
            Löschen
          </Button>
        </div>
      </div>

      <div className="max-w-2xl space-y-4">
        <div className="rounded-md border p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Kategorie</p>
              <p>{produkt.category || '–'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Abrechnung</p>
              <p>{BILLING_TYPE_LABELS[produkt.billing_type]}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Preis (netto)</p>
              <p>{produkt.price > 0 ? `${produkt.price.toFixed(2)} €` : '–'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              {produkt.active ? (
                <Badge variant="outline" className="text-green-600 border-green-600">Aktiv</Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">Inaktiv</Badge>
              )}
            </div>
          </div>

          {produkt.description && (
            <>
              <Separator />
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Worum geht&apos;s?</p>
                <p>{produkt.description}</p>
              </div>
            </>
          )}

          {produkt.note && (
            <>
              <Separator />
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Hinweis</p>
                <p className="text-amber-700 dark:text-amber-400">{produkt.note}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
