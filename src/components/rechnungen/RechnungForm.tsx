'use client'

import { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, BookOpen } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useOrganisationen } from '@/hooks/useOrganisationen'
import { useKontakte } from '@/hooks/useKontakte'
import { useProdukte } from '@/hooks/useProdukte'
import { Invoice, INVOICE_STATUS, INVOICE_STATUS_LABELS, Product } from '@/types'

const FOOTER_NOTE_DEFAULT =
  'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.'

function defaultDueDate() {
  const d = new Date()
  d.setDate(d.getDate() + 14)
  return d.toISOString().slice(0, 10)
}

const positionSchema = z.object({
  title: z.string(),
  qty: z.number(),
  unit: z.string(),
  unit_price: z.number(),
  total: z.number(),
})

const schema = z.object({
  organization: z.string().min(1, 'Organisation ist erforderlich'),
  contact: z.string(),
  title: z.string().min(1, 'Titel ist erforderlich'),
  number: z.string().min(1, 'Rechnungsnummer ist erforderlich'),
  status: z.enum(['open', 'paid', 'cancelled']),
  date: z.string().min(1, 'Datum ist erforderlich'),
  due_date: z.string(),
  positions: z.array(positionSchema),
  notes: z.string(),
  footer_note: z.string(),
})

export type RechnungFormData = z.infer<typeof schema>

interface Props {
  initialData?: Partial<Invoice>
  onSubmit: (data: RechnungFormData) => Promise<void>
  submitLabel?: string
}

export function RechnungForm({ initialData, onSubmit, submitLabel = 'Speichern' }: Props) {
  const { orgs } = useOrganisationen()
  const { produkte } = useProdukte()
  const [showCatalog, setShowCatalog] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RechnungFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      organization: initialData?.organization ?? '',
      contact: initialData?.contact || 'none',
      title: initialData?.title ?? '',
      number: initialData?.number ?? '',
      status: initialData?.status ?? 'open',
      date: initialData?.date
        ? initialData.date.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      due_date: initialData?.due_date
        ? initialData.due_date.slice(0, 10)
        : defaultDueDate(),
      positions: initialData?.positions ?? [],
      notes: initialData?.notes ?? '',
      footer_note: initialData?.footer_note ?? FOOTER_NOTE_DEFAULT,
    },
  })

  const selectedOrgId = watch('organization')
  const { kontakte } = useKontakte(selectedOrgId)

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'positions',
  })

  const positions = useWatch({ control, name: 'positions' })
  const grandTotal = (positions ?? []).reduce((sum, p) => sum + (p?.total ?? 0), 0)

  function addFreePosition() {
    append({ title: '', qty: 1, unit: 'pauschal', unit_price: 0, total: 0 })
  }

  function addFromCatalog(product: Product) {
    append({
      title: product.name,
      qty: 1,
      unit: 'pauschal',
      unit_price: product.price,
      total: product.price,
    })
    setShowCatalog(false)
  }

  function recalcTotal(index: number, qty: number, unit_price: number) {
    const total = Math.round(qty * unit_price * 100) / 100
    update(index, { ...fields[index], qty, unit_price, total })
  }

  // Reset contact when org changes
  useEffect(() => {
    setValue('contact', 'none')
  }, [selectedOrgId, setValue])

  const activeProdukte = produkte.filter((p) => p.active)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Organisation *</Label>
          <Controller
            name="organization"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Organisation wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {orgs.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.organization && (
            <p className="text-sm text-destructive">{errors.organization.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Ansprechpartner</Label>
          <Controller
            name="contact"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!selectedOrgId || kontakte.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={kontakte.length === 0 ? 'Keine Kontakte' : 'Kontakt wählen...'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">– kein Ansprechpartner –</SelectItem>
                  {kontakte.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.first_name} {k.last_name}
                      {k.role ? ` (${k.role})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Titel *</Label>
          <Input id="title" placeholder="z.B. Website-Relaunch 2026" {...register('title')} />
          {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="number">Rechnungsnummer *</Label>
          <Input id="number" {...register('number')} />
          {errors.number && <p className="text-sm text-destructive">{errors.number.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Status *</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVOICE_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {INVOICE_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="date">Datum *</Label>
            <Input id="date" type="date" {...register('date')} />
            {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="due_date">Fälligkeitsdatum</Label>
            <Input id="due_date" type="date" {...register('due_date')} />
          </div>
        </div>
      </div>

      <Separator />

      {/* Positions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Positionen</h3>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCatalog(true)}
            >
              <BookOpen className="h-4 w-4 mr-1" />
              Aus Katalog
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFreePosition}
            >
              <Plus className="h-4 w-4 mr-1" />
              Freie Position
            </Button>
          </div>
        </div>

        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            Noch keine Positionen. Wähle eine aus dem Katalog oder füge eine freie Position hinzu.
          </p>
        ) : (
          <div className="space-y-2">
            {/* Header row */}
            <div className="hidden md:grid grid-cols-[1fr_80px_100px_110px_110px_40px] gap-2 text-xs text-muted-foreground px-1">
              <span>Bezeichnung</span>
              <span>Menge</span>
              <span>Einheit</span>
              <span>Einzelpreis</span>
              <span className="text-right">Gesamt</span>
              <span />
            </div>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-[1fr_80px_100px_110px_110px_40px] gap-2 items-center"
              >
                <Input
                  placeholder="Bezeichnung"
                  {...register(`positions.${index}.title`)}
                />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="1"
                  {...register(`positions.${index}.qty`, {
                    valueAsNumber: true,
                    onChange: (e) =>
                      recalcTotal(
                        index,
                        parseFloat(e.target.value) || 0,
                        positions?.[index]?.unit_price ?? 0
                      ),
                  })}
                />
                <Input
                  placeholder="pauschal"
                  {...register(`positions.${index}.unit`)}
                />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  {...register(`positions.${index}.unit_price`, {
                    valueAsNumber: true,
                    onChange: (e) =>
                      recalcTotal(
                        index,
                        positions?.[index]?.qty ?? 1,
                        parseFloat(e.target.value) || 0
                      ),
                  })}
                />
                <div className="text-right text-sm font-medium py-2 px-3 bg-muted/30 rounded-md">
                  {((positions?.[index]?.total) ?? 0).toFixed(2)} €
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {fields.length > 0 && (
          <div className="flex justify-end pt-2">
            <div className="text-right">
              <span className="text-sm text-muted-foreground mr-4">Gesamtbetrag (netto):</span>
              <span className="text-lg font-bold">{grandTotal.toFixed(2)} €</span>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Notes + Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="notes">Interne Notiz</Label>
          <Textarea
            id="notes"
            rows={3}
            placeholder="Nur intern sichtbar..."
            {...register('notes')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="footer_note">Fußnotentext (§19 UStG)</Label>
          <Textarea
            id="footer_note"
            rows={3}
            {...register('footer_note')}
          />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
        {isSubmitting ? 'Speichern...' : submitLabel}
      </Button>

      {/* Catalog picker dialog */}
      <Dialog open={showCatalog} onOpenChange={setShowCatalog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Aus Katalog wählen</DialogTitle>
          </DialogHeader>
          {activeProdukte.length === 0 ? (
            <p className="text-sm text-muted-foreground">Keine aktiven Produkte im Katalog.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {activeProdukte.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addFromCatalog(p)}
                  className="w-full text-left flex items-center justify-between p-3 rounded-md border hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <div className="text-sm font-medium">{p.name}</div>
                    {p.description && (
                      <div className="text-xs text-muted-foreground">{p.description}</div>
                    )}
                  </div>
                  <div className="text-sm text-right shrink-0 ml-4">
                    <div className="font-medium">
                      {p.price > 0 ? `${p.price.toFixed(2)} €` : 'Preis auf Anfrage'}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">{p.article_number}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </form>
  )
}
