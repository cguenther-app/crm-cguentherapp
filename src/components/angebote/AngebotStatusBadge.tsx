import { Badge } from '@/components/ui/badge'
import { OfferStatus, OFFER_STATUS_LABELS } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_CLASSES: Record<OfferStatus, string> = {
  draft:    'bg-slate-400 hover:bg-slate-400 text-white border-transparent',
  sent:     'bg-primary hover:bg-primary text-white border-transparent',
  accepted: 'bg-green-600 hover:bg-green-600 text-white border-transparent',
  rejected: 'bg-red-500 hover:bg-red-500 text-white border-transparent',
  expired:  'bg-yellow-500 hover:bg-yellow-500 text-black border-transparent',
}

export function AngebotStatusBadge({ status }: { status: OfferStatus }) {
  return (
    <Badge className={cn(STATUS_CLASSES[status])}>
      {OFFER_STATUS_LABELS[status]}
    </Badge>
  )
}
