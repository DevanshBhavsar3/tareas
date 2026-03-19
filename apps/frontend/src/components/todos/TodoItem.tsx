import { Badge } from '#/components/ui'
import type { PopulatedTodo } from '@tareas/zod'
import {
  Calendar,
  CheckCircle2,
  Circle,
  MessageSquare,
  MoreHorizontal,
  Trash2,
  Pencil,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import type z from 'zod'

type Todo = z.infer<typeof PopulatedTodo>

type TodoItemProps = {
  todo: Todo
  onToggleComplete: (todoId: string, completed: boolean) => void
  onEdit: (todo: Todo) => void
  onDelete: (todoId: string) => void
  onClick: (todo: Todo) => void
}

const priorityVariants: Record<
  string,
  'default' | 'success' | 'warning' | 'danger'
> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
}

const formatDueDate = (date: string | null): string | null => {
  if (!date) return null

  const dueDate = new Date(date)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  today.setHours(0, 0, 0, 0)
  tomorrow.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)

  if (dueDate.getTime() === today.getTime()) return 'Today'
  if (dueDate.getTime() === tomorrow.getTime()) return 'Tomorrow'
  if (dueDate < today) return 'Overdue'

  return dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const isOverdue = (date: string | null, status: string): boolean => {
  if (!date || status === 'completed') return false
  const dueDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)
  return dueDate < today
}

export default function TodoItem({
  todo,
  onToggleComplete,
  onEdit,
  onDelete,
  onClick,
}: TodoItemProps) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isCompleted = todo.status === 'completed'
  const dueDateText = formatDueDate(todo.dueDate)
  const overdue = isOverdue(todo.dueDate, todo.status)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  return (
    <div
      className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-(--bg-hover) cursor-pointer"
      onClick={() => onClick(todo)}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleComplete(todo.id, !isCompleted)
        }}
        className="mt-0.5 shrink-0 text-(--text-muted) transition-colors hover:text-accent-500"
      >
        {isCompleted ? (
          <CheckCircle2
            size={20}
            className="text-(--success) fill-(--success)/20"
          />
        ) : (
          <Circle size={20} />
        )}
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm leading-relaxed ${isCompleted ? 'text-(--text-muted) line-through' : 'text-(--text-primary)'}`}
        >
          {todo.title}
        </p>

        {/* Meta info */}
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {/* Category */}
          {todo.category && (
            <span
              className="inline-flex items-center gap-1 text-xs"
              style={{ color: todo.category.color }}
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: todo.category.color }}
              />
              {todo.category.name}
            </span>
          )}

          {/* Due date */}
          {dueDateText && (
            <span
              className={`flex items-center gap-1 text-xs ${overdue ? 'text-(--danger)' : 'text-(--text-muted)'}`}
            >
              <Calendar size={12} />
              {dueDateText}
            </span>
          )}

          {/* Priority */}
          <Badge variant={priorityVariants[todo.priority]}>
            {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
          </Badge>

          {/* Comments count */}
          {todo.comments && todo.comments.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-(--text-muted)">
              <MessageSquare size={12} />
              {todo.comments.length}
            </span>
          )}
        </div>
      </div>

      {/* Actions menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          className="shrink-0 rounded-md p-1 text-(--text-muted) opacity-0 transition-all hover:bg-(--bg-tertiary) hover:text-(--text-primary) group-hover:opacity-100"
        >
          <MoreHorizontal size={16} />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-(--border-color) bg-(--bg-primary) py-1 shadow-lg">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(todo)
                setShowMenu(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-(--text-primary) transition-colors hover:bg-(--bg-hover)"
            >
              <Pencil size={14} />
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(todo.id)
                setShowMenu(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-(--danger) transition-colors hover:bg-(--bg-hover)"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
