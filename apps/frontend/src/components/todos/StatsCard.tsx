import { Card, CardContent } from '#/components/ui/card'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

type StatsCardProps = {
  label: string
  value: number
  icon: IconSvgElement
  color?: string
}

export default function StatsCard({
  label,
  value,
  icon,
  color = 'text-primary',
}: StatsCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:ring-2 hover:ring-primary/20">
      {/* Background Icon */}
      <div
        className={`absolute -right-4 -top-4 ${color} opacity-10 transition-all group-hover:opacity-15 group-hover:scale-110`}
      >
        <HugeiconsIcon icon={icon} size={72} strokeWidth={1} />
      </div>

      <CardContent className="relative pt-5">
        <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-tight">
          {label}
        </p>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}
