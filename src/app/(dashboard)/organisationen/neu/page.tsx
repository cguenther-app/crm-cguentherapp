'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Building2 } from 'lucide-react'
import pb from '@/lib/pocketbase'
import { OrgForm, OrgFormData } from '@/components/organisationen/OrgForm'
import { useToast } from '@/hooks/use-toast'

export default function NeueOrganisationPage() {
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(data: OrgFormData) {
    const record = await pb.collection('organizations').create(data)
    toast({ title: 'Organisation angelegt' })
    router.push(`/organisationen/${record.id}`)
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

      <div className="flex items-center gap-2 mb-6">
        <Building2 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Neue Organisation</h1>
      </div>

      <div className="max-w-2xl">
        <OrgForm onSubmit={handleSubmit} submitLabel="Organisation anlegen" />
      </div>
    </div>
  )
}
