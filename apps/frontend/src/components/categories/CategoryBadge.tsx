type CategoryBadgeProps = {
  name: string
  color: string
  onClick?: () => void
}

export default function CategoryBadge({
  name,
  color,
  onClick,
}: CategoryBadgeProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors hover:opacity-80"
      style={{
        backgroundColor: `${color}15`,
        color: color,
      }}
    >
      <span
        className="size-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {name}
    </button>
  )
}
