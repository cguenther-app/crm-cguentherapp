'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Edit, Trash2, Check, X } from 'lucide-react'
import { Note, NoteType, NOTE_TYPE_LABELS } from '@/types'
import { NotizEditor } from './NotizEditor'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { NOTE_TYPES } from '@/types'
import { cn } from '@/lib/utils'
import pb from '@/lib/pocketbase'
import { useToast } from '@/hooks/use-toast'

const TYPE_CLASSES: Record<NoteType, string> = {
  internal:  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  call:      'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  visit:     'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  email_in:  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  email_out: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  other:     'bg-muted text-muted-foreground',
}

function toDatetimeLocal(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface Props {
  note: Note
  onDelete: () => void
  onUpdate: () => void
}

export function NotizKarte({ note, onDelete, onUpdate }: Props) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [editType, setEditType] = useState<NoteType>(note.type)
  const [editDate, setEditDate] = useState(toDatetimeLocal(note.noted_at))
  const [editContent, setEditContent] = useState(note.content)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleSave() {
    if (!editContent || editContent === '<p></p>') return
    setIsSaving(true)
    try {
      await pb.collection('notes').update(note.id, {
        type: editType,
        noted_at: new Date(editDate).toISOString(),
        content: editContent,
      })
      toast({ title: 'Notiz gespeichert' })
      setIsEditing(false)
      onUpdate()
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    await pb.collection('notes').delete(note.id)
    toast({ title: 'Notiz gelöscht' })
    onDelete()
  }

  return (
    <div className="border rounded-md p-4 bg-card">
      {isEditing ? (
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-xs mb-1 block">Typ</Label>
              <Select value={editType} onValueChange={(v) => setEditType(v as NoteType)}>
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
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
              />
            </div>
          </div>
          <NotizEditor content={editContent} onChange={setEditContent} />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90">
              <Check className="h-3.5 w-3.5 mr-1" />
              {isSaving ? 'Speichern...' : 'Speichern'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
              <X className="h-3.5 w-3.5 mr-1" />
              Abbrechen
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', TYPE_CLASSES[note.type])}>
                {NOTE_TYPE_LABELS[note.type]}
              </span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(note.noted_at), 'dd. MMM yyyy, HH:mm', { locale: de })}
              </span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div
            className="text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-1 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_em]:italic"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </>
      )}
    </div>
  )
}
