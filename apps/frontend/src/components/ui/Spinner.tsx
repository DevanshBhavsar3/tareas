import { Loader2 } from 'lucide-react'

type SpinnerProps = {
  size?: number
  className?: string
}

export default function Spinner({ size = 16, className }: SpinnerProps) {
  return (
    <Loader2
      size={size}
      className={`animate-spin text-(--text-muted) ${className}`}
    />
  )
}
