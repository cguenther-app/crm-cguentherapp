'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Building2 } from 'lucide-react'
import pb from '@/lib/pocketbase'
import { Organization } from '@/types'
import { OrgForm, OrgFormData } from '@/components/organisationen/OrgForm'
import { useToast } from '@/hooks/use-toast'

export default function OrganisationBearbeitenPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [org, setOrg] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    pb.collection('organizations')
      .getOne<Organization>(params.id)
      .then(setOrg)
      .finally(() => setIsLoading(false))
  }, [params.id])

  async function handleSubmit(data: OrgFormData) {
    await pb.collection('organizations').update(params.id, data)
    toast({ title: 'Organisation gespeichert' })
    router.push(`/organisationen/${params.id}`)
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
        href={`/organisationen/${params.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Organisation
      </Link>

      <div className="flex items-center gap-2 mb-6">
        <Building2 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">{org.name} bearbeiten</h1>
      </div>

      <div className="max-w-2xl">
        <OrgForm initialData={org} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
