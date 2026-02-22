'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Phone, Plus, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useKontakte } from '@/hooks/useKontakte'
import { KontaktForm, KontaktFormData } from '@/components/kontakte/KontaktForm'
import pb from '@/lib/pocketbase'
import { useToast } from '@/hooks/use-toast'

export function KontaktListe({ organizationId }: { organizationId: string }) {
  const { kontakte, isLoading, refresh } = useKontakte(organizationId)
  const router = useRouter()
  const { toast } = useToast()
  const [showDialog, setShowDialog] = useState(false)

  async function handleCreate(data: KontaktFormData) {
    await pb.collection('contacts').create({ ...data, organization: organizationId })
    toast({ title: 'Kontakt angelegt' })
    setShowDialog(false)
    refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">
          {kontakte.length} Kontakt{kontakte.length !== 1 ? 'e' : ''}
        </span>
        <Button size="sm" variant="outline" onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Neuer Kontakt
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Laden...</p>
      ) : kontakte.length === 0 ? (
        <p className="text-sm text-muted-foreground">Noch keine Kontakte hinterlegt.</p>
      ) : (
        <div className="space-y-2">
          {kontakte.map((k) => (
            <div
              key={k.id}
              onClick={() => router.push(`/kontakte/${k.id}`)}
              className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/30 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                {k.is_primary && (
                  <Star className="h-3.5 w-3.5 text-accent fill-accent shrink-0" />
                )}
                <div>
                  <div className="text-sm font-medium">
                    {k.first_name} {k.last_name}
                  </div>
                  {k.role && (
                    <div className="text-xs text-muted-foreground">{k.role}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {k.email && (
                  <span className="hidden sm:flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {k.email}
                  </span>
                )}
                {k.phone && (
                  <span className="hidden md:flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {k.phone}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neuer Kontakt</DialogTitle>
          </DialogHeader>
          <KontaktForm onSubmit={handleCreate} submitLabel="Kontakt anlegen" />
        </DialogContent>
      </Dialog>
    </div>
  )
}
