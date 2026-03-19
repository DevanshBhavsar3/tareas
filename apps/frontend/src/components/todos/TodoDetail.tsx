import { Badge, Modal } from '#/components/ui'
import { CommentSection } from '#/components/todos'
import type { PopulatedTodo } from '@tareas/zod'
import { Calendar, Flag, Tag } from 'lucide-react'
import type z from 'zod'

type Todo = z.infer<typeof PopulatedTodo>

type TodoDetailProps = {
  todo: Todo | null
  isOpen: boolean
  onClose: () => void
}

const priorityVariants: Record<
  string,
  'default' | 'success' | 'warning' | 'danger'
> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
}

const statusVariants: Record<
  string,
  'default' | 'success' | 'warning' | 'danger' | 'info'
> = {
  draft: 'default',
  active: 'info',
  completed: 'success',
  archived: 'default',
}

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return 'No due date'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function TodoDetail({ todo, isOpen, onClose }: TodoDetailProps) {
  if (!todo) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={todo.title} size="lg">
      <div className="space-y-6">
        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={statusVariants[todo.status]}>
            {todo.status.charAt(0).toUpperCase() + todo.status.slice(1)}
          </Badge>
          <Badge variant={priorityVariants[todo.priority]}>
            <Flag size={12} className="mr-1" />
            {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
          </Badge>
          {todo.category && (
            <span
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${todo.category.color}15`,
                color: todo.category.color,
              }}
            >
              <Tag size={12} />
              {todo.category.name}
            </span>
          )}
        </div>

        {/* Due date */}
        <div className="flex items-center gap-2 text-sm text-(--text-muted)">
          <Calendar size={16} />
          <span>{formatDate(todo.dueDate)}</span>
        </div>

        {/* Description */}
        {todo.description && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-(--text-primary)">
              Description
            </h4>
            <p className="text-sm text-(--text-muted) whitespace-pre-wrap leading-relaxed">
              {todo.description}
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-(--border-color)" />

        {/* Comments */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-(--text-primary)">
            Comments ({todo.comments?.length ?? 0})
          </h4>
          <CommentSection todoId={todo.id} />
        </div>
      </div>
    </Modal>
  )
}
