'use client'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { BILLING_TYPES, BILLING_TYPE_LABELS, Product } from '@/types'

const schema = z.object({
  article_number: z.string().min(1, 'Art.-Nr. ist erforderlich'),
  name: z.string().min(1, 'Bezeichnung ist erforderlich'),
  description: z.string(),
  category: z.string(),
  billing_type: z.enum(['one_time', 'by_effort']),
  price: z.coerce.number().min(0),
  note: z.string(),
  active: z.boolean(),
})

export type ProduktFormData = z.infer<typeof schema>

interface Props {
  initialData?: Partial<Product>
  onSubmit: (data: ProduktFormData) => Promise<void>
  submitLabel?: string
}

export function ProduktForm({ initialData, onSubmit, submitLabel = 'Speichern' }: Props) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProduktFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      article_number: initialData?.article_number ?? '',
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      category: initialData?.category ?? '',
      billing_type: initialData?.billing_type ?? 'one_time',
      price: initialData?.price ?? 0,
      note: initialData?.note ?? '',
      active: initialData?.active ?? true,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="article_number">Art.-Nr. *</Label>
          <Input id="article_number" placeholder="z.B. P2a" {...register('article_number')} />
          {errors.article_number && (
            <p className="text-sm text-destructive">{errors.article_number.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Kategorie</Label>
          <Input id="category" placeholder="z.B. Online stellen" {...register('category')} />
        </div>

        <div className="col-span-1 md:col-span-2 space-y-2">
          <Label htmlFor="name">Bezeichnung *</Label>
          <Input id="name" {...register('name')} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="col-span-1 md:col-span-2 space-y-2">
          <Label htmlFor="description">Worum geht&apos;s?</Label>
          <Textarea id="description" rows={2} {...register('description')} />
        </div>

        <div className="space-y-2">
          <Label>Abrechnung *</Label>
          <Controller
            name="billing_type"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BILLING_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {BILLING_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Preis (€ netto)</Label>
          <Input id="price" type="number" min={0} step={0.01} {...register('price')} />
          <p className="text-xs text-muted-foreground">0 = kein Festpreis (bei &quot;Nach Aufwand&quot;)</p>
        </div>

        <div className="col-span-1 md:col-span-2 space-y-2">
          <Label htmlFor="note">Hinweis</Label>
          <Input id="note" placeholder="z.B. Am unkompliziertesten" {...register('note')} />
        </div>

        <div className="flex items-center gap-3">
          <Controller
            name="active"
            control={control}
            render={({ field }) => (
              <Switch
                id="active"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="active">Aktiv</Label>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
        {isSubmitting ? 'Speichern...' : submitLabel}
      </Button>
    </form>
  )
}
