import { Badge } from '@/components/ui/badge'
import { InvoiceStatus, INVOICE_STATUS_LABELS } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_CLASSES: Record<InvoiceStatus, string> = {
  open:      'bg-blue-600 hover:bg-blue-600 text-white border-transparent',
  paid:      'bg-green-600 hover:bg-green-600 text-white border-transparent',
  cancelled: 'bg-slate-400 hover:bg-slate-400 text-white border-transparent',
}

interface Props {
  status: InvoiceStatus
  isOverdue?: boolean
}

export function RechnungStatusBadge({ status, isOverdue }: Props) {
  if (isOverdue && status === 'open') {
    return (
      <Badge className="bg-red-600 hover:bg-red-600 text-white border-transparent">
        Überfällig
      </Badge>
    )
  }
  return (
    <Badge className={cn(STATUS_CLASSES[status])}>
      {INVOICE_STATUS_LABELS[status]}
    </Badge>
  )
}
