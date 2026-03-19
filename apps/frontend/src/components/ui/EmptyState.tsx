import type { LucideIcon } from 'lucide-react'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-(--bg-tertiary) p-4">
        <Icon size={24} className="text-(--text-muted)" />
      </div>
      <h3 className="mb-1 text-sm font-medium text-(--text-primary)">
        {title}
      </h3>
      {description && (
        <p className="mb-4 max-w-sm text-sm text-(--text-muted)">
          {description}
        </p>
      )}
      {action}
    </div>
  )
}
