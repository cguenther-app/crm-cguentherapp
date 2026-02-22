'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  content?: string
  onChange: (html: string) => void
}

export function NotizEditor({ content = '', onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editorProps: {
      attributes: {
        class: 'min-h-[100px] outline-none text-sm p-3 prose prose-sm max-w-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  return (
    <div className="rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring">
      <div className="flex gap-0.5 p-1.5 border-b border-border">
        {[
          { action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), Icon: Bold },
          { action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), Icon: Italic },
          { action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList'), Icon: List },
          { action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList'), Icon: ListOrdered },
        ].map(({ action, active, Icon }, i) => (
          <button
            key={i}
            type="button"
            onClick={action}
            className={cn(
              'p-1.5 rounded hover:bg-muted transition-colors',
              active && 'bg-muted text-foreground'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
