'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Building2, Mail, Phone, Smartphone, Star, Trash2, Edit } from 'lucide-react'
import pb from '@/lib/pocketbase'
import { Contact } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { NotizenTimeline } from '@/components/notizen/NotizenTimeline'

export default function KontaktDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [kontakt, setKontakt] = useState<Contact | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    pb.collection('contacts')
      .getOne<Contact>(params.id, { expand: 'organization' })
      .then(setKontakt)
      .finally(() => setIsLoading(false))
  }, [params.id])

  async function handleDelete() {
    setIsDeleting(true)
    await pb.collection('contacts').delete(params.id)
    toast({ title: 'Kontakt gelöscht' })
    const orgId = kontakt?.organization
    router.push(orgId ? `/organisationen/${orgId}` : '/organisationen')
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Laden...</p>
  if (!kontakt) return <p className="text-sm text-destructive">Kontakt nicht gefunden.</p>

  const org = kontakt.expand?.organization

  return (
    <div>
      <Link
        href={kontakt.organization ? `/organisationen/${kontakt.organization}` : '/organisationen'}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {org ? org.name : 'Zurück'}
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">
              {kontakt.first_name} {kontakt.last_name}
            </h1>
            {kontakt.is_primary && (
              <Star className="h-5 w-5 text-accent fill-accent" />
            )}
          </div>
          {kontakt.role && (
            <p className="text-muted-foreground text-sm mt-0.5">{kontakt.role}</p>
          )}
          {org && (
            <Link
              href={`/organisationen/${kontakt.organization}`}
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-1"
            >
              <Building2 className="h-3.5 w-3.5" />
              {org.name}
            </Link>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href={`/kontakte/${kontakt.id}/bearbeiten`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Bearbeiten
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Löschen
          </Button>
        </div>
      </div>

      {/* Kontaktdaten */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Kontaktdaten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {kontakt.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <a href={`mailto:${kontakt.email}`} className="hover:underline">
                {kontakt.email}
              </a>
            </div>
          )}
          {kontakt.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <a href={`tel:${kontakt.phone}`} className="hover:underline">
                {kontakt.phone}
              </a>
            </div>
          )}
          {kontakt.mobile && (
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-muted-foreground shrink-0" />
              <a href={`tel:${kontakt.mobile}`} className="hover:underline">
                {kontakt.mobile}
              </a>
            </div>
          )}
          {!kontakt.email && !kontakt.phone && !kontakt.mobile && (
            <p className="text-muted-foreground">Keine Kontaktdaten hinterlegt.</p>
          )}
        </CardContent>
      </Card>

      {/* Notizen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notizen</CardTitle>
        </CardHeader>
        <CardContent>
          <NotizenTimeline contactId={kontakt.id} />
        </CardContent>
      </Card>

      {/* Löschen-Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kontakt löschen?</DialogTitle>
            <DialogDescription>
              „{kontakt.first_name} {kontakt.last_name}" wird dauerhaft gelöscht.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Löschen...' : 'Löschen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
