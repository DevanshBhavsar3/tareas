import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { Skeleton } from '#/components/ui/skeleton'
import { Separator } from '#/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import { CommentSection, AttachmentSection, TodoForm } from '#/components/todos'
import { useApiClient } from '#/api/index'
import {
  useUpdateTodo,
  useDeleteTodo,
  type TUpdateTodoPayload,
} from '#/api/hooks/todo'
import { QUERY_KEYS } from '#/api/query-keys'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Calendar,
  Flag,
  Tag,
  Pencil,
  Trash2,
  MessageSquare,
  Paperclip,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { useState } from 'react'
import type { PopulatedTodo } from '@tareas/zod'
import type z from 'zod'
import { toast } from 'sonner'
import { cn } from '#/lib/utils'
import {
  formatDateLong,
  formatRelativeTime,
  isOverdue as checkOverdue,
} from '#/lib/dayjs'

export const Route = createFileRoute('/_authed/todos/$todoId')({
  component: TodoPage,
})

type Todo = z.infer<typeof PopulatedTodo>

const priorityConfig = {
  low: {
    variant: 'secondary' as const,
    label: 'Low',
    color: 'text-green-500',
  },
  medium: {
    variant: 'outline' as const,
    label: 'Medium',
    color: 'text-yellow-500',
  },
  high: {
    variant: 'destructive' as const,
    label: 'High',
    color: 'text-red-500',
  },
}

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground' },
  active: { label: 'Active', color: 'bg-blue-500/10 text-blue-500' },
  completed: { label: 'Completed', color: 'bg-green-500/10 text-green-500' },
  archived: { label: 'Archived', color: 'bg-muted text-muted-foreground' },
}

function TodoPage() {
  const { todoId } = Route.useParams()
  const navigate = useNavigate()
  const api = useApiClient()

  // Fetch todo with direct API call since the hook has a bug
  const {
    data: todo,
    isLoading,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.TODOS.GET_TODO_BY_ID, todoId],
    queryFn: async () => {
      const res = await api.get(`/todos/${todoId}`)
      return res.data as Todo
    },
    enabled: !!todoId,
  })

  const updateTodo = useUpdateTodo()
  const deleteTodo = useDeleteTodo()

  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleToggleComplete = (completed: boolean) => {
    updateTodo.mutate(
      {
        todoId,
        body: { status: completed ? 'completed' : 'active' },
      },
      {
        onSuccess: () => {
          toast.success(completed ? 'Task completed!' : 'Task marked as active')
        },
      },
    )
  }

  const handleUpdateTodo = (data: TUpdateTodoPayload) => {
    updateTodo.mutate(
      { todoId, body: data },
      {
        onSuccess: () => {
          setShowEditForm(false)
          toast.success('Task updated successfully')
        },
      },
    )
  }

  const handleDeleteTodo = () => {
    deleteTodo.mutate(
      { todoId },
      {
        onSuccess: () => {
          toast.success('Task deleted')
          navigate({ to: '/todos' })
        },
      },
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-3xl px-6 py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <div className="flex gap-2 mb-6">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-32 w-full mb-8" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    )
  }

  if (error || !todo) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-3xl px-6 py-8">
          <Link
            to="/todos"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to tasks
          </Link>
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="rounded-full bg-destructive/10 p-4 mb-4">
              <Flag className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Task not found</h1>
            <p className="text-muted-foreground mb-6">
              This task may have been deleted or you don't have access to it.
            </p>
            <Link to="/todos">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const isCompleted = todo.status === 'completed'
  const overdue = checkOverdue(todo.dueDate, todo.status)

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-6 py-8">
        {/* Back button */}
        <Link
          to="/todos"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to tasks
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          {/* Checkbox */}
          <div className="pt-1.5">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={(checked) => handleToggleComplete(!!checked)}
              className="h-6 w-6"
            />
          </div>

          {/* Title and meta */}
          <div className="flex-1 min-w-0">
            <h1
              className={cn(
                'text-2xl font-semibold leading-tight mb-3',
                isCompleted && 'text-muted-foreground line-through',
              )}
            >
              {todo.title}
            </h1>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={cn('gap-1', statusConfig[todo.status].color)}>
                {todo.status === 'completed' ? (
                  <CheckCircle2 size={12} />
                ) : (
                  <Clock size={12} />
                )}
                {statusConfig[todo.status].label}
              </Badge>

              <Badge variant={priorityConfig[todo.priority].variant}>
                <Flag size={12} className="mr-1" />
                {priorityConfig[todo.priority].label} Priority
              </Badge>

              {todo.category && (
                <Badge
                  variant="outline"
                  className="gap-1.5"
                  style={{
                    backgroundColor: `${todo.category.color}15`,
                    borderColor: `${todo.category.color}30`,
                    color: todo.category.color,
                  }}
                >
                  <Tag size={12} />
                  {todo.category.name}
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditForm(true)}
            >
              <Pencil size={14} />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 size={14} />
              Delete
            </Button>
          </div>
        </div>

        {/* Due date */}
        <div
          className={cn(
            'flex items-center gap-2 text-sm mb-6 p-3 rounded-lg border',
            overdue
              ? 'border-destructive/50 bg-destructive/5 text-destructive'
              : 'border-border bg-muted/30',
          )}
        >
          <Calendar size={16} />
          <span className="font-medium">Due:</span>
          <span>{formatDateLong(todo.dueDate)}</span>
          {overdue && <span className="font-medium">(Overdue)</span>}
        </div>

        {/* Description */}
        {todo.description && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-muted-foreground mb-2">
              Description
            </h2>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed">
                {todo.description}
              </p>
            </div>
          </div>
        )}

        <Separator className="my-8" />

        {/* Tabs for Comments and Attachments */}
        <Tabs defaultValue="comments" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="comments" className="gap-2">
              <MessageSquare size={14} />
              Comments ({todo.comments?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="attachments" className="gap-2">
              <Paperclip size={14} />
              Attachments ({todo.attachments?.length ?? 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comments">
            <CommentSection todoId={todo.id} />
          </TabsContent>

          <TabsContent value="attachments">
            <AttachmentSection
              todoId={todo.id}
              initialAttachments={todo.attachments ?? []}
            />
          </TabsContent>
        </Tabs>

        {/* Meta info */}
        <Separator className="my-8" />
        <div className="flex flex-wrap gap-6 text-xs text-muted-foreground">
          <div>
            <span className="font-medium">Created:</span>{' '}
            {formatRelativeTime(todo.createdAt)}
          </div>
          <div>
            <span className="font-medium">Updated:</span>{' '}
            {formatRelativeTime(todo.updatedAt)}
          </div>
          {todo.completedAt && (
            <div>
              <span className="font-medium">Completed:</span>{' '}
              {formatRelativeTime(todo.completedAt)}
            </div>
          )}
        </div>
      </main>

      {/* Edit modal */}
      <TodoForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSubmit={handleUpdateTodo}
        todo={todo}
        isLoading={updateTodo.isPending}
      />

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{todo.title}"? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTodo}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
