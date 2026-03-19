import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative w-full ${sizeClasses[size]} rounded-xl border border-(--border-color) bg-(--bg-primary) shadow-xl animate-in fade-in zoom-in-95 duration-200`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-(--border-color) px-5 py-4">
            <h2 className="text-lg font-medium text-(--text-primary)">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-(--text-muted) transition-colors hover:bg-(--bg-hover) hover:text-(--text-primary)"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
