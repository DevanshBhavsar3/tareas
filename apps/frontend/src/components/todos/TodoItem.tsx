import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import { cn } from '#/lib/utils'
import {
  formatCalendarDate,
  isOverdue as checkOverdue,
  isDueToday,
} from '#/lib/dayjs'
import type { PopulatedTodo } from '@tareas/zod'
import {
  Calendar,
  MessageSquare,
  MoreHorizontal,
  Trash2,
  Pencil,
  Paperclip,
  ExternalLink,
  Flag,
  AlertCircle,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type z from 'zod'

type Todo = z.infer<typeof PopulatedTodo>

type TodoItemProps = {
  todo: Todo
  onToggleComplete: (todoId: string, completed: boolean) => void
  onEdit: (todo: Todo) => void
  onDelete: (todoId: string) => void
  onClick: (todo: Todo) => void
}

const priorityConfig = {
  low: {
    variant: 'secondary' as const,
    label: 'Low',
    color: 'text-green-500',
    borderColor: 'border-l-green-500',
    bgColor: 'bg-green-500/5',
  },
  medium: {
    variant: 'outline' as const,
    label: 'Medium',
    color: 'text-yellow-500',
    borderColor: 'border-l-yellow-500',
    bgColor: 'bg-yellow-500/5',
  },
  high: {
    variant: 'destructive' as const,
    label: 'High',
    color: 'text-red-500',
    borderColor: 'border-l-red-500',
    bgColor: 'bg-red-500/5',
  },
}

export default function TodoItem({
  todo,
  onToggleComplete,
  onEdit,
  onDelete,
  onClick,
}: TodoItemProps) {
  const isCompleted = todo.status === 'completed'
  const overdue = checkOverdue(todo.dueDate, todo.status)
  const dueToday = isDueToday(todo.dueDate)
  const dueDateText = todo.dueDate ? formatCalendarDate(todo.dueDate) : null
  const hasAttachments = todo.attachments && todo.attachments.length > 0
  const hasComments = todo.comments && todo.comments.length > 0

  return (
    <div
      className={cn(
        'group flex items-start gap-3 px-4 py-3.5 transition-all',
        'hover:bg-muted/50 cursor-pointer',
        'border-l-4 border-b border-border/50 last:border-b-0',
        // Priority-based left border color
        priorityConfig[todo.priority].borderColor,
        // Completed state
        isCompleted && 'opacity-60',
        // Overdue state - subtle background
        overdue && !isCompleted && 'bg-destructive/5',
      )}
      onClick={() => onClick(todo)}
    >
      {/* Checkbox */}
      <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isCompleted}
          onCheckedChange={(checked) => onToggleComplete(todo.id, !!checked)}
          className={cn(
            'transition-colors',
            overdue && !isCompleted && 'border-destructive',
          )}
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-2">
        {/* Title row */}
        <div className="flex items-start gap-2">
          <p
            className={cn(
              'text-sm font-medium leading-relaxed flex-1',
              isCompleted && 'text-muted-foreground line-through',
            )}
          >
            {todo.title}
          </p>

          {/* Priority indicator for high priority */}
          {todo.priority === 'high' && !isCompleted && (
            <Tooltip>
              <TooltipTrigger>
                <Flag size={14} className="text-red-500 shrink-0 mt-0.5" />
              </TooltipTrigger>
              <TooltipContent>High Priority</TooltipContent>
            </Tooltip>
          )}

          {/* Overdue indicator */}
          {overdue && !isCompleted && (
            <Tooltip>
              <TooltipTrigger>
                <AlertCircle
                  size={14}
                  className="text-destructive shrink-0 mt-0.5"
                />
              </TooltipTrigger>
              <TooltipContent>This task is overdue</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Description preview */}
        {todo.description && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {todo.description}
          </p>
        )}

        {/* Meta row - badges and info */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category */}
          {todo.category && (
            <Badge
              variant="outline"
              className="text-xs h-5 px-1.5"
              style={{
                borderColor: todo.category.color,
                color: todo.category.color,
                backgroundColor: `${todo.category.color}10`,
              }}
            >
              {todo.category.name}
            </Badge>
          )}

          {/* Due date */}
          {dueDateText && (
            <span
              className={cn(
                'flex items-center gap-1 text-xs',
                overdue && !isCompleted
                  ? 'text-destructive font-medium'
                  : dueToday && !isCompleted
                    ? 'text-yellow-600 dark:text-yellow-500 font-medium'
                    : 'text-muted-foreground',
              )}
            >
              <Calendar size={12} />
              {dueDateText}
            </span>
          )}

          {/* Comments count */}
          {hasComments && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare size={12} />
              {todo.comments!.length}
            </span>
          )}

          {/* Attachments count */}
          {hasAttachments && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Paperclip size={12} />
              {todo.attachments!.length}
            </span>
          )}
        </div>
      </div>

      {/* Actions menu */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Tooltip>
          <TooltipTrigger>
            <Link to="/todos/$todoId" params={{ todoId: todo.id }}>
              <Button variant="ghost" size="icon-sm">
                <ExternalLink size={14} />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Open in full page</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-sm" />}
          >
            <MoreHorizontal size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(todo)}>
              <Pencil size={14} />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(todo.id)}
            >
              <Trash2 size={14} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
