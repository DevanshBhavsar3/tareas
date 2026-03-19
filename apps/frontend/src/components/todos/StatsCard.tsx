import type { LucideIcon } from 'lucide-react'

type StatsCardProps = {
  label: string
  value: number
  icon: LucideIcon
  color?: string
}

export default function StatsCard({
  label,
  value,
  icon: Icon,
  color = 'text-accent-500',
}: StatsCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-(--border-color) bg-(--bg-primary) p-5 transition-all hover:border-accent-500/30 hover:shadow-sm">
      {/* Background Icon */}
      <div
        className={`absolute -right-4 -top-4 ${color} opacity-10 transition-all group-hover:opacity-15 group-hover:scale-110`}
      >
        <Icon size={72} strokeWidth={1} />
      </div>

      {/* Content */}
      <div className="relative">
        <p className="mb-1 text-xs font-medium text-(--text-muted) uppercase tracking-tight">
          {label}
        </p>
        <p className="text-3xl font-bold text-(--text-primary)">{value}</p>
      </div>
    </div>
  )
}
