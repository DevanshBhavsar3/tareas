import { useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'

type MenuItem = {
  label: string
  icon?: LucideIcon
  onClick: () => void
  variant?: 'default' | 'danger'
}

type ContextMenuProps = {
  items: MenuItem[]
  position: { x: number; y: number } | null
  onClose: () => void
}

export default function ContextMenu({
  items,
  position,
  onClose,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!position) return

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    // Small delay to prevent immediate close from the triggering click
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('contextmenu', handleClickOutside)
    }, 0)

    document.addEventListener('keydown', handleEscape)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('contextmenu', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [position, onClose])

  if (!position) return null

  // Adjust position to keep menu within viewport
  const adjustedPosition = { ...position }
  if (typeof window !== 'undefined') {
    const menuWidth = 160
    const menuHeight = items.length * 36 + 8
    if (position.x + menuWidth > window.innerWidth) {
      adjustedPosition.x = window.innerWidth - menuWidth - 8
    }
    if (position.y + menuHeight > window.innerHeight) {
      adjustedPosition.y = window.innerHeight - menuHeight - 8
    }
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[140px] rounded-lg border border-(--border-color) bg-(--bg-secondary) py-1 shadow-lg animate-in fade-in zoom-in-95 duration-100"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      {items.map((item, index) => {
        const Icon = item.icon
        return (
          <button
            key={index}
            onClick={() => {
              item.onClick()
              onClose()
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
              item.variant === 'danger'
                ? 'text-(--danger) hover:bg-(--danger)/10'
                : 'text-(--text-primary) hover:bg-(--bg-hover)'
            }`}
          >
            {Icon && <Icon size={14} />}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

// Hook to manage context menu state
export function useContextMenu() {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  )
  const [data, setData] = useState<any>(null)

  const open = (e: React.MouseEvent, itemData?: any) => {
    e.preventDefault()
    setPosition({ x: e.clientX, y: e.clientY })
    setData(itemData)
  }

  const close = () => {
    setPosition(null)
    setData(null)
  }

  return { position, data, open, close }
}
