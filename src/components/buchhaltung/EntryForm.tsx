'use client'

import { useRef } from 'react'
import { useForm } from 'react-hook-form'
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
import { AccountingEntry, ENTRY_TYPES, ENTRY_TYPE_LABELS, EXPENSE_CATEGORIES } from '@/types'

const schema = z.object({
  type: z.enum(ENTRY_TYPES),
  date: z.string().min(1, 'Datum ist erforderlich'),
  amount: z.coerce.number().positive('Betrag muss größer 0 sein'),
  category: z.string(),
  description: z.string(),
  reference_number: z.string(),
  notes: z.string(),
})

export type EntryFormData = z.infer<typeof schema>

interface Props {
  initialData?: Partial<AccountingEntry>
  onSubmit: (data: EntryFormData, receiptFile?: File) => Promise<void>
  submitLabel?: string
  isSubmitting?: boolean
}

export function EntryForm({ initialData, onSubmit, submitLabel = 'Speichern', isSubmitting }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EntryFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: (initialData?.type as EntryFormData['type']) ?? 'expense',
      date: initialData?.date ?? new Date().toISOString().slice(0, 10),
      amount: initialData?.amount ?? undefined,
      category: initialData?.category ?? '',
      description: initialData?.description ?? '',
      reference_number: initialData?.reference_number ?? '',
      notes: initialData?.notes ?? '',
    },
  })

  const typeValue = watch('type')

  async function handleFormSubmit(data: EntryFormData) {
    const file = fileRef.current?.files?.[0]
    await onSubmit(data, file)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Typ + Datum */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Typ *</Label>
          <Select
            value={typeValue}
            onValueChange={(v) => setValue('type', v as EntryFormData['type'])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ENTRY_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {ENTRY_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="date">Datum *</Label>
          <Input id="date" type="date" {...register('date')} />
          {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
        </div>
      </div>

      {/* Betrag + Kategorie */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="amount">Betrag (€) *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register('amount')}
          />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Kategorie</Label>
          <Select
            value={watch('category')}
            onValueChange={(v) => setValue('category', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Kategorie wählen..." />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Beschreibung */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Beschreibung</Label>
        <Input id="description" placeholder="z.B. Rechnung XYZ" {...register('description')} />
      </div>

      {/* Belegnummer */}
      <div className="space-y-1.5">
        <Label htmlFor="reference_number">Belegnummer</Label>
        <Input id="reference_number" placeholder="z.B. BE-2026-001" {...register('reference_number')} />
      </div>

      {/* Belegupload */}
      <div className="space-y-1.5">
        <Label htmlFor="receipt">Beleg hochladen (PDF, JPG, PNG)</Label>
        <input
          ref={fileRef}
          id="receipt"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-input file:bg-background file:text-sm file:font-medium hover:file:bg-muted cursor-pointer"
        />
        {initialData?.receipt && (
          <p className="text-xs text-muted-foreground">
            Bereits hochgeladen: <span className="font-mono">{initialData.receipt}</span>
          </p>
        )}
      </div>

      {/* Notiz */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notiz</Label>
        <Textarea id="notes" rows={3} placeholder="Interne Anmerkungen..." {...register('notes')} />
      </div>

      <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent/90 text-white">
        {isSubmitting ? 'Speichern...' : submitLabel}
      </Button>
    </form>
  )
}
