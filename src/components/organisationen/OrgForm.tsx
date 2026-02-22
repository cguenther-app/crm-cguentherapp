'use client'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LEAD_STATUS, LEAD_STATUS_LABELS, Organization } from '@/types'

const schema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  industry: z.string().default(''),
  address_street: z.string().default(''),
  address_zip: z.string().default(''),
  address_city: z.string().default(''),
  website: z.string().default(''),
  phone: z.string().default(''),
  status: z.enum(['lead', 'contacted', 'responded', 'interested', 'offer_sent', 'customer', 'no_interest', 'paused']),
  tags: z.string().default(''),
})

export type OrgFormData = z.infer<typeof schema>

interface Props {
  initialData?: Partial<Organization>
  onSubmit: (data: OrgFormData) => Promise<void>
  submitLabel?: string
}

export function OrgForm({ initialData, onSubmit, submitLabel = 'Speichern' }: Props) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrgFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? '',
      industry: initialData?.industry ?? '',
      address_street: initialData?.address_street ?? '',
      address_zip: initialData?.address_zip ?? '',
      address_city: initialData?.address_city ?? '',
      website: initialData?.website ?? '',
      phone: initialData?.phone ?? '',
      status: initialData?.status ?? 'lead',
      tags: initialData?.tags ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" {...register('name')} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Branche</Label>
          <Input id="industry" placeholder="z.B. Maler, Elektriker" {...register('industry')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input id="phone" type="tel" {...register('phone')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input id="website" placeholder="https://" {...register('website')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address_street">Straße</Label>
          <Input id="address_street" {...register('address_street')} />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-2">
            <Label htmlFor="address_zip">PLZ</Label>
            <Input id="address_zip" {...register('address_zip')} />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="address_city">Ort</Label>
            <Input id="address_city" {...register('address_city')} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Status *</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {LEAD_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (kommagetrennt)</Label>
          <Input id="tags" placeholder="z.B. Handwerk, Wipperfürth" {...register('tags')} />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
        {isSubmitting ? 'Speichern...' : submitLabel}
      </Button>
    </form>
  )
}
