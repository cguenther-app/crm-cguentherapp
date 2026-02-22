'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Building2, Edit, Globe, MapPin, Phone, Tag, Trash2 } from 'lucide-react'
import pb from '@/lib/pocketbase'
import { Organization } from '@/types'
import { StatusBadge } from '@/components/organisationen/StatusBadge'
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
import { KontaktListe } from '@/components/organisationen/KontaktListe'

export default function OrganisationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [org, setOrg] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    pb.collection('organizations')
      .getOne<Organization>(params.id)
      .then(setOrg)
      .finally(() => setIsLoading(false))
  }, [params.id])

  async function handleDelete() {
    setIsDeleting(true)
    await pb.collection('organizations').delete(params.id)
    toast({ title: 'Organisation gelöscht' })
    router.push('/organisationen')
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Laden...</p>
  }
  if (!org) {
    return <p className="text-sm text-destructive">Organisation nicht gefunden.</p>
  }

  return (
    <div>
      <Link
        href="/organisationen"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Alle Organisationen
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <Building2 className="h-7 w-7 text-primary shrink-0 mt-0.5" />
          <div>
            <h1 className="text-2xl font-bold">{org.name}</h1>
            {org.industry && (
              <p className="text-muted-foreground text-sm">{org.industry}</p>
            )}
            <div className="mt-1">
              <StatusBadge status={org.status} />
            </div>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href={`/organisationen/${org.id}/bearbeiten`}>
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

      {/* Detail-Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kontaktdaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {org.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <a href={`tel:${org.phone}`} className="hover:underline">
                  {org.phone}
                </a>
              </div>
            )}
            {org.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-primary truncate"
                >
                  {org.website}
                </a>
              </div>
            )}
            {(org.address_street || org.address_city) && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  {org.address_street && <div>{org.address_street}</div>}
                  {(org.address_zip || org.address_city) && (
                    <div>
                      {[org.address_zip, org.address_city].filter(Boolean).join(' ')}
                    </div>
                  )}
                </div>
              </div>
            )}
            {!org.phone && !org.website && !org.address_street && !org.address_city && (
              <p className="text-muted-foreground">Keine Kontaktdaten hinterlegt.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weitere Infos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {org.tags && (
              <div className="flex items-start gap-2">
                <Tag className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  {org.tags
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((tag) => (
                      <span key={tag} className="bg-muted px-2 py-0.5 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Angelegt: {new Date(org.created).toLocaleDateString('de-DE')}
            </p>
            <p className="text-xs text-muted-foreground">
              Geändert: {new Date(org.updated).toLocaleDateString('de-DE')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Kontakte */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Kontakte</CardTitle>
        </CardHeader>
        <CardContent>
          <KontaktListe organizationId={org.id} />
        </CardContent>
      </Card>

      {/* Notizen – folgt */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notizen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Notizen werden im nächsten Schritt implementiert.
          </p>
        </CardContent>
      </Card>

      {/* Löschen-Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Organisation löschen?</DialogTitle>
            <DialogDescription>
              „{org.name}" wird dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht
              werden.
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
