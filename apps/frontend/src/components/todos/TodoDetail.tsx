import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Separator } from '#/components/ui/separator'
import { ScrollArea } from '#/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { CommentSection, AttachmentSection } from '#/components/todos'
import type { PopulatedTodo } from '@tareas/zod'
import {
  Calendar,
  Flag,
  Tag,
  ExternalLink,
  MessageSquare,
  Paperclip,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type z from 'zod'
import { formatDate } from '#/lib/dayjs'

type Todo = z.infer<typeof PopulatedTodo>

type TodoDetailProps = {
  todo: Todo | null
  isOpen: boolean
  onClose: () => void
}

const priorityVariants: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  low: 'secondary',
  medium: 'outline',
  high: 'destructive',
}

const statusVariants: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  draft: 'outline',
  active: 'default',
  completed: 'secondary',
  archived: 'outline',
}

export default function TodoDetail({ todo, isOpen, onClose }: TodoDetailProps) {
  if (!todo) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 pr-6">
            <DialogTitle className="text-left">{todo.title}</DialogTitle>
            <Link
              to="/todos/$todoId"
              params={{ todoId: todo.id }}
              onClick={onClose}
            >
              <Button variant="ghost" size="icon-sm">
                <ExternalLink size={14} />
              </Button>
            </Link>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6">
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusVariants[todo.status]}>
                {todo.status.charAt(0).toUpperCase() + todo.status.slice(1)}
              </Badge>
              <Badge variant={priorityVariants[todo.priority]}>
                <Flag size={12} className="mr-1" />
                {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
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

            {/* Due date */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar size={16} />
              <span>{formatDate(todo.dueDate)}</span>
            </div>

            {/* Description */}
            {todo.description && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {todo.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Tabs for Comments and Attachments */}
            <Tabs defaultValue="comments" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="comments" className="flex-1 gap-2">
                  <MessageSquare size={14} />
                  Comments ({todo.comments?.length ?? 0})
                </TabsTrigger>
                <TabsTrigger value="attachments" className="flex-1 gap-2">
                  <Paperclip size={14} />
                  Files ({todo.attachments?.length ?? 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="comments" className="mt-4">
                <CommentSection todoId={todo.id} />
              </TabsContent>

              <TabsContent value="attachments" className="mt-4">
                <AttachmentSection
                  todoId={todo.id}
                  initialAttachments={todo.attachments ?? []}
                />
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
