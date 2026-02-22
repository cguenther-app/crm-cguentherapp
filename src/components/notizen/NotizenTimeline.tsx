'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { NotizEditor } from './NotizEditor'
import { NotizKarte } from './NotizKarte'
import { useNotizen } from '@/hooks/useNotizen'
import { NOTE_TYPES, NOTE_TYPE_LABELS, NoteType } from '@/types'
import pb from '@/lib/pocketbase'
import { useToast } from '@/hooks/use-toast'

function nowDatetimeLocal() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface Props {
  organizationId?: string
  contactId?: string
}

export function NotizenTimeline({ organizationId, contactId }: Props) {
  const { notizen, isLoading, refresh } = useNotizen({ organizationId, contactId })
  const { toast } = useToast()

  const [showForm, setShowForm] = useState(false)
  const [newType, setNewType] = useState<NoteType>('internal')
  const [newDate, setNewDate] = useState(nowDatetimeLocal)
  const [newContent, setNewContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handleCreate() {
    if (!newContent || newContent === '<p></p>') return
    setIsSaving(true)
    try {
      await pb.collection('notes').create({
        organization: organizationId ?? null,
        contact: contactId ?? null,
        type: newType,
        noted_at: new Date(newDate).toISOString(),
        content: newContent,
        created_by: pb.authStore.model?.id,
      })
      toast({ title: 'Notiz gespeichert' })
      setShowForm(false)
      setNewContent('')
      setNewType('internal')
      setNewDate(nowDatetimeLocal())
      refresh()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      {!showForm ? (
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Neue Notiz
        </Button>
      ) : (
        <div className="border rounded-md p-4 bg-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Neue Notiz</span>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-xs mb-1 block">Typ</Label>
              <Select value={newType} onValueChange={(v) => setNewType(v as NoteType)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="text-xs">
                      {NOTE_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="text-xs mb-1 block">Datum</Label>
              <input
                type="datetime-local"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
              />
            </div>
          </div>
          <NotizEditor content="" onChange={setNewContent} />
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90"
          >
            {isSaving ? 'Speichern...' : 'Notiz speichern'}
          </Button>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Laden...</p>
      ) : notizen.length === 0 ? (
        <p className="text-sm text-muted-foreground">Noch keine Notizen vorhanden.</p>
      ) : (
        <div className="space-y-2">
          {notizen.map((note) => (
            <NotizKarte
              key={note.id}
              note={note}
              onDelete={refresh}
              onUpdate={refresh}
            />
          ))}
        </div>
      )}
    </div>
  )
}
