import { Badge } from '@/components/ui/badge'
import { LeadStatus, LEAD_STATUS_LABELS } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_CLASSES: Record<LeadStatus, string> = {
  lead:         'bg-slate-400 hover:bg-slate-400 text-white border-transparent',
  contacted:    'bg-primary hover:bg-primary text-white border-transparent',
  responded:    'bg-cyan hover:bg-cyan text-white border-transparent',
  interested:   'bg-green-500 hover:bg-green-500 text-white border-transparent',
  offer_sent:   'bg-accent hover:bg-accent text-white border-transparent',
  customer:     'bg-green-700 hover:bg-green-700 text-white border-transparent',
  no_interest:  'bg-red-500 hover:bg-red-500 text-white border-transparent',
  paused:       'bg-yellow-400 hover:bg-yellow-400 text-black border-transparent',
}

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge className={cn(STATUS_CLASSES[status])}>
      {LEAD_STATUS_LABELS[status]}
    </Badge>
  )
}
