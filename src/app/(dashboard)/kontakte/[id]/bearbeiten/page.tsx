'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users } from 'lucide-react'
import pb from '@/lib/pocketbase'
import { Contact } from '@/types'
import { KontaktForm, KontaktFormData } from '@/components/kontakte/KontaktForm'
import { useToast } from '@/hooks/use-toast'

export default function KontaktBearbeitenPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [kontakt, setKontakt] = useState<Contact | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    pb.collection('contacts')
      .getOne<Contact>(params.id)
      .then(setKontakt)
      .finally(() => setIsLoading(false))
  }, [params.id])

  async function handleSubmit(data: KontaktFormData) {
    await pb.collection('contacts').update(params.id, data)
    toast({ title: 'Kontakt gespeichert' })
    router.push(`/kontakte/${params.id}`)
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Laden...</p>
  if (!kontakt) return <p className="text-sm text-destructive">Kontakt nicht gefunden.</p>

  return (
    <div>
      <Link
        href={`/kontakte/${params.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zum Kontakt
      </Link>

      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">
          {kontakt.first_name} {kontakt.last_name} bearbeiten
        </h1>
      </div>

      <div className="max-w-lg">
        <KontaktForm initialData={kontakt} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
