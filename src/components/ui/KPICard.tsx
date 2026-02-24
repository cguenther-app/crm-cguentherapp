import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

interface KPICardProps {
  label: string
  value: number | string
  sub?: string
  colorClass?: string
  isLoading?: boolean
}

export function KPICard({ label, value, sub, colorClass, isLoading }: KPICardProps) {
  return (
    <Card className="p-4">
      {isLoading ? (
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-muted animate-pulse" />
          <div className="h-7 w-12 rounded bg-muted animate-pulse" />
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={cn('text-2xl font-bold mt-1', colorClass)}>{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </>
      )}
    </Card>
  )
}
