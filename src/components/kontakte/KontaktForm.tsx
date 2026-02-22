'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Contact } from '@/types'

const schema = z.object({
  first_name: z.string().min(1, 'Vorname ist erforderlich'),
  last_name: z.string().min(1, 'Nachname ist erforderlich'),
  role: z.string(),
  email: z.union([z.string().email('Ungültige E-Mail'), z.literal('')]),
  phone: z.string(),
  mobile: z.string(),
  is_primary: z.boolean(),
})

export type KontaktFormData = z.infer<typeof schema>

interface Props {
  initialData?: Partial<Contact>
  onSubmit: (data: KontaktFormData) => Promise<void>
  submitLabel?: string
}

export function KontaktForm({ initialData, onSubmit, submitLabel = 'Speichern' }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<KontaktFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: initialData?.first_name ?? '',
      last_name: initialData?.last_name ?? '',
      role: initialData?.role ?? '',
      email: initialData?.email ?? '',
      phone: initialData?.phone ?? '',
      mobile: initialData?.mobile ?? '',
      is_primary: initialData?.is_primary ?? false,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="first_name">Vorname *</Label>
          <Input id="first_name" {...register('first_name')} />
          {errors.first_name && (
            <p className="text-xs text-destructive">{errors.first_name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Nachname *</Label>
          <Input id="last_name" {...register('last_name')} />
          {errors.last_name && (
            <p className="text-xs text-destructive">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Position / Rolle</Label>
        <Input id="role" placeholder="z.B. Geschäftsführer" {...register('role')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-Mail</Label>
        <Input id="email" type="email" {...register('email')} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input id="phone" type="tel" {...register('phone')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mobile">Mobil</Label>
          <Input id="mobile" type="tel" {...register('mobile')} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="is_primary"
          type="checkbox"
          {...register('is_primary')}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        <Label htmlFor="is_primary">Hauptkontakt</Label>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90">
        {isSubmitting ? 'Speichern...' : submitLabel}
      </Button>
    </form>
  )
}
