type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

type BadgeProps = {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-(--bg-tertiary) text-(--text-muted)',
  success: 'bg-(--success-muted) text-(--success)',
  warning: 'bg-(--warning-muted) text-(--warning)',
  danger: 'bg-(--danger-muted) text-(--danger)',
  info: 'bg-(--info-muted) text-(--info)',
}

export default function Badge({
  variant = 'default',
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
